import { Box } from '@mui/material';
import i18next from 'i18next';

import ApplicationOverviewTabs from './ApplicationOverviewTabs';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useActiveStudentsApplicationsV2 } from '@hooks/useActiveStudentsApplicationsV2';
import { useStudentsV3 } from '@hooks/useStudentsV3';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import Loading from '@components/Loading/Loading';

const AllApplicantsOverview = () => {
    const { data: activeStudents, isLoading: isLoadingActiveStudents } =
        useStudentsV3({ archiv: false });

    const { applications: activeStudentsApplications, isLoading } =
        useActiveStudentsApplicationsV2();

    TabTitle(i18next.t('All Applications Overview'));
    if (isLoading || isLoadingActiveStudents) {
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
                applications={activeStudentsApplications}
                students={activeStudents}
            />
        </Box>
    );
};

export default AllApplicantsOverview;
