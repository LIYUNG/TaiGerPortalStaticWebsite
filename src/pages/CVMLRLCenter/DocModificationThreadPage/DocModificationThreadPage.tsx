import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type MouseEvent,
    type RefObject
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
    Typography,
    Box,
    Tabs,
    Tab,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { pdfjs } from 'react-pdf';
import { is_TaiGer_role, isProgramWithdraw } from '@taiger-common/core';

import ErrorPage from '../../Utils/ErrorPage';
import ModalMain from '../../Utils/ModalHandler/ModalMain';
import { templatelist, THREAD_TABS } from '@utils/contants';
import {
    FILE_TYPE_E,
    readDOCX,
    readPDF,
    readXLSX,
    toogleItemInArray,
    calculateProgramLockStatus,
    calculateApplicationLockStatus
} from '../../Utils/util_functions';
import {
    SubmitMessageWithAttachment,
    deleteAMessageInThread,
    SetFileAsFinal,
    updateEssayWriter,
    putThreadFavorite
} from '@/api';
import { TabTitle } from '../../Utils/TabTitle';
import type { DocumentThreadResponse } from '@/api/types';
import FilesList from './FilesList';
import CVDraftGenerator from './CVDraftGenerator';
import AdditionalInformationCard from './AdditionalInformationCard';
import CVProfileForm from '@components/CVProfileForm';
import PassportPhotoCard from './PassportPhotoCard';
import { useAuth } from '@components/AuthProvider';
import EditEssayWritersSubpage from '@pages/Dashboard/MainViewTab/StudDocsOverview/EditEssayWritersSubpage';
import type { EssayDocumentThreadForWriters } from '@pages/Dashboard/MainViewTab/StudDocsOverview/EditUserListSubpage';
import MessageList, {
    type MessageThread
} from '@components/Message/MessageList';
import DocumentCheckingResultModal from './DocumentCheckingResultModal';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import Audit from '../../Audit';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useSnackBar } from '@contexts/use-snack-bar';
import type {
    IApplicationPopulated,
    IDocumentthreadPopulated,
    IProgramWithId,
    ITemplateWithId,
    IUserWithId,
    IAuditWithId
} from '@taiger-common/model';
import { GeneralRLRequirementsTab } from './DocumentThreadsPage/GeneralRLRequirementsTab';
import InformationBlock from '@pages/CVMLRLCenter/DocModificationThreadPage/components/InformationBlock';
import SimilarThreadsTab, {
    type SimilarThread
} from './components/SimilarThreadsTab';
import DiscussionEditorCard, {
    type DiscussionEditorCardThread,
    type DiscussionEditorCardUser
} from './components/DiscussionEditorCard';
import ThreadFinalToggleButton from './components/ThreadFinalToggleButton';
import type { OutputData } from '@editorjs/editorjs';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/** Thread object from state; may be empty before load */
interface DocModificationThreadPageThread {
    _id?: string | { toString(): string };
    application_id?: { programId?: unknown; [key: string]: unknown };
    program_id?: {
        school?: string;
        degree?: string;
        program_name?: string;
        essay_difficulty?: string;
        [key: string]: unknown;
    };
    file_type?: string;
    student_id?: {
        firstname?: string;
        lastname?: string;
        _id?: { toString(): string };
        [key: string]: unknown;
    };
    isFinalVersion?: boolean;
    flag_by_user_id?: string[];
    messages?: unknown[];
    [key: string]: unknown;
}

/** Stable hash segment keys for doc thread tabs (avoids new object refs in useMemo deps). */
const DOC_THREAD_TAB_KEYS = {
    discussion: 'communication',
    aiDraft: 'ai-draft',
    cvDetails: 'cv-details',
    generalRL: 'general-rl',
    files: 'files',
    database: 'database',
    audit: 'audit'
} as const;

const DOC_THREAD_LEGACY_HASH_MAP: Record<string, string> = {
    communication: DOC_THREAD_TAB_KEYS.discussion,
    history: DOC_THREAD_TAB_KEYS.files,
    audit: DOC_THREAD_TAB_KEYS.audit
};

export interface DocModificationThreadPageProps {
    agents?: unknown;
    conflictList?: unknown;
    deadline?: unknown;
    editors?: unknown;
    threadProps?: unknown;
    similarThreads?: unknown;
    scrollableRef?: RefObject<HTMLElement | null>;
    threadauditLog?: unknown;
    /** Opt into the app-shell layout when the host provides a bounded height. */
    fillHeight?: boolean;
    /** Controlled open state for the mobile thread-details Drawer (host header). */
    detailsOpen?: boolean;
    /** Close handler for the mobile thread-details Drawer. */
    onCloseDetails?: () => void;
}

