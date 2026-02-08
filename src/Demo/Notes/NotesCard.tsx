import React, { useEffect, useState } from 'react';

import NotesEditor from './NotesEditor';
import { updateStudentNotes } from '../../api';

interface NotesCardState {
    editorState: unknown;
    isLoaded: boolean;
    buttonDisabled: boolean;
    thread?: unknown;
    res_modal_status?: number;
    res_modal_message?: string;
}

interface NotesCardProps {
    notes: unknown;
    isLoaded: boolean;
    student_id: string;
}

const NotesCard = (props: NotesCardProps) => {
    const [notesCardState, setNotesCardState] = useState<NotesCardState>({
        editorState: props.notes,
        isLoaded: false,
        buttonDisabled: true
    });

    useEffect(() => {
        const isLoaded = props.isLoaded;
        queueMicrotask(() => {
            setNotesCardState((prevState) => ({
                ...prevState,
                isLoaded
            }));
        });
    }, [props.isLoaded]);

    const handleEditorChange = (content: unknown) => {
        setNotesCardState((state) => ({
            ...state,
            editorState: content,
            buttonDisabled: false
        }));
    };

    const handleClickSave = (e: React.MouseEvent, editorState: unknown) => {
        e.preventDefault();
        setNotesCardState((prevState) => ({
            ...prevState,
            buttonDisabled: true
        }));
        const notes = JSON.stringify(editorState);

        updateStudentNotes(props.student_id, notes).then(
            (resp: {
                data: { success?: boolean; data?: unknown; message?: string };
                status?: number;
            }) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    setNotesCardState((prevState) => ({
                        ...prevState,
                        thread: data,
                        isLoaded: true,
                        buttonDisabled: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setNotesCardState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        buttonDisabled: false,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            () => {
                setNotesCardState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    return (
        <NotesEditor
            buttonDisabled={notesCardState.buttonDisabled}
            editorState={notesCardState.editorState}
            handleClickSave={handleClickSave}
            handleEditorChange={handleEditorChange}
            notes_id={`notes-${props.student_id}`}
            thread={notesCardState.thread}
            unique_id={props.student_id}
        />
    );
};

export default NotesCard;
