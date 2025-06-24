// import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

// import firefilies-transcript.json file as dummy data
import firefiliesTranscript from './fireflies-transcript.json';
import TranscriptCard from '../../components/TranscriptCard';
import { is_TaiGer_role } from '@taiger-common/core';

const CRMDashboard = () => {
    const { user } = useAuth();
    // const [expandedIdx, setExpandedIdx] = useState(null);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
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
                <Typography color="text.primary">
                    {i18next.t('All Students', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Overview', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {i18next.t('Transcript Summaries', { ns: 'common' })}
                </Typography>
                <Box>
                    {firefiliesTranscript.data.transcripts
                        .filter((t) => t && t.title)
                        .map((t, idx) => (
                            <TranscriptCard key={t.id || idx} transcript={t} />
                        ))}
                </Box>
            </Box>
        </Box>
    );
};

export default CRMDashboard;
