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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
    deleteAIAssistConversation,
    getAIAssistConversation,
    getAIAssistConversations,
    getAIAssistMyStudents,
    getAIAssistRecentStudents,
    streamAIAssistFirstMessage,
    streamAIAssistMessage,
    searchAIAssistStudents,
    updateAIAssistConversation
} from '@/api';
import type {
    AIAssistAssistContext,
    AIAssistConversation,
    AIAssistMessage,
    AIAssistMentionedStudent,
    AIAssistPickerStudent,
    AIAssistQuickSkill,
    AIAssistStreamProgressEvent,
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
    labelKey: string;
}

const quickSkills: QuickSkillOption[] = [
    {
        id: 'summarize_student',
        labelKey: 'aiAssist.quickSkill.summarizeStudent'
    },
    {
        id: 'identify_risk',
        labelKey: 'aiAssist.quickSkill.identifyRisk'
    },
    {
        id: 'review_messages',
        labelKey: 'aiAssist.quickSkill.reviewMessages'
    },
    {
        id: 'review_open_tasks',
        labelKey: 'aiAssist.quickSkill.reviewOpenTasks'
    }
];
const aiAssistGenericErrorMessage =
    'AI Assist is temporarily unavailable. Please try again.';

const defaultInput = '';
const defaultComposerState: ComposerState = {
    mentionedStudent: null,
    requestedSkill: null,
    unknownSkillText: null
};
const skillTagPattern = /(^|\s)#([a-z_]+)/g;
const minimumStudentSearchLength = 2;

const getStudentStringField = (
    student: AIAssistPickerStudent,
    key: string
): string => {
    const rawValue = (student as Record<string, unknown>)[key];
    return typeof rawValue === 'string' ? rawValue : '';
};

const getStudentChineseName = (student: AIAssistPickerStudent): string => {
    const explicitChineseName = String(student.chineseName || '').trim();
    if (explicitChineseName) {
        return explicitChineseName;
    }

    const lastNameChinese = getStudentStringField(student, 'lastname_chinese');
    const firstNameChinese = getStudentStringField(
        student,
        'firstname_chinese'
    );
    return `${lastNameChinese}${firstNameChinese}`.trim();
};

const getStudentEnglishNames = (student: AIAssistPickerStudent): string[] => {
    const primaryName = String(student.name || '').trim();
    const firstName = getStudentStringField(student, 'firstname').trim();
    const lastName = getStudentStringField(student, 'lastname').trim();

    return [
        primaryName,
        [firstName, lastName].filter(Boolean).join(' '),
        [lastName, firstName].filter(Boolean).join(' ')
    ].filter(Boolean);
};

const skillAliases: Record<AIAssistQuickSkill, string[]> = {
    summarize_student: ['summarize', 'summary', 'student summary'],
    identify_risk: ['risk', 'risks', 'identify', 'identify risk', 'blocker'],
    review_messages: ['messages', 'message', 'review messages', 'reply'],
    review_open_tasks: ['tasks', 'task', 'open tasks', 'todo', 'followup']
};

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
        getStudentChineseName(student),
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

const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeLookup = (value: string): string =>
    value.toLowerCase().replace(/[^a-z]/g, '');

const normalizeMentionSearch = (value: string): string =>
    String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .trim();

const normalizeChineseSearch = (value: string): string =>
    String(value || '')
        .replace(/\s+/g, '')
        .trim();

const buildStudentSearchStrings = (
    student: AIAssistPickerStudent
): string[] => {
    const englishNames = getStudentEnglishNames(student);
    const chineseName = getStudentChineseName(student);

    return [
        ...englishNames.map(normalizeMentionSearch),
        normalizeMentionSearch(student.email || ''),
        normalizeMentionSearch(student.name || ''),
        normalizeChineseSearch(chineseName)
    ].filter(Boolean);
};

const matchesStudentMentionQuery = (
    student: AIAssistPickerStudent,
    query: string
): boolean => {
    const normalizedQuery = normalizeMentionSearch(query);
    const normalizedChineseQuery = normalizeChineseSearch(query);

    if (!normalizedQuery && !normalizedChineseQuery) {
        return false;
    }

    const searchStrings = buildStudentSearchStrings(student);

    return searchStrings.some(
        (searchValue) =>
            searchValue.includes(normalizedQuery) ||
            searchValue.includes(normalizedChineseQuery)
    );
};

