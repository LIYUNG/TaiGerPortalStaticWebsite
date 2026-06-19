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
import { useTranslation } from 'react-i18next';
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

type TFn = (
    key: string,
    fallback: string,
    opts?: Record<string, unknown>
) => string;

const buildPortfolioStudents = (
    buckets: Record<string, { count: number; items: AIAssistOverviewItem[] }>,
    t: TFn
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
                overallHealth: 'Medium Risk',
                joinedAt: item.student?.joinedAt ?? null,
                applyingProgramCount: item.student?.applyingProgramCount ?? 0,
                offerCount: item.student?.offerCount ?? 0,
                rejectCount: item.student?.rejectCount ?? 0,
                hasEditors: item.student?.hasEditors ?? true,
                applicationTerms: item.student?.applicationTerms ?? []
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
        const base = t(
            'aiAssist.signalDeadline',
            'Deadline in {{count}} days',
            { count: days }
        );
        addSignal(item, {
            type: 'deadline',
            urgency,
            label: programLabel ? `${base} · ${programLabel}` : base
        });
    });

    (buckets.threadsWaitingOnTeam?.items ?? []).forEach((item) => {
        const stalled = item.stalledDays ?? 0;
        const urgency =
            stalled >= 14 ? 'critical' : stalled >= 7 ? 'high' : 'medium';
        const fileLabel = item.fileType ? ` · ${item.fileType}` : '';
        const base = t(
            'aiAssist.signalThreadStalled',
            'Reply needed {{count}}d',
            { count: stalled }
        );
        addSignal(item, {
            type: 'thread_waiting',
            urgency,
            label: `${base}${fileLabel}`
        });
    });

    (buckets.communicationGaps?.items ?? []).forEach((item) => {
        const days = item.lastContactDays ?? 0;
        const urgency = days >= 14 ? 'critical' : days >= 7 ? 'high' : 'medium';
        addSignal(item, {
            urgency,
            type: 'comm_gap',
            label: t(
                'aiAssist.signalStudentWaiting',
                'Student waiting {{count}}d for reply',
                { count: days }
            )
        });
    });

    (buckets.admittedNotConfirmed?.items ?? []).forEach((item) => {
        const programLabel = item.program
            ? `${item.program.school ?? ''} ${item.program.name ?? ''}`.trim()
            : '';
        const base = t(
            'aiAssist.signalAdmitted',
            'Admitted — enrolment not confirmed'
        );
        addSignal(item, {
            type: 'admitted_unconfirmed',
            urgency: 'medium',
            label: programLabel ? `${base} · ${programLabel}` : base
        });
    });

    (buckets.missingBaseDocuments?.items ?? []).forEach((item) => {
        const docs = (item.missingDocuments ?? []).slice(0, 2).join(', ');
        const base = t('aiAssist.signalMissingDocs', 'Missing docs');
        addSignal(item, {
            type: 'missing_docs',
            urgency: 'medium',
            label: docs ? `${base}: ${docs}` : base
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
    const { t } = useTranslation();
    const [students, setStudents] = useState<PortfolioStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        let active = true;
        getAIAssistOverview()
            .then((res) => {
                if (!active) return;
                setStudents(
                    buildPortfolioStudents(res?.data?.buckets ?? {}, t as TFn)
                );
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
                        {t(
                            'aiAssist.portfolioHeading',
                            'Portfolio — needs attention'
                        )}
                    </Typography>
                    <Button
                        onClick={onOpenChat}
                        size="small"
                        startIcon={<ChatIcon fontSize="small" />}
                        variant="outlined"
                    >
                        {t('aiAssist.chatHistory', 'Chat / History')}
                    </Button>
                </Stack>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'aiAssist.portfolioSubtitle',
                        'Students with active risks, upcoming deadlines, or stalled threads. Click any card to run a deep-dive analysis.'
                    )}
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
                    placeholder={t(
                        'aiAssist.portfolioChatPlaceholder',
                        'Ask about your portfolio... (e.g. What needs my attention today?)'
                    )}
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
                        {t('aiAssist.portfolioLoading', 'Loading portfolio...')}
                    </Typography>
                </Stack>
            ) : hasError ? (
                <Alert severity="info" variant="outlined">
                    {t(
                        'aiAssist.portfolioError',
                        'Could not load portfolio data.'
                    )}
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
                        {t(
                            'aiAssist.portfolioAllOnTrack',
                            '✓ All students on track'
                        )}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t(
                            'aiAssist.portfolioNoUrgent',
                            'No urgent items detected. Use the search above to ask about specific students.'
                        )}
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
