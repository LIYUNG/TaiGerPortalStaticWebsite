import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY } from '@taiger-common/model';

type NormalizedDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

function normalizeEssayDifficulty(
    raw: string | undefined
): NormalizedDifficulty | null {
    if (!raw) {
        return 'EASY';
    }
    const u = raw.trim().toUpperCase();
    if (u === 'EASY' || u === DIFFICULTY.EASY) {
        return 'EASY';
    }
    if (u === 'HARD' || u === DIFFICULTY.HARD) {
        return 'HARD';
    }
    return 'EASY';
}

export interface EssayDifficultyIndicatorProps {
    essayDifficulty: string | undefined;
}

/**
 * Icon + label for program essay difficulty on Essay document threads.
 */
export function EssayDifficultyIndicator({
    essayDifficulty
}: EssayDifficultyIndicatorProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const level = normalizeEssayDifficulty(essayDifficulty);
    if (!level) {
        return null;
    }

    let icon: JSX.Element;
    let gradient: string;
    let tooltip: string;
    let label: string;

    switch (level) {
        case 'EASY':
            icon = (
                <SentimentSatisfiedAltIcon
                    aria-hidden
                    sx={{ fontSize: 22 }}
                />
            );
            gradient = `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`;
            tooltip = t('essayDifficultyTooltipEasy', {
                defaultValue:
                    'EASY: below 1000 words (non-scientific research style)',
                ns: 'common'
            });
            label = t('Easy', { ns: 'common' });
            break;
        case 'HARD':
            icon = (
                <LocalFireDepartmentIcon
                    aria-hidden
                    sx={{ fontSize: 22 }}
                />
            );
            gradient = `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`;
            tooltip = t('essayDifficultyTooltipHard', {
                defaultValue:
                    'HARD: above 1000 words (scientific research style)',
                ns: 'common'
            });
            label = t('Hard', { ns: 'common' });
            break;
    }

    return (
        <Card
            elevation={2}
            sx={{
                background: gradient,
                color: 'white',
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Tooltip title={tooltip}>
                <Box sx={{ p: 1.5, cursor: 'help' }}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{ mb: 0.5 }}
                    >
                        {icon}
                        <Typography
                            sx={{
                                opacity: 0.9,
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.6
                            }}
                            variant="caption"
                        >
                            {t('Essay Difficulty', { ns: 'common' })}
                        </Typography>
                    </Stack>
                    <Typography fontWeight="700" variant="body1">
                        {label}
                    </Typography>
                </Box>
            </Tooltip>
        </Card>
    );
}
