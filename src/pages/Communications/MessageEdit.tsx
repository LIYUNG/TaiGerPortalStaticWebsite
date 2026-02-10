import React, { useState } from 'react';
import {
    Button,
    Tooltip,
    AccordionDetails,
    AccordionSummary,
    Typography,
    IconButton,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Dialog,
    DialogActions
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { Accordion, Avatar } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import EditorSimple from '@components/EditorJs/EditorSimple';
import { stringAvatar, convertDate } from '@utils/contants';
import Loading from '@components/Loading/Loading';
import type { MouseEvent } from 'react';

export interface MessageEditProps {
    editorState: unknown;
    onDeleteSingleMessage: (e: MouseEvent<HTMLElement>, message_id: string) => void;
    isTaiGerView?: boolean;
    idx: string | number;
    full_name: string;
    message: { _id: string | { toString: () => string }; createdAt?: string; user_id?: { pictureUrl?: string } };
    editable?: boolean;
    buttonDisabled?: boolean;
    handleClickSave: (e: MouseEvent<HTMLElement>, editorState: unknown, message_id: string) => void;
    handleCancelEdit: (e: MouseEvent<HTMLElement>) => void;
    isDeleting?: boolean;
}

const MessageEdit = (props: MessageEditProps) => {
    const { t } = useTranslation();
    const [messageEditState, setMessageEditState] = useState<{
        editorState: unknown;
        message_id: string;
        deleteMessageModalShow: boolean;
        createdAt?: string;
    }>({
        editorState: null,
        message_id: '',
        deleteMessageModalShow: false
    });

    const onOpendeleteMessageModalShow = (
        _e: React.MouseEvent<HTMLElement>,
        message_id: string,
        createdAt: string
    ) => {
        setMessageEditState((prevState) => ({
            ...prevState,
            message_id,
            deleteMessageModalShow: true,
            createdAt
        }));
    };

    const onHidedeleteMessageModalShow = () => {
        setMessageEditState((prevState) => ({
            ...prevState,
            message_id: '',
            createdAt: '',
            deleteMessageModalShow: false
        }));
    };

    const onDeleteSingleMessage = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
        setMessageEditState((prevState) => ({
            ...prevState,
            deleteMessageModalShow: false
        }));
        props.onDeleteSingleMessage(ev, messageEditState.message_id);
    };

    const handleEditorChange = (content: unknown) => {
        setMessageEditState((prevState) => ({
            ...prevState,
            editorState: content
        }));
    };

    if (!props.editorState) {
        return <Loading />;
    }

    return (
        <>
            <Accordion
                disableGutters
                expanded={true}
                sx={{
                    p: 2,
                    overflowWrap: 'break-word', // Add this line
                    ...(props.isTaiGerView && {
                        maxWidth: window.innerWidth - 664 + 32
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
                <AccordionSummary
                    aria-controls={'accordion' + props.idx}
                    expandIcon={<ExpandMoreIcon />}
                    id={`${props.idx}`}
                >
                    <Avatar
                        {...stringAvatar(props.full_name)}
                        src={props.message.user_id?.pictureUrl}
                    />
                    <Typography style={{ marginLeft: '10px', flex: 1 }}>
                        <b className="ps-0 my-1" style={{ cursor: 'pointer' }}>
                            {props.full_name}
                        </b>
                        <span style={{ float: 'right' }}>
                            {convertDate(props.message.createdAt ?? '')}
                            {props.editable ? (
                                <IconButton
                                    aria-label="delete"
                                    onClick={(e) =>
                                        onOpendeleteMessageModalShow(
                                            e,
                                            String(props.message._id ?? ''),
                                            props.message.createdAt ?? ''
                                        )
                                    }
                                >
                                    <CloseIcon
                                        fontSize="small"
                                        style={{ cursor: 'pointer' }}
                                        titleAccess={t('Delete this message and file')}
                                    />
                                </IconButton>
                            ) : null}
                        </span>
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <EditorSimple
                        defaultHeight={0}
                        editorState={props.editorState}
                        handleEditorChange={handleEditorChange}
                        holder={`${String(props.message._id ?? '')}`}
                        imageEnable={false}
                        readOnly={false}
                    />
                </AccordionDetails>

                {!(messageEditState.editorState as { blocks?: unknown[] })?.blocks ||
                (messageEditState.editorState as { blocks?: unknown[] })?.blocks?.length === 0 ||
                props.buttonDisabled ? (
                    <Tooltip
                        placement="top"
                        title={t(
                            'Please write some text to improve the communication and understanding.'
                        )}
                    >
                        <Button
                            color="secondary"
                            startIcon={<SendIcon />}
                            variant="outlined"
                        >
                            {t('Save')}
                        </Button>
                    </Tooltip>
                ) : (
                    <Button
                        color="primary"
                        onClick={(e) =>
                            props.handleClickSave(
                                e,
                                messageEditState.editorState,
                                String(props.message._id ?? '')
                            )
                        }
                        startIcon={<SendIcon />}
                        variant="contained"
                    >
                        {t('Save', { ns: 'common' })}
                    </Button>
                )}
                <Button
                    color="secondary"
                    onClick={(e) => props.handleCancelEdit(e)}
                    variant="outlined"
                >
                    {t('Cancel', { ns: 'common' })}
                </Button>
            </Accordion>
            {/* TODOL consider to move it to the parent! It render many time! as message increase */}
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={onHidedeleteMessageModalShow}
                open={messageEditState.deleteMessageModalShow}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you wan to delete this message on{' '}
                        <b>{convertDate(messageEditState.createdAt ?? '')}?</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={props.isDeleting}
                        onClick={onDeleteSingleMessage}
                        variant="contained"
                    >
                        {props.isDeleting
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
        </>
    );
};

export default MessageEdit;
