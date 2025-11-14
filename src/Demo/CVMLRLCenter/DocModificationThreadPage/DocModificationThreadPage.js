import React, { useEffect, useMemo, useState } from 'react';
import { Link as LinkDom, useLocation, useParams } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HelpIcon from '@mui/icons-material/Help';
import {
    Typography,
    Button,
    Card,
    Link,
    Box,
    CircularProgress,
    useTheme,
    Avatar,
    Stack,
    Tabs,
    Tab,
    Chip
} from '@mui/material';
import { pdfjs } from 'react-pdf';
import { is_TaiGer_role } from '@taiger-common/core';

import DocThreadEditor from '../../../components/Message/DocThreadEditor';
import ErrorPage from '../../Utils/ErrorPage';
import ModalMain from '../../Utils/ModalHandler/ModalMain';
import {
    stringAvatar,
    templatelist,
    THREAD_TABS
} from '../../../utils/contants';
import {
    FILE_TYPE_E,
    readDOCX,
    readPDF,
    readXLSX,
    toogleItemInArray
} from '../../Utils/checking-functions';
import {
    SubmitMessageWithAttachment,
    deleteAMessageInThread,
    SetFileAsFinal,
    updateEssayWriter,
    putThreadFavorite
} from '../../../api';
import { TabTitle } from '../../Utils/TabTitle';
import DEMO from '../../../store/constant';
import FilesList from './FilesList';
import { useAuth } from '../../../components/AuthProvider';
import EditEssayWritersSubpage from '../../Dashboard/MainViewTab/StudDocsOverview/EditEssayWritersSubpage';
import MessageList from '../../../components/Message/MessageList';
import DocumentCheckingResultModal from './DocumentCheckingResultModal';
import { a11yProps, CustomTabPanel } from '../../../components/Tabs';
import Audit from '../../Audit';
import { useTranslation } from 'react-i18next';
import { useSnackBar } from '../../../contexts/use-snack-bar';
import GeneralRLRequirementsTab from './DocumentThreadsPage/GeneralRLRequirementsTab';
import InformationBlock from './components/InformationBlock';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const DocModificationThreadPage = ({
    agents,
    conflictList,
    deadline,
    editors,
    threadProps,
    similarThreads,
    scrollableRef,
    threadauditLog
}) => {
    const { user } = useAuth();
    const theme = useTheme();
    const { documentsthreadId } = useParams();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { t } = useTranslation();
    const [docModificationThreadPageState, setDocModificationThreadPageState] =
        useState({
            error: '',
            file: null,
            threadAuditLog: threadauditLog,
            showEditorPage: false,
            isSubmissionLoaded: true,
            isLoaded: true,
            thread: threadProps,
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
    const [checkResult, setCheckResult] = useState([]);
    const { hash } = useLocation();
    const hashKey = hash?.replace('#', '') || '';
    const [value, setValue] = useState(THREAD_TABS[hashKey] ?? 0);
    useEffect(() => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread: threadProps
        }));
    }, [documentsthreadId]);
    useEffect(() => {
        if (scrollableRef?.current) {
            setTimeout(() => {
                scrollableRef.current.scrollTo({
                    top: scrollableRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, []);

    const closeSetAsFinalFileModelWindow = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            SetAsFinalFileModel: false
        }));
    };

    const onFileChange = (e) => {
        e.preventDefault();
        const file_num = e.target.files.length;
        if (file_num <= 3) {
            if (!e.target.files) {
                return;
            }
            if (!is_TaiGer_role(user)) {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    file: Array.from(e.target.files)
                }));
                return;
            }
            // Ensure a file is selected
            // TODO: make array
            const checkPromises = Array.from(e.target.files).map((file) => {
                const extension = file.name.split('.').pop().toLowerCase();
                const studentName =
                    docModificationThreadPageState.thread.student_id.firstname;

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
                        file: Array.from(e.target.files)
                    }));
                })
                .catch((error) => {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        res_modal_message: error,
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

    const handleClickSave = (e, editorState) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            buttonDisabled: true
        }));
        var message = JSON.stringify(editorState);
        const formData = new FormData();

        if (docModificationThreadPageState.file) {
            docModificationThreadPageState.file.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('message', message);

        SubmitMessageWithAttachment(
            documentsthreadId,
            docModificationThreadPageState.thread.student_id._id,
            formData
        ).then(
            (resp) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        success,
                        file: null,
                        editorState: {},
                        thread: {
                            ...docModificationThreadPageState.thread,
                            messages: data?.messages
                        },
                        isLoaded: true,
                        buttonDisabled: false,
                        accordionKeys: [
                            ...docModificationThreadPageState.accordionKeys,
                            data.messages.length - 1
                        ],
                        res_modal_status: status
                    }));
                } else {
                    // TODO: what if data is oversize? data type not match?
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        buttonDisabled: false,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
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
        doc_thread_id,
        student_id,
        program_id,
        isFinalVersion,
        application_id
    ) => {
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

    const ConfirmSetAsFinalFileHandler = (e) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmissionLoaded: false // false to reload everything
        }));

        SetFileAsFinal(
            docModificationThreadPageState.doc_thread_id,
            docModificationThreadPageState.student_id,
            docModificationThreadPageState.application_id
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
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
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onDeleteSingleMessage = (e, message_id) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        deleteAMessageInThread(documentsthreadId, message_id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    // TODO: remove that message
                    var new_messages = [
                        ...docModificationThreadPageState.thread.messages
                    ];
                    let idx =
                        docModificationThreadPageState.thread.messages.findIndex(
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
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
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
        e,
        updateEssayWriterList,
        essayDocumentThread_id
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
                if (success) {
                    let essays_temp = {
                        ...docModificationThreadPageState.thread
                    };
                    essays_temp.outsourced_user_id = data.outsourced_user_id; // data is single student updated
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
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
            }
        );
    };

    const handleFavoriteToggle = (id) => {
        // Make sure flag_by_user_id is an array

        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread: {
                ...prevState.thread,
                flag_by_user_id: toogleItemInArray(
                    docModificationThreadPageState.thread?.flag_by_user_id,
                    user._id.toString()
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
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    error,
                    res_status: 500
                }));
            }
        );
    };

    const {
        isSubmissionLoaded,
        conflict_list,
        threadAuditLog,
        thread,
        res_status,
        res_modal_status,
        res_modal_message
    } = docModificationThreadPageState;

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    // Only CV, ML RL has instructions and template.
    let template_obj = templatelist.find(
        ({ prop, alias }) =>
            prop.includes(thread.file_type.split('_')[0]) ||
            alias.includes(thread.file_type.split('_')[0])
    );
    let docName;
    const student_name = `${thread.student_id.firstname} ${thread.student_id.lastname}`;
    const isGeneralRL =
        !thread.program_id &
        (template_obj?.prop.includes('RL') ||
            template_obj?.alias.includes('Recommendation'));

    if (thread.program_id) {
        const { school, degree, program_name } = thread.program_id;
        docName = `${school} - ${degree} - ${program_name} ${thread.file_type}`;
    } else {
        docName = thread.file_type;
    }

    const isTaiGerUser = is_TaiGer_role(user);

    const TAB_KEYS = {
        discussion: 'communication',
        generalRL: 'general-rl',
        files: 'files',
        database: 'database',
        audit: 'audit'
    };

    const legacyHashKeyMap = {
        communication: TAB_KEYS.discussion,
        history: TAB_KEYS.files,
        audit: TAB_KEYS.audit
    };

    const tabKeys = useMemo(() => {
        const keys = [TAB_KEYS.discussion];
        if (isGeneralRL) {
            keys.push(TAB_KEYS.generalRL);
        }
        keys.push(TAB_KEYS.files);
        if (isTaiGerUser) {
            keys.push(TAB_KEYS.database);
        }
        keys.push(TAB_KEYS.audit);
        return keys;
    }, [isGeneralRL, isTaiGerUser]);

    const tabIndexMap = useMemo(() => {
        const map = {};
        tabKeys.forEach((key, index) => {
            map[key] = index;
        });
        return map;
    }, [tabKeys]);

    const tabKeyByIndex = useMemo(() => {
        const map = {};
        tabKeys.forEach((key, index) => {
            map[index] = key;
        });
        return map;
    }, [tabKeys]);

    const discussionTabIndex = tabIndexMap[TAB_KEYS.discussion];
    const rlReqTabIndex = tabIndexMap[TAB_KEYS.generalRL];
    const filesTabIndex = tabIndexMap[TAB_KEYS.files];
    const databaseTabIndex = tabIndexMap[TAB_KEYS.database];
    const auditTabIndex = tabIndexMap[TAB_KEYS.audit];

    const resolvedHashKey =
        tabIndexMap[hashKey] !== undefined
            ? hashKey
            : legacyHashKeyMap[hashKey];
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

    const handleChange = (event, newValue) => {
        setValue(newValue);
        const nextHashKey = tabKeyByIndex[newValue];
        if (nextHashKey) {
            window.location.hash = nextHashKey;
        } else {
            window.location.hash = '';
        }
    };

    const isFavorite = thread.flag_by_user_id?.includes(user._id.toString());
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
                        label={`${t('Database', { ns: 'common' })} (${similarThreads?.length || 0})`}
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
                    agents={docModificationThreadPageState.agents}
                    conflict_list={conflict_list}
                    deadline={docModificationThreadPageState.deadline}
                    documentsthreadId={documentsthreadId}
                    editors={docModificationThreadPageState.editors}
                    handleFavoriteToggle={handleFavoriteToggle}
                    isFavorite={isFavorite}
                    isGeneralRL={isGeneralRL}
                    startEditingEditor={startEditingEditor}
                    template_obj={template_obj}
                    thread={docModificationThreadPageState.thread}
                    user={user}
                >
                    <MessageList
                        accordionKeys={
                            docModificationThreadPageState.accordionKeys
                        }
                        apiPrefix="/api/document-threads"
                        documentsthreadId={documentsthreadId}
                        isLoaded={docModificationThreadPageState.isLoaded}
                        onDeleteSingleMessage={onDeleteSingleMessage}
                        thread={thread}
                        user={user}
                    />
                    {user.archiv !== true ? (
                        <Card
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[1],
                                overflow: 'hidden',
                                mt: 1,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    boxShadow: theme.shadows[3],
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            {thread.isFinalVersion ? (
                                <Box
                                    sx={{
                                        p: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <CheckCircleIcon
                                        color="success"
                                        sx={{ fontSize: 48, mb: 1 }}
                                    />
                                    <Typography
                                        color="text.secondary"
                                        variant="body1"
                                    >
                                        {t('thread-close')}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                            color: theme.palette.primary
                                                .contrastText,
                                            p: 1.5
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1.5}
                                        >
                                            <Avatar
                                                {...stringAvatar(
                                                    `${user.firstname} ${user.lastname}`
                                                )}
                                                src={user?.pictureUrl}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    border: '2px solid white'
                                                }}
                                            />
                                            <Box>
                                                <Typography
                                                    fontWeight="600"
                                                    variant="body2"
                                                >
                                                    {user.firstname}{' '}
                                                    {user.lastname}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        opacity: 0.9
                                                    }}
                                                    variant="caption"
                                                >
                                                    Write a reply
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Editor Content */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        <DocThreadEditor
                                            buttonDisabled={
                                                docModificationThreadPageState.buttonDisabled
                                            }
                                            checkResult={checkResult}
                                            doc_title="docModificationThreadPageState.doc_title"
                                            editorState={
                                                docModificationThreadPageState.editorState
                                            }
                                            file={
                                                docModificationThreadPageState.file
                                            }
                                            handleClickSave={handleClickSave}
                                            onFileChange={onFileChange}
                                            thread={thread}
                                        />
                                    </Box>
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                mt: 2,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: 'grey.50'
                            }}
                        >
                            <CancelOutlinedIcon
                                color="disabled"
                                sx={{ fontSize: 48, mb: 1 }}
                            />
                            <Typography color="text.secondary" variant="body1">
                                Your service is finished. Therefore, you are in
                                read-only mode.
                            </Typography>
                        </Card>
                    )}
                    {is_TaiGer_role(user) ? (
                        !thread.isFinalVersion ? (
                            <Button
                                color="success"
                                fullWidth
                                onClick={() =>
                                    handleAsFinalFile(
                                        thread._id,
                                        thread.student_id._id,
                                        thread.program_id,
                                        thread.isFinalVersion,
                                        thread.application_id
                                    )
                                }
                                sx={{ mt: 2 }}
                                variant="contained"
                            >
                                {isSubmissionLoaded ? (
                                    t('Mark as finished')
                                ) : (
                                    <CircularProgress />
                                )}
                            </Button>
                        ) : (
                            <Button
                                color="secondary"
                                fullWidth
                                onClick={() =>
                                    handleAsFinalFile(
                                        thread._id,
                                        thread.student_id._id,
                                        thread.program_id,
                                        thread.isFinalVersion,
                                        thread.application_id
                                    )
                                }
                                sx={{ mt: 2 }}
                                variant="outlined"
                            >
                                {isSubmissionLoaded ? (
                                    t('Mark as open')
                                ) : (
                                    <CircularProgress />
                                )}
                            </Button>
                        )
                    ) : null}
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
                <FilesList thread={thread} />
            </CustomTabPanel>
            {isTaiGerUser ? (
                <CustomTabPanel index={databaseTabIndex} value={value}>
                    {similarThreads && similarThreads?.length > 0 ? (
                        <Stack spacing={1.5} sx={{ mx: 2 }}>
                            {similarThreads.map((t) => (
                                <Card
                                    key={t._id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Link
                                        component={LinkDom}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            flex: 1,
                                            textDecoration: 'none'
                                        }}
                                        target="_blank"
                                        to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                            t._id
                                        )}
                                    >
                                        <ArticleIcon
                                            sx={{ color: 'primary.main' }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                fontWeight="bold"
                                                variant="subtitle1"
                                            >
                                                {`${t.student_id?.firstname} ${t.student_id?.lastname}`}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {`${t.application_id?.application_year} - ${t.file_type}`}
                                            </Typography>
                                        </Box>
                                    </Link>
                                    {t.application_id?.admission === 'O' ? (
                                        <Chip
                                            color="success"
                                            icon={
                                                <CheckCircleIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Admitted"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    ) : t.application_id?.admission === 'X' ? (
                                        <Chip
                                            color="error"
                                            icon={
                                                <CancelOutlinedIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Rejected"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            color="default"
                                            icon={
                                                <HelpIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Pending"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Typography sx={{ m: 2 }} variant="text.secondary">
                            {t('No similar threads found', {
                                ns: 'common'
                            })}
                        </Typography>
                    )}
                </CustomTabPanel>
            ) : null}
            <CustomTabPanel index={auditTabIndex} value={value}>
                <Audit audit={threadAuditLog} />
            </CustomTabPanel>

            <DocumentCheckingResultModal
                docName={docName}
                file_type={thread.file_type}
                isFinalVersion={thread.isFinalVersion}
                isSubmissionLoaded={
                    docModificationThreadPageState.isSubmissionLoaded
                }
                onClose={closeSetAsFinalFileModelWindow}
                onConfirm={(e) => ConfirmSetAsFinalFileHandler(e)}
                open={docModificationThreadPageState.SetAsFinalFileModel}
                student_name={student_name}
                thread_id={thread._id}
                title={t('Warning', { ns: 'common' })}
            />
            {is_TaiGer_role(user) &&
            docModificationThreadPageState.showEditorPage ? (
                <EditEssayWritersSubpage
                    actor={
                        [FILE_TYPE_E.essay_required].includes(thread.file_type)
                            ? 'Essay Writer'
                            : 'Editor'
                    }
                    editors={docModificationThreadPageState.editors}
                    essayDocumentThread={thread}
                    isSubmitting={docModificationThreadPageState.isSubmitting}
                    onHide={setEditorModalhide}
                    setmodalhide={setEditorModalhide}
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
