import { Navigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Button } from '@mui/material';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import TranscriptCard from './TranscriptCard';
import { is_TaiGer_role } from '@taiger-common/core';
import { useEffect, useState } from 'react';

import { request } from '../../api/request';

const TranscriptPage = () => {
    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // Temporory workaround to fetch transcripts
    // TODO: implement actual/proper API call to fetch transcripts with UseQuery
    const [transcripts, setTranscripts] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meeting-summaries')
            .then((data) => {
                setTranscripts(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch transcripts:', error);
            });
    }, []);

    TabTitle(i18next.t('CRM Overview', { ns: 'common' }));

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
                    {i18next.t('Meetings', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Overview', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {i18next.t('Transcript Summaries', { ns: 'common' })}
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Button
                        onClick={() =>
                            alert(
                                'Fetch transcripts feature is not implemented yet.'
                            )
                        }
                        variant="outlined"
                    >
                        Fetch Latest Transcripts
                    </Button>
                </Box>
                <Box>
                    {transcripts.map((t, idx) => (
                        <TranscriptCard key={t.id || idx} transcript={t} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default TranscriptPage;
