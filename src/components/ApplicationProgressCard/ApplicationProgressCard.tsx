import React, { useState } from 'react';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import {
    Card,
    Collapse,
    CardContent,
    Typography,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Button,
    Link,
    LinearProgress,
    CircularProgress,
    linearProgressClasses,
    styled,
    TextField
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LaunchIcon from '@mui/icons-material/Launch';
import i18next from 'i18next';
import {
    isProgramAdmitted,
    isProgramRejected,
    isProgramSubmitted
} from '@taiger-common/core';
import type { ApplicationProps } from '@taiger-common/core';
import type { Application } from '../../api/types';

import ApplicationProgressCardBody from './ApplicationProgressCardBody';
import ApplicationLockControl from '../ApplicationLockControl/ApplicationLockControl';
import { updateStudentApplicationResult } from '../../api';
import DEMO from '../../store/constant';
import {
    application_deadline_V2_calculator,
    progressBarCounter
} from '../../Demo/Utils/util_functions';
import { BASE_URL } from '../../api/request';
import {
    FILE_NOT_OK_SYMBOL,
    FILE_OK_SYMBOL,
    convertDate
} from '../../utils/contants';
import { appConfig } from '../../config';
import { ConfirmationModal } from '../Modal/ConfirmationModal';
import { useSnackBar } from '../../contexts/use-snack-bar';
import { type IApplication } from '@taiger-common/model';

interface ProgramLinkProps {
    program: {
        _id?: { toString: () => string };
        country?: string;
        school?: string;
        degree?: string;
        program_name?: string;
        semester?: string;
    };
}

interface AdmissionLetterLinkProps {
    application: Record<string, unknown> & {
        admission_letter?: { status?: string; admission_file_path?: string };
    };
}

interface ApplicationProgressCardProps {
    application: Record<string, unknown>;
    student: Record<string, unknown>;
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor:
            theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800]
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'
    }
}));

const ProgramLink = ({ program }: ProgramLinkProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img
            alt="Logo"
            src={`/assets/logo/country_logo/svg/${program.country}.svg`}
            style={{ maxWidth: 24, maxHeight: 24 }}
        />
        &nbsp;
        <Link
            component={LinkDom}
            onClick={(e) => e.stopPropagation()}
            sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
            target="_blank"
            to={DEMO.SINGLE_PROGRAM_LINK(program._id?.toString() ?? '')}
            underline="hover"
        >
            {program.school}
            <IconButton>
                <LaunchIcon fontSize="small" />
            </IconButton>
        </Link>
    </Box>
);

