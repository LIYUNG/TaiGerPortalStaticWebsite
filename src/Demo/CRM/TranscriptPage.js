import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

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
        <div>
            <h1>Meeting Details</h1>
            <p>Displaying details for Meeting ID: {meetingId}</p>
            {/* Additional lead details and components can be added here */}
            {JSON.stringify(meeting)}
        </div>
    );
};

export default TranscriptPage;
