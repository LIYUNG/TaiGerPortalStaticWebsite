import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    JSX
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    getAIAssistLatestAnalysis,
    streamAIAssistFirstMessage,
    streamAIAssistMessage
} from '@/api';
import DEMO from '@/store/constant';
import type {
    AIAssistConversation,
    AIAssistMessage,
    AIAssistStreamProgressEvent
} from '@/api/types';
import { AnalysisDisplay } from './AnalysisDisplay';
import type { PortfolioStudent } from './StudentHealthCard';

interface StudentAnalysisViewProps {
    student: PortfolioStudent;
    cached?: { text: string; conversationId: string; ranAt: number } | null;
    onBack: () => void;
    onOpenChat?: () => void;
    onConversationCreated?: (
        convId: string,
        conversation: AIAssistConversation
    ) => void;
    onCacheAnalysis?: (text: string, conversationId: string) => void;
}

type TFn = (
    key: string,
    fallback: string,
    opts?: Record<string, unknown>
) => string;

const formatAgo = (ts: number, t: TFn): string => {
    const mins = Math.max(Math.floor((Date.now() - ts) / 60000), 0);
    if (mins < 1) return t('aiAssist.timeJustNow', 'just now');
    if (mins < 60)
        return t('aiAssist.timeMinutesAgo', '{{count}}m ago', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24)
        return t('aiAssist.timeHoursAgo', '{{count}}h ago', { count: hours });
    return t('aiAssist.timeDaysAgo', '{{count}}d ago', {
        count: Math.floor(hours / 24)
    });
};

const buildAnalysisPrompt = (student: PortfolioStudent): string => {
    const signals = student.signals.map((s) => s.label).join('; ');
    return (
        `Perform a full deep-dive analysis of student @${student.name} (id: ${student.id}).\n\n` +
        `Known signals from portfolio: ${signals || 'none'}.\n\n` +
        `Gather all available data (overview, communications, document threads, open threads). ` +
        `Identify all blockers with root causes, assess overall application health, and provide prioritized next actions.`
    );
};

const resolveStatus = (
    event: AIAssistStreamProgressEvent,
    t: TFn
): string | null => {
    if (event.type === 'thinking')
        return t('aiAssist.statusThinking', 'Thinking...');
    if (event.type === 'tool_start')
        return t('aiAssist.statusFetching', 'Fetching: {{toolName}}...', {
            toolName: event.toolName ?? 'data'
        });
    if (event.type === 'tool_done')
        return t('aiAssist.statusThinking', 'Thinking...');
    if (event.type === 'status' && event.phase === 'completed') return null;
    return null;
};

