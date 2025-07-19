import React from 'react';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    Link,
    Typography
} from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';

import CVMLRLOverview from '../CVMLRLCenter/CVMLRLOverview';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E,
    frequencyDistribution,
    open_tasks_v2
} from '../Utils/checking-functions';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import TasksDistributionBarChart from '../../components/Charts/TasksDistributionBarChart';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import {
    is_my_fav_message_status,
    is_new_message_status,
    is_pending_status
} from '../../utils/contants';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentsThreadsQuery } from '../../api/query';

// TODO TEST_CASE
const EditorPage = () => {
    const { user_id } = useParams();
    const { user } = useAuth();

    const { data: myStudentsThreads, isLoading: isLoadingThreads } = useQuery(
        getMyStudentsThreadsQuery({
            userId: user_id,
            queryString: queryString.stringify({
                isFinalVersion: 'false'
            })
        })
    );

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoadingThreads) {
        return <Loading />;
    }

    TabTitle(
        `Editor: ${myStudentsThreads.data.user.firstname}, ${myStudentsThreads.data.user.lastname}`
    );

    const refactored_threads = open_tasks_v2(myStudentsThreads.data.threads);

    const tasks_withMyEssay_arr = refactored_threads.filter((open_task) =>
        [...AGENT_SUPPORT_DOCUMENTS_A, FILE_TYPE_E.essay_required].includes(
            open_task.file_type
        )
            ? open_task.outsourced_user_id?.some(
                  (outsourcedUser) => outsourcedUser._id.toString() === user_id
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

    const new_message_tasks = open_tasks_withMyEssay_arr?.filter((open_task) =>
        is_new_message_status(user, open_task)
    );

    const fav_message_tasks = open_tasks_withMyEssay_arr?.filter((open_task) =>
        is_my_fav_message_status(user, open_task)
    );

    const followup_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    const pending_progress_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id === '- None - '
    );

    const closed_tasks = tasks_withMyEssay_arr.filter(
        (open_task) => open_task.show && open_task.isFinalVersion
    );

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
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.TEAM_MEMBERS_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName} Team
                </Link>
                <Typography color="text.primary">
                    {myStudentsThreads.data.user.firstname}{' '}
                    {myStudentsThreads.data.user.lastname}
                    {` (${myStudentsThreads.data.threads?.length})`}
                </Typography>
            </Breadcrumbs>
            <Box>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6">
                        {myStudentsThreads.data.user.firstname}{' '}
                        {myStudentsThreads.data.user.lastname} Open Tasks
                        Distribution
                    </Typography>
                    <Typography>
                        Tasks distribute among the date. Note that CVs, MLs,
                        RLs, and Essay are mixed together.
                    </Typography>
                    <Typography>
                        <b style={{ color: 'red' }}>active:</b> students decide
                        programs. These will be shown in{' '}
                        <LinkDom to={`${DEMO.CV_ML_RL_DASHBOARD_LINK}`}>
                            Tasks Dashboard
                        </LinkDom>
                    </Typography>
                    <Typography>
                        <b style={{ color: '#A9A9A9' }}>potentials:</b> students
                        do not decide programs yet. But the tasks will be
                        potentially active when they decided.
                    </Typography>
                    <TasksDistributionBarChart
                        data={sorted_date_freq_pair}
                        k="name"
                        value1="active"
                        value2="potentials"
                        yLabel="Tasks"
                    />
                </Card>
            </Box>
            <CVMLRLOverview
                closed_tasks={closed_tasks}
                fav_message_tasks={fav_message_tasks}
                followup_tasks={followup_tasks}
                new_message_tasks={new_message_tasks}
                pending_progress_tasks={pending_progress_tasks}
            />
            <Box>
                <Link
                    component={LinkDom}
                    to={`${DEMO.TEAM_EDITOR_ARCHIV_LINK(
                        myStudentsThreads.data.user._id.toString()
                    )}`}
                >
                    <Button color="primary" variant="contained">
                        See Archiv Student
                    </Button>
                </Link>
            </Box>
        </Box>
    );
};

export default EditorPage;
