import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
    type MouseEvent,
    type RefObject
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Typography, Box, Tabs, Tab } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { is_TaiGer_role } from '@taiger-common/core';

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
import { useAuth } from '@components/AuthProvider';
import EditEssayWritersSubpage from '@pages/Dashboard/MainViewTab/StudDocsOverview/EditEssayWritersSubpage';
import type { EssayDocumentThreadForWriters } from '@pages/Dashboard/MainViewTab/StudDocsOverview/EditUserListSubpage';
import MessageList, { type MessageThread } from '@components/Message/MessageList';
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
}

const DocModificationThreadPage = ({
    agents,
    conflictList,
    deadline,
    editors,
    threadProps,
    similarThreads,
    scrollableRef,
    threadauditLog
}: DocModificationThreadPageProps) => {
    const { user } = useAuth();
    const { documentsthreadId } = useParams();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const [docModificationThreadPageState, setDocModificationThreadPageState] =
        useState<{
            error: string;
            file: File[] | null;
            threadAuditLog: unknown;
            showEditorPage: boolean;
            isSubmissionLoaded: boolean;
            isLoaded: boolean;
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
    const isReadOnlyThread = isLocked || isThreadClosed;
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
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            SetAsFinalFileModel: false
        }));
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (isLocked) {
            setSeverity('warning');
            setMessage(lockTooltip);
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

    const handleClickSave = (
        e: MouseEvent<HTMLElement>,
        editorState: unknown
    ) => {
        e.preventDefault();
        if (isLocked) {
            setSeverity('warning');
            setMessage(lockTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            buttonDisabled: true
        }));
        const message = JSON.stringify(editorState);
        const formData = new FormData();

        if (docModificationThreadPageState.file) {
            docModificationThreadPageState.file.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('message', message);

        SubmitMessageWithAttachment(
            documentsthreadId ?? '',
            docModificationThreadPageState.thread.student_id?._id,
            formData
        ).then(
            (resp) => {
                const { success, data } = resp;
                const status = 200;
                const nextMessages = data?.messages ?? [];

                if (success) {
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
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        buttonDisabled: false,
                        res_modal_message: resp.message ?? 'Submission failed.',
                        res_modal_status: 400
                    }));
                }
            },
            (error: unknown) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
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
        doc_thread_id: string | { toString(): string } | undefined,
        student_id: unknown,
        program_id: DocModificationThreadPageThread['program_id'],
        isFinalVersion: boolean,
        application_id: unknown
    ) => {
        if (isLocked) {
            setSeverity('warning');
            setMessage(lockTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            doc_thread_id,
            student_id,
            program_id,
            application_id,
            isFinalVersion,
            SetAsFinalFileModel: true
        }));
    };

    const ConfirmSetAsFinalFileHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) {
            setSeverity('warning');
            setMessage(lockTooltip);
            setOpenSnackbar(true);
            return;
        }
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmissionLoaded: false // false to reload everything
        }));

        SetFileAsFinal(
            docModificationThreadPageState.doc_thread_id as string,
            docModificationThreadPageState.student_id,
            docModificationThreadPageState.application_id
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
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        deleteAMessageInThread(documentsthreadId ?? '', message_id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    // TODO: remove that message
                    const currentMessages =
                        (docModificationThreadPageState.thread.messages as Array<{
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
                        isLoaded: true,
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
                        isLoaded: true,
                        buttonDisabled: false,
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
                    essays_temp.outsourced_user_id = (data as Record<string, unknown>).outsourced_user_id; // data is single student updated
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
                    docModificationThreadPageState.thread?.flag_by_user_id ?? [],
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
            ...(isGeneralRL ? [DOC_THREAD_TAB_KEYS.generalRL] : []),
            DOC_THREAD_TAB_KEYS.files,
            ...(isTaiGerUser ? [DOC_THREAD_TAB_KEYS.database] : []),
            DOC_THREAD_TAB_KEYS.audit
        ],
        [isGeneralRL, isTaiGerUser]
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

    const isFavorite = thread.flag_by_user_id?.includes(user?._id?.toString() ?? '') ?? false;
    TabTitle(`${student_name} ${docName}`);
    return (
        <Box>
            {/* TODO */}
            {/* {false ? <button onClick={generatePDF}>Generate PDF</button> : null} */}

            <Tabs
                aria-label="basic tabs example"
                indicatorColor="primary"
                onChange={handleChange}
                scrollButtons="auto"
                value={value}
                variant="scrollable"
            >
                <Tab
                    icon={<ChatIcon />}
                    label={t('discussion-thread', { ns: 'common' })}
                    {...a11yProps(value, discussionTabIndex)}
                    sx={{
                        fontWeight:
                            value === discussionTabIndex ? 'bold' : 'normal' // Bold for selected tab
                    }}
                />
                {isGeneralRL ? (
                    <Tab
                        icon={<InfoOutlinedIcon />}
                        label={t('Requirements', {
                            ns: 'translation'
                        })}
                        {...a11yProps(value, rlReqTabIndex)}
                        sx={{
                            fontWeight:
                                value === rlReqTabIndex ? 'bold' : 'normal'
                        }}
                    />
                ) : null}
                <Tab
                    icon={<FolderIcon />}
                    label={t('files', { ns: 'common' })}
                    {...a11yProps(value, filesTabIndex)}
                    sx={{
                        fontWeight: value === filesTabIndex ? 'bold' : 'normal' // Bold for selected tab
                    }}
                />
                {isTaiGerUser ? (
                    <Tab
                        icon={<LibraryBooksIcon />}
                        label={`${t('Database', { ns: 'common' })} (${Array.isArray(similarThreads) ? similarThreads.length : 0})`}
                        {...a11yProps(value, databaseTabIndex)}
                        sx={{
                            fontWeight:
                                value === databaseTabIndex ? 'bold' : 'normal' // Bold for selected tab
                        }}
                    />
                ) : null}
                <Tab
                    icon={<HistoryIcon />}
                    label={t('Audit', { ns: 'common' })}
                    {...a11yProps(value, auditTabIndex)}
                    sx={{
                        fontWeight: value === auditTabIndex ? 'bold' : 'normal' // Bold for selected tab
                    }}
                />
            </Tabs>
            <CustomTabPanel index={discussionTabIndex} value={value}>
                <InformationBlock
                    agents={docModificationThreadPageState.agents as IUserWithId[]}
                    conflict_list={conflict_list as Array<{ _id: { toString: () => string }; firstname?: string; lastname?: string }>}
                    deadline={(docModificationThreadPageState.deadline as string) ?? ''}
                    documentsthreadId={documentsthreadId ?? ''}
                    editors={docModificationThreadPageState.editors as IUserWithId[]}
                    handleFavoriteToggle={handleFavoriteToggle}
                    isFavorite={isFavorite}
                    isGeneralRL={isGeneralRL ?? false}
                    startEditingEditor={startEditingEditor}
                    template_obj={template_obj as ITemplateWithId | null}
                    thread={docModificationThreadPageState.thread as unknown as IDocumentthreadPopulated}
                    user={user as IUserWithId}
                >
                    <MessageList
                        apiPrefix="/api/document-threads"
                        documentsthreadId={documentsthreadId ?? ''}
                        isLoaded={docModificationThreadPageState.isLoaded}
                        onDeleteSingleMessage={onDeleteSingleMessage}
                        thread={thread as unknown as MessageThread}
                    />
                    <DiscussionEditorCard
                        buttonDisabled={
                            docModificationThreadPageState.buttonDisabled
                        }
                        checkResult={checkResult}
                        editorState={docModificationThreadPageState.editorState as OutputData}
                        file={docModificationThreadPageState.file}
                        handleAsFinalFile={handleAsFinalFile}
                        handleClickSave={handleClickSave}
                        isLocked={isLocked}
                        isReadOnlyThread={isReadOnlyThread}
                        isSubmissionLoaded={isSubmissionLoaded}
                        lockTooltip={lockTooltip}
                        onFileChange={onFileChange}
                        t={t}
                        thread={thread as DiscussionEditorCardThread}
                        user={user as unknown as DiscussionEditorCardUser}
                    />
                </InformationBlock>
            </CustomTabPanel>
            {isGeneralRL ? (
                <CustomTabPanel index={rlReqTabIndex} value={value}>
                    <GeneralRLRequirementsTab
                        studentId={thread?.student_id?._id}
                    />
                </CustomTabPanel>
            ) : null}
            <CustomTabPanel index={filesTabIndex} value={value}>
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
                <FilesList thread={thread as unknown as DocumentThreadResponse} />
            </CustomTabPanel>
            {isTaiGerUser ? (
                <CustomTabPanel index={databaseTabIndex} value={value}>
                    <SimilarThreadsTab
                        similarThreads={similarThreads as SimilarThread[]}
                        t={t}
                    />
                </CustomTabPanel>
            ) : null}
            <CustomTabPanel index={auditTabIndex} value={value}>
                <Audit audit={threadAuditLog as IAuditWithId[]} />
            </CustomTabPanel>

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
            {isTaiGerUser &&
            docModificationThreadPageState.showEditorPage ? (
                <EditEssayWritersSubpage
                    actor={
                        [FILE_TYPE_E.essay_required].includes(thread.file_type ?? '')
                            ? 'Essay Writer'
                            : 'Editor'
                    }
                    essayDocumentThread={thread as unknown as EssayDocumentThreadForWriters}
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
