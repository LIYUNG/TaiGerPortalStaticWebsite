import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
};

interface StudentHealthCardProps {
    student: PortfolioStudent;
    onAnalyze: (student: PortfolioStudent) => void;
}

export const StudentHealthCard = ({
    student,
    onAnalyze
}: StudentHealthCardProps): JSX.Element => {
    const { i18n } = useTranslation();
    const isZh = i18n.language.startsWith('zh');
    const displayName =
        isZh && student.chineseName ? student.chineseName : student.name;
    const topSignal = student.signals[0];

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
                        fontWeight={700}
                        variant="body1"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '60%'
                        }}
                    >
                        {displayName}
                    </Typography>
                    <HealthBadge health={student.overallHealth} preliminary />
                </Stack>
            </Stack>

            {topSignal && (
                <Box>
                    <Typography
                        color="text.secondary"
                        variant="caption"
                        fontWeight={600}
                        sx={{ mb: 0.5, display: 'block' }}
                    >
                        Top priority
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
                    +{student.signals.length - 1} more signal
                    {student.signals.length - 1 === 1 ? '' : 's'}
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
                Analyze
            </Button>
        </Paper>
    );
};
