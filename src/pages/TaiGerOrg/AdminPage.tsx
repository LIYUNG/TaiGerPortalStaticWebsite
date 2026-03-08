import { Navigate, Link as LinkDom } from 'react-router-dom';
import { Box, Breadcrumbs, Card, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import ErrorPage from '../Utils/ErrorPage';
import { useTeamMembers } from '@hooks/useTeamMembers';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';

interface AdminUser {
    firstname?: string;
    lastname?: string;
    role?: string;
}

const AdminPage = () => {
    const { user } = useAuth();
    const { teams, isLoading, isError, error, success, status } =
        useTeamMembers();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !success) {
        const resStatus =
            status ??
            (error as { response?: { status?: number } })?.response?.status ??
            500;
        return <ErrorPage res_status={resStatus} />;
    }

    const admin: AdminUser | null = Array.isArray(teams)
        ? (teams as AdminUser[])[0] ?? null
        : (teams as AdminUser);

    TabTitle(`${appConfig.companyName} Admin`);

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
                    {appConfig.companyName} Team
                </Typography>
            </Breadcrumbs>
            <Card>
                <Typography>Admin: </Typography>
                <Typography fontWeight="bold">
                    {admin?.firstname} {admin?.lastname}
                </Typography>
            </Card>
        </Box>
    );
};

export default AdminPage;
