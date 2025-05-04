import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Stack,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    TextField
} from '@mui/material';
import {
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw,
    isProgramAdmitted,
    isProgramRejected
} from '@taiger-common/core';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import DoneIcon from '@mui/icons-material/Done';
import UndoIcon from '@mui/icons-material/Undo';
import CancelIcon from '@mui/icons-material/Cancel';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import LockIcon from '@mui/icons-material/Lock';

import ApplicationProgressCardBody from '../../components/ApplicationProgressCard/ApplicationProgressCardBody';
import { useSnackBar } from '../../contexts/use-snack-bar';
import i18next from 'i18next';
import { useNavigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import { updateStudentApplicationResultV2 } from '../../api';
import {
    application_deadline_calculator,
    is_program_ml_rl_essay_ready,
    is_the_uni_assist_vpd_uploaded,
    isCVFinished,
    progressBarCounter
} from '../Utils/checking-functions';
import { BASE_URL } from '../../api/request';
import { appConfig } from '../../config';
import OverlayButton from '../../components/Overlay/OverlayButton';

const DecidedSubmittedButtons = ({ openSetResultModal }) => {
    const navigate = useNavigate();
    return (
        <Stack direction="row" mt="auto" spacing={1}>
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, { admission: 'O' })}
                startIcon={<DoneIcon />}
                variant="contained"
            >
                Get Admission
            </Button>
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, { admission: 'X' })}
                startIcon={<CancelIcon />}
                variant="outlined"
            >
                Get Rejection
            </Button>
            {/* TODO: Unsubmit */}
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, { closed: '-' })}
                startIcon={<CancelIcon />}
                variant="outlined"
            >
                Unsubmit
            </Button>
            <Button
                color="success"
                onClick={() => navigate(`${DEMO.INTERVIEW_ADD_LINK}`)}
                startIcon={<InterpreterModeIcon />}
                variant="contained"
            >
                Request Interview Training
            </Button>
        </Stack>
    );
};

const DecidedWithdrawnButtons = ({ openSetResultModal }) => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button
            color="primary"
            onClick={(e) => openSetResultModal(e, { closed: '-' })}
            startIcon={<UndoIcon />}
            variant="outlined"
        >
            Re-apply
        </Button>
    </Stack>
);

const DecidedUnsubmittedButtons = ({
    openSetResultModal,
    application,
    student
}) => {
    const isSubmissionAllowed =
        is_program_ml_rl_essay_ready(application) &&
        isCVFinished(student) &&
        (!appConfig.vpdEnable || is_the_uni_assist_vpd_uploaded(application));

    const reminderText = `Please make sure ${
        !isCVFinished(student) ? 'CV ' : ''
    }${!is_program_ml_rl_essay_ready(application) ? 'ML/RL/Essay ' : ''}${
        !is_the_uni_assist_vpd_uploaded(application) ? 'Uni-Assist ' : ''
    }are prepared to unlock this.`;

    return (
        <Stack direction="row" mt="auto" spacing={1}>
            {isSubmissionAllowed ? (
                <Button
                    color="primary"
                    disabled={!isSubmissionAllowed}
                    onClick={(e) => openSetResultModal(e, { closed: 'O' })}
                    startIcon={<DoneIcon />}
                    title={!isSubmissionAllowed ? reminderText : null}
                    variant="contained"
                >
                    Mark as Complete
                </Button>
            ) : (
                <OverlayButton startIcon={<LockIcon />} text={reminderText} variant="contained">
                    Mark as Complete
                </OverlayButton>
            )}
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, { closed: 'X' })}
                startIcon={<CancelIcon />}
                variant="outlined"
            >
                Mark as Withdrawn
            </Button>
        </Stack>
    );
};

const UndecidedButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Decide
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Do not want
        </Button>
    </Stack>
);

const AdmittedOrRejectedButtons = ({ application, openSetResultModal }) => (
    <Stack direction="row" mt="auto" spacing={1}>
        <AdmissionLetterLink application={application} />
        <Button
            color="primary"
            onClick={(e) => openSetResultModal(e, { admission: '-' })}
            startIcon={<UndoIcon />}
            variant="contained"
        >
            Change Result
        </Button>
    </Stack>
);