export const StudentAnalysisView = ({
    student,
    cached,
    onBack,
    onOpenChat,
    onConversationCreated,
    onCacheAnalysis
}: StudentAnalysisViewProps): JSX.Element => {
    const { t, i18n } = useTranslation();
    const preferredLanguage = i18n.language || 'zh-TW';
    const isZh = i18n.language?.startsWith('zh');
    const displayName =
        isZh && student.chineseName ? student.chineseName : student.name;
    const [analysisText, setAnalysisText] = useState(cached?.text ?? '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamStatus, setStreamStatus] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(
        cached?.conversationId ?? null
    );
    const [analyzedAt, setAnalyzedAt] = useState<number | null>(
        cached?.ranAt ?? null
    );
    const [followUpInput, setFollowUpInput] = useState('');
    const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
    const [messages, setMessages] = useState<AIAssistMessage[]>([]);
    const [streamingFollowUp, setStreamingFollowUp] = useState('');
    const hasRunRef = useRef(false);
    const profileUrl = DEMO.STUDENT_DATABASE_STUDENTID_LINK(
        student.id,
        DEMO.PROFILE_HASH
    );

    const runAnalysis = useCallback(async (): Promise<void> => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisText('');

        try {
            const response = await streamAIAssistFirstMessage(
                {
                    message: buildAnalysisPrompt(student),
                    preferredLanguage,
                    assistContext: {
                        mentionedStudent: {
                            id: student.id,
                            displayName: student.name
                        },
                        analysisMode: true
                    }
                },
                {
                    onProgress: (event) => {
                        const status = resolveStatus(event, t as TFn);
                        if (status !== undefined) setStreamStatus(status);
                    },
                    onToken: (text) => {
                        setAnalysisText((prev) => prev + text);
                    },
                    onError: () => {
                        setError(
                            t(
                                'aiAssist.analysisError',
                                'Analysis failed. Please try again.'
                            )
                        );
                        setIsAnalyzing(false);
                    }
                }
            );

            if (!response?.data) {
                throw new Error('No response data');
            }

            const { conversation, assistantMessage } = response.data;
            const finalText = assistantMessage.content || analysisText;
            setConversationId(conversation.id);
            setAnalysisText(finalText);
            setAnalyzedAt(Date.now());
            onConversationCreated?.(conversation.id, conversation);
            onCacheAnalysis?.(finalText, conversation.id);
        } catch {
            setError(
                t(
                    'aiAssist.analysisError',
                    'Analysis failed. Please try again.'
                )
            );
        } finally {
            setIsAnalyzing(false);
            setStreamStatus(null);
        }
    }, [
        student,
        analysisText,
        preferredLanguage,
        t,
        onConversationCreated,
        onCacheAnalysis
    ]);

    const hydrateOrAnalyze = useCallback(async (): Promise<void> => {
        // Cross-reload reuse: load the last persisted analysis for this student
        // before spending tokens on a fresh deep-dive. The header shows when it
        // was run and offers Re-analyze.
        setIsAnalyzing(true);
        try {
            const res = await getAIAssistLatestAnalysis(student.id);
            if (res?.data?.content) {
                setAnalysisText(res.data.content);
                setConversationId(res.data.conversationId);
                setAnalyzedAt(new Date(res.data.analyzedAt).getTime());
                onCacheAnalysis?.(res.data.content, res.data.conversationId);
                setIsAnalyzing(false);
                return;
            }
        } catch {
            // No persisted analysis (or lookup failed) — fall through to a run.
        }
        await runAnalysis();
    }, [student.id, runAnalysis, onCacheAnalysis]);

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;
        // Reuse a cached analysis from this session instead of re-running an
        // expensive multi-tool deep-dive. The header exposes Re-analyze for a
        // forced refresh.
        if (cached?.text) return;
        void hydrateOrAnalyze();
    }, [cached, hydrateOrAnalyze]);

    const sendFollowUp = useCallback(async (): Promise<void> => {
        const text = followUpInput.trim();
        if (!text || isSendingFollowUp || !conversationId) return;

        setIsSendingFollowUp(true);
        setFollowUpInput('');

        const userMsg: AIAssistMessage = {
            id: String(Date.now()),
            role: 'user',
            content: text
        };
        setMessages((prev) => [...prev, userMsg]);
        setStreamingFollowUp('');

        try {
            const response = await streamAIAssistMessage(
                conversationId,
                { message: text, preferredLanguage },
                {
                    onToken: (chunk) => {
                        setStreamingFollowUp((prev) => prev + chunk);
                    },
                    onError: () => {
                        setError(
                            t('aiAssist.followUpError', 'Follow-up failed.')
                        );
                    }
                }
            );

            if (response?.data) {
                const { assistantMessage } = response.data;
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch {
            setError(t('aiAssist.followUpError', 'Follow-up failed.'));
        } finally {
            setIsSendingFollowUp(false);
            setStreamingFollowUp('');
        }
    }, [
        followUpInput,
        isSendingFollowUp,
        conversationId,
        preferredLanguage,
        t
    ]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            void sendFollowUp();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0
            }}
        >
            {/* Header */}
            <Stack
                alignItems="center"
                direction="row"
                spacing={1.5}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                    px: 2,
                    py: 1.25
                }}
            >
                <IconButton onClick={onBack} size="small">
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography fontWeight={700} variant="subtitle1">
                    {displayName}
                </Typography>
                {student.signals.slice(0, 2).map((s, i) => (
                    <Chip
                        key={i}
                        color={
                            s.urgency === 'critical'
                                ? 'error'
                                : s.urgency === 'high'
                                  ? 'warning'
                                  : 'default'
                        }
                        label={s.label}
                        size="small"
                        sx={{ borderRadius: 0.75 }}
                        variant="outlined"
                    />
                ))}
                <Box sx={{ flexGrow: 1 }} />
                {onOpenChat && (
                    <Button
                        onClick={onOpenChat}
                        size="small"
                        sx={{ mr: 0.5 }}
                        variant="outlined"
                    >
                        {t('aiAssist.chatHistory', 'Chat / History')}
                    </Button>
                )}
                <Button
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    href={profileUrl}
                    size="small"
                    target="_blank"
                    variant="outlined"
                >
                    {t('aiAssist.profileTab', 'Profile')}
                </Button>
            </Stack>

            {/* Main content */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {/* AI Analysis */}
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={2}>
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Typography
                                        fontWeight={700}
                                        variant="subtitle2"
                                    >
                                        {t(
                                            'aiAssist.analysisHeading',
                                            'AI Analysis'
                                        )}
                                    </Typography>
                                    {!isAnalyzing && analyzedAt && (
                                        <Typography
                                            color="text.disabled"
                                            variant="caption"
                                        >
                                            {formatAgo(analyzedAt, t as TFn)}
                                        </Typography>
                                    )}
                                    {!isAnalyzing && analysisText && (
                                        <Button
                                            onClick={() => void runAnalysis()}
                                            size="small"
                                            startIcon={
                                                <RefreshIcon fontSize="small" />
                                            }
                                            sx={{ minWidth: 0 }}
                                        >
                                            {t(
                                                'aiAssist.reanalyze',
                                                'Re-analyze'
                                            )}
                                        </Button>
                                    )}
                                </Stack>
                                {isAnalyzing && streamStatus && (
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={0.75}
                                    >
                                        <CircularProgress size={12} />
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {streamStatus}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                            <AnalysisDisplay
                                isStreaming={isAnalyzing}
                                rawText={analysisText}
                            />
                        </Stack>
                    </Paper>

                    {/* Follow-up messages */}
                    {messages.length > 0 && (
                        <Stack spacing={1.5}>
                            <Divider>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    {t('aiAssist.followUp', 'Follow-up')}
                                </Typography>
                            </Divider>
                            {messages.map((msg) => (
                                <Paper
                                    key={msg.id}
                                    sx={{
                                        p: 1.5,
                                        bgcolor:
                                            msg.role === 'user'
                                                ? 'action.hover'
                                                : 'background.paper'
                                    }}
                                    variant="outlined"
                                >
                                    <Typography
                                        color="text.secondary"
                                        fontWeight={700}
                                        gutterBottom
                                        variant="caption"
                                    >
                                        {msg.role === 'user'
                                            ? t('aiAssist.roleYou', 'You')
                                            : t(
                                                  'aiAssist.roleAssistant',
                                                  'Assistant'
                                              )}
                                    </Typography>
                                    <AnalysisDisplay
                                        isStreaming={false}
                                        rawText={msg.content || ''}
                                    />
                                </Paper>
                            ))}
                            {isSendingFollowUp && (
                                <Paper sx={{ p: 1.5 }} variant="outlined">
                                    <Typography
                                        color="text.secondary"
                                        fontWeight={700}
                                        gutterBottom
                                        variant="caption"
                                    >
                                        {t(
                                            'aiAssist.roleAssistant',
                                            'Assistant'
                                        )}
                                    </Typography>
                                    {streamingFollowUp ? (
                                        <AnalysisDisplay
                                            isStreaming
                                            rawText={streamingFollowUp}
                                        />
                                    ) : (
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={0.75}
                                        >
                                            <CircularProgress size={12} />
                                            <Typography
                                                color="text.secondary"
                                                variant="caption"
                                            >
                                                {t(
                                                    'aiAssist.statusThinking',
                                                    'Thinking...'
                                                )}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Paper>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Box>

            {/* Follow-up composer */}
            {conversationId && (
                <Box
                    sx={{
                        borderColor: 'divider',
                        borderTop: 1,
                        flexShrink: 0,
                        p: 1.5
                    }}
                >
                    <TextField
                        disabled={isSendingFollowUp || isAnalyzing}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        color="primary"
                                        disabled={
                                            isSendingFollowUp ||
                                            isAnalyzing ||
                                            !followUpInput.trim()
                                        }
                                        onClick={() => void sendFollowUp()}
                                        size="small"
                                    >
                                        {isSendingFollowUp ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <SendIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        maxRows={4}
                        minRows={1}
                        multiline
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t(
                            'aiAssist.followUpPlaceholder',
                            'Ask a follow-up question about this student...'
                        )}
                        size="small"
                        value={followUpInput}
                    />
                </Box>
            )}
        </Box>
    );
};
