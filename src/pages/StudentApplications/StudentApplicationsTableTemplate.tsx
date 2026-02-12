import React, { useState } from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    Link,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip
} from '@mui/material';

import { Link as LinkDom } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Undo as UndoIcon, Redo as RedoIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
    is_TaiGer_role,
    is_TaiGer_Student,
    is_TaiGer_Admin,
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw,
    isProgramAdmitted
} from '@taiger-common/core';
import type { Application } from '@api/types';
import { differenceInDays } from 'date-fns';

import {
    isProgramNotSelectedEnough,
    is_num_Program_Not_specified,
    is_program_ml_rl_essay_ready,
    is_the_uni_assist_vpd_uploaded,
    isCVFinished,
    application_deadline_V2_calculator
} from '../Utils/util_functions';
import OverlayButton from '@components/Overlay/OverlayButton';
import Banner from '@components/Banner/Banner';
import {
    IS_SUBMITTED_STATE_OPTIONS,
    APPLICATION_YEARS_FUTURE,
    programstatuslist
} from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { useSnackBar } from '@contexts/use-snack-bar';
import {
    updateStudentApplications,
    deleteApplicationStudentV2,
    updateStudentApplication
} from '@api';
import { queryClient } from '@api/client';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { ImportStudentProgramsCard } from './ImportStudentProgramsCard';
import { StudentPreferenceCard } from './StudentPreferenceCard';
import { ConfirmationModal } from '@components/Modal/ConfirmationModal';

export interface StudentApplicationsTableTemplateProps {
    student: {
        _id?: unknown;
        firstname?: string;
        lastname?: string;
        applications?: Application[];
        applying_program_count?: number;
    };
}

type StudentDraft = {
    applications?: Application[];
    applying_program_count?: number | string;
};

