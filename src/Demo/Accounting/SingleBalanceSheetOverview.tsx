import React from 'react';
import { Navigate, useParams, Link as LinkDom } from 'react-router-dom';
import { Box, Card, Button, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';

import ErrorPage from '../Utils/ErrorPage';
import { getExpenseQuery } from '../../api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { ExtendableTable } from '../../components/ExtendableTable/ExtendableTable';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import { BreadcrumbsNavigation } from '../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const SingleBalanceSheetOverview = () => {
    const { taiger_user_id } = useParams();
    const { user } = useAuth();

    // Fetch expense data using React Query
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery(getExpenseQuery(taiger_user_id));

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response?.data?.success) {
        const res_status = response?.status || (error?.response?.status ?? 500);
        return <ErrorPage res_status={res_status} />;
    }

    const students = response.data.data.students;
    const the_user = response.data.data.the_user;

    TabTitle(`${the_user.role}: ${the_user.firstname}, ${the_user.lastname}`);

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: i18next.t('tenant-team', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        }),
                        link: DEMO.ACCOUNTING_LINK
                    },
                    {
                        label: `${the_user.firstname} ${the_user.lastname}`
                    }
                ]}
            />
            <Card>
                <Typography variant="h6">
                    {the_user.firstname} {the_user.lastname} Salary Overview
                </Typography>
            </Card>
            <ExtendableTable data={students} />

            <LinkDom
                to={`${DEMO.TEAM_AGENT_ARCHIV_LINK(the_user._id.toString())}`}
            >
                <Button variant="contained">See Archiv Student</Button>
            </LinkDom>
        </Box>
    );
};

export default SingleBalanceSheetOverview;
