import { Fragment, useState, type MouseEvent } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import { alpha } from '@mui/material/styles';
import { isProgramDecided } from '@taiger-common/core';
import queryString from 'query-string';

import { updateAgentBanner } from '@/api';
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
} from '../../Utils/util_functions';
import DEMO from '@store/constant';
import ApplicationProgressCardBody from '@components/ApplicationProgressCard/ApplicationProgressCardBody';
import ProgramReportCard from '../../Program/ProgramReportCard';
import CVAssignTasksCard from '../MainViewTab/AgentTasks/CVAssignTasksCard';
import ReadyToSubmitTasksCard from '../MainViewTab/AgentTasks/ReadyToSubmitTasksCard';
import NoEnoughDecidedProgramsTasksCard from '../MainViewTab/AgentTasks/NoEnoughDecidedProgramsTasksCard';
import VPDToSubmitTasksCard from '../MainViewTab/AgentTasks/VPDToSubmitTasksCard';
import { useAuth } from '@components/AuthProvider';
import NoProgramStudentTable from '../MainViewTab/AgentTasks/NoProgramStudentTable';
import BaseDocumentCheckingTable from '../MainViewTab/AgentTasks/BaseDocumentCheckingTable';
import ProgramSpecificDocumentCheckCard from '../MainViewTab/AgentTasks/ProgramSpecificDocumentCheckCard';
import { is_new_message_status, is_pending_status } from '@utils/contants';
import { useMyStudentsApplicationsV2 } from '@hooks/useMyStudentsApplicationsV2';
import { useMyStudentsThreads } from '@hooks/useMyStudentsThreads';
import { useStudentsV3 } from '@hooks/useStudentsV3';
import Loading from '@components/Loading/Loading';
import {
    IApplication,
    IUserWithId
} from '@taiger-common/model';

const AgentMainView = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data: myStudentsApplications, isLoading: isLoadingApplications } =
        useMyStudentsApplicationsV2({ userId: user._id, decided: 'O' });

    const { data: fetchedMyStudents, isLoading: isLoadingMyStudents } =
        useStudentsV3({ agents: user._id, archiv: false });

    const { data: myStudentsThreads, isLoading: isLoadingThreads } =
        useMyStudentsThreads(
            user?._id
                ? {
                      userId: user._id,
                      queryString: queryString.stringify({
                          isFinalVersion: 'false'
                      })
                  }
                : null
        );

    const [agentMainViewState, setAgentMainViewState] = useState({
        error: '',
        collapsedRows: {}
    });

    const handleCollapse = (index: number) => {
        setAgentMainViewState({
            ...agentMainViewState,
            collapsedRows: {
                ...agentMainViewState.collapsedRows,
                [index]: !agentMainViewState.collapsedRows[index]
            }
        });
    };

    if (isLoadingApplications || isLoadingThreads || isLoadingMyStudents) {
        return <Loading />;
    }
    const applications_arr = programs_refactor_v2(
        myStudentsApplications.applications ?? []
    )
        .filter(
            (application: IApplication) =>
                isProgramDecided(application) &&
                application.closed === '-' &&
                application.program_name !== 'No Program'
        )
        .sort((a, b) =>
            a.application_deadline > b.application_deadline ? 1 : -1
        );

    const myStudents = fetchedMyStudents;

    const refactored_threads = open_tasks_v2(myStudentsThreads.threads);

    const refactored_agent_threads = refactored_threads.filter(
        (open_task) =>
            [...AGENT_SUPPORT_DOCUMENTS_A].includes(open_task.file_type) ||
            open_task.outsourced_user_id?.some(
                (outsourcedUser: IUserWithId) =>
                    outsourcedUser._id?.toString() === user?._id?.toString()
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
                <Grid item sm={3} xs={6}>
                    <Link
                        component={LinkDom}
                        to={DEMO.AGENT_SUPPORT_DOCUMENTS('to-do')}
                        underline="none"
                        color="inherit"
                        sx={{ display: 'block', height: '100%' }}
                    >
                        <Card
                            sx={{
                                p: 2,
                                height: '100%',
                                cursor: 'pointer',
                                ...((new_message_tasks?.length ?? 0) > 0
                                    ? {
                                          bgcolor: 'error.light',
                                          borderLeft: 4,
                                          borderColor: 'error.main'
                                      }
                                    : {}),
                                transition:
                                    'box-shadow 0.2s, background-color 0.2s',
                                '&:hover': {
                                    boxShadow: 2,
                                    backgroundColor: (theme) =>
                                        (new_message_tasks?.length ?? 0) > 0
                                            ? alpha(
                                                  theme.palette.error.main,
                                                  0.2
                                              )
                                            : theme.palette.action.hover
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1
                                }}
                            >
                                {(new_message_tasks?.length ?? 0) > 0 ? (
                                    <AssignmentIcon
                                        fontSize="small"
                                        sx={{ color: 'white' }}
                                    />
                                ) : (
                                    <CheckCircleIcon
                                        fontSize="small"
                                        color="success"
                                    />
                                )}
                                <Typography
                                    variant="body2"
                                    color={
                                        (new_message_tasks?.length ?? 0) > 0
                                            ? 'white'
                                            : 'text.secondary'
                                    }
                                >
                                    {(new_message_tasks?.length ?? 0) > 0
                                        ? t('Action required', { ns: 'common' })
                                        : t('No Action', { ns: 'common' })}
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                component="p"
                                fontWeight={
                                    (new_message_tasks?.length ?? 0) > 0
                                        ? 'bold'
                                        : 'normal'
                                }
                                color={
                                    (new_message_tasks?.length ?? 0) > 0
                                        ? 'white'
                                        : 'primary.main'
                                }
                            >
                                {t('Task', {
                                    ns: 'common',
                                    count: new_message_tasks?.length || 0
                                })}
                            </Typography>
                        </Card>
                    </Link>
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
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.25
                                                            }}
                                                        >
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                            >
                                                                {progressBarCounter(
                                                                    application.student,
                                                                    application.application
                                                                )}
                                                                %
                                                            </Typography>
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    application.application_deadline
                                                                }
                                                            </Typography>
                                                        </Box>
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
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 0.25
                                                            }}
                                                        >
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                            >
                                                                {application.school}
                                                            </Typography>
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    application.program_name
                                                                }
                                                            </Typography>
                                                        </Box>
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
                {/* TODO: Add NoProgramStudentTable */}
                {false && <NoProgramStudentTable students={myStudents} />}
                <Grid item md={4} sm={6} xs={12}>
                    <ProgramSpecificDocumentCheckCard
                        refactored_threads={refactored_threads}
                    />
                </Grid>
                {/* TODO: Add NoEnoughDecidedProgramsTasksCard */}
                {false && (
                    <Grid item md={4} sm={6} xs={12}>
                        <NoEnoughDecidedProgramsTasksCard
                            students={myStudents}
                            user={user}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default AgentMainView;
