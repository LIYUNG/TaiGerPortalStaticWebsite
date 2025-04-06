import React, { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { TabTitle } from '../Utils/TabTitle';

import DashboardBody from './DashboardBody';
import { Box } from '@mui/material';
import Loading from '../../components/Loading/Loading';

const Dashboard = () => {
    const { studentAndEssaysAndInterview } = useLoaderData();

    TabTitle('Home Page');

    return (
        <Box data-testid="dashoboard_component">
            <Suspense fallback={<Loading />}>
                <Await resolve={studentAndEssaysAndInterview}>
                    {(loadedData) => (
                        <DashboardBody
                            studentAndEssaysAndInterview={loadedData}
                        />
                    )}
                </Await>
            </Suspense>
        </Box>
    );
};

export default Dashboard;
