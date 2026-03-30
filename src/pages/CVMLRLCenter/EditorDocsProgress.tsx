import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { isProgramDecided } from '@taiger-common/core';
import type { Application } from '@/api/types';

import ManualFiles from './ManualFiles';
import { calculateApplicationLockStatus } from '../Utils/util_functions';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import {
    deleteGenralFileThread,
    deleteProgramSpecificFileThread,
    SetFileAsFinal,
    initGeneralMessageThread,
    initApplicationMessageThread,
    updateStudentApplication
} from '@/api';
import Loading from '@components/Loading/Loading';
import i18next from 'i18next';
import ApplicationAccordionList from './components/ApplicationAccordionList';
import DeleteFileThreadDialog from './components/DeleteFileThreadDialog';
import SetAsFinalFileDialog from './components/SetAsFinalFileDialog';
import RequirementsModal from './components/RequirementsModal';
import SetProgramStatusDialog from './components/SetProgramStatusDialog';

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
    success?: boolean;
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
            isLoaded: false
        }));
        if (!editorDocsProgressState.application_id) {
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
                            res_modal_message: message ?? '',
                            res_modal_status: status
                        }));
                    }
                },
                (error: unknown) => {
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        delete_field: '',
                        error: String(error),
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
                            res_modal_message: message ?? '',
                            res_modal_status: status
                        }));
                    }
                },
                (error: unknown) => {
                    setEditorDocsProgressState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error: String(error),
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
            isLoaded: false
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
                    if (targetThread && data) {
                        targetThread.isFinalVersion = data.isFinalVersion;
                        targetThread.updatedAt = data.updatedAt ? String(data.updatedAt) : undefined;
                        if (targetThread.doc_thread_id)
                            targetThread.doc_thread_id.updatedAt =
                                data.updatedAt ? String(data.updatedAt) : undefined;
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
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
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
            isLoaded: false
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
                    if (appAtIdx && data) appAtIdx.closed = data.closed;
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
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
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
                        isLoaded: true,
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
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            })
            .catch((error: unknown) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
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
                        isLoaded: true,
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
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            })
            .catch((error: unknown) => {
                setEditorDocsProgressState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
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

    const decidedApplications =
        editorDocsProgressState.student.applications?.filter(
            (app: Application) => isProgramDecided(app)
        ) ?? [];

    const undecidedApplications =
        editorDocsProgressState.student.applications?.filter(
            (app: Application) => !isProgramDecided(app)
        ) ?? [];

    const sharedAccordionProps = {
        student: editorDocsProgressState.student,
        handleAsFinalFile,
        handleProgramStatus,
        initGeneralFileThread,
        initProgramSpecificFileThread,
        onDeleteFileThread,
        openRequirements_ModalWindow
    };

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
                applications={decidedApplications}
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
            <ApplicationAccordionList
                applications={decidedApplications}
                {...sharedAccordionProps}
            />
            <ApplicationAccordionList
                applications={undecidedApplications}
                onStudentUpdate={props.onStudentUpdate}
                {...sharedAccordionProps}
            />

            <DeleteFileThreadDialog
                deleteField={editorDocsProgressState.delete_field}
                docName={editorDocsProgressState.docName}
                isLoaded={isLoaded}
                onChangeDeleteField={onChangeDeleteField}
                onClose={closeWarningWindow}
                onConfirm={ConfirmDeleteDiscussionThreadHandler}
                open={editorDocsProgressState.deleteFileWarningModel}
            />
            <SetAsFinalFileDialog
                docName={editorDocsProgressState.docName}
                isFinal={editorDocsProgressState.isFinal}
                isLoaded={isLoaded}
                onClose={closeSetAsFinalFileModelWindow}
                onConfirm={ConfirmSetThreadAsFinalFileHandler}
                open={editorDocsProgressState.SetAsFinalFileModel}
            />
            <RequirementsModal
                onClose={close_Requirements_ModalWindow}
                open={editorDocsProgressState.Requirements_Modal}
                requirements={editorDocsProgressState.requirements}
            />
            <SetProgramStatusDialog
                isApplicationSubmitted={
                    editorDocsProgressState.isApplicationSubmitted ?? false
                }
                isLoaded={isLoaded}
                onClose={closeSetProgramStatusModel}
                onConfirm={SubmitProgramStatusHandler}
                open={editorDocsProgressState.SetProgramStatusModel}
                studentFirstname={
                    editorDocsProgressState.student.firstname ?? ''
                }
            />
        </Box>
    );
};

export default EditorDocsProgress;
