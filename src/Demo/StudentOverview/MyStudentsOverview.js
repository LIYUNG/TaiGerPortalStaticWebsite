import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_role } from '@taiger-common/core';

import { TabTitle } from '../Utils/TabTitle';
import { Navigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import StudentOverviewTable from '../../components/StudentOverviewTable';
import { useAuth } from '../../components/AuthProvider';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { appConfig } from '../../config';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getMyActiveStudentsQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';

const MyStudentsOverview = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data, isLoading } = useQuery(getMyActiveStudentsQuery());

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }
    const students = data?.data;
    TabTitle('My Students Overview');

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
                    {t('My Active Student Overview', { ns: 'common' })} (
                    {students.length})
                </Typography>
            </Breadcrumbs>
            <StudentOverviewTable
                students={students?.filter(
                    (student) =>
                        student.editors.some(
                            (editor) => editor._id === user._id.toString()
                        ) ||
                        student.agents.some(
                            (agent) => agent._id === user._id.toString()
                        )
                )}
                title="All"
                user={user}
            />
        </Box>
    );
};

export default MyStudentsOverview;
