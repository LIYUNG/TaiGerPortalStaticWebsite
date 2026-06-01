import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import {
    is_TaiGer_Editor,
    is_TaiGer_Student,
    is_TaiGer_role
} from '@taiger-common/core';
import i18next from 'i18next';
import ApplicationOverviewTabs from './ApplicationOverviewTabs';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const ApplicantsOverview = () => {
    const { user } = useAuth();

    const userIdStr = user?._id?.toString() ?? '';

    if (!user) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (is_TaiGer_Student(user)) {
        return (
            <Navigate
                to={`${DEMO.STUDENT_APPLICATIONS_LINK}/${user._id?.toString()}`}
            />
        );
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
                userId={userIdStr}
                {...(is_TaiGer_Editor(user)
                    ? { editors: userIdStr }
                    : { agents: userIdStr })}
            />
        </Box>
    );
};

export default ApplicantsOverview;
