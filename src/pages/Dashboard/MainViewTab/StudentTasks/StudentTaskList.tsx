import { ReactNode } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    Box,
    Button,
    Card,
    Chip,
    LinearProgress,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PublicIcon from '@mui/icons-material/Public';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ForumIcon from '@mui/icons-material/Forum';

import {
    buildStudentTasks,
    type StudentTask,
    type TaskCategory,
    type TaskPriority
} from './studentTasks';
import type { IStudentResponse } from '@taiger-common/model';

export interface StudentTaskListProps {
    student: IStudentResponse;
    isCoursesFilled: boolean;
}

const categoryIcon = (category: TaskCategory): ReactNode => {
    switch (category) {
        case 'feedback':
            return <ForumIcon />;
        case 'profile':
            return <AssignmentIndIcon />;
        case 'documents':
            return <DescriptionIcon />;
        case 'personal':
            return <BadgeIcon />;
        case 'courses':
            return <SchoolIcon />;
        case 'applications':
            return <ListAltIcon />;
        case 'portals':
            return <VpnKeyIcon />;
        case 'uniassist':
            return <PublicIcon />;
        case 'results':
            return <EmojiEventsIcon />;
        case 'visa':
            return <FlightTakeoffIcon />;
        default:
            return <ListAltIcon />;
    }
};

const priorityColor = (
    priority: TaskPriority
): 'error' | 'info' | 'default' => {
    if (priority === 'urgent') return 'error';
    if (priority === 'recommended') return 'info';
    return 'default';
};

const ActionButton = ({
    task,
    t,
    primary
}: {
    task: StudentTask;
    t: TFunction;
    primary?: boolean;
}) => {
    if (task.locked) {
        return (
            <Tooltip
                title={t(
                    'Program is locked. Contact your agent to unlock this task.',
                    { ns: 'common' }
                )}
            >
                <span>
                    <Button
                        disabled
                        size="small"
                        startIcon={<LockOutlinedIcon />}
                        variant="outlined"
                    >
                        {t('Locked', { ns: 'common' })}
                    </Button>
                </span>
            </Tooltip>
        );
    }
    return (
        <Button
            color="primary"
            component={LinkDom}
            endIcon={<ArrowForwardIcon />}
            size={primary ? 'medium' : 'small'}
            to={task.to}
            variant={primary ? 'contained' : 'outlined'}
        >
            {task.actionLabel}
        </Button>
    );
};

const StudentTaskList = ({
    student,
    isCoursesFilled
}: StudentTaskListProps) => {
    const { t } = useTranslation();
    const { tasks, progress } = buildStudentTasks(student, isCoursesFilled, t);

    const priorityLabel = (priority: TaskPriority) =>
        priority === 'urgent'
            ? t('Urgent', { ns: 'common' })
            : priority === 'recommended'
              ? t('Recommended', { ns: 'common' })
              : t('Optional', { ns: 'common' });

    const progressPct =
        progress.total > 0
            ? Math.round((progress.done / progress.total) * 100)
            : 100;

    return (
        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                    mb: 1
                }}
            >
                <Typography variant="h6">
                    {t('My To-Do List', { ns: 'common' })}
                </Typography>
                {tasks.length > 0 ? (
                    <Chip
                        color="primary"
                        label={t('{{count}} tasks', {
                            count: tasks.length,
                            ns: 'common',
                            defaultValue: `${tasks.length} tasks`
                        })}
                        size="small"
                    />
                ) : null}
            </Box>

            {progress.total > 0 ? (
                <Box sx={{ mb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Getting started', { ns: 'common' })}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                            {progress.done}/{progress.total}
                        </Typography>
                    </Box>
                    <LinearProgress
                        sx={{ borderRadius: 1, height: 8 }}
                        value={progressPct}
                        variant="determinate"
                    />
                </Box>
            ) : null}

            {tasks.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <CheckCircleIcon
                        color="success"
                        sx={{ fontSize: 44, mb: 1 }}
                    />
                    <Typography gutterBottom variant="h6">
                        {t("You're all caught up!", { ns: 'common' })}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t('No pending tasks right now — great work!', {
                            ns: 'common'
                        })}
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Focus card: the single next thing to do. */}
                    <Box
                        sx={{
                            bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            border: '1px solid',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            p: 2
                        }}
                    >
                        <Typography
                            color="primary"
                            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                            variant="overline"
                        >
                            {t('Start here', { ns: 'common' })}
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            sx={{
                                alignItems: { sm: 'center' },
                                justifyContent: 'space-between',
                                mt: 0.5
                            }}
                        >
                            <Box
                                sx={{
                                    alignItems: 'flex-start',
                                    display: 'flex',
                                    gap: 1.5,
                                    minWidth: 0
                                }}
                            >
                                <Box
                                    sx={{
                                        color: 'primary.main',
                                        display: 'flex',
                                        mt: 0.5
                                    }}
                                >
                                    {categoryIcon(tasks[0].category)}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="subtitle1"
                                    >
                                        {tasks[0].title}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {tasks[0].description}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flexShrink: 0 }}>
                                <ActionButton primary t={t} task={tasks[0]} />
                            </Box>
                        </Stack>
                    </Box>

                    {tasks.length > 1 ? (
                        <>
                            <Typography
                                color="text.secondary"
                                sx={{ display: 'block', mb: 1, mt: 2 }}
                                variant="overline"
                            >
                                {t('Up next', { ns: 'common' })}
                            </Typography>
                            <Stack spacing={1}>
                                {tasks.slice(1).map((task) => (
                                    <Box
                                        key={task.id}
                                        sx={{
                                            alignItems: 'center',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            display: 'flex',
                                            gap: 1.5,
                                            p: 1.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'flex'
                                            }}
                                        >
                                            {categoryIcon(task.category)}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    alignItems: 'center',
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 0.5
                                                }}
                                            >
                                                <Typography
                                                    sx={{ fontWeight: 600 }}
                                                    variant="body2"
                                                >
                                                    {task.title}
                                                </Typography>
                                                <Chip
                                                    color={priorityColor(
                                                        task.priority
                                                    )}
                                                    label={priorityLabel(
                                                        task.priority
                                                    )}
                                                    size="small"
                                                    sx={{ height: 18 }}
                                                    variant="outlined"
                                                />
                                            </Box>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    overflow: 'hidden',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2
                                                }}
                                                variant="caption"
                                            >
                                                {task.description}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flexShrink: 0 }}>
                                            <ActionButton t={t} task={task} />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    ) : null}
                </>
            )}
        </Card>
    );
};

export default StudentTaskList;
