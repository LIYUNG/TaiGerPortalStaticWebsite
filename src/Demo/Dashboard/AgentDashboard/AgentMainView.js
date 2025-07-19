import React, { Fragment, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    Card,
    Link,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Alert,
    Typography,
    Box
} from '@mui/material';
import { isProgramDecided } from '@taiger-common/core';

import { updateAgentBanner } from '../../../api';
import { appConfig } from '../../../config';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    isAnyCVNotAssigned,
    is_any_base_documents_uploaded,
    is_any_programs_ready_to_submit,
    is_any_vpd_missing_v2,
    open_tasks_v2,
    programs_refactor_v2,
    progressBarCounter
} from '../../Utils/checking-functions';
import DEMO from '../../../store/constant';
import ApplicationProgressCardBody from '../../../components/ApplicationProgressCard/ApplicationProgressCardBody';
import ProgramReportCard from '../../Program/ProgramReportCard';
import CVAssignTasksCard from '../MainViewTab/AgentTasks/CVAssignTasksCard';
import ReadyToSubmitTasksCard from '../MainViewTab/AgentTasks/ReadyToSubmitTasksCard';
import NoEnoughDecidedProgramsTasksCard from '../MainViewTab/AgentTasks/NoEnoughDecidedProgramsTasksCard';
import VPDToSubmitTasksCard from '../MainViewTab/AgentTasks/VPDToSubmitTasksCard';
import { useAuth } from '../../../components/AuthProvider';
import NoProgramStudentTable from '../MainViewTab/AgentTasks/NoProgramStudentTable';
import BaseDocumentCheckingTable from '../MainViewTab/AgentTasks/BaseDocumentCheckingTable';
import ProgramSpecificDocumentCheckCard from '../MainViewTab/AgentTasks/ProgramSpecificDocumentCheckCard';
import Banner from '../../../components/Banner/Banner';
import {
    is_new_message_status,
    is_pending_status
} from '../../../utils/contants';
import { useQuery } from '@tanstack/react-query';
import {
    getMyStudentsThreadsQuery,
    getMyStudentsApplicationsV2Query
} from '../../../api/query';
import Loading from '../../../components/Loading/Loading';

