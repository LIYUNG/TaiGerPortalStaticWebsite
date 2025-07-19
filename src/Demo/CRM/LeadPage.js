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

const LeadPage = () => {
    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // Temporory workaround to fetch transcripts
    // TODO: implement actual/proper API call to fetch transcripts with UseQuery
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/leads')
            .then((data) => {
                setLeads(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            });
    }, []);

    TabTitle(i18next.t('Leads', { ns: 'common' }));

    return (
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
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {i18next.t('CRM', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('Leads', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <>{JSON.stringify(leads)}</>
        </Box>
    );
};

export default LeadPage;
