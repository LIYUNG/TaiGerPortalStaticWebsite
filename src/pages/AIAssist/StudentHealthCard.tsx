import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { HealthBadge } from './components/HealthBadge';

export type PortfolioSignal = {
    type:
        | 'deadline'
        | 'thread_waiting'
        | 'comm_gap'
        | 'admitted_unconfirmed'
        | 'missing_docs';
    urgency: 'critical' | 'high' | 'medium';
    label: string;
};

export type PortfolioStudent = {
    id: string;
    name: string;
    chineseName?: string;
    signals: PortfolioSignal[];
    overallHealth: string;
    joinedAt?: string | null;
    applyingProgramCount?: number;
    offerCount?: number;
    rejectCount?: number;
    hasEditors?: boolean;
    applicationTerms?: string[];
};

interface StudentHealthCardProps {
    student: PortfolioStudent;
    onAnalyze: (student: PortfolioStudent) => void;
}

const formatJoinMonth = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en', { year: 'numeric', month: 'short' });
};

export const StudentHealthCard = ({
    student,
    onAnalyze
}: StudentHealthCardProps): JSX.Element => {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language.startsWith('zh');
    const displayName =
        isZh && student.chineseName ? student.chineseName : student.name;
    const topSignal = student.signals[0];
    const joinLabel = formatJoinMonth(student.joinedAt);
    const noEditor = student.hasEditors === false;

    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                cursor: 'pointer',
                minWidth: 0,
                overflow: 'hidden',
                transition: 'box-shadow 0.15s',
                '&:hover': { boxShadow: 4 }
            }}
            variant="outlined"
            onClick={() => onAnalyze(student)}
        >
            <Stack alignItems="flex-start" spacing={0.5}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                >
                    <Typography
                        component={RouterLink}
                        fontWeight={700}
                        variant="body1"
                        to={`/student-database/${student.id}#profile`}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        sx={{
                            color: 'inherit',
                            overflow: 'hidden',
                            textDecoration: 'none',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '60%',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {displayName}
                    </Typography>
                    <HealthBadge health={student.overallHealth} preliminary />
                </Stack>

                {/* Stats row */}
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    gap={0.75}
                    sx={{ width: '100%' }}
                >
                    {student.applicationTerms &&
                        student.applicationTerms.length > 0 && (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {student.applicationTerms.join(' · ')}
                            </Typography>
                        )}
                    {(student.applyingProgramCount ?? 0) > 0 && (
                        <Typography color="text.secondary" variant="caption">
                            {t('aiAssist.cardPrograms', '{{count}} programs', {
                                count: student.applyingProgramCount
                            })}
                        </Typography>
                    )}
                    {(student.offerCount ?? 0) > 0 && (
                        <Typography color="success.main" variant="caption">
                            {t('aiAssist.cardOffers', '{{count}} offer', {
                                count: student.offerCount
                            })}
                        </Typography>
                    )}
                    {(student.rejectCount ?? 0) > 0 && (
                        <Typography color="error.main" variant="caption">
                            {t('aiAssist.cardRejected', '{{count}} rejected', {
                                count: student.rejectCount
                            })}
                        </Typography>
                    )}
                    {joinLabel && (
                        <Typography
                            color="text.disabled"
                            sx={{ ml: 'auto' }}
                            variant="caption"
                        >
                            {joinLabel}
                        </Typography>
                    )}
                </Stack>
            </Stack>

            {noEditor && (
                <Chip
                    color="warning"
                    label={t('aiAssist.cardNoEditor', 'No editor assigned')}
                    size="small"
                    sx={{ borderRadius: 0.75, alignSelf: 'flex-start' }}
                    variant="outlined"
                />
            )}

            {topSignal && (
                <Box>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                        fontWeight={600}
                        sx={{ mb: 0.5, display: 'block' }}
                    >
                        {t('aiAssist.topPriority', 'Top priority')}
                    </Typography>
                    <Chip
                        color={
                            topSignal.urgency === 'critical'
                                ? 'error'
                                : topSignal.urgency === 'high'
                                  ? 'warning'
                                  : 'default'
                        }
                        label={topSignal.label}
                        size="small"
                        sx={{
                            borderRadius: 0.75,
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }}
                        variant="outlined"
                    />
                </Box>
            )}

            {student.signals.length > 1 && (
                <Typography color="text.disabled" variant="caption">
                    {t('aiAssist.moreSignals', '+{{count}} more signal(s)', {
                        count: student.signals.length - 1
                    })}
                </Typography>
            )}

            <Button
                fullWidth
                onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze(student);
                }}
                size="small"
                variant="contained"
                sx={{ mt: 'auto' }}
            >
                {t('aiAssist.analyze', 'Analyze')}
            </Button>
        </Paper>
    );
};
