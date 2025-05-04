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

import ApplicationProgressCardBody from '../../components/ApplicationProgressCard/ApplicationProgressCardBody';
import { useSnackBar } from '../../contexts/use-snack-bar';
import i18next from 'i18next';
import { useNavigate } from 'react-router-dom';
import DEMO from '../../store/constant';
import { ConfirmationModal } from '../../components/Modal/ConfirmationModal';
import { updateStudentApplicationResult } from '../../api';
import {
    application_deadline_calculator,
    progressBarCounter
} from '../Utils/checking-functions';

const DecidedSubmittedButtons = ({ openSetResultModal }) => {
    const navigate = useNavigate();
    return (
        <Stack direction="row" mt="auto" spacing={1}>
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, 'O')}
                startIcon={<DoneIcon />}
                variant="contained"
            >
                Get Admission
            </Button>
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, 'X')}
                startIcon={<CancelIcon />}
                variant="outlined"
            >
                Get Rejection
            </Button>
            {/* TODO: Unsubmit */}
            <Button
                color="primary"
                onClick={(e) => openSetResultModal(e, '-')}
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

const DecidedWithdrawnButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Re-apply
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Withdraw
        </Button>
    </Stack>
);

const DecidedUnsubmittedButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Mark as Complete
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Mark as Withdrawn
        </Button>
    </Stack>
);

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

const AdmittedOrRejectedButtons = ({ openUndoModal }) => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button
            color="primary"
            onClick={(e) => openUndoModal(e)}
            startIcon={<UndoIcon />}
            variant="contained"
        >
            Change Result
        </Button>
    </Stack>
);

const DynamicButtons = ({ application, openSetResultModal, openUndoModal }) => {
    const isDecided = isProgramDecided(application);
    const isSubmitted = isProgramSubmitted(application);
    const isWithdrawn = isProgramWithdraw(application);

    const isAdmitted = isProgramAdmitted(application);
    const isRejected = isProgramRejected(application);
    // --- Conditional rendering ---
    const renderButtons = () => {
        if (isAdmitted || isRejected)
            return <AdmittedOrRejectedButtons openUndoModal={openUndoModal} />;
        if (isSubmitted)
            return (
                <DecidedSubmittedButtons
                    openSetResultModal={openSetResultModal}
                />
            );
        if (!isDecided) return <UndecidedButtons />;
        if (isWithdrawn) return <DecidedWithdrawnButtons />;

        return <DecidedUnsubmittedButtons />;
    };

    return <Box>{renderButtons()}</Box>;
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
    const [showUndoModal, setShowUndoModal] = useState(false);
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

    const openUndoModal = (e) => {
        e.stopPropagation();
        setShowUndoModal(true);
    };

    const closeUndoModal = () => {
        setShowUndoModal(false);
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
        updateStudentApplicationResult(
            student._id.toString(),
            application.programId._id.toString(),
            result,
            formData
        ).then(
            (res) => {
                const { success, data } = res.data;
                if (success) {
                    const application_tmep = { ...application };
                    application_tmep.admission = result;
                    application_tmep.admission_letter = data.admission_letter;
                    setSeverity('success');
                    setMessage('Uploaded application status successfully!');
                    setOpenSnackbar(true);
                    setApplication(application_tmep);
                    setLetter(null);
                    setShowUndoModal(false);
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
                            color="primary"
                            openSetResultModal={openSetResultModal}
                            openUndoModal={openUndoModal}
                            startIcon={<DoneIcon />}
                            variant="contained"
                        />
                    </Box>
                </Grid>
            </Grid>
            <ConfirmationModal
                closeText={i18next.t('Cancel', { ns: 'common' })}
                confirmText={i18next.t('Confirm', { ns: 'common' })}
                content={`${i18next.t(
                    'Do you want to reset the result of the application of'
                )} ${application.programId.school} - ${application.programId.degree} - ${application.programId.program_name}?`}
                isLoading={isLoading}
                onClose={closeUndoModal}
                onConfirm={(e) => handleUpdateResult(e, '-')}
                open={showUndoModal}
                title={i18next.t('Attention')}
            />
            <Dialog
                fullWidth={true}
                maxWidth="md"
                onClose={closeSetResultModal}
                open={showSetResultModal}
            >
                <DialogTitle>{i18next.t('Attention')}</DialogTitle>
                <DialogContent>
                    {application.admission === '-' ? (
                        <Typography id="modal-modal-description" sx={{ my: 2 }}>
                            {i18next.t('Do you want to set the application of')}{' '}
                            <b>{`${application.programId.school}-${application.programId.degree}-${application.programId.program_name}`}</b>{' '}
                            <b>
                                {resultState === 'O'
                                    ? i18next.t('Admitted', { ns: 'common' })
                                    : i18next.t('Rejected', { ns: 'common' })}
                            </b>
                            ?
                        </Typography>
                    ) : null}
                    <Typography sx={{ my: 2 }}>
                        {resultState === 'O'
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
                        <Typography style={{ color: 'red' }} sx={{ mb: 2 }}>
                            {returnedMessage}
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        color={resultState === 'O' ? 'primary' : 'secondary'}
                        disabled={
                            isLoading
                            // || !hasFile
                        }
                        onClick={(e) => handleUpdateResult(e, resultState)}
                        startIcon={
                            isLoading ? <CircularProgress size={24} /> : null
                        }
                        variant="contained"
                    >
                        {resultState === 'O'
                            ? i18next.t('Admitted', { ns: 'common' })
                            : i18next.t('Rejected', { ns: 'common' })}
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
