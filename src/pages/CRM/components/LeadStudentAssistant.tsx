import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SendIcon from '@mui/icons-material/Send';

import { postChatbotMessage } from '@/api';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

interface LeadStudentAssistantProps {
    leadName?: string;
    studentId?: string;
}

const defaultPrompt =
    'Summarize this student: recent messages, application status, admitted programs, open tasks, and risks.';

const LeadStudentAssistant = ({
    leadName,
    studentId
}: LeadStudentAssistantProps): JSX.Element => {
    const [input, setInput] = useState(defaultPrompt);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (): Promise<void> => {
        const trimmedInput = input.trim();
        if (!trimmedInput || !studentId || isSending) {
            return;
        }

        setError(null);
        setIsSending(true);
        setMessages((previous) => [
            ...previous,
            { role: 'user', content: trimmedInput }
        ]);

        try {
            const response = await postChatbotMessage({
                message: trimmedInput,
                studentId,
                maxMessagePages: 5
            });

            setMessages((previous) => [
                ...previous,
                {
                    role: 'assistant',
                    content:
                        response.data.answer ||
                        'No answer was returned by the assistant.'
                }
            ]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to send message'
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Paper sx={{ mb: 2.5, p: 3 }} variant="outlined">
            <Stack spacing={2}>
                <Box>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <SmartToyOutlinedIcon color="primary" />
                        <Typography component="h2" variant="h6">
                            Student AI Assistant
                        </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                        {studentId
                            ? `Using the portal student linked to this CRM lead${leadName ? `: ${leadName}` : ''}.`
                            : 'This CRM lead is not linked to a portal student yet.'}
                    </Typography>
                </Box>

                {!studentId ? (
                    <Alert severity="info">
                        Create or link a portal student first, then the
                        assistant can read that student's portal data.
                    </Alert>
                ) : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                    disabled={isSending || !studentId}
                    fullWidth
                    label="Ask about this student"
                    minRows={3}
                    multiline
                    onChange={(event) => {
                        setInput(event.target.value);
                    }}
                    value={input}
                />

                <Stack direction="row" justifyContent="flex-end">
                    <Button
                        disabled={isSending || !studentId || !input.trim()}
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

                {messages.length > 0 ? (
                    <Stack spacing={1.5}>
                        {messages.map((message, index) => (
                            <Paper
                                key={`${message.role}-${index}`}
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
                ) : null}
            </Stack>
        </Paper>
    );
};

export default LeadStudentAssistant;
