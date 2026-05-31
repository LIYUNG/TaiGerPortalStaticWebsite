import { Card, Typography } from '@mui/material';
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
 * "Open Applications Distribution" bar chart. Self-contained: the deadline
 * buckets (active vs potentials) are computed in the DB, so this only fetches a
 * small key-value list instead of every application.
 */
export const OpenApplicationsDistributionChart = ({
    userId
}: OpenApplicationsDistributionChartProps = {}) => {
    const { t } = useTranslation();
    const { buckets } = useApplicationsDeadlineDistribution({ userId });

    return (
        <Card sx={{ p: 2 }}>
            <Typography variant="h6">
                {t('Open Applications Distribution', { ns: 'common' })}
            </Typography>
            <Typography>
                <b style={{ color: 'red' }}>active:</b>{' '}
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
                value1="active"
                value2="potentials"
                yLabel="Applications"
            />
        </Card>
    );
};

export default OpenApplicationsDistributionChart;
