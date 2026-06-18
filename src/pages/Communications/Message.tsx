import React, { useEffect, useState } from 'react';
import {
    Button,
    Avatar,
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
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { is_TaiGer_AdminAgent, is_TaiGer_Student } from '@taiger-common/core';
import type { IUser } from '@taiger-common/core';
import { FileIcon, defaultStyles } from 'react-file-icon';
import type { OutputData } from '@editorjs/editorjs';

import EditorSimple from '@components/EditorJs/EditorSimple';
import { stringAvatar, convertDate } from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import { IgnoreMessageV2, BASE_URL, queryClient } from '@/api';
import FilePreview from '@components/FilePreview/FilePreview';
import { appConfig } from '../../config';
import { useMutation } from '@tanstack/react-query';
import { useSnackBar } from '@contexts/use-snack-bar';
import type {
    MessageUser,
    ThreadMessage
} from '@components/Message/MessageCard';

/**
 * Parse a message payload string into EditorJS OutputData synchronously, so a
 * message renders fully on its first paint — no per-message loading flash when
 * older messages mount during scroll-up auto-load.
 */
const parseMessageToEditorState = (messageStr?: string): OutputData => {
    if (messageStr && messageStr !== '{}') {
        try {
            return JSON.parse(messageStr) as OutputData;
        } catch {
            return { time: Date.now(), blocks: [] };
        }
    }
    return { time: Date.now(), blocks: [] };
};

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
    message,
    onEditMode,
    isDeleting,
    path,
    isLoaded,
    onDeleteSingleMessage,
    handleClickSave
}: MessageProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [messageState, setMessageState] = useState<MessageState>(() => ({
        editorState: parseMessageToEditorState(message?.message),
        message_id: '',
        isLoaded,
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
    }));
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
            message: (message.message ?? '') as unknown as Record<
                string,
                unknown
            >,
            ignoreMessageState: ignoreMessageState
        });
    };

    const firstname = message.user_id ? message.user_id.firstname : 'Staff';
    const lastname = message.user_id
        ? message.user_id.lastname
        : appConfig.companyName;
    // A message is "own" (right-aligned) when authored by the logged-in user.
    const isOwn = message.user_id
        ? message.user_id._id.toString() === user?._id?.toString()
        : false;
    const editable = isOwn;
    const full_name = `${firstname} ${lastname}`;

    const showReadReceipts =
        user && is_TaiGer_AdminAgent(user as unknown as IUser);
    const readers =
        message?.readBy?.filter(
            (usr) =>
                (message.student_id?._id?.toString() !==
                    message.user_id?._id?.toString() &&
                    usr._id?.toString() !== user?._id?.toString()) ||
                (message.student_id?._id?.toString() ===
                    message.user_id?._id?.toString() &&
                    usr._id?.toString() !== message.student_id?._id.toString())
        ) ?? [];
    const showIgnoreToggle =
        user &&
        !is_TaiGer_Student(user as unknown as IUser) &&
        message.user_id &&
        is_TaiGer_Student(message.user_id as unknown as IUser);

    return (
        <>
            <Box
                id={`communication-message-${message._id.toString()}`}
                sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1.25,
                    px: { xs: 0.5, md: 1 },
                    scrollMarginTop: '80px',
                    // Reveal the hover actions when the row is hovered (desktop).
                    '&:hover .message-actions': { opacity: 1 }
                }}
            >
                {!isOwn ? (
                    <Avatar
                        {...stringAvatar(full_name)}
                        src={message.user_id?.pictureUrl}
                        sx={{
                            ...stringAvatar(full_name).sx,
                            width: 32,
                            height: 32,
                            mt: 0.5
                        }}
                    />
                ) : null}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                        maxWidth: ismobile ? '85%' : '78%',
                        minWidth: 0
                    }}
                >
                    {/* Sender + timestamp + (own) edit/delete actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            gap: 0.75,
                            mb: 0.25,
                            color: 'text.secondary'
                        }}
                    >
                        <Typography sx={{ fontWeight: 600 }} variant="caption">
                            {full_name}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                            {convertDate(message.createdAt ?? new Date())}
                        </Typography>
                        {editable ? (
                            <IconButton
                                aria-label="message actions"
                                className="message-actions"
                                onClick={(e) => setMenuAnchor(e.currentTarget)}
                                size="small"
                                sx={{
                                    // Hidden until row hover on desktop; always
                                    // visible on touch devices (no hover).
                                    opacity: { xs: 1, md: 0 },
                                    transition: 'opacity 0.15s'
                                }}
                            >
                                <MoreVertIcon fontSize="inherit" />
                            </IconButton>
                        ) : null}
                    </Box>

                    {/* Bubble */}
                    <Box
                        sx={{
                            bgcolor: isOwn
                                ? alpha(theme.palette.primary.main, 0.12)
                                : theme.palette.action.hover,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            borderTopRightRadius: isOwn ? 4 : 16,
                            borderTopLeftRadius: isOwn ? 16 : 4,
                            px: 1.5,
                            py: 0.5,
                            width: 'fit-content',
                            maxWidth: '100%',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
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
                            <Card
                                key={i}
                                sx={{ p: 1, mt: 0.5 }}
                                variant="outlined"
                            >
                                <Typography
                                    onClick={() => {
                                        // Fetch by the (opaque) storage key —
                                        // the last segment of file.path — and
                                        // pass the friendly name for the
                                        // download filename. Legacy files store
                                        // the friendly name as the key segment,
                                        // so this works for both.
                                        const storageName =
                                            (file.path ?? '')
                                                .split('/')
                                                .pop() || file.name;
                                        handleClick(
                                            `/api/communications/${message?.student_id?._id.toString()}/chat/${storageName}?name=${encodeURIComponent(
                                                file.name
                                            )}`,
                                            file.name
                                        );
                                    }}
                                    sx={{
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: 0.5,
                                        textDecoration: 'underline'
                                    }}
                                >
                                    <Box
                                        component="svg"
                                        sx={{ width: 20, height: 20 }}
                                        viewBox="0 0 24 24"
                                    >
                                        <FileIcon
                                            extension={file.name
                                                .split('.')
                                                .pop()}
                                            {...(defaultStyles[
                                                file.name
                                                    .split('.')
                                                    .pop() as string
                                            ] ?? {})}
                                        />
                                    </Box>
                                    {file.name}
                                    <FileDownloadIcon fontSize="small" />
                                </Typography>
                            </Card>
                        ))}
                    </Box>

                    {/* Footer: read receipts + ignore toggle */}
                    {(showReadReceipts && readers.length > 0) ||
                    showIgnoreToggle ? (
                        <Box
                            alignItems="center"
                            display="flex"
                            gap={1}
                            sx={{ mt: 0.25 }}
                        >
                            {showReadReceipts && readers.length > 0 ? (
                                <AvatarGroup>
                                    {readers.map((usr) => (
                                        <Tooltip
                                            key={usr._id?.toString()}
                                            title={`Read by ${usr?.firstname} ${usr?.lastname} at ${convertDate(
                                                message.timeStampReadBy?.[
                                                    usr._id?.toString()
                                                ] ?? new Date()
                                            )}`}
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
                                                    width: 14,
                                                    height: 14,
                                                    fontSize: 8
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                            ) : null}
                            {showIgnoreToggle ? (
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={0.5}
                                >
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
                                                width: 14,
                                                height: 14,
                                                fontSize: 8
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
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="caption">
                                                    {t('no need to reply', {
                                                        ns: 'common',
                                                        defaultValue:
                                                            'no need to reply'
                                                    })}
                                                </Typography>
                                            }
                                            labelPlacement="start"
                                            sx={{ mr: 0 }}
                                        />
                                    </FormGroup>
                                </Stack>
                            ) : null}
                        </Box>
                    ) : null}
                </Box>
            </Box>
            {/* Hover "more" menu for the message author's own messages. */}
            <Menu
                anchorEl={menuAnchor}
                onClose={() => setMenuAnchor(null)}
                open={Boolean(menuAnchor)}
            >
                <MenuItem
                    onClick={() => {
                        setMenuAnchor(null);
                        onEditMode();
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('Edit', { ns: 'common' })}</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={(e) => {
                        setMenuAnchor(null);
                        onOpendeleteMessageModalShow(
                            e,
                            message._id.toString(),
                            String(message.createdAt ?? '')
                        );
                    }}
                >
                    <ListItemIcon>
                        <DeleteOutlineIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('Delete', { ns: 'common' })}</ListItemText>
                </MenuItem>
            </Menu>
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
