import React, { useMemo } from 'react';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Link,
    Typography,
    Grid,
    Avatar,
    Chip,
    Stack,
    Divider,
    Tooltip
} from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';
import {
    Description as DescriptionIcon,
    Notifications as NotificationsIcon,
    ReplyAll as ReplyAllIcon,
    CheckCircleOutline as CheckCircleIcon,
    FolderOpen as FolderOpenIcon
} from '@mui/icons-material';

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
            queryString: queryString.stringify({})
        })
    );

    // Calculate all data and statistics using useMemo (must be before any conditional returns)
    const {
        sorted_date_freq_pair,
        new_message_tasks,
        fav_message_tasks,
        followup_tasks,
        pending_progress_tasks,
        closed_tasks,
        stats,
        editorUser
    } = useMemo(() => {
        if (!myStudentsThreads?.data) {
            return {
                sorted_date_freq_pair: [],
                new_message_tasks: [],
                fav_message_tasks: [],
                followup_tasks: [],
                pending_progress_tasks: [],
                closed_tasks: [],
                stats: {
                    totalTasks: 0,
                    newMessages: 0,
                    followUps: 0,
                    pendingProgress: 0,
                    favorites: 0,
                    completed: 0,
                    completionRate: 0
                },
                editorUser: null
            };
        }

        const open_tasks_arr = open_tasks_v2(myStudentsThreads.data.threads);

        const tasksWithMyEssay = open_tasks_arr.filter((open_task) =>
            [...AGENT_SUPPORT_DOCUMENTS_A, FILE_TYPE_E.essay_required].includes(
                open_task.file_type
            )
                ? open_task.outsourced_user_id?.some(
                      (outsourcedUser) =>
                          outsourcedUser._id.toString() === user_id
                  )
                : true
        );

        const openTasksWithMyEssay = tasksWithMyEssay.filter(
            (open_task) => open_task.show && !open_task.isFinalVersion
        );

        const task_distribution = openTasksWithMyEssay
            .filter(({ isFinalVersion }) => isFinalVersion !== true)
            .map(({ deadline, file_type, show, isPotentials }) => {
                return { deadline, file_type, show, isPotentials };
            });
        const open_distr = frequencyDistribution(task_distribution);

        const sort_date = Object.keys(open_distr).sort();

        const sortedDateFreqPair = [];
        sort_date.forEach((date) => {
            sortedDateFreqPair.push({
                name: `${date}`,
                active: open_distr[date].show,
                potentials: open_distr[date].potentials
            });
        });

        const newMessages = openTasksWithMyEssay?.filter((open_task) =>
            is_new_message_status(user, open_task)
        );

        const favMessages = openTasksWithMyEssay?.filter((open_task) =>
            is_my_fav_message_status(user, open_task)
        );

        const followups = openTasksWithMyEssay?.filter(
            (open_task) =>
                is_pending_status(user, open_task) &&
                open_task.latest_message_left_by_id !== '- None - '
        );

        const pendingProgress = openTasksWithMyEssay?.filter(
            (open_task) =>
                is_pending_status(user, open_task) &&
                open_task.latest_message_left_by_id === '- None - '
        );

        const closedTasks = tasksWithMyEssay.filter(
            (open_task) => open_task.show && open_task.isFinalVersion
        );

        const calculatedStats = {
            totalTasks: openTasksWithMyEssay.length,
            newMessages: newMessages.length,
            followUps: followups.length,
            pendingProgress: pendingProgress.length,
            favorites: favMessages.length,
            completed: closedTasks.length,
            completionRate:
                tasksWithMyEssay.length > 0
                    ? (
                          (closedTasks.length / tasksWithMyEssay.length) *
                          100
                      ).toFixed(1)
                    : 0
        };

        return {
            sorted_date_freq_pair: sortedDateFreqPair,
            new_message_tasks: newMessages,
            fav_message_tasks: favMessages,
            followup_tasks: followups,
            pending_progress_tasks: pendingProgress,
            closed_tasks: closedTasks,
            stats: calculatedStats,
            editorUser: myStudentsThreads.data.user
        };
    }, [myStudentsThreads, user, user_id]);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoadingThreads) {
        return <Loading />;
    }

    if (!editorUser) {
        return <Loading />;
    }

    TabTitle(`Editor: ${editorUser.firstname}, ${editorUser.lastname}`);

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
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
                    {editorUser.firstname} {editorUser.lastname}
                </Typography>
            </Breadcrumbs>

            {/* Editor Header Card */}
            <Card
                sx={{
                    mb: 3,
                    background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={editorUser?.pictureUrl}
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'white',
                                color: '#667eea',
                                fontSize: '2rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {editorUser?.firstname?.[0]}
                            {editorUser?.lastname?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}
                                variant="h4"
                            >
                                {editorUser.firstname} {editorUser.lastname}
                            </Typography>
                            <Stack
                                direction="row"
                                flexWrap="wrap"
                                spacing={1}
                                useFlexGap
                            >
                                <Tooltip title="Total number of open document editing tasks">
                                    <Chip
                                        icon={
                                            <DescriptionIcon
                                                sx={{
                                                    color: 'white !important'
                                                }}
                                            />
                                        }
                                        label={`${stats.totalTasks} Open Tasks`}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title="Tasks with new unread messages">
                                    <Chip
                                        icon={
                                            <NotificationsIcon
                                                sx={{
                                                    color: 'white !important'
                                                }}
                                            />
                                        }
                                        label={`${stats.newMessages} New`}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title="Tasks requiring follow-up response">
                                    <Chip
                                        icon={
                                            <ReplyAllIcon
                                                sx={{
                                                    color: 'white !important'
                                                }}
                                            />
                                        }
                                        label={`${stats.followUps} Follow-ups`}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title="Percentage of tasks marked as final version">
                                    <Chip
                                        icon={
                                            <CheckCircleIcon
                                                sx={{
                                                    color: 'white !important'
                                                }}
                                            />
                                        }
                                        label={`${stats.completionRate}% Complete`}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Tooltip>
                            </Stack>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title="Total open editing tasks (CVs, MLs, RLs, Essays) that are not yet finalized"
                    >
                        <Card sx={{ height: '100%', cursor: 'help' }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            Open Tasks
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.totalTasks}
                                        </Typography>
                                        <Typography
                                            color="textSecondary"
                                            variant="caption"
                                        >
                                            Active editing work
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        <DescriptionIcon fontSize="large" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>

                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title="Tasks with new messages from students that haven't been read yet"
                    >
                        <Card sx={{ height: '100%', cursor: 'help' }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            New Messages
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.newMessages}
                                        </Typography>
                                        <Typography
                                            color="error.main"
                                            variant="caption"
                                        >
                                            Needs attention
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#ffebee',
                                            color: '#d32f2f',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        <NotificationsIcon fontSize="large" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>

                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title="Tasks where you've provided feedback and are waiting for student response"
                    >
                        <Card sx={{ height: '100%', cursor: 'help' }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            Follow-ups
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.followUps}
                                        </Typography>
                                        <Typography
                                            color="warning.main"
                                            variant="caption"
                                        >
                                            Awaiting student
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#fff3e0',
                                            color: '#ff9800',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        <ReplyAllIcon fontSize="large" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>

                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title={
                            <Box>
                                <Typography variant="body2">
                                    Tasks marked as final version (completed)
                                </Typography>
                                <Typography sx={{ mt: 0.5 }} variant="caption">
                                    {stats.completionRate}% completion rate
                                </Typography>
                            </Box>
                        }
                    >
                        <Card sx={{ height: '100%', cursor: 'help' }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            Completed
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.completed}
                                        </Typography>
                                        <Typography
                                            color="success.main"
                                            variant="caption"
                                        >
                                            Final versions
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#e8f5e9',
                                            color: '#4caf50',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        <CheckCircleIcon fontSize="large" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Tasks Distribution Chart */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Typography sx={{ mb: 1 }} variant="h6">
                    Open Tasks Distribution
                </Typography>
                <Typography sx={{ mb: 1 }} variant="body2">
                    Tasks distribute among the date. Note that CVs, MLs, RLs,
                    and Essay are mixed together.
                </Typography>
                <Typography sx={{ mb: 1 }} variant="body2">
                    <b style={{ color: 'red' }}>active:</b> students decide
                    programs. These will be shown in{' '}
                    <LinkDom to={`${DEMO.CV_ML_RL_DASHBOARD_LINK}`}>
                        Tasks Dashboard
                    </LinkDom>
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body2">
                    <b style={{ color: '#A9A9A9' }}>potentials:</b> students do
                    not decide programs yet. But the tasks will be potentially
                    active when they decided.
                </Typography>
                <TasksDistributionBarChart
                    data={sorted_date_freq_pair}
                    k="name"
                    value1="active"
                    value2="potentials"
                    yLabel="Tasks"
                />
            </Card>

            {/* Task Overview */}
            <CVMLRLOverview
                closed_tasks={closed_tasks}
                fav_message_tasks={fav_message_tasks}
                followup_tasks={followup_tasks}
                new_message_tasks={new_message_tasks}
                pending_progress_tasks={pending_progress_tasks}
            />

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Link
                    component={LinkDom}
                    style={{ textDecoration: 'none' }}
                    to={`${DEMO.TEAM_EDITOR_ARCHIV_LINK(
                        editorUser._id.toString()
                    )}`}
                >
                    <Button
                        color="primary"
                        startIcon={<FolderOpenIcon />}
                        variant="contained"
                    >
                        View Archived Students
                    </Button>
                </Link>
            </Box>
        </Box>
    );
};

export default EditorPage;
