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
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

import {
    deleteAIAssistConversation,
    getAIAssistConversation,
    getAIAssistConversations,
    getAIAssistRecentStudents,
    getAIAssistMyStudents,
    streamAIAssistFirstMessage,
    streamAIAssistMessage,
    searchAIAssistStudents,
    updateAIAssistConversation
} from '@/api';
import type {
    AIAssistAssistContext,
    AIAssistConversation,
    AIAssistMessage,
    AIAssistMessageLinkHint,
    AIAssistMentionedStudent,
    AIAssistPickerStudent,
    AIAssistQuickSkill,
    AIAssistStreamProgressEvent,
    AIAssistToolCall
} from '@/api/types';
import { PortfolioView } from './PortfolioView';
import { StudentAnalysisView } from './StudentAnalysisView';
import type { PortfolioStudent } from './StudentHealthCard';
import { MessageContent, SourcesSummary } from './components/MessageContent';
import { StudentPicker } from './components/StudentPicker';
import { SkillBar } from './components/SkillBar';
import {
    getNextConversation,
    KNOWN_SKILLS,
    mergeTrace,
    resolveCurrentProgressStatus,
    withResponseSkillTrace
} from './utils/conversationUtils';
import {
    createMentionedStudent,
    escapeRegExp,
    getStudentChineseName,
    getTokenQueryAtCursor,
    matchesStudentMentionQuery,
    renderMentionHighlightedText,
    replaceTokenAtCursor
} from './utils/mentionUtils';

type WorkbenchMode = 'portfolio' | 'student' | 'chat';
interface ComposerState {
    mentionedStudent: AIAssistMentionedStudent | null;
}

const defaultInput = '';
const defaultComposerState: ComposerState = {
    mentionedStudent: null
};
const minimumStudentSearchLength = 2;
const minimumStreamStatusDisplayMs = 450;

const buildComposerState = ({
    mentionedStudent
}: {
    mentionedStudent: AIAssistMentionedStudent | null;
}): ComposerState => ({
    mentionedStudent
});

