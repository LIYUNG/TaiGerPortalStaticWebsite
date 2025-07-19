import React from 'react';
import {
    Box,
    Card,
    Grid,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import TasksDistributionBarChart from '../../../components/Charts/TasksDistributionBarChart';
import {
    frequencyDistribution,
    open_tasks_v2,
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E
} from '../../Utils/checking-functions';
import {
    is_new_message_status,
    is_pending_status
} from '../../../utils/contants';
import DEMO from '../../../store/constant';
import { useAuth } from '../../../components/AuthProvider';
import { useTranslation } from 'react-i18next';
import AssignEssayWriterRow from '../MainViewTab/Common/AssignEssayWriterRow';
import AssignEditorRow from '../MainViewTab/Common/AssignEditorRow';
import AssignInterviewTrainerRow from '../MainViewTab/Common/AssignInterviewTrainerRow';
import {
    getMyStudentsApplicationsV2Query,
    getMyStudentsThreadsQuery,
    getTasksOverviewQuery,
    getIsManagerQuery
} from '../../../api/query';
import Loading from '../../../components/Loading/Loading';

const EditorMainView = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data: myStudentsApplications, isLoading: isLoadingApplications } =
        useQuery(
            getMyStudentsApplicationsV2Query({
                userId: user._id,
                queryString: queryString.stringify({
                    decided: 'O'
                })
            })
        );

    const { data: myStudentsThreads, isLoading: isLoadingThreads } = useQuery(
        getMyStudentsThreadsQuery({ userId: user._id })
    );

    const { data: tasksOverview } = useQuery(getTasksOverviewQuery());

    const { data: dataIsManager } = useQuery(
        getIsManagerQuery({ userId: user._id })
    );

    if (isLoadingApplications || isLoadingThreads) {
        return <Loading />;
    }

    const refactored_threads = open_tasks_v2(
        myStudentsThreads.data.data.threads
    );

    const tasks_withMyEssay_arr = refactored_threads.filter((open_task) =>
        [...AGENT_SUPPORT_DOCUMENTS_A, FILE_TYPE_E.essay_required].includes(
            open_task.file_type
        )
            ? open_task.outsourced_user_id?.some(
                  (outsourcedUser) => outsourcedUser._id.toString() === user._id
              )
            : true
    );

    const open_tasks_withMyEssay_arr = tasks_withMyEssay_arr.filter(
        (open_task) => open_task.show && !open_task.isFinalVersion
    );

    const task_distribution = open_tasks_withMyEssay_arr
        .filter(({ isFinalVersion }) => isFinalVersion !== true)
        .map(({ deadline, file_type, show, isPotentials }) => {
            return { deadline, file_type, show, isPotentials };
        });
    const open_distr = frequencyDistribution(task_distribution);

    const sort_date = Object.keys(open_distr).sort();

    const sorted_date_freq_pair = [];
    sort_date.forEach((date) => {
        sorted_date_freq_pair.push({
            name: `${date}`,
            active: open_distr[date].show,
            potentials: open_distr[date].potentials
        });
    });

    const myStudents = myStudentsApplications.data.students;

    const unreplied_task = open_tasks_withMyEssay_arr?.filter((open_task) =>
        is_new_message_status(user, open_task)
    );

    const follow_up_task = open_tasks_withMyEssay_arr?.filter(
        (open_task) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    return (
        <Grid container spacing={2}>
            <Grid item md={3} xs={6}>
                <Card sx={{ p: 2 }}>
                    <Typography>
                        {t('Action required', { ns: 'common' })}
                    </Typography>
                    <Typography variant="h6">
                        <Link
                            component={LinkDom}
                            to={DEMO.CV_ML_RL_CENTER_LINK_TAB('to-do')}
                            underline="hover"
                        >
                            <b>
                                {t('Task', {
                                    ns: 'common',
                                    count: unreplied_task?.length || 0
                                })}
                            </b>
                        </Link>
                    </Typography>
                </Card>
            </Grid>
            <Grid item md={3} xs={6}>
                <Card sx={{ p: 2 }}>
                    <Typography>{t('Follow up', { ns: 'common' })}</Typography>
                    <Typography variant="h6">
                        <Link
                            component={LinkDom}
                            to={DEMO.CV_ML_RL_CENTER_LINK_TAB('follow-up')}
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
            <Grid item md={3} xs={12}>
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
                            <b>{myStudents?.length}</b>
                        </Link>
                    </Typography>
                </Card>
            </Grid>
            <Grid item md={3} xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography>XXXXXX</Typography>
                    <Typography variant="h6">
                        {t('Coming soon', { ns: 'common' })}
                    </Typography>
                </Card>
            </Grid>
            {dataIsManager?.data?.isManager ? (
                <Grid item md={12} xs={12}>
                    <Card sx={{ p: 2 }}>
                        <Typography fontWeight="bold">
                            {t('To Do Tasks', { ns: 'common' })}{' '}
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        {t('Tasks', { ns: 'common' })}
                                    </TableCell>
                                    <TableCell>
                                        {t('Description', { ns: 'common' })}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AssignEditorRow
                                    tasksOverview={tasksOverview?.data || {}}
                                />
                                <AssignEssayWriterRow
                                    tasksOverview={tasksOverview?.data || {}}
                                />
                                <AssignInterviewTrainerRow
                                    tasksOverview={tasksOverview?.data || {}}
                                />
                            </TableBody>
                        </Table>
                    </Card>
                </Grid>
            ) : null}
            <Grid item md={12} xs={12}>
                <Card sx={{ p: 2 }}>
                    <Box>
                        <Typography>My workload over time</Typography>
                        Tasks distribute among the date. Note that CVs, MLs,
                        RLs, and Essay are mixed together.
                        <Typography>
                            <b style={{ color: 'red' }}>active:</b> students
                            decide programs. These will be shown in{' '}
                            <Link
                                component={LinkDom}
                                to={`${DEMO.CV_ML_RL_DASHBOARD_LINK}`}
                                underline="hover"
                            >
                                Tasks Dashboard
                            </Link>
                        </Typography>
                        <Typography>
                            <b style={{ color: '#A9A9A9' }}>potentials:</b>{' '}
                            students do not decide programs yet. But the tasks
                            will be potentially active when they decided.
                        </Typography>
                        <TasksDistributionBarChart
                            data={sorted_date_freq_pair}
                            k="name"
                            value1="active"
                            value2="potentials"
                            yLabel="Tasks"
                        />
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

export default EditorMainView;
