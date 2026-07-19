import { useState, MouseEvent, ChangeEvent, type ReactNode } from 'react';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import {
    Card,
    CardActions,
    Chip,
    Collapse,
    CardContent,
    Stack,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import type { IUserWithId, IStudentResponse } from '@taiger-common/model';
import {
    isProgramAdmitted,
    isProgramDecided,
    isProgramRejected,
    isProgramSubmitted
} from '@taiger-common/core';

import ApplicationProgressCardBody from './ApplicationProgressCardBody';
import {
    APPLICATION_STATUS_COLOR,
    APPLICATION_STATUS_LABEL,
    getApplicationStage
} from '@pages/StudentApplications/components/applicationStatus';
import ApplicationLockControl from '../ApplicationLockControl/ApplicationLockControl';
import { updateStudentApplicationResult } from '@/api';
import type { Application } from '@/api/types';
import DEMO from '@store/constant';
import { application_deadline_V2_calculator } from '@pages/Utils/util_functions';
import { progressBarCounter } from '@pages/Utils/applicationChecklist';
import { BASE_URL } from '@/api';
import { convertDate } from '@utils/contants';
import { appConfig } from '../../config';
import { ConfirmationModal } from '../Modal/ConfirmationModal';
import { useSnackBar } from '@contexts/use-snack-bar';

interface ProgramHeaderProps {
    program?: {
        _id?: { toString: () => string };
        country?: string;
        school?: string;
        degree?: string;
        program_name?: string;
        semester?: string;
    } | null;
    /** Rendered on the school row, in this order: lock, deadline, status. */
    lockControl?: ReactNode;
    deadline?: ReactNode;
    status?: ReactNode;
}

interface AdmissionLetterLinkProps {
    application: Application;
}

interface ApplicationProgressCardProps {
    application: Record<string, unknown>;
    student: Record<string, unknown>;
}

const BorderLinearProgress = styled(LinearProgress)(() => ({
    height: 10,
    borderRadius: 5,
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5
    }
}));

/**
 * Card header: country flag, school (the link), then degree / program /
 * semester as a secondary line.
 *
 * Lock, deadline and status are three separate signals answering three
 * different questions — "can I edit this", "when is it due", "where has it got
 * to" — so they render as distinct siblings on the school row rather than being
 * folded into one string. They used to share a Typography where the deadline
 * was replaced by the result text once submitted, which meant the two could
 * never be read at the same time.
 */
const ProgramHeader = ({
    program,
    lockControl,
    deadline,
    status
}: ProgramHeaderProps) => {
    if (!program) return null;
    const subtitle = [program.degree, program.program_name, program.semester]
        .filter(Boolean)
        .join(' · ');
    return (
        <Box sx={{ mb: 1 }}>
            {/* Row 1 — school name, lock, deadline and status sit adjacent as
                one group rather than being spread across the row: the school
                link no longer flexes, so the three signals read as a caption on
                the name instead of drifting to the far edge. The flag is scoped
                to this row only, so it doesn't open a column that indents
                everything below it. */}
            <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', mb: 0.5 }}
                useFlexGap
            >
                <Box
                    alt="Logo"
                    component="img"
                    src={`/assets/logo/country_logo/svg/${program.country}.svg`}
                    sx={{ flexShrink: 0, maxHeight: 24, maxWidth: 24 }}
                />
                {/* minWidth: 0 lets a long school name wrap rather than forcing
                    the row wider than the card. */}
                <Link
                    component={LinkDom}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        fontWeight: 700,
                        minWidth: 0
                    }}
                    target="_blank"
                    to={DEMO.SINGLE_PROGRAM_LINK(program._id?.toString() ?? '')}
                    underline="hover"
                    variant="subtitle2"
                >
                    {program.school}
                    {/* Decorative: the whole label is already the link target, so
                        a nested button here would just add a dead focus stop. */}
                    <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                </Link>
                {lockControl}
                {deadline}
                {status}
            </Stack>
            {/* Row 2 — full card width, no flag gutter to the left. */}
            {subtitle ? (
                <Typography color="text.primary" variant="body2">
                    {subtitle}
                </Typography>
            ) : null}
        </Box>
    );
};

