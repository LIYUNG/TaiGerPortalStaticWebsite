import { useEffect, useState, JSX } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import { getAIAssistOverview, type AIAssistOverviewItem } from '@/api';
import {
    StudentHealthCard,
    PortfolioStudent,
    PortfolioSignal
} from './StudentHealthCard';

interface PortfolioViewProps {
    onAnalyzeStudent: (student: PortfolioStudent) => void;
    onChatPrompt: (prompt: string) => void;
    onOpenChat: () => void;
}

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2 };

const HEALTH_FROM_URGENCY: Record<string, string> = {
    critical: 'Critical',
    high: 'High Risk',
    medium: 'Medium Risk'
};

const buildPortfolioStudents = (
    buckets: Record<string, { count: number; items: AIAssistOverviewItem[] }>
): PortfolioStudent[] => {
    const byId = new Map<string, PortfolioStudent>();

    const addSignal = (
        item: AIAssistOverviewItem,
        signal: PortfolioSignal
    ): void => {
        const id = item.student?.id;
        if (!id) return;
        if (!byId.has(id)) {
            byId.set(id, {
                id,
                name: item.student?.name ?? id,
                chineseName: item.student?.chineseName,
                signals: [],
                overallHealth: 'Medium Risk'
            });
        }
        byId.get(id)!.signals.push(signal);
    };

    (buckets.upcomingDeadlines?.items ?? []).forEach((item) => {
        const days = item.daysUntil ?? 999;
        const urgency = days < 7 ? 'critical' : 'high';
        const programLabel = item.program
            ? `${item.program.school ?? ''} ${item.program.name ?? ''}`.trim()
            : '';
        addSignal(item, {
            type: 'deadline',
            urgency,
            label: `Deadline in ${days} day${days === 1 ? '' : 's'}${programLabel ? ` · ${programLabel}` : ''}`
        });
    });

    (buckets.threadsWaitingOnTeam?.items ?? []).forEach((item) => {
        const stalled = item.stalledDays ?? null;
        const fileLabel = item.fileType ? ` · ${item.fileType}` : '';
        addSignal(item, {
            type: 'thread_waiting',
            // A thread the team has sat on for over a week is a real bottleneck.
            urgency: stalled !== null && stalled >= 7 ? 'high' : 'medium',
            label:
                stalled !== null
                    ? `Thread stalled ${stalled}d${fileLabel}`
                    : `Thread waiting on team${fileLabel}`
        });
    });

    (buckets.communicationGaps?.items ?? []).forEach((item) => {
        const days = item.lastContactDays ?? null;
        addSignal(item, {
            // No contact for 6+ weeks is a strong drop-off signal → escalate.
            urgency: days === null || days >= 42 ? 'critical' : 'high',
            type: 'comm_gap',
            label:
                days === null
                    ? 'No messages logged yet'
                    : `No reply in ${days}d`
        });
    });

    (buckets.admittedNotConfirmed?.items ?? []).forEach((item) => {
        const programLabel = item.program
            ? `${item.program.school ?? ''} ${item.program.name ?? ''}`.trim()
            : '';
        addSignal(item, {
            type: 'admitted_unconfirmed',
            urgency: 'medium',
            label: `Admitted — enrolment not confirmed${programLabel ? ` · ${programLabel}` : ''}`
        });
    });

    (buckets.missingBaseDocuments?.items ?? []).forEach((item) => {
        const docs = (item.missingDocuments ?? []).slice(0, 2).join(', ');
        addSignal(item, {
            type: 'missing_docs',
            urgency: 'medium',
            label: `Missing docs${docs ? `: ${docs}` : ''}`
        });
    });

    const students = Array.from(byId.values()).map((student) => {
        const sorted = [...student.signals].sort(
            (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        );
        const topUrgency = sorted[0]?.urgency ?? 'medium';
        return {
            ...student,
            signals: sorted,
            overallHealth: HEALTH_FROM_URGENCY[topUrgency] ?? 'Medium Risk'
        };
    });

    return students.sort((a, b) => {
        const aTop = URGENCY_ORDER[a.signals[0]?.urgency ?? 'medium'];
        const bTop = URGENCY_ORDER[b.signals[0]?.urgency ?? 'medium'];
        return aTop - bTop;
    });
};

export const PortfolioView = ({
    onAnalyzeStudent,
    onChatPrompt,
    onOpenChat
}: PortfolioViewProps): JSX.Element => {
    const [students, setStudents] = useState<PortfolioStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        let active = true;
        getAIAssistOverview()
            .then((res) => {
                if (!active) return;
                setStudents(buildPortfolioStudents(res?.data?.buckets ?? {}));
                setHasError(false);
            })
            .catch(() => {
                if (active) setHasError(true);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleChatSubmit = (): void => {
        const prompt = chatInput.trim();
        if (!prompt) return;
        onChatPrompt(prompt);
    };

    return (
        <Stack spacing={3} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            <Stack spacing={1}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                >
                    <Typography fontWeight={700} variant="h6">
                        Portfolio — needs attention
                    </Typography>
                    <Button
                        onClick={onOpenChat}
                        size="small"
                        startIcon={<ChatIcon fontSize="small" />}
                        variant="outlined"
                    >
                        Chat / History
                    </Button>
                </Stack>
                <Typography color="text.secondary" variant="body2">
                    Students with active risks, upcoming deadlines, or stalled
                    threads. Click any card to run a deep-dive analysis.
                </Typography>
                <TextField
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SendIcon
                                    fontSize="small"
                                    onClick={handleChatSubmit}
                                    sx={{
                                        cursor: 'pointer',
                                        color: chatInput.trim()
                                            ? 'primary.main'
                                            : 'action.disabled'
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                        }
                    }}
                    placeholder="Ask about your portfolio... (e.g. What needs my attention today?)"
                    size="small"
                    value={chatInput}
                    sx={{ mt: 1 }}
                />
            </Stack>

            {isLoading ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ minHeight: 200 }}
                >
                    <CircularProgress size={24} />
                    <Typography color="text.secondary" variant="body2">
                        Loading portfolio...
                    </Typography>
                </Stack>
            ) : hasError ? (
                <Alert severity="info" variant="outlined">
                    Could not load portfolio data.
                </Alert>
            ) : students.length === 0 ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ minHeight: 200 }}
                >
                    <Typography
                        color="text.secondary"
                        fontWeight={600}
                        variant="body1"
                    >
                        ✓ All students on track
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        No urgent items detected. Use the search above to ask
                        about specific students.
                    </Typography>
                </Stack>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        }
                    }}
                >
                    {students.map((student) => (
                        <StudentHealthCard
                            key={student.id}
                            onAnalyze={onAnalyzeStudent}
                            student={student}
                        />
                    ))}
                </Box>
            )}
        </Stack>
    );
};
