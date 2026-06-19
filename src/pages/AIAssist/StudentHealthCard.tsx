import { Chip, Paper, Stack, Typography } from '@mui/material';
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
    const joinLabel = formatJoinMonth(student.joinedAt);
    const noEditor = student.hasEditors === false;

    const termLabel =
        student.applicationTerms && student.applicationTerms.length > 0
            ? student.applicationTerms.join(' · ')
            : null;

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
            {/* Name + health */}
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={0.5}
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
                        flexShrink: 1,
                        minWidth: 0,
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    {displayName}
                </Typography>
                <HealthBadge health={student.overallHealth} preliminary />
            </Stack>

            {/* Application terms + join date on separate lines for clarity */}
            <Stack spacing={0.25}>
                {termLabel && (
                    <Typography color="text.secondary" variant="caption">
                        {termLabel}
                    </Typography>
                )}
                {joinLabel && (
                    <Typography color="text.disabled" variant="caption">
                        {isZh ? `加入 ${joinLabel}` : `Joined ${joinLabel}`}
                    </Typography>
                )}
            </Stack>

            {/* Outcome stats */}
            <Stack direction="row" flexWrap="wrap" gap={1}>
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

            {(() => {
                const PER_TYPE = 2;
                const TYPE_LABEL: Record<string, string> = {
                    deadline: isZh ? '個截止日' : ' more deadline(s)',
                    thread_waiting: isZh ? '個待回覆文件' : ' more thread(s)',
                    comm_gap: isZh ? '個未回訊息' : ' more message gap(s)',
                    admitted_unconfirmed: isZh
                        ? '個待確認錄取'
                        : ' more admission(s)',
                    missing_docs: isZh ? '個缺少文件' : ' more missing doc(s)'
                };
                const grouped = new Map<string, typeof student.signals>();
                for (const signal of student.signals) {
                    if (!grouped.has(signal.type)) grouped.set(signal.type, []);
                    grouped.get(signal.type)!.push(signal);
                }
                return (
                    <Stack spacing={0.5}>
                        {Array.from(grouped.entries()).map(
                            ([type, signals]) => (
                                <Stack key={type} spacing={0.5}>
                                    {signals
                                        .slice(0, PER_TYPE)
                                        .map((signal, i) => (
                                            <Chip
                                                key={i}
                                                color={
                                                    signal.urgency ===
                                                    'critical'
                                                        ? 'error'
                                                        : signal.urgency ===
                                                            'high'
                                                          ? 'warning'
                                                          : 'default'
                                                }
                                                label={signal.label}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    borderRadius: 0.75,
                                                    maxWidth: '100%',
                                                    '& .MuiChip-label': {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }
                                                }}
                                                variant="outlined"
                                            />
                                        ))}
                                    {signals.length > PER_TYPE && (
                                        <Typography
                                            color="text.disabled"
                                            variant="caption"
                                        >
                                            +{signals.length - PER_TYPE}
                                            {TYPE_LABEL[type] ?? ' more'}
                                        </Typography>
                                    )}
                                </Stack>
                            )
                        )}
                    </Stack>
                );
            })()}
        </Paper>
    );
};
