import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SendIcon from '@mui/icons-material/Send';

import {
    createAIAssistConversation,
    getAIAssistConversation,
    getAIAssistConversations,
    postAIAssistMessage
} from '@/api';
import type {
    AIAssistConversation,
    AIAssistMessage,
    AIAssistToolCall
} from '@/api/types';

const promptSuggestions = [
    'Summarize a student',
    'Find application risks',
    'Check latest messages',
    'Review open tasks'
];

const defaultPrompt = 'Summarize a student';

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

const AIAssistPage = (): JSX.Element => {
    const [conversations, setConversations] = useState<AIAssistConversation[]>(
        []
    );
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [input, setInput] = useState(defaultPrompt);
    const [messages, setMessages] = useState<AIAssistMessage[]>([]);
    const [trace, setTrace] = useState<AIAssistToolCall[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConversation = useCallback(
        async (nextConversationId: string): Promise<void> => {
            setConversationId(nextConversationId);
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

    useEffect(() => {
        const loadConversations = async (): Promise<void> => {
            setIsLoadingConversations(true);
            setError(null);

            try {
                const response = await getAIAssistConversations();
                setConversations(response.data);

                if (response.data.length > 0) {
                    await loadConversation(response.data[0].id);
                } else {
                    setConversationId(null);
                    setMessages([]);
                    setTrace([]);
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
    }, [loadConversation]);

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
                (item) => item.id === activeConversationId
            );

            if (!activeConversation) {
                return previous;
            }

            return [
                { ...activeConversation, updatedAt },
                ...previous.filter((item) => item.id !== activeConversationId)
            ];
        });
    };

    const ensureConversation = async (): Promise<string> => {
        if (conversationId) {
            return conversationId;
        }

        const response = await createAIAssistConversation();
        const conversation = response.data;
        const nextConversationId = conversation.id;
        addConversationToTop(conversation);
        setConversationId(nextConversationId);
        setMessages([]);
        setTrace([]);
        return nextConversationId;
    };

    const handleNewConversation = async (): Promise<void> => {
        setError(null);

        try {
            const response = await createAIAssistConversation();
            const conversation = response.data;
            addConversationToTop(conversation);
            setConversationId(conversation.id);
            setMessages([]);
            setTrace([]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create AI Assist conversation'
            );
        }
    };

    const handleSubmit = async (): Promise<void> => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isSending) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const activeConversationId = await ensureConversation();
            const response = await postAIAssistMessage(activeConversationId, {
                message: trimmedInput
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
            setTrace(responseTrace || []);
            touchConversation(activeConversationId);
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

    return (
        <Box data-testid="ai-assist-page">
            <Stack spacing={2.5}>
                <Box>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <SmartToyOutlinedIcon color="primary" />
                        <Typography component="h1" variant="h5">
                            TaiGer AI
                        </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                        Ask about student operations data you can access.
                    </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Grid container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Paper sx={{ p: 2 }} variant="outlined">
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
                                <Stack spacing={1.5}>
                                    <Typography variant="subtitle1">
                                        Start with a question
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        gap={1}
                                    >
                                        {promptSuggestions.map((prompt) => (
                                            <Chip
                                                key={prompt}
                                                label={prompt}
                                                onClick={() => {
                                                    setInput(prompt);
                                                }}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack spacing={1.5}>
                                    {messages.map((message) => (
                                        <Paper
                                            key={message.id}
                                            sx={{
                                                p: 2,
                                                bgcolor:
                                                    message.role === 'assistant'
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
                                                {message.role === 'assistant'
                                                    ? 'Assistant'
                                                    : 'You'}
                                            </Typography>
                                            <Typography
                                                sx={{ whiteSpace: 'pre-wrap' }}
                                                variant="body2"
                                            >
                                                {message.content}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}

                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={1.5}>
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
                                                <CircularProgress size={16} />
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
                        </Paper>
                    </Grid>
                    <Grid item md={4} xs={12}>
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
                                    onClick={() => {
                                        void handleNewConversation();
                                    }}
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
                                    {conversations.map((conversation) => (
                                        <Button
                                            key={conversation.id}
                                            aria-pressed={
                                                conversation.id ===
                                                conversationId
                                            }
                                            disabled={isLoadingConversation}
                                            fullWidth
                                            onClick={() => {
                                                if (
                                                    conversation.id !==
                                                    conversationId
                                                ) {
                                                    void loadConversation(
                                                        conversation.id
                                                    );
                                                }
                                            }}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                textTransform: 'none'
                                            }}
                                            variant={
                                                conversation.id ===
                                                conversationId
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                        >
                                            {conversation.title}
                                        </Button>
                                    ))}
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
                                    {trace.map((toolCall) => (
                                        <Paper
                                            key={toolCall.id}
                                            sx={{ p: 1.5 }}
                                            variant="outlined"
                                        >
                                            <Typography
                                                fontWeight={700}
                                                variant="body2"
                                            >
                                                {toolCall.toolName}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="caption"
                                            >
                                                {toolCall.status}
                                                {toolCall.durationMs != null
                                                    ? ` · ${toolCall.durationMs}ms`
                                                    : ''}
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
                                                    arguments:
                                                        toolCall.arguments,
                                                    result: toolCall.result,
                                                    error: toolCall.errorMessage
                                                })}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
};

export default AIAssistPage;
