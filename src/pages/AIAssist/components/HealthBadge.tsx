import { Chip, Tooltip } from '@mui/material';

const HEALTH_CONFIG: Record<string, { color: string; label: string }> = {
    Healthy: { color: 'success', label: 'Healthy' },
    'On Track': { color: 'success', label: 'On Track' },
    'Minor Risk': { color: 'warning', label: 'Minor Risk' },
    'Medium Risk': { color: 'warning', label: 'Medium Risk' },
    'High Risk': { color: 'error', label: 'High Risk' },
    Critical: { color: 'error', label: 'Critical' },
    Stalled: { color: 'default', label: 'Stalled' }
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
    const config = HEALTH_CONFIG[health] ?? { color: 'default', label: health };
    const chip = (
        <Chip
            color={config.color as 'success' | 'warning' | 'error' | 'default'}
            label={preliminary ? `~${config.label}` : config.label}
            size={size}
            sx={{ fontWeight: 700, borderRadius: 1 }}
            variant={preliminary ? 'outlined' : 'filled'}
        />
    );

    if (!preliminary) {
        return chip;
    }

    return (
        <Tooltip title="Preliminary estimate from portfolio signals. Open the student for the full AI analysis.">
            {chip}
        </Tooltip>
    );
};
