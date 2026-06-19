import { Chip, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const HEALTH_COLOR: Record<string, string> = {
    Healthy: 'success',
    'On Track': 'success',
    'Minor Risk': 'warning',
    'Medium Risk': 'warning',
    'High Risk': 'error',
    Critical: 'error',
    Stalled: 'default'
};

const HEALTH_I18N_KEY: Record<string, string> = {
    Healthy: 'aiAssist.healthHealthy',
    'On Track': 'aiAssist.healthOnTrack',
    'Minor Risk': 'aiAssist.healthMinorRisk',
    'Medium Risk': 'aiAssist.healthMediumRisk',
    'High Risk': 'aiAssist.healthHighRisk',
    Critical: 'aiAssist.healthCritical',
    Stalled: 'aiAssist.healthStalled'
};

export const HealthBadge = ({
    health,
    size = 'small',
    preliminary = false
}: {
    health: string;
    size?: 'small' | 'medium';
    // When true, marks the badge as a rule-based portfolio estimate rather than
    // the authoritative AI deep-dive verdict — the two can legitimately differ.
    preliminary?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();
    const color = HEALTH_COLOR[health] ?? 'default';
    const label = t(
        HEALTH_I18N_KEY[health] ?? 'aiAssist.healthUnknown',
        health
    );
    const chip = (
        <Chip
            color={color as 'success' | 'warning' | 'error' | 'default'}
            label={preliminary ? `~${label}` : label}
            size={size}
            sx={{ fontWeight: 700, borderRadius: 1 }}
            variant={preliminary ? 'outlined' : 'filled'}
        />
    );

    if (!preliminary) {
        return chip;
    }

    return (
        <Tooltip
            title={t(
                'aiAssist.healthPreliminaryTooltip',
                'Preliminary estimate from portfolio signals. Open the student for the full AI analysis.'
            )}
        >
            {chip}
        </Tooltip>
    );
};
