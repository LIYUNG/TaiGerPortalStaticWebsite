import React from 'react';
import { Box } from '@mui/material';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';

import ApplicationOverviewTabs from './ApplicationOverviewTabs';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { appConfig } from '../../config';
import { getActiveStudentsApplicationsV2Query } from '../../api/query';
import { BreadcrumbsNavigation } from '../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import Loading from '../../components/Loading/Loading';

const AllApplicantsOverview = () => {
    const { data: allStudentsApplications, isLoading } = useQuery(
        getActiveStudentsApplicationsV2Query()
    );
    TabTitle(i18next.t('All Applications Overview'));
    if (isLoading) {
        return <Loading />;
    }
    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: i18next.t('All Students', { ns: 'common' }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: i18next.t('All Students Applications Overview', {
                            ns: 'common'
                        })
                    }
                ]}
            />
            <ApplicationOverviewTabs
                applications={allStudentsApplications.data.applications}
                students={allStudentsApplications.data.students}
            />
        </Box>
    );
};

export default AllApplicantsOverview;