/**
 * Where the application has got to — one chip, derived from the same funnel
 * the applications page filters by, so the wording matches everywhere.
 * Independent of the deadline: an application can be both "Submitted" and have
 * a date worth remembering.
 */
const ApplicationStatusChip = ({
    application
}: {
    application: Application;
}) => {
    const stage = getApplicationStage(application);
    return (
        <Chip
            color={APPLICATION_STATUS_COLOR[stage]}
            label={i18next.t(APPLICATION_STATUS_LABEL[stage], { ns: 'common' })}
            size="small"
            variant={stage === 'pending' ? 'outlined' : 'filled'}
        />
    );
};

/**
 * When it is due. Withdrawn applications report that instead of a date, since
 * the calculator returns a sentinel rather than one.
 */
const ApplicationDeadline = ({ application }: { application: Application }) => {
    const deadline = application_deadline_V2_calculator(application);
    const withdrawn = deadline === 'WITHDRAW';
    return (
        <Typography
            color="text.secondary"
            component="div"
            sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
            variant="caption"
        >
            {withdrawn ? (
                <BlockIcon fontSize="small" titleAccess="Withdraw" />
            ) : (
                <HourglassEmptyIcon fontSize="small" titleAccess="Deadline" />
            )}
            {deadline}
        </Typography>
    );
};

