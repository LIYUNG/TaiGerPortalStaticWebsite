import { Card, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TasksDistributionBarChart from '@components/Charts/TasksDistributionBarChart';
import { useApplicationsDeadlineDistribution } from '@hooks/useApplicationsDeadlineDistribution';

export interface OpenApplicationsDistributionChartProps {
    /**
     * When set, scope to the supervised students' applications (My Students
     * view). Omit for all active students.
     */
    userId?: string;
}

/**
 * "Open Applications Distribution" chart. Self-contained: the deadline buckets
 * (active vs potentials) are computed in the DB, so this only fetches a small
 * key-value list instead of every application. Stacked bars per deadline, with a
 * cumulative line of active (decided) applications overlaid.
 */
export const OpenApplicationsDistributionChart = ({
    userId
}: OpenApplicationsDistributionChartProps = {}) => {
    const { t } = useTranslation();
    const { buckets } = useApplicationsDeadlineDistribution({ userId });
    const total = buckets.reduce((sum, b) => sum + b.active + b.potentials, 0);

    return (
        <Card sx={{ p: 2 }}>
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
            >
                <Typography variant="h6">
                    {t('Open Applications Distribution', { ns: 'common' })}
                </Typography>
                <Chip
                    color="primary"
                    label={`${total} ${t('Applications', { ns: 'common' })}`}
                    size="small"
                    variant="outlined"
                />
            </Stack>
            <Typography>
                <b style={{ color: '#d32f2f' }}>active:</b>{' '}
                {t('Students decided programs', { ns: 'common' })}
            </Typography>
            <Typography>
                <b style={{ color: '#A9A9A9' }}>potentials:</b>{' '}
                {t(
                    'Students do not decide programs yet. But the applications will be potentially activated when they would decide',
                    { ns: 'common' }
                )}
            </Typography>
            <TasksDistributionBarChart
                data={buckets}
                k="name"
                showCumulative
                value1="active"
                value2="potentials"
                yLabel="Applications"
            />
        </Card>
    );
};

export default OpenApplicationsDistributionChart;