const AdmissionLetterLink = ({ application }: AdmissionLetterLinkProps) => {
    return (
        (isProgramAdmitted(application as unknown as ApplicationProps) ||
            isProgramRejected(application as unknown as ApplicationProps)) &&
        application.admission_letter?.status === 'uploaded' && (
            <a
                className="text-info"
                href={`${BASE_URL}/api/admissions/${application.admission_letter.admission_file_path?.replace(
                    /\\/g,
                    '/'
                )}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                {isProgramAdmitted(application as unknown as ApplicationProps)
                    ? i18next.t('Admission Letter', { ns: 'admissions' })
                    : i18next.t('Rejection Letter', { ns: 'admissions' })}
            </a>
        )
    );
};

export default function ApplicationProgressCard(
    props: ApplicationProgressCardProps
) {
    const [isCollapse, setIsCollapse] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const navigate = useNavigate();

    const applicationFromProps = props.application as Application;

    const [application, setApplication] =
        useState<Application>(applicationFromProps);
    const [resultState, setResultState] = useState('-');
    const [letter, setLetter] = useState<File | null>(null);
    const [returnedMessage, setReturnedMessage] = useState('');
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [showSetResultModal, setShowSetResultModal] = useState(false);

    const handleToggle = () => {
        setIsCollapse(!isCollapse);
    };

    const openUndoModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowUndoModal(true);
    };

    const closeUndoModal = () => {
        setShowUndoModal(false);
    };

    const openSetResultModal = (e: React.MouseEvent, result: string) => {
        e.stopPropagation();
        setShowSetResultModal(true);
        setResultState(result);
    };

    const closeSetResultModal = () => {
        setShowSetResultModal(false);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleUpdateResult = (
        e: React.MouseEvent | undefined,
        result: string
    ) => {
        e?.stopPropagation();
        setIsLoading(true);
        setReturnedMessage('');
        const formData = new FormData();
        if (letter) {
            formData.append('file', letter);
        }
        updateStudentApplicationResult(
            (
                props.student as { _id: { toString: () => string } }
            )._id.toString(),
            application._id?.toString() ?? '',
            application.programId?._id?.toString() ?? '',
            result,
            formData
        ).then(
            (res: {
                data: {
                    success?: boolean;
                    data?: { admission_letter?: unknown };
                    message?: string;
                };
            }) => {
                const { success, data } = res.data;
                if (success && data) {
                    const application_tmep = { ...application };
                    application_tmep.admission = result;
                    application_tmep.admission_letter =
                        data.admission_letter as
                            | { status?: string; admission_file_path?: string }
                            | undefined;
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
                    setReturnedMessage(message ?? '');
                    setIsLoading(false);
                }
            },
            (error: { message?: string }) => {
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
        <>
            <Card>
                <CardContent onClick={handleToggle}>
                    <Typography color="text.secondary" gutterBottom>
                        {isProgramSubmitted(application as ApplicationProps) ? (
                            <>
                                {application.admission === '-' ? (
                                    <>
                                        <IconButton>
                                            {FILE_OK_SYMBOL}
                                        </IconButton>
                                        &nbsp;
                                        {i18next.t('Submitted', {
                                            ns: 'common'
                                        })}
                                    </>
                                ) : null}
                                {isProgramAdmitted(
                                    application as unknown as ApplicationProps
                                ) ? (
                                    <>
                                        <IconButton>
                                            {FILE_OK_SYMBOL}
                                        </IconButton>
                                        &nbsp;
                                        {i18next.t('Admitted', {
                                            ns: 'common'
                                        })}
                                    </>
                                ) : null}
                                {isProgramRejected(
                                    application as ApplicationProps
                                ) ? (
                                    <>
                                        <IconButton>
                                            {FILE_NOT_OK_SYMBOL}
                                        </IconButton>
                                        &nbsp;
                                        {i18next.t('Rejected', {
                                            ns: 'common'
                                        })}
                                    </>
                                ) : null}
                            </>
                        ) : application_deadline_V2_calculator(application) ===
                          'WITHDRAW' ? (
                            <>
                                <IconButton title="Withdraw">
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                                {application_deadline_V2_calculator(
                                    application
                                )}
                            </>
                        ) : (
                            <>
                                <IconButton title="Pending">
                                    <HourglassEmptyIcon fontSize="small" />
                                </IconButton>
                                {application_deadline_V2_calculator(
                                    application
                                )}
                            </>
                        )}
                    </Typography>
                    <Box sx={{ my: 1 }}>
                        <ApplicationLockControl
                            application={application as unknown as IApplication}
                            onLockChange={() => {
                                // Refresh application data if needed
                                setApplication({ ...application });
                            }}
                        />
                    </Box>
                    <ProgramLink program={application.programId} />
                    <Typography fontWeight="bold" variant="body2">
                        {application?.programId?.degree}{' '}
                        {application?.programId?.program_name}{' '}
                        {application?.programId?.semester}{' '}
                    </Typography>
                    <Typography variant="body2">
                        <AdmissionLetterLink application={application} />
                        {isProgramSubmitted(application as ApplicationProps) &&
                        application.admission !== '-' &&
                        (!application.admission_letter?.status ||
                            application.admission_letter?.status !==
                                'uploaded') ? (
                            <Button
                                color="primary"
                                onClick={(e) =>
                                    openSetResultModal(
                                        e,
                                        application.admission!
                                    )
                                }
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ my: 1 }}
                                title="Undo"
                                variant="contained"
                            >
                                {isProgramAdmitted(
                                    application as unknown as ApplicationProps
                                )
                                    ? i18next.t('upload-admission-letter', {
                                          ns: 'admissions'
                                      })
                                    : i18next.t('upload-rejection-letter', {
                                          ns: 'admissions'
                                      })}
                            </Button>
                        ) : null}
                    </Typography>
                    {appConfig.interviewEnable &&
                    isProgramSubmitted(application as ApplicationProps) &&
                    application.admission === '-' ? (
                        <>
                            {!application.interview_status ? (
                                <>
                                    <Typography sx={{ my: 1 }} variant="body2">
                                        {i18next.t(
                                            'Have you received the interview invitation from this program?'
                                        )}
                                    </Typography>
                                    <Typography sx={{ my: 1 }} variant="body2">
                                        <Button
                                            color="primary"
                                            onClick={() =>
                                                navigate(
                                                    `${DEMO.INTERVIEW_ADD_LINK}`
                                                )
                                            }
                                            size="small"
                                            variant="contained"
                                        >
                                            {i18next.t('Training Request', {
                                                ns: 'interviews'
                                            })}
                                        </Button>
                                    </Typography>
                                </>
                            ) : null}
                            {application.interview_status === 'Unscheduled' ? (
                                <>
                                    <Typography
                                        component="div"
                                        sx={{ my: 1 }}
                                        variant="body1"
                                    >
                                        {i18next.t('Please arrange a meeting', {
                                            ns: 'interviews'
                                        })}
                                    </Typography>
                                    <Typography
                                        component="div"
                                        sx={{ my: 1 }}
                                        variant="body1"
                                    >
                                        <Typography
                                            component="div"
                                            sx={{ my: 1 }}
                                            variant="body1"
                                        >
                                            <Link
                                                component={LinkDom}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                target="_blank"
                                                to={`${DEMO.INTERVIEW_SINGLE_LINK(
                                                    application?.interview_id ??
                                                        ''
                                                )}`}
                                                underline="hover"
                                            >
                                                {i18next.t(
                                                    'arrange-a-training',
                                                    {
                                                        ns: 'interviews'
                                                    }
                                                )}
                                            </Link>
                                        </Typography>
                                    </Typography>
                                </>
                            ) : null}
                            {application.interview_status === 'Scheduled' ? (
                                <>
                                    <Typography
                                        component="div"
                                        sx={{ my: 1 }}
                                        variant="body1"
                                    >
                                        {i18next.t(
                                            'Do not forget to attend the interview training'
                                        )}
                                    </Typography>
                                    <Typography
                                        component="div"
                                        sx={{ my: 1 }}
                                        variant="body1"
                                    >
                                        <Link
                                            component={LinkDom}
                                            onClick={(e) => e.stopPropagation()}
                                            target="_blank"
                                            to={`${DEMO.INTERVIEW_SINGLE_LINK(
                                                application?.interview_id ?? ''
                                            )}`}
                                            underline="hover"
                                        >
                                            {convertDate(
                                                application
                                                    ?.interview_training_event
                                                    ?.start
                                            )}
                                        </Link>
                                    </Typography>
                                </>
                            ) : null}
                        </>
                    ) : null}
                    {isProgramSubmitted(application as ApplicationProps) ? (
                        application.admission === '-' ? (
                            <Typography>
                                {i18next.t('Tell me about your result')} :{' '}
                            </Typography>
                        ) : (
                            <Button
                                color="secondary"
                                onClick={(e) => openUndoModal(e)}
                                size="small"
                                startIcon={<UndoIcon />}
                                sx={{ my: 1 }}
                                title="Undo"
                                variant="outlined"
                            >
                                {i18next.t('Change your result')}
                            </Button>
                        )
                    ) : null}
                    {isProgramSubmitted(application as ApplicationProps) &&
                    application.admission === '-' ? (
                        <Box sx={{ my: 1 }}>
                            <Button
                                color="primary"
                                onClick={(e) => openSetResultModal(e, 'O')}
                                size="small"
                                startIcon={<CheckIcon />}
                                sx={{ mr: 1 }}
                                variant="contained"
                            >
                                {i18next.t('Admitted', { ns: 'common' })}
                            </Button>
                            <Button
                                color="secondary"
                                onClick={(e) => openSetResultModal(e, 'X')}
                                size="small"
                                startIcon={<CloseIcon />}
                                variant="outlined"
                            >
                                {i18next.t('Rejected', { ns: 'common' })}
                            </Button>
                        </Box>
                    ) : null}
                    <Typography
                        component="div"
                        style={{ display: 'flex', alignItems: 'center' }}
                        variant="body1"
                    >
                        <BorderLinearProgress
                            className="custom-progress-bar-container"
                            style={{ flex: 1, marginRight: '10px' }}
                            value={
                                isProgramSubmitted(
                                    application as ApplicationProps
                                )
                                    ? 100
                                    : progressBarCounter(
                                          props.student,
                                          application as ApplicationProps
                                      )
                            }
                            variant="determinate"
                        />
                        <span>
                            {`${
                                isProgramSubmitted(
                                    application as ApplicationProps
                                )
                                    ? 100
                                    : progressBarCounter(
                                          props.student,
                                          application as ApplicationProps
                                      )
                            }%`}
                        </span>
                    </Typography>
                </CardContent>
                <Collapse in={isCollapse}>
                    <ApplicationProgressCardBody
                        application={application}
                        student={props.student}
                    />
                </Collapse>
            </Card>
            <ConfirmationModal
                closeText={i18next.t('Cancel', { ns: 'common' })}
                confirmText={i18next.t('Confirm', { ns: 'common' })}
                content={`${i18next.t(
                    'Do you want to reset the result of the application of'
                )} ${application.programId?.school} - ${application.programId?.degree} - ${application.programId?.program_name}?`}
                isLoading={isLoading}
                onClose={closeUndoModal}
                onConfirm={() => handleUpdateResult(undefined!, '-')}
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
                            <b>{`${application.programId?.school}-${application.programId?.degree}-${application.programId?.program_name}`}</b>{' '}
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
                        onChange={onFileChange}
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
                        disabled={isLoading}
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
        </>
    );
}
