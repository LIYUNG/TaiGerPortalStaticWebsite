import { JSX, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';

import {
    getAIAssistOverview,
    AIAssistOverviewItem,
    AIAssistOverviewResponse
} from '../../api/apis';

type TranslateFn = (
    key: string,
    fallback: string,
    options?: Record<string, unknown>
) => string;

interface OverviewHomeProps {
    onSeedPrompt: (prompt: string) => void;
    translate?: TranslateFn;
}

type OverviewData = AIAssistOverviewResponse['data'];

interface BucketMeta {
    title: string;
    emptyText: string;
    prompt: string;
}

const BUCKET_META: Record<string, BucketMeta> = {
    upcomingDeadlines: {
        title: 'Upcoming deadlines',
        emptyText: 'No application deadlines in the window.',
        prompt: 'What application deadlines are coming up in the next 30 days across my students?'
    },
    threadsWaitingOnTeam: {
        title: 'Waiting on your team',
        emptyText: 'No document threads are waiting on the team.',
        prompt: 'Which document threads are currently waiting on me or my team to respond?'
    },
    admittedNotConfirmed: {
        title: 'Admitted, not confirmed',
        emptyText: 'No admitted students pending enrolment confirmation.',
        prompt: 'Which admitted students have not confirmed their enrolment yet?'
    },
    missingBaseDocuments: {
        title: 'Missing base documents',
        emptyText: 'No students are missing required base documents.',
        prompt: 'Which of my students are missing required base documents?'
    }
};

const PRESETS: { label: string; prompt: string }[] = [
    {
        label: 'What needs my attention this week?',
        prompt: 'What needs my attention this week across all my students? Summarize the most urgent items.'
    },
    {
        label: 'Deadlines in the next 14 days',
        prompt: 'Which application deadlines are due in the next 14 days?'
    },
    {
        label: 'Review a document',
        prompt: 'Help me review a student document. Ask me which student and which document (CV, essay, motivation letter, or recommendation letter), then read it and give feedback against the program requirements.'
    }
];

const describeItem = (item: AIAssistOverviewItem): string => {
    const studentName = item.student?.name || 'Unknown student';
    const program = item.program
        ? [item.program.school, item.program.name].filter(Boolean).join(' — ')
        : '';
    const parts: string[] = [studentName];

    if (program) {
        parts.push(program);
    }
    if (typeof item.daysUntil === 'number') {
        parts.push(
            item.daysUntil <= 0
                ? 'due today'
                : `in ${item.daysUntil} day${item.daysUntil === 1 ? '' : 's'}`
        );
    } else if (item.deadline) {
        parts.push(item.deadline);
    }
    if (item.fileType) {
        parts.push(item.fileType);
    }
    if (item.missingDocuments?.length) {
        parts.push(item.missingDocuments.join(', '));
    }

    return parts.join(' · ');
};

const OverviewHome = ({
    onSeedPrompt,
    translate
}: OverviewHomeProps): JSX.Element => {
    const t: TranslateFn = translate || ((_key, fallback) => fallback);
    const [data, setData] = useState<OverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let active = true;

        getAIAssistOverview()
            .then((response) => {
                if (!active) {
                    return;
                }
                setData(response?.data ?? null);
                setHasError(false);
            })
            .catch(() => {
                if (active) {
                    setHasError(true);
                }
            })
            .finally(() => {
                if (active) {
                    setIsLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const bucketOrder =
        data?.emphasis && data.emphasis.length
            ? [
                  ...data.emphasis,
                  ...Object.keys(data.buckets || {}).filter(
                      (key) => !data.emphasis.includes(key)
                  )
              ]
            : Object.keys(data?.buckets || {});

    return (
        <Stack spacing={2} data-testid="ai-assist-overview-home">
            <Box>
                <Typography fontWeight={700} variant="subtitle1">
                    {t('aiAssist.overviewTitle', 'Your overview')}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'aiAssist.overviewSubtitle',
                        'What needs your attention across your students. Pick a quick action or click any item to ask about it.'
                    )}
                </Typography>
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={1}>
                {PRESETS.map((preset) => (
                    <Chip
                        key={preset.label}
                        clickable
                        color="primary"
                        label={preset.label}
                        onClick={() => onSeedPrompt(preset.prompt)}
                        variant="outlined"
                    />
                ))}
            </Stack>

            {isLoading ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ minHeight: 120 }}
                >
                    <CircularProgress size={22} />
                    <Typography color="text.secondary" variant="body2">
                        {t(
                            'aiAssist.overviewLoading',
                            'Loading your overview...'
                        )}
                    </Typography>
                </Stack>
            ) : hasError ? (
                <Alert severity="info" variant="outlined">
                    {t(
                        'aiAssist.overviewError',
                        'Could not load your overview right now.'
                    )}
                </Alert>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: '1fr 1fr'
                        }
                    }}
                >
                    {bucketOrder.map((key) => {
                        const bucket = data?.buckets?.[key];
                        const meta = BUCKET_META[key];
                        if (!bucket || !meta) {
                            return null;
                        }

                        return (
                            <Paper key={key} sx={{ p: 1.5 }} variant="outlined">
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    justifyContent="space-between"
                                    sx={{ mb: 1 }}
                                >
                                    <Typography
                                        fontWeight={600}
                                        variant="subtitle2"
                                    >
                                        {meta.title}
                                    </Typography>
                                    <Chip
                                        color={
                                            bucket.count > 0
                                                ? 'warning'
                                                : 'default'
                                        }
                                        label={bucket.count}
                                        size="small"
                                    />
                                </Stack>

                                {bucket.items.length === 0 ? (
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {meta.emptyText}
                                    </Typography>
                                ) : (
                                    <Stack spacing={0.5} sx={{ mb: 1 }}>
                                        {bucket.items
                                            .slice(0, 5)
                                            .map((item, index) => (
                                                <Typography
                                                    key={`${key}-${index}`}
                                                    color="text.secondary"
                                                    variant="body2"
                                                >
                                                    • {describeItem(item)}
                                                </Typography>
                                            ))}
                                    </Stack>
                                )}

                                <Button
                                    onClick={() => onSeedPrompt(meta.prompt)}
                                    size="small"
                                    variant="text"
                                >
                                    {t(
                                        'aiAssist.askAboutThis',
                                        'Ask about this'
                                    )}
                                </Button>
                            </Paper>
                        );
                    })}
                </Box>
            )}
        </Stack>
    );
};

export default OverviewHome;
