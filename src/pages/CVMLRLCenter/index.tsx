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
import type {
    IDocumentthread,
    IDocumentthreadPopulated
} from '@taiger-common/model';
import type { OpenTaskRow } from '@/api/types';

/**
 * The message-status helpers only read isFinalVersion / flag_by_user_id /
 * latest_message_left_by_id, but declare the full IDocumentthread (whose
 * student_id and file_type are required). The rows produced by open_tasks_v2
 * carry those fields optionally, hence the widening.
 */
const asThread = (
    row: OpenTaskRow
): IDocumentthread & { latest_message_left_by_id?: string } =>
    row as unknown as IDocumentthread & {
        latest_message_left_by_id?: string;
    };

import CVMLRLOverview from './CVMLRLOverview';
import CVMLRLOverviewPaginated from './CVMLRLOverviewPaginated';
import ErrorPage from '../Utils/ErrorPage';
import { getThreadsByStudent, putThreadFavorite } from '@/api';
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

// CVMLRL center hides agent-support docs and essays unless the viewer is an
// outsourced collaborator on the thread; the core CV/ML/RL docs remain visible.
const EXCLUDE_FILE_TYPES = [
    ...AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E.essay_required
].join(',');

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
        // TaiGer users use the paginated view below; only students fetch here.
        if (!user || is_TaiGer_role(user)) {
            return;
        }
        const apiCall = getThreadsByStudent(user._id);
        apiCall.then(
            (resp) => {
                const { success } = resp;
                // The endpoint answers either with a bare array or with a
                // { threads } envelope, so both shapes are handled here.
                const payload: unknown = resp.data;
                const threads: IDocumentthreadPopulated[] =
                    typeof payload === 'object' &&
                    payload !== null &&
                    'threads' in payload
                        ? ((
                              payload as {
                                  threads?: IDocumentthreadPopulated[];
                              }
                          ).threads ?? [])
                        : ((payload as
                              | IDocumentthreadPopulated[]
                              | undefined) ?? []);
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
    if (!user) {
        return <Loading />;
    }

    // TaiGer users: server-side paginated view (My Students scope).
    if (is_TaiGer_role(user)) {
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
                        <Typography color="text.primary">
                            {t('My Students', { ns: 'common' })}
                        </Typography>
                        <Typography color="text.primary">
                            {t('CV/ML/RL Center', { ns: 'common' })}
                        </Typography>
                    </Breadcrumbs>
                    <Button
                        color="primary"
                        component={LinkDom}
                        size="small"
                        to="/doc-communications/"
                        variant="contained"
                    >
                        {t('Switch View', { ns: 'common' })}
                    </Button>
                </Box>
                <CVMLRLOverviewPaginated
                    excludeFileType={EXCLUDE_FILE_TYPES}
                    userId={user._id.toString()}
                />
            </Box>
        );
    }

    if (!isLoaded) {
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
        (open_task: OpenTaskRow) =>
            is_new_message_status(user, asThread(open_task))
    );

    const fav_message_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) =>
            is_my_fav_message_status(user, asThread(open_task))
    );

    const followup_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) =>
            is_pending_status(user, asThread(open_task)) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    const pending_progress_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task: OpenTaskRow) =>
            is_pending_status(user, asThread(open_task)) &&
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