const AgentMainView = (props) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data: myStudentsApplications, isLoading: isLoadingApplications } =
        useQuery(getMyStudentsApplicationsV2Query({ userId: user._id }));

    const { data: myStudentsThreads, isLoading: isLoadingThreads } = useQuery(
        getMyStudentsThreadsQuery({ userId: user._id })
    );

    const [agentMainViewState, setAgentMainViewState] = useState({
        error: '',
        notification: props.notification,
        collapsedRows: {}
    });

    const removeAgentBanner = (e, notification_key, student_id) => {
        e.preventDefault();
        const temp_user = { ...user };
        const idx = temp_user.agent_notification[
            `${notification_key}`
        ].findIndex((student_obj) => student_obj.student_id === student_id);
        temp_user.agent_notification[`${notification_key}`].splice(idx, 1);
        setAgentMainViewState({
            ...agentMainViewState,
            notification: temp_user.agent_notification,
            user: temp_user
        });
        updateAgentBanner(notification_key, student_id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setAgentMainViewState((prevState) => ({
                        ...prevState,
                        success: success,
                        res_status: status
                    }));
                } else {
                    setAgentMainViewState((prevState) => ({
                        ...prevState,
                        res_status: status
                    }));
                }
            },
            (error) => {
                setAgentMainViewState({
                    ...agentMainViewState,
                    error,
                    res_status: 500
                });
            }
        );
    };

    const handleCollapse = (index) => {
        setAgentMainViewState({
            ...agentMainViewState,
            collapsedRows: {
                ...agentMainViewState.collapsedRows,
                [index]: !agentMainViewState.collapsedRows[index]
            }
        });
    };

    if (isLoadingApplications || isLoadingThreads) {
        return <Loading />;
    }
    const applications_arr = programs_refactor_v2(
        myStudentsApplications.data.applications
    )
        .filter(
            (application) =>
                isProgramDecided(application) &&
                application.closed === '-' &&
                application.program_name !== 'No Program'
        )
        .sort((a, b) =>
            a.application_deadline > b.application_deadline ? 1 : -1
        );

    const myStudents = myStudentsApplications.data.students;

    const refactored_threads = open_tasks_v2(
        myStudentsThreads.data.data.threads
    );

    const refactored_agent_threads = refactored_threads.filter(
        (open_task) =>
            [...AGENT_SUPPORT_DOCUMENTS_A].includes(open_task.file_type) ||
            open_task.outsourced_user_id?.some(
                (outsourcedUser) =>
                    outsourcedUser._id.toString() === user._id.toString()
            )
    );

    const open_tasks_withMyEssay_arr = refactored_agent_threads.filter(
        (open_task) => open_task.show && !open_task.isFinalVersion
    );

    const new_message_tasks = open_tasks_withMyEssay_arr.filter((open_task) =>
        is_new_message_status(user, open_task)
    );

    const follow_up_task = open_tasks_withMyEssay_arr.filter(
        (open_task) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={1}>
                <Grid item sm={12} xs={12}>
                    {agentMainViewState.notification?.isRead_new_base_docs_uploaded?.map(
                        (student, i) => (
                            <Card key={i} sx={{ mb: 1 }}>
                                <Banner
                                    bg="danger"
                                    link_name={<LaunchIcon fontSize="small" />}
                                    notification_key="isRead_new_base_docs_uploaded"
                                    path={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                        student.student_id,
                                        DEMO.PROFILE_HASH
                                    )}`}
                                    removeBanner={(e) =>
                                        removeAgentBanner(
                                            e,
                                            'isRead_new_base_docs_uploaded',
                                            student.student_id
                                        )
                                    }
                                    student_id={student.student_id}
                                    text={`${t(
                                        'There are new base documents uploaded by',
                                        {
                                            ns: 'common'
                                        }
                                    )} ${student.student_firstname} ${student.student_lastname}`}
                                    title="warning"
                                />
                            </Card>
                        )
                    )}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography>
                            {t('Action required', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h6">
                            <Link
                                component={LinkDom}
                                to={DEMO.AGENT_SUPPORT_DOCUMENTS('to-do')}
                                underline="hover"
                            >
                                <b>
                                    {t('Task', {
                                        ns: 'common',
                                        count: new_message_tasks?.length || 0
                                    })}
                                </b>
                            </Link>
                        </Typography>
                    </Card>
                </Grid>
                <Grid item sm={3} xs={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography>
                            {t('Follow up', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h6">
                            <Link
                                component={LinkDom}
                                to={DEMO.AGENT_SUPPORT_DOCUMENTS('follow-up')}
                                underline="hover"
                            >
                                <b>
                                    {t('Task', {
                                        ns: 'common',
                                        count: follow_up_task?.length || 0
                                    })}
                                </b>
                            </Link>
                        </Typography>
                    </Card>
                </Grid>
                <Grid item sm={3} xs={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography>
                            {t('student-count', {
                                ns: 'common'
                            })}
                        </Typography>
                        <Typography variant="h6">
                            <Link
                                component={LinkDom}
                                to={DEMO.STUDENT_APPLICATIONS_LINK}
                                underline="hover"
                            >
                                <b>{myStudents?.length || 0}</b>
                            </Link>
                        </Typography>
                    </Card>
                </Grid>
                <Grid item sm={3} xs={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography>{t('XXXX', { ns: 'common' })}</Typography>
                        <Typography variant="h6">Comming soon</Typography>
                    </Card>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Card>
                        <Alert severity="error">
                            <Typography>
                                {t('Upcoming Applications', {
                                    ns: 'dashboard'
                                })}{' '}
                                ({applications_arr?.length}):
                            </Typography>
                        </Alert>
                        <div className="card-scrollable-body">
                            <Table size="small">
                                <TableBody>
                                    {applications_arr.map(
                                        (application, idx) => (
                                            <Fragment key={idx}>
                                                <TableRow
                                                    className="text-black"
                                                    onClick={() =>
                                                        handleCollapse(idx)
                                                    }
                                                >
                                                    <TableCell>
                                                        {progressBarCounter(
                                                            application.student,
                                                            application.application
                                                        )}
                                                        %
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            component={LinkDom}
                                                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                                application
                                                                    .studentId
                                                                    ._id,
                                                                DEMO.PROFILE_HASH
                                                            )}`}
                                                            underline="hover"
                                                        >
                                                            <b>
                                                                {
                                                                    application.firstname_lastname
                                                                }{' '}
                                                            </b>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            application.application_deadline
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {application.school}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            application.program_name
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                                {agentMainViewState
                                                    .collapsedRows[idx] ? (
                                                    <TableRow>
                                                        <TableCell colSpan="12">
                                                            <ApplicationProgressCardBody
                                                                application={
                                                                    application.application
                                                                }
                                                                student={
                                                                    application.student
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null}
                                            </Fragment>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </Grid>
                {is_any_programs_ready_to_submit(myStudents) ? (
                    <Grid item md={6} sm={12}>
                        <ReadyToSubmitTasksCard
                            applications={applications_arr}
                            students={myStudents}
                        />
                    </Grid>
                ) : null}
                {appConfig.vpdEnable &&
                is_any_vpd_missing_v2(applications_arr) ? (
                    <Grid item md={4} xs={12}>
                        <VPDToSubmitTasksCard
                            applications={applications_arr}
                            students={myStudents}
                            user={user}
                        />
                    </Grid>
                ) : null}
                <Grid item md={4} sm={6} xs={12}>
                    <ProgramReportCard />
                </Grid>
                {is_any_base_documents_uploaded(myStudents) ? (
                    <Grid item md={4} sm={6} xs={12}>
                        <BaseDocumentCheckingTable students={myStudents} />
                    </Grid>
                ) : null}
                {isAnyCVNotAssigned(myStudents) ? (
                    <Grid item md={4} sm={6} xs={12}>
                        <CVAssignTasksCard students={myStudents} user={user} />
                    </Grid>
                ) : null}
                <NoProgramStudentTable students={myStudents} />
                <Grid item md={4} sm={6} xs={12}>
                    <ProgramSpecificDocumentCheckCard
                        refactored_threads={refactored_threads}
                        students={myStudents}
                    />
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                    <NoEnoughDecidedProgramsTasksCard
                        students={myStudents}
                        user={user}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AgentMainView;
