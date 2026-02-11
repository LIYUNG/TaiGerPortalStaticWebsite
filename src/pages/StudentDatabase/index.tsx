import React from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import useStudents from '@hooks/useStudents';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { useTranslation } from 'react-i18next';
import { getStudentsV3Query } from '@api/query';
import { StudentsTable } from './StudentsTable';
import { student_transform } from '../Utils/util_functions';

const StudentDatabase = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data: { data: fetchedAllStudents } = { data: [] }, isLoading } =
        useQuery(getStudentsV3Query(queryString.stringify()));

    const {
        res_modal_status,
        res_modal_message,
        ConfirmError,
        students,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus
    } = useStudents({
        students: fetchedAllStudents
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const studentsTransformed = student_transform(students);

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
                    {t('Students Database', { ns: 'common' })} (
                    {students?.length})
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
            <StudentsTable
                data={studentsTransformed}
                isLoading={isLoading}
                submitUpdateAgentlist={submitUpdateAgentlist}
                submitUpdateAttributeslist={submitUpdateAttributeslist}
                submitUpdateEditorlist={submitUpdateEditorlist}
                updateStudentArchivStatus={updateStudentArchivStatus}
            />

            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
        </Box>
    );
};

export default StudentDatabase;