const uniqueStudents = (
    students: AIAssistPickerStudent[]
): AIAssistPickerStudent[] => {
    const byId = new Map<string, AIAssistPickerStudent>();
    students.forEach((student) => {
        if (!byId.has(student.id)) {
            byId.set(student.id, student);
        }
    });
    return Array.from(byId.values());
};

const getTokenQueryAtCursor = (
    value: string,
    cursorIndex: number,
    trigger: '@' | '#'
): string | null => {
    const beforeCursor = value.slice(0, cursorIndex);
    const tokenPattern =
        trigger === '@' ? /(^|\s)@([^@\s#]*)$/ : /(^|\s)#([^#\s@]*)$/;

    return beforeCursor.match(tokenPattern)?.[2] ?? null;
};

const replaceTokenAtCursor = ({
    value,
    cursorIndex,
    trigger,
    replacement
}: {
    value: string;
    cursorIndex: number;
    trigger: '@' | '#';
    replacement: string;
}): { nextValue: string; nextCursorIndex: number } => {
    const beforeCursor = value.slice(0, cursorIndex);
    const tokenPattern =
        trigger === '@' ? /(^|\s)@([^@\s#]*)$/ : /(^|\s)#([^#\s@]*)$/;
    const match = beforeCursor.match(tokenPattern);

    if (!match || match.index == null) {
        return { nextValue: value, nextCursorIndex: cursorIndex };
    }

    const leadingWhitespace = match[1] || '';
    const tokenStart = match.index + leadingWhitespace.length;
    const nextValue =
        value.slice(0, tokenStart) + replacement + value.slice(cursorIndex);

    return {
        nextValue,
        nextCursorIndex: tokenStart + replacement.length
    };
};

const findMatchingSkills = (query: string): QuickSkillOption[] => {
    const normalizedQuery = normalizeLookup(query);

    if (!normalizedQuery) {
        return [];
    }

    return quickSkills.filter((quickSkill) => {
        const searchableValues = [
            quickSkill.id,
            quickSkill.id.replace(/_/g, ' '),
            ...(skillAliases[quickSkill.id] || [])
        ].map(normalizeLookup);

        return searchableValues.some(
            (value) =>
                value === normalizedQuery ||
                value.startsWith(normalizedQuery) ||
                value.includes(normalizedQuery)
        );
    });
};

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

const renderMentionHighlightedText = (
    value: string,
    student: AIAssistMentionedStudent | null
): JSX.Element => {
    if (!value) {
        return <>{'\u200b'}</>;
    }

    if (!student) {
        return <>{value}</>;
    }

    const mentionToken = `@${student.displayName}`;
    const mentionPattern = new RegExp(`(${escapeRegExp(mentionToken)})`, 'gi');
    const parts = value.split(mentionPattern);

    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === mentionToken.toLowerCase() ? (
                    <Box
                        component="span"
                        key={`mention-${index}`}
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            borderRadius: 0.75,
                            color: 'primary.main',
                            px: 0.25
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <Box component="span" key={`text-${index}`}>
                        {part}
                    </Box>
                )
            )}
        </>
    );
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

const withResponseSkillTrace = (
    message: AIAssistMessage,
    skillTrace?: AIAssistSkillTrace
): AIAssistMessage => ({
    ...message,
    skillTrace: message.skillTrace ?? skillTrace ?? null
});

const toolDisplayNames: Record<string, string> = {
    search_accessible_students: 'Search students',
    get_student_summary: 'Student summary',
    get_student_applications: 'Applications',
    get_latest_communications: 'Messages',
    get_profile_documents: 'Profile documents',
    get_support_tickets: 'Support tickets'
};

const getToolDisplayName = (toolName: string): string =>
    toolDisplayNames[toolName] ||
    toolName
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const summarizeToolValue = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const record = value as Record<string, unknown>;

    if (Array.isArray(record.data)) {
        return `${record.data.length} result${record.data.length === 1 ? '' : 's'}`;
    }

    if (typeof record.query === 'string') {
        return `Query: ${record.query}`;
    }

    if (typeof record.studentId === 'string') {
        return `Student: ${record.studentId}`;
    }

    return null;
};

const resolveCurrentProgressStatus = (
    event: AIAssistStreamProgressEvent
): string | null => {
    if (event.type === 'thinking') {
        return 'Thinking...';
    }

    if (event.type === 'tool_start') {
        return `Calling ${getToolDisplayName(event.toolName || 'tool')}...`;
    }

    return null;
};

const MessageMarkdown = ({ content }: { content: string }): JSX.Element => (
    <Box
        sx={{
            '& p': { m: 0 },
            '& p + p': { mt: 1 },
            '& ul, & ol': { my: 0.75, pl: 3 },
            '& li + li': { mt: 0.25 },
            '& blockquote': {
                borderColor: 'divider',
                borderLeft: 3,
                m: 0,
                pl: 1.5
            },
            '& table': {
                borderCollapse: 'collapse',
                mt: 1,
                width: '100%'
            },
            '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 0.75
            },
            '& code': {
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25
            },
            '& pre': {
                bgcolor: 'action.hover',
                borderRadius: 1,
                m: 0,
                mt: 1,
                overflowX: 'auto',
                p: 1
            },
            wordBreak: 'break-word'
        }}
    >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || ''}
        </ReactMarkdown>
    </Box>
);

