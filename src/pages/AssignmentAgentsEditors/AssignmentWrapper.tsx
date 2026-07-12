import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import type { IStudentResponse } from '@taiger-common/model';

import AssignAgentsPage from './AssignAgents/AssignAgentsPage';
import AssignEditorsPage from './AssignEditors/AssignEditorsPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import useStudents from '@hooks/useStudents';
import { useStudentsV3Paginated } from '@hooks/useStudentsV3Paginated';

interface AssignmentWrapperProps {
    role: 'agent' | 'editor';
}

const DEFAULT_PAGE_SIZE = 25;

const AssignmentWrapper = ({ role }: AssignmentWrapperProps) => {
    const { user } = useAuth();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Server-side filter for students with no agent / no editor (agents=none /
    // editors=none), so we only fetch the page we render instead of every
    // non-archived student.
    const { rows, rowCount, isLoading, isFetching } = useStudentsV3Paginated({
        page,
        pageSize,
        archiv: false,
        agents: role === 'agent' ? 'none' : undefined,
        editors: role === 'editor' ? 'none' : undefined
    });

    // useStudents keeps an optimistically-patched copy of the page rows, so once
    // an agent/editor is assigned the row hides itself from the list.
    const {
        students,
        res_modal_message,
        res_modal_status,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        ConfirmError
    } = useStudents({ students: rows as IStudentResponse[] });

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const handlePageChange = (nextPage: number) => setPage(nextPage);
    const handlePageSizeChange = (nextPageSize: number) => {
        setPageSize(nextPageSize);
        setPage(0);
    };

    return (
        <Box
            data-testid={
                role === 'agent' ? 'assignment_agents' : 'assignment_editors'
            }
        >
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            {role === 'agent' ? (
                <AssignAgentsPage
                    isLoading={isLoading || isFetching}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    page={page}
                    pageSize={pageSize}
                    rowCount={rowCount}
                    students={students}
                    submitUpdateAgentlist={submitUpdateAgentlist}
                />
            ) : (
                <AssignEditorsPage
                    isLoading={isLoading || isFetching}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    page={page}
                    pageSize={pageSize}
                    rowCount={rowCount}
                    students={students}
                    submitUpdateEditorlist={submitUpdateEditorlist}
                />
            )}
        </Box>
    );
};

export default AssignmentWrapper;
