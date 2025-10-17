import React from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Link, Typography, Box, Button } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getProgramsQuery } from '../../api/query';
import { ProgramsTable } from './ProgramsTable';

const ProgramList = (props) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useQuery(getProgramsQuery());
    const programs = data?.data;

    TabTitle(t('Program List', { ns: 'common' }));

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isError) {
        return error;
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
            <Box display="flex" justifyContent="flex-end" mb={2} mt={2}>
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
            <ProgramsTable
                data={programs}
                isLoading={isLoading}
                student={props.student}
            />
        </Box>
    );
};

export default ProgramList;
