import React, { useEffect, useState } from 'react';

import Message from './Message';
import { updateAMessageInCommunicationThreadV2 } from '@/api';
import MessageEdit from './MessageEdit';
import { useAuth } from '@components/AuthProvider';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import type { ThreadMessage } from '@components/Message/MessageCard';
import { OutputData } from '@editorjs/editorjs';

interface MessageContainerState {
    error: string;
    isEdit: boolean;
    message: ThreadMessage;
    buttonDisabled: boolean;
    /** `null` until the message body has been parsed (MessageEdit shows a spinner). */
    editorState: OutputData | null;
    expand: boolean;
    deadline: string;
    accordionKeys: number[];
    res_status: number;
    res_modal_status: number;
    res_modal_message: string;
}

export interface MessageContainerProps {
    message: ThreadMessage;
    student_id: string;
    accordionKeys: number[];
    isDeleting: boolean;
    isTaiGerView: boolean;
    onDeleteSingleMessage: (messageId: string) => void;
    idx: number;
}

const MessageContainer = (props: MessageContainerProps) => {
    const { user } = useAuth();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const [messageContainerState, setMessageContainerState] =
        useState<MessageContainerState>({
            error: '',
            isEdit: false,
            message: props.message,
            buttonDisabled: false,
            editorState: null,
            expand: true,
            deadline: '',
            accordionKeys: [0], // to expand all]
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: ''
        });

    const { mutate, isPending } = useMutation({
        mutationFn: updateAMessageInCommunicationThreadV2,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: (data, variables) => {
            const { message } = variables; // Extract message_id
            queryClient.invalidateQueries({
                queryKey: ['communications', props.student_id]
            });
            setMessageContainerState((prevState) => ({
                ...prevState,
                editorState: JSON.parse(message) as OutputData,
                // The endpoint populates user_id (communication.dao POPULATE),
                // but UpdateCommunicationMessageResponse still types it as a
                // bare id string — the server itself casts to satisfy it.
                message:
                    (data.data as unknown as ThreadMessage | undefined) ??
                    prevState.message,
                isEdit: false,
                buttonDisabled: false,
                accordionKeys: [
                    ...prevState.accordionKeys,
                    prevState.accordionKeys.length
                ]
            }));
        }
    });

    useEffect(() => {
        let initialEditorState: OutputData;
        if (props.message.message && props.message.message !== '{}') {
            try {
                initialEditorState = JSON.parse(
                    props.message.message
                ) as OutputData;
            } catch {
                initialEditorState = { time: Date.now(), blocks: [] };
            }
        } else {
            initialEditorState = { time: Date.now(), blocks: [] };
        }
        queueMicrotask(() => {
            setMessageContainerState((prevState) => ({
                ...prevState,
                editorState: initialEditorState
            }));
        });
    }, [props.message.message]);

    const updateMessage = (
        e: React.MouseEvent<HTMLElement>,
        editorState: OutputData,
        messageId: string
    ) => {
        e.preventDefault();
        mutate({
            communication_id: props.student_id,
            communication_messageId: messageId,
            message: JSON.stringify(editorState)
        });
    };

    const onEditMode = () => {
        setMessageContainerState((prevState) => ({
            ...prevState,
            isEdit: true
        }));
    };

    const handleCancelEdit = () => {
        setMessageContainerState((prevState) => ({
            ...prevState,
            isEdit: false
        }));
    };
    const firstname = props.message.user_id
        ? props.message.user_id.firstname
        : 'Staff';
    const lastname = props.message.user_id
        ? props.message.user_id.lastname
        : 'TaiGer';
    const editable = props.message.user_id
        ? props.message.user_id._id.toString() === user?._id?.toString()
            ? true
            : false
        : false;
    const full_name = `${firstname} ${lastname}`;
    return messageContainerState.isEdit ? (
        <MessageEdit
            buttonDisabled={isPending}
            editable={editable}
            editorState={messageContainerState.editorState}
            full_name={full_name}
            handleCancelEdit={handleCancelEdit}
            handleClickSave={updateMessage}
            idx={props.idx}
            isDeleting={props.isDeleting}
            isTaiGerView={props.isTaiGerView}
            message={{
                _id: props.message._id,
                // MessageEdit only formats this for display; normalise the
                // Date form of createdAt to the ISO string it expects.
                createdAt:
                    props.message.createdAt instanceof Date
                        ? props.message.createdAt.toISOString()
                        : props.message.createdAt,
                user_id: props.message.user_id
            }}
            onDeleteSingleMessage={props.onDeleteSingleMessage}
        />
    ) : (
        <Message
            accordionKeys={props.accordionKeys}
            idx={props.idx}
            isDeleting={props.isDeleting}
            isLoaded={false}
            isTaiGerView={props.isTaiGerView}
            message={messageContainerState.message}
            onDeleteSingleMessage={props.onDeleteSingleMessage}
            onEditMode={onEditMode}
            path=""
        />
    );
};

export default MessageContainer;
