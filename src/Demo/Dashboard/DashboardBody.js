import React from 'react';
import { Alert, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    is_TaiGer_Admin,
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_External,
    is_TaiGer_Guest,
    is_TaiGer_Manager,
    is_TaiGer_Student
} from '@taiger-common/core';

import AdminMainView from './AdminDashboard/AdminMainView';
import AgentMainView from './AgentDashboard/AgentMainView';
import EditorMainView from './EditorDashboard/EditorMainView';
import ManagerMainView from './ManagerDashboard/ManagerMainView';
import StudentDashboard from './StudentDashboard/StudentDashboard';
import GuestDashboard from './GuestDashboard/GuestDashboard';
import { TabTitle } from '../Utils/TabTitle';
import { useAuth } from '../../components/AuthProvider';
import DEMO from '../../store/constant';
import { appConfig } from '../../config';

import ExternalMainView from './ExternalDashboard/ExternalMainView';

const DashboardBody = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    TabTitle('Home Page');

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
                    {t('Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Alert severity="success" variant="filled">
                {t('system-announcement', { ns: 'common' })}
            </Alert>
            {is_TaiGer_Admin(user) ? <AdminMainView /> : null}
            {is_TaiGer_Manager(user) ? <ManagerMainView /> : null}
            {is_TaiGer_Agent(user) ? <AgentMainView /> : null}
            {is_TaiGer_Editor(user) ? <EditorMainView /> : null}
            {is_TaiGer_External(user) ? (
                <ExternalMainView students={[]} />
            ) : null}
            {is_TaiGer_Student(user) ? <StudentDashboard /> : null}
            {is_TaiGer_Guest(user) ? <GuestDashboard /> : null}
        </Box>
    );
};

export default DashboardBody;
