import { useState, useMemo, type MouseEvent } from 'react';
import {
    Link as LinkDom,
    useLocation,
    useParams,
    useNavigate
} from 'react-router-dom';
import {
    Card,
    Link,
    Button,
    Typography,
    Avatar,
    CircularProgress,
    Breadcrumbs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tabs,
    Tab,
    Box,
    Stack,
    useTheme,
    Alert,
    Chip,
    Paper,
    Divider,
    Fade,
    Grid,
    Tooltip,
    TextField,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TimezoneSelect from 'react-timezone-select';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import {
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    EventNote as EventNoteIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    VideoCall as VideoCallIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Edit as EditIcon,
    Link as LinkIcon
} from '@mui/icons-material';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import {
    SubmitMessageWithAttachment,
    deleteAMessageInThread,
    deleteInterview,
    updateInterview,
    addInterviewTrainingDateTime,
    getEssayWriters
} from '@/api';
import { getInterviewQuery } from '@/api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import Loading from '@components/Loading/Loading';
import {
    stringAvatar,
    THREAD_REVERSED_TABS,
    THREAD_TABS,
    convertDate,
    NoonNightLabel,
    showTimezoneOffset,
    isInTheFuture
} from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import { TopBar } from '@components/TopBar/TopBar';
import { appConfig } from '../../config';
import MessageList from '@components/Message/MessageList';
import DocThreadEditor from '@components/Message/DocThreadEditor';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import Audit from '../Audit';
import { InterviewFeedback } from './InterviewFeedback';
import NotesEditor from '../Notes/NotesEditor';
import { OutputData } from '@editorjs/editorjs';

// Interview Metadata Sidebar Component
const InterviewMetadataSidebar = ({
    interview,
    openDeleteDocModalWindow,
    theme,
    onInterviewUpdate
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isDarkMode = theme.palette.mode === 'dark';

    // State for trainer assignment
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [editors, setEditors] = useState([]);
    const [trainerId, setTrainerId] = useState(
        new Set(interview.trainer_id?.map((t_id) => t_id._id.toString()))
    );

    // State for interview time
    const [interviewTrainingTimeChange, setInterviewTrainingTimeChange] =
        useState(false);
    const [utcTime, setUtcTime] = useState(
        dayjs(interview.event_id?.start || '')
    );
    const [timezone, setTimezone] = useState(
        user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // State for official details
    const [isOfficialDetailsOpen, setIsOfficialDetailsOpen] = useState(
        is_TaiGer_role(user)
    );
    const [localInterview, setLocalInterview] = useState({
        ...interview,
        interview_description:
            interview?.interview_description &&
            interview?.interview_description !== '{}'
                ? JSON.parse(interview.interview_description)
                : { time: new Date(), blocks: [] }
    });
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const [modalError, setModalError] = useState({
        show: false,
        message: '',
        status: 0
    });

    // Theme-aware gradient colors
    const getGradientColors = (colorType) => {
        if (isDarkMode) {
            switch (colorType) {
                case 'status-closed':
                    return {
                        start: theme.palette.success.dark,
                        end: theme.palette.success.main
                    };
                case 'status-open':
                    return {
                        start: theme.palette.primary.dark,
                        end: theme.palette.primary.main
                    };
                case 'student':
                    return {
                        start: theme.palette.info.dark,
                        end: theme.palette.info.main
                    };
                case 'program':
                    return {
                        start: theme.palette.secondary.dark,
                        end: theme.palette.secondary.main
                    };
                case 'trainer':
                    return {
                        start: theme.palette.primary.dark,
                        end: theme.palette.primary.main
                    };
                case 'time':
                    return {
                        start: theme.palette.warning.dark,
                        end: theme.palette.warning.main
                    };
                case 'meeting':
                    return {
                        start: theme.palette.success.dark,
                        end: theme.palette.success.main
                    };
                case 'documentation':
                    return {
                        start: theme.palette.info.dark,
                        end: theme.palette.info.main
                    };
                default:
                    return {
                        start: theme.palette.primary.dark,
                        end: theme.palette.primary.main
                    };
            }
        } else {
            switch (colorType) {
                case 'status-closed':
                    return {
                        start: theme.palette.success.light,
                        end: theme.palette.success.main
                    };
                case 'status-open':
                    return {
                        start: theme.palette.primary.light,
                        end: theme.palette.primary.main
                    };
                case 'student':
                    return {
                        start: theme.palette.info.light,
                        end: theme.palette.info.main
                    };
                case 'program':
                    return {
                        start: theme.palette.secondary.light,
                        end: theme.palette.secondary.main
                    };
                case 'trainer':
                    return {
                        start: theme.palette.primary.light,
                        end: theme.palette.primary.main
                    };
                case 'time':
                    return {
                        start: theme.palette.warning.light,
                        end: theme.palette.warning.main
                    };
                case 'meeting':
                    return {
                        start: theme.palette.success.light,
                        end: theme.palette.success.main
                    };
                case 'documentation':
                    return {
                        start: theme.palette.info.light,
                        end: theme.palette.info.main
                    };
                default:
                    return {
                        start: theme.palette.primary.light,
                        end: theme.palette.primary.main
                    };
            }
        }
    };

    const statusGradient = getGradientColors(
        interview.isClosed ? 'status-closed' : 'status-open'
    );
    const studentGradient = getGradientColors('student');
    const programGradient = getGradientColors('program');
    const trainerGradient = getGradientColors('trainer');
    const timeGradient = getGradientColors('time');
    const meetingGradient = getGradientColors('meeting');
    const documentationGradient = getGradientColors('documentation');

    // Helper function to get initials for avatar
    const getInitials = (firstname, lastname) => {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    // Handlers
    const openTrainerModal = async () => {
        setShowTrainerModal(true);
        const { data } = await getEssayWriters();
        const { data: editors_a } = data;
        setEditors(editors_a);
    };

    const toggleTrainerModal = () => {
        setTrainerId(
            new Set(interview.trainer_id.map((t_id) => t_id._id.toString()))
        );
        setShowTrainerModal(!showTrainerModal);
    };

    const modifyTrainer = (new_trainerId, isActive) => {
        if (isActive) {
            const temp_0 = [...trainerId];
            const temp = new Set(temp_0);
            temp.delete(new_trainerId);
            setTrainerId(new Set(temp));
        } else {
            const temp_0 = [...trainerId];
            const temp = new Set(temp_0);
            temp.add(new_trainerId);
            setTrainerId(new Set(temp));
        }
    };

    const updateTrainer = async () => {
        const temp_trainer_id_array = Array.from(trainerId);
        const resp = await updateInterview(interview._id.toString(), {
            trainer_id: temp_trainer_id_array
        });
        const { success } = resp.data;
        if (success) {
            setShowTrainerModal(false);
            onInterviewUpdate();
        } else {
            const { message } = resp.data;
            setModalError({
                show: true,
                message: message,
                status: resp.status
            });
        }
    };

    const handleChangeInterviewTrainingTime = (newValue) => {
        setUtcTime(newValue);
        setInterviewTrainingTimeChange(true);
    };

    const handleSendInterviewInvitation = async (
        e: MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        try {
            const end_date = new Date(utcTime);
            end_date.setMinutes(end_date.getMinutes() + 60);
            const interviewTrainingEvent = {
                _id: interview.event_id?._id,
                requester_id: [interview.student_id],
                receiver_id: [...interview.trainer_id],
                title: `${interview.student_id.firstname} ${interview.student_id.lastname} - ${interview.program_id.school} - ${interview.program_id.program_name} ${interview.program_id.degree} interview training`,
                description:
                    'This is the interview training. Please prepare and practice',
                event_type: 'Interview',
                start: new Date(utcTime),
                end: end_date
            };
            const resp = await addInterviewTrainingDateTime(
                interview._id.toString(),
                interviewTrainingEvent
            );
            const { success } = resp.data;
            if (success) {
                setInterviewTrainingTimeChange(false);
                onInterviewUpdate();
            } else {
                const { message } = resp.data;
                setModalError({
                    show: true,
                    message: message,
                    status: resp.status
                });
            }
        } catch (error) {
            let errorMessage =
                'An error occurred while sending the interview invitation. Please try again later.';
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setModalError({
                show: true,
                message: errorMessage,
                status: 500
            });
        }
    };

    const onClickToInterviewSurveyHandler = () => {
        navigate(DEMO.INTERVIEW_SINGLE_SURVEY_LINK(interview._id.toString()));
    };

    const handleChange_UpdateInterview = (e) => {
        setButtonDisabled(false);
        setLocalInterview((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleEditorChange = (editorState: OutputData) => {
        setButtonDisabled(false);
        setLocalInterview((prevState) => ({
            ...prevState,
            interview_description: editorState
        }));
    };

    const handleClickSave = async (e, editorState: OutputData) => {
        e.preventDefault();
        const notes = JSON.stringify(editorState);
        const { data, status } = await updateInterview(
            interview._id.toString(),
            {
                interviewer: localInterview.interviewer,
                interview_date: localInterview.interview_date,
                interview_description: notes
            }
        );
        const { data: interview_updated, success } = data;
        if (success) {
            setLocalInterview(interview_updated);
            setButtonDisabled(true);
            onInterviewUpdate();
        } else {
            const { message } = data;
            setModalError({
                show: true,
                message: message,
                status: status
            });
        }
    };

    return (
        <>
            {modalError.show && (
                <ModalMain
                    ConfirmError={() =>
                        setModalError({ show: false, message: '', status: 0 })
                    }
                    res_modal_message={modalError.message}
                    res_modal_status={modalError.status}
                />
            )}
            <Box
                sx={{
                    position: { md: 'sticky' },
                    top: { md: 8 },
                    maxHeight: { md: 'calc(100vh - 220px)' },
                    overflowY: { md: 'auto' },
                    '&::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.divider,
                        borderRadius: '3px'
                    }
                }}
            >
                <Stack spacing={2}>
                    {/* Status Banner */}
                    {interview.isClosed && <TopBar />}

                    {/* Status Card */}
                    <Card
                        elevation={2}
                        sx={{
                            background: `linear-gradient(135deg, ${statusGradient.start} 0%, ${statusGradient.end} 100%)`,
                            color: 'white',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                                sx={{ mb: 1 }}
                            >
                                {interview.isClosed ? (
                                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                                ) : (
                                    <ScheduleIcon sx={{ fontSize: 20 }} />
                                )}
                                <Typography
                                    fontWeight="600"
                                    sx={{ fontSize: '0.75rem' }}
                                    variant="overline"
                                >
                                    {t('Status')}
                                </Typography>
                            </Stack>
                            <Typography fontWeight="700" variant="h6">
                                {interview.isClosed
                                    ? t('Completed')
                                    : t('In Progress')}
                            </Typography>
                        </Box>
                    </Card>

                    {/* Trainer Assignment Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${trainerGradient.start} 0%, ${trainerGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <AssignmentIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Trainer')}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {interview.trainer_id &&
                            interview.trainer_id?.length !== 0 ? (
                                <Stack spacing={1.5}>
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        gap={0.75}
                                    >
                                        {interview.trainer_id.map(
                                            (trainer, idx) => (
                                                <Tooltip
                                                    key={idx}
                                                    title={`${trainer.firstname} ${trainer.lastname}`}
                                                >
                                                    <Chip
                                                        avatar={
                                                            <Avatar
                                                                src={
                                                                    trainer.pictureUrl
                                                                }
                                                                {...stringAvatar(
                                                                    `${trainer.firstname} ${trainer.lastname}`
                                                                )}
                                                                sx={{
                                                                    bgcolor:
                                                                        theme
                                                                            .palette
                                                                            .primary
                                                                            .main,
                                                                    color: 'white',
                                                                    fontSize:
                                                                        '0.65rem',
                                                                    width: 24,
                                                                    height: 24
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    trainer.firstname,
                                                                    trainer.lastname
                                                                )}
                                                            </Avatar>
                                                        }
                                                        label={`${trainer.firstname}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 500,
                                                            fontSize: '0.8rem',
                                                            height: 28
                                                        }}
                                                        variant="outlined"
                                                    />
                                                </Tooltip>
                                            )
                                        )}
                                    </Stack>
                                    {is_TaiGer_role(user) && (
                                        <Button
                                            color="primary"
                                            fullWidth
                                            onClick={openTrainerModal}
                                            size="small"
                                            startIcon={<EditIcon />}
                                            variant="outlined"
                                        >
                                            {t('Change Trainer')}
                                        </Button>
                                    )}
                                </Stack>
                            ) : (
                                <Stack spacing={1.5}>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ textAlign: 'center', py: 1 }}
                                        variant="body2"
                                    >
                                        {t('No Trainer Assigned')}
                                    </Typography>
                                    {is_TaiGer_role(user) && (
                                        <Button
                                            color="primary"
                                            fullWidth
                                            onClick={openTrainerModal}
                                            size="small"
                                            variant="contained"
                                        >
                                            {t('Assign Trainer')}
                                        </Button>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    </Card>

                    {/* Interview Training Time Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${timeGradient.start} 0%, ${timeGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <ScheduleIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Interview Training Time', {
                                        ns: 'interviews'
                                    })}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {is_TaiGer_role(user) ? (
                                interview.trainer_id?.length !== 0 ? (
                                    <Stack spacing={1.5}>
                                        <TimezoneSelect
                                            displayValue="UTC"
                                            isDisabled={true}
                                            onChange={(e) =>
                                                setTimezone(e.value)
                                            }
                                            value={timezone}
                                        />
                                        <LocalizationProvider
                                            dateAdapter={AdapterDayjs}
                                        >
                                            <DesktopDateTimePicker
                                                onChange={(newValue) =>
                                                    handleChangeInterviewTrainingTime(
                                                        newValue
                                                    )
                                                }
                                                slotProps={{
                                                    textField: { size: 'small' }
                                                }}
                                                value={utcTime}
                                            />
                                        </LocalizationProvider>
                                        <Button
                                            color="primary"
                                            disabled={
                                                !interviewTrainingTimeChange
                                            }
                                            fullWidth
                                            onClick={(
                                                e: MouseEvent<HTMLButtonElement>
                                            ) =>
                                                handleSendInterviewInvitation(e)
                                            }
                                            variant="contained"
                                        >
                                            {t('Send Invitation')}
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Typography
                                        color="text.secondary"
                                        sx={{ textAlign: 'center', py: 1 }}
                                        variant="body2"
                                    >
                                        {t(
                                            'Please assign Interview Trainer first.'
                                        )}
                                    </Typography>
                                )
                            ) : interview.event_id?.start ? (
                                <Typography
                                    fontWeight="600"
                                    sx={{ textAlign: 'center' }}
                                    variant="body1"
                                >
                                    {`${convertDate(utcTime)} ${NoonNightLabel(utcTime)} ${
                                        Intl.DateTimeFormat().resolvedOptions()
                                            .timeZone
                                    }`}
                                    {showTimezoneOffset()}
                                </Typography>
                            ) : (
                                <Typography
                                    color="text.secondary"
                                    sx={{ textAlign: 'center', py: 1 }}
                                    variant="body2"
                                >
                                    To be announced
                                </Typography>
                            )}
                        </Box>
                    </Card>

                    {/* Meeting Link Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${meetingGradient.start} 0%, ${meetingGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <VideoCallIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Interview Training Meeting Link', {
                                        ns: 'interviews'
                                    })}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {interview.event_id?.meetingLink ? (
                                <Link
                                    component={LinkDom}
                                    target="_blank"
                                    to={interview.event_id.meetingLink}
                                    underline="hover"
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                    >
                                        <LinkIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {t('Join Meeting')}
                                        </Typography>
                                    </Stack>
                                </Link>
                            ) : (
                                <Typography
                                    color="text.secondary"
                                    sx={{ textAlign: 'center', py: 1 }}
                                    variant="body2"
                                >
                                    To be announced
                                </Typography>
                            )}
                        </Box>
                    </Card>

                    {/* Program Info Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${programGradient.start} 0%, ${programGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <SchoolIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Program Details')}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            mb: 0.5
                                        }}
                                        variant="overline"
                                    >
                                        {t('University')}
                                    </Typography>
                                    <Link
                                        component={LinkDom}
                                        target="_blank"
                                        to={`${DEMO.SINGLE_PROGRAM_LINK(
                                            interview.program_id._id.toString()
                                        )}`}
                                        underline="hover"
                                    >
                                        <Typography
                                            fontWeight="600"
                                            sx={{ fontSize: '0.95rem' }}
                                            variant="body1"
                                        >
                                            {interview.program_id.school}
                                        </Typography>
                                    </Link>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            mb: 0.5
                                        }}
                                        variant="overline"
                                    >
                                        {t('Program')}
                                    </Typography>
                                    <Typography
                                        fontWeight="600"
                                        sx={{ fontSize: '0.95rem' }}
                                        variant="body1"
                                    >
                                        {interview.program_id.program_name}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={interview.program_id.degree}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<EventNoteIcon />}
                                        label={interview.program_id.semester}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Stack>
                        </Box>
                    </Card>

                    {/* Student Info Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${studentGradient.start} 0%, ${studentGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <PersonIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Student Information')}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={2}
                            >
                                <Avatar
                                    {...stringAvatar(
                                        `${interview.student_id.firstname} ${interview.student_id.lastname}`
                                    )}
                                    src={interview.student_id?.pictureUrl}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        border: `3px solid ${
                                            isDarkMode
                                                ? 'rgba(255,255,255,0.3)'
                                                : 'white'
                                        }`
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Link
                                        component={LinkDom}
                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                            interview.student_id._id.toString(),
                                            DEMO.PROFILE_HASH
                                        )}`}
                                        underline="hover"
                                    >
                                        <Typography
                                            fontWeight="600"
                                            variant="body1"
                                        >
                                            {interview.student_id.firstname}{' '}
                                            {interview.student_id.lastname}
                                        </Typography>
                                    </Link>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ fontSize: '0.85rem' }}
                                        variant="body2"
                                    >
                                        {interview.student_id.email}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Card>

                    {/* Training Documentation Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, ${documentationGradient.start} 0%, ${documentationGradient.end} 100%)`,
                                color: 'white',
                                p: 1.5
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <DescriptionIcon fontSize="small" />
                                <Typography
                                    fontWeight="600"
                                    variant="subtitle2"
                                >
                                    {t('Interview Training Documentation', {
                                        ns: 'interviews'
                                    })}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to="https://taigerconsultancy-portal.com/docs/search/64b264c824f22df42a1af4b5"
                                underline="hover"
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <LinkIcon fontSize="small" />
                                    <Typography
                                        sx={{ fontSize: '0.85rem' }}
                                        variant="body2"
                                    >
                                        {t('View Documentation')}
                                    </Typography>
                                </Stack>
                            </Link>
                        </Box>
                    </Card>

                    {/* Survey Card */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Button
                                color="primary"
                                disabled={isInTheFuture(
                                    interview.interview_date
                                )}
                                fullWidth
                                onClick={onClickToInterviewSurveyHandler}
                                variant="contained"
                            >
                                {t('Interview Training Survey', {
                                    ns: 'interviews'
                                })}
                            </Button>
                        </Box>
                    </Card>

                    {/* Official Details Collapsible Card */}
                    {is_TaiGer_role(user) && (
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: theme.shadows[1],
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Box
                                onClick={() =>
                                    setIsOfficialDetailsOpen(
                                        !isOfficialDetailsOpen
                                    )
                                }
                                sx={{
                                    cursor: 'pointer',
                                    p: 1.5,
                                    bgcolor: isDarkMode
                                        ? 'rgba(255,255,255,0.05)'
                                        : theme.palette.grey[50],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    '&:hover': {
                                        bgcolor: isDarkMode
                                            ? 'rgba(255,255,255,0.1)'
                                            : theme.palette.grey[100]
                                    }
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <InfoIcon
                                        fontSize="small"
                                        sx={{ color: 'text.secondary' }}
                                    />
                                    <Typography
                                        color="text.secondary"
                                        fontWeight="600"
                                        variant="subtitle2"
                                    >
                                        {t('Official Details', {
                                            ns: 'interviews'
                                        })}
                                    </Typography>
                                </Stack>
                                {isOfficialDetailsOpen ? (
                                    <ExpandLessIcon />
                                ) : (
                                    <ExpandMoreIcon />
                                )}
                            </Box>
                            <Collapse in={isOfficialDetailsOpen}>
                                <Box sx={{ p: 2 }}>
                                    <Stack spacing={2}>
                                        {/* Interviewer */}
                                        <Box>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                    mb: 0.5
                                                }}
                                                variant="overline"
                                            >
                                                {t('Interviewer', {
                                                    ns: 'interviews'
                                                })}
                                            </Typography>
                                            <TextField
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                fullWidth
                                                id="interviewer"
                                                name="interviewer"
                                                onChange={(e) =>
                                                    handleChange_UpdateInterview(
                                                        e
                                                    )
                                                }
                                                placeholder="Prof. Sebastian"
                                                required
                                                size="small"
                                                type="text"
                                                value={
                                                    localInterview.interviewer
                                                }
                                            />
                                        </Box>

                                        {/* Official Interview Time */}
                                        <Box>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                    mb: 0.5
                                                }}
                                                variant="overline"
                                            >
                                                {t('Official Interview Time')} (
                                                {t('Your timezone local time')}{' '}
                                                {`${
                                                    Intl.DateTimeFormat().resolvedOptions()
                                                        .timeZone
                                                } ${showTimezoneOffset()}`}
                                                )
                                            </Typography>
                                            <LocalizationProvider
                                                dateAdapter={AdapterDayjs}
                                            >
                                                <DesktopDateTimePicker
                                                    fullWidth
                                                    id="interview_date"
                                                    onChange={(newValue) => {
                                                        const interviewData_temp =
                                                            {
                                                                ...localInterview
                                                            };
                                                        interviewData_temp.interview_date =
                                                            newValue;
                                                        setButtonDisabled(
                                                            false
                                                        );
                                                        setLocalInterview(
                                                            interviewData_temp
                                                        );
                                                    }}
                                                    required
                                                    slotProps={{
                                                        textField: {
                                                            size: 'small'
                                                        }
                                                    }}
                                                    value={dayjs(
                                                        localInterview.interview_date ||
                                                            ''
                                                    )}
                                                />
                                            </LocalizationProvider>
                                        </Box>

                                        {/* Description */}
                                        <Box>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                    mb: 0.5
                                                }}
                                                variant="overline"
                                            >
                                                {t('Description', {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                            <NotesEditor
                                                buttonDisabled={buttonDisabled}
                                                editorState={
                                                    localInterview.interview_description
                                                }
                                                handleClickSave={
                                                    handleClickSave
                                                }
                                                handleEditorChange={
                                                    handleEditorChange
                                                }
                                                notes_id={`${interview._id.toString()}-description`}
                                                readOnly={false}
                                                thread={null}
                                                unique_id={`${interview._id.toString()}-description`}
                                            />
                                        </Box>
                                    </Stack>
                                </Box>
                            </Collapse>
                        </Card>
                    )}

                    {/* Actions Card (for TaiGer roles) */}
                    {is_TaiGer_role(user) && (
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: theme.shadows[1],
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor: isDarkMode
                                        ? 'rgba(255,255,255,0.05)'
                                        : theme.palette.grey[50],
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <InfoIcon
                                        fontSize="small"
                                        sx={{ color: 'text.secondary' }}
                                    />
                                    <Typography
                                        color="text.secondary"
                                        fontWeight="600"
                                        variant="subtitle2"
                                    >
                                        {t('Actions')}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Tooltip title={t('Delete this interview')}>
                                        <Button
                                            color="error"
                                            fullWidth
                                            onClick={(e) =>
                                                openDeleteDocModalWindow(
                                                    e,
                                                    interview
                                                )
                                            }
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            variant="outlined"
                                        >
                                            {t('Delete Interview')}
                                        </Button>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        </Card>
                    )}
                </Stack>
            </Box>

            {/* Trainer Assignment Dialog */}
            <Dialog
                fullWidth
                maxWidth="xs"
                onClose={toggleTrainerModal}
                open={showTrainerModal}
            >
                <DialogTitle>{t('Assign Trainer')}</DialogTitle>
                <DialogContent>
                    <List>
                        {editors?.map((editor, i) => (
                            <ListItemButton
                                dense
                                key={i}
                                onClick={() =>
                                    modifyTrainer(
                                        editor._id.toString(),
                                        trainerId.has(editor._id.toString())
                                    )
                                }
                                role={undefined}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={trainerId.has(
                                            editor._id.toString()
                                        )}
                                        disableRipple
                                        edge="start"
                                        tabIndex={-1}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${editor.firstname} ${editor.lastname}`}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="secondary"
                        onClick={toggleTrainerModal}
                        variant="outlined"
                    >
                        {t('Close', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        onClick={updateTrainer}
                        variant="contained"
                    >
                        {t('Assign', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const SingleInterview = () => {
    const { interview_id } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { hash } = useLocation();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isDarkMode = theme.palette.mode === 'dark';

    // State management
    const [value, setValue] = useState(THREAD_TABS[hash.replace('#', '')] || 0);
    const [file, setFile] = useState(null);
    const [editorInputState, setEditorInputState] = useState({
        time: new Date(),
        blocks: []
    });
    const [accordionKeys, setAccordionKeys] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [modalError, setModalError] = useState({
        show: false,
        message: '',
        status: 0
    });

    // Fetch interview data with useQuery
    const {
        data: interviewData,
        isLoading,
        isError,
        error
    } = useQuery({
        ...getInterviewQuery(interview_id),
        onSuccess: (response) => {
            if (response.data.success && response.data.data) {
                const messagesLength =
                    response.data.data.thread_id?.messages?.length || 0;
                setAccordionKeys(
                    new Array(messagesLength)
                        .fill()
                        .map((x, i) => (i === messagesLength - 1 ? i : -1))
                );
            }
        }
    });

    // Mutations
    const submitMessageMutation = useMutation({
        mutationFn: ({ threadId, studentId, formData }) =>
            SubmitMessageWithAttachment(threadId, studentId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
            setEditorInputState({ time: new Date(), blocks: [] });
            setFile(null);
        },
        onError: (error) => {
            setModalError({
                show: true,
                message:
                    error?.response?.data?.message || 'Failed to send message',
                status: error?.response?.status || 500
            });
        }
    });

    const deleteMessageMutation = useMutation({
        mutationFn: ({ threadId, messageId }) =>
            deleteAMessageInThread(threadId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
        },
        onError: (error) => {
            setModalError({
                show: true,
                message:
                    error?.response?.data?.message ||
                    'Failed to delete message',
                status: error?.response?.status || 500
            });
        }
    });

    const updateInterviewMutation = useMutation({
        mutationFn: ({ interviewId, payload }) =>
            updateInterview(interviewId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
            setCloseDialogOpen(false);
        },
        onError: (error) => {
            setModalError({
                show: true,
                message:
                    error?.response?.data?.message ||
                    'Failed to update interview',
                status: error?.response?.status || 500
            });
        }
    });

    const deleteInterviewMutation = useMutation({
        mutationFn: (interviewId) => deleteInterview(interviewId),
        onSuccess: () => {
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            setModalError({
                show: true,
                message:
                    error?.response?.data?.message ||
                    'Failed to delete interview',
                status: error?.response?.status || 500
            });
        }
    });

    // Handlers
    const handleClickSave = (
        e: MouseEvent<HTMLElement>,
        editorState: unknown
    ) => {
        e.preventDefault();
        const message = JSON.stringify(editorState);
        const formData = new FormData();

        if (file) {
            file.forEach((f) => formData.append('files', f));
        }
        formData.append('message', message);

        submitMessageMutation.mutate({
            threadId: interview?.thread_id?._id.toString(),
            studentId: interview?.student_id?._id.toString(),
            formData
        });
    };

    const onFileChange = (e) => {
        e.preventDefault();
        const fileNum = e.target.files.length;
        if (fileNum <= 3) {
            if (e.target.files) {
                setFile(Array.from(e.target.files));
            }
        } else {
            setModalError({
                show: true,
                message: 'You can only select up to 3 files.',
                status: 423
            });
        }
    };

    const singleExpandtHandler = (idx) => {
        const newAccordionKeys = [...accordionKeys];
        newAccordionKeys[idx] = newAccordionKeys[idx] !== idx ? idx : -1;
        setAccordionKeys(newAccordionKeys);
    };

    const onDeleteSingleMessage = (
        e: MouseEvent<HTMLElement>,
        message_id: string
    ) => {
        e.preventDefault();
        deleteMessageMutation.mutate({
            threadId: interview?.thread_id?._id.toString(),
            messageId: message_id
        });
    };

    const handleToggleInterviewStatus = () => {
        updateInterviewMutation.mutate({
            interviewId: interview._id.toString(),
            payload: { isClosed: !interview.isClosed }
        });
    };

    const handleDeleteInterview = () => {
        deleteInterviewMutation.mutate(interview._id.toString());
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
        window.location.hash = THREAD_REVERSED_TABS[newValue];
    };

    const openDeleteDocModalWindow = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleInterviewUpdate = () => {
        queryClient.invalidateQueries(['interviews', interview_id]);
    };

    // Memoized values
    const interview = useMemo(() => {
        return interviewData?.data?.data;
    }, [interviewData]);

    const interviewAuditLog = useMemo(() => {
        return interviewData?.data?.interviewAuditLog || [];
    }, [interviewData]);

    const interview_name = useMemo(() => {
        if (!interview) return '';
        return `${interview.student_id.firstname} ${interview.student_id.lastname} - ${interview.program_id.school} ${interview.program_id.program_name} ${interview.program_id.degree} ${interview.program_id.semester}`;
    }, [interview]);

    // Loading and error states
    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <ErrorPage res_status={error?.response?.status || 500} />;
    }

    if (!interview && deleteInterviewMutation.isSuccess) {
        const successGradient = isDarkMode
            ? {
                  start: theme.palette.success.dark,
                  end: theme.palette.success.main
              }
            : {
                  start: theme.palette.success.light,
                  end: theme.palette.success.main
              };

        return (
            <Fade in timeout={600}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${successGradient.start} 0%, ${successGradient.end} 100%)`,
                        color: 'white',
                        borderRadius: 2
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h5">
                        {t('Interview deleted successfully!')}
                    </Typography>
                </Paper>
            </Fade>
        );
    }

    if (!interview) {
        return <ErrorPage res_status={404} />;
    }

    TabTitle(`Interview: ${interview_name}`);

    return (
        <Box>
            {/* Error Modal */}
            {modalError.show && (
                <ModalMain
                    ConfirmError={() =>
                        setModalError({ show: false, message: '', status: 0 })
                    }
                    res_modal_message={modalError.message}
                    res_modal_status={modalError.status}
                />
            )}

            {/* Breadcrumbs */}
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
                    to={`${DEMO.INTERVIEW_LINK}`}
                    underline="hover"
                >
                    {is_TaiGer_role(user)
                        ? t('All Interviews', { ns: 'interviews' })
                        : t('My Interviews', { ns: 'interviews' })}
                </Link>
                <Typography color="text.primary">{interview_name}</Typography>
            </Breadcrumbs>

            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}
            >
                <Tabs
                    aria-label="interview tabs"
                    indicatorColor="primary"
                    onChange={handleChange}
                    scrollButtons="auto"
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                    value={value}
                    variant="scrollable"
                >
                    <Tab
                        label={t('discussion-thread', { ns: 'common' })}
                        {...a11yProps(value, 0)}
                    />
                    {is_TaiGer_role(user) && (
                        <Tab
                            label={t('History', { ns: 'common' })}
                            {...a11yProps(value, 1)}
                        />
                    )}
                    <Tab
                        label={t('Audit', { ns: 'common' })}
                        {...a11yProps(value, is_TaiGer_role(user) ? 2 : 1)}
                    />
                </Tabs>

                {/* Discussion Thread Tab */}
                <CustomTabPanel index={0} value={value}>
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2.5}>
                            {/* Left Sidebar: Interview Metadata */}
                            <Grid item lg={3} md={4} xs={12}>
                                <InterviewMetadataSidebar
                                    interview={interview}
                                    onInterviewUpdate={handleInterviewUpdate}
                                    openDeleteDocModalWindow={
                                        openDeleteDocModalWindow
                                    }
                                    theme={theme}
                                />
                            </Grid>

                            {/* Right Content Area: Messages & Chat ONLY */}
                            <Grid item lg={9} md={8} xs={12}>
                                <Box
                                    sx={{
                                        position: { md: 'sticky' },
                                        top: { md: 8 },
                                        maxHeight: {
                                            md: 'calc(100vh - 220px)'
                                        },
                                        overflowY: { md: 'auto' },
                                        '&::-webkit-scrollbar': {
                                            width: '6px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor:
                                                theme.palette.divider,
                                            borderRadius: '3px'
                                        }
                                    }}
                                >
                                    {/* Messages List */}
                                    <MessageList
                                        accordionKeys={accordionKeys}
                                        apiPrefix="/api/document-threads"
                                        documentsthreadId={interview.thread_id?._id?.toString()}
                                        isLoaded={true}
                                        onDeleteSingleMessage={
                                            onDeleteSingleMessage
                                        }
                                        singleExpandtHandler={
                                            singleExpandtHandler
                                        }
                                        thread={interview.thread_id}
                                        user={user}
                                    />

                                    {/* Message Input */}
                                    {user.archiv !== true ? (
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                border: `2px solid ${
                                                    interview.isClosed
                                                        ? theme.palette.divider
                                                        : theme.palette.primary
                                                              .main
                                                }`,
                                                mt: 2,
                                                overflow: 'hidden',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow:
                                                        interview.isClosed
                                                            ? 0
                                                            : theme.shadows[4]
                                                }
                                            }}
                                        >
                                            {interview.isClosed ? (
                                                <Box
                                                    sx={{
                                                        p: 3,
                                                        bgcolor: isDarkMode
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : theme.palette
                                                                  .grey[50],
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <CheckCircleIcon
                                                        color="success"
                                                        sx={{
                                                            fontSize: 48,
                                                            mb: 1
                                                        }}
                                                    />
                                                    <Typography variant="body1">
                                                        {t(
                                                            'This interview is closed.'
                                                        )}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    {/* Header */}
                                                    <Box
                                                        sx={{
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                                            color: theme.palette
                                                                .primary
                                                                .contrastText,
                                                            p: 1.5
                                                        }}
                                                    >
                                                        <Stack
                                                            alignItems="center"
                                                            direction="row"
                                                            spacing={1.5}
                                                        >
                                                            <Avatar
                                                                {...stringAvatar(
                                                                    `${user.firstname} ${user.lastname}`
                                                                )}
                                                                src={
                                                                    user?.pictureUrl
                                                                }
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    border: '2px solid white'
                                                                }}
                                                            />
                                                            <Box>
                                                                <Typography
                                                                    fontWeight="600"
                                                                    variant="body2"
                                                                >
                                                                    {
                                                                        user.firstname
                                                                    }{' '}
                                                                    {
                                                                        user.lastname
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        opacity: 0.9
                                                                    }}
                                                                    variant="caption"
                                                                >
                                                                    {t(
                                                                        'Write your reply'
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Box>
                                                    <Box sx={{ p: 2 }}>
                                                        <DocThreadEditor
                                                            buttonDisabled={
                                                                submitMessageMutation.isLoading
                                                            }
                                                            checkResult={[]}
                                                            editorState={
                                                                editorInputState
                                                            }
                                                            file={file}
                                                            handleClickSave={
                                                                handleClickSave
                                                            }
                                                            onFileChange={
                                                                onFileChange
                                                            }
                                                            thread={
                                                                interview.thread_id
                                                            }
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </Card>
                                    ) : (
                                        <Alert
                                            severity="info"
                                            sx={{ mt: 2, borderRadius: 2 }}
                                        >
                                            <Typography variant="body1">
                                                {t(
                                                    'Your service is finished. Therefore, you are in read only mode.'
                                                )}
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* Action Button for TaiGer Roles */}
                                    {is_TaiGer_role(user) && (
                                        <Button
                                            color={
                                                interview.isClosed
                                                    ? 'secondary'
                                                    : 'success'
                                            }
                                            disabled={
                                                updateInterviewMutation.isLoading
                                            }
                                            fullWidth
                                            onClick={() =>
                                                setCloseDialogOpen(true)
                                            }
                                            size="large"
                                            sx={{
                                                mt: 2,
                                                py: 1.5,
                                                fontWeight: 600
                                            }}
                                            variant={
                                                interview.isClosed
                                                    ? 'outlined'
                                                    : 'contained'
                                            }
                                        >
                                            {updateInterviewMutation.isLoading ? (
                                                <CircularProgress size={24} />
                                            ) : interview.isClosed ? (
                                                t('Mark as open')
                                            ) : (
                                                t('Mark as finished')
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CustomTabPanel>

                {/* History Tab */}
                {is_TaiGer_role(user) && (
                    <CustomTabPanel index={1} value={value}>
                        <Box sx={{ p: 3 }}>
                            <InterviewFeedback interview={interview} />
                        </Box>
                    </CustomTabPanel>
                )}

                {/* Audit Tab */}
                <CustomTabPanel
                    index={is_TaiGer_role(user) ? 2 : 1}
                    value={value}
                >
                    <Box sx={{ p: 3 }}>
                        <Audit audit={interviewAuditLog} />
                    </Box>
                </CustomTabPanel>
            </Paper>

            {/* Toggle Interview Status Dialog */}
            <Dialog
                maxWidth="sm"
                onClose={() => setCloseDialogOpen(false)}
                open={closeDialogOpen}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Do you want to set')}{' '}
                        <strong>
                            {t('Interview for')}{' '}
                            {interview.student_id.firstname}{' '}
                            {interview.student_id.lastname}{' '}
                            {interview.program_id.school}{' '}
                            {interview.program_id.program_name}{' '}
                            {interview.program_id.degree}{' '}
                            {interview.program_id.semester}
                        </strong>{' '}
                        {t('as')}{' '}
                        <strong>
                            {interview.isClosed ? t('open') : t('closed')}
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="secondary"
                        onClick={() => setCloseDialogOpen(false)}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={updateInterviewMutation.isLoading}
                        onClick={handleToggleInterviewStatus}
                        variant="contained"
                    >
                        {updateInterviewMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Interview Dialog */}
            <Dialog
                maxWidth="sm"
                onClose={() => setDeleteDialogOpen(false)}
                open={deleteDialogOpen}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    {t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Do you want to delete the interview request of')}{' '}
                        <strong>
                            {interview.program_id.school}{' '}
                            {interview.program_id.program_name}
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="secondary"
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                    <Button
                        color="error"
                        disabled={deleteInterviewMutation.isLoading}
                        onClick={handleDeleteInterview}
                        variant="contained"
                    >
                        {deleteInterviewMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SingleInterview;
