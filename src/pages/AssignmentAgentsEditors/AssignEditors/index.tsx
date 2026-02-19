import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import AssignEditorsPage from './AssignEditorsPage';
import ModalMain from '../../Utils/ModalHandler/ModalMain';
import { useAuth } from '@components/AuthProvider';
import useStudents from '@hooks/useStudents';
import DEMO from '@store/constant';
import { useStudentsV3 } from '@hooks/useStudentsV3';

const AssignEditors = () => {
    const { user } = useAuth();
    const { data: fetchedAllStudents } = useStudentsV3({
        editors: [],
        archiv: false
    });

    const {
        students,
        res_modal_message,
        res_modal_status,
        submitUpdateEditorlist,
        ConfirmError
    } = useStudents({
        students: fetchedAllStudents
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    return (
        <Box data-testid="assignment_editors">
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            <AssignEditorsPage
                students={students}
                submitUpdateEditorlist={submitUpdateEditorlist}
            />
        </Box>
    );
};

export default AssignEditors;
