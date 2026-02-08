import React, { useMemo } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_Editor, is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';

import { TabTitle } from '../Utils/TabTitle';
import { Navigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import StudentOverviewTable from '../../components/StudentOverviewTable';
import { useAuth } from '../../components/AuthProvider';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { appConfig } from '../../config';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getActiveStudentsQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';

const MyStudentsOverview = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const role = is_TaiGer_Editor(user) ? 'editors' : 'agents';
    const { data, isLoading } = useQuery(
        getActiveStudentsQuery(
            queryString.stringify({ [role]: user?._id, archiv: false })
        )
    );
    const students = data?.data;
    const userId = user?._id?.toString();
    const myStudents = useMemo(
        () =>
            students?.filter(
                (student) =>
                    student.editors.some((editor) => editor._id === userId) ||
                    student.agents.some((agent) => agent._id === userId)
            ) || [],
        [students, userId]
    );

    // Early exits AFTER declaring all hooks to keep hook order stable
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    if (isLoading) {
        return <Loading />;
    }
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
            <Box sx={{ mt: 2 }}>
                <StudentOverviewTable
                    riskOnly={false}
                    students={myStudents}
                    title="All"
                    user={user}
                />
            </Box>
        </Box>
    );
};

export default MyStudentsOverview;
