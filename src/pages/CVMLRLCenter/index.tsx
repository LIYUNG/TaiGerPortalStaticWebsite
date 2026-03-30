import { useEffect, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Card,
    Breadcrumbs,
    Button,
    Link,
    Typography
} from '@mui/material';
import { is_TaiGer_Editor, is_TaiGer_role } from '@taiger-common/core';
import type { IDocumentthreadPopulated } from '@taiger-common/model';
import type { OpenTaskRow } from '@/api/types';

import CVMLRLOverview from './CVMLRLOverview';
import ErrorPage from '../Utils/ErrorPage';
import {
    getMyStudentsThreads,
    getThreadsByStudent,
    putThreadFavorite
} from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E,
    open_tasks_v2,
    toogleItemInArray
} from '../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '@components/Loading/Loading';
import {
    is_my_fav_message_status,
    is_new_message_status,
    is_pending_status
} from '@utils/contants';

interface CVMLRLCenterState {
    error: string;
    isLoaded: boolean;
    data: null;
    success: boolean;
    essays: OpenTaskRow[] | null;
    doc_thread_id: string;
    student_id: string;
    program_id: string;
    SetAsFinalFileModel: boolean;
    isFinalVersion: boolean;
    status: string;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
    open_tasks_arr: OpenTaskRow[];
}

const CVMLRLCenter = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [indexState, setIndexState] = useState<CVMLRLCenterState>({
        error: '',
        isLoaded: false,
        data: null,
        success: false,
        essays: null,
        doc_thread_id: '',
        student_id: '',
        program_id: '',
        SetAsFinalFileModel: false,
        isFinalVersion: false,
        status: '', //reject, accept... etc
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0,
        open_tasks_arr: []
    });

    useEffect(() => {
        if (!user) {
            return;
        }
        const apiCall = is_TaiGer_role(user)
            ? getMyStudentsThreads({ userId: user._id, queryString: '' })
            : getThreadsByStudent(user._id);
        apiCall.then(
            (resp) => {
                const { success } = resp;
                const threads: IDocumentthreadPopulated[] =
                    'threads' in (resp.data ?? {})
                        ? ((resp.data as { threads: IDocumentthreadPopulated[] })
                              .threads ?? [])
                        : ((resp.data as IDocumentthreadPopulated[] | undefined) ?? []);
                const tasksData = open_tasks_v2(threads);
                if (success) {
                    setIndexState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        open_tasks_arr: tasksData,
                        success: success,
                        res_status: 200
                    }));
                } else {
                    setIndexState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: 400
                    }));
                }
            },
            (error: string) => {
                setIndexState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, [user]);

    const { res_status, isLoaded, open_tasks_arr } = indexState;
    TabTitle('CV ML RL Overview');
    if (!isLoaded || !user) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const handleFavoriteToggle = (id: string) => {
        const updatedEssays = indexState.essays?.map((row: OpenTaskRow) =>
            row.id === id
                ? {
                      ...row,
                      flag_by_user_id: toogleItemInArray(
                          row.flag_by_user_id ?? [],
                          user._id.toString()
                      )
                  }
                : row
        );
        const updatedOpenTasksWithoutEssaysArr = indexState.open_tasks_arr?.map(
            (row: OpenTaskRow) =>
                row.id === id
                    ? {
                          ...row,
                          flag_by_user_id: row.flag_by_user_id?.includes(
                              user._id.toString()
                          )
                              ? row.flag_by_user_id?.filter(
                                    (userId: string) =>
                                        userId !== user._id.toString()
                                )
                              : (row.flag_by_user_id?.length ?? 0) > 0
                                ? [
                                      ...(row.flag_by_user_id ?? []),
                                      user._id.toString()
                                  ]
                                : [user._id.toString()]
                      }
                    : row
        );
        setIndexState((prevState) => ({
            ...prevState,
            essays: updatedEssays ?? null,
            open_tasks_arr: updatedOpenTasksWithoutEssaysArr ?? []
        }));
        putThreadFavorite(id).then(
            (resp) => {
                const { success } = resp.data;
                const status = resp.status;
                if (!success) {
                    setIndexState((prevState) => ({
                        ...prevState,
                        res_status: status
                    }));
                }
            },
            (error: string) => {
                setIndexState((prevState) => ({
                    ...prevState,
                    error,
                    res_status: 500
                }));
            }
        );
    };

    const tasks_withMyEssay_arr = open_tasks_arr.filter(
        (open_task: OpenTaskRow) =>
            [...AGENT_SUPPORT_DOCUMENTS_A, FILE_TYPE_E.essay_required].includes(
                open_task.file_type ?? ''
            ) && is_TaiGer_Editor(user)
                ? (
                      open_task as OpenTaskRow & {
                          outsourced_user_id?: {
                              _id: { toString(): string };
                          }[];
                      }
                  ).outsourced_user_id?.some(
                      (outsourcedUser: { _id: { toString(): string } }) =>
                          outsourcedUser._id.toString() === user._id.toString()
                  )
                : true
    );
    const open_tasks_withMyEssay_arr = tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) => open_task.show && !open_task.isFinalVersion
    );
    const new_message_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) => is_new_message_status(user, open_task)
    );

    const fav_message_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) => is_my_fav_message_status(user, open_task)
    );

    const followup_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    const pending_progress_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id === '- None - '
    );

    const closed_tasks = tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) => open_task.show && open_task.isFinalVersion
    );

    return (
        <Box data-testid="cvmlrlcenter_component">
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
            >
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    {is_TaiGer_role(user) ? (
                        <Typography color="text.primary">
                            {t('My Students', { ns: 'common' })}
                        </Typography>
                    ) : null}
                    <Typography color="text.primary">
                        {t('CV/ML/RL Center', { ns: 'common' })}
                    </Typography>
                </Breadcrumbs>
                {is_TaiGer_role(user) ? (
                    <Button
                        color="primary"
                        component={LinkDom}
                        size="small"
                        to="/doc-communications/"
                        variant="contained"
                    >
                        {t('Switch View', { ns: 'common' })}
                    </Button>
                ) : null}
            </Box>
            {!is_TaiGer_role(user) ? (
                <Card sx={{ p: 2 }}>
                    <Typography variant="body1">Instructions</Typography>
                    若您為初次使用，可能無任何
                    Tasks。請聯絡您的顧問處理選校等，方能開始準備文件。
                    <br />
                    在此之前可以詳閱，了解之後與Editor之間的互動模式：
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={`${DEMO.CV_ML_RL_DOCS_LINK}`}
                    >
                        <b>{t('Click me')}</b>
                    </Link>
                </Card>
            ) : null}
            <CVMLRLOverview
                closed_tasks={closed_tasks}
                fav_message_tasks={fav_message_tasks}
                followup_tasks={followup_tasks}
                handleFavoriteToggle={handleFavoriteToggle}
                isLoaded={indexState.isLoaded}
                new_message_tasks={new_message_tasks}
                pending_progress_tasks={pending_progress_tasks}
                success={indexState.success}
            />
        </Box>
    );
};

export default CVMLRLCenter;