const StudentApplicationsTableTemplate = (
    props: StudentApplicationsTableTemplateProps
) => {
    const { user } = useAuth();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [draft, setDraft] = useState<StudentDraft | null>(null);
    const studentToShow =
        draft == null
            ? props.student
            : {
                  ...props.student,
                  applications:
                      draft.applications ?? props.student.applications,
                  applying_program_count:
                      draft.applying_program_count ??
                      props.student.applying_program_count
              };

    const [
        studentApplicationsTableTemplateState,
        setStudentApplicationsTableTemplateState
    ] = useState({
        error: '',
        isLoaded: true,
        program_ids: [],
        student_id: null as string | null,
        application_id: null as string | null,
        application_year: null as number | null,
        success: false,
        modalDeleteApplication: false,
        modalEditApplication: false,
        showProgramCorrectnessReminderModal: true,
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });

    const handleChangeProgramCount = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        e.preventDefault();
        const applying_program_count = e.target.value;
        setDraft((prev) => ({
            ...prev,
            applying_program_count
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        application_idx: number
    ) => {
        e.preventDefault();
        const base = studentToShow.applications ?? [];
        const applications_temp = [...base];
        applications_temp[application_idx] = {
            ...applications_temp[application_idx],
            [e.target.name]: e.target.value
        };
        setDraft((prev) => ({
            ...prev,
            applications: applications_temp
        }));
    };

    const handleSingleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        application_id: string
    ) => {
        e.preventDefault();
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            application_id,
            [e.target.name]: e.target.value
        }));
    };

    const handleWithdraw = (e, application_idx, programWithdraw = '-') => {
        e.preventDefault();
        const base = studentToShow.applications ?? [];
        const applications_temp = [...base];
        applications_temp[application_idx] = {
            ...applications_temp[application_idx],
            closed: programWithdraw
        };
        setDraft((prev) => ({
            ...prev,
            applications: applications_temp
        }));
    };

    const handleDelete = (
        e: React.MouseEvent<HTMLElement>,
        application_id: string,
        student_id: string
    ) => {
        e.preventDefault();
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            student_id,
            application_id,
            modalDeleteApplication: true
        }));
    };

    const handleEdit = (
        e: React.MouseEvent<HTMLElement>,
        application_id: string,
        application_year: number,
        student_id: string
    ) => {
        e.preventDefault();
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            student_id,
            application_id,
            application_year,
            modalEditApplication: true
        }));
    };
    const onHideModalEditApplication = () => {
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            modalEditApplication: false
        }));
    };
    const handleEditConfirm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const payload = {
            application_year:
                studentApplicationsTableTemplateState.application_year
        };
        updateStudentApplication(
            studentToShow._id,
            studentApplicationsTableTemplateState.application_id!,
            payload
        ).then((resp) => {
            const { success } = resp.data;
            if (success) {
                setDraft(null);
                queryClient.invalidateQueries({
                    queryKey: [
                        'applications/student',
                        String(studentToShow._id)
                    ]
                });
                setStudentApplicationsTableTemplateState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    success,
                    modalEditApplication: false
                }));
            } else {
                const { message } = resp.data;
                setStudentApplicationsTableTemplateState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: message,
                    res_modal_status: 400,
                    res_modal_message: message
                }));
            }
        });
    };

    const onHideModalDeleteApplication = () => {
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            modalDeleteApplication: false
        }));
    };

    const handleDeleteConfirm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        deleteApplicationStudentV2(
            studentApplicationsTableTemplateState.application_id!
        ).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setDraft(null);
                    queryClient.invalidateQueries({
                        queryKey: [
                            'applications/student',
                            String(studentToShow._id)
                        ]
                    });
                    setSeverity('success');
                    setMessage(
                        t('The application deleted successfully!', {
                            ns: 'common'
                        })
                    );
                    setOpenSnackbar(true);
                    setStudentApplicationsTableTemplateState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        success,
                        modalDeleteApplication: false,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentApplicationsTableTemplateState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message
                    }));
                }
            },
            (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
                setStudentApplicationsTableTemplateState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>,
        student_id: string
    ) => {
        e.preventDefault();
        const applications_temp = studentToShow.applications?.map(
            (application) => ({
                _id: application._id,
                programId: application.programId._id,
                decided: application.decided,
                closed: application.closed,
                admission: application.admission,
                finalEnrolment: application.finalEnrolment
            })
        );
        const applying_program_count = studentToShow.applying_program_count;
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        updateStudentApplications(
            student_id,
            applications_temp,
            applying_program_count
        ).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setDraft(null);
                    queryClient.invalidateQueries({
                        queryKey: ['applications/student', student_id]
                    });
                    setSeverity('success');
                    setMessage(
                        t('Applications status updated successfully!', {
                            ns: 'common'
                        })
                    );
                    setOpenSnackbar(true);
                    setStudentApplicationsTableTemplateState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        success,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentApplicationsTableTemplateState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message
                    }));
                }
            },
            (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
                setStudentApplicationsTableTemplateState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onClickProgramAssignHandler = () => {
        navigate(`/student-applications/edit/${studentToShow._id.toString()}`);
    };

    const closeProgramCorrectnessModal = () => {
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            showProgramCorrectnessReminderModal: false
        }));
    };
    const ConfirmError = () => {
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const {
        res_status,
        isLoaded,
        res_modal_status,
        res_modal_message,
        showProgramCorrectnessReminderModal
    } = studentApplicationsTableTemplateState;

    if (!isLoaded || !props.student) {
        return <Loading />;
    }
    TabTitle(
        `Student ${studentToShow.firstname} ${studentToShow.lastname} || Applications Status`
    );
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }
    let applying_university_info;
    const today = new Date();
    if (
        studentToShow.applications === undefined ||
        studentToShow.applications.length === 0
    ) {
        applying_university_info = (
            <TableRow>
                {!is_TaiGer_Student(user) ? <TableCell /> : null}
                <TableCell>
                    <Typography>No University</Typography>
                </TableCell>
                <TableCell>
                    <Typography>No Program</Typography>
                </TableCell>
                <TableCell>
                    <Typography>No Date</Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
                <TableCell>
                    <Typography> - </Typography>
                </TableCell>
            </TableRow>
        );
    } else {
        applying_university_info = studentToShow.applications!.map(
            (application, application_idx) => (
                <TableRow key={application_idx}>
                    {!is_TaiGer_Student(user) ? (
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <IconButton
                                    color="primary"
                                    onClick={(e) =>
                                        handleDelete(
                                            e,
                                            application._id,
                                            studentToShow._id
                                        )
                                    }
                                    variant="contained"
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton
                                    color="secondary"
                                    onClick={(e) =>
                                        handleEdit(
                                            e,
                                            application._id,
                                            application.application_year,
                                            studentToShow._id
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
                            <Typography>
                                {t('Close', { ns: 'common' })}
                            </Typography>
                        ) : (
                            <Typography>
                                {application_deadline_V2_calculator(
                                    application
                                )}
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
                    </TableCell>
                    {isProgramDecided(application) &&
                    !isProgramWithdraw(application) ? (
                        <TableCell>
                            {/* When all thread finished */}
                            {isProgramSubmitted(application) ||
                            (is_program_ml_rl_essay_ready(application) &&
                                isCVFinished(studentToShow) &&
                                (!appConfig.vpdEnable ||
                                    is_the_uni_assist_vpd_uploaded(
                                        application
                                    ))) ? (
                                <FormControl fullWidth>
                                    <Select
                                        disabled={
                                            !(
                                                application.closed !== '-' &&
                                                application.closed !== 'X'
                                            ) ||
                                            (application.finalEnrolment ??
                                                false)
                                        }
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
                                            {t('Submitted', {
                                                ns: 'common'
                                            })}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <OverlayButton
                                    text={`Please make sure ${
                                        !isCVFinished(studentToShow)
                                            ? 'CV '
                                            : ''
                                    }${
                                        !is_program_ml_rl_essay_ready(
                                            application
                                        )
                                            ? 'ML/RL/Essay '
                                            : ''
                                    }${
                                        !is_the_uni_assist_vpd_uploaded(
                                            application
                                        )
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
                                    onChange={(e) =>
                                        handleChange(e, application_idx)
                                    }
                                    size="small"
                                >
                                    {IS_SUBMITTED_STATE_OPTIONS.map(
                                        (option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {t(option.label, {
                                                    ns: 'common'
                                                })}
                                            </MenuItem>
                                        )
                                    )}
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
                                    defaultValue={
                                        application.finalEnrolment ?? false
                                    }
                                    id="finalEnrolment"
                                    labelId="finalEnrolment"
                                    name="finalEnrolment"
                                    onChange={(e) =>
                                        handleChange(e, application_idx)
                                    }
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
                                        application_deadline_V2_calculator(
                                            application
                                        ),
                                        today
                                    )
                                  : '-'}
                        </Typography>
                    </TableCell>
                    {is_TaiGer_role(user) && (
                        <TableCell>
                            {isProgramDecided(application) &&
                                !isProgramSubmitted(application) &&
                                // only show withdraw/undo button when the program is decided but not submitted
                                (isProgramWithdraw(application) ? (
                                    <Tooltip arrow title="Undo Withdraw">
                                        <RedoIcon
                                            onClick={(e) =>
                                                handleWithdraw(
                                                    e,
                                                    application_idx,
                                                    '-' // Not Withdrawn - Not yet
                                                )
                                            }
                                        />
                                    </Tooltip>
                                ) : (
                                    <Tooltip arrow title="Withdraw">
                                        <UndoIcon
                                            onClick={(e) =>
                                                handleWithdraw(
                                                    e,
                                                    application_idx,
                                                    'X' // Withdrawn
                                                )
                                            }
                                        />
                                    </Tooltip>
                                ))}
                        </TableCell>
                    )}
                </TableRow>
            )
        );
    }
    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            {is_TaiGer_Student(user) ? (
                <Dialog open={showProgramCorrectnessReminderModal}>
                    <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}{' '}
                            {`若發現 ${appConfig.companyName} Portal 資訊和學校官方網站資料有不同之處，請和顧問討論。`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            fullWidth
                            onClick={closeProgramCorrectnessModal}
                            variant="contained"
                        >
                            {t('Accept', { ns: 'common' })}
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                {is_TaiGer_role(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_LINK}`}
                        underline="hover"
                    >
                        {t('Students Database', { ns: 'common' })}
                    </Link>
                ) : null}
                {is_TaiGer_role(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            props.student._id.toString(),
                            DEMO.PROFILE_HASH
                        )}`}
                        underline="hover"
                    >
                        {t('Student', { ns: 'common' })}{' '}
                        {props.student.firstname} {props.student.lastname}
                    </Link>
                ) : null}
                <Typography color="text.primary">
                    {t('Applications', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item md={is_TaiGer_role(user) ? 6 : 12} xs={12}>
                        <StudentPreferenceCard student={studentToShow} />
                    </Grid>
                    {is_TaiGer_role(user) ? (
                        <Grid item md={6} xs={12}>
                            <ImportStudentProgramsCard
                                student={studentToShow}
                            />
                        </Grid>
                    ) : null}
                </Grid>
            </Box>
            <>
                {isProgramNotSelectedEnough([studentToShow]) ? (
                    <Card>
                        {props.student.firstname} {props.student.lastname} did
                        not choose enough programs.
                    </Card>
                ) : null}
                {is_TaiGer_Admin(user) &&
                is_num_Program_Not_specified(studentToShow) ? (
                    <Card>
                        The number of student&apos;s applications is not
                        specified! Please determine the number of the programs
                        according to the contract
                    </Card>
                ) : null}
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="h6">
                            {t('Applying Program Count', { ns: 'common' })}:{' '}
                        </Typography>
                    </Grid>
                    {is_TaiGer_Admin(user) ? (
                        <Grid item xs={2}>
                            <FormControl fullWidth>
                                <Select
                                    id="applying_program_count"
                                    name="applying_program_count"
                                    onChange={(e) =>
                                        handleChangeProgramCount(e)
                                    }
                                    size="small"
                                    value={studentToShow.applying_program_count}
                                >
                                    <MenuItem value="0">Please Select</MenuItem>
                                    <MenuItem value="1">1</MenuItem>
                                    <MenuItem value="2">2</MenuItem>
                                    <MenuItem value="3">3</MenuItem>
                                    <MenuItem value="4">4</MenuItem>
                                    <MenuItem value="5">5</MenuItem>
                                    <MenuItem value="6">6</MenuItem>
                                    <MenuItem value="7">7</MenuItem>
                                    <MenuItem value="8">8</MenuItem>
                                    <MenuItem value="9">9</MenuItem>
                                    <MenuItem value="10">10</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    ) : (
                        <Grid item xs={2}>
                            <Typography variant="h6">
                                {studentToShow.applying_program_count}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
                <Box>
                    <Card>
                        <Box>
                            <Banner
                                ReadOnlyMode={true}
                                bg="primary"
                                link_name=""
                                notification_key={undefined}
                                removeBanner={null}
                                text={`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}
                                title="info"
                                to={`${DEMO.BASE_DOCUMENTS_LINK}`}
                            />
                            <Banner
                                ReadOnlyMode={true}
                                bg="secondary"
                                link_name=""
                                notification_key={undefined}
                                removeBanner={null}
                                text="請選擇要申請的學程打在 Decided: Yes，不要申請打的 No。"
                                title="warning"
                                to={`${DEMO.BASE_DOCUMENTS_LINK}`}
                            />
                            <Banner
                                ReadOnlyMode={true}
                                bg="danger"
                                link_name=""
                                notification_key={undefined}
                                removeBanner={null}
                                text="請選擇要申請的學程打在 Submitted: Submitted，若想中斷申請請告知顧問，或是 選擇 Withdraw (如果東西都已準備好且解鎖)"
                                title="warning"
                                to={`${DEMO.BASE_DOCUMENTS_LINK}`}
                            />
                            <TableContainer style={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {!is_TaiGer_Student(user) ? (
                                                <TableCell>-</TableCell>
                                            ) : null}
                                            {programstatuslist.map(
                                                (doc, index) => (
                                                    <TableCell key={index}>
                                                        <Typography>
                                                            {t(doc.name, {
                                                                ns: 'common'
                                                            })}
                                                        </Typography>
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {applying_university_info}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Card>
                    <Box>
                        <Button
                            color="primary"
                            disabled={
                                !draft ||
                                !studentApplicationsTableTemplateState.isLoaded
                            }
                            fullWidth
                            onClick={(e) =>
                                handleSubmit(e, String(studentToShow._id))
                            }
                            sx={{ mt: 2 }}
                            variant="contained"
                        >
                            {studentApplicationsTableTemplateState.isLoaded ? (
                                t('Update', { ns: 'common' })
                            ) : (
                                <CircularProgress size={16} />
                            )}
                        </Button>
                    </Box>
                    {is_TaiGer_role(user) ? (
                        <>
                            <Box>
                                <Typography>
                                    <span
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        You want to add more programs to{' '}
                                        {props.student.firstname}{' '}
                                        {props.student.lastname}?
                                    </span>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography>
                                    <span
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Button
                                            color="primary"
                                            onClick={
                                                onClickProgramAssignHandler
                                            }
                                            size="small"
                                            variant="contained"
                                        >
                                            {t('Add New Program')}
                                        </Button>{' '}
                                    </span>
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                    <ConfirmationModal
                        closeText={t('No', { ns: 'common' })}
                        confirmText={t('Yes', { ns: 'common' })}
                        content="This will delete all message and editted files in discussion. Are you sure?"
                        isLoading={
                            !studentApplicationsTableTemplateState.isLoaded
                        }
                        onClose={onHideModalDeleteApplication}
                        onConfirm={handleDeleteConfirm}
                        open={
                            studentApplicationsTableTemplateState.modalDeleteApplication
                        }
                        title={t('Warning', { ns: 'common' })}
                    />
                    <ConfirmationModal
                        closeText={t('No', { ns: 'common' })}
                        confirmText={t('Yes', { ns: 'common' })}
                        content={
                            <Box>
                                <TextField
                                    fullWidth
                                    label={t('Application Year')}
                                    name="application_year"
                                    onChange={(e) =>
                                        handleSingleChange(
                                            e,
                                            studentApplicationsTableTemplateState.application_id
                                        )
                                    }
                                    options={APPLICATION_YEARS_FUTURE().map(
                                        (year) => year.value
                                    )}
                                    select
                                    value={
                                        studentApplicationsTableTemplateState.application_year
                                    }
                                >
                                    {APPLICATION_YEARS_FUTURE().map(
                                        (option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                            </Box>
                        }
                        isLoading={
                            !studentApplicationsTableTemplateState.isLoaded
                        }
                        onClose={onHideModalEditApplication}
                        onConfirm={handleEditConfirm}
                        open={
                            studentApplicationsTableTemplateState.modalEditApplication
                        }
                        title={t('Edit Application Year', { ns: 'common' })}
                    />
                </Box>
            </>
        </Box>
    );
};

export default StudentApplicationsTableTemplate;
