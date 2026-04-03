import {
    MouseEvent,
    useState,
    useEffect,
    ChangeEvent,
    SyntheticEvent
} from 'react';
import {
    Box,
    Chip,
    Collapse,
    Breadcrumbs,
    Button,
    Card,
    FormControl,
    Grid,
    Link,
    LinearProgress,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';

import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    is_TaiGer_role,
    is_TaiGer_Student,
    is_TaiGer_Admin
} from '@taiger-common/core';
import type { IUser, IStudentResponse } from '@taiger-common/model';
import type { Application } from '@/api/types';

import {
    isProgramNotSelectedEnough,
    is_num_Program_Not_specified
} from '../Utils/util_functions';
import ApplicationTableRow, {
    type ApplicationTableRowStudent
} from './components/ApplicationTableRow';
import ApplicationsTableBanners from './components/ApplicationsTableBanners';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { APPLICATION_YEARS_FUTURE, programstatuslist } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { useSnackBar } from '@contexts/use-snack-bar';
import {
    deleteApplicationStudentV2,
    updateStudentApplication,
    updateStudentApplicationResult
} from '@/api';
import { queryClient } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { ImportStudentProgramsCard } from './ImportStudentProgramsCard';
import { StudentPreferenceCard } from './StudentPreferenceCard';
import { ConfirmationModal } from '@components/Modal/ConfirmationModal';
import { useStudentApplicationsAutosave } from './hooks/useStudentApplicationsAutosave';

export interface StudentApplicationsTableTemplateProps {
    student: {
        _id?: string;
        firstname?: string;
        lastname?: string;
        applications?: Application[];
        applying_program_count?: number;
        [key: string]: unknown;
    };
}

type AdmissionResult = '-' | 'O' | 'X';

