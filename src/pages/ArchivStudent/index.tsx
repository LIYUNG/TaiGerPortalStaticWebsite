import type { SyntheticEvent } from 'react';
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
import { queryClient } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { StudentsTable } from '../StudentDatabase/StudentsTable';
import type { IStudentResponse } from '@taiger-common/model';
import { student_transform } from '../Utils/util_functions';

interface ArchivStudentsQueryResponse {
    data?: { success?: boolean; data?: Record<string, unknown>[] };
    status?: number;
}

interface UpdateArchivMutationVariables {
    studentId: string;
    isArchived: boolean;
    shouldInform: boolean;
}

interface UpdateArchivSuccessResponse {
    data: { success?: boolean; message?: string };
    status?: number;
}

const noopSubmitAgentList = (
    _e: SyntheticEvent,
    _updateAgentList: Record<string, boolean>,
    _student_id: string
) => {};
const noopSubmitEditorList = (
    _e: SyntheticEvent,
    _updateEditorList: Record<string, boolean>,
    _student_id: string
) => {};
const noopSubmitAttributesList = (
    _e: SyntheticEvent,
    _updateAttributesList: unknown,
    _student_id: string
) => {};

const ArchivStudents = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { user_id } = useParams<{ user_id?: string }>();
    const [modalError, setModalError] = useState({
        res_modal_status: 0,
        res_modal_message: ''
    });

    const TaiGerStaffId = user_id ?? user?._id?.toString() ?? '';

    // Fetch archived students using React Query (only when we have a valid staff id)
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery({
        ...getArchivStudentsQuery(TaiGerStaffId),
        enabled: Boolean(TaiGerStaffId)
    });

    // Mutation for updating student archive status (matches StudentsTable 3-arg signature)
    const { mutate: mutateArchivStatus } = useMutation<
        UpdateArchivSuccessResponse,
        Error,
        UpdateArchivMutationVariables
    >({
        mutationFn: ({ studentId, isArchived, shouldInform }) =>
            updateArchivStudents(studentId, isArchived, shouldInform),
        onSuccess: (resp, _variables) => {
            const success = resp.data?.success;
            const status = resp.status ?? 0;
            if (success) {
                queryClient.invalidateQueries({
                    queryKey: getArchivStudentsQuery(TaiGerStaffId).queryKey
                });
                setModalError({
                    res_modal_status: 0,
                    res_modal_message: ''
                });
            } else {
                const message = resp.data?.message ?? '';
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

    if (!user) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle('Archiv Student');

    if (isLoading) {
        return <Loading />;
    }

    const res = response as ArchivStudentsQueryResponse | undefined;
    const axiosError = error as { response?: { status?: number } } | null;

    if (isError || !res?.data?.success) {
        const res_status = res?.status ?? axiosError?.response?.status ?? 500;
        return <ErrorPage res_status={res_status} />;
    }

    const students = (res.data?.data ?? []) as unknown as IStudentResponse[];
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
                    submitUpdateAgentlist={noopSubmitAgentList}
                    submitUpdateEditorlist={noopSubmitEditorList}
                    submitUpdateAttributeslist={noopSubmitAttributesList}
                    updateStudentArchivStatus={(
                        student_id: string,
                        archiv: boolean,
                        shouldInform: boolean
                    ) =>
                        mutateArchivStatus({
                            studentId: student_id,
                            isArchived: archiv,
                            shouldInform
                        })
                    }
                />
            </Box>
        </Box>
    );
};

export default ArchivStudents;
