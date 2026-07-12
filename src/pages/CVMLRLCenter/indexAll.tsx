import { Link as LinkDom, Navigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import CVMLRLDashboardPaginated from './CVMLRLDashboardPaginated';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { useTranslation } from 'react-i18next';

const CVMLRLCenterAll = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle('CV ML RL Center');

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
                    {t('Tasks Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <CVMLRLDashboardPaginated />
        </Box>
    );
};

export default CVMLRLCenterAll;
