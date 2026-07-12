import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../../Utils/TabTitle';
import TabProgramConflict from '@pages/Dashboard/MainViewTab/ProgramConflict/TabProgramConflict';
import ErrorPage from '../../Utils/ErrorPage';
import { getApplicationConflictsQuery } from '@/api/query';
import DEMO from '@store/constant';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../../config';
import Loading from '@components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import type { ProgramConflictProps } from '@pages/Dashboard/MainViewTab/ProgramConflict/ProgramConflict';

/** Axios response shape of GET /api/student-applications/conflicts */
interface ApplicationConflictsResult {
    status?: number;
    data?: {
        success?: boolean;
        data?: ProgramConflictProps[];
    };
}

const isApplicationConflictsResult = (
    value: unknown
): value is ApplicationConflictsResult =>
    typeof value === 'object' && value !== null;

const ProgramConflictDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Fetch application conflicts using React Query
    const { data, isLoading, error, isError } = useQuery(
        getApplicationConflictsQuery()
    );

    const response: ApplicationConflictsResult = isApplicationConflictsResult(
        data
    )
        ? data
        : {};

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle('Program Conflict Dashboard');

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response.data?.success) {
        const res_status =
            response.status ||
            ((error as { response?: { status?: number } } | null)?.response
                ?.status ??
                500);
        return <ErrorPage res_status={res_status} />;
    }

    const students = response.data?.data ?? [];

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Program Conflicts', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <TabProgramConflict students={students} />
        </Box>
    );
};

export default ProgramConflictDashboard;
