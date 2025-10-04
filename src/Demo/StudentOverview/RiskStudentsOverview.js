import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    is_TaiGer_Admin,
    is_TaiGer_Editor,
    is_TaiGer_role
} from '@taiger-common/core';
import queryString from 'query-string';

import { TabTitle } from '../Utils/TabTitle';
import { Navigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import StudentOverviewTable from '../../components/StudentOverviewTable';
import { useAuth } from '../../components/AuthProvider';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { appConfig } from '../../config';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getActiveStudentsQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';

const RiskStudentsOverview = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const role = is_TaiGer_Editor(user) ? 'editors' : 'agents';
    const params = is_TaiGer_Admin(user) ? {} : { [role]: user._id };
    params.archiv = false;
    const { data, isLoading } = useQuery(
        getActiveStudentsQuery(queryString.stringify(params))
    );

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }
    const students = data?.data;
    TabTitle('Risk Students Overview');

    console.log(students);

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
                    {t('Risk Student Overview', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <StudentOverviewTable
                riskOnly={true}
                students={
                    is_TaiGer_Admin(user)
                        ? students
                        : students?.filter(
                              (student) =>
                                  student.editors.some(
                                      (editor) =>
                                          editor._id === user._id.toString()
                                  ) ||
                                  student.agents.some(
                                      (agent) =>
                                          agent._id === user._id.toString()
                                  )
                          )
                }
                title="All"
                user={user}
            />
        </Box>
    );
};

export default RiskStudentsOverview;
