import { MouseEvent, SyntheticEvent, ChangeEvent, useState } from 'react';
import {
    Button,
    FormControl,
    IconButton,
    Link,
    Menu,
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
    handleChange: (
        e: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>,
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
    handleChange,
    handleWithdraw,
    handleDelete,
    handleEdit,
    handleAdmissionResultChange
}: ApplicationTableRowProps) => {
    const { t } = useTranslation();
    const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
    const [admissionMenuAnchor, setAdmissionMenuAnchor] =
        useState<null | HTMLElement>(null);

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

    const admissionLabel =
        admissionOptions.find((option) => option.value === currentAdmission)
            ?.label ?? '-';

    const admissionColor =
        currentAdmission === 'X'
            ? 'error'
            : currentAdmission === 'O'
              ? 'success'
              : 'primary';

    const admissionMenuOpen = Boolean(admissionMenuAnchor);

    const openAdmissionMenu = (e: MouseEvent<HTMLButtonElement>) => {
        setAdmissionMenuAnchor(e.currentTarget);
    };

    const closeAdmissionMenu = () => {
        setAdmissionMenuAnchor(null);
    };

    const onClickAdmissionResult = async (result: AdmissionResult) => {
        if (result === currentAdmission) {
            closeAdmissionMenu();
            return;
        }
        closeAdmissionMenu();
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
                    <>
                        <Button
                            color={admissionColor}
                            disabled={
                                !canUpdateAdmission || isSubmittingAdmission
                            }
                            fullWidth
                            onClick={openAdmissionMenu}
                            size="small"
                            variant="outlined"
                        >
                            {admissionLabel}
                        </Button>
                        <Menu
                            anchorEl={admissionMenuAnchor}
                            onClose={closeAdmissionMenu}
                            open={admissionMenuOpen}
                        >
                            {admissionOptions.map((option) => (
                                <MenuItem
                                    disabled={
                                        isSubmittingAdmission ||
                                        option.value === currentAdmission
                                    }
                                    key={option.value}
                                    onClick={() =>
                                        onClickAdmissionResult(option.value)
                                    }
                                    selected={option.value === currentAdmission}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                </TableCell>
            ) : (
                <TableCell>-</TableCell>
            )}
            {isProgramDecided(application) &&
            isProgramSubmitted(application) &&
            isProgramAdmitted(application) ? (
                <TableCell>
                    <FormControl fullWidth>
                        <Select<string>
                            defaultValue={String(
                                application.finalEnrolment ?? false
                            )}
                            id="finalEnrolment"
                            labelId="finalEnrolment"
                            name="finalEnrolment"
                            onChange={(e) => handleChange(e, application_idx)}
                            size="small"
                        >
                            <MenuItem value="false">
                                {t('No', { ns: 'common' })}
                            </MenuItem>
                            <MenuItem value="true">
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
