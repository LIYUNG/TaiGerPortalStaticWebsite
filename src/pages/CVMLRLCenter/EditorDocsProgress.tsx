import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Link,
    Typography,
    TextField,
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import type { Application } from '@api/types';

import ManualFiles from './ManualFiles';
import ApplicationLockControl from '@components/ApplicationLockControl/ApplicationLockControl';
import { LinkableNewlineText } from '../Utils/checking-functions';
import {
    application_deadline_V2_calculator,
    calculateProgramLockStatus,
    calculateApplicationLockStatus
} from '../Utils/util_functions';
import { FILE_OK_SYMBOL, spinner_style2 } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import {
    deleteGenralFileThread,
    deleteProgramSpecificFileThread,
    SetFileAsFinal,
    initGeneralMessageThread,
    initApplicationMessageThread,
    updateStudentApplication
} from '@api';
import DEMO from '@store/constant';
import Loading from '@components/Loading/Loading';
import i18next from 'i18next';

interface ApplicationAccordionSummaryProps {
    application: Application;
    onStudentUpdate?: () => void;
    student?: EditorDocsProgressStudent;
}

const ApplicationAccordionSummary = ({
    application
}: ApplicationAccordionSummaryProps) => {
    // For approval countries: use program-level lock status (check program staleness)
    // For non-approval countries: use application-level lock status (check program staleness + application.isLocked)
    // Always use calculateApplicationLockStatus for consistency - it handles both cases correctly
    let lockStatus = null;
    if (application && application.programId) {
        lockStatus = calculateApplicationLockStatus(application);
    } else {
        lockStatus = application?.programId
            ? calculateProgramLockStatus(
                  application.programId as Record<string, unknown>
              )
            : calculateProgramLockStatus({});
    }
    const isLocked = lockStatus.isLocked;

    // Determine status text
    const getStatusText = () => {
        if (isProgramSubmitted(application)) {
            return null; // Will show FILE_OK_SYMBOL instead
        }

        if (application.decided === '-') {
            return (
                <Typography color="grey" variant="body1">
                    Undecided
                </Typography>
            );
        }

        if (application.decided === 'X') {
            return (
                <Typography color="grey" variant="body1">
                    Not wanted
                </Typography>
            );
        }

        if (isProgramWithdraw(application)) {
            return (
                <Typography fontWeight="bold">
                    {i18next.t('WITHDRAW', { ns: 'common' })}
                </Typography>
            );
        }

        return (
            <Typography fontWeight="bold">
                {i18next.t('In Progress', { ns: 'common' })}
            </Typography>
        );
    };

    const statusNode = (() => {
        if (isProgramSubmitted(application)) {
            return <IconButton>{FILE_OK_SYMBOL}</IconButton>;
        }

        const statusText = getStatusText();
        const lockIcon = isLocked ? (
            <Tooltip
                title={i18next.t(
                    'Program is locked. Contact your agent to unlock this task.',
                    { ns: 'common' }
                )}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        color: 'warning.main',
                        mb: 0.5
                    }}
                >
                    <LockOutlinedIcon fontSize="small" />
                </Box>
            </Tooltip>
        ) : null;

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {lockIcon}
                {statusText}
            </Box>
        );
    })();

    const progressColor = isLocked
        ? 'text.disabled'
        : isProgramDecided(application)
          ? isProgramSubmitted(application)
              ? 'success.light'
              : 'error.main'
          : 'grey';

    return (
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2}>
                <Grid item md={1} xs={1}>
                    {statusNode}
                </Grid>
                <Grid item md={1} xs={1}>
                    <Typography
                        color={progressColor}
                        sx={{ mr: 2 }}
                        variant="body1"
                    >
                        {
                            (
                                application.doc_modification_thread as
                                    | { isFinalVersion?: boolean }[]
                                    | undefined
                            )?.filter((doc) => doc.isFinalVersion).length
                        }
                        /{application.doc_modification_thread?.length || 0}
                    </Typography>
                </Grid>
                <Grid item md={8} xs={8}>
                    <Box sx={{ display: 'flex' }}>
                        <Typography
                            color={progressColor}
                            sx={{ mr: 2 }}
                            variant="body1"
                        >
                            <b>
                                {application.programId?.school} -{' '}
                                {application.programId?.degree} -{' '}
                                {application.programId?.program_name}
                            </b>
                        </Typography>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={DEMO.SINGLE_PROGRAM_LINK(
                                String(application.programId?._id ?? '')
                            )}
                        >
                            <LaunchIcon />
                        </Link>
                    </Box>
                </Grid>
                <Grid item md={2} xs={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}
                    >
                        <Typography>
                            Deadline:{' '}
                            {application_deadline_V2_calculator(application)}
                        </Typography>
                        <ApplicationLockControl application={application} />
                    </Box>
                </Grid>
            </Grid>
        </AccordionSummary>
    );
};

