import { Box } from '@mui/material';
import i18next from 'i18next';

import ApplicationOverviewTabs from './ApplicationOverviewTabs';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const AllApplicantsOverview = () => {
    TabTitle(i18next.t('All Applications Overview'));
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
            <ApplicationOverviewTabs />
        </Box>
    );
};

export default AllApplicantsOverview;
