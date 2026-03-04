import { MouseEvent, SyntheticEvent, ChangeEvent } from 'react';
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
import { IS_SUBMITTED_STATE_OPTIONS } from '@utils/contants';
import DEMO from '@store/constant';
import { appConfig } from '../../../config';
import type { IUser } from '@taiger-common/model';

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
    handleChange: (
        e: ChangeEvent<HTMLInputElement>,
        application_idx: number
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
}

const ApplicationTableRow = ({
    application,
    application_idx,
    studentToShow,
    user,
    today,
    handleChange,
    handleWithdraw,
    handleDelete,
    handleEdit
}: ApplicationTableRowProps) => {
    const { t } = useTranslation();

    return (
        <TableRow>
            {!is_TaiGer_Student(user) ? (
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
                            variant="contained"
                        >
                            <DeleteIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) =>
                                handleEdit(
                                    e,
                                    application._id as string,
                                    application.application_year,
                                    studentToShow._id as string
                                )
                            }
                            variant="contained"
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
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.school}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.degree}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.program_name}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.semester}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.toefl
                            ? application.programId.toefl
                            : '-'}
                    </Link>
                </Typography>
            </TableCell>
            <TableCell>
                <Typography>
                    <Link
                        component={LinkDom}
                        style={{ textDecoration: 'none' }}
                        to={`${DEMO.SINGLE_PROGRAM_LINK(application.programId._id)}`}
                    >
                        {application.programId.ielts
                            ? application.programId.ielts
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
                        disabled={application.closed !== '-'}
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
                        isCVFinished(studentToShow) &&
                        (!appConfig.vpdEnable ||
                            is_the_uni_assist_vpd_uploaded(application))) ? (
                        <FormControl fullWidth>
                            <Select
                                id="closed"
                                labelId="closed"
                                name="closed"
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
                                !isCVFinished(studentToShow) ? 'CV ' : ''
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
                            defaultValue={application.admission ?? '-'}
                            disabled={
                                !(
                                    application.closed !== '-' &&
                                    application.closed !== 'X'
                                ) ||
                                (application.finalEnrolment ?? false)
                            }
                            id="admission"
                            labelId="admission"
                            name="admission"
                            onChange={(e) => handleChange(e, application_idx)}
                            size="small"
                        >
                            {IS_SUBMITTED_STATE_OPTIONS.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label, { ns: 'common' })}
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
                        <Select
                            defaultValue={application.finalEnrolment ?? false}
                            id="finalEnrolment"
                            labelId="finalEnrolment"
                            name="finalEnrolment"
                            onChange={(e) => handleChange(e, application_idx)}
                            size="small"
                        >
                            <MenuItem value={false}>
                                {t('No', { ns: 'common' })}
                            </MenuItem>
                            <MenuItem value={true}>
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
                        : application.programId.application_deadline
                          ? differenceInDays(
                                application_deadline_V2_calculator(application),
                                today
                            )
                          : '-'}
                </Typography>
            </TableCell>
            {is_TaiGer_role(user) && (
                <TableCell>
                    {isProgramDecided(application) &&
                        !isProgramSubmitted(application) &&
                        (isProgramWithdraw(application) ? (
                            <Tooltip arrow title="Undo Withdraw">
                                <RedoIcon
                                    onClick={(e) =>
                                        handleWithdraw(e, application_idx, '-')
                                    }
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip arrow title="Withdraw">
                                <UndoIcon
                                    onClick={(e) =>
                                        handleWithdraw(e, application_idx, 'X')
                                    }
                                />
                            </Tooltip>
                        ))}
                </TableCell>
            )}
        </TableRow>
    );
};

export default ApplicationTableRow;