const StudentApplicationsTableTemplate = (
    props: StudentApplicationsTableTemplateProps
) => {
    const { user } = useAuth();
    const typedUser = user as IUser;
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isMetaExpanded, setIsMetaExpanded] = useState(true);
    const {
        studentToShow,
        isSubmittingUpdate,
        saveState,
        updatePendingProgramCount,
        updatePendingApplicationPatch,
        clearPendingChanges
    } = useStudentApplicationsAutosave({
        student: props.student
    });

    useEffect(() => {
        if (saveState.status === 'success') {
            setSeverity('success');
            setMessage(
                t('Applications status updated successfully!', {
                    ns: 'common'
                })
            );
            setOpenSnackbar(true);
            return;
        }

        if (saveState.status === 'error') {
            setSeverity('error');
            setMessage(
                saveState.errorMessage ||
                    t('An error occurred. Please try again.', {
                        ns: 'common'
                    })
            );
            setOpenSnackbar(true);
        }
    }, [
        saveState.resultId,
        saveState.status,
        saveState.errorMessage,
        setSeverity,
        setMessage,
        setOpenSnackbar,
        t
    ]);

    const [
        studentApplicationsTableTemplateState,
        setStudentApplicationsTableTemplateState
    ] = useState<{
        error: string;
        isLoaded: boolean;
        program_ids: string[];
        student_id: string | null;
        application_id: string | null;
        application_year: number | null;
        success: boolean;
        modalDeleteApplication: boolean;
        modalEditApplication: boolean;
        showProgramCorrectnessReminderModal: boolean;
        res_status: number;
        res_modal_status: number;
        res_modal_message: string;
    }>({
        error: '',
        isLoaded: true,
        program_ids: [],
        student_id: null,
        application_id: null,
        application_year: null,
        success: false,
        modalDeleteApplication: false,
        modalEditApplication: false,
        showProgramCorrectnessReminderModal: true,
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });

    const handleChangeProgramCount = (
        e: SelectChangeEvent<string | number>
    ) => {
        const applying_program_count = Number(e.target.value);
        updatePendingProgramCount(applying_program_count);
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>,
        application_idx: number
    ) => {
        e.preventDefault();
        const applicationId = String(
            studentToShow.applications?.[application_idx]?._id ?? ''
        );
        if (applicationId) {
            updatePendingApplicationPatch(
                applicationId,
                { [e.target.name]: e.target.value } as Partial<Application>,
                true
            );
        }
    };

    const handleSingleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        application_id: string | null
    ) => {
        e.preventDefault();
        const { name, value } = e.target;
        setStudentApplicationsTableTemplateState((prevState) => ({
            ...prevState,
            application_id,
            ...(name === 'application_year'
                ? { application_year: Number(value) }
                : {})
        }));
    };

    const handleWithdraw = (
        e: SyntheticEvent,
        application_idx: number,
        programWithdraw = '-'
    ) => {
        e.preventDefault();
        const applicationId = String(
            studentToShow.applications?.[application_idx]?._id ?? ''
        );
        if (applicationId) {
            updatePendingApplicationPatch(
                applicationId,
                { closed: programWithdraw },
                true
            );
        }
    };

    const handleFinalEnrolmentChange = (
        application_idx: number,
        finalEnrolment: boolean
    ) => {
        const applicationId = String(
            studentToShow.applications?.[application_idx]?._id ?? ''
        );
        if (applicationId) {
            updatePendingApplicationPatch(
                applicationId,
                { finalEnrolment },
                true
            );
        }
    };

    const updateDraftAdmissionByApplicationId = (
        applicationId: string,
        nextResult: AdmissionResult
    ) => {
        updatePendingApplicationPatch(applicationId, {
            admission: nextResult
        });
    };

    const handleAdmissionResultChange = async (
        application: Application,
        result: AdmissionResult
    ) => {
        const previousResult =
            application.admission === 'O' || application.admission === 'X'
                ? application.admission
                : '-';
        const studentId = String(studentToShow._id ?? '');
        const applicationId = String(application._id ?? '');
        const programId = String(application.programId?._id ?? '');

        if (!studentId || !applicationId || !programId) {
            setSeverity('error');
            setMessage('Missing student/application/program id.');
            setOpenSnackbar(true);
            return;
        }

        updateDraftAdmissionByApplicationId(applicationId, result);

        const formData = new FormData();
        try {
            const resp = await updateStudentApplicationResult(
                studentId,
                applicationId,
                programId,
                result,
                formData
            );

            const { success, message } = resp.data;
            if (success) {
                queryClient.invalidateQueries({
                    queryKey: ['applications/student', studentId]
                });
                setSeverity('success');
                setMessage(
                    t('Applications status updated successfully!', {
                        ns: 'common'
                    })
                );
                setOpenSnackbar(true);
                return;
            }

            updateDraftAdmissionByApplicationId(applicationId, previousResult);
            setSeverity('error');
            setMessage(message ?? 'Failed to update application result.');
            setOpenSnackbar(true);
        } catch (error) {
            updateDraftAdmissionByApplicationId(applicationId, previousResult);
            setSeverity('error');
            setMessage(
                (error as { message?: string }).message ||
                    'An error occurred. Please try again.'
            );
            setOpenSnackbar(true);
        }
    };

    const handleDelete = (
        e: MouseEvent<HTMLElement>,
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
        e: MouseEvent<HTMLButtonElement>,
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

    const handleEditConfirm = () => {
        const payload = {
            application_year:
                studentApplicationsTableTemplateState.application_year
        };
        updateStudentApplication(
            String(studentToShow._id),
            studentApplicationsTableTemplateState.application_id!,
            payload
        ).then((resp) => {
            const { success } = resp.data;
            if (success) {
                clearPendingChanges();
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
                    error: message ?? '',
                    res_modal_status: 400,
                    res_modal_message: message ?? ''
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

    const handleDeleteConfirm = () => {
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
                    clearPendingChanges();
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
                        res_modal_message: message ?? ''
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
                    error: error?.message || String(error),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onClickProgramAssignHandler = () => {
        navigate(`/student-applications/edit/${String(studentToShow._id)}`);
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
    const today = new Date();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}
        >
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1}
            >
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    {is_TaiGer_role(typedUser) ? (
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_LINK}`}
                            underline="hover"
                        >
                            {t('Students Database', { ns: 'common' })}
                        </Link>
                    ) : null}
                    {is_TaiGer_role(typedUser) ? (
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                String(props.student._id),
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
                <Chip
                    color={isSubmittingUpdate ? 'warning' : 'success'}
                    label={
                        isSubmittingUpdate
                            ? t('Saving changes...', { ns: 'common' })
                            : t('Auto-save on', { ns: 'common' })
                    }
                    variant={isSubmittingUpdate ? 'filled' : 'outlined'}
                />
            </Stack>
            {isSubmittingUpdate ? <LinearProgress /> : null}
            {is_TaiGer_Student(typedUser) ? (
                <ConfirmDialog
                    open={showProgramCorrectnessReminderModal}
                    onClose={closeProgramCorrectnessModal}
                    title={t('Warning', { ns: 'common' })}
                    content={`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。若發現 ${appConfig.companyName} Portal 資訊和學校官方網站資料有不同之處，請和顧問討論。`}
                    variant="alert"
                    confirmLabel={t('Accept', { ns: 'common' })}
                    onConfirm={closeProgramCorrectnessModal}
                />
            ) : null}
            <Card sx={{ p: { xs: 1, md: 1.25 } }} variant="outlined">
                <Stack
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box>
                        <Typography variant="subtitle2">
                            {t('Application Preference From Survey')}
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => setIsMetaExpanded((prev) => !prev)}
                        size="small"
                        variant="text"
                    >
                        {isMetaExpanded ? t('Collapse') : t('Expand')}
                    </Button>
                </Stack>
                <Collapse in={isMetaExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1.25 }}>
                        <Grid
                            container
                            spacing={1.5}
                            sx={{ mt: 0 }}
                            alignItems="stretch"
                        >
                            <Grid item md={12} xs={12}>
                                <StudentPreferenceCard
                                    student={studentToShow as IStudentResponse}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Card>
            <Stack spacing={2}>
                {isProgramNotSelectedEnough([
                    studentToShow as IStudentResponse
                ]) ? (
                    <Card>
                        {props.student.firstname} {props.student.lastname} did
                        not choose enough programs.
                    </Card>
                ) : null}
                {is_TaiGer_Admin(typedUser) &&
                is_num_Program_Not_specified(
                    studentToShow as IStudentResponse
                ) ? (
                    <Card>
                        The number of student&apos;s applications is not
                        specified! Please determine the number of the programs
                        according to the contract
                    </Card>
                ) : null}
                <Card sx={{ p: { xs: 1, md: 1.25 } }}>
                    <Stack spacing={1}>
                        <Stack
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            spacing={1.25}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: 'wrap' }}
                            >
                                <Typography variant="h6">
                                    {t('Applying Program Count', {
                                        ns: 'common'
                                    })}
                                </Typography>
                                {is_TaiGer_Admin(typedUser) ? (
                                    <FormControl sx={{ minWidth: 60 }}>
                                        <Select
                                            id="applying_program_count"
                                            name="applying_program_count"
                                            onChange={(e) =>
                                                handleChangeProgramCount(e)
                                            }
                                            size="small"
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    py: 0.75,
                                                    fontSize: 14
                                                }
                                            }}
                                            value={Number(
                                                studentToShow.applying_program_count ??
                                                    0
                                            )}
                                        >
                                            <MenuItem value={0}>
                                                Please Select
                                            </MenuItem>
                                            <MenuItem value={1}>1</MenuItem>
                                            <MenuItem value={2}>2</MenuItem>
                                            <MenuItem value={3}>3</MenuItem>
                                            <MenuItem value={4}>4</MenuItem>
                                            <MenuItem value={5}>5</MenuItem>
                                            <MenuItem value={6}>6</MenuItem>
                                            <MenuItem value={7}>7</MenuItem>
                                            <MenuItem value={8}>8</MenuItem>
                                            <MenuItem value={9}>9</MenuItem>
                                            <MenuItem value={10}>10</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography variant="h6">
                                        {studentToShow.applying_program_count}
                                    </Typography>
                                )}
                                {is_TaiGer_role(typedUser) ? (
                                    <Button
                                        color="primary"
                                        onClick={onClickProgramAssignHandler}
                                        size="small"
                                        variant="contained"
                                    >
                                        {t('Add New Program')}
                                    </Button>
                                ) : null}
                            </Stack>
                            {is_TaiGer_role(typedUser) ? (
                                <Stack
                                    alignItems={{ xs: 'stretch', md: 'center' }}
                                    direction={{ xs: 'column', md: 'row' }}
                                    spacing={1}
                                    sx={{
                                        justifyContent: 'flex-end',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <ImportStudentProgramsCard
                                        compact
                                        student={studentToShow}
                                    />
                                </Stack>
                            ) : null}
                        </Stack>
                        <Box>
                            <ApplicationsTableBanners />
                            <TableContainer style={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {!is_TaiGer_Student(typedUser) ? (
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
                                        {!studentToShow.applications ||
                                        studentToShow.applications.length ===
                                            0 ? (
                                            <TableRow>
                                                {!is_TaiGer_Student(
                                                    typedUser
                                                ) ? (
                                                    <TableCell />
                                                ) : null}
                                                <TableCell>
                                                    <Typography>
                                                        No University
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        No Program
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        No Date
                                                    </Typography>
                                                </TableCell>
                                                {[...Array(10)].map((_, i) => (
                                                    <TableCell key={i}>
                                                        <Typography>
                                                            {' '}
                                                            -{' '}
                                                        </Typography>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ) : (
                                            studentToShow.applications.map(
                                                (
                                                    application,
                                                    application_idx
                                                ) => (
                                                    <ApplicationTableRow
                                                        key={application_idx}
                                                        application={
                                                            application
                                                        }
                                                        application_idx={
                                                            application_idx
                                                        }
                                                        handleChange={
                                                            handleChange
                                                        }
                                                        handleDelete={
                                                            handleDelete
                                                        }
                                                        handleEdit={handleEdit}
                                                        handleAdmissionResultChange={
                                                            handleAdmissionResultChange
                                                        }
                                                        handleFinalEnrolmentChange={
                                                            handleFinalEnrolmentChange
                                                        }
                                                        isSubmitting={
                                                            isSubmittingUpdate
                                                        }
                                                        handleWithdraw={
                                                            handleWithdraw
                                                        }
                                                        studentToShow={
                                                            studentToShow as ApplicationTableRowStudent
                                                        }
                                                        today={today}
                                                        user={typedUser}
                                                    />
                                                )
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Stack>
                </Card>
                <ConfirmationModal
                    closeText={t('No', { ns: 'common' })}
                    confirmText={t('Yes', { ns: 'common' })}
                    content={t(
                        'This will delete all messages and edited files in discussion. Are you sure?',
                        { ns: 'common' }
                    )}
                    isLoading={!studentApplicationsTableTemplateState.isLoaded}
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
                                select
                                value={
                                    studentApplicationsTableTemplateState.application_year
                                }
                            >
                                {APPLICATION_YEARS_FUTURE().map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    }
                    isLoading={!studentApplicationsTableTemplateState.isLoaded}
                    onClose={onHideModalEditApplication}
                    onConfirm={handleEditConfirm}
                    open={
                        studentApplicationsTableTemplateState.modalEditApplication
                    }
                    title={t('Edit Application Year', { ns: 'common' })}
                />
            </Stack>
        </Box>
    );
};

export default StudentApplicationsTableTemplate;
