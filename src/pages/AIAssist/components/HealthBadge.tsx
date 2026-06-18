import { Chip } from '@mui/material';

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
    size = 'small'
}: {
    health: string;
    size?: 'small' | 'medium';
}): JSX.Element => {
    const config = HEALTH_CONFIG[health] ?? { color: 'default', label: health };
    return (
        <Chip
            color={config.color as 'success' | 'warning' | 'error' | 'default'}
            label={config.label}
            size={size}
            sx={{ fontWeight: 700, borderRadius: 1 }}
            variant="filled"
        />
    );
};
