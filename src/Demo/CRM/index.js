import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import { request } from '../../api/request';

const CRMDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    useEffect(() => {
        request
            .get('/api/crm/stats')
            .then((data) => {
                setStats(data?.data?.data || {});
            })
            .catch((error) => {
                console.error('Failed to fetch stats:', error);
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
            <Box sx={{ mt: 3 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Dashboard', { ns: 'common' })}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item md={3} sm={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    {i18next.t('Meetings', { ns: 'common' })}
                                </Typography>
                                <Typography component="div" variant="h4">
                                    {stats.totalMeetingCount || 0}
                                    <Typography
                                        component="span"
                                        sx={{ color: 'success.main', ml: 1 }}
                                        variant="body2"
                                    >
                                        (+{stats.recentMeetingCount || 0})
                                    </Typography>
                                </Typography>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {i18next.t(
                                        'Total meetings (+last 7 days)',
                                        { ns: 'common' }
                                    )}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item md={3} sm={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    {i18next.t('Leads', { ns: 'common' })}
                                </Typography>
                                <Typography component="div" variant="h4">
                                    {stats.totalLeadCount || 0}
                                    <Typography
                                        component="span"
                                        sx={{ color: 'success.main', ml: 1 }}
                                        variant="body2"
                                    >
                                        (+{stats.recentLeadCount || 0})
                                    </Typography>
                                </Typography>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {i18next.t('Total leads (+last 7 days)', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default CRMDashboard;
