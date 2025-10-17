import React from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import queryString from 'query-string';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import StudentOverviewTable from '../../components/StudentOverviewTable';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getActiveStudentsQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';

const StudentOverviewPage = () => {
    const { user } = useAuth();
    const { data, isLoading } = useQuery(
        getActiveStudentsQuery(queryString.stringify({ archiv: false }))
    );

    // Early exits AFTER declaring all hooks to keep hook order stable
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    if (isLoading) {
        return <Loading />;
    }
    TabTitle(i18next.t('Students Overview', { ns: 'common' }));

    return (
        <Box data-testid="student_overview">
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
                    {i18next.t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {i18next.t('All Active Student Overview', { ns: 'common' })}{' '}
                    ({data?.data?.length})
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 2 }}>
                <StudentOverviewTable
                    riskOnly={false}
                    students={data?.data}
                    title="All"
                    user={user}
                />
            </Box>
        </Box>
    );
};

export default StudentOverviewPage;
