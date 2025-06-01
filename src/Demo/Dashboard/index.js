import React, { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { TabTitle } from '../Utils/TabTitle';

import DashboardBody from './DashboardBody';
import { Box } from '@mui/material';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { getMyStudentsApplicationsV2Query } from '../../api/query';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
    const { user } = useAuth();
    const { studentAndEssaysAndInterview } = useLoaderData();
    const { data: myStudentsApplications, isLoading } = useQuery(
        getMyStudentsApplicationsV2Query({ userId: user._id })
    );
    TabTitle('Home Page');

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box data-testid="dashoboard_component">
            <Suspense fallback={<Loading />}>
                <Await resolve={studentAndEssaysAndInterview}>
                    {(loadedData) => (
                        <DashboardBody
                            myStudentsApplications={myStudentsApplications}
                            studentAndEssaysAndInterview={loadedData}
                        />
                    )}
                </Await>
            </Suspense>
        </Box>
    );
};

export default Dashboard;
