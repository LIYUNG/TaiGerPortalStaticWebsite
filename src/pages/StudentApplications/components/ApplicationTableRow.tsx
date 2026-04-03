import { MouseEvent, SyntheticEvent, ChangeEvent, useState } from 'react';
import {
    FormControl,
    IconButton,
    Link,
    MenuItem,
    Select,
    Stack,
    TableCell,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Link as LinkDom } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Undo as UndoIcon, Redo as RedoIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
    is_TaiGer_role,
    is_TaiGer_Student,
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw,
    isProgramAdmitted
} from '@taiger-common/core';
import type { Application } from '@/api/types';
import { differenceInDays } from 'date-fns';
import {
    is_program_ml_rl_essay_ready,
    is_the_uni_assist_vpd_uploaded,
    isCVFinished,
    application_deadline_V2_calculator
} from '../../Utils/util_functions';
import OverlayButton from '@components/Overlay/OverlayButton';
import DEMO from '@store/constant';
import { appConfig } from '../../../config';
import type { IUser, IStudentResponse } from '@taiger-common/model';

type AdmissionResult = '-' | 'O' | 'X';

export interface ApplicationTableRowStudent {
    _id?: unknown;
    firstname?: string;
    lastname?: string;
    applications?: Application[];
    applying_program_count?: number | string;
}

export interface ApplicationTableRowProps {
    application: Application;
    application_idx: number;
    studentToShow: ApplicationTableRowStudent;
    user: IUser | null;
    today: Date;
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
        programWithdraw?: string
    ) => void;
    handleDelete: (
        e: MouseEvent<HTMLElement>,
        application_id: string,
        student_id: string
    ) => void;
    handleEdit: (
        e: MouseEvent<HTMLButtonElement>,
        application_id: string,
        application_year: number,
        student_id: string
    ) => void;
    handleAdmissionResultChange: (
        application: Application,
        result: AdmissionResult
    ) => Promise<void>;
}

