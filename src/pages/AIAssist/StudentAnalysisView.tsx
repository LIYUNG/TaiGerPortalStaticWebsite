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
import {
    streamAIAssistFirstMessage,
    streamAIAssistMessage
} from '@/api';
import DEMO from '@/store/constant';
import type {
    AIAssistConversation,
    AIAssistMessage,
    AIAssistStreamProgressEvent,
    AIAssistToolCall
} from '@/api/types';
import { AnalysisDisplay } from './AnalysisDisplay';
import type { PortfolioStudent } from './StudentHealthCard';

interface StudentAnalysisViewProps {
    student: PortfolioStudent;
    onBack: () => void;
    onOpenChat?: () => void;
    onConversationCreated?: (convId: string, conversation: AIAssistConversation) => void;
}

const buildAnalysisPrompt = (student: PortfolioStudent): string => {
    const signals = student.signals.map((s) => s.label).join('; ');
    return (
        `Perform a full deep-dive analysis of student @${student.name} (id: ${student.id}).\n\n` +
        `Known signals from portfolio: ${signals || 'none'}.\n\n` +
        `Gather all available data (overview, communications, document threads, open threads). ` +
        `Identify all blockers with root causes, assess overall application health, and provide prioritized next actions.`
    );
};

const resolveStatus = (event: AIAssistStreamProgressEvent): string | null => {
    if (event.type === 'thinking') return 'Thinking...';
    if (event.type === 'tool_start') return `Fetching: ${event.toolName ?? 'data'}...`;
    if (event.type === 'tool_done') return 'Thinking...';
    if (event.type === 'status' && event.phase === 'completed') return null;
    return null;
};

export const StudentAnalysisView = ({
    student,
    onBack,
    onOpenChat,
    onConversationCreated
}: StudentAnalysisViewProps): JSX.Element => {
    const { i18n } = useTranslation();
    const preferredLanguage = i18n.language || 'zh-TW';
    const [analysisText, setAnalysisText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamStatus, setStreamStatus] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [followUpInput, setFollowUpInput] = useState('');
    const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
    const [messages, setMessages] = useState<AIAssistMessage[]>([]);
    const [trace, setTrace] = useState<AIAssistToolCall[]>([]);
    const hasRunRef = useRef(false);
    const profileUrl = DEMO.STUDENT_DATABASE_STUDENTID_LINK(student.id, DEMO.PROFILE_HASH);

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
                        mentionedStudent: { id: student.id, displayName: student.name },
                        analysisMode: true
                    }
                },
                {
                    onProgress: (event) => {
                        const status = resolveStatus(event);
                        if (status !== undefined) setStreamStatus(status);
                    },
                    onToken: (text) => {
                        setAnalysisText((prev) => prev + text);
                    },
                    onError: () => {
                        setError('Analysis failed. Please try again.');
                        setIsAnalyzing(false);
                    }
                }
            );

            if (!response?.data) {
                throw new Error('No response data');
            }

            const { conversation, assistantMessage, trace: responseTrace } = response.data;
            setConversationId(conversation.id);
            setAnalysisText(assistantMessage.content || analysisText);
            setTrace(responseTrace || []);
            onConversationCreated?.(conversation.id, conversation);
        } catch {
            setError('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
            setStreamStatus(null);
        }
    }, [student, onConversationCreated]);

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;
        void runAnalysis();
    }, [runAnalysis]);

    const sendFollowUp = useCallback(async (): Promise<void> => {
        const text = followUpInput.trim();
        if (!text || isSendingFollowUp || !conversationId) return;

        setIsSendingFollowUp(true);
        setFollowUpInput('');

        const userMsg: AIAssistMessage = { id: String(Date.now()), role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);
        let assistantContent = '';

        try {
            const response = await streamAIAssistMessage(
                conversationId,
                { message: text, preferredLanguage },
                {
                    onToken: (chunk) => {
                        assistantContent += chunk;
                    },
                    onError: () => {
                        setError('Follow-up failed.');
                    }
                }
            );

            if (response?.data) {
                const { assistantMessage, trace: nextTrace } = response.data;
                setMessages((prev) => [...prev, assistantMessage]);
                setTrace((prev) => [...prev, ...(nextTrace || [])]);
            }
        } catch {
            setError('Follow-up failed.');
        } finally {
            setIsSendingFollowUp(false);
        }
    }, [followUpInput, isSendingFollowUp, conversationId]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            void sendFollowUp();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
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
                    {student.name}
                </Typography>
                {student.signals.slice(0, 2).map((s, i) => (
                    <Chip
                        key={i}
                        color={s.urgency === 'critical' ? 'error' : s.urgency === 'high' ? 'warning' : 'default'}
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
                        Chat / History
                    </Button>
                )}
                <Button
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    href={profileUrl}
                    size="small"
                    target="_blank"
                    variant="outlined"
                >
                    Profile
                </Button>
            </Stack>

            {/* Main content */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {/* AI Analysis */}
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={2}>
                            <Stack alignItems="center" direction="row" justifyContent="space-between">
                                <Typography fontWeight={700} variant="subtitle2">
                                    AI Analysis
                                </Typography>
                                {isAnalyzing && streamStatus && (
                                    <Stack alignItems="center" direction="row" spacing={0.75}>
                                        <CircularProgress size={12} />
                                        <Typography color="text.secondary" variant="caption">
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
                                <Typography color="text.secondary" variant="caption">
                                    Follow-up
                                </Typography>
                            </Divider>
                            {messages.map((msg) => (
                                <Paper
                                    key={msg.id}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: msg.role === 'user' ? 'action.hover' : 'background.paper'
                                    }}
                                    variant="outlined"
                                >
                                    <Typography
                                        color="text.secondary"
                                        fontWeight={700}
                                        gutterBottom
                                        variant="caption"
                                    >
                                        {msg.role === 'user' ? 'You' : 'Assistant'}
                                    </Typography>
                                    <AnalysisDisplay
                                        isStreaming={false}
                                        rawText={msg.content || ''}
                                    />
                                </Paper>
                            ))}
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
                                        disabled={isSendingFollowUp || isAnalyzing || !followUpInput.trim()}
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
                        placeholder="Ask a follow-up question about this student..."
                        size="small"
                        value={followUpInput}
                    />
                </Box>
            )}
        </Box>
    );
};
