import { Navigate, Link as LinkDom } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { useTranslation } from 'react-i18next';
import { StudentsTablePaginated } from './StudentsTablePaginated';

const StudentDatabase = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(t('Students Database', { ns: 'common' }));
    return (
        <Box data-testid="student_datdabase">
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
                    {t('Students Database', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 2,
                    mb: 2
                }}
            >
                <Button
                    component={LinkDom}
                    startIcon={<Assessment />}
                    to={DEMO.STUDENT_DATABASE_OVERVIEW}
                    variant="outlined"
                >
                    {t('View Overview', { ns: 'common' })}
                </Button>
            </Box>
            <StudentsTablePaginated />
        </Box>
    );
};

export default StudentDatabase;
