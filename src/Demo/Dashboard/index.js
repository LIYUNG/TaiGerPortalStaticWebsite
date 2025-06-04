import React from 'react';
import { TabTitle } from '../Utils/TabTitle';

import DashboardBody from './DashboardBody';
import { Box } from '@mui/material';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { getMyStudentsApplicationsV2Query } from '../../api/query';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
    const { user } = useAuth();
    const { data: myStudentsApplications, isLoading } = useQuery(
        getMyStudentsApplicationsV2Query({ userId: user._id })
    );
    TabTitle('Home Page');

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box data-testid="dashoboard_component">
            <DashboardBody myStudentsApplications={myStudentsApplications} />
        </Box>
    );
};

export default Dashboard;