/** Thread/item in generaldocs_threads */
export interface EditorDocsProgressDocThread {
    _id?: string;
    doc_thread_id?: { _id?: { toString(): string } };
    [k: string]:
        | string
        | number
        | boolean
        | { _id?: { toString(): string } }
        | undefined;
}

/** Student shape for EditorDocsProgress (exact fields used in the component) */
export interface EditorDocsProgressStudent {
    _id?: string;
    firstname?: string;
    applications?: Application[];
    generaldocs_threads?: EditorDocsProgressDocThread[];
}

export interface EditorDocsProgressProps {
    student: EditorDocsProgressStudent;
    onStudentUpdate?: () => void;
}

interface EditorDocsProgressState {
    error: string;
    delete_field: string;
    student: EditorDocsProgressStudent;
    deleteFileWarningModel: boolean;
    SetProgramStatusModel: boolean;
    SetAsFinalFileModel: boolean;
    Requirements_Modal: boolean;
    isFinal: boolean;
    studentId: string;
    student_id: string;
    doc_thread_id: string;
    docName: string;
    isLoaded: boolean;
    requirements: string;
    file: string;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
    application_id?: string;
    isApplicationSubmitted?: boolean;
}

const EditorDocsProgress = (props: EditorDocsProgressProps) => {
    const [editorDocsProgressState, setEditorDocsProgressState] =
        useState<EditorDocsProgressState>({
            error: '',
            delete_field: '',
            student: props.student,
            deleteFileWarningModel: false,
            SetProgramStatusModel: false,
            SetAsFinalFileModel: false,
            Requirements_Modal: false,
            isFinal: false,
            studentId: '',
            student_id: '',
            doc_thread_id: '',
            docName: '',
            isLoaded: false,
            requirements: '',
            file: '',
            res_status: 0,
            res_modal_message: '',
            res_modal_status: 0
        });
    useEffect(() => {
        const student = props.student;
        queueMicrotask(() => {
            setEditorDocsProgressState((prevState) => ({
                ...prevState,
                isLoaded: true,
                student
            }));
        });
    }, [props.student]);

    const closeSetProgramStatusModel = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            SetProgramStatusModel: false
        }));
    };
    const closeSetAsFinalFileModelWindow = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            SetAsFinalFileModel: false
        }));
    };
    const openRequirements_ModalWindow = (ml_requirements: string) => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            Requirements_Modal: true,
            requirements: ml_requirements
        }));
    };
    const close_Requirements_ModalWindow = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            Requirements_Modal: false,
            requirements: ''
        }));
    };

    const closeWarningWindow = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            deleteFileWarningModel: false,
            delete_field: ''
        }));
    };

    const ConfirmDeleteDiscussionThreadHandler = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            isLoaded: false //false to reload everything
        }));
        if (editorDocsProgressState.application_id == null) {
            deleteGenralFileThread(
                editorDocsProgressState.doc_thread_id,
                editorDocsProgressState.student_id
            ).then(
                (resp) => {
                    const { success } = resp.data;
                    const { status } = resp;
                    if (success) {
                        const student_temp = {
                            ...editorDocsProgressState.student
                        };
                        const general_docs_idx =
                            student_temp.generaldocs_threads?.findIndex(
                                (thread: EditorDocsProgressDocThread) =>
                                    thread.doc_thread_id?._id?.toString() ===
                                    editorDocsProgressState.doc_thread_id
                            ) ?? -1;
                        if (
                            general_docs_idx !== -1 &&
                            student_temp.generaldocs_threads
                        ) {
                            student_temp.generaldocs_threads.splice(
                                general_docs_idx,
                                1
                            );
                        }

                        setEditorDocsProgressState((prevState) => ({
                            ...prevState,
                            student_id: '',
                            doc_thread_id: '',
                            isLoaded: true,
                            student: student_temp,
                            success: success,
                            delete_field: '',
                            deleteFileWarningModel: false,
                            res_modal_status: status
                        }));
                    } else {
                        const { message } = resp.data;
                        setEditorDocsProgressState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_modal_message: message,
                            res_modal_status: status
                        }));
                    }
                },
                (error) => {
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        delete_field: '',
                        error,
                        res_modal_status: 500,
                        res_modal_message: ''
                    }));
                }
            );
        } else {
            deleteProgramSpecificFileThread(
                editorDocsProgressState.doc_thread_id,
                editorDocsProgressState.application_id ?? '',
                editorDocsProgressState.student_id
            ).then(
                (resp) => {
                    const { success } = resp.data;
                    const { status } = resp;
                    if (success) {
                        const student_temp = {
                            ...editorDocsProgressState.student
                        };
                        const application_idx =
                            student_temp.applications?.findIndex(
                                (application: Application) =>
                                    application._id?.toString() ===
                                    editorDocsProgressState.application_id
                            ) ?? -1;
                        if (
                            application_idx !== -1 &&
                            student_temp.applications
                        ) {
                            const app =
                                student_temp.applications[application_idx];
                            const doc_mod = app?.doc_modification_thread;
                            const doc_thread_idx =
                                doc_mod?.findIndex(
                                    (thread: unknown) =>
                                        (
                                            thread as {
                                                doc_thread_id?: {
                                                    _id?: {
                                                        toString(): string;
                                                    };
                                                };
                                            }
                                        ).doc_thread_id?._id?.toString() ===
                                        editorDocsProgressState.doc_thread_id
                                ) ?? -1;
                            if (doc_thread_idx !== -1 && doc_mod) {
                                doc_mod.splice(doc_thread_idx, 1);
                            }
                        }
                        setEditorDocsProgressState((prevState) => ({
                            ...prevState,
                            student_id: '',
                            application_id: '',
                            doc_thread_id: '',
                            isLoaded: true,
                            student: student_temp,
                            delete_field: '',
                            success: success,
                            deleteFileWarningModel: false,
                            res_modal_status: status
                        }));
                    } else {
                        const { message } = resp.data;
                        setEditorDocsProgressState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            delete_field: '',
                            res_modal_message: message,
                            res_modal_status: status
                        }));
                    }
                },
                (error) => {
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        delete_field: '',
                        res_modal_status: 500,
                        res_modal_message: ''
                    }));
                }
            );
        }
    };

    const ConfirmSetThreadAsFinalFileHandler = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            isLoaded: false // false to reload everything
        }));
        SetFileAsFinal(
            editorDocsProgressState.doc_thread_id,
            editorDocsProgressState.student_id,
            editorDocsProgressState.application_id ?? ''
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const student_temp = { ...editorDocsProgressState.student };
                    type ThreadWithFinal = {
                        isFinalVersion?: boolean;
                        updatedAt?: string;
                        doc_thread_id?: { updatedAt?: string };
                    };
                    let targetThread: ThreadWithFinal | undefined;
                    if (editorDocsProgressState.application_id) {
                        const application_idx =
                            student_temp.applications?.findIndex(
                                (application: Application) =>
                                    application._id?.toString() ===
                                    editorDocsProgressState.application_id
                            ) ?? -1;
                        const app =
                            application_idx !== -1
                                ? student_temp.applications?.[application_idx]
                                : undefined;
                        const doc_mod = app?.doc_modification_thread as
                            | {
                                  doc_thread_id?: {
                                      _id?: { toString(): string };
                                      updatedAt?: string;
                                  };
                                  isFinalVersion?: boolean;
                                  updatedAt?: string;
                              }[]
                            | undefined;
                        const thread_idx =
                            doc_mod?.findIndex(
                                (thread: unknown) =>
                                    (
                                        thread as {
                                            doc_thread_id?: {
                                                _id?: { toString(): string };
                                            };
                                        }
                                    ).doc_thread_id?._id?.toString() ===
                                    editorDocsProgressState.doc_thread_id
                            ) ?? -1;
                        targetThread =
                            thread_idx !== -1
                                ? doc_mod?.[thread_idx]
                                : undefined;
                    } else {
                        const general_doc_idx =
                            student_temp.generaldocs_threads?.findIndex(
                                (docs: EditorDocsProgressDocThread) =>
                                    docs.doc_thread_id?._id?.toString() ===
                                    editorDocsProgressState.doc_thread_id
                            ) ?? -1;
                        targetThread =
                            general_doc_idx !== -1
                                ? (student_temp.generaldocs_threads?.[
                                      general_doc_idx
                                  ] as ThreadWithFinal)
                                : undefined;
                    }
                    if (targetThread) {
                        targetThread.isFinalVersion = data.isFinalVersion;
                        targetThread.updatedAt = data.updatedAt;
                        if (targetThread.doc_thread_id)
                            targetThread.doc_thread_id.updatedAt =
                                data.updatedAt;
                    }

                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        studentId: '',
                        docName: '',
                        isLoaded: true,
                        student: student_temp,
                        success: success,
                        SetAsFinalFileModel: false,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const handleProgramStatus = (
        student_id: string,
        application_id: string,
        isApplicationSubmitted: boolean
    ) => {
        const application = editorDocsProgressState.student?.applications?.find(
            (app: Application) => app._id?.toString() === application_id
        );

        if (application && application.programId) {
            const lockStatus = calculateApplicationLockStatus(application);

            // Prevent submission if locked
            if (lockStatus.isLocked) {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    res_modal_status: 400,
                    res_modal_message: i18next.t(
                        'Cannot submit application. Application is locked. Please unlock first.',
                        { ns: 'common' }
                    )
                }));
                return;
            }
        }

        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            student_id,
            application_id,
            SetProgramStatusModel: true,
            isApplicationSubmitted
        }));
    };

    const SubmitProgramStatusHandler = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            isLoaded: false // false to reload everything
        }));
        updateStudentApplication(
            editorDocsProgressState.student_id,
            editorDocsProgressState.application_id ?? '',
            {
                closed: editorDocsProgressState.isApplicationSubmitted
                    ? '-'
                    : 'O'
            }
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const student_temp = { ...editorDocsProgressState.student };
                    const application_idx =
                        student_temp.applications?.findIndex(
                            (application: Application) =>
                                application._id?.toString() ===
                                editorDocsProgressState.application_id
                        ) ?? -1;
                    const appAtIdx =
                        application_idx !== -1
                            ? student_temp.applications?.[application_idx]
                            : undefined;
                    if (appAtIdx) appAtIdx.closed = data.closed;

                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        studentId: '',
                        isLoaded: true,
                        student: student_temp,
                        success: success,
                        SetProgramStatusModel: false,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const handleAsFinalFile = (
        doc_thread_id: string,
        student_id: string,
        application_id: string,
        isFinal: boolean,
        docName: string
    ) => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            doc_thread_id,
            student_id,
            application_id,
            docName,
            isFinal,
            SetAsFinalFileModel: true
        }));
    };

    const onChangeDeleteField = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            delete_field: e.target.value
        }));
    };

    const onDeleteFileThread = (
        doc_thread_id: string,
        application: Application | null,
        studentId: string,
        docName: string
    ) => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            doc_thread_id,
            application_id: application?._id?.toString() ?? '',
            student_id: studentId,
            docName,
            deleteFileWarningModel: true
        }));
    };

    const initProgramSpecificFileThread = (
        e: MouseEvent<HTMLElement>,
        studentId: string,
        applicationId: string,
        document_catgory: string
    ) => {
        e.preventDefault();
        initApplicationMessageThread(studentId, applicationId, document_catgory)
            .then((resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const student_temp = { ...editorDocsProgressState.student };
                    const application_idx =
                        student_temp.applications?.findIndex(
                            (application: Application) =>
                                application._id?.toString() === applicationId
                        ) ?? -1;
                    const appAtIdx =
                        application_idx !== -1
                            ? student_temp.applications?.[application_idx]
                            : undefined;
                    const docMod = appAtIdx?.doc_modification_thread as
                        | unknown[]
                        | undefined;
                    if (docMod) docMod.push(data);

                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        student: student_temp,
                        success: success,
                        file: '',
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            })
            .catch((error) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            });
    };

    const initGeneralFileThread = (
        e: MouseEvent<HTMLElement>,
        studentId: string,
        document_catgory: string
    ) => {
        e.preventDefault();
        initGeneralMessageThread(studentId, document_catgory)
            .then((resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const student_temp = {
                        ...editorDocsProgressState.student
                    };
                    if (!student_temp.generaldocs_threads)
                        student_temp.generaldocs_threads = [];
                    student_temp.generaldocs_threads.push(
                        data as EditorDocsProgressDocThread
                    );
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        student: student_temp,
                        success: success,
                        file: '',
                        res_modal_status: status
                    }));
                } else {
                    // TODO: handle frontend render if create duplicate thread
                    const { message } = resp.data;
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            })
            .catch((error) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            });
    };

    const ConfirmError = () => {
        setEditorDocsProgressState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_modal_status, res_modal_message, res_status, isLoaded } =
        editorDocsProgressState;

    if (!isLoaded && !editorDocsProgressState.student) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
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
            <ManualFiles
                application={null}
                applications={editorDocsProgressState.student.applications?.filter(
                    (app: Application) => isProgramDecided(app)
                )}
                filetype="General"
                handleAsFinalFile={handleAsFinalFile}
                initGeneralFileThread={initGeneralFileThread}
                initProgramSpecificFileThread={initProgramSpecificFileThread}
                onDeleteFileThread={onDeleteFileThread}
                student={editorDocsProgressState.student}
            />
            <Divider />
            <Typography sx={{ mt: 2 }}>
                {i18next.t('Applications', { ns: 'common' })}
            </Typography>
            {/* TODO: simplify this! with array + function! */}
            {editorDocsProgressState.student.applications
                ?.filter((app: Application) => isProgramDecided(app))
                .map((application: Application, i: number) => {
                    const lockStatus =
                        calculateApplicationLockStatus(application);
                    const isLocked = lockStatus.isLocked;
                    return (
                        <div key={i}>
                            <Accordion defaultExpanded={false} disableGutters>
                                <ApplicationAccordionSummary
                                    application={application}
                                />
                                <AccordionDetails>
                                    {isLocked && (
                                        <Alert
                                            severity="warning"
                                            sx={{ mb: 2 }}
                                        >
                                            <Typography variant="body2">
                                                <strong>Warning:</strong>
                                                <br />
                                                {i18next.t(
                                                    'Program is locked. Contact an agent to unlock this task.',
                                                    { ns: 'common' }
                                                )}
                                            </Typography>
                                        </Alert>
                                    )}
                                    <ManualFiles
                                        application={application}
                                        filetype="ProgramSpecific"
                                        handleAsFinalFile={handleAsFinalFile}
                                        handleProgramStatus={
                                            handleProgramStatus
                                        }
                                        initGeneralFileThread={
                                            initGeneralFileThread
                                        }
                                        initProgramSpecificFileThread={
                                            initProgramSpecificFileThread
                                        }
                                        onDeleteFileThread={onDeleteFileThread}
                                        openRequirements_ModalWindow={
                                            openRequirements_ModalWindow
                                        }
                                        student={
                                            editorDocsProgressState.student
                                        }
                                    />
                                </AccordionDetails>
                            </Accordion>
                            <Divider sx={{ my: 2 }} />
                        </div>
                    );
                })}
            {editorDocsProgressState.student.applications
                ?.filter((app: Application) => !isProgramDecided(app))
                .map((application: Application, i: number) => {
                    const lockStatus =
                        calculateApplicationLockStatus(application);
                    const isLocked = lockStatus.isLocked;
                    return (
                        <div key={i}>
                            <Accordion defaultExpanded={false} disableGutters>
                                <ApplicationAccordionSummary
                                    application={application}
                                    onStudentUpdate={props.onStudentUpdate}
                                    student={editorDocsProgressState.student}
                                />
                                <AccordionDetails>
                                    {isLocked && (
                                        <Alert
                                            severity="warning"
                                            sx={{ mb: 2 }}
                                        >
                                            <Typography variant="body2">
                                                <strong>Warning:</strong>
                                                <br />
                                                {i18next.t(
                                                    'Program is locked. Contact an agent to unlock this task.',
                                                    { ns: 'common' }
                                                )}
                                            </Typography>
                                        </Alert>
                                    )}
                                    <ManualFiles
                                        application={application}
                                        filetype="ProgramSpecific"
                                        handleAsFinalFile={handleAsFinalFile}
                                        handleProgramStatus={
                                            handleProgramStatus
                                        }
                                        initGeneralFileThread={
                                            initGeneralFileThread
                                        }
                                        initProgramSpecificFileThread={
                                            initProgramSpecificFileThread
                                        }
                                        onDeleteFileThread={onDeleteFileThread}
                                        openRequirements_ModalWindow={
                                            openRequirements_ModalWindow
                                        }
                                        student={
                                            editorDocsProgressState.student
                                        }
                                    />
                                </AccordionDetails>
                            </Accordion>
                            <Divider sx={{ my: 2 }} />
                        </div>
                    );
                })}
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={closeWarningWindow}
                open={editorDocsProgressState.deleteFileWarningModel}
            >
                <DialogTitle>
                    {i18next.t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to delete{' '}
                        <b>{editorDocsProgressState.docName}</b>?
                    </DialogContentText>
                    <InputLabel>
                        <Typography>
                            Please enter{' '}
                            <i>
                                <b>delete</b>
                            </i>{' '}
                            in order to delete the user.
                        </Typography>
                    </InputLabel>
                    <TextField
                        fullWidth
                        onChange={(e) => onChangeDeleteField(e)}
                        placeholder="delete"
                        size="small"
                        type="text"
                        value={`${editorDocsProgressState.delete_field}`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={
                            !isLoaded ||
                            editorDocsProgressState.delete_field !== 'delete'
                        }
                        onClick={ConfirmDeleteDiscussionThreadHandler}
                        variant="contained"
                    >
                        {isLoaded ? (
                            i18next.t('Yes', { ns: 'common' })
                        ) : (
                            <div style={spinner_style2 as React.CSSProperties}>
                                <CircularProgress />
                            </div>
                        )}
                    </Button>
                    <Button
                        color="primary"
                        onClick={closeWarningWindow}
                        variant="outlined"
                    >
                        {i18next.t('No', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* <DocumentCheckingResultModal
        open={editorDocsProgressState.SetAsFinalFileModel}
        thread_id={editorDocsProgressState.doc_thread_id}
        file_type={editorDocsProgressState.thread.file_type}
        isFinalVersion={editorDocsProgressState.isFinal}
        onClose={closeSetAsFinalFileModelWindow}
        title={t('Warning', { ns: 'common' })}
        onConfirm={(e) => ConfirmSetThreadAsFinalFileHandler(e)}
        student_name={editorDocsProgressState.student_name}
        docName={editorDocsProgressState.docName}
      /> */}
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={closeSetAsFinalFileModelWindow}
                open={editorDocsProgressState.SetAsFinalFileModel}
            >
                <DialogTitle>
                    {i18next.t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to set {editorDocsProgressState.docName} as{' '}
                        {editorDocsProgressState.isFinal ? 'final' : 'open'}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={!isLoaded}
                        onClick={ConfirmSetThreadAsFinalFileHandler}
                        variant="contained"
                    >
                        {isLoaded ? (
                            i18next.t('Yes', { ns: 'common' })
                        ) : (
                            <div style={spinner_style2 as React.CSSProperties}>
                                <CircularProgress />
                            </div>
                        )}
                    </Button>
                    <Button
                        onClick={closeSetAsFinalFileModelWindow}
                        variant="outlined"
                    >
                        {i18next.t('No', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={close_Requirements_ModalWindow}
                open={editorDocsProgressState.Requirements_Modal}
            >
                <DialogTitle>
                    {i18next.t('Special Requirements', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <LinkableNewlineText
                            text={editorDocsProgressState.requirements}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={close_Requirements_ModalWindow}
                        variant="outlined"
                    >
                        {i18next.t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={closeSetProgramStatusModel}
                open={editorDocsProgressState.SetProgramStatusModel}
            >
                <DialogTitle>{i18next.t('Attention')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to{' '}
                        {editorDocsProgressState.isApplicationSubmitted
                            ? 're-open'
                            : 'close'}{' '}
                        this program for{' '}
                        {editorDocsProgressState.student.firstname}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={!isLoaded}
                        onClick={SubmitProgramStatusHandler}
                        variant="contained"
                    >
                        {i18next.t('Yes', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        onClick={closeSetProgramStatusModel}
                        variant="outlined"
                    >
                        {i18next.t('No', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditorDocsProgress;
