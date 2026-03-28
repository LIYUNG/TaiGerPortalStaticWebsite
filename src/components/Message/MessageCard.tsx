import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type MouseEvent
} from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Chip,
    Card,
    FormControlLabel,
    Checkbox,
    IconButton,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { ConfirmDialog } from '@components/ConfirmDialog';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { is_TaiGer_Student } from '@taiger-common/core';
import i18next from 'i18next';

import { BASE_URL, IgnoreMessageThread } from '@/api';
import EditorSimple from '../EditorJs/EditorSimple';
import { stringAvatar, convertDate } from '@utils/contants';
import { useAuth } from '../AuthProvider';
import Loading from '../Loading/Loading';
import { useSnackBar } from '@contexts/use-snack-bar';
import type { OutputData } from '@editorjs/editorjs';

/** Parse message payload string into EditorJS OutputData, or empty state. */
function parseMessageToEditorState(
    messageStr: string | undefined
): OutputData | null {
    if (!messageStr || messageStr === '{}') {
        return { time: Date.now(), blocks: [] };
    }
    try {
        return JSON.parse(messageStr) as OutputData;
    } catch {
        return { time: Date.now(), blocks: [] };
    }
}

function buildFileUrl(apiPrefix: string, keyPath: string): string {
    return `${BASE_URL}${apiPrefix}/${keyPath.replace(/\\/g, '/')}`;
}

export interface MessageUser {
    _id: string;
    firstname?: string;
    lastname?: string;
    pictureUrl?: string;
}

export interface MessageFile {
    name: string;
    path: string;
}

export interface ThreadMessage {
    _id: string;
    message?: string;
    user_id?: MessageUser;
    file?: MessageFile[];
    createdAt?: string | Date;
    ignore_message?: boolean;
}

export interface MessageCardState {
    editorState: OutputData | null;
    messageId: string;
    isLoaded: boolean;
    deleteModalOpen: boolean;
    ignore_message: boolean;
    createdAt?: string | Date;
}

export interface MessageCardProps {
    message: ThreadMessage;
    isLoaded: boolean;
    documentsthreadId: string;
    apiPrefix: string;
    onDeleteSingleMessage: (messageId: string) => void;
    handleClickSave?: (
        e: MouseEvent,
        editorState: { time?: number; blocks?: unknown[] }
    ) => void;
}

const DEFAULT_IGNORE = false;

