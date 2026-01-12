import React from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';

import CVMLRLDashboard from './CVMLRLDashboard';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '../../components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import { open_tasks_v2 } from '../Utils/checking-functions';
import { getActiveThreadsQuery } from '../../api/query';

const CVMLRLCenterAll = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const { data = [], isLoading } = useQuery(
        getActiveThreadsQuery(queryString.stringify({}))
    );

    const open_tasks_arr = open_tasks_v2(data);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle('Application Document Editing Center');
    if (isLoading) {
        return <Loading />;
    }

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
                    {t('Tasks Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            {isLoading ? (
                <Loading />
            ) : (
                <CVMLRLDashboard open_tasks_arr={open_tasks_arr} user={user} />
            )}
        </Box>
    );
};

export default CVMLRLCenterAll;