const ApplicationTableRow = ({
    application,
    application_idx,
    studentToShow,
    user,
    today,
    isSubmitting,
    handleChange,
    handleFinalEnrolmentChange,
    handleWithdraw,
    handleDelete,
    handleEdit,
    handleAdmissionResultChange
}: ApplicationTableRowProps) => {
    const { t } = useTranslation();
    const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
    const isInteractionDisabled = isSubmitting || isSubmittingAdmission;

    const canUpdateAdmission =
        application.closed !== '-' &&
        application.closed !== 'X' &&
        !(application.finalEnrolment ?? false);

    const admissionOptions: Array<{ value: AdmissionResult; label: string }> = [
        { value: '-', label: '-' },
        { value: 'O', label: t('Yes', { ns: 'common' }) },
        { value: 'X', label: t('No', { ns: 'common' }) }
    ];

    const currentAdmission =
        application.admission === 'O' || application.admission === 'X'
            ? application.admission
            : '-';

    const onClickAdmissionResult = async (result: AdmissionResult) => {
        if (result === currentAdmission) {
            return;
        }
        setIsSubmittingAdmission(true);
        try {
            await handleAdmissionResultChange(application, result);
        } finally {
            setIsSubmittingAdmission(false);
        }
    };

    return (
        <TableRow>
            {!is_TaiGer_Student(user as IUser) ? (
                <TableCell>
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            color="primary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) =>
                                handleDelete(
                                    e,
                                    application._id as string,
                                    studentToShow._id as string
                                )
                            }
                        >
                            <DeleteIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) =>
                                handleEdit(
                                    e,
                                    application._id as string,
                                    Number(application.application_year),
                                    studentToShow._id as string
                                )
                            }
                        >
                            <EditIcon />
                        </IconButton>
                    </Stack>
                </TableCell>
            ) : null}
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.school}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.degree}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.program_name}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.semester}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.toefl
                            ? application.programId?.toefl
                            : '-'}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId?._id ?? '')}`}
                    >
                        {application.programId?.ielts
                            ? application.programId?.ielts
                            : '-'}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                {isProgramSubmitted(application) ? (
                    <Typography>{t('Close', { ns: 'common' })}</Typography>
                ) : (
                    <Typography>
                        {application_deadline_V2_calculator(application)}
                    </Typography>
                )}
            </TableCell>
            <TableCell>
                <FormControl fullWidth>
                    <Select
                        disabled={
                            application.closed !== '-' || isInteractionDisabled
                        }
                        id="decided"
                        labelId="decided"
                        name="decided"
                        onChange={(e) => handleChange(e, application_idx)}
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
            </TableCell>
            {isProgramDecided(application) &&
            !isProgramWithdraw(application) ? (
                <TableCell>
                    {isProgramSubmitted(application) ||
                    (is_program_ml_rl_essay_ready(application) &&
                        isCVFinished(
                            studentToShow as unknown as IStudentResponse
                        ) &&
                        (!appConfig.vpdEnable ||
                            is_the_uni_assist_vpd_uploaded(application))) ? (
                        <FormControl fullWidth>
                            <Select
                                id="closed"
                                labelId="closed"
                                name="closed"
                                disabled={isInteractionDisabled}
                                onChange={(e) =>
                                    handleChange(e, application_idx)
                                }
                                size="small"
                                value={application.closed}
                            >
                                <MenuItem value="-">
                                    {t('Not Yet', { ns: 'common' })}
                                </MenuItem>
                                <MenuItem value="O">
                                    {t('Submitted', { ns: 'common' })}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <OverlayButton
                            text={`Please make sure ${
                                !isCVFinished(
                                    studentToShow as unknown as IStudentResponse
                                )
                                    ? 'CV '
                                    : ''
                            }${
                                !is_program_ml_rl_essay_ready(application)
                                    ? 'ML/RL/Essay '
                                    : ''
                            }${
                                !is_the_uni_assist_vpd_uploaded(application)
                                    ? 'Uni-Assist '
                                    : ''
                            }are prepared to unlock this.`}
                        />
                    )}
                </TableCell>
            ) : (
                <TableCell>
                    {isProgramWithdraw(application) ? (
                        <Typography color="error" fontWeight="bold">
                            WITHDRAW
                        </Typography>
                    ) : (
                        '-'
                    )}
                </TableCell>
            )}
            {isProgramDecided(application) &&
            isProgramSubmitted(application) ? (
                <TableCell>
                    <FormControl fullWidth>
                        <Select
                            disabled={
                                !canUpdateAdmission || isInteractionDisabled
                            }
                            id="admission"
                            labelId="admission"
                            name="admission"
                            inputProps={{ 'aria-label': 'admission result' }}
                            onChange={(e) =>
                                onClickAdmissionResult(
                                    e.target.value as AdmissionResult
                                )
                            }
                            size="small"
                            value={currentAdmission}
                        >
                            {admissionOptions.map((option) => (
                                <MenuItem
                                    disabled={option.value === currentAdmission}
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
            ) : (
                <TableCell>-</TableCell>
            )}
            {isProgramDecided(application) &&
            isProgramSubmitted(application) &&
            isProgramAdmitted(application) ? (
                <TableCell>
                    <FormControl fullWidth>
                        <Select<number>
                            value={application.finalEnrolment ? 1 : 0}
                            id="finalEnrolment"
                            labelId="finalEnrolment"
                            name="finalEnrolment"
                            disabled={isInteractionDisabled}
                            onChange={(e) =>
                                handleFinalEnrolmentChange(
                                    application_idx,
                                    Number(e.target.value) === 1
                                )
                            }
                            size="small"
                        >
                            <MenuItem value={0}>
                                {t('No', { ns: 'common' })}
                            </MenuItem>
                            <MenuItem value={1}>
                                {t('Yes', { ns: 'common' })}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </TableCell>
            ) : (
                <TableCell>-</TableCell>
            )}
            <TableCell>
                <Typography>
                    {isProgramSubmitted(application)
                        ? '-'
                        : application.programId?.application_deadline
                          ? differenceInDays(
                                new Date(
                                    application_deadline_V2_calculator(
                                        application
                                    )
                                ),
                                today
                            )
                          : '-'}
                </Typography>
            </TableCell>
            {is_TaiGer_role(user as IUser) && (
                <TableCell>
                    {isProgramDecided(application) &&
                        !isProgramSubmitted(application) &&
                        (isProgramWithdraw(application) ? (
                            <Tooltip arrow title="Undo Withdraw">
                                <span>
                                    <IconButton
                                        disabled={isInteractionDisabled}
                                        onClick={(e) =>
                                            handleWithdraw(
                                                e,
                                                application_idx,
                                                '-'
                                            )
                                        }
                                        size="small"
                                    >
                                        <RedoIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip arrow title="Withdraw">
                                <span>
                                    <IconButton
                                        disabled={isInteractionDisabled}
                                        onClick={(e) =>
                                            handleWithdraw(
                                                e,
                                                application_idx,
                                                'X'
                                            )
                                        }
                                        size="small"
                                    >
                                        <UndoIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ))}
                </TableCell>
            )}
        </TableRow>
    );
};

export default ApplicationTableRow;