const AIAssistPage = (): JSX.Element => {
    const { t, i18n } = useTranslation();
    const translate = useCallback(
        (
            key: string,
            defaultValue: string,
            options?: Record<string, unknown>
        ): string => {
            const translated = t(key, {
                ...options,
                defaultValue
            });

            return translated === key ? defaultValue : translated;
        },
        [t]
    );
    const [workbenchMode, setWorkbenchMode] =
        useState<WorkbenchMode>('portfolio');
    const [analysisStudent, setAnalysisStudent] =
        useState<PortfolioStudent | null>(null);
    // Session cache of student deep-dive analyses (studentId -> result). Lets the
    // user navigate back and forth between the portfolio and a student without
    // re-running an expensive multi-tool analysis on every visit. Persists for
    // the lifetime of this page; a "Re-analyze" control forces a fresh run.
    const analysisCacheRef = useRef<
        Map<string, { text: string; conversationId: string; ranAt: number }>
    >(new Map());

    const skipInitialAutoloadRef = useRef(false);
    const composerInputRef = useRef<
        HTMLTextAreaElement | HTMLInputElement | null
    >(null);
    const composerHighlightRef = useRef<HTMLDivElement | null>(null);
    const mentionSuggestionListRef = useRef<HTMLUListElement | null>(null);
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [conversations, setConversations] = useState<AIAssistConversation[]>(
        []
    );
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [input, setInput] = useState(defaultInput);
    const [selectedMentionedStudent, setSelectedMentionedStudent] =
        useState<AIAssistMentionedStudent | null>(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [composerState, setComposerState] =
        useState<ComposerState>(defaultComposerState);
    const [mentionSuggestions, setMentionSuggestions] = useState<
        AIAssistPickerStudent[]
    >([]);
    const [isLoadingMentionSuggestions, setIsLoadingMentionSuggestions] =
        useState(false);
    const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0);
    const [messages, setMessages] = useState<AIAssistMessage[]>([]);
    const [trace, setTrace] = useState<AIAssistToolCall[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [streamedAssistantContent, setStreamedAssistantContent] =
        useState('');
    const [streamedAssistantReferences, setStreamedAssistantReferences] =
        useState<Record<string, AIAssistMessageLinkHint>>({});
    const [currentStreamStatus, setCurrentStreamStatus] = useState<
        string | null
    >(null);
    const [thinkingDotCount, setThinkingDotCount] = useState(1);
    const currentStreamStatusRef = useRef<string | null>(null);
    const streamStatusSinceRef = useRef(0);
    const pendingStreamStatusRef = useRef<string | null>(null);
    const streamStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const [showGoToBottom, setShowGoToBottom] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [deletingConversationId, setDeletingConversationId] = useState<
        string | null
    >(null);
    const [editingConversationId, setEditingConversationId] = useState<
        string | null
    >(null);
    const [draftTitle, setDraftTitle] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedRequestedSkill, setSelectedRequestedSkill] =
        useState<AIAssistQuickSkill | null>(null);
    const [pickerMode, setPickerMode] = useState(false);
    const [recentStudents, setRecentStudents] = useState<
        AIAssistPickerStudent[]
    >([]);
    const [myStudents, setMyStudents] = useState<AIAssistPickerStudent[]>([]);
    const [isLoadingPickerStudents, setIsLoadingPickerStudents] =
        useState(false);
    const preferredLanguage = i18n.language || 'en';

    const syncCursorPosition = useCallback(
        (fallbackValue: string = input): void => {
            const inputElement = composerInputRef.current;

            setCursorPosition(
                typeof inputElement?.selectionStart === 'number'
                    ? inputElement.selectionStart
                    : fallbackValue.length
            );
        },
        [input]
    );

    const syncComposerHighlightScroll = useCallback((): void => {
        const inputElement = composerInputRef.current;
        const highlightElement = composerHighlightRef.current;

        if (!inputElement || !highlightElement) {
            return;
        }

        highlightElement.scrollTop = inputElement.scrollTop;
        highlightElement.scrollLeft = inputElement.scrollLeft;
    }, []);

    const scrollTranscriptToBottom = useCallback((): void => {
        const transcriptElement = transcriptRef.current;
        if (!transcriptElement) {
            return;
        }

        if (typeof transcriptElement.scrollTo === 'function') {
            transcriptElement.scrollTo({
                top: transcriptElement.scrollHeight,
                behavior: 'auto'
            });
        } else {
            transcriptElement.scrollTop = transcriptElement.scrollHeight;
        }
        setShowGoToBottom(false);
    }, []);

    const handleTranscriptScroll = useCallback((): void => {
        const transcriptElement = transcriptRef.current;
        if (!transcriptElement) {
            return;
        }

        const distanceFromBottom =
            transcriptElement.scrollHeight -
            transcriptElement.scrollTop -
            transcriptElement.clientHeight;
        setShowGoToBottom(distanceFromBottom > 80);
    }, []);

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

    const baseMentionedStudent = useMemo<AIAssistMentionedStudent | null>(
        () =>
            createMentionedStudent(
                activeConversation?.studentId,
                activeConversation?.studentDisplayName
            ),
        [activeConversation]
    );

    const activeMentionQuery = useMemo(
        () => getTokenQueryAtCursor(input, cursorPosition, '@'),
        [cursorPosition, input]
    );
    const hasExplicitUnresolvedMention = Boolean(activeMentionQuery);

    const activeSkillQuery = useMemo(
        () => getTokenQueryAtCursor(input, cursorPosition, '#'),
        [cursorPosition, input]
    );

    const skillSuggestions = useMemo(() => {
        if (!activeSkillQuery || selectedRequestedSkill) {
            return [];
        }
        const q = activeSkillQuery.toLowerCase();
        return KNOWN_SKILLS.filter((s) => s.id.includes(q));
    }, [activeSkillQuery, selectedRequestedSkill]);

    const isUnknownSkillHint = useMemo(() => {
        if (activeSkillQuery !== null || selectedRequestedSkill) {
            return false;
        }
        const match = input.match(/#([a-z_]+)/);
        if (!match) {
            return false;
        }
        return !KNOWN_SKILLS.some((s) => s.id === match[1]);
    }, [activeSkillQuery, input, selectedRequestedSkill]);
    const mentionedStudent = useMemo<AIAssistMentionedStudent | null>(
        () =>
            hasExplicitUnresolvedMention
                ? null
                : (selectedMentionedStudent ?? baseMentionedStudent),
        [
            baseMentionedStudent,
            hasExplicitUnresolvedMention,
            selectedMentionedStudent
        ]
    );

    useEffect(() => {
        setHighlightedMentionIndex(0);
    }, [mentionSuggestions]);

    useEffect(() => {
        if (
            isLoadingMentionSuggestions ||
            mentionSuggestions.length === 0 ||
            highlightedMentionIndex < 0
        ) {
            return;
        }

        const listElement = mentionSuggestionListRef.current;
        if (!listElement) {
            return;
        }

        const targetItem = listElement.querySelector<HTMLElement>(
            `[data-mention-index="${highlightedMentionIndex}"]`
        );
        targetItem?.scrollIntoView?.({
            block: 'nearest'
        });
    }, [
        highlightedMentionIndex,
        isLoadingMentionSuggestions,
        mentionSuggestions.length
    ]);

    useEffect(() => {
        syncComposerHighlightScroll();
    }, [input, selectedMentionedStudent, syncComposerHighlightScroll]);

    useEffect(() => {
        if (!selectedMentionedStudent) {
            return;
        }

        const mentionPattern = new RegExp(
            `(^|\\s)@${escapeRegExp(selectedMentionedStudent.displayName)}(?=\\s|$)`,
            'i'
        );

        if (!mentionPattern.test(input)) {
            setSelectedMentionedStudent(null);
        }
    }, [input, selectedMentionedStudent]);

    useEffect(() => {
        setComposerState(buildComposerState({ mentionedStudent }));
    }, [mentionedStudent]);

    useEffect(() => {
        currentStreamStatusRef.current = currentStreamStatus;
    }, [currentStreamStatus]);

    useEffect(() => {
        return () => {
            if (streamStatusTimeoutRef.current) {
                clearTimeout(streamStatusTimeoutRef.current);
                streamStatusTimeoutRef.current = null;
            }
        };
    }, []);

    const clearPendingStreamStatus = useCallback(() => {
        if (streamStatusTimeoutRef.current) {
            clearTimeout(streamStatusTimeoutRef.current);
            streamStatusTimeoutRef.current = null;
        }
        pendingStreamStatusRef.current = null;
    }, []);

    const setStreamStatusWithMinDuration = useCallback(
        (nextStatus: string | null, forceImmediate = false): void => {
            const currentStatus = currentStreamStatusRef.current;
            if (currentStatus === nextStatus) {
                return;
            }

            if (forceImmediate || nextStatus == null || currentStatus == null) {
                clearPendingStreamStatus();
                setCurrentStreamStatus(nextStatus);
                streamStatusSinceRef.current = Date.now();
                return;
            }

            const elapsed = Date.now() - streamStatusSinceRef.current;
            const remaining = minimumStreamStatusDisplayMs - elapsed;

            if (remaining <= 0) {
                clearPendingStreamStatus();
                setCurrentStreamStatus(nextStatus);
                streamStatusSinceRef.current = Date.now();
                return;
            }

            pendingStreamStatusRef.current = nextStatus;
            if (streamStatusTimeoutRef.current) {
                clearTimeout(streamStatusTimeoutRef.current);
            }
            streamStatusTimeoutRef.current = setTimeout(() => {
                streamStatusTimeoutRef.current = null;
                const pendingStatus = pendingStreamStatusRef.current;
                pendingStreamStatusRef.current = null;
                setCurrentStreamStatus(pendingStatus);
                streamStatusSinceRef.current = Date.now();
            }, remaining);
        },
        [clearPendingStreamStatus]
    );

    useEffect(() => {
        if (!(isSending && currentStreamStatus === 'Thinking...')) {
            return;
        }

        setThinkingDotCount(1);
        const intervalId = window.setInterval(() => {
            setThinkingDotCount((previous) =>
                previous >= 3 ? 1 : previous + 1
            );
        }, 350);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [currentStreamStatus, isSending]);

    useEffect(() => {
        if (
            !activeMentionQuery ||
            activeMentionQuery.length < minimumStudentSearchLength
        ) {
            setMentionSuggestions([]);
            setIsLoadingMentionSuggestions(false);
            return;
        }

        let ignore = false;
        setIsLoadingMentionSuggestions(true);

        void searchAIAssistStudents(activeMentionQuery)
            .then((response) => {
                if (!ignore) {
                    const suggestions = (response.data || []).filter(
                        (student) =>
                            matchesStudentMentionQuery(
                                student,
                                activeMentionQuery
                            )
                    );
                    setMentionSuggestions(suggestions);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setMentionSuggestions([]);
                }
            })
            .finally(() => {
                if (!ignore) {
                    setIsLoadingMentionSuggestions(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [activeMentionQuery]);

    const clearActiveWorkspace = useCallback((): void => {
        setConversationId(null);
        setMessages([]);
        setTrace([]);
        setInput(defaultInput);
        setSelectedMentionedStudent(null);
        setMentionSuggestions([]);
        setIsLoadingMentionSuggestions(false);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setCursorPosition(0);
        setPickerMode(false);
        setSelectedRequestedSkill(null);
    }, []);

    const loadConversation = useCallback(
        async (nextConversationId: string): Promise<void> => {
            setConversationId(nextConversationId);
            setEditingConversationId(null);
            setDraftTitle('');
            setInput(defaultInput);

            setSelectedMentionedStudent(null);
            setMentionSuggestions([]);
            setIsLoadingMentionSuggestions(false);
            setComposerState(defaultComposerState);
            setMessages([]);
            setTrace([]);
            setCursorPosition(0);
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
                        : translate(
                              'aiAssist.errorLoadConversation',
                              'Failed to load AI Assist conversation'
                          )
                );
            } finally {
                setIsLoadingConversation(false);
            }
        },
        []
    );

    useEffect(() => {
        const loadConversations = async (): Promise<void> => {
            setIsLoadingConversations(true);
            setError(null);

            try {
                const response = await getAIAssistConversations();
                setConversations(response.data);

                // Land on the overview home by default (not the most recent
                // conversation) so the cross-portfolio overview is the first
                // thing staff see. Past conversations remain in the sidebar.
                if (!skipInitialAutoloadRef.current) {
                    clearActiveWorkspace();
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : translate(
                              'aiAssist.errorLoadConversations',
                              'Failed to load AI Assist conversations'
                          )
                );
            } finally {
                setIsLoadingConversations(false);
            }
        };

        void loadConversations();
    }, [clearActiveWorkspace, loadConversation]);

    useEffect(() => {
        if (isLoadingConversation) {
            return;
        }

        scrollTranscriptToBottom();
    }, [
        conversationId,
        isLoadingConversation,
        messages,
        scrollTranscriptToBottom
    ]);

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
                    : translate(
                          'aiAssist.errorRenameConversation',
                          'Failed to rename AI Assist conversation'
                      )
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

    const handleSeedPrompt = (prompt: string): void => {
        skipInitialAutoloadRef.current = true;
        setError(null);
        clearActiveWorkspace();
        setInput(prompt);
        setWorkbenchMode('chat');
    };

    const handleMentionSuggestionClick = (
        student: AIAssistPickerStudent
    ): void => {
        const replaced = replaceTokenAtCursor({
            value: input,
            cursorIndex:
                composerInputRef.current?.selectionStart ?? cursorPosition,
            trigger: '@',
            replacement: `@${student.name} `
        });

        setSelectedMentionedStudent({
            id: student.id,
            displayName: student.name
        });
        setMentionSuggestions([]);
        setInput(replaced.nextValue);
        setCursorPosition(replaced.nextCursorIndex);
    };

    const buildAssistContext = (
        requestedSkill: AIAssistQuickSkill | null = selectedRequestedSkill
    ): AIAssistAssistContext | undefined => {
        const assistContext: AIAssistAssistContext = {};

        if (composerState.mentionedStudent) {
            assistContext.mentionedStudent = composerState.mentionedStudent;
        }

        if (requestedSkill) {
            assistContext.requestedSkill = requestedSkill;
        }

        return Object.keys(assistContext).length > 0
            ? assistContext
            : undefined;
    };

    const buildSubmissionMessage = (
        trimmedInput: string,
        assistContext?: AIAssistAssistContext
    ): string => {
        if (trimmedInput) {
            return trimmedInput;
        }

        const tokens: string[] = [];
        if (assistContext?.mentionedStudent?.displayName) {
            tokens.push(`@${assistContext.mentionedStudent.displayName}`);
        }
        return tokens.join(' ').trim();
    };

    const handleSubmit = useCallback(async (): Promise<void> => {
        const trimmedInput = input.trim();
        const assistContext = buildAssistContext(selectedRequestedSkill);
        const submissionMessage = buildSubmissionMessage(
            trimmedInput,
            assistContext
        );

        if (!submissionMessage || isSending || isLoadingConversation) {
            return;
        }

        setIsSending(true);
        setError(null);
        setStreamedAssistantContent('');
        setStreamedAssistantReferences({});
        setStreamStatusWithMinDuration(null, true);
        scrollTranscriptToBottom();

        let hasStreamError = false;

        try {
            const onProgress = (event: AIAssistStreamProgressEvent): void => {
                const status = resolveCurrentProgressStatus(event);
                setStreamStatusWithMinDuration(status);
            };
            const onToken = (text: string): void => {
                if (!text) {
                    return;
                }

                setStreamedAssistantContent((previous) => previous + text);
                scrollTranscriptToBottom();
            };
            const onError = (message: string): void => {
                void message;
                hasStreamError = true;
                setError(
                    translate(
                        'aiAssist.errorGeneric',
                        'AI Assist is temporarily unavailable. Please try again.'
                    )
                );
                setStreamedAssistantContent('');
                setStreamedAssistantReferences({});
                setStreamStatusWithMinDuration(null, true);
            };

            if (!conversationId) {
                const response = await streamAIAssistFirstMessage(
                    {
                        message: submissionMessage,
                        preferredLanguage,
                        ...(assistContext ? { assistContext } : {})
                    },
                    {
                        onProgress,
                        onToken,
                        onError
                    }
                );
                if (!response?.data) {
                    throw new Error(
                        'AI Assist did not return a streamed response'
                    );
                }
                const {
                    conversation,
                    userMessage,
                    assistantMessage,
                    trace: responseTrace,
                    skillTrace: responseSkillTrace
                } = response.data;

                addConversationToTop(conversation);
                setConversationId(conversation.id);
                setMessages([
                    userMessage,
                    withResponseSkillTrace(assistantMessage, responseSkillTrace)
                ]);
                setTrace(responseTrace || []);
                setInput(defaultInput);
                setSelectedRequestedSkill(null);

                setStreamedAssistantContent('');
                setStreamedAssistantReferences({});
                setStreamStatusWithMinDuration(null);
                return;
            }

            const response = await streamAIAssistMessage(
                conversationId,
                {
                    message: submissionMessage,
                    preferredLanguage,
                    ...(assistContext ? { assistContext } : {})
                },
                {
                    onProgress,
                    onToken,
                    onError
                }
            );
            if (!response?.data) {
                throw new Error('AI Assist did not return a streamed response');
            }
            const {
                userMessage,
                assistantMessage,
                trace: responseTrace,
                skillTrace: responseSkillTrace
            } = response.data;
            const activeStudent = responseSkillTrace?.student;

            setMessages((previous) => [
                ...previous,
                userMessage,
                withResponseSkillTrace(assistantMessage, responseSkillTrace)
            ]);
            setTrace((previous) => mergeTrace(previous, responseTrace || []));
            if (activeStudent?.id) {
                setConversations((previous) =>
                    previous.map((conversation) =>
                        conversation.id === conversationId
                            ? {
                                  ...conversation,
                                  studentId: activeStudent.id,
                                  studentDisplayName:
                                      activeStudent.displayName ||
                                      conversation.studentDisplayName
                              }
                            : conversation
                    )
                );
            }
            setInput(defaultInput);
            setSelectedRequestedSkill(null);

            touchConversation(conversationId);
            setStreamedAssistantContent('');
            setStreamedAssistantReferences({});
            setStreamStatusWithMinDuration(null);
        } catch (err) {
            void err;
            hasStreamError = true;
            setError(
                translate(
                    'aiAssist.errorGeneric',
                    'AI Assist is temporarily unavailable. Please try again.'
                )
            );
            setStreamedAssistantContent('');
            setStreamedAssistantReferences({});
            setStreamStatusWithMinDuration(null, true);
        } finally {
            setIsSending(false);
            setStreamedAssistantContent('');
            setStreamedAssistantReferences({});
            if (hasStreamError) {
                setStreamStatusWithMinDuration(null, true);
            }
        }
    }, [
        addConversationToTop,
        composerState,
        conversationId,
        input,
        isLoadingConversation,
        isSending,
        preferredLanguage,
        scrollTranscriptToBottom,
        selectedRequestedSkill,
        setStreamStatusWithMinDuration,
        touchConversation
    ]);

    const handleComposerKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ): void => {
        if (mentionSuggestions.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlightedMentionIndex((previous) =>
                    Math.min(previous + 1, mentionSuggestions.length - 1)
                );
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedMentionIndex((previous) =>
                    Math.max(previous - 1, 0)
                );
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setMentionSuggestions([]);
                return;
            }

            if (event.key === 'Enter' && !event.altKey) {
                event.preventDefault();
                const student = mentionSuggestions[highlightedMentionIndex];
                if (student) {
                    handleMentionSuggestionClick(student);
                }
                return;
            }
        }

        if (event.key === 'Enter' && event.altKey) {
            event.preventDefault();
            const inputElement = composerInputRef.current;
            const selectionStart =
                typeof inputElement?.selectionStart === 'number'
                    ? inputElement.selectionStart
                    : input.length;
            const selectionEnd =
                typeof inputElement?.selectionEnd === 'number'
                    ? inputElement.selectionEnd
                    : selectionStart;
            const nextValue =
                input.slice(0, selectionStart) +
                '\n' +
                input.slice(selectionEnd);

            setInput(nextValue);
            const nextCursorPosition = selectionStart + 1;
            setCursorPosition(nextCursorPosition);
            window.requestAnimationFrame(() => {
                const targetInput = composerInputRef.current;
                if (!targetInput) {
                    return;
                }

                targetInput.setSelectionRange(
                    nextCursorPosition,
                    nextCursorPosition
                );
                syncComposerHighlightScroll();
            });
            return;
        }

        if (event.key === 'Enter' && !event.altKey) {
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
                    : translate(
                          'aiAssist.errorArchiveConversation',
                          'Failed to archive AI Assist conversation'
                      )
            );
        } finally {
            setDeletingConversationId(null);
        }
    };

    const handleChooseStudent = async (): Promise<void> => {
        setPickerMode(true);
        setIsLoadingPickerStudents(true);
        try {
            const [recentRes, myRes] = await Promise.all([
                getAIAssistRecentStudents(),
                getAIAssistMyStudents()
            ]);
            setRecentStudents(recentRes.data || []);
            setMyStudents(myRes.data || []);
        } catch {
            setRecentStudents([]);
            setMyStudents([]);
        } finally {
            setIsLoadingPickerStudents(false);
        }
    };

    const handlePickStudent = (student: AIAssistPickerStudent): void => {
        const mention = `@${student.name} `;
        setSelectedMentionedStudent({
            id: student.id,
            displayName: student.name
        });
        setInput(mention);
        setCursorPosition(mention.length);
        setPickerMode(false);
    };

    const handleSkillClick = (skillId: string): void => {
        setSelectedRequestedSkill(skillId as AIAssistQuickSkill);
    };

    const handleSkillSuggestionClick = (skill: {
        id: string;
        label: string;
    }): void => {
        const currentCursorIndex =
            composerInputRef.current?.selectionStart ?? cursorPosition;
        const replaced = replaceTokenAtCursor({
            value: input,
            cursorIndex: currentCursorIndex,
            trigger: '#',
            replacement: `#${skill.id}`
        });
        setSelectedRequestedSkill(skill.id as AIAssistQuickSkill);
        setInput(replaced.nextValue);
        setCursorPosition(replaced.nextCursorIndex);
        window.requestAnimationFrame(() => {
            const targetInput = composerInputRef.current;
            if (!targetInput) {
                return;
            }
            targetInput.setSelectionRange(
                replaced.nextCursorIndex,
                replaced.nextCursorIndex
            );
        });
    };

    const renderComposerSuggestions = (): JSX.Element | null => {
        const hasMentionSuggestions =
            mentionSuggestions.length > 0 || isLoadingMentionSuggestions;
        const hasSkillSuggestions = skillSuggestions.length > 0;

        if (!hasMentionSuggestions && !hasSkillSuggestions) {
            return null;
        }

        return (
            <Paper
                sx={{
                    borderRadius: 1.5,
                    boxShadow: 8,
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    maxWidth: 420,
                    overflow: 'hidden',
                    position: 'absolute',
                    width: '100%',
                    zIndex: (theme) => theme.zIndex.modal
                }}
                variant="outlined"
            >
                <Stack spacing={0}>
                    {hasSkillSuggestions ? (
                        <Stack spacing={0} sx={{ p: 0.5 }}>
                            {skillSuggestions.map((skill) => (
                                <Button
                                    aria-label={`Use skill ${skill.id}`}
                                    fullWidth
                                    key={skill.id}
                                    onClick={() => {
                                        handleSkillSuggestionClick(skill);
                                    }}
                                    size="small"
                                    sx={{ justifyContent: 'flex-start' }}
                                    variant="text"
                                >
                                    {skill.id}
                                </Button>
                            ))}
                        </Stack>
                    ) : null}
                    {hasMentionSuggestions ? (
                        <Stack spacing={0}>
                            {isLoadingMentionSuggestions ? (
                                <Typography
                                    color="text.secondary"
                                    sx={{ px: 1.25, py: 1 }}
                                    variant="caption"
                                >
                                    {translate(
                                        'aiAssist.searchingStudents',
                                        'Searching students...'
                                    )}
                                </Typography>
                            ) : (
                                <List
                                    aria-label="Student mention suggestions"
                                    dense
                                    disablePadding
                                    ref={mentionSuggestionListRef}
                                    role="listbox"
                                    sx={{
                                        maxHeight: 180,
                                        overflowY: 'auto'
                                    }}
                                >
                                    {mentionSuggestions.map(
                                        (student, index) => (
                                            <ListItemButton
                                                aria-label={`Use student ${student.name}`}
                                                data-mention-index={index}
                                                key={student.id}
                                                onClick={() => {
                                                    handleMentionSuggestionClick(
                                                        student
                                                    );
                                                }}
                                                role="option"
                                                selected={
                                                    index ===
                                                    highlightedMentionIndex
                                                }
                                                sx={{
                                                    '& .MuiListItemText-secondary':
                                                        {
                                                            color: 'text.secondary'
                                                        },
                                                    '&.Mui-selected': {
                                                        backgroundColor:
                                                            'primary.main',
                                                        color: 'primary.contrastText',
                                                        '& .MuiListItemText-secondary':
                                                            {
                                                                color: 'inherit'
                                                            }
                                                    },
                                                    '&.Mui-selected:hover': {
                                                        backgroundColor:
                                                            'primary.dark'
                                                    }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={student.name}
                                                    secondary={
                                                        getStudentChineseName(
                                                            student
                                                        ) ||
                                                        student.email ||
                                                        ''
                                                    }
                                                    secondaryTypographyProps={{
                                                        variant: 'caption'
                                                    }}
                                                />
                                            </ListItemButton>
                                        )
                                    )}
                                </List>
                            )}
                        </Stack>
                    ) : null}
                </Stack>
            </Paper>
        );
    };

    const renderHomeState = (): JSX.Element => {
        if (pickerMode) {
            return (
                <StudentPicker
                    isLoading={isLoadingPickerStudents}
                    myStudents={myStudents}
                    onPickStudent={handlePickStudent}
                    recentStudents={recentStudents}
                />
            );
        }

        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                <Typography fontWeight={700} variant="subtitle1">
                    {translate('aiAssist.overviewTitle', 'Your overview')}
                </Typography>
                <Stack direction="row" gap={1}>
                    <Button
                        onClick={() => {
                            void handleChooseStudent();
                        }}
                        variant="outlined"
                    >
                        {translate('aiAssist.chooseStudent', 'Choose student')}
                    </Button>
                    <Button onClick={handleNewConversation} variant="outlined">
                        {translate('aiAssist.blankChat', 'Blank chat')}
                    </Button>
                </Stack>
            </Stack>
        );
    };

    const composerAssistContext = buildAssistContext(selectedRequestedSkill);
    const canSubmit = Boolean(
        buildSubmissionMessage(input.trim(), composerAssistContext)
    );

    if (workbenchMode === 'portfolio') {
        return (
            <Box
                sx={{
                    boxSizing: 'border-box',
                    height: {
                        xs: 'calc(100vh - 112px)',
                        md: 'calc(100vh - 112px)'
                    },
                    minHeight: 0,
                    overflow: 'hidden',
                    width: '100%'
                }}
            >
                <PortfolioView
                    onAnalyzeStudent={(student) => {
                        setAnalysisStudent(student);
                        setWorkbenchMode('student');
                    }}
                    onChatPrompt={(prompt) => {
                        handleSeedPrompt(prompt);
                    }}
                    onOpenChat={() => setWorkbenchMode('chat')}
                />
            </Box>
        );
    }

    if (workbenchMode === 'student' && analysisStudent) {
        return (
            <Box
                sx={{
                    boxSizing: 'border-box',
                    height: {
                        xs: 'calc(100vh - 112px)',
                        md: 'calc(100vh - 112px)'
                    },
                    minHeight: 0,
                    overflow: 'hidden',
                    width: '100%'
                }}
            >
                <StudentAnalysisView
                    student={analysisStudent}
                    cached={
                        analysisCacheRef.current.get(analysisStudent.id) ?? null
                    }
                    onBack={() => setWorkbenchMode('portfolio')}
                    onOpenChat={() => setWorkbenchMode('chat')}
                    onConversationCreated={(convId, conversation) => {
                        addConversationToTop(conversation);
                    }}
                    onCacheAnalysis={(text, convId) => {
                        analysisCacheRef.current.set(analysisStudent.id, {
                            text,
                            conversationId: convId,
                            ranAt: Date.now()
                        });
                    }}
                />
            </Box>
        );
    }

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
                <Paper
                    sx={{
                        alignItems: 'center',
                        borderStyle: 'dashed',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        px: 1.5,
                        py: 1
                    }}
                    variant="outlined"
                >
                    <Typography fontWeight={600} variant="body2">
                        {translate('aiAssist.betaLabel', 'TaiGer AI Assist')}
                    </Typography>
                    <Chip
                        color="warning"
                        label="BETA"
                        size="small"
                        sx={{ borderRadius: 0 }}
                        variant="outlined"
                    />
                    <Typography color="text.secondary" variant="caption">
                        {translate(
                            'aiAssist.betaHint',
                            'Initial release for testing. Output quality and behavior may change.'
                        )}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        onClick={() => setWorkbenchMode('portfolio')}
                        size="small"
                        variant="outlined"
                    >
                        {translate('aiAssist.overviewButton', 'Portfolio')}
                    </Button>
                </Paper>

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
                                onScroll={handleTranscriptScroll}
                                ref={transcriptRef}
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
                                            {translate(
                                                'aiAssist.loadingConversation',
                                                'Loading conversation...'
                                            )}
                                        </Typography>
                                    </Stack>
                                ) : messages.length === 0 ? (
                                    renderHomeState()
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
                                                            ? translate(
                                                                  'aiAssist.roleAssistant',
                                                                  'Assistant'
                                                              )
                                                            : translate(
                                                                  'aiAssist.roleYou',
                                                                  'You'
                                                              )}
                                                    </Typography>
                                                    <MessageContent
                                                        message={message}
                                                    />
                                                    {message.skillTrace ? (
                                                        <Stack
                                                            spacing={0.25}
                                                            sx={{ mt: 1.25 }}
                                                        >
                                                            {message.skillTrace
                                                                .resolvedSkill ||
                                                            message.skillTrace
                                                                .requestedSkill ? (
                                                                <Typography
                                                                    fontWeight={
                                                                        700
                                                                    }
                                                                    variant="caption"
                                                                >
                                                                    {translate(
                                                                        'aiAssist.skillUsed',
                                                                        'Skill used:'
                                                                    )}{' '}
                                                                    {message
                                                                        .skillTrace
                                                                        .resolvedSkill ||
                                                                        message
                                                                            .skillTrace
                                                                            .requestedSkill}
                                                                </Typography>
                                                            ) : null}
                                                            {message.skillTrace
                                                                .student
                                                                ?.displayName ? (
                                                                <Typography
                                                                    color="text.secondary"
                                                                    variant="caption"
                                                                >
                                                                    {translate(
                                                                        'aiAssist.studentUsed',
                                                                        'Student:'
                                                                    )}{' '}
                                                                    {
                                                                        message
                                                                            .skillTrace
                                                                            .student
                                                                            .displayName
                                                                    }
                                                                </Typography>
                                                            ) : null}
                                                        </Stack>
                                                    ) : null}
                                                    {message.role ===
                                                    'assistant' ? (
                                                        <SourcesSummary
                                                            toolCalls={
                                                                assistantTrace
                                                            }
                                                        />
                                                    ) : null}
                                                </Paper>
                                            );
                                        })}
                                        {showGoToBottom ? (
                                            <Box
                                                sx={{
                                                    bottom: 0,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    position: 'sticky',
                                                    pt: 1
                                                }}
                                            >
                                                <Button
                                                    onClick={
                                                        scrollTranscriptToBottom
                                                    }
                                                    size="small"
                                                    variant="contained"
                                                >
                                                    {translate(
                                                        'aiAssist.goToBottom',
                                                        'Go to bottom'
                                                    )}
                                                </Button>
                                            </Box>
                                        ) : null}
                                    </Stack>
                                )}
                                {isSending && streamedAssistantContent ? (
                                    <Paper
                                        sx={{
                                            mt: 1.5,
                                            p: 2
                                        }}
                                        variant="outlined"
                                    >
                                        <Typography
                                            color="text.secondary"
                                            fontWeight={700}
                                            gutterBottom
                                            variant="caption"
                                        >
                                            {translate(
                                                'aiAssist.roleAssistant',
                                                'Assistant'
                                            )}
                                        </Typography>
                                        <MessageContent
                                            message={{
                                                id: 'streaming-assistant',
                                                role: 'assistant',
                                                content:
                                                    streamedAssistantContent,
                                                linkHints:
                                                    streamedAssistantReferences
                                            }}
                                        />
                                    </Paper>
                                ) : null}
                                {isSending && currentStreamStatus ? (
                                    <Box
                                        sx={{
                                            bottom: 0,
                                            position: 'sticky',
                                            pt: 1
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {currentStreamStatus ===
                                            'Thinking...'
                                                ? `thinking${'.'.repeat(
                                                      thinkingDotCount
                                                  )}`
                                                : currentStreamStatus}
                                        </Typography>
                                    </Box>
                                ) : null}
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
                                    {mentionedStudent ? (
                                        <SkillBar
                                            onSkillClick={handleSkillClick}
                                            selectedSkillId={
                                                selectedRequestedSkill
                                            }
                                            skills={KNOWN_SKILLS}
                                        />
                                    ) : null}
                                    {isUnknownSkillHint ? (
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {translate(
                                                'aiAssist.unknownSkill',
                                                'Unknown skill, using auto mode'
                                            )}
                                        </Typography>
                                    ) : null}
                                    {composerState.mentionedStudent
                                        ?.displayName ? (
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {translate(
                                                'aiAssist.currentStudent',
                                                'Current student:'
                                            )}{' '}
                                            {
                                                composerState.mentionedStudent
                                                    .displayName
                                            }
                                        </Typography>
                                    ) : null}
                                    <Box sx={{ position: 'relative' }}>
                                        {selectedMentionedStudent ? (
                                            <Box
                                                aria-hidden
                                                ref={composerHighlightRef}
                                                sx={{
                                                    bottom: 14,
                                                    left: 14,
                                                    overflow: 'hidden',
                                                    pointerEvents: 'none',
                                                    position: 'absolute',
                                                    right: 14,
                                                    top: 14,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    zIndex: 1
                                                }}
                                            >
                                                {renderMentionHighlightedText(
                                                    input,
                                                    selectedMentionedStudent
                                                )}
                                            </Box>
                                        ) : null}
                                        <TextField
                                            disabled={
                                                isSending ||
                                                isLoadingConversation
                                            }
                                            fullWidth
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={translate(
                                                                'aiAssist.sendMessage',
                                                                'Send message'
                                                            )}
                                                            color="primary"
                                                            disabled={
                                                                isSending ||
                                                                isLoadingConversation ||
                                                                !canSubmit
                                                            }
                                                            onClick={() => {
                                                                void handleSubmit();
                                                            }}
                                                            size="small"
                                                        >
                                                            {isSending ? (
                                                                <CircularProgress
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <SendIcon fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            inputRef={composerInputRef}
                                            inputProps={{
                                                'aria-label': translate(
                                                    'aiAssist.askLabel',
                                                    'Ask TaiGer AI'
                                                ),
                                                onScroll: () => {
                                                    syncComposerHighlightScroll();
                                                }
                                            }}
                                            maxRows={8}
                                            minRows={1}
                                            multiline
                                            onChange={(event) => {
                                                setInput(event.target.value);
                                                setCursorPosition(
                                                    event.target
                                                        .selectionStart ??
                                                        event.target.value
                                                            .length
                                                );
                                            }}
                                            onClick={() => {
                                                syncCursorPosition();
                                            }}
                                            onKeyDown={handleComposerKeyDown}
                                            onSelect={() => {
                                                syncCursorPosition();
                                            }}
                                            placeholder={translate(
                                                'aiAssist.askLabel',
                                                'Ask TaiGer AI'
                                            )}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    pr: 0.5
                                                },
                                                '& .MuiInputBase-inputMultiline':
                                                    selectedMentionedStudent
                                                        ? {
                                                              caretColor:
                                                                  'text.primary',
                                                              color: 'transparent'
                                                          }
                                                        : undefined
                                            }}
                                            value={input}
                                        />
                                        {renderComposerSuggestions()}
                                    </Box>
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
                                    {translate(
                                        'aiAssist.conversations',
                                        'Conversations'
                                    )}
                                </Typography>
                                <Button
                                    disabled={
                                        isSending || isLoadingConversation
                                    }
                                    onClick={handleNewConversation}
                                    size="small"
                                    variant="outlined"
                                >
                                    {translate(
                                        'aiAssist.newConversation',
                                        'New conversation'
                                    )}
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
                                        {translate(
                                            'aiAssist.loadingConversations',
                                            'Loading conversations...'
                                        )}
                                    </Typography>
                                </Stack>
                            ) : conversations.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {translate(
                                        'aiAssist.noConversations',
                                        'No conversations yet.'
                                    )}
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
                                                            label={translate(
                                                                'aiAssist.conversationTitle',
                                                                'Conversation title'
                                                            )}
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
                                                            aria-label={translate(
                                                                'aiAssist.cancelRename',
                                                                'Cancel rename'
                                                            )}
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
                                                            aria-label={translate(
                                                                'aiAssist.renameConversation',
                                                                'Rename {{title}}',
                                                                {
                                                                    title: conversation.title
                                                                }
                                                            )}
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
                                                            aria-label={translate(
                                                                'aiAssist.deleteConversation',
                                                                'Delete {{title}}',
                                                                {
                                                                    title: conversation.title
                                                                }
                                                            )}
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
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default AIAssistPage;
