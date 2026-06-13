import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Link, Typography, Box, Button } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { ProgramsTable } from './ProgramsTable';
import type { IStudentResponse } from '@taiger-common/model';

export interface ProgramListProps {
    student?: IStudentResponse | null;
}

const ProgramList = (props: ProgramListProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    TabTitle(t('Program List', { ns: 'common' }));

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

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
                    {t('Program List', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            {/* On mobile this lives in the card view's overflow menu. */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'flex-end',
                    mb: 2,
                    mt: 2
                }}
            >
                <Button
                    color="primary"
                    component={LinkDom}
                    startIcon={<BarChart />}
                    to={DEMO.PROGRAMS_OVERVIEW}
                    variant="outlined"
                >
                    {t('View Overview', { ns: 'common' })}
                </Button>
            </Box>
            <ProgramsTable student={props.student ?? undefined} />
        </Box>
    );
};

export default ProgramList;
