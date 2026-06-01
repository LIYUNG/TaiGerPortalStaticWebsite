import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import EssayDashboardPaginated from './EssayDashboardPaginated';

const EssayDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle('Essay Dashboard');

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
                <Typography color="text.primary">
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Essay Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <EssayDashboardPaginated />
        </Box>
    );
};

export default EssayDashboard;