const DynamicButtons = ({ application, openSetResultModal, student }) => {
    const isDecided = isProgramDecided(application);
    const isSubmitted = isProgramSubmitted(application);
    const isWithdrawn = isProgramWithdraw(application);

    const isAdmitted = isProgramAdmitted(application);
    const isRejected = isProgramRejected(application);
    // --- Conditional rendering ---
    const renderButtons = () => {
        if (isAdmitted || isRejected)
            return (
                <AdmittedOrRejectedButtons
                    application={application}
                    openSetResultModal={openSetResultModal}
                />
            );
        if (isSubmitted)
            return (
                <DecidedSubmittedButtons
                    openSetResultModal={openSetResultModal}
                />
            );
        if (!isDecided) return <UndecidedButtons />;
        if (isWithdrawn)
            return (
                <DecidedWithdrawnButtons
                    openSetResultModal={openSetResultModal}
                />
            );

        return (
            <DecidedUnsubmittedButtons
                application={application}
                openSetResultModal={openSetResultModal}
                student={student}
            />
        );
    };

    return <Box>{renderButtons()}</Box>;
};

const AdmissionLetterLink = ({ application }) => {
    return (
        (isProgramAdmitted(application) || isProgramRejected(application)) &&
        application.admission_letter?.status === 'uploaded' && (
            <a
                className="text-info"
                href={`${BASE_URL}/api/admissions/${application.admission_letter.admission_file_path.replace(
                    /\\/g,
                    '/'
                )}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                {isProgramAdmitted(application)
                    ? i18next.t('Admission Letter', { ns: 'admissions' })
                    : i18next.t('Rejection Letter', { ns: 'admissions' })}
            </a>
        )
    );
};

export default function ApplicationCard({
    application: propsApplication,
    student
}) {
    const [isLoading, setIsLoading] = useState(false);
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const [application, setApplication] = useState(propsApplication);
    const [resultState, setResultState] = useState('-');
    const [letter, setLetter] = useState(null);
    const [returnedMessage, setReturnedMessage] = useState('');
    const [showSetResultModal, setShowSetResultModal] = useState(false);

    const { programId } = application;
    // const completedItems = checklist.filter((item) => item.completed).length;
    const progress = isProgramSubmitted(application)
        ? 100
        : progressBarCounter(student, application);

    const openSetResultModal = (e, result) => {
        e.stopPropagation();
        setShowSetResultModal(true);
        setResultState(result);
    };

    const onFileChange = (e) => {
        e.preventDefault();
        if (!e.target.files) {
            setLetter(null);
            return;
        }
        const file_num = e.target.files.length;
        if (file_num >= 1) {
            setLetter(e.target.files[0]);
        } else {
            setLetter(null);
        }
    };

    const closeSetResultModal = () => {
        setShowSetResultModal(false);
    };

    const handleUpdateResult = (e, result) => {
        e.stopPropagation();
        setIsLoading(true);
        setReturnedMessage('');
        const formData = new FormData();
        if (letter) {
            formData.append('file', letter);
        }
        if (result.admission) {
            formData.append('admission', result.admission);
        }
        if (result.closed) {
            formData.append('closed', result.closed);
        }
        updateStudentApplicationResultV2(
            student._id.toString(),
            application.programId._id.toString(),
            formData,
            result.admission
        ).then(
            (res) => {
                const { success, data } = res.data;
                if (success) {
                    const application_tmep = { ...application };
                    application_tmep.admission = data.admission;
                    application_tmep.closed = data.closed;
                    application_tmep.admission_letter = data.admission_letter;
                    setSeverity('success');
                    setMessage('Uploaded application status successfully!');
                    setOpenSnackbar(true);
                    setApplication(application_tmep);
                    setLetter(null);
                    setShowSetResultModal(false);
                    setIsLoading(false);
                } else {
                    const { message } = res.data;
                    setLetter(null);
                    setReturnedMessage(message);
                    setIsLoading(false);
                }
            },
            (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
                setLetter(null);
                setIsLoading(false);
            }
        );
    };

    return (
        <Card
            sx={{
                borderLeft: '6px solid orange',
                maxWidth: 800,
                bgcolor: 'background.paper',
                color: 'text.primary',
                my: 1
            }}
        >
            <Grid container spacing={0}>
                {/* LEFT: School Info */}
                <Grid item sm={5} xs={12}>
                    <Box height="100%" p={2}>
                        <Typography
                            color="primary"
                            fontWeight="bold"
                            variant="h6"
                        >
                            {programId?.school || 'ETH Zurich'}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            gutterBottom
                            variant="body2"
                        >
                            {programId?.degree || 'M. Sc.'} –{' '}
                            <strong>{programId?.program_name}</strong>
                        </Typography>

                        <Box mt={2}>
                            {/* I need icon for each of the following: Deadline, Semester, Language
                             */}
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <CalendarMonthIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Deadline:</strong>{' '}
                                    {application_deadline_calculator(
                                        student,
                                        application
                                    )}
                                </Typography>
                            </Stack>
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <CalendarMonthIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Semester:</strong>{' '}
                                    {application.programId.semester}
                                </Typography>
                            </Stack>
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <LanguageIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Language:</strong>{' '}
                                    {application.programId.lang}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Grid>
                {/* RIGHT: Progress + Actions */}
                <Grid item sm={7} xs={12}>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                    >
                        {/* Checklist Section */}
                        <Box sx={{ height: '240px', overflow: 'auto' }}>
                            <ApplicationProgressCardBody
                                application={application}
                                student={student}
                            />
                        </Box>
                    </CardContent>
                </Grid>
                <Grid item sm={12} xs={12}>
                    <Box pb={2} px={2}>
                        {/* Progress Bar */}
                        <Box mb={1}>
                            <LinearProgress
                                value={isNaN(progress) ? 0 : progress}
                                variant="determinate"
                            />
                            <Typography variant="caption">
                                {isNaN(progress) ? '0' : Math.round(progress)}%
                                application complete
                            </Typography>
                        </Box>
                        {/* Buttons */}
                        <DynamicButtons
                            application={application}
                            openSetResultModal={openSetResultModal}
                            student={student}
                        />
                    </Box>
                </Grid>
            </Grid>
            <Dialog
                fullWidth={true}
                maxWidth="md"
                onClose={closeSetResultModal}
                open={showSetResultModal}
            >
                <DialogTitle>{i18next.t('Attention')}</DialogTitle>
                <DialogContent>
                    {resultState.admission && resultState.admission === '-' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {`${i18next.t(
                                'Do you want to reset the result of the application of'
                            )} ${application.programId.school} - ${application.programId.degree} - ${application.programId.program_name}?`}{' '}
                            ?
                        </Typography>
                    ) : null}
                    {resultState.admission && resultState.admission !== '-' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {i18next.t('Do you want to set the application of')}{' '}
                            <b>{`${application.programId.school}-${application.programId.degree}-${application.programId.program_name}`}</b>{' '}
                            <b>
                                {resultState.admission === 'O'
                                    ? i18next.t('Admitted', { ns: 'common' })
                                    : i18next.t('Rejected', { ns: 'common' })}
                            </b>
                            ?
                        </Typography>
                    ) : null}

                    {resultState.admission && resultState.admission !== '-' && (
                        <>
                            <Typography sx={{ my: 2 }}>
                                {resultState.admission === 'O'
                                    ? i18next.t(
                                          'Attach Admission Letter or Admission Email pdf or Email screenshot',
                                          { ns: 'admissions' }
                                      )
                                    : i18next.t(
                                          'Attach Rejection Letter or Admission Email pdf or Email screenshot',
                                          { ns: 'admissions' }
                                      )}
                            </Typography>
                            <TextField
                                fullWidth
                                onChange={(e) => onFileChange(e)}
                                size="small"
                                sx={{ mb: 2 }}
                                type="file"
                            />
                            <Typography sx={{ mb: 2 }} variant="body2">
                                {i18next.t(
                                    'Your agents and editors will receive your application result notification.',
                                    { ns: 'admissions' }
                                )}
                            </Typography>
                            {returnedMessage !== '' ? (
                                <Typography
                                    style={{ color: 'red' }}
                                    sx={{ mb: 2 }}
                                >
                                    {returnedMessage}
                                </Typography>
                            ) : null}
                        </>
                    )}
                    {resultState.closed && resultState.closed === '-' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {i18next.t(
                                'Do you want to unsubmit the application of'
                            )}{' '}
                            <b>{`${application.programId.school}-${application.programId.degree}-${application.programId.program_name}`}</b>{' '}
                        </Typography>
                    ) : null}
                    {resultState.closed && resultState.closed === 'X' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {i18next.t(
                                'Do you want to withdraw the application of'
                            )}{' '}
                            <b>{`${application.programId.school}-${application.programId.degree}-${application.programId.program_name}`}</b>{' '}
                        </Typography>
                    ) : null}
                    {resultState.closed && resultState.closed === 'O' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {i18next.t(
                                'Do you want to submit the application of'
                            )}{' '}
                            <b>{`${application.programId.school}-${application.programId.degree}-${application.programId.program_name}`}</b>{' '}
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        color={
                            resultState.admission === 'O'
                                ? 'primary'
                                : 'secondary'
                        }
                        disabled={isLoading}
                        onClick={(e) => handleUpdateResult(e, resultState)}
                        startIcon={
                            isLoading ? <CircularProgress size={24} /> : null
                        }
                        variant="contained"
                    >
                        {resultState.admission &&
                            (resultState.admission === 'O'
                                ? i18next.t('Admitted', { ns: 'common' })
                                : i18next.t('Rejected', { ns: 'common' }))}
                        {resultState.closed &&
                            i18next.t('Yes', { ns: 'common' })}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={closeSetResultModal}
                        sx={{ ml: 1 }}
                        title="Undo"
                        variant="outlined"
                    >
                        {i18next.t('Cancel', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
