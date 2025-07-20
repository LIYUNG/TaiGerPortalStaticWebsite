import React from 'react';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import ApplicationOverviewTabs from '../ApplicantsOverview/ApplicationOverviewTabs';

import DEMO from '../../store/constant';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import {
    getMyStudentsApplicationsV2Query,
    getStudentsV3Query
} from '../../api/query';

// TODO TEST_CASE
const AgentPage = () => {
    const { user_id } = useParams();
    const { user } = useAuth();

    const {
        data: { data: fetchedMyStudents } = { data: [] },
        isLoading: isLoadingMyStudents
    } = useQuery(
        getStudentsV3Query(
            queryString.stringify({ agents: user_id, archiv: false })
        )
    );

    const { data: myStudentsApplications, isLoading } = useQuery(
        getMyStudentsApplicationsV2Query({
            userId: user_id,
            queryString: queryString.stringify({
                decided: 'O'
            })
        })
    );

    if (isLoading || isLoadingMyStudents) {
        return <Loading />;
    }

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.TEAM_MEMBERS_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName} Team
                </Link>
                <Typography color="text.primary">
                    {myStudentsApplications.data?.user?.firstname}{' '}
                    {myStudentsApplications.data?.user?.lastname}
                    {` (${fetchedMyStudents.length})`}
                </Typography>
            </Breadcrumbs>
            <ApplicationOverviewTabs
                applications={myStudentsApplications.data.applications}
                students={fetchedMyStudents}
            />
            <Link
                component={LinkDom}
                to={`${DEMO.TEAM_AGENT_ARCHIV_LINK(
                    myStudentsApplications.data?.user?._id.toString()
                )}`}
            >
                <Button color="primary" variant="contained">
                    See Archiv Student
                </Button>
            </Link>
        </Box>
    );
};

export default AgentPage;
