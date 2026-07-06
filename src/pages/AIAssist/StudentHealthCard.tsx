import { Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SpeakerNotesOffOutlinedIcon from '@mui/icons-material/SpeakerNotesOffOutlined';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { HealthBadge } from './components/HealthBadge';

export type PortfolioSignal = {
    type:
        | 'deadline'
        | 'thread_waiting'
        | 'comm_gap'
        | 'student_silence'
        | 'admitted_unconfirmed'
        | 'missing_docs'
        | 'comm_risk';
    urgency: 'critical' | 'high' | 'medium';
    label: string;
    // Full text for a hover tooltip when `label` is a shortened/collapsed form.
    detail?: string;
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

    // Communication-risk signals read better as a single inline line under the
    // name than as bordered chips. Split them out from the chip-rendered rest.
    const commRiskSignals = student.signals.filter(
        (s) => s.type === 'comm_risk'
    );
    const otherSignals = student.signals.filter((s) => s.type !== 'comm_risk');
    const commRiskHigh = commRiskSignals.some((s) => s.urgency === 'high');

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
            {/* Name (slightly larger) + term/join two-line block beside it,
                health badge on the far right. */}
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={1}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <Typography
                        component={RouterLink}
                        fontWeight={700}
                        variant="subtitle1"
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
                    <Stack spacing={0} sx={{ flexShrink: 0 }}>
                        {termLabel && (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                                sx={{ lineHeight: 1.3 }}
                            >
                                {termLabel}
                            </Typography>
                        )}
                        {joinLabel && (
                            <Typography
                                color="text.disabled"
                                variant="caption"
                                sx={{ lineHeight: 1.3 }}
                            >
                                {isZh
                                    ? `加入 ${joinLabel}`
                                    : `Joined ${joinLabel}`}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
                <HealthBadge health={student.overallHealth} preliminary />
            </Stack>

            {/* Communication-risk: one borderless line under the header. Each
                item shows the i18n category; hover (MUI Tooltip — works with
                touch and long content, unlike the native title attribute)
                reveals the LLM's specific description plus the verbatim
                evidence quote. */}
            {commRiskSignals.length > 0 && (
                <Typography
                    variant="caption"
                    sx={{
                        color: commRiskHigh ? 'warning.main' : 'text.secondary',
                        lineHeight: 1.5,
                        wordBreak: 'break-word'
                    }}
                >
                    {commRiskSignals.map((s, i) => (
                        <Box component="span" key={i}>
                            {i > 0 ? '  ｜  ' : ''}
                            {s.detail ? (
                                <Tooltip
                                    placement="top"
                                    title={
                                        <Typography
                                            component="span"
                                            sx={{
                                                display: 'block',
                                                whiteSpace: 'pre-line'
                                            }}
                                            variant="caption"
                                        >
                                            {s.detail}
                                        </Typography>
                                    }
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            cursor: 'help',
                                            textDecoration: 'underline dotted',
                                            textUnderlineOffset: '2px'
                                        }}
                                    >
                                        {s.label}
                                    </Box>
                                </Tooltip>
                            ) : (
                                s.label
                            )}
                        </Box>
                    ))}
                </Typography>
            )}

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
                // Borderless icon rows. Time-critical items (deadlines, waiting,
                // threads) shown individually; low-priority items collapsed to a
                // single count row to keep the card calm and scannable.
                const urgencyColor = (u: string): string =>
                    u === 'critical'
                        ? 'error.main'
                        : u === 'high'
                          ? 'warning.main'
                          : 'text.secondary';
                const iconSx = { fontSize: 15, flexShrink: 0, mt: '2px' };

                const grouped = new Map<string, typeof student.signals>();
                for (const signal of otherSignals) {
                    if (!grouped.has(signal.type)) grouped.set(signal.type, []);
                    grouped.get(signal.type)!.push(signal);
                }
                const get = (type: string) => grouped.get(type) ?? [];

                type Row = {
                    key: string;
                    icon: JSX.Element;
                    text: string;
                    color: string;
                    title?: string;
                };
                const rows: Row[] = [];

                const deadlines = get('deadline');
                deadlines.slice(0, 2).forEach((s, i) =>
                    rows.push({
                        key: `deadline-${i}`,
                        icon: <AccessTimeRoundedIcon sx={iconSx} />,
                        text: s.label,
                        color: urgencyColor(s.urgency),
                        title: s.label
                    })
                );
                if (deadlines.length > 2) {
                    rows.push({
                        key: 'deadline-more',
                        icon: <AccessTimeRoundedIcon sx={iconSx} />,
                        text: isZh
                            ? `還有 ${deadlines.length - 2} 個截止日`
                            : `+${deadlines.length - 2} more deadlines`,
                        color: 'text.disabled'
                    });
                }

                [
                    ...get('comm_gap'),
                    ...get('student_silence'),
                    ...get('thread_waiting')
                ].forEach((s, i) =>
                    rows.push({
                        key: `wait-${i}`,
                        icon:
                            s.type === 'comm_gap' ? (
                                <HourglassEmptyRoundedIcon sx={iconSx} />
                            ) : s.type === 'student_silence' ? (
                                <SpeakerNotesOffOutlinedIcon sx={iconSx} />
                            ) : (
                                <ForumOutlinedIcon sx={iconSx} />
                            ),
                        text: s.label,
                        color: urgencyColor(s.urgency),
                        title: s.label
                    })
                );

                const admitted = get('admitted_unconfirmed');
                if (admitted.length) {
                    rows.push({
                        key: 'admitted',
                        icon: <SchoolOutlinedIcon sx={iconSx} />,
                        text: isZh
                            ? `${admitted.length} 個待確認入學`
                            : `${admitted.length} to confirm enrolment`,
                        color: urgencyColor(admitted[0].urgency)
                    });
                }

                get('missing_docs').forEach((s, i) =>
                    rows.push({
                        key: `docs-${i}`,
                        icon: <DescriptionOutlinedIcon sx={iconSx} />,
                        text: s.label,
                        color: 'text.secondary',
                        title: s.detail ?? s.label
                    })
                );

                if (!rows.length) return null;
                return (
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {rows.map((r) => (
                            <Stack
                                key={r.key}
                                alignItems="flex-start"
                                direction="row"
                                spacing={0.75}
                            >
                                <Box sx={{ color: r.color, display: 'flex' }}>
                                    {r.icon}
                                </Box>
                                <Typography
                                    title={r.title}
                                    variant="caption"
                                    sx={{
                                        color: r.color,
                                        lineHeight: 1.4,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        minWidth: 0
                                    }}
                                >
                                    {r.text}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                );
            })()}
        </Paper>
    );
};
