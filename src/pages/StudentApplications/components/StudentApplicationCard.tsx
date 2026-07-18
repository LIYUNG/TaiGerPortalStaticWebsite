import { ChangeEvent, SyntheticEvent, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    FormControl,
    LinearProgress,
    Link,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Link as LinkDom } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { differenceInDays } from 'date-fns';
import {
    isProgramAdmitted,
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import type { IStudentResponse, IUserWithId } from '@taiger-common/model';
import type { Application } from '@/api/types';

import ApplicationProgressCardBody from '@components/ApplicationProgressCard/ApplicationProgressCardBody';
import {
    buildApplicationChecklist,
    progressBarCounter
} from '../../Utils/applicationChecklist';
import { application_deadline_V2_calculator } from '../../Utils/util_functions';
import DEMO from '@store/constant';
import {
    getApplicationLocks,
    getSubmitBlockers,
    isReadyToSubmit
} from './applicationLocks';
import {
    APPLICATION_STATUS_COLOR,
    APPLICATION_STATUS_LABEL,
    type ApplicationStatus
} from './applicationStatus';

type AdmissionResult = '-' | 'O' | 'X';

/** Deadline urgency thresholds, in days. */
const DEADLINE_URGENT_DAYS = 14;
const DEADLINE_SOON_DAYS = 30;

export interface StudentApplicationCardProps {
    application: Application;
    application_idx: number;
    student: IStudentResponse;
    status: ApplicationStatus;
    isSubmitting?: boolean;
    handleChange: (
        e: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>,
        application_idx: number
    ) => void;
    handleFinalEnrolmentChange: (
        application_idx: number,
        finalEnrolment: boolean
    ) => void;
    handleWithdraw: (
        e: SyntheticEvent,
        application_idx: number,
        programWithdraw?: '-' | 'X'
    ) => void;
    handleAdmissionResultChange: (
        application: Application,
        result: AdmissionResult
    ) => Promise<void>;
}

const StateIcon = ({ state }: { state: 'ok' | 'missing' | 'warning' }) => {
    if (state === 'ok') {
        return <CheckCircleIcon color="success" fontSize="small" />;
    }
    if (state === 'warning') {
        return <WarningAmberIcon color="error" fontSize="small" />;
    }
    return <RadioButtonUncheckedIcon color="disabled" fontSize="small" />;
};

/**
 * One application, as a student sees it. The desktop table answers "what is the
 * status of every field"; a student needs the opposite — "what do I still have
 * to do for this program". So the outstanding checklist rows are the headline,
 * and the status dropdowns sit underneath as the edit surface.
 */
const StudentApplicationCard = ({
    application,
    application_idx,
    student,
    status,
    isSubmitting,
    handleChange,
    handleFinalEnrolmentChange,
    handleWithdraw,
    handleAdmissionResultChange
}: StudentApplicationCardProps) => {
    const { t } = useTranslation();
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
    const isInteractionDisabled = isSubmitting || isSubmittingAdmission;

    const program = application.programId;
    const locks = getApplicationLocks(application);
    const decided = isProgramDecided(application);
    const submitted = isProgramSubmitted(application);
    const withdrawn = isProgramWithdraw(application);

    const checklist = buildApplicationChecklist(
        student as unknown as IUserWithId,
        application
    );
    const outstandingDocs = checklist.filter((item) => item.state !== 'ok');
    const progress = progressBarCounter(
        student as unknown as IUserWithId,
        application
    );

    const deadline = program?.application_deadline
        ? String(application_deadline_V2_calculator(application))
        : '';
    const daysLeft =
        !submitted && !withdrawn && program?.application_deadline
            ? differenceInDays(
                  new Date(application_deadline_V2_calculator(application)),
                  new Date()
              )
            : null;
    const deadlineColor =
        daysLeft === null
            ? 'default'
            : daysLeft <= DEADLINE_URGENT_DAYS
              ? 'error'
              : daysLeft <= DEADLINE_SOON_DAYS
                ? 'warning'
                : 'default';

    const readyToSubmit = isReadyToSubmit(application, student);
    const submitBlockers = getSubmitBlockers(application, student);

    // Once the paperwork is done the application still needs *reporting* on:
    // the offer result after submitting, then the enrolment decision after an
    // offer. Those live in this card's dropdowns rather than behind a link, so
    // they are appended as href-less steps.
    const statusSteps: {
        id: string;
        label: string;
        state: 'missing';
    }[] = [];
    if (submitted && !withdrawn && !locks.hasAdmissionResult) {
        statusSteps.push({
            id: 'admission-status',
            label: t('Update admission status', { ns: 'common' }),
            state: 'missing'
        });
    }
    if (isProgramAdmitted(application) && !application.finalEnrolment) {
        statusSteps.push({
            id: 'final-enrolment-status',
            label: t('Update final enrolment status', { ns: 'common' }),
            state: 'missing'
        });
    }

    const outstanding: {
        id: string;
        label: string;
        state: 'ok' | 'missing' | 'warning';
        href?: string;
        detail?: string;
        title?: string;
    }[] = [...outstandingDocs, ...statusSteps];

    const currentAdmission: AdmissionResult =
        application.admission === 'O' || application.admission === 'X'
            ? application.admission
            : '-';

    const onClickAdmissionResult = async (result: AdmissionResult) => {
        if (result === currentAdmission) return;
        setIsSubmittingAdmission(true);
        try {
            await handleAdmissionResultChange(application, result);
        } finally {
            setIsSubmittingAdmission(false);
        }
    };

    const programLink = DEMO.SINGLE_PROGRAM_LINK(
        program?._id?.toString() ?? ''
    );

    return (
        <Card
            sx={{
                // Colour-coded spine so a stack of cards is scannable.
                borderLeft: 4,
                borderLeftColor: `${APPLICATION_STATUS_COLOR[status] === 'default' ? 'grey' : APPLICATION_STATUS_COLOR[status]}.main`,
                opacity: withdrawn ? 0.7 : 1
            }}
            variant="outlined"
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 1 }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Link
                            component={LinkDom}
                            sx={{ fontWeight: 700 }}
                            to={programLink}
                            underline="hover"
                            variant="subtitle1"
                        >
                            {program?.school}
                        </Link>
                        <Typography color="text.secondary" variant="body2">
                            {[
                                program?.degree,
                                program?.program_name,
                                program?.semester
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </Typography>
                    </Box>
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap' }}
                    >
                        <Chip
                            color={APPLICATION_STATUS_COLOR[status]}
                            label={t(APPLICATION_STATUS_LABEL[status], {
                                ns: 'common'
                            })}
                            size="small"
                        />
                        {deadline ? (
                            <Chip
                                color={deadlineColor}
                                label={
                                    daysLeft === null
                                        ? deadline
                                        : `${deadline} · ${daysLeft} ${t('days left', { ns: 'common' })}`
                                }
                                size="small"
                                variant="outlined"
                            />
                        ) : null}
                    </Stack>
                </Stack>

                <Box sx={{ mb: 1.5 }}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 0.5 }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Progress', { ns: 'common' })}
                        </Typography>
                        <Typography fontWeight={700} variant="caption">
                            {progress}%
                        </Typography>
                    </Stack>
                    <LinearProgress
                        aria-label="application progress"
                        color={progress === 100 ? 'success' : 'primary'}
                        sx={{ borderRadius: 1, height: 6 }}
                        value={progress}
                        variant="determinate"
                    />
                </Box>

                {/* Two columns on desktop: the checklist rarely fills the width,
                    so the status controls sit in the space to its right instead
                    of pushing the card taller. Single column on mobile. */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' },
                        gap: 2,
                        alignItems: 'start'
                    }}
                >
                    {/* The point of the card: what is still owed, not what is done.
                        Until the student decides to apply, none of that work is
                        owed yet — the only real action is the Decided dropdown,
                        so listing documents here would be noise. */}
                    <Box>
                        {!decided ? (
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={0.5}
                            >
                                <RadioButtonUncheckedIcon
                                    color="disabled"
                                    fontSize="small"
                                />
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('Decide whether to apply first.', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            </Stack>
                        ) : (
                            <>
                                <Typography
                                    fontWeight={700}
                                    variant="subtitle2"
                                >
                                    {outstanding.length === 0
                                        ? t('Nothing outstanding', {
                                              ns: 'common'
                                          })
                                        : `${t('Next steps', { ns: 'common' })} (${outstanding.length})`}
                                </Typography>
                                {outstanding.length === 0 ? (
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={0.5}
                                        sx={{ mt: 0.5 }}
                                    >
                                        <CheckCircleIcon
                                            color="success"
                                            fontSize="small"
                                        />
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {t(
                                                'Everything for this program is done.',
                                                {
                                                    ns: 'common'
                                                }
                                            )}
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Stack
                                        component="ul"
                                        spacing={0.5}
                                        sx={{
                                            m: 0,
                                            mt: 0.5,
                                            pl: 0,
                                            listStyle: 'none'
                                        }}
                                    >
                                        {outstanding.map((item) => (
                                            <Stack
                                                alignItems="center"
                                                component="li"
                                                direction="row"
                                                key={item.id}
                                                spacing={0.75}
                                            >
                                                <StateIcon state={item.state} />
                                                {/* Status prompts are handled
                                                    by this card's own
                                                    dropdowns, so they carry no
                                                    href and render as plain
                                                    text. */}
                                                {item.href ? (
                                                    <Link
                                                        component={LinkDom}
                                                        to={item.href}
                                                        underline="hover"
                                                        variant="body2"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <Typography variant="body2">
                                                        {item.label}
                                                    </Typography>
                                                )}
                                                {item.detail ? (
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="body2"
                                                    >
                                                        {`- ${item.detail}`}
                                                    </Typography>
                                                ) : null}
                                                {item.title ? (
                                                    <Tooltip
                                                        arrow
                                                        title={item.title}
                                                    >
                                                        <ErrorOutlineIcon
                                                            color="error"
                                                            fontSize="small"
                                                        />
                                                    </Tooltip>
                                                ) : null}
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                                <Button
                                    onClick={() =>
                                        setShowAllSteps((prev) => !prev)
                                    }
                                    size="small"
                                    sx={{ mt: 0.5, px: 0 }}
                                    variant="text"
                                >
                                    {showAllSteps
                                        ? t('Hide full checklist', {
                                              ns: 'common'
                                          })
                                        : t('Show full checklist', {
                                              ns: 'common'
                                          })}
                                </Button>
                                <Collapse
                                    in={showAllSteps}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <ApplicationProgressCardBody
                                        application={application}
                                        student={student}
                                    />
                                </Collapse>
                            </>
                        )}
                    </Box>

                    {/* Same controls and lock rules as the desktop table row. */}
                    <Box
                        sx={{
                            // Separator follows the layout: a rule to the left of
                            // the column on desktop, above it when stacked.
                            borderLeft: { md: 1 },
                            borderTop: { xs: 1, md: 0 },
                            borderColor: { xs: 'divider', md: 'divider' },
                            pl: { md: 2 },
                            pt: { xs: 1.5, md: 0 }
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                            variant="caption"
                        >
                            {t('Update status', { ns: 'common' })}
                        </Typography>
                        {/* One row: the four controls share the column width
                        equally and wrap only when there is genuinely no room. */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                flexWrap: 'wrap',
                                gap: 1,
                                '& > .MuiFormControl-root': {
                                    flex: '1 1 0',
                                    minWidth: 120
                                }
                            }}
                            useFlexGap
                        >
                            <FormControl fullWidth size="small">
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    {t('Decided', { ns: 'common' })}
                                </Typography>
                                <Select
                                    disabled={
                                        application.closed !== '-' ||
                                        isInteractionDisabled
                                    }
                                    inputProps={{ 'aria-label': 'decided' }}
                                    name="decided"
                                    onChange={(e) =>
                                        handleChange(e, application_idx)
                                    }
                                    size="small"
                                    value={application.decided}
                                >
                                    <MenuItem value="-">-</MenuItem>
                                    <MenuItem value="X">
                                        {t('No', { ns: 'common' })}
                                    </MenuItem>
                                    <MenuItem value="O">
                                        {t('Yes', { ns: 'common' })}
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {decided && !withdrawn ? (
                                <FormControl fullWidth size="small">
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {t('Submitted', { ns: 'common' })}
                                    </Typography>
                                    <Tooltip
                                        arrow
                                        title={
                                            !readyToSubmit
                                                ? `${t('Finish first', { ns: 'common' })}: ${submitBlockers.join(', ')}`
                                                : locks.submissionLockReason
                                                  ? t(
                                                        locks.submissionLockReason,
                                                        {
                                                            ns: 'common'
                                                        }
                                                    )
                                                  : ''
                                        }
                                    >
                                        <span>
                                            <Select
                                                disabled={
                                                    !readyToSubmit ||
                                                    !locks.canUpdateSubmission ||
                                                    isInteractionDisabled
                                                }
                                                fullWidth
                                                inputProps={{
                                                    'aria-label':
                                                        'submission status'
                                                }}
                                                name="closed"
                                                onChange={(e) =>
                                                    handleChange(
                                                        e,
                                                        application_idx
                                                    )
                                                }
                                                size="small"
                                                value={application.closed}
                                            >
                                                <MenuItem value="-">
                                                    {t('Not Yet', {
                                                        ns: 'common'
                                                    })}
                                                </MenuItem>
                                                <MenuItem value="O">
                                                    {t('Submitted', {
                                                        ns: 'common'
                                                    })}
                                                </MenuItem>
                                            </Select>
                                        </span>
                                    </Tooltip>
                                </FormControl>
                            ) : null}

                            {decided && submitted ? (
                                <FormControl fullWidth size="small">
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {t('Admission', { ns: 'common' })}
                                    </Typography>
                                    <Tooltip
                                        arrow
                                        title={
                                            locks.admissionLockReason
                                                ? t(locks.admissionLockReason, {
                                                      ns: 'common'
                                                  })
                                                : ''
                                        }
                                    >
                                        <span>
                                            <Select
                                                disabled={
                                                    !locks.canUpdateAdmission ||
                                                    isInteractionDisabled
                                                }
                                                fullWidth
                                                inputProps={{
                                                    'aria-label':
                                                        'admission result'
                                                }}
                                                name="admission"
                                                onChange={(e) =>
                                                    onClickAdmissionResult(
                                                        e.target
                                                            .value as AdmissionResult
                                                    )
                                                }
                                                size="small"
                                                value={currentAdmission}
                                            >
                                                <MenuItem value="-">-</MenuItem>
                                                <MenuItem value="O">
                                                    {t('Yes', { ns: 'common' })}
                                                </MenuItem>
                                                <MenuItem value="X">
                                                    {t('No', { ns: 'common' })}
                                                </MenuItem>
                                            </Select>
                                        </span>
                                    </Tooltip>
                                </FormControl>
                            ) : null}

                            {decided &&
                            submitted &&
                            isProgramAdmitted(application) ? (
                                <FormControl fullWidth size="small">
                                    <Typography
                                        color="text.secondary"
                                        variant="caption"
                                    >
                                        {t('Final Enrolment', { ns: 'common' })}
                                    </Typography>
                                    <Select<number>
                                        disabled={isInteractionDisabled}
                                        inputProps={{
                                            'aria-label': 'final enrolment'
                                        }}
                                        name="finalEnrolment"
                                        onChange={(e) =>
                                            handleFinalEnrolmentChange(
                                                application_idx,
                                                Number(e.target.value) === 1
                                            )
                                        }
                                        size="small"
                                        value={
                                            application.finalEnrolment ? 1 : 0
                                        }
                                    >
                                        <MenuItem value={0}>
                                            {t('No', { ns: 'common' })}
                                        </MenuItem>
                                        <MenuItem value={1}>
                                            {t('Yes', { ns: 'common' })}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : null}

                            {decided && !submitted ? (
                                <Button
                                    color={withdrawn ? 'primary' : 'secondary'}
                                    disabled={isInteractionDisabled}
                                    onClick={(e) =>
                                        handleWithdraw(
                                            e,
                                            application_idx,
                                            withdrawn ? '-' : 'X'
                                        )
                                    }
                                    size="small"
                                    variant="text"
                                >
                                    {withdrawn
                                        ? t('Undo Withdraw', { ns: 'common' })
                                        : t('Withdraw', { ns: 'common' })}
                                </Button>
                            ) : null}
                        </Stack>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default StudentApplicationCard;
