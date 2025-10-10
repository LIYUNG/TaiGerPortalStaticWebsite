import React, { useEffect, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    IconButton,
    Typography,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Card,
    Stack,
    Chip,
    useTheme
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { FileIcon, defaultStyles } from 'react-file-icon';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { is_TaiGer_Student } from '@taiger-common/core';
import i18next from 'i18next';

import { BASE_URL } from '../../../src/api/request';
import EditorSimple from '../EditorJs/EditorSimple';
import { stringAvatar, convertDate } from '../../utils/contants';
import { useAuth } from '../AuthProvider';
import Loading from '../Loading/Loading';
import { IgnoreMessageThread } from '../../../src/api/index';
import { useSnackBar } from '../../contexts/use-snack-bar';

const MessageCard = (props) => {
    const { user } = useAuth();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [messageState, setMessageState] = useState({
        editorState: null,
        ConvertedContent: '',
        message_id: '',
        isLoaded: false,
        deleteMessageModalShow: false,
        ignore_message:
            props.message.ignore_message === false ||
            props.message.ignore_message === undefined
                ? false
                : props.message.ignore_message
    });
    useEffect(() => {
        var initialEditorState = null;
        if (props.message.message && props.message.message !== '{}') {
            try {
                initialEditorState = JSON.parse(props.message.message);
            } catch (e) {
                initialEditorState = { time: new Date(), blocks: [] };
            }
        } else {
            initialEditorState = { time: new Date(), blocks: [] };
        }
        setMessageState((prevState) => ({
            ...prevState,
            editorState: initialEditorState,
            ConvertedContent: initialEditorState,
            isLoaded: props.isLoaded,
            deleteMessageModalShow: false
        }));
    }, [props.message.message, props.isLoaded]);

    const onOpendeleteMessageModalShow = (e, message_id, createdAt) => {
        e.stopPropagation();
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

    const onDeleteSingleMessage = (e) => {
        e.preventDefault();
        setMessageState((prevState) => ({
            ...prevState,
            deleteMessageModalShow: false
        }));
        props.onDeleteSingleMessage(e, messageState.message_id);
    };

    const handleCheckboxChange = async () => {
        const ignore_message = !messageState.ignore_message;
        setMessageState((prevState) => {
            return {
                ...prevState,
                ignore_message: ignore_message
            };
        });
        const documentThreadId = props.documentsthreadId;
        const messageId = props.message._id;
        const message = props.message;
        const resp = await IgnoreMessageThread(
            documentThreadId,
            messageId,
            message.message,
            ignore_message
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
    };

    if (!messageState.isLoaded && !messageState.editorState) {
        return <Loading />;
    }
    let firstname = props.message.user_id
        ? props.message.user_id.firstname
        : 'Staff';
    let lastname = props.message.user_id
        ? props.message.user_id.lastname
        : 'TaiGer';
    const editable = props.message.user_id
        ? props.message.user_id._id.toString() === user._id.toString()
            ? true
            : false
        : false;
    const full_name = `${firstname} ${lastname}`;
    const apiFilePath = (apiPrefix, key_path) => {
        return `${BASE_URL}${apiPrefix}/${key_path}`;
    };
    const theme = useTheme();
    const files_info = props.message.file.map((file, i) => (
        <Chip
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
                        extension={file.name.split('.').pop()}
                        {...defaultStyles[file.name.split('.').pop()]}
                    />
                </Box>
            }
            clickable
            component={LinkDom}
            icon={<AttachFileIcon />}
            key={i}
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
            to={apiFilePath(props.apiPrefix, file.path.replace(/\\/g, '/'))}
            variant="outlined"
        />
    ));

    const isCurrentUser =
        props.message.user_id?._id.toString() === user._id.toString();

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
                                {...stringAvatar(full_name)}
                                src={props.message.user_id?.pictureUrl}
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
                                        {full_name}
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
                                    {convertDate(props.message.createdAt)}
                                </Typography>
                            </Box>
                            {editable && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpendeleteMessageModalShow(
                                            e,
                                            props.message._id.toString(),
                                            props.message.createdAt
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
                        {/* Message Content */}
                        <Box
                            sx={{
                                pl: { xs: 0, sm: 6 },
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}
                        >
                            <EditorSimple
                                defaultHeight={0}
                                editorState={messageState.editorState}
                                handleClickSave={props.handleClickSave}
                                holder={`${props.message._id.toString()}`}
                                imageEnable={true}
                                readOnly={true}
                            />

                            {/* File Attachments */}
                            {files_info.length > 0 && (
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
                                            Attachments ({files_info.length})
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        flexWrap="wrap"
                                        gap={1}
                                    >
                                        {files_info}
                                    </Stack>
                                </Box>
                            )}

                            {/* Ignore Message Checkbox */}
                            {!is_TaiGer_Student(user) &&
                                is_TaiGer_Student(props.message.user_id) && (
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
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={onHidedeleteMessageModalShow}
                open={messageState.deleteMessageModalShow}
            >
                <DialogTitle>
                    {i18next.t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you wan to delete this message on{' '}
                        <b>{convertDate(messageState.createdAt)}?</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={!props.isLoaded}
                        onClick={onDeleteSingleMessage}
                        variant="contained"
                    >
                        {props.isLoaded
                            ? i18next.t('Delete', { ns: 'common' })
                            : i18next.t('Pending', { ns: 'common' })}
                    </Button>
                    <Button
                        onClick={onHidedeleteMessageModalShow}
                        variant="outlined"
                    >
                        {i18next.t('Cancel', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MessageCard;
