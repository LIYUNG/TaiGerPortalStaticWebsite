import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import { request } from '../../api/request';

const CRMDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    useEffect(() => {
        request
            .get('/api/crm/stats')
            .then((data) => {
                setStats(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            });
    }, []);

    TabTitle(i18next.t('CRM Overview', { ns: 'common' }));

    return (
        <>
            <Box data-testid="student_overview">
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Typography color="text.primary">
                        {i18next.t('CRM Dashboard', { ns: 'common' })}
                    </Typography>
                </Breadcrumbs>
            </Box>
            <Box>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Dashboard', { ns: 'common' })}
                </Typography>
                <Typography variant="body1">
                    {stats.totalMeetingCount}{' '}
                    {i18next.t('meetings in total', { ns: 'common' })} <br />
                </Typography>
            </Box>
        </>
    );
};

export default CRMDashboard;
