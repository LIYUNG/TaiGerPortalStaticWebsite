import React from 'react';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { is_TaiGer_Student, is_TaiGer_role } from '@taiger-common/core';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import ApplicationOverviewTabs from './ApplicationOverviewTabs';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import Loading from '../../components/Loading/Loading';
import { getMyStudentsApplicationsV2Query } from '../../api/query';

const ApplicantsOverview = () => {
    const { user } = useAuth();

    const { data: myStudentsApplications, isLoading } = useQuery(
        getMyStudentsApplicationsV2Query({
            userId: user._id,
            queryString: queryString.stringify({
                decided: 'O'
            })
        })
    );

    if (is_TaiGer_Student(user)) {
        return (
            <Navigate
                to={`${DEMO.STUDENT_APPLICATIONS_LINK}/${user._id.toString()}`}
            />
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(
        i18next.t('Applications Overview', {
            ns: 'common'
        })
    );

    return (
        <Box data-testid="application_overview_component">
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: is_TaiGer_role(user)
                            ? `${i18next.t('My Students Application Overview')}`
                            : `${user.firstname} ${user.lastname} Applications Overview`
                    }
                ]}
            />
            <ApplicationOverviewTabs
                applications={myStudentsApplications.data.applications}
                students={myStudentsApplications.data.students}
            />
        </Box>
    );
};

export default ApplicantsOverview;
