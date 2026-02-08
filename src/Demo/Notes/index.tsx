import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import NotesCard from './NotesCard';
import ErrorPage from '../Utils/ErrorPage';
import { getStudentNotes } from '../../api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';

interface NotesState {
    error: unknown;
    role: string;
    isLoaded: boolean;
    notes: unknown;
    success: boolean;
    updateconfirmed: boolean;
    res_status: number;
}

interface NotesProps {
    student_id: string;
}

const Notes = (props: NotesProps) => {
    const { user } = useAuth();
    const [notesState, setNotesState] = useState<NotesState>({
        error: '',
        role: '',
        isLoaded: false,
        notes: '{}',
        success: false,
        updateconfirmed: false,
        res_status: 0
    });

    useEffect(() => {
        getStudentNotes(props.student_id).then(
            (resp: {
                data: { data?: { notes?: string }; success?: boolean };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                let initialEditorState: unknown = null;
                if (data?.notes && data.notes !== '{}') {
                    try {
                        initialEditorState = JSON.parse(data.notes);
                    } catch {
                        initialEditorState = { time: new Date(), blocks: [] };
                    }
                } else {
                    initialEditorState = { time: new Date(), blocks: [] };
                }
                if (success) {
                    setNotesState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        notes: initialEditorState,
                        success: success ?? false,
                        res_status: status ?? 0
                    }));
                } else {
                    setNotesState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setNotesState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, [props.student_id]);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle('Academic Background Survey');
    const { res_status, isLoaded } = notesState;

    if (!isLoaded) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }
    return (
        <Box>
            <NotesCard
                isLoaded={notesState.isLoaded}
                notes={notesState.notes}
                student_id={props.student_id}
                user={user}
            />
        </Box>
    );
};

export default Notes;
