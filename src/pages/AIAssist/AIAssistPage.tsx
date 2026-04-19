import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent
} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
    deleteAIAssistConversation,
    getAIAssistConversation,
    getAIAssistConversations,
    getAIAssistMyStudents,
    getAIAssistRecentStudents,
    postAIAssistFirstMessage,
    postAIAssistMessage,
    updateAIAssistConversation
} from '@/api';
import type {
    AIAssistAssistContext,
    AIAssistConversation,
    AIAssistMessage,
    AIAssistMentionedStudent,
    AIAssistPickerStudent,
    AIAssistQuickSkill,
    AIAssistSkillTrace,
    AIAssistToolCall
} from '@/api/types';

type DraftMode = 'blank' | 'studentPicker' | 'studentReady';

interface DraftConversationState {
    mode: DraftMode;
    student: AIAssistPickerStudent | null;
}

interface ComposerState {
    mentionedStudent: AIAssistMentionedStudent | null;
    requestedSkill: AIAssistQuickSkill | null;
    unknownSkillText: string | null;
}

interface QuickSkillOption {
    id: AIAssistQuickSkill;
    label: string;
    buildPrompt: (student: AIAssistMentionedStudent | null) => string;
}

const quickSkills: QuickSkillOption[] = [
    {
        id: 'summarize_student',
        label: 'Summarize a student',
        buildPrompt: (student) =>
            student
                ? `Summarize ${student.displayName}'s current situation, including active applications, recent progress, and the next actions that need attention.`
                : 'Summarize this student, including active applications, recent progress, and the next actions that need attention.'
    },
    {
        id: 'identify_risk',
        label: 'Find application risks',
        buildPrompt: (student) =>
            student
                ? `Please identify the main risks in ${student.displayName}'s applications and explain what needs attention next.`
                : 'Please identify the main risks in this application set and explain what needs attention next.'
    },
    {
        id: 'review_messages',
        label: 'Check latest messages',
        buildPrompt: (student) =>
            student
                ? `Review ${student.displayName}'s latest messages and point out anything that needs a reply or follow-up.`
                : 'Review the latest messages and point out anything that needs a reply or follow-up.'
    },
    {
        id: 'review_open_tasks',
        label: 'Review open tasks',
        buildPrompt: (student) =>
            student
                ? `Review ${student.displayName}'s open tasks and flag the items that need the most immediate attention.`
                : 'Review the open tasks and flag the items that need the most immediate attention.'
    }
];

const defaultInput = '';
const defaultComposerState: ComposerState = {
    mentionedStudent: null,
    requestedSkill: null,
    unknownSkillText: null
};
const skillTagPattern = /(^|\s)#([a-z_]+)/g;

