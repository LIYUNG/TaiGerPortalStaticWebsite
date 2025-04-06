import React from 'react';
import { Navigate, useLoaderData } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';

import DEMO from '../../../store/constant';
import { useAuth } from '../../../components/AuthProvider';
import { appConfig } from '../../../config';
import { BreadcrumbsNavigation } from '../../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import AssignInterviewTrainersPage from './AssignInterviewTrainersPage';
const AssignInterviewTrainers = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const {
        data: { data: interviews }
    } = useLoaderData();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('Assign Interview Trainers', { ns: 'common' })
                    }
                ]}
            />
            <AssignInterviewTrainersPage interviews={interviews} />
        </Box>
    );
};

export default AssignInterviewTrainers;
