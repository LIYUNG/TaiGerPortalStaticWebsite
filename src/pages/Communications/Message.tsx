import React, { useEffect, useState } from 'react';
import {
    Button,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    useTheme,
    useMediaQuery,
    FormGroup,
    FormControlLabel,
    Checkbox,
    IconButton,
    Card,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography,
    CircularProgress,
    AvatarGroup,
    Stack,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { is_TaiGer_AdminAgent, is_TaiGer_Student } from '@taiger-common/core';
import type { IUser } from '@taiger-common/core';
import { FileIcon, defaultStyles } from 'react-file-icon';
import type { OutputData } from '@editorjs/editorjs';

import EditorSimple from '@components/EditorJs/EditorSimple';
import { stringAvatar, convertDate } from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { IgnoreMessageV2, BASE_URL, queryClient } from '@/api';
import FilePreview from '@components/FilePreview/FilePreview';
import { appConfig } from '../../config';
import { useMutation } from '@tanstack/react-query';
import { useSnackBar } from '@contexts/use-snack-bar';
import type {
    MessageUser,
    ThreadMessage
} from '@components/Message/MessageCard';

export interface MessageProps {
    idx: number;
    accordionKeys: number[];
    message: ThreadMessage & {
        ignoredMessageBy?: MessageUser;
        ignoredMessageUpdatedAt?: unknown;
        files?: Array<{ name: string; path: string }>;
        student_id?: MessageUser;
        readBy?: MessageUser[];
        timeStampReadBy?: Record<string, string>;
    };
    onEditMode: () => void;
    isDeleting: boolean;
    path: string;
    isTaiGerView: boolean;
    isLoaded: boolean;
    onDeleteSingleMessage: (messageId: string) => void;
    handleClickSave?: (
        e: React.MouseEvent,
        editorState: { time?: number; blocks?: unknown[] }
    ) => void;
}

interface MessageState {
    editorState: OutputData | null;
    message_id: string;
    isLoaded: boolean;
    filePath: string;
    fileName: string;
    createdAt: string;
    previewModalShow: boolean;
    deleteMessageModalShow: boolean;
    ignoredMessageBy: MessageUser | undefined;
    ignoredMessageUpdatedAt: string | Date | number | unknown;
    ignore_message: boolean;
}

const Message = ({
    idx,
    accordionKeys,
    message,
    onEditMode,
    isDeleting,
    path,
    isTaiGerView,
    isLoaded,
    onDeleteSingleMessage,
    handleClickSave
}: MessageProps) => {
    // const onlyWidth = useWindowWidth();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [messageState, setMessageState] = useState<MessageState>({
        editorState: null,
        message_id: '',
        isLoaded: false,
        filePath: '',
        fileName: '',
        createdAt: '',
        previewModalShow: false,
        deleteMessageModalShow: false,
        ignoredMessageBy: message?.ignoredMessageBy,
        ignoredMessageUpdatedAt: message?.ignoredMessageUpdatedAt,
        ignore_message:
            message?.ignore_message === false ||
            message?.ignore_message === undefined
                ? false
                : message?.ignore_message
    });
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const { mutate } = useMutation({
        mutationFn: IgnoreMessageV2,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['communications', 'my']
            });
        }
    });
    useEffect(() => {
        let initialEditorState: OutputData | null = null;
        if (message.message && message.message !== '{}') {
            try {
                initialEditorState = JSON.parse(message.message) as OutputData;
            } catch {
                initialEditorState = { time: Date.now(), blocks: [] };
            }
        } else {
            initialEditorState = { time: Date.now(), blocks: [] };
        }
        queueMicrotask(() => {
            setMessageState((prevState) => ({
                ...prevState,
                editorState: initialEditorState,
                isLoaded: isLoaded,
                deleteMessageModalShow: false
            }));
        });
    }, [message.message, isLoaded]);

    const onOpendeleteMessageModalShow = (
        _e: React.MouseEvent<HTMLElement>,
        message_id: string,
        createdAt: string
    ) => {
        setMessageState((prevState) => ({
            ...prevState,
            message_id,
            deleteMessageModalShow: true,
            createdAt
        }));
    };

    const onHidedeleteMessageModalShow = () => {
        setMessageState((prevState) => ({
            ...prevState,
            message_id: '',
            createdAt: '',
            deleteMessageModalShow: false
        }));
    };

    const onDeleteSingleMessageHandler = () => {
        setMessageState((prevState) => ({
            ...prevState,
            deleteMessageModalShow: false
        }));
        onDeleteSingleMessage(messageState.message_id);
    };

    const closePreviewWindow = () => {
        setMessageState((prevState) => ({
            ...prevState,
            previewModalShow: false
        }));
    };

    const handleClick = (filePath: string, fileName: string) => {
        setMessageState((prevState) => ({
            ...prevState,
            filePath,
            fileName,
            previewModalShow: true
        }));
    };

    const handleCheckboxChange = async () => {
        const ignoreMessageState = !messageState.ignore_message;
        setMessageState((prevState) => ({
            ...prevState,
            ignore_message: ignoreMessageState,
            ignoredMessageBy: user as unknown as MessageUser,
            ignoredMessageUpdatedAt: new Date()
        }));
        mutate({
            student_id: message.student_id?._id?.toString() ?? '',
            communication_messageId: message._id,
            message: (message.message ?? '') as unknown as Record<string, unknown>,
            ignoreMessageState: ignoreMessageState
        });
    };

    if (!messageState.isLoaded && !messageState.editorState) {
        return <Loading />;
    }
    const firstname = message.user_id ? message.user_id.firstname : 'Staff';
    const lastname = message.user_id
        ? message.user_id.lastname
        : appConfig.companyName;
    const editable = message.user_id
        ? message.user_id._id.toString() === user?._id?.toString()
            ? true
            : false
        : false;
    const full_name = `${firstname} ${lastname}`;

    return (
        <>
            <Accordion
                defaultExpanded={accordionKeys[idx] === idx}
                disableGutters
                sx={{
                    borderRadius: 2,
                    overflowWrap: 'break-word', // Add this line
                    ...(isTaiGerView &&
                        !ismobile && {
                            width: '100%', // Make Drawer full width on small screens
                            maxWidth: '100vw'
                        }),
                    marginTop: '1px',
                    '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1
                    }
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Avatar
                        {...stringAvatar(full_name)}
                        src={message.user_id?.pictureUrl}
                    />
                    <Box style={{ marginLeft: '10px', flex: 1 }}>
                        <b style={{ cursor: 'pointer' }}>{full_name}</b>
                        <span style={{ display: 'flex', float: 'right' }}>
                            {convertDate(message.createdAt ?? new Date())}
                            {editable ? (
                                <>
                                    <IconButton onClick={() => onEditMode()}>
                                        <EditIcon
                                            fontSize="small"
                                            style={{ cursor: 'pointer' }}
                                            title="Edit this message"
                                        />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={(e) =>
                                            onOpendeleteMessageModalShow(
                                                e,
                                                message._id.toString(),
                                                String(message.createdAt ?? '')
                                            )
                                        }
                                    >
                                        <CloseIcon
                                            fontSize="small"
                                            style={{ cursor: 'pointer' }}
                                            title="Delete this message and file"
                                        />
                                    </IconButton>
                                </>
                            ) : null}
                        </span>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        sx={{
                            overflowWrap: 'break-word', // Ensures long words wrap
                            wordBreak: 'break-word', // Breaks the word to avoid overflow
                            maxWidth: '100%', // Ensures content does not exceed parent width
                            flex: 1 // Makes Box flexible within its container
                        }}
                    >
                        <EditorSimple
                            defaultHeight={0}
                            editorState={messageState.editorState ?? undefined}
                            handleClickSave={handleClickSave}
                            holder={`${message._id.toString()}`}
                            imageEnable={false}
                            readOnly={true}
                        />
                        {message?.files?.map((file, i) => (
                            <Card key={i} sx={{ p: 1 }}>
                                <span>
                                    <Typography
                                        onClick={() =>
                                            handleClick(
                                                `/api/communications/${message?.student_id?._id.toString()}/chat/${
                                                    file.name
                                                }`,
                                                file.name
                                            )
                                        }
                                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        <svg
                                            className="mx-2"
                                            fill="none"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <FileIcon
                                                extension={file.name
                                                    .split('.')
                                                    .pop()}
                                                {...(defaultStyles[
                                                    file.name.split('.').pop() as string
                                                ] ?? {})}
                                            />
                                        </svg>
                                        {file.name}
                                        <svg
                                            fill="none"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="m7 10 4.86 4.86c.08.08.2.08.28 0L17 10"
                                                stroke="#000"
                                                strokeLinecap="round"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    </Typography>
                                </span>
                            </Card>
                        ))}
                    </Box>
                    <Box
                        alignItems="center"
                        display="flex"
                        justifyContent="space-between"
                    >
                        {user && is_TaiGer_AdminAgent(user as unknown as IUser) ? (
                            <AvatarGroup>
                                {message?.readBy
                                    ?.filter(
                                        (usr) =>
                                            (message.student_id?._id?.toString() !==
                                                message.user_id?._id?.toString() &&
                                                usr._id?.toString() !==
                                                    user?._id?.toString()) ||
                                            (message.student_id?._id?.toString() ===
                                                message.user_id?._id?.toString() &&
                                                usr._id?.toString() !==
                                                    message.student_id?._id.toString())
                                    )
                                    .map((usr) => (
                                        <Tooltip
                                            key={usr._id?.toString()}
                                            title={`Read by ${usr?.firstname} ${usr?.lastname} at ${convertDate(message.timeStampReadBy?.[usr._id?.toString()] ?? new Date())}`}
                                        >
                                            <Avatar
                                                {...stringAvatar(
                                                    `${usr?.firstname} ${usr?.lastname}`
                                                )}

                                                src={usr?.pictureUrl}
                                                sx={{
                                                    ...stringAvatar(
                                                        `${usr?.firstname} ${usr?.lastname}`
                                                    ).sx,
                                                    width: 8,
                                                    height: 8 // Override the size
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                            </AvatarGroup>
                        ) : null}
                        <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="flex-end"
                        >
                            {user && !is_TaiGer_Student(user as unknown as IUser) &&
                            message.user_id && is_TaiGer_Student(message.user_id as unknown as IUser) ? (
                                <>
                                    {messageState.ignore_message ? (
                                        <Avatar
                                            key={user?._id?.toString()}
                                            {...stringAvatar(
                                                `${messageState.ignoredMessageBy?.firstname} ${messageState.ignoredMessageBy?.lastname}`
                                            )}
                                            src={
                                                messageState.ignoredMessageBy
                                                    ?.pictureUrl
                                            }
                                            sx={{
                                                ...stringAvatar(
                                                    `${messageState.ignoredMessageBy?.firstname} ${messageState.ignoredMessageBy?.lastname}`
                                                ).sx,
                                                width: 8,
                                                height: 8 // Override the size
                                            }}
                                            title={`Ignored by ${messageState.ignoredMessageBy?.firstname} ${messageState.ignoredMessageBy?.lastname} at ${convertDate((messageState.ignoredMessageUpdatedAt as string | Date | number) ?? new Date())}`}
                                        />
                                    ) : null}
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={
                                                        messageState.ignore_message
                                                    }
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                            }
                                            label="no need to reply"
                                            labelPlacement="start"
                                        />
                                    </FormGroup>
                                </>
                            ) : null}
                        </Stack>
                    </Box>
                </AccordionDetails>
            </Accordion>
            {/* TODOL consider to move it to the parent! It render many time! as message increase */}
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={onHidedeleteMessageModalShow}
                open={messageState.deleteMessageModalShow}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you wan to delete this message on{' '}
                        {convertDate(messageState.createdAt)}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isDeleting}
                        onClick={onDeleteSingleMessageHandler}
                        variant="contained"
                    >
                        {isDeleting
                            ? t('Pending', { ns: 'common' })
                            : t('Delete', { ns: 'common' })}
                    </Button>
                    <Button
                        onClick={onHidedeleteMessageModalShow}
                        variant="outlined"
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                aria-labelledby="contained-modal-title-vcenter2"
                fullWidth={true}
                maxWidth="xl"
                onClose={closePreviewWindow}
                open={messageState.previewModalShow}
            >
                <DialogTitle>{messageState.filePath}</DialogTitle>
                <FilePreview
                    apiFilePath={messageState.filePath}
                    path={messageState.fileName}
                />
                <DialogContent>
                    {path && path.split('.')[1] !== 'pdf' ? (
                        <a
                            download
                            href={`${BASE_URL}}${messageState.filePath}`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Button
                                color="primary"
                                size="small"
                                startIcon={<FileDownloadIcon />}
                                title="Download"
                                variant="contained"
                            >
                                {t('Download', { ns: 'common' })}
                            </Button>
                        </a>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closePreviewWindow}
                        size="small"
                        variant="outlined"
                    >
                        {!messageState.isLoaded ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Close', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Message;
