import React, { useState, type MouseEvent } from 'react';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import {
    Card,
    Link,
    Button,
    Typography,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Stack,
    Chip,
    Divider,
    Tooltip,
    TextField,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    type Theme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import type {
    IEventWithId,
    IProgramWithId,
    IUserWithId
} from '@taiger-common/model';
import TimezoneSelect from 'react-timezone-select';
import dayjs, { type Dayjs } from 'dayjs';
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

import ModalMain from '../../Utils/ModalHandler/ModalMain';
import {
    updateInterview,
    addInterviewTrainingDateTime,
    getUsers,
    ESSAY_WRITERS_QUERY_STRING
} from '@/api';
import DEMO from '@store/constant';
import {
    stringAvatar,
    convertDate,
    NoonNightLabel,
    showTimezoneOffset,
    isInTheFuture
} from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import { TopBar } from '@components/TopBar/TopBar';
import NotesEditor from '../../Notes/NotesEditor';
import { OutputData } from '@editorjs/editorjs';

/** Interview with populated references as returned by the API. */
export interface IInterviewPopulated {
    _id: string;
    student_id: IUserWithId;
    trainer_id: IUserWithId[];
    program_id: IProgramWithId;
    event_id?: IEventWithId;
    thread_id?: string;
    interview_description?: string;
    interviewer?: string;
    interview_duration?: string;
    interview_date?: Date;
    isClosed?: boolean;
    start?: Date;
    end?: Date;
}

// Interview Metadata Sidebar Component
export interface InterviewMetadataSidebarProps {
    interview: IInterviewPopulated;
    openDeleteDocModalWindow: (e: MouseEvent<HTMLElement>) => void;
    theme: Theme;
    onInterviewUpdate: () => void;
}

const InterviewMetadataSidebar = ({
    interview,
    openDeleteDocModalWindow,
    theme,
    onInterviewUpdate
}: InterviewMetadataSidebarProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isDarkMode = theme.palette.mode === 'dark';

    // State for trainer assignment
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [editors, setEditors] = useState<IUserWithId[]>([]);
    const [trainerId, setTrainerId] = useState(
        new Set(interview.trainer_id?.map((t_id) => t_id._id.toString()))
    );

    // State for interview time
    const [interviewTrainingTimeChange, setInterviewTrainingTimeChange] =
        useState(false);
    const [utcTime, setUtcTime] = useState<Dayjs | null>(
        dayjs(interview.event_id?.start ?? '')
    );
    const timezone =
        user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // State for official details
    const [isOfficialDetailsOpen, setIsOfficialDetailsOpen] = useState(
        user ? user && is_TaiGer_role(user) : false
    );
    const [localInterview, setLocalInterview] = useState<
        Omit<IInterviewPopulated, 'interview_description'> & {
            interview_description: OutputData;
        }
    >({
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
    const getGradientColors = (colorType: string) => {
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
    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    // Handlers
    const openTrainerModal = async () => {
        setShowTrainerModal(true);
        const res = await getUsers(ESSAY_WRITERS_QUERY_STRING);
        const editors_a = res.data?.data ?? [];
        setEditors(editors_a);
    };

    const toggleTrainerModal = () => {
        setTrainerId(
            new Set(interview.trainer_id.map((t_id) => t_id._id.toString()))
        );
        setShowTrainerModal(!showTrainerModal);
    };

    const modifyTrainer = (new_trainerId: string, isActive: boolean) => {
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

    const handleChangeInterviewTrainingTime = (
        newValue: dayjs.Dayjs | null
    ) => {
        setUtcTime(newValue);
        setInterviewTrainingTimeChange(true);
    };

    const getErrorMessage = (error: unknown): string => {
        if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'data' in error.response &&
            error.response.data &&
            typeof error.response.data === 'object' &&
            'message' in error.response.data &&
            typeof error.response.data.message === 'string'
        ) {
            return error.response.data.message;
        }
        if (
            error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string'
        ) {
            return error.message;
        }
        return 'An error occurred while sending the interview invitation. Please try again later.';
    };

    const handleSendInterviewInvitation = async (
        e: MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        try {
            const startDate = utcTime ? utcTime.toDate() : new Date();
            const end_date = new Date(startDate);
            end_date.setMinutes(end_date.getMinutes() + 60);
            const interviewTrainingEvent = {
                _id: interview.event_id?._id,
                requester_id: [interview.student_id],
                receiver_id: [...interview.trainer_id],
                title: `${interview.student_id.firstname} ${interview.student_id.lastname} - ${interview.program_id.school} - ${interview.program_id.program_name} ${interview.program_id.degree ?? ''} interview training`,
                description:
                    'This is the interview training. Please prepare and practice',
                event_type: 'Interview',
                start: startDate,
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
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
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

    const handleChange_UpdateInterview = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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

    const handleClickSave = async (
        e: MouseEvent<HTMLElement>,
        editorState: OutputData
    ) => {
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
            const parsed = {
                ...interview_updated,
                interview_description:
                    interview_updated.interview_description &&
                    interview_updated.interview_description !== '{}'
                        ? JSON.parse(interview_updated.interview_description)
                        : { time: new Date(), blocks: [] }
            };
            setLocalInterview(parsed as typeof localInterview);
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
                                    {user && is_TaiGer_role(user) && (
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
                                    {user && is_TaiGer_role(user) && (
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
                            {user && is_TaiGer_role(user) ? (
                                interview.trainer_id?.length !== 0 ? (
                                    <Stack spacing={1.5}>
                                        <TimezoneSelect
                                            displayValue="UTC"
                                            isDisabled={true}
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
                                    {`${convertDate(utcTime?.toDate() as Date)} ${NoonNightLabel(utcTime?.toDate() as Date)} ${
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
                                    interview.interview_date as Date
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

                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: theme.shadows[1],
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Box
                            onClick={() =>
                                setIsOfficialDetailsOpen(!isOfficialDetailsOpen)
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
                                                handleChange_UpdateInterview(e)
                                            }
                                            placeholder="Prof. Sebastian"
                                            required
                                            size="small"
                                            type="text"
                                            value={localInterview.interviewer}
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
                                                onChange={(
                                                    newValue: Dayjs | null
                                                ) => {
                                                    setButtonDisabled(false);
                                                    setLocalInterview(
                                                        (prev) => ({
                                                            ...prev,
                                                            interview_date:
                                                                newValue?.toDate()
                                                        })
                                                    );
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        id: 'interview_date',
                                                        required: true
                                                    }
                                                }}
                                                value={dayjs(
                                                    localInterview.interview_date ??
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
                                            handleClickSave={handleClickSave}
                                            handleEditorChange={
                                                handleEditorChange
                                            }
                                            notes_id={`${interview._id.toString()}-description`}
                                            readOnly={false}
                                            thread={null}
                                        />
                                    </Box>
                                </Stack>
                            </Box>
                        </Collapse>
                    </Card>

                    {/* Actions Card (for TaiGer roles) */}
                    {user && is_TaiGer_role(user) && (
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
                                                openDeleteDocModalWindow(e)
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

export default InterviewMetadataSidebar;