const renderHighlightedMessageText = (
    content: string,
    tokens: string[]
): JSX.Element => {
    if (!content) {
        return <>{''}</>;
    }

    const cleanedTokens = tokens.filter(Boolean);
    if (cleanedTokens.length === 0) {
        return <>{content}</>;
    }

    const tokenPattern = new RegExp(
        `(${cleanedTokens.map(escapeRegExp).join('|')})`,
        'gi'
    );
    const parts = content.split(tokenPattern);

    return (
        <>
            {parts.map((part, index) => {
                const isHighlighted = cleanedTokens.some(
                    (token) => token.toLowerCase() === part.toLowerCase()
                );

                return isHighlighted ? (
                    <Box
                        component="span"
                        data-testid="ai-assist-highlighted-token"
                        key={`hl-${index}`}
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            borderRadius: 0.75,
                            color: 'primary.main',
                            px: 0.25
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <Box component="span" key={`tx-${index}`}>
                        {part}
                    </Box>
                );
            })}
        </>
    );
};

const MessageContent = ({
    message
}: {
    message: AIAssistMessage;
}): JSX.Element => {
    const content = message.content || '';
    const studentDisplayName = message.skillTrace?.student?.displayName || null;
    const requestedSkill = message.skillTrace?.requestedSkill || null;
    const highlightTokens = [
        studentDisplayName ? `@${studentDisplayName}` : '',
        requestedSkill ? `#${requestedSkill}` : ''
    ].filter(Boolean);
    const hasMarkdownSyntax = /(^|\s)([#>*`-]|\d+\.)\s|[*_`[\]()]/m.test(
        content
    );

    if (highlightTokens.length === 0) {
        return <MessageMarkdown content={content} />;
    }

    // Keep markdown rendering for rich responses. Apply inline highlight only
    // when content is plain text.
    if (hasMarkdownSyntax) {
        return <MessageMarkdown content={content} />;
    }

    return (
        <Box
            sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}
        >
            {renderHighlightedMessageText(content, highlightTokens)}
        </Box>
    );
};

