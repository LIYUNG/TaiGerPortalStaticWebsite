import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import { request } from '../../api/request';

const LeadPage = () => {
    const { leadId } = useParams();
    const [lead, setLead] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/leads/' + leadId)
            .then((data) => {
                setLead(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            });
    }, []);

    return (
        <div>
            <h1>Lead Details</h1>
            <p>Displaying details for lead ID: {leadId}</p>
            {/* Additional lead details and components can be added here */}
            {JSON.stringify(lead)}
        </div>
    );
};

export default LeadPage;