const formatJson = (value: unknown): string => {
    if (value == null) {
        return '';
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const mergeTrace = (
    previousTrace: AIAssistToolCall[],
    nextTrace: AIAssistToolCall[]
): AIAssistToolCall[] => {
    const mergedTrace = [...previousTrace];
    const knownIds = new Set(previousTrace.map((toolCall) => toolCall.id));

    nextTrace.forEach((toolCall) => {
        if (!knownIds.has(toolCall.id)) {
            mergedTrace.push(toolCall);
            knownIds.add(toolCall.id);
        }
    });

    return mergedTrace;
};

const getNextConversation = (
    activeConversationId: string,
    conversations: AIAssistConversation[]
): AIAssistConversation | null => {
    const activeIndex = conversations.findIndex(
        (conversation) => conversation.id === activeConversationId
    );
    const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== activeConversationId
    );

    if (remainingConversations.length === 0) {
        return null;
    }

    if (activeIndex === -1) {
        return remainingConversations[0];
    }

    return (
        remainingConversations[activeIndex] ??
        remainingConversations[activeIndex - 1] ??
        remainingConversations[0]
    );
};

const formatStudentMeta = (student: AIAssistPickerStudent): string =>
    [
        student.chineseName,
        student.email,
        student.applyingProgramCount != null
            ? `${student.applyingProgramCount} applications`
            : null
    ]
        .filter(Boolean)
        .join(' | ');

const createMentionedStudent = (
    studentId?: string,
    displayName?: string
): AIAssistMentionedStudent | null =>
    studentId && displayName
        ? {
              id: studentId,
              displayName
          }
        : null;

const parseSkillTrace = (value: string): AIAssistSkillTrace => {
    let matchedSkillTag: string | null = null;

    for (const match of value.matchAll(skillTagPattern)) {
        matchedSkillTag = match[2] ?? null;
    }

    if (!matchedSkillTag) {
        return { source: 'auto' };
    }

    const matchedSkill = quickSkills.find(
        (quickSkill) => quickSkill.id === matchedSkillTag
    );

    if (matchedSkill) {
        return {
            source: 'composer_tag',
            requestedSkill: matchedSkill.id
        };
    }

    return {
        source: 'composer_tag',
        unknownSkillText: matchedSkillTag
    };
};

const buildComposerState = ({
    mentionedStudent,
    selectedQuickSkill,
    skillTrace
}: {
    mentionedStudent: AIAssistMentionedStudent | null;
    selectedQuickSkill: AIAssistQuickSkill | null;
    skillTrace: AIAssistSkillTrace;
}): ComposerState => ({
    mentionedStudent,
    requestedSkill:
        skillTrace.requestedSkill ??
        (skillTrace.unknownSkillText ? null : selectedQuickSkill),
    unknownSkillText: skillTrace.unknownSkillText ?? null
});

const renderToolTraceCard = (
    toolCall: AIAssistToolCall,
    key: string
): JSX.Element => (
    <Box
        key={key}
        sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5
        }}
    >
        <Typography fontWeight={700} variant="body2">
            {toolCall.toolName}
        </Typography>
        <Typography color="text.secondary" variant="caption">
            {toolCall.status}
            {toolCall.durationMs != null ? ` | ${toolCall.durationMs}ms` : ''}
        </Typography>
        <Typography
            component="pre"
            sx={{
                mt: 1,
                mb: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.75rem'
            }}
        >
            {formatJson({
                arguments: toolCall.arguments,
                result: toolCall.result,
                error: toolCall.errorMessage
            })}
        </Typography>
    </Box>
);