const MessageCard = (props: MessageCardProps) => {
    const {
        message,
        isLoaded,
        documentsthreadId,
        apiPrefix,
        onDeleteSingleMessage
    } = props;
    const { user } = useAuth();
    const theme = useTheme();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [messageState, setMessageState] = useState<MessageCardState>(() => ({
        editorState: null,
        messageId: '',
        isLoaded: false,
        deleteModalOpen: false,
        ignore_message:
            props.message.ignore_message === false ||
            props.message.ignore_message === undefined
                ? DEFAULT_IGNORE
                : Boolean(props.message.ignore_message)
    }));

    useEffect(() => {
        const editorState = parseMessageToEditorState(message.message);
        setMessageState((prev) => ({
            ...prev,
            editorState,
            isLoaded,
            deleteModalOpen: false
        }));
    }, [message.message, isLoaded]);

    const onOpenDeleteModal = useCallback(
        (e: MouseEvent, messageId: string, createdAt: string | Date) => {
            e.stopPropagation();
            setMessageState((prev) => ({
                ...prev,
                messageId,
                deleteModalOpen: true,
                createdAt
            }));
        },
        []
    );

    const onCloseDeleteModal = useCallback(() => {
        setMessageState((prev) => ({
            ...prev,
            messageId: '',
            createdAt: undefined,
            deleteModalOpen: false
        }));
    }, []);

    /** ConfirmDialog calls onConfirm with no event; parent still expects (e, id) and may call e.preventDefault(). */
    const handleConfirmDeleteFromDialog = useCallback(() => {
        setMessageState((prev) => ({ ...prev, deleteModalOpen: false }));
        onDeleteSingleMessage(messageState.messageId);
    }, [messageState.messageId, onDeleteSingleMessage]);

    const handleCheckboxChange = useCallback(async () => {
        const nextIgnore = !messageState.ignore_message;
        setMessageState((prev) => ({ ...prev, ignore_message: nextIgnore }));
        const resp = await IgnoreMessageThread(
            documentsthreadId,
            String(message._id),
            { message: message.message ?? '' },
            nextIgnore
        );
        if (resp.data?.success) {
            setSeverity('success');
            setMessage('Message ignore status updated successfully');
            setOpenSnackbar(true);
        } else {
            setSeverity('error');
            setMessage('An error occurred. Please try again.');
            setOpenSnackbar(true);
        }
    }, [
        documentsthreadId,
        message._id,
        message.message,
        messageState.ignore_message,
        setMessage,
        setOpenSnackbar,
        setSeverity
    ]);

    const fullName = useMemo(() => {
        const first = message.user_id?.firstname ?? 'Staff';
        const last = message.user_id?.lastname ?? 'TaiGer';
        return `${first} ${last}`;
    }, [message.user_id?.firstname, message.user_id?.lastname]);

    const isCurrentUser = useMemo(
        () => message.user_id?._id?.toString() === user?._id?.toString(),
        [message.user_id?._id, user?._id]
    );

    const editable = useMemo(
        () => message.user_id?._id?.toString() === user?._id?.toString(),
        [message.user_id?._id, user?._id]
    );

    const fileChips = useMemo(() => {
        const files = message.file ?? [];
        return files.map((file, i) => (
            <Chip
                key={`${file.name}-${i}`}
                avatar={
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FileIcon
                            extension={file.name.split('.').pop() ?? ''}
                            {...(defaultStyles as Record<string, object>)[
                                file.name.split('.').pop() ?? ''
                            ]}
                        />
                    </Box>
                }
                clickable
                component={LinkDom}
                label={file.name}
                size="small"
                sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }
                }}
                target="_blank"
                to={buildFileUrl(apiPrefix, file.path)}
                variant="outlined"
            />
        ));
    }, [message.file, apiPrefix]);

    if (!messageState.isLoaded && !messageState.editorState) {
        return <Loading />;
    }

    return (
        <>
            <Card
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[1],
                    overflow: 'visible',
                    transition: 'all 0.2s',
                    '&:hover': {
                        boxShadow: theme.shadows[2],
                        borderColor: theme.palette.primary.light
                    }
                }}
            >
                <Accordion
                    defaultExpanded={true}
                    disableGutters
                    elevation={0}
                    sx={{
                        '&:before': { display: 'none' },
                        bgcolor: 'transparent'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            px: 2,
                            py: 1.5,
                            minHeight: 'auto',
                            '&.Mui-expanded': {
                                minHeight: 'auto'
                            },
                            '& .MuiAccordionSummary-content': {
                                my: 1,
                                alignItems: 'center'
                            }
                        }}
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1.5}
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            <Avatar
                                {...stringAvatar(fullName)}
                                src={message.user_id?.pictureUrl}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    border: `2px solid ${isCurrentUser ? theme.palette.primary.main : theme.palette.grey[300]}`
                                }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1}
                                >
                                    <Typography
                                        fontWeight="600"
                                        noWrap
                                        variant="body2"
                                    >
                                        {fullName}
                                    </Typography>
                                    {isCurrentUser && (
                                        <Chip
                                            label="You"
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.65rem',
                                                fontWeight: 600
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                >
                                    {convertDate(message.createdAt ?? '')}
                                </Typography>
                            </Box>
                            {editable && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenDeleteModal(
                                            e,
                                            message._id.toString(),
                                            (message.createdAt ?? '') as string
                                        );
                                    }}
                                    size="small"
                                    sx={{
                                        color: 'error.main',
                                        '&:hover': {
                                            bgcolor: 'error.lighter'
                                        }
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, py: 2, pt: 0 }}>
                        <Box
                            sx={{
                                pl: { xs: 0, sm: 6 },
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}
                        >
                            <EditorSimple
                                defaultHeight={0}
                                editorState={
                                    messageState.editorState ?? undefined
                                }
                                holder={`${message._id.toString()}`}
                                imageEnable={true}
                                readOnly={true}
                            />

                            {fileChips.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={0.5}
                                        sx={{ mb: 1 }}
                                    >
                                        <AttachFileIcon
                                            color="action"
                                            sx={{ fontSize: 16 }}
                                        />
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            Attachments ({fileChips.length})
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        gap={1}
                                    >
                                        {fileChips}
                                    </Stack>
                                </Box>
                            )}

                            {user &&
                                message.user_id &&
                                !is_TaiGer_Student(
                                    user as Parameters<
                                        typeof is_TaiGer_Student
                                    >[0]
                                ) &&
                                is_TaiGer_Student(
                                    message.user_id as Parameters<
                                        typeof is_TaiGer_Student
                                    >[0]
                                ) && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            pt: 2,
                                            borderTop: `1px solid ${theme.palette.divider}`
                                        }}
                                    >
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
                                                <Typography
                                                    color="text.secondary"
                                                    variant="caption"
                                                >
                                                    No need to reply
                                                </Typography>
                                            }
                                            labelPlacement="end"
                                        />
                                    </Box>
                                )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Card>
            <ConfirmDialog
                open={messageState.deleteModalOpen}
                onClose={onCloseDeleteModal}
                title={i18next.t('Warning', { ns: 'common' })}
                content={
                    <>
                        Do you want to delete this message on{' '}
                        <b>{convertDate(messageState.createdAt ?? '')}?</b>
                    </>
                }
                variant="confirm"
                confirmLabel={
                    isLoaded
                        ? i18next.t('Delete', { ns: 'common' })
                        : i18next.t('Pending', { ns: 'common' })
                }
                cancelLabel={i18next.t('Cancel', { ns: 'common' })}
                onConfirm={handleConfirmDeleteFromDialog}
                confirmDisabled={!isLoaded}
            />
        </>
    );
};

export default MessageCard;
