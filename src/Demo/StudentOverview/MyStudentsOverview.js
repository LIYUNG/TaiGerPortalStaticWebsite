import React, { useMemo } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_Editor, is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';

import { TabTitle } from '../Utils/TabTitle';
import { Navigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import StudentOverviewTable from '../../components/StudentOverviewTable';
import { useAuth } from '../../components/AuthProvider';
import { Box, Breadcrumbs, Link, Typography, Tabs, Tab } from '@mui/material';
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
            queryString.stringify({ [role]: user._id, archiv: false })
        )
    );

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const [tab, setTab] = React.useState(0);
    const handleTabChange = (_e, newValue) => setTab(newValue);

    if (isLoading) {
        return <Loading />;
    }
    const students = data?.data;
    const userId = user._id?.toString();
    // Filter only once for user's students
    const myStudents = useMemo(
        () =>
            students?.filter(
                (student) =>
                    student.editors.some((editor) => editor._id === userId) ||
                    student.agents.some((agent) => agent._id === userId)
            ) || [],
        [students, userId]
    );
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
                <Tabs
                    aria-label="my student overview tabs"
                    onChange={handleTabChange}
                    value={tab}
                >
                    <Tab label={t('All Active', { ns: 'common' })} />
                    <Tab label={t('Risk', { ns: 'common' })} />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    <StudentOverviewTable
                        riskOnly={tab === 1}
                        students={myStudents}
                        title={tab === 1 ? 'Risk' : 'All'}
                        user={user}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default MyStudentsOverview;