const ToolTraceCard = ({
    toolCall
}: {
    toolCall: AIAssistToolCall;
}): JSX.Element => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayName = getToolDisplayName(toolCall.toolName);
    const argumentSummary = summarizeToolValue(toolCall.arguments);
    const resultSummary = summarizeToolValue(toolCall.result);

    return (
        <Box
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.25
            }}
        >
            <Stack alignItems="flex-start" spacing={0.75}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ width: '100%' }}
                >
                    <Box>
                        <Typography fontWeight={700} variant="body2">
                            {displayName}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                            {toolCall.status}
                            {toolCall.durationMs != null
                                ? ` | ${toolCall.durationMs}ms`
                                : ''}
                        </Typography>
                    </Box>
                    <Button
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${displayName}`}
                        onClick={() => {
                            setIsExpanded((previous) => !previous);
                        }}
                        size="small"
                        variant="text"
                    >
                        Details
                    </Button>
                </Stack>
                {argumentSummary || resultSummary || toolCall.errorMessage ? (
                    <Stack spacing={0.25}>
                        {argumentSummary ? (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {argumentSummary}
                            </Typography>
                        ) : null}
                        {resultSummary ? (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {resultSummary}
                            </Typography>
                        ) : null}
                        {toolCall.errorMessage ? (
                            <Typography color="error" variant="caption">
                                {toolCall.errorMessage}
                            </Typography>
                        ) : null}
                    </Stack>
                ) : null}
                {isExpanded ? (
                    <Typography
                        component="pre"
                        sx={{
                            mt: 0.5,
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
                ) : null}
            </Stack>
        </Box>
    );
};

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
    const [draftConversation, setDraftConversation] =
        useState<DraftConversationState | null>(null);
    const [input, setInput] = useState(defaultInput);
    const [selectedQuickSkill, setSelectedQuickSkill] =
        useState<AIAssistQuickSkill | null>(null);
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
    const [highlightedSkillIndex, setHighlightedSkillIndex] = useState(0);
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
    const [currentStreamStatus, setCurrentStreamStatus] = useState<
        string | null
    >(null);
    const [thinkingDotCount, setThinkingDotCount] = useState(1);
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

    const baseMentionedStudent =
        useMemo<AIAssistMentionedStudent | null>(() => {
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

    const activeMentionQuery = useMemo(
        () => getTokenQueryAtCursor(input, cursorPosition, '@'),
        [cursorPosition, input]
    );
    const activeSkillQuery = useMemo(
        () => getTokenQueryAtCursor(input, cursorPosition, '#'),
        [cursorPosition, input]
    );
    const hasExplicitUnresolvedMention = Boolean(activeMentionQuery);
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
    const skillTrace = useMemo(() => parseSkillTrace(input), [input]);
    const skillSuggestions = useMemo(() => {
        if (!activeSkillQuery) {
            return [];
        }

        const exactSkill = quickSkills.find(
            (quickSkill) => quickSkill.id === activeSkillQuery
        );

        if (exactSkill) {
            return [];
        }

        return findMatchingSkills(activeSkillQuery);
    }, [activeSkillQuery]);

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
        setHighlightedSkillIndex(0);
    }, [skillSuggestions]);

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
        setComposerState(
            buildComposerState({
                mentionedStudent,
                selectedQuickSkill,
                skillTrace
            })
        );
    }, [mentionedStudent, selectedQuickSkill, skillTrace]);

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
                    const mergedCandidates = uniqueStudents([
                        ...(response.data || []),
                        ...recentStudents,
                        ...myStudents
                    ]);
                    const filteredSuggestions = mergedCandidates.filter(
                        (student) =>
                            matchesStudentMentionQuery(
                                student,
                                activeMentionQuery
                            )
                    );
                    setMentionSuggestions(filteredSuggestions);
                }
            })
            .catch(() => {
                if (!ignore) {
                    const mergedCandidates = uniqueStudents([
                        ...recentStudents,
                        ...myStudents
                    ]);
                    const filteredSuggestions = mergedCandidates.filter(
                        (student) =>
                            matchesStudentMentionQuery(
                                student,
                                activeMentionQuery
                            )
                    );
                    setMentionSuggestions(filteredSuggestions);
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
    }, [activeMentionQuery, myStudents, recentStudents]);

    const clearActiveWorkspace = useCallback((): void => {
        setConversationId(null);
        setDraftConversation(null);
        setMessages([]);
        setTrace([]);
        setInput(defaultInput);
        setSelectedQuickSkill(null);
        setSelectedMentionedStudent(null);
        setMentionSuggestions([]);
        setIsLoadingMentionSuggestions(false);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setCursorPosition(0);
    }, []);

    const loadConversation = useCallback(
        async (nextConversationId: string): Promise<void> => {
            setConversationId(nextConversationId);
            setDraftConversation(null);
            setEditingConversationId(null);
            setDraftTitle('');
            setInput(defaultInput);
            setSelectedQuickSkill(null);
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
        setSelectedMentionedStudent(null);
        setMentionSuggestions([]);
        setIsLoadingMentionSuggestions(false);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setCursorPosition(0);
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
        setSelectedMentionedStudent(null);
        setMentionSuggestions([]);
        setIsLoadingMentionSuggestions(false);
        setComposerState(defaultComposerState);
        setEditingConversationId(null);
        setDraftTitle('');
        setCursorPosition(0);
        setDraftConversation((previous) => ({
            mode: 'studentPicker',
            student: previous?.student ?? null
        }));
        void loadStudentPickerData();
    };

    const handleSelectStudent = (student: AIAssistPickerStudent): void => {
        const mentionToken = `@${student.name}`;
        const mentionPattern = new RegExp(
            `(^|\\s)${escapeRegExp(mentionToken)}(?=\\s|$)`,
            'i'
        );
        const nextInput = mentionPattern.test(input)
            ? input
            : input.trim()
              ? `${mentionToken} ${input}`
              : `${mentionToken} `;

        setSelectedMentionedStudent({
            id: student.id,
            displayName: student.name
        });
        setMentionSuggestions([]);
        setInput(nextInput);
        setCursorPosition(nextInput.length);
        setDraftConversation({
            mode: 'studentReady',
            student
        });
    };

    const handleQuickSkillClick = (quickSkill: QuickSkillOption): void => {
        setSelectedQuickSkill((previous) =>
            previous === quickSkill.id ? null : quickSkill.id
        );
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

    const handleSkillSuggestionClick = (quickSkill: QuickSkillOption): void => {
        const replaced = replaceTokenAtCursor({
            value: input,
            cursorIndex:
                composerInputRef.current?.selectionStart ?? cursorPosition,
            trigger: '#',
            replacement: `#${quickSkill.id}`
        });

        setSelectedQuickSkill(quickSkill.id);
        setInput(replaced.nextValue);
        setCursorPosition(replaced.nextCursorIndex);
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
        if (assistContext?.requestedSkill) {
            tokens.push(`#${assistContext.requestedSkill}`);
        }
        if (assistContext?.unknownSkillText) {
            tokens.push(`#${assistContext.unknownSkillText}`);
        }

        return tokens.join(' ').trim();
    };

    const handleSubmit = async (): Promise<void> => {
        const trimmedInput = input.trim();
        const assistContext = buildAssistContext();
        const submissionMessage = buildSubmissionMessage(
            trimmedInput,
            assistContext
        );

        if (!submissionMessage || isSending || isLoadingConversation) {
            return;
        }

        setIsSending(true);
        setError(null);
        setCurrentStreamStatus(null);
        scrollTranscriptToBottom();

        try {
            const onProgress = (event: AIAssistStreamProgressEvent): void => {
                const status = resolveCurrentProgressStatus(event);
                if (status) {
                    setCurrentStreamStatus(status);
                }
            };
            const onError = (message: string): void => {
                void message;
                setError(aiAssistGenericErrorMessage);
                setCurrentStreamStatus(null);
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
                setDraftConversation(null);
                setMessages([
                    userMessage,
                    withResponseSkillTrace(assistantMessage, responseSkillTrace)
                ]);
                setTrace(responseTrace || []);
                setInput(defaultInput);
                setCurrentStreamStatus(null);
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

            setMessages((previous) => [
                ...previous,
                userMessage,
                withResponseSkillTrace(assistantMessage, responseSkillTrace)
            ]);
            setTrace((previous) => mergeTrace(previous, responseTrace || []));
            setInput(defaultInput);
            touchConversation(conversationId);
            setCurrentStreamStatus(null);
        } catch (err) {
            void err;
            setError(aiAssistGenericErrorMessage);
            setCurrentStreamStatus(null);
        } finally {
            setIsSending(false);
            setCurrentStreamStatus(null);
        }
    };

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

        if (skillSuggestions.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlightedSkillIndex((previous) =>
                    Math.min(previous + 1, skillSuggestions.length - 1)
                );
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedSkillIndex((previous) =>
                    Math.max(previous - 1, 0)
                );
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setHighlightedSkillIndex(0);
                return;
            }

            if (event.key === 'Enter' && !event.altKey) {
                event.preventDefault();
                const skill = skillSuggestions[highlightedSkillIndex];
                if (skill) {
                    handleSkillSuggestionClick(skill);
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
                    {translate(
                        'aiAssist.noStudentsAvailable',
                        'No students available.'
                    )}
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
                        label={translate(
                            quickSkill.labelKey,
                            quickSkill.id === 'summarize_student'
                                ? 'Summarize a student'
                                : quickSkill.id === 'identify_risk'
                                  ? 'Find application risks'
                                  : quickSkill.id === 'review_messages'
                                    ? 'Check latest messages'
                                    : 'Review open tasks'
                        )}
                        onClick={() => {
                            handleQuickSkillClick(quickSkill);
                        }}
                        variant={isSelected ? 'filled' : 'outlined'}
                    />
                );
            })}
        </Stack>
    );

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
                    {hasSkillSuggestions ? (
                        <Stack spacing={0.75} sx={{ p: 1 }}>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {translate(
                                    'aiAssist.skillSuggestions',
                                    'Skill suggestions'
                                )}
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {skillSuggestions.map((quickSkill, index) => (
                                    <Button
                                        aria-label={`Use skill ${quickSkill.id}`}
                                        color={
                                            index === highlightedSkillIndex
                                                ? 'primary'
                                                : 'inherit'
                                        }
                                        key={quickSkill.id}
                                        onClick={() => {
                                            handleSkillSuggestionClick(
                                                quickSkill
                                            );
                                        }}
                                        size="small"
                                        variant="outlined"
                                    >
                                        #{quickSkill.id}
                                    </Button>
                                ))}
                            </Stack>
                        </Stack>
                    ) : null}
                </Stack>
            </Paper>
        );
    };

    const renderDraftState = (): JSX.Element => {
        if (draftConversation?.mode === 'studentPicker') {
            return (
                <Stack spacing={2}>
                    <Typography variant="subtitle1">
                        {translate('aiAssist.chooseStudent', 'Choose student')}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {translate(
                            'aiAssist.chooseStudentHelp',
                            'Start from a recent student or someone already assigned to you.'
                        )}
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
                                {translate(
                                    'aiAssist.loadingStudents',
                                    'Loading students...'
                                )}
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack divider={<Divider flexItem />} spacing={2}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                    {translate(
                                        'aiAssist.recentStudents',
                                        'Recent students'
                                    )}
                                </Typography>
                                {renderStudentButtons(
                                    recentStudents,
                                    'ai-assist-student-section-recent'
                                )}
                            </Stack>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                    {translate(
                                        'aiAssist.myStudents',
                                        'My students'
                                    )}
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
                        {translate(
                            'aiAssist.startWithStudent',
                            `Start with ${draftConversation.student.name}`,
                            {
                                studentName: draftConversation.student.name
                            }
                        )}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {translate(
                            'aiAssist.startWithStudentHelp',
                            'Pick a quick start or edit the message before sending.'
                        )}
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
                            {translate(
                                'aiAssist.changeStudent',
                                'Change student'
                            )}
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
                    <Typography variant="subtitle1">
                        {translate('aiAssist.blankChat', 'Blank chat')}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {translate(
                            'aiAssist.blankChatHelp',
                            'Draft the first message locally, then send when it is ready.'
                        )}
                    </Typography>
                </Stack>
            );
        }

        return (
            <Stack spacing={2}>
                <Typography variant="subtitle1">
                    {translate(
                        'aiAssist.startWithQuestion',
                        'Start with a question'
                    )}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {translate(
                        'aiAssist.startWithQuestionHelp',
                        'Start a blank draft or choose a student before sending the first message.'
                    )}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    <Button onClick={handleChooseStudent} variant="contained">
                        {translate('aiAssist.chooseStudent', 'Choose student')}
                    </Button>
                    <Button onClick={handleBlankChat} variant="outlined">
                        {translate('aiAssist.blankChat', 'Blank chat')}
                    </Button>
                </Stack>
            </Stack>
        );
    };

    const composerAssistContext = buildAssistContext();
    const canSubmit = Boolean(
        buildSubmissionMessage(input.trim(), composerAssistContext)
    );

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
                                                                {translate(
                                                                    'aiAssist.toolsUsed',
                                                                    'Tools used'
                                                                )}{' '}
                                                                (
                                                                {
                                                                    assistantTrace.length
                                                                }
                                                                )
                                                            </Typography>
                                                            {assistantTrace.map(
                                                                (toolCall) => (
                                                                    <ToolTraceCard
                                                                        key={`${message.id}-${toolCall.id}`}
                                                                        toolCall={
                                                                            toolCall
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </Stack>
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
                                    <Stack spacing={1}>
                                        {renderQuickSkillChips()}
                                        {composerState.unknownSkillText ? (
                                            <Typography
                                                color="text.secondary"
                                                variant="caption"
                                            >
                                                {translate(
                                                    'aiAssist.unknownSkillAutoMode',
                                                    'Unknown skill, using auto mode'
                                                )}
                                            </Typography>
                                        ) : null}
                                    </Stack>
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
                                {translate('aiAssist.toolTrace', 'Tool trace')}
                            </Typography>
                            {trace.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {translate(
                                        'aiAssist.toolTraceEmpty',
                                        'Tool calls will appear here after an answer.'
                                    )}
                                </Typography>
                            ) : (
                                <Stack spacing={1.5}>
                                    {trace.map((toolCall) => (
                                        <ToolTraceCard
                                            key={`side-rail-${toolCall.id}`}
                                            toolCall={toolCall}
                                        />
                                    ))}
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