const AIAssistPage = (): JSX.Element => {
    const skipInitialAutoloadRef = useRef(false);
    const [conversations, setConversations] = useState<AIAssistConversation[]>(
        []
    );
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [draftConversation, setDraftConversation] =
        useState<DraftConversationState | null>(null);
    const [input, setInput] = useState(defaultInput);
    const [selectedQuickSkill, setSelectedQuickSkill] =
        useState<AIAssistQuickSkill | null>(null);
    const [composerState, setComposerState] =
        useState<ComposerState>(defaultComposerState);
    const [messages, setMessages] = useState<AIAssistMessage[]>([]);
    const [trace, setTrace] = useState<AIAssistToolCall[]>([]);
    const [recentStudents, setRecentStudents] = useState<
        AIAssistPickerStudent[]
    >([]);
    const [myStudents, setMyStudents] = useState<AIAssistPickerStudent[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isLoadingStudentPicker, setIsLoadingStudentPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [deletingConversationId, setDeletingConversationId] = useState<
        string | null
    >(null);
    const [editingConversationId, setEditingConversationId] = useState<
        string | null
    >(null);
    const [draftTitle, setDraftTitle] = useState('');
    const [error, setError] = useState<string | null>(null);

    const traceByAssistantMessageId = useMemo(
        () =>
            trace.reduce<Record<string, AIAssistToolCall[]>>(
                (grouped, toolCall) => {
                    if (!toolCall.assistantMessageId) {
                        return grouped;
                    }

                    if (!grouped[toolCall.assistantMessageId]) {
                        grouped[toolCall.assistantMessageId] = [];
                    }

                    grouped[toolCall.assistantMessageId].push(toolCall);
                    return grouped;
                },
                {}
            ),
        [trace]
    );

    const activeConversation = useMemo(
        () =>
            conversationId
                ? (conversations.find(
                      (conversation) => conversation.id === conversationId
                  ) ?? null)
                : null,
        [conversationId, conversations]
    );

    const mentionedStudent = useMemo<AIAssistMentionedStudent | null>(() => {
        if (draftConversation?.student) {
            return createMentionedStudent(
                draftConversation.student.id,
                draftConversation.student.name
            );
        }

        return createMentionedStudent(
            activeConversation?.studentId,
            activeConversation?.studentDisplayName
        );
    }, [activeConversation, draftConversation]);

    const skillTrace = useMemo(() => parseSkillTrace(input), [input]);

    useEffect(() => {
        setComposerState(
            buildComposerState({
                mentionedStudent,
                selectedQuickSkill,
                skillTrace
            })
        );
    }, [mentionedStudent, selectedQuickSkill, skillTrace]);

    const clearActiveWorkspace = useCallback((): void => {
        setConversationId(null);
        setDraftConversation(null);
        setMessages([]);
        setTrace([]);
        setInput(defaultInput);
        setSelectedQuickSkill(null);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
    }, []);

    const loadConversation = useCallback(
        async (nextConversationId: string): Promise<void> => {
            setConversationId(nextConversationId);
            setDraftConversation(null);
            setEditingConversationId(null);
            setDraftTitle('');
            setInput(defaultInput);
            setSelectedQuickSkill(null);
            setComposerState(defaultComposerState);
            setMessages([]);
            setTrace([]);
            setIsLoadingConversation(true);
            setError(null);

            try {
                const response =
                    await getAIAssistConversation(nextConversationId);
                const {
                    conversation,
                    messages: persistedMessages,
                    trace: persistedTrace
                } = response.data;

                setMessages(persistedMessages);
                setTrace(persistedTrace || []);
                setConversations((previous) =>
                    previous.map((item) =>
                        item.id === conversation.id ? conversation : item
                    )
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load AI Assist conversation'
                );
            } finally {
                setIsLoadingConversation(false);
            }
        },
        []
    );

    const loadStudentPickerData = useCallback(async (): Promise<void> => {
        setIsLoadingStudentPicker(true);
        setError(null);

        try {
            const [recentResponse, myResponse] = await Promise.all([
                getAIAssistRecentStudents(),
                getAIAssistMyStudents()
            ]);

            setRecentStudents(recentResponse.data);
            setMyStudents(myResponse.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load AI Assist students'
            );
        } finally {
            setIsLoadingStudentPicker(false);
        }
    }, []);

    useEffect(() => {
        const loadConversations = async (): Promise<void> => {
            setIsLoadingConversations(true);
            setError(null);

            try {
                const response = await getAIAssistConversations();
                setConversations(response.data);

                if (
                    response.data.length > 0 &&
                    !skipInitialAutoloadRef.current
                ) {
                    await loadConversation(response.data[0].id);
                } else if (!skipInitialAutoloadRef.current) {
                    clearActiveWorkspace();
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load AI Assist conversations'
                );
            } finally {
                setIsLoadingConversations(false);
            }
        };

        void loadConversations();
    }, [clearActiveWorkspace, loadConversation]);

    const addConversationToTop = (conversation: AIAssistConversation): void => {
        setConversations((previous) => [
            conversation,
            ...previous.filter((item) => item.id !== conversation.id)
        ]);
    };

    const touchConversation = (activeConversationId: string): void => {
        const updatedAt = new Date().toISOString();
        setConversations((previous) => {
            const activeConversation = previous.find(
                (conversation) => conversation.id === activeConversationId
            );

            if (!activeConversation) {
                return previous;
            }

            return [
                { ...activeConversation, updatedAt },
                ...previous.filter(
                    (conversation) => conversation.id !== activeConversationId
                )
            ];
        });
    };

    const startRename = (conversation: AIAssistConversation): void => {
        setEditingConversationId(conversation.id);
        setDraftTitle(conversation.title);
    };

    const cancelRename = (): void => {
        setEditingConversationId(null);
        setDraftTitle('');
    };

    const saveRename = async (): Promise<void> => {
        const activeEditingId = editingConversationId;
        const nextTitle = draftTitle.trim();

        if (!activeEditingId || isRenaming) {
            return;
        }

        const previousConversation = conversations.find(
            (conversation) => conversation.id === activeEditingId
        );

        if (!nextTitle || previousConversation?.title === nextTitle) {
            cancelRename();
            return;
        }

        setIsRenaming(true);
        setError(null);

        try {
            const response = await updateAIAssistConversation(activeEditingId, {
                title: nextTitle
            });
            const renamedConversation = response.data;

            setConversations((previous) =>
                previous.map((conversation) =>
                    conversation.id === renamedConversation.id
                        ? renamedConversation
                        : conversation
                )
            );
            cancelRename();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to rename AI Assist conversation'
            );
        } finally {
            setIsRenaming(false);
        }
    };

    const handleRenameKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            void saveRename();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            cancelRename();
        }
    };

    const handleNewConversation = (): void => {
        skipInitialAutoloadRef.current = true;
        setError(null);
        clearActiveWorkspace();
    };

    const handleBlankChat = (): void => {
        skipInitialAutoloadRef.current = true;
        setError(null);
        setConversationId(null);
        setMessages([]);
        setTrace([]);
        setInput(defaultInput);
        setSelectedQuickSkill(null);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setDraftConversation({
            mode: 'blank',
            student: null
        });
    };

    const handleChooseStudent = (): void => {
        skipInitialAutoloadRef.current = true;
        setError(null);
        setConversationId(null);
        setMessages([]);
        setTrace([]);
        setInput(defaultInput);
        setSelectedQuickSkill(null);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setDraftConversation((previous) => ({
            mode: 'studentPicker',
            student: previous?.student ?? null
        }));
        void loadStudentPickerData();
    };

    const handleSelectStudent = (student: AIAssistPickerStudent): void => {
        setSelectedQuickSkill(null);
        setComposerState(defaultComposerState);
        setDraftConversation({
            mode: 'studentReady',
            student
        });
    };

    const handleQuickSkillClick = (quickSkill: QuickSkillOption): void => {
        setSelectedQuickSkill((previous) =>
            previous === quickSkill.id ? null : quickSkill.id
        );
        setInput((previous) =>
            previous.trim()
                ? previous
                : quickSkill.buildPrompt(mentionedStudent)
        );
    };

    const buildAssistContext = (): AIAssistAssistContext | undefined => {
        const assistContext: AIAssistAssistContext = {};

        if (composerState.mentionedStudent) {
            assistContext.mentionedStudent = composerState.mentionedStudent;
        }

        if (composerState.requestedSkill) {
            assistContext.requestedSkill = composerState.requestedSkill;
        }

        if (composerState.unknownSkillText) {
            assistContext.unknownSkillText = composerState.unknownSkillText;
        }

        return Object.keys(assistContext).length > 0
            ? assistContext
            : undefined;
    };

    const handleSubmit = async (): Promise<void> => {
        const trimmedInput = input.trim();

        if (!trimmedInput || isSending || isLoadingConversation) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const assistContext = buildAssistContext();

            if (!conversationId) {
                const selectedStudent = draftConversation?.student ?? null;
                const response = await postAIAssistFirstMessage({
                    message: trimmedInput,
                    ...(assistContext ? { assistContext } : {}),
                    ...(selectedStudent
                        ? {
                              studentId: selectedStudent.id,
                              studentDisplayName: selectedStudent.name
                          }
                        : {})
                });
                const {
                    conversation,
                    userMessage,
                    assistantMessage,
                    trace: responseTrace
                } = response.data;

                addConversationToTop(conversation);
                setConversationId(conversation.id);
                setDraftConversation(null);
                setMessages([userMessage, assistantMessage]);
                setTrace(responseTrace || []);
                setInput(defaultInput);
                return;
            }

            const response = await postAIAssistMessage(conversationId, {
                message: trimmedInput,
                ...(assistContext ? { assistContext } : {})
            });
            const {
                userMessage,
                assistantMessage,
                trace: responseTrace
            } = response.data;

            setMessages((previous) => [
                ...previous,
                userMessage,
                assistantMessage
            ]);
            setTrace((previous) => mergeTrace(previous, responseTrace || []));
            setInput(defaultInput);
            touchConversation(conversationId);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to send AI Assist message'
            );
        } finally {
            setIsSending(false);
        }
    };

    const handleComposerKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
        }
    };

    const handleDeleteConversation = async (
        conversation: AIAssistConversation
    ): Promise<void> => {
        if (deletingConversationId || isLoadingConversation) {
            return;
        }

        const nextConversation = getNextConversation(
            conversation.id,
            conversations
        );

        setDeletingConversationId(conversation.id);
        setError(null);

        try {
            await deleteAIAssistConversation(conversation.id);
            setConversations((previous) =>
                previous.filter((item) => item.id !== conversation.id)
            );

            if (editingConversationId === conversation.id) {
                cancelRename();
            }

            if (conversationId === conversation.id) {
                if (nextConversation) {
                    await loadConversation(nextConversation.id);
                } else {
                    clearActiveWorkspace();
                }
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to archive AI Assist conversation'
            );
        } finally {
            setDeletingConversationId(null);
        }
    };

    const renderStudentButtons = (
        students: AIAssistPickerStudent[],
        sectionTestId: string
    ): JSX.Element => (
        <Stack data-testid={sectionTestId} spacing={1}>
            {students.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                    No students available.
                </Typography>
            ) : (
                students.map((student) => {
                    const studentMeta = formatStudentMeta(student);

                    return (
                        <Button
                            aria-label={student.name}
                            key={student.id}
                            fullWidth
                            onClick={() => {
                                handleSelectStudent(student);
                            }}
                            sx={{
                                justifyContent: 'flex-start',
                                px: 1.5,
                                py: 1,
                                textAlign: 'left',
                                textTransform: 'none'
                            }}
                            variant="outlined"
                        >
                            <Stack alignItems="flex-start" spacing={0.25}>
                                <Typography variant="body2">
                                    {student.name}
                                </Typography>
                                {studentMeta ? (
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {studentMeta}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Button>
                    );
                })
            )}
        </Stack>
    );

    const renderQuickSkillChips = (): JSX.Element => (
        <Stack direction="row" flexWrap="wrap" gap={1}>
            {quickSkills.map((quickSkill) => {
                const isSelected =
                    composerState.requestedSkill === quickSkill.id;

                return (
                    <Chip
                        clickable
                        color={isSelected ? 'primary' : 'default'}
                        key={quickSkill.id}
                        label={quickSkill.label}
                        onClick={() => {
                            handleQuickSkillClick(quickSkill);
                        }}
                        variant={isSelected ? 'filled' : 'outlined'}
                    />
                );
            })}
        </Stack>
    );

    const renderDraftState = (): JSX.Element => {
        if (draftConversation?.mode === 'studentPicker') {
            return (
                <Stack spacing={2}>
                    <Typography variant="subtitle1">
                        Choose a student
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Start from a recent student or someone already assigned
                        to you.
                    </Typography>
                    {isLoadingStudentPicker ? (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                            sx={{ minHeight: 160 }}
                        >
                            <CircularProgress size={24} />
                            <Typography color="text.secondary" variant="body2">
                                Loading students...
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack divider={<Divider flexItem />} spacing={2}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                    Recent students
                                </Typography>
                                {renderStudentButtons(
                                    recentStudents,
                                    'ai-assist-student-section-recent'
                                )}
                            </Stack>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                    My students
                                </Typography>
                                {renderStudentButtons(
                                    myStudents,
                                    'ai-assist-student-section-mine'
                                )}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            );
        }

        if (
            draftConversation?.mode === 'studentReady' &&
            draftConversation.student
        ) {
            const studentMeta = formatStudentMeta(draftConversation.student);

            return (
                <Stack spacing={1.5}>
                    <Typography variant="subtitle1">
                        Start with {draftConversation.student.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Pick a quick start or edit the message before sending.
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Chip
                            color="primary"
                            label={draftConversation.student.name}
                            variant="outlined"
                        />
                        <Button
                            onClick={handleChooseStudent}
                            size="small"
                            variant="text"
                        >
                            Change student
                        </Button>
                    </Stack>
                    {studentMeta ? (
                        <Typography color="text.secondary" variant="caption">
                            {studentMeta}
                        </Typography>
                    ) : null}
                </Stack>
            );
        }

        if (draftConversation?.mode === 'blank') {
            return (
                <Stack spacing={1.5}>
                    <Typography variant="subtitle1">Blank chat</Typography>
                    <Typography color="text.secondary" variant="body2">
                        Draft the first message locally, then send when it is
                        ready.
                    </Typography>
                </Stack>
            );
        }

        return (
            <Stack spacing={2}>
                <Typography variant="subtitle1">
                    Start with a question
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    Start a blank draft or choose a student before sending the
                    first message.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    <Button onClick={handleChooseStudent} variant="contained">
                        Choose student
                    </Button>
                    <Button onClick={handleBlankChat} variant="outlined">
                        Blank chat
                    </Button>
                </Stack>
            </Stack>
        );
    };

    return (
        <Box
            data-testid="ai-assist-page"
            sx={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                height: {
                    xs: 'calc(100vh - 112px)',
                    md: 'calc(100vh - 112px)'
                },
                minHeight: 0,
                overflow: 'hidden',
                width: '100%'
            }}
        >
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                <Box
                    data-testid="ai-assist-workspace"
                    sx={{
                        display: 'grid',
                        flex: 1,
                        gap: 2,
                        gridTemplateColumns: {
                            xs: 'minmax(0, 1fr)',
                            md: 'minmax(0, 1fr) minmax(320px, 380px)'
                        },
                        height: '100%',
                        minHeight: 0,
                        overflow: 'hidden',
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            height: '100%',
                            minHeight: 0,
                            minWidth: 0
                        }}
                    >
                        <Paper
                            data-testid="ai-assist-chat-panel"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: {
                                    xs: 'calc(100vh - 56px)',
                                    sm: 'calc(100vh - 64px)',
                                    md: '100%'
                                },
                                minHeight: 420,
                                overflow: 'hidden',
                                p: 0,
                                width: '100%'
                            }}
                            variant="outlined"
                        >
                            <Box
                                data-testid="ai-assist-transcript"
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    p: 2
                                }}
                            >
                                {isLoadingConversation ? (
                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        spacing={1}
                                        sx={{ minHeight: 160 }}
                                    >
                                        <CircularProgress size={24} />
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            Loading conversation...
                                        </Typography>
                                    </Stack>
                                ) : messages.length === 0 ? (
                                    renderDraftState()
                                ) : (
                                    <Stack spacing={1.5}>
                                        {messages.map((message) => {
                                            const assistantTrace =
                                                message.role === 'assistant'
                                                    ? traceByAssistantMessageId[
                                                          message.id
                                                      ] || []
                                                    : [];

                                            return (
                                                <Paper
                                                    key={message.id}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            message.role ===
                                                            'assistant'
                                                                ? 'background.paper'
                                                                : 'action.hover'
                                                    }}
                                                    variant="outlined"
                                                >
                                                    <Typography
                                                        color="text.secondary"
                                                        fontWeight={700}
                                                        gutterBottom
                                                        variant="caption"
                                                    >
                                                        {message.role ===
                                                        'assistant'
                                                            ? 'Assistant'
                                                            : 'You'}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            whiteSpace:
                                                                'pre-wrap'
                                                        }}
                                                        variant="body2"
                                                    >
                                                        {message.content}
                                                    </Typography>
                                                    {assistantTrace.length >
                                                    0 ? (
                                                        <Stack
                                                            spacing={1}
                                                            sx={{ mt: 1.5 }}
                                                        >
                                                            <Typography
                                                                fontWeight={700}
                                                                variant="caption"
                                                            >
                                                                Tools used (
                                                                {
                                                                    assistantTrace.length
                                                                }
                                                                )
                                                            </Typography>
                                                            {assistantTrace.map(
                                                                (toolCall) =>
                                                                    renderToolTraceCard(
                                                                        toolCall,
                                                                        `${message.id}-${toolCall.id}`
                                                                    )
                                                            )}
                                                        </Stack>
                                                    ) : null}
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>

                            <Box
                                data-testid="ai-assist-composer"
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderColor: 'divider',
                                    borderTop: 1,
                                    flexShrink: 0,
                                    p: 2
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Stack spacing={1}>
                                        {composerState.mentionedStudent ? (
                                            <Stack
                                                direction="row"
                                                flexWrap="wrap"
                                                gap={1}
                                            >
                                                <Chip
                                                    color="primary"
                                                    label={
                                                        composerState
                                                            .mentionedStudent
                                                            .displayName
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        ) : null}
                                        {renderQuickSkillChips()}
                                        {composerState.unknownSkillText ? (
                                            <Typography
                                                color="text.secondary"
                                                variant="caption"
                                            >
                                                Unknown skill, using auto mode
                                            </Typography>
                                        ) : null}
                                    </Stack>
                                    <TextField
                                        disabled={
                                            isSending || isLoadingConversation
                                        }
                                        fullWidth
                                        label="Ask TaiGer AI"
                                        minRows={3}
                                        multiline
                                        onChange={(event) => {
                                            setInput(event.target.value);
                                        }}
                                        onKeyDown={handleComposerKeyDown}
                                        value={input}
                                    />
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-end"
                                    >
                                        <Button
                                            disabled={
                                                isSending ||
                                                isLoadingConversation ||
                                                !input.trim()
                                            }
                                            endIcon={
                                                isSending ? (
                                                    <CircularProgress
                                                        size={16}
                                                    />
                                                ) : (
                                                    <SendIcon />
                                                )
                                            }
                                            onClick={() => {
                                                void handleSubmit();
                                            }}
                                            variant="contained"
                                        >
                                            Ask
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Paper>
                    </Box>
                    <Box
                        data-testid="ai-assist-side-rail"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            height: '100%',
                            maxHeight: '100%',
                            minHeight: 0,
                            minWidth: 0,
                            overflowY: 'auto'
                        }}
                    >
                        <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                                spacing={1}
                                sx={{ mb: 1.5 }}
                            >
                                <Typography variant="h6">
                                    Conversations
                                </Typography>
                                <Button
                                    disabled={
                                        isSending || isLoadingConversation
                                    }
                                    onClick={handleNewConversation}
                                    size="small"
                                    variant="outlined"
                                >
                                    New conversation
                                </Button>
                            </Stack>
                            {isLoadingConversations ? (
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <CircularProgress size={16} />
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Loading conversations...
                                    </Typography>
                                </Stack>
                            ) : conversations.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    No conversations yet.
                                </Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {conversations.map((conversation) => {
                                        const isActive =
                                            conversation.id === conversationId;
                                        const isEditing =
                                            conversation.id ===
                                            editingConversationId;
                                        const isDeleting =
                                            deletingConversationId ===
                                            conversation.id;

                                        return (
                                            <Stack
                                                key={conversation.id}
                                                alignItems="center"
                                                direction="row"
                                                spacing={0.75}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <TextField
                                                            autoFocus
                                                            disabled={
                                                                isRenaming
                                                            }
                                                            fullWidth
                                                            label="Conversation title"
                                                            onBlur={() => {
                                                                void saveRename();
                                                            }}
                                                            onChange={(
                                                                event
                                                            ) => {
                                                                setDraftTitle(
                                                                    event.target
                                                                        .value
                                                                );
                                                            }}
                                                            onKeyDown={
                                                                handleRenameKeyDown
                                                            }
                                                            size="small"
                                                            value={draftTitle}
                                                        />
                                                        <IconButton
                                                            aria-label="Cancel rename"
                                                            disabled={
                                                                isRenaming
                                                            }
                                                            onClick={
                                                                cancelRename
                                                            }
                                                            onMouseDown={(
                                                                event
                                                            ) => {
                                                                event.preventDefault();
                                                            }}
                                                            size="small"
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            aria-pressed={
                                                                isActive
                                                            }
                                                            disabled={
                                                                isLoadingConversation
                                                            }
                                                            fullWidth
                                                            onClick={() => {
                                                                if (!isActive) {
                                                                    void loadConversation(
                                                                        conversation.id
                                                                    );
                                                                }
                                                            }}
                                                            sx={{
                                                                justifyContent:
                                                                    'flex-start',
                                                                overflow:
                                                                    'hidden',
                                                                textAlign:
                                                                    'left',
                                                                textTransform:
                                                                    'none'
                                                            }}
                                                            variant={
                                                                isActive
                                                                    ? 'contained'
                                                                    : 'outlined'
                                                            }
                                                        >
                                                            {conversation.title}
                                                        </Button>
                                                        <IconButton
                                                            aria-label={`Rename ${conversation.title}`}
                                                            disabled={
                                                                isLoadingConversation ||
                                                                isRenaming ||
                                                                isDeleting
                                                            }
                                                            onClick={() => {
                                                                startRename(
                                                                    conversation
                                                                );
                                                            }}
                                                            size="small"
                                                        >
                                                            <EditOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label={`Delete ${conversation.title}`}
                                                            disabled={
                                                                isLoadingConversation ||
                                                                isDeleting
                                                            }
                                                            onClick={() => {
                                                                void handleDeleteConversation(
                                                                    conversation
                                                                );
                                                            }}
                                                            size="small"
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Paper>
                        <Paper sx={{ p: 2 }} variant="outlined">
                            <Typography gutterBottom variant="h6">
                                Tool trace
                            </Typography>
                            {trace.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Tool calls will appear here after an answer.
                                </Typography>
                            ) : (
                                <Stack spacing={1.5}>
                                    {trace.map((toolCall) =>
                                        renderToolTraceCard(
                                            toolCall,
                                            `side-rail-${toolCall.id}`
                                        )
                                    )}
                                </Stack>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default AIAssistPage;