const DocModificationThreadPage = ({
    agents,
    conflictList,
    deadline,
    editors,
    threadProps,
    similarThreads,
    scrollableRef,
    threadauditLog,
    fillHeight,
    detailsOpen,
    onCloseDetails
}: DocModificationThreadPageProps) => {
    const { user } = useAuth();
    const { documentsthreadId } = useParams();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    // App-shell layout: fixed tabs + an independently scrolling message panel.
    // Enabled when the host gives this page a bounded height — the embedded
    // /doc-communications view (via scrollableRef) and the standalone
    // /document-modification page (via the fillHeight prop) both opt in.
    const isAppShell = Boolean(scrollableRef) || Boolean(fillHeight);
    const [docModificationThreadPageState, setDocModificationThreadPageState] =
        useState<{
            error: string;
            file: File[] | null;
            threadAuditLog: unknown;
            showEditorPage: boolean;
            isSubmissionLoaded: boolean;
            isLoaded: boolean;
            deletingMessageId?: string;
            pendingMessageId?: string;
            thread: DocModificationThreadPageThread;
            buttonDisabled: boolean;
            editorState: Record<string, unknown>;
            expand: boolean;
            editors: unknown;
            isSubmitting: boolean;
            agents: unknown;
            conflict_list: unknown;
            deadline: unknown;
            SetAsFinalFileModel: boolean;
            accordionKeys: number[];
            res_status: number;
            res_modal_status: number;
            res_modal_message: string;
            [key: string]: unknown;
        }>({
            error: '',
            file: null,
            threadAuditLog: threadauditLog,
            showEditorPage: false,
            isSubmissionLoaded: true,
            isLoaded: true,
            thread: threadProps as DocModificationThreadPageThread,
            buttonDisabled: false,
            editorState: {},
            expand: true,
            editors: editors,
            isSubmitting: false,
            agents: agents,
            conflict_list: conflictList,
            deadline: deadline,
            SetAsFinalFileModel: false,
            accordionKeys: [0], // to expand all]
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: ''
        });
    const [checkResult, setCheckResult] = useState<unknown[]>([]);
    const { hash } = useLocation();
    const thread: DocModificationThreadPageThread =
        (docModificationThreadPageState.thread as DocModificationThreadPageThread) ||
        {};
    const deadlineText = String(
        docModificationThreadPageState.deadline ?? deadline ?? ''
    ).trim();
    const isWithdrawThread =
        deadlineText.toUpperCase() === 'WITHDRAW' ||
        (thread?.application_id != null &&
            typeof thread.application_id !== 'string' &&
            isProgramWithdraw(
                thread.application_id as unknown as IApplicationPopulated
            ));

    // Use application-level lock status if application_id exists and has programId
    // Otherwise fall back to program-level lock status
    let lockStatus = null;
    let isLocked = false;
    if (thread?.application_id && thread?.application_id?.programId) {
        const application = {
            ...thread.application_id,
            programId: thread.program_id || thread.application_id.programId
        } as IApplicationPopulated;
        lockStatus = calculateApplicationLockStatus(application);
        isLocked = lockStatus.isLocked === true;
    } else if (thread?.program_id) {
        lockStatus = calculateProgramLockStatus(
            thread.program_id as IProgramWithId
        );
        isLocked = lockStatus.isLocked === true;
    }

    const lockTooltip = isLocked
        ? i18next.t('Application is locked. Unlock to modify documents.', {
              ns: 'common'
          })
        : i18next.t(
              'Program is locked. Contact an agent to unlock this task.',
              {
                  ns: 'common'
              }
          );
    const isThreadClosed = thread?.isFinalVersion === true;
    const readOnlyTooltip = isWithdrawThread
        ? i18next.t('Thread is withdrawn. This thread is read-only.', {
              ns: 'common'
          })
        : isThreadClosed
          ? i18next.t('Thread is closed. This thread is read-only.', {
                ns: 'common'
            })
          : lockTooltip;
    const isReadOnlyThread = isLocked || isThreadClosed || isWithdrawThread;
    const isToggleBlocked = isLocked || isWithdrawThread;
    const hashKey = hash?.replace('#', '') || '';
    const [value, setValue] = useState(
        (THREAD_TABS as Record<string, number>)[hashKey] ?? 0
    );
    useEffect(() => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread:
                (threadProps as DocModificationThreadPageThread) ??
                prevState.thread
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when route id changes
    }, [documentsthreadId]);
    useEffect(() => {
        const el = scrollableRef?.current;
        if (!el) return;
        const t = window.setTimeout(() => {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to scroll into view
    }, []);

    const closeSetAsFinalFileModelWindow = () => {
        if (isReadOnlyThread) return;
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            SetAsFinalFileModel: false
        }));
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (isReadOnlyThread) {
            setSeverity('warning');
            setMessage(readOnlyTooltip);
            setOpenSnackbar(true);
            return;
        }
        const files = e.target.files;
        const file_num = files?.length ?? 0;
        if (file_num <= 3) {
            if (!files) {
                return;
            }
            if (!user || !is_TaiGer_role(user)) {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    file: Array.from(files)
                }));
                return;
            }
            const studentName =
                docModificationThreadPageState.thread.student_id?.firstname ??
                '';
            const checkPromises = Array.from(files).map((file) => {
                const extension = file.name.split('.').pop()?.toLowerCase();

                if (extension === 'pdf') {
                    return readPDF(file, studentName);
                } else if (extension === 'docx') {
                    return readDOCX(file, studentName);
                } else if (extension === 'xlsx') {
                    return readXLSX(file, studentName);
                } else {
                    return Promise.resolve({});
                }
            });
            Promise.all(checkPromises)
                .then((results) => {
                    setCheckResult(results);
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        file: Array.from(files)
                    }));
                })
                .catch((error: unknown) => {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        res_modal_message: String(error ?? ''),
                        res_modal_status: 500
                    }));
                });
        } else {
            setDocModificationThreadPageState((prevState) => ({
                ...prevState,
                res_modal_message: 'You can only select up to 3 files.',
                res_modal_status: 423
            }));
        }
    };

    const ConfirmError = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const submitMessageMutation = useMutation({
        mutationFn: ({
            threadId,
            studentId,
            formData
        }: {
            threadId: string;
            studentId: Parameters<typeof SubmitMessageWithAttachment>[1];
            formData: FormData;
        }) => SubmitMessageWithAttachment(threadId, studentId, formData),
        onMutate: () => {
            setDocModificationThreadPageState((prevState) => ({
                ...prevState,
                buttonDisabled: true,
                in_edit_mode: false
            }));
        },
        onSuccess: (resp) => {
            const { success, data } = resp;
            const status = 200;
            const nextMessages = data?.messages ?? [];

            if (success) {
                // Server returns the full, persisted message list — it replaces
                // the optimistic pending message with the real one.
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    success,
                    file: null,
                    editorState: {},
                    thread: {
                        ...prevState.thread,
                        messages: nextMessages
                    },
                    isLoaded: true,
                    buttonDisabled: false,
                    pendingMessageId: undefined,
                    accordionKeys:
                        nextMessages.length > 0
                            ? [
                                  ...prevState.accordionKeys,
                                  nextMessages.length - 1
                              ]
                            : prevState.accordionKeys,
                    res_modal_status: status,
                    res_modal_message: ''
                }));
            } else {
                const errorText = resp.message ?? 'Submission failed.';
                setSeverity('error');
                setMessage(errorText);
                setOpenSnackbar(true);
                // Roll back the optimistic pending message.
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    thread: {
                        ...prevState.thread,
                        messages: (
                            (prevState.thread.messages as
                                | Array<{ _id: { toString(): string } }>
                                | undefined) ?? []
                        ).filter(
                            (m) =>
                                m._id.toString() !== prevState.pendingMessageId
                        )
                    },
                    pendingMessageId: undefined
                }));
            }
        },
        onError: (error: unknown) => {
            const snackbarText =
                error instanceof Error
                    ? error.message
                    : String(error ?? 'Submission failed.');
            setSeverity('error');
            setMessage(
                snackbarText.trim() !== '' ? snackbarText : 'Submission failed.'
            );
            setOpenSnackbar(true);
            // Roll back the optimistic pending message.
            setDocModificationThreadPageState((prevState) => ({
                ...prevState,
                isLoaded: true,
                error: String(error ?? ''),
                thread: {
                    ...prevState.thread,
                    messages: (
                        (prevState.thread.messages as
                            | Array<{ _id: { toString(): string } }>
                            | undefined) ?? []
                    ).filter(
                        (m) => m._id.toString() !== prevState.pendingMessageId
                    )
                },
                pendingMessageId: undefined
            }));
        },
        onSettled: () => {
            setDocModificationThreadPageState((prevState) => ({
                ...prevState,
                buttonDisabled: false
            }));
        }
    });

    const handleClickSave = async (
        e: MouseEvent<HTMLElement>,
        editorState: unknown
    ) => {
        e.preventDefault();
        if (isReadOnlyThread) {
            setSeverity('warning');
            setMessage(readOnlyTooltip);
            setOpenSnackbar(true);
            // Reject so the editor keeps the text (nothing was sent).
            throw new Error('read-only');
        }
        const message = JSON.stringify(editorState);
        const formData = new FormData();

        const attachedFiles = docModificationThreadPageState.file ?? [];
        if (attachedFiles.length > 0) {
            attachedFiles.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('message', message);

        // Optimistically push the message into the list in a pending (dim +
        // spinner) state so the user sees it immediately; it is replaced by the
        // persisted message on success, or rolled back on failure.
        const pendingId = `pending-${Date.now()}`;
        const optimisticMessage = {
            _id: pendingId,
            message,
            user_id: {
                _id: user?._id?.toString() ?? '',
                firstname: user?.firstname ?? '',
                lastname: user?.lastname ?? '',
                pictureUrl: (user as { pictureUrl?: string })?.pictureUrl
            },
            file: attachedFiles.map((f) => ({ name: f.name, path: '' })),
            createdAt: new Date().toISOString()
        };
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            pendingMessageId: pendingId,
            thread: {
                ...prevState.thread,
                messages: [
                    ...((prevState.thread.messages as unknown[]) ?? []),
                    optimisticMessage
                ]
            }
        }));

        // Await the mutation so the editor can keep the text if the send fails
        // (e.g. 401/403/network). The mutation's own handlers roll back the
        // optimistic pending message; throwing here signals the editor to
        // restore the typed content.
        const resp = await submitMessageMutation.mutateAsync({
            threadId: documentsthreadId ?? '',
            studentId: docModificationThreadPageState.thread.student_id
                ?._id as Parameters<typeof SubmitMessageWithAttachment>[1],
            formData
        });
        if (!resp?.success) {
            throw new Error(resp?.message ?? 'Submission failed.');
        }
    };

    // function generatePDF() {
    //     const doc = new jsPDF();

    //     // Styled text
    //     doc.setFont('times');
    //     // doc.setFontStyle('italic');
    //     doc.setFontSize(16);
    //     doc.text('Styled Text Content', 10, 20);

    //     // Timestamp
    //     const timestamp = new Date().toLocaleString();
    //     doc.setFontSize(12);
    //     doc.text(`Timestamp: ${timestamp}`, 10, 40);

    //     // Signature
    //     doc.setFontSize(14);
    //     doc.text('Signature:', 10, 60);

    //     // Output
    //     doc.save('document.pdf');
    // }

    const handleAsFinalFile = (
        doc_thread_id: unknown,
        student_id: unknown,
        program_id: unknown,
        isFinalVersion: unknown,
        application_id: unknown
    ) => {
        if (isToggleBlocked) {
            setSeverity('warning');
            setMessage(readOnlyTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            doc_thread_id,
            student_id,
            program_id,
            application_id,
            isFinalVersion: Boolean(isFinalVersion),
            SetAsFinalFileModel: true
        }));
    };

    const ConfirmSetAsFinalFileHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (isToggleBlocked) {
            setSeverity('warning');
            setMessage(readOnlyTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmissionLoaded: false // false to reload everything
        }));

        SetFileAsFinal(
            docModificationThreadPageState.doc_thread_id as string,
            docModificationThreadPageState.student_id as string,
            docModificationThreadPageState.application_id as string
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isSubmissionLoaded: true,
                        thread: {
                            ...prevState.thread,
                            isFinalVersion: data.isFinalVersion,
                            updatedAt: data.updatedAt
                        },
                        success: success,
                        SetAsFinalFileModel: false,
                        res_modal_status: status
                    }));
                    setSeverity('success');
                    setMessage(
                        data.isFinalVersion
                            ? 'Thread closed successfully!'
                            : 'Thread opened successfully!'
                    );
                    setOpenSnackbar(true);
                } else {
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        isSubmissionLoaded: true,
                        res_modal_message: String(message ?? ''),
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error ?? ''),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onDeleteSingleMessage = (message_id: string) => {
        // Mark only this message as deleting so its card dims with a spinner,
        // instead of showing a loader over the whole list.
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            deletingMessageId: message_id
        }));
        deleteAMessageInThread(documentsthreadId ?? '', message_id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    // TODO: remove that message
                    const currentMessages =
                        (docModificationThreadPageState.thread
                            .messages as Array<{
                            _id: { toString(): string };
                            [key: string]: unknown;
                        }>) ?? [];
                    const new_messages = [...currentMessages];
                    const idx = currentMessages.findIndex(
                        (message) => message._id.toString() === message_id
                    );
                    if (idx !== -1) {
                        new_messages.splice(idx, 1);
                    }
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        success,
                        deletingMessageId: undefined,
                        thread: {
                            ...docModificationThreadPageState.thread,
                            messages: new_messages
                        },
                        buttonDisabled: false,
                        res_modal_status: status
                    }));
                    setSeverity('success');
                    setMessage('Message deleted successfully!');
                    setOpenSnackbar(true);
                } else {
                    // TODO: what if data is oversize? data type not match?
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        deletingMessageId: undefined,
                        buttonDisabled: false,
                        res_modal_message: String(message ?? ''),
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    deletingMessageId: undefined,
                    error: String(error ?? ''),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    const setEditorModalhide = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            showEditorPage: false
        }));
    };

    const startEditingEditor = () => {
        if (isReadOnlyThread) {
            setSeverity('warning');
            setMessage(readOnlyTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            subpage: 2,
            showEditorPage: true
        }));
    };

    const submitUpdateEssayWriterlist = (
        e: React.SyntheticEvent,
        updateEssayWriterList: Record<string, boolean>,
        essayDocumentThread_id: string
    ) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmitting: true
        }));
        updateEssayWriter(updateEssayWriterList, essayDocumentThread_id).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    const essays_temp = {
                        ...docModificationThreadPageState.thread
                    };
                    essays_temp.outsourced_user_id = (
                        data as Record<string, unknown>
                    ).outsourced_user_id; // data is single student updated
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        isSubmitting: false,
                        thread: essays_temp,
                        success: success,
                        updateEditorList: [],
                        res_modal_status: status
                    }));
                    setEditorModalhide();
                    setSeverity('success');
                    if (thread.file_type === 'Essay') {
                        setMessage('Essay Writer assigned successfully!');
                        setOpenSnackbar(true);
                    } else {
                        setMessage('Editor assigned successfully!');
                        setOpenSnackbar(true);
                    }
                } else {
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: String(message ?? ''),
                        res_modal_status: status
                    }));
                }
            },
            (error: { message?: string }) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
            }
        );
    };

    const handleFavoriteToggle = (id: string) => {
        // Make sure flag_by_user_id is an array

        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread: {
                ...prevState.thread,
                flag_by_user_id: toogleItemInArray(
                    docModificationThreadPageState.thread?.flag_by_user_id ??
                        [],
                    user?._id?.toString() ?? ''
                )
            }
        }));
        putThreadFavorite(id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setSeverity('success');
                    setMessage(
                        isFavorite
                            ? 'Removed from favorite successfully!'
                            : 'Added to favorite successfully!'
                    );
                    setOpenSnackbar(true);
                } else {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    error: String(error ?? ''),
                    res_status: 500
                }));
            }
        );
    };

    const {
        isSubmissionLoaded,
        conflict_list,
        threadAuditLog,
        res_status,
        res_modal_status,
        res_modal_message
    } = docModificationThreadPageState;

    // Only CV, ML RL has instructions and template. (Computed before any return so hooks below run unconditionally.)
    const fileType = thread?.file_type ?? '';
    const template_obj = fileType
        ? templatelist.find(
              ({ prop, alias }) =>
                  prop.includes(fileType.split('_')[0]) ||
                  alias.includes(fileType.split('_')[0])
          )
        : null;
    let docName = '';
    if (thread?.program_id) {
        const { school, degree, program_name } = thread.program_id;
        docName = `${school} - ${degree} - ${program_name} ${fileType}`;
    } else if (fileType) {
        docName = fileType;
    }
    const student_name =
        thread?.student_id != null
            ? `${thread.student_id.firstname ?? ''} ${thread.student_id.lastname ?? ''}`
            : '';
    const isGeneralRL =
        !thread?.program_id &&
        (template_obj?.prop.includes('RL') ||
            template_obj?.alias.includes('Recommendation'));

    const isTaiGerUser = !!user && is_TaiGer_role(user);

    const tabKeys = useMemo(
        () => [
            DOC_THREAD_TAB_KEYS.discussion,
            ...(fileType.includes('CV') ? [DOC_THREAD_TAB_KEYS.cvDetails] : []),
            ...(isTaiGerUser && fileType.includes('CV')
                ? [DOC_THREAD_TAB_KEYS.aiDraft]
                : []),
            ...(isGeneralRL ? [DOC_THREAD_TAB_KEYS.generalRL] : []),
            DOC_THREAD_TAB_KEYS.files,
            ...(isTaiGerUser ? [DOC_THREAD_TAB_KEYS.database] : []),
            DOC_THREAD_TAB_KEYS.audit
        ],
        [isGeneralRL, isTaiGerUser, fileType]
    );

    const tabIndexMap = useMemo(() => {
        const map: Record<string, number> = {};
        tabKeys.forEach((key, index) => {
            map[key] = index;
        });
        return map;
    }, [tabKeys]);

    const tabKeyByIndex = useMemo(() => {
        const map: Record<number, string> = {};
        tabKeys.forEach((key, index) => {
            map[index] = key;
        });
        return map;
    }, [tabKeys]);

    const discussionTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.discussion];
    const aiDraftTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.aiDraft];
    const cvDetailsTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.cvDetails];
    const rlReqTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.generalRL];
    const filesTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.files];
    const databaseTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.database];
    const auditTabIndex = tabIndexMap[DOC_THREAD_TAB_KEYS.audit];

    const resolvedHashKey =
        tabIndexMap[hashKey] !== undefined
            ? hashKey
            : DOC_THREAD_LEGACY_HASH_MAP[hashKey];
    const desiredValueFromHash = tabIndexMap[resolvedHashKey];

    useEffect(() => {
        if (
            typeof desiredValueFromHash === 'number' &&
            desiredValueFromHash !== value
        ) {
            setValue(desiredValueFromHash);
            return;
        }

        const maxIndex = tabKeys.length - 1;
        if (value > maxIndex) {
            setValue(maxIndex);
        }
    }, [desiredValueFromHash, tabKeys.length, value]);

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        const nextHashKey = tabKeyByIndex[newValue];
        if (nextHashKey) {
            window.location.hash = nextHashKey;
        } else {
            window.location.hash = '';
        }
    };

    const isFavorite =
        thread.flag_by_user_id?.includes(user?._id?.toString() ?? '') ?? false;
    TabTitle(`${student_name} ${docName}`);
    return (
        <Box
            sx={
                isAppShell
                    ? {
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          minHeight: 0
                      }
                    : undefined
            }
        >
            {/* TODO */}
            {/* {false ? <button onClick={generatePDF}>Generate PDF</button> : null} */}

            <Box
                sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pr: isTaiGerUser ? 1 : 0
                }}
            >
                <Tabs
                    aria-label="basic tabs example"
                    indicatorColor="primary"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant={isMobile ? 'fullWidth' : 'scrollable'}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: isMobile ? 48 : undefined,
                        '& .MuiTab-root': isMobile
                            ? { minHeight: 48, minWidth: 0, p: 1 }
                            : undefined
                    }}
                >
                    <Tab
                        aria-label={t('discussion-thread', { ns: 'common' })}
                        icon={<ChatIcon />}
                        label={
                            isMobile
                                ? undefined
                                : t('discussion-thread', { ns: 'common' })
                        }
                        {...a11yProps(value, discussionTabIndex)}
                        sx={{
                            fontWeight:
                                value === discussionTabIndex ? 'bold' : 'normal' // Bold for selected tab
                        }}
                    />
                    {fileType.includes('CV') ? (
                        <Tab
                            aria-label={t('cvDetailsTab', { ns: 'cvmlrl' })}
                            icon={<EditNoteIcon />}
                            label={
                                isMobile
                                    ? undefined
                                    : t('cvDetailsTab', { ns: 'cvmlrl' })
                            }
                            {...a11yProps(value, cvDetailsTabIndex)}
                            sx={{
                                fontWeight:
                                    value === cvDetailsTabIndex
                                        ? 'bold'
                                        : 'normal'
                            }}
                        />
                    ) : null}
                    {isTaiGerUser && fileType.includes('CV') ? (
                        <Tab
                            aria-label={t('aiDraftTab', { ns: 'cvmlrl' })}
                            icon={<AutoAwesomeIcon />}
                            label={
                                isMobile
                                    ? undefined
                                    : t('aiDraftTab', { ns: 'cvmlrl' })
                            }
                            {...a11yProps(value, aiDraftTabIndex)}
                            sx={{
                                fontWeight:
                                    value === aiDraftTabIndex
                                        ? 'bold'
                                        : 'normal'
                            }}
                        />
                    ) : null}
                    {isGeneralRL ? (
                        <Tab
                            aria-label={t('Requirements', {
                                ns: 'translation'
                            })}
                            icon={<InfoOutlinedIcon />}
                            label={
                                isMobile
                                    ? undefined
                                    : t('Requirements', {
                                          ns: 'translation'
                                      })
                            }
                            {...a11yProps(value, rlReqTabIndex)}
                            sx={{
                                fontWeight:
                                    value === rlReqTabIndex ? 'bold' : 'normal'
                            }}
                        />
                    ) : null}
                    <Tab
                        aria-label={t('files', { ns: 'common' })}
                        icon={<FolderIcon />}
                        label={
                            isMobile ? undefined : t('files', { ns: 'common' })
                        }
                        {...a11yProps(value, filesTabIndex)}
                        sx={{
                            fontWeight:
                                value === filesTabIndex ? 'bold' : 'normal' // Bold for selected tab
                        }}
                    />
                    {isTaiGerUser ? (
                        <Tab
                            aria-label={`${t('Database', { ns: 'common' })} (${Array.isArray(similarThreads) ? similarThreads.length : 0})`}
                            icon={<LibraryBooksIcon />}
                            label={
                                isMobile
                                    ? undefined
                                    : `${t('Database', { ns: 'common' })} (${Array.isArray(similarThreads) ? similarThreads.length : 0})`
                            }
                            {...a11yProps(value, databaseTabIndex)}
                            sx={{
                                fontWeight:
                                    value === databaseTabIndex
                                        ? 'bold'
                                        : 'normal' // Bold for selected tab
                            }}
                        />
                    ) : null}
                    <Tab
                        aria-label={t('Audit', { ns: 'common' })}
                        icon={<HistoryIcon />}
                        label={
                            isMobile ? undefined : t('Audit', { ns: 'common' })
                        }
                        {...a11yProps(value, auditTabIndex)}
                        sx={{
                            fontWeight:
                                value === auditTabIndex ? 'bold' : 'normal' // Bold for selected tab
                        }}
                    />
                </Tabs>
                {isTaiGerUser ? (
                    <ThreadFinalToggleButton
                        compact={isMobile}
                        isFinalVersion={Boolean(thread.isFinalVersion)}
                        isLocked={isLocked}
                        isSubmissionLoaded={isSubmissionLoaded}
                        isToggleBlocked={isToggleBlocked}
                        isWithdraw={isWithdrawThread}
                        lockTooltip={lockTooltip}
                        onToggle={() =>
                            handleAsFinalFile(
                                thread._id,
                                thread.student_id?._id,
                                thread.program_id,
                                thread.isFinalVersion,
                                thread.application_id
                            )
                        }
                    />
                ) : null}
            </Box>
            <Box
                sx={
                    isAppShell
                        ? {
                              flex: 1,
                              minHeight: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden'
                          }
                        : undefined
                }
            >
                <CustomTabPanel
                    fillHeight={isAppShell}
                    index={discussionTabIndex}
                    value={value}
                >
                    <InformationBlock
                        agents={
                            docModificationThreadPageState.agents as IUserWithId[]
                        }
                        conflict_list={
                            conflict_list as Array<{
                                _id: { toString: () => string };
                                firstname?: string;
                                lastname?: string;
                            }>
                        }
                        deadline={
                            (docModificationThreadPageState.deadline as string) ??
                            ''
                        }
                        documentsthreadId={documentsthreadId ?? ''}
                        editors={
                            docModificationThreadPageState.editors as IUserWithId[]
                        }
                        handleFavoriteToggle={handleFavoriteToggle}
                        isFavorite={isFavorite}
                        isGeneralRL={isGeneralRL ?? false}
                        isWithdraw={isWithdrawThread}
                        startEditingEditor={startEditingEditor}
                        template_obj={template_obj as ITemplateWithId | null}
                        thread={
                            docModificationThreadPageState.thread as unknown as IDocumentthreadPopulated
                        }
                        user={user as IUserWithId}
                        fillHeight={isAppShell}
                        detailsOpen={detailsOpen}
                        onCloseDetails={onCloseDetails}
                        composer={
                            <DiscussionEditorCard
                                buttonDisabled={
                                    docModificationThreadPageState.buttonDisabled
                                }
                                checkResult={checkResult}
                                editorState={
                                    docModificationThreadPageState.editorState as unknown as OutputData
                                }
                                file={docModificationThreadPageState.file}
                                handleClickSave={handleClickSave}
                                isLocked={isLocked}
                                isReadOnlyThread={isReadOnlyThread}
                                isWithdraw={isWithdrawThread}
                                lockTooltip={lockTooltip}
                                onFileChange={onFileChange}
                                thread={thread as DiscussionEditorCardThread}
                                user={
                                    user as unknown as DiscussionEditorCardUser
                                }
                            />
                        }
                    >
                        <MessageList
                            apiPrefix="/api/document-threads"
                            autoLoadOnScrollUp
                            deletingMessageId={
                                docModificationThreadPageState.deletingMessageId
                            }
                            documentsthreadId={documentsthreadId ?? ''}
                            isLoaded={docModificationThreadPageState.isLoaded}
                            onDeleteSingleMessage={onDeleteSingleMessage}
                            pendingMessageId={
                                docModificationThreadPageState.pendingMessageId
                            }
                            thread={thread as unknown as MessageThread}
                        />
                    </InformationBlock>
                </CustomTabPanel>
                {isGeneralRL ? (
                    <CustomTabPanel
                        fillHeight={isAppShell}
                        index={rlReqTabIndex}
                        value={value}
                    >
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            <GeneralRLRequirementsTab
                                studentId={
                                    thread?.student_id?._id?.toString() ?? ''
                                }
                            />
                        </Box>
                    </CustomTabPanel>
                ) : null}
                <CustomTabPanel
                    fillHeight={isAppShell}
                    index={filesTabIndex}
                    value={value}
                >
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography sx={{ mb: 1 }} variant="h6">
                                {t('Files Overview', { ns: 'common' })}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{ mb: 2 }}
                                variant="body2"
                            >
                                {t(
                                    'All files shared in this thread are listed below.',
                                    { ns: 'common' }
                                )}
                            </Typography>
                        </Box>
                        <FilesList
                            thread={thread as unknown as DocumentThreadResponse}
                        />
                    </Box>
                </CustomTabPanel>
                {isTaiGerUser ? (
                    <CustomTabPanel
                        fillHeight={isAppShell}
                        index={databaseTabIndex}
                        value={value}
                    >
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            <SimilarThreadsTab
                                similarThreads={
                                    similarThreads as SimilarThread[]
                                }
                                t={t}
                            />
                        </Box>
                    </CustomTabPanel>
                ) : null}
                <CustomTabPanel
                    fillHeight={isAppShell}
                    index={auditTabIndex}
                    value={value}
                >
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <Audit audit={threadAuditLog as IAuditWithId[]} />
                    </Box>
                </CustomTabPanel>
                {fileType.includes('CV') ? (
                    <CustomTabPanel
                        fillHeight={isAppShell}
                        index={cvDetailsTabIndex}
                        value={value}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                p: 2
                            }}
                        >
                            <PassportPhotoCard
                                studentId={
                                    thread?.student_id?._id?.toString() ?? ''
                                }
                            />
                            <AdditionalInformationCard
                                threadId={thread?._id?.toString() ?? ''}
                                initialValue={
                                    (
                                        thread as {
                                            additional_information?: string;
                                        }
                                    ).additional_information ?? ''
                                }
                            />
                            <CVProfileForm
                                studentId={
                                    thread?.student_id?._id?.toString() ?? ''
                                }
                            />
                        </Box>
                    </CustomTabPanel>
                ) : null}
                {isTaiGerUser && fileType.includes('CV') ? (
                    <CustomTabPanel
                        fillHeight={isAppShell}
                        index={aiDraftTabIndex}
                        value={value}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                p: 2
                            }}
                        >
                            <CVDraftGenerator
                                studentId={
                                    thread?.student_id?._id?.toString() ?? ''
                                }
                                fileType={fileType}
                                programId={
                                    thread?.program_id?._id
                                        ? String(thread.program_id._id)
                                        : undefined
                                }
                                degree={thread?.program_id?.degree}
                                programFullName={docName}
                                documentsthreadId={thread?._id?.toString()}
                                isFinalVersion={Boolean(thread?.isFinalVersion)}
                                onNavigateToCvDetails={() => {
                                    setValue(cvDetailsTabIndex);
                                    window.location.hash =
                                        DOC_THREAD_TAB_KEYS.cvDetails;
                                }}
                            />
                        </Box>
                    </CustomTabPanel>
                ) : null}
            </Box>

            <DocumentCheckingResultModal
                docName={docName}
                file_type={thread.file_type ?? ''}
                isFinalVersion={thread.isFinalVersion ?? false}
                isSubmissionLoaded={
                    docModificationThreadPageState.isSubmissionLoaded
                }
                onClose={closeSetAsFinalFileModelWindow}
                onConfirm={() =>
                    ConfirmSetAsFinalFileHandler({
                        preventDefault: () => {}
                    } as React.FormEvent)
                }
                open={docModificationThreadPageState.SetAsFinalFileModel}
                student_name={student_name}
                thread_id={String(thread._id ?? '')}
                title={t('Warning', { ns: 'common' })}
            />
            {isTaiGerUser && docModificationThreadPageState.showEditorPage ? (
                <EditEssayWritersSubpage
                    actor={
                        [FILE_TYPE_E.essay_required].includes(
                            thread.file_type ?? ''
                        )
                            ? 'Essay Writer'
                            : 'Editor'
                    }
                    essayDocumentThread={
                        thread as unknown as EssayDocumentThreadForWriters
                    }
                    isSubmitting={docModificationThreadPageState.isSubmitting}
                    onHide={setEditorModalhide}
                    show={docModificationThreadPageState.showEditorPage}
                    submitUpdateEssayWriterlist={submitUpdateEssayWriterlist}
                />
            ) : null}
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
        </Box>
    );
};

export default DocModificationThreadPage;
