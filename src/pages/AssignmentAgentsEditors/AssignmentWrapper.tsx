import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import AssignAgentsPage from './AssignAgents/AssignAgentsPage';
import AssignEditorsPage from './AssignEditors/AssignEditorsPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import useStudents from '@hooks/useStudents';
import { useStudentsV3 } from '@hooks/useStudentsV3';

interface AssignmentWrapperProps {
    role: 'agent' | 'editor';
}

const AssignmentWrapper = ({ role }: AssignmentWrapperProps) => {
    const { user } = useAuth();
    const { data: fetchedAllStudents, isLoading: isLoadingStudents } =
        useStudentsV3(
            role === 'agent'
                ? { agents: [], archiv: false }
                : { editors: [], archiv: false }
        );

    const {
        students,
        res_modal_message,
        res_modal_status,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        ConfirmError
    } = useStudents({
        students: fetchedAllStudents || []
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

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
            {isLoadingStudents ? (
                <Box>
                    <CircularProgress />
                </Box>
            ) : null}
            {!isLoadingStudents &&
                (role === 'agent' ? (
                    <AssignAgentsPage
                        students={students}
                        submitUpdateAgentlist={submitUpdateAgentlist}
                    />
                ) : (
                    <AssignEditorsPage
                        students={students}
                        submitUpdateEditorlist={submitUpdateEditorlist}
                    />
                ))}
        </Box>
    );
};

export default AssignmentWrapper;
