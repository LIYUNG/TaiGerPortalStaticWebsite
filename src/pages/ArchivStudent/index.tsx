import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { updateArchivStudents } from '@/api';
import { getArchivStudentsQuery } from '@/api/query';
import { queryClient } from '@api/client';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { StudentsTable } from '../StudentDatabase/StudentsTable';
import { student_transform } from '../Utils/util_functions';

const ArchivStudents = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { user_id } = useParams();
    const [modalError, setModalError] = useState({
        res_modal_status: 0,
        res_modal_message: ''
    });

    const TaiGerStaffId = user_id || user._id.toString();

    // Fetch archived students using React Query
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery(getArchivStudentsQuery(TaiGerStaffId));

    // Mutation for updating student archive status
    const { mutate: updateStudentArchivStatus } = useMutation({
        mutationFn: ({ studentId, isArchived }) =>
            updateArchivStudents(studentId, isArchived),
        onSuccess: (resp) => {
            const { success } = resp.data;
            const { status } = resp;
            if (success) {
                // Invalidate and refetch archived students
                queryClient.invalidateQueries({
                    queryKey: getArchivStudentsQuery(TaiGerStaffId).queryKey
                });
                setModalError({
                    res_modal_status: 0,
                    res_modal_message: ''
                });
            } else {
                const { message } = resp.data;
                setModalError({
                    res_modal_status: status,
                    res_modal_message: message
                });
            }
        },
        onError: () => {
            setModalError({
                res_modal_status: 500,
                res_modal_message: ''
            });
        }
    });

    const ConfirmError = () => {
        setModalError({
            res_modal_status: 0,
            res_modal_message: ''
        });
    };

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle('Archiv Student');

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response?.data?.success) {
        const res_status = response?.status || (error?.response?.status ?? 500);
        return <ErrorPage res_status={res_status} />;
    }

    const students = response.data.data || [];
    const studentsTransformed = student_transform(students);

    return (
        <Box data-testid="archiv_student_component">
            <BreadcrumbsNavigation
                items={[
                    {
                        label: appConfig.companyName,
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: `${t('My Archived Students', { ns: 'common' })} (${students.length})`
                    }
                ]}
            />
            {modalError.res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={modalError.res_modal_message}
                    res_modal_status={modalError.res_modal_status}
                />
            ) : null}
            <Box sx={{ mt: 2 }}>
                <StudentsTable
                    data={studentsTransformed}
                    isLoading={false}
                    updateStudentArchivStatus={(studentId, isArchived) =>
                        updateStudentArchivStatus({ studentId, isArchived })
                    }
                />
            </Box>
        </Box>
    );
};

export default ArchivStudents;