const AdmissionLetterLink = ({ application }: AdmissionLetterLinkProps) => {
    return (
        (isProgramAdmitted(application) || isProgramRejected(application)) &&
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
                {isProgramAdmitted(application)
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

    const applicationFromProps = props.application as unknown as Application;

    const [application, setApplication] =
        useState<Application>(applicationFromProps);
    const [resultState, setResultState] = useState('-');
    const [letter, setLetter] = useState<File | null>(null);
    const [returnedMessage, setReturnedMessage] = useState('');
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [showSetResultModal, setShowSetResultModal] = useState(false);

    // Until the student commits to a programme, its document tasks are not owed
    // — so the checklist stays sealed rather than presenting work that may
    // never apply. Nothing to expand means nothing to toggle either.
    const isDecided = isProgramDecided(application);

    const handleToggle = () => {
        if (!isDecided) return;
        setIsCollapse(!isCollapse);
    };

    // Ties the toggle button to the region it opens for screen readers.
    const checklistId = `application-checklist-${
        application._id?.toString() ?? ''
    }`;

    const openUndoModal = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setShowUndoModal(true);
    };

    const closeUndoModal = () => {
        setShowUndoModal(false);
    };

    const openSetResultModal = (e: MouseEvent, result: string) => {
        e.stopPropagation();
        setShowSetResultModal(true);
        setResultState(result);
    };

    const closeSetResultModal = () => {
        setShowSetResultModal(false);
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
            {/* Undecided applications are visually recessed: muted background,
                dashed border and slightly dimmed, so a stack of cards reads as
                "these are live, those are still just options" without needing
                to check each status. Theme tokens rather than literal colours,
                so it holds up in dark mode. */}
            <Card
                sx={
                    isDecided
                        ? undefined
                        : {
                              bgcolor: 'action.hover',
                              border: '1px dashed',
                              borderColor: 'divider',
                              opacity: 0.85
                          }
                }
            >
                <CardContent
                    onClick={handleToggle}
                    sx={{
                        // No expandable body when undecided, so the card should
                        // not advertise itself as clickable.
                        cursor: isDecided ? 'pointer' : 'default',
                        ...(isDecided
                            ? { '&:hover': { bgcolor: 'action.hover' } }
                            : {})
                    }}
                >
                    {/* Two rows only: identity with its actions right-aligned
                        on the same line, then the progress bar beneath. Stacks
                        on mobile, where side-by-side would crush both. */}
                    <Box
                        sx={{
                            alignItems: { md: 'center' },
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                            <ProgramHeader
                                lockControl={
                                    /* The lock control has its own buttons — clicking
                               them shouldn't also collapse the card underneath. */
                                    <Box onClick={(e) => e.stopPropagation()}>
                                        <ApplicationLockControl
                                            application={application}
                                        />
                                    </Box>
                                }
                                deadline={
                                    <ApplicationDeadline
                                        application={application}
                                    />
                                }
                                program={application.programId}
                                status={
                                    <ApplicationStatusChip
                                        application={application}
                                    />
                                }
                            />
                        </Box>

                        {/* Actions flow inline and right-align on the same row
                            as the identity, wrapping only when they genuinely
                            run out of width. */}
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                flexShrink: 0,
                                flexWrap: 'wrap',
                                gap: 1,
                                justifyContent: {
                                    xs: 'flex-start',
                                    md: 'flex-end'
                                },
                                // The blocks below carry their own vertical
                                // margins, which would break the single-row
                                // rhythm here.
                                '& .MuiTypography-root': { my: 0 },
                                '& .MuiButton-root': { my: 0 }
                            }}
                        >
                            <Typography variant="body2">
                                <AdmissionLetterLink
                                    application={application}
                                />
                                {isProgramSubmitted(application) &&
                                application.admission !== '-' &&
                                (!application.admission_letter?.status ||
                                    application.admission_letter?.status !==
                                        'uploaded') ? (
                                    <Button
                                        color="primary"
                                        onClick={(e) =>
                                            openSetResultModal(
                                                e,
                                                application.admission ?? ''
                                            )
                                        }
                                        size="small"
                                        startIcon={<AddIcon />}
                                        sx={{ my: 1 }}
                                        title="Undo"
                                        variant="contained"
                                    >
                                        {isProgramAdmitted(application)
                                            ? i18next.t(
                                                  'upload-admission-letter',
                                                  {
                                                      ns: 'admissions'
                                                  }
                                              )
                                            : i18next.t(
                                                  'upload-rejection-letter',
                                                  {
                                                      ns: 'admissions'
                                                  }
                                              )}
                                    </Button>
                                ) : null}
                            </Typography>
                            {appConfig.interviewEnable &&
                            isProgramSubmitted(application) &&
                            application.admission === '-' ? (
                                <>
                                    {!application.interview_status ? (
                                        /* The question that used to sit above
                                           this button is now carried by the
                                           label itself, with the existing
                                           "don't request one you haven't been
                                           invited to" guidance as the tooltip —
                                           so no context is lost from a row that
                                           has no space for a prompt. */
                                        <Tooltip
                                            describeChild
                                            title={i18next.t(
                                                'If you did not receive an interview invitation from the university. Please do not request the training.',
                                                { ns: 'interviews' }
                                            )}
                                        >
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
                                                {i18next.t(
                                                    'Request Interview Training',
                                                    { ns: 'interviews' }
                                                )}
                                            </Button>
                                        </Tooltip>
                                    ) : null}
                                    {application.interview_status ===
                                    'Unscheduled' ? (
                                        <>
                                            <Typography
                                                component="div"
                                                sx={{ my: 1 }}
                                                variant="body1"
                                            >
                                                {i18next.t(
                                                    'Please arrange a meeting',
                                                    {
                                                        ns: 'interviews'
                                                    }
                                                )}
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
                                    {application.interview_status ===
                                    'Scheduled' ? (
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
                                                    {application
                                                        ?.interview_training_event
                                                        ?.start != null
                                                        ? convertDate(
                                                              application
                                                                  .interview_training_event
                                                                  .start
                                                          )
                                                        : ''}
                                                </Link>
                                            </Typography>
                                        </>
                                    ) : null}
                                </>
                            ) : null}
                            {isProgramSubmitted(application) ? (
                                application.admission === '-' ? (
                                    <Typography>
                                        {i18next.t('Tell me about your result')}{' '}
                                        :{' '}
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
                            {isProgramSubmitted(application) &&
                            application.admission === '-' ? (
                                <Box sx={{ my: 1 }}>
                                    <Button
                                        color="primary"
                                        onClick={(e) =>
                                            openSetResultModal(e, 'O')
                                        }
                                        size="small"
                                        startIcon={<CheckIcon />}
                                        sx={{ mr: 1 }}
                                        variant="contained"
                                    >
                                        {i18next.t('Admitted', {
                                            ns: 'common'
                                        })}
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={(e) =>
                                            openSetResultModal(e, 'X')
                                        }
                                        size="small"
                                        startIcon={<CloseIcon />}
                                        variant="outlined"
                                    >
                                        {i18next.t('Rejected', {
                                            ns: 'common'
                                        })}
                                    </Button>
                                </Box>
                            ) : null}
                        </Box>
                    </Box>
                    {/* Row 2: progress spans the full card width. */}
                    <Typography
                        component="div"
                        sx={{ alignItems: 'center', display: 'flex', mt: 1 }}
                        variant="body1"
                    >
                        <BorderLinearProgress
                            className="custom-progress-bar-container"
                            sx={{ flex: 1, mr: 1.25 }}
                            value={
                                isProgramSubmitted(application)
                                    ? 100
                                    : progressBarCounter(
                                          props.student as unknown as IUserWithId,
                                          application as unknown as Application
                                      )
                            }
                            variant="determinate"
                        />
                        <span>
                            {`${
                                isProgramSubmitted(application)
                                    ? 100
                                    : progressBarCounter(
                                          props.student as unknown as IUserWithId,
                                          application as unknown as Application
                                      )
                            }%`}
                        </span>
                    </Typography>
                </CardContent>
                {/* The card body used to be reachable only by clicking the card
                    with no visual hint. This row is the affordance: it names what
                    is hidden, shows a chevron, and is keyboard reachable.
                    Hidden entirely for an undecided programme — there is no
                    point offering to reveal tasks the student does not owe. */}
                {isDecided ? (
                    <CardActions sx={{ pt: 0 }}>
                        {/* describeChild: without it the tooltip becomes the
                        button's aria-label and hides its visible text from
                        screen readers. */}
                        <Tooltip
                            describeChild
                            title={i18next.t(
                                'Documents and requirements for this application'
                            )}
                        >
                            <Button
                                aria-controls={checklistId}
                                aria-expanded={isCollapse}
                                endIcon={
                                    <ExpandMoreIcon
                                        sx={{
                                            transform: isCollapse
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)',
                                            transition: 'transform 0.2s'
                                        }}
                                    />
                                }
                                fullWidth
                                onClick={handleToggle}
                                size="small"
                            >
                                {isCollapse
                                    ? i18next.t('Hide checklist')
                                    : i18next.t('Show checklist')}
                            </Button>
                        </Tooltip>
                    </CardActions>
                ) : null}
                {isDecided ? (
                    <Collapse id={checklistId} in={isCollapse}>
                        <ApplicationProgressCardBody
                            application={application}
                            student={
                                props.student as unknown as IStudentResponse
                            }
                        />
                    </Collapse>
                ) : null}
            </Card>
            <ConfirmationModal
                closeText={i18next.t('Cancel', { ns: 'common' })}
                confirmText={i18next.t('Confirm', { ns: 'common' })}
                content={`${i18next.t(
                    'Do you want to reset the result of the application of'
                )} ${application.programId?.school} - ${application.programId?.degree} - ${application.programId?.program_name}?`}
                isLoading={isLoading}
                onClose={closeUndoModal}
                onConfirm={() => handleUpdateResult(undefined, '-')}
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
                        <Typography color="error" sx={{ mb: 2 }}>
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
