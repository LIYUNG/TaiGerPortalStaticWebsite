import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import { Box, Breadcrumbs, Link, Typography } from '@mui/material';

import DEMO from '../../store/constant';
// import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { request } from '../../api/request';

const TranscriptPage = () => {
    const { meetingId } = useParams();
    const [meeting, setMeeting] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meetings/' + meetingId)
            .then((data) => {
                setMeeting(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            });
    }, []);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Typography color="text.primary">CRM</Typography>
                    <Typography color="text.primary">Leads</Typography>
                    <Typography color="text.primary">
                        {meeting.title}
                    </Typography>
                </Breadcrumbs>

                <Typography color="primary" fontWeight="bold" variant="h5">
                    Meeting Details
                </Typography>
            </Box>
            <p>Displaying details for Meeting ID: {meetingId}</p>
            {/* Additional lead details and components can be added here */}
            {JSON.stringify(meeting)}
        </Box>
    );
};

export default TranscriptPage;
