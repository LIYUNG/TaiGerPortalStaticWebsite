import { useMemo } from 'react';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Button,
    Link,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Stack,
    Divider,
    Tooltip
} from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import {
    PersonOutline as PersonIcon,
    Assignment as AssignmentIcon,
    CheckCircleOutline as CheckCircleIcon,
    PendingActions as PendingIcon,
    FolderOpen as FolderOpenIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    HelpOutline as HelpOutlineIcon,
    Send as SendIcon,
    Info as InfoIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import ApplicationOverviewTabs from '../ApplicantsOverview/ApplicationOverviewTabs';

import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { useMyStudentsApplicationsStats } from '@hooks/useMyStudentsApplicationsStats';
import { formatDate } from '../Utils/util_functions';

const AgentPage = () => {
    const { user_id } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();

    const { data: statsData, isLoading } = useMyStudentsApplicationsStats(
        user_id ?? '',
        { enabled: !!user_id }
    );

    const stats = useMemo(() => {
        const s = statsData?.stats;
        if (!s) {
            return {
                totalStudents: 0,
                totalApplications: 0,
                decidedYesApplications: 0,
                decidedNoApplications: 0,
                undecidedApplications: 0,
                submittedApplications: 0,
                pendingApplications: 0,
                submissionRate: 0,
                decisionRate: 0
            };
        }

        const totalDecidedCount =
            s.decidedYesApplications + s.decidedNoApplications;

        return {
            ...s,
            submissionRate:
                s.decidedYesApplications > 0
                    ? (
                          (s.submittedApplications / s.decidedYesApplications) *
                          100
                      ).toFixed(1)
                    : 0,
            decisionRate:
                s.totalApplications > 0
                    ? ((totalDecidedCount / s.totalApplications) * 100).toFixed(
                          1
                      )
                    : 0
        };
    }, [statsData]);

    if (isLoading) {
        return <Loading />;
    }

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const agentUser = statsData?.user;

    if (!statsData) {
        return <Loading />;
    }

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
                    {agentUser?.firstname} {agentUser?.lastname}
                </Typography>
            </Breadcrumbs>

            <Card
                sx={{
                    mb: 3,
                    background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Avatar
                                src={agentUser?.pictureUrl}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'white',
                                    color: '#667eea',
                                    fontSize: '2rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {agentUser?.firstname?.[0]}
                                {agentUser?.lastname?.[0]}
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
                                    {agentUser?.firstname} {agentUser?.lastname}
                                </Typography>
                                <Stack
                                    direction="row"
                                    flexWrap="wrap"
                                    spacing={1}
                                    useFlexGap
                                >
                                    <Tooltip title="Number of active students assigned to this agent">
                                        <Chip
                                            icon={
                                                <PersonIcon
                                                    sx={{
                                                        color: 'white !important'
                                                    }}
                                                />
                                            }
                                            label={`${stats.totalStudents} Students`}
                                            sx={{
                                                bgcolor:
                                                    'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Total number of applications being managed">
                                        <Chip
                                            icon={
                                                <AssignmentIcon
                                                    sx={{
                                                        color: 'white !important'
                                                    }}
                                                />
                                            }
                                            label={`${stats.totalApplications} Apps`}
                                            sx={{
                                                bgcolor:
                                                    'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Decision status breakdown: Yes (Student will apply) / No (Student won't apply) / Undecided (Not yet decided)">
                                        <Chip
                                            icon={
                                                <InfoIcon
                                                    sx={{
                                                        color: 'white !important'
                                                    }}
                                                />
                                            }
                                            label={`${stats.decidedYesApplications} Yes / ${stats.decidedNoApplications} No / ${stats.undecidedApplications} TBD`}
                                            sx={{
                                                bgcolor:
                                                    'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Percentage of decided applications that have been submitted">
                                        <Chip
                                            icon={
                                                <SendIcon
                                                    sx={{
                                                        color: 'white !important'
                                                    }}
                                                />
                                            }
                                            label={`${stats.submissionRate}% Submitted`}
                                            sx={{
                                                bgcolor:
                                                    'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Tooltip>
                                </Stack>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 0.5
                            }}
                        >
                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                {t('Last Login', { ns: 'common' })}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                <AccessTimeIcon
                                    sx={{
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {formatDate(agentUser?.lastLoginAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title="Number of active (non-archived) students currently assigned to this agent"
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
                                            Active Students
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.totalStudents}
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
                                        <PersonIcon fontSize="large" />
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
                                    Total applications breakdown:
                                </Typography>
                                <Box
                                    sx={{
                                        mt: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <ThumbUpIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {stats.decidedYesApplications} - Student
                                        decided to apply
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <ThumbDownIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {stats.decidedNoApplications} - Student
                                        decided not to apply
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <HelpOutlineIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {stats.undecidedApplications} - Not yet
                                        decided
                                    </Typography>
                                </Box>
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
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            Total Applications
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.totalApplications}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 0.5
                                            }}
                                        >
                                            <ThumbUpIcon
                                                sx={{
                                                    fontSize: 14,
                                                    color: 'success.main'
                                                }}
                                            />
                                            <Typography
                                                color="textSecondary"
                                                variant="caption"
                                            >
                                                {stats.decidedYesApplications}
                                            </Typography>
                                            <ThumbDownIcon
                                                sx={{
                                                    fontSize: 14,
                                                    color: 'error.main',
                                                    ml: 0.5
                                                }}
                                            />
                                            <Typography
                                                color="textSecondary"
                                                variant="caption"
                                            >
                                                {stats.decidedNoApplications}
                                            </Typography>
                                            <HelpOutlineIcon
                                                sx={{
                                                    fontSize: 14,
                                                    color: 'warning.main',
                                                    ml: 0.5
                                                }}
                                            />
                                            <Typography
                                                color="textSecondary"
                                                variant="caption"
                                            >
                                                {stats.undecidedApplications}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: '#f3e5f5',
                                            color: '#9c27b0',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        <AssignmentIcon fontSize="large" />
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
                                    Applications decided &quot;Yes&quot; and
                                    submitted to universities
                                </Typography>
                                <Typography sx={{ mt: 0.5 }} variant="caption">
                                    {stats.submissionRate}% of decided
                                    applications are submitted
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
                                            Submitted
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.submittedApplications}
                                        </Typography>
                                        <Typography
                                            color="success.main"
                                            variant="caption"
                                        >
                                            of {stats.decidedYesApplications}{' '}
                                            decided
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

                <Grid item md={3} sm={6} xs={12}>
                    <Tooltip
                        arrow
                        title={
                            <Box>
                                <Typography variant="body2">
                                    Applications where student decided
                                    &quot;Yes&quot; but not yet submitted
                                </Typography>
                                <Typography sx={{ mt: 0.5 }} variant="caption">
                                    Actively being worked on for submission
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
                                            In Progress
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                            variant="h4"
                                        >
                                            {stats.pendingApplications}
                                        </Typography>
                                        <Typography
                                            color="warning.main"
                                            variant="caption"
                                        >
                                            Awaiting submission
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
                                        <PendingIcon fontSize="large" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <ApplicationOverviewTabs agents={user_id} userId={user_id} />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Link
                    component={LinkDom}
                    style={{ textDecoration: 'none' }}
                    to={`${DEMO.TEAM_AGENT_ARCHIV_LINK(
                        agentUser?._id?.toString() ?? ''
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

export default AgentPage;
