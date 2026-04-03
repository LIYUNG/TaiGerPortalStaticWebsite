import {
    MouseEvent,
    useEffect,
    useRef,
    useState,
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
    updateStudentApplications,
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

type StudentDraft = {
    applications?: Application[];
    applying_program_count?: number | string;
};

type AdmissionResult = '-' | 'O' | 'X';

const StudentApplicationsTableTemplate = (
    props: StudentApplicationsTableTemplateProps
) => {
    const { user } = useAuth();
    const typedUser = user as IUser;
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [draft, setDraft] = useState<StudentDraft | null>(null);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [isMetaExpanded, setIsMetaExpanded] = useState(true);
    const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);
    const updateTimerRef = useRef<number | null>(null);
    const queuedUpdateRef = useRef<{
        applications: Application[];
        applyingProgramCount: number | string | undefined;
    } | null>(null);
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
        queueStudentApplicationsUpdate(
            studentToShow.applications ?? [],
            applying_program_count
        );
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>,
        application_idx: number
    ) => {
        e.preventDefault();
        const base = studentToShow.applications ?? [];
        const applications_temp = [...base];
        applications_temp[application_idx] = {
            ...applications_temp[application_idx],
            [e.target.name]: e.target.value
        };
        queueStudentApplicationsUpdate(
            applications_temp,
            studentToShow.applying_program_count
        );
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
        const base = studentToShow.applications ?? [];
        const applications_temp = [...base];
        applications_temp[application_idx] = {
            ...applications_temp[application_idx],
            closed: programWithdraw
        };
        queueStudentApplicationsUpdate(
            applications_temp,
            studentToShow.applying_program_count
        );
    };

    useEffect(() => {
        return () => {
            if (updateTimerRef.current) {
                window.clearTimeout(updateTimerRef.current);
            }
        };
    }, []);

    const updateDraftAdmissionByApplicationId = (
        applicationId: string,
        nextResult: AdmissionResult
    ) => {
        const base = studentToShow.applications ?? [];
        const applicationIndex = base.findIndex(
            (application) => String(application._id ?? '') === applicationId
        );

        if (applicationIndex < 0) {
            return;
        }

        const nextApplications = [...base];
        nextApplications[applicationIndex] = {
            ...nextApplications[applicationIndex],
            admission: nextResult
        };

        setDraft((prev) => ({
            ...prev,
            applications: nextApplications
        }));
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
                setDraft(null);
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

    const buildApplicationsPayload = (applications: Application[]) =>
        applications.map((application) => ({
            _id: application._id,
            programId: application.programId?._id,
            decided: application.decided,
            closed: application.closed,
            admission: application.admission,
            finalEnrolment: application.finalEnrolment
        }));

    const persistStudentApplicationsUpdate = async (
        nextApplications: Application[],
        nextApplyingProgramCount: number | string | undefined
    ) => {
        if (isSubmittingUpdate) {
            return;
        }

        const studentId = String(studentToShow._id ?? '');
        if (!studentId) {
            setSeverity('error');
            setMessage('Missing student id.');
            setOpenSnackbar(true);
            return;
        }

        const applicationsPayload = buildApplicationsPayload(nextApplications);
        const applyingProgramCount = Number(nextApplyingProgramCount ?? 0);

        setIsSubmittingUpdate(true);
        setDraft({
            applications: nextApplications,
            applying_program_count: nextApplyingProgramCount
        });

        try {
            const resp = await updateStudentApplications(
                studentId,
                applicationsPayload as unknown as Record<string, unknown>,
                applyingProgramCount
            );

            const { success, message } = resp.data;
            if (success) {
                setDraft(null);
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

            setDraft(null);
            setSeverity('error');
            setMessage(message ?? 'Failed to update applications.');
            setOpenSnackbar(true);
        } catch (error) {
            setDraft(null);
            setSeverity('error');
            setMessage(
                (error as { message?: string }).message ||
                    'An error occurred. Please try again.'
            );
            setOpenSnackbar(true);
        } finally {
            setIsSubmittingUpdate(false);

            if (queuedUpdateRef.current && !updateTimerRef.current) {
                updateTimerRef.current = window.setTimeout(() => {
                    updateTimerRef.current = null;
                    void flushQueuedStudentApplicationsUpdate();
                }, 0);
            }
        }
    };

    const flushQueuedStudentApplicationsUpdate = async () => {
        if (isSubmittingUpdate) {
            return;
        }

        const nextUpdate = queuedUpdateRef.current;
        if (!nextUpdate) {
            return;
        }

        queuedUpdateRef.current = null;
        await persistStudentApplicationsUpdate(
            nextUpdate.applications,
            nextUpdate.applyingProgramCount
        );
    };

    const queueStudentApplicationsUpdate = (
        nextApplications: Application[],
        nextApplyingProgramCount: number | string | undefined
    ) => {
        setDraft({
            applications: nextApplications,
            applying_program_count: nextApplyingProgramCount
        });

        queuedUpdateRef.current = {
            applications: nextApplications,
            applyingProgramCount: nextApplyingProgramCount
        };

        if (updateTimerRef.current) {
            window.clearTimeout(updateTimerRef.current);
        }

        updateTimerRef.current = window.setTimeout(() => {
            updateTimerRef.current = null;
            void flushQueuedStudentApplicationsUpdate();
        }, 250);
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
                            ? 'Saving changes...'
                            : 'Auto-save on'
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
                <Card sx={{ p: { xs: 1.25, md: 1.5 } }}>
                    <Stack spacing={1.25}>
                        <Stack
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Stack spacing={0.5}>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Typography variant="h6">
                                        {t('Applying Program Count', {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                    {is_TaiGer_role(typedUser) ? (
                                        <Button
                                            onClick={() =>
                                                setIsImportPanelOpen(
                                                    (prev) => !prev
                                                )
                                            }
                                            size="small"
                                            variant="outlined"
                                        >
                                            {isImportPanelOpen
                                                ? t('Hide import programs')
                                                : t('Import programs')}
                                        </Button>
                                    ) : null}
                                </Stack>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    This field now saves automatically.
                                </Typography>
                            </Stack>
                            <Stack
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={1.5}
                            >
                                {is_TaiGer_Admin(typedUser) ? (
                                    <FormControl sx={{ minWidth: 180 }}>
                                        <Select
                                            id="applying_program_count"
                                            name="applying_program_count"
                                            onChange={(e) =>
                                                handleChangeProgramCount(e)
                                            }
                                            size="small"
                                            value={
                                                studentToShow.applying_program_count
                                            }
                                        >
                                            <MenuItem value="0">
                                                Please Select
                                            </MenuItem>
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
                                ) : (
                                    <Typography variant="h6">
                                        {studentToShow.applying_program_count}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                        <Collapse
                            in={isImportPanelOpen}
                            timeout="auto"
                            unmountOnExit
                        >
                            <Box sx={{ mt: 1.5 }}>
                                <ImportStudentProgramsCard
                                    student={studentToShow}
                                />
                            </Box>
                        </Collapse>
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
                {is_TaiGer_role(typedUser) ? (
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
                                        onClick={onClickProgramAssignHandler}
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
