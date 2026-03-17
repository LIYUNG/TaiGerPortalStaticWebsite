import { useMemo, useState } from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { Box, Card, Link, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { useMutation } from '@tanstack/react-query';

import CVMLRLOverview from '../CVMLRLCenter/CVMLRLOverview';
import ErrorPage from '../Utils/ErrorPage';
import { putThreadFavorite } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E,
    open_tasks_v2
} from '../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '@components/Loading/Loading';
import type {
    IDocumentthread,
    IDocumentthreadPopulated
} from '@taiger-common/model';
import {
    is_my_fav_message_status,
    is_new_message_status,
    is_pending_status
} from '@utils/contants';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useMyStudentsThreads } from '@hooks/useMyStudentsThreads';

const AgentSupportDocuments = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const {
        data: threadsData,
        isLoading: isLoadedThreads,
        isError: isThreadsError,
        error: threadsError
    } = useMyStudentsThreads(
        user?._id
            ? {
                  userId: user._id,
                  queryString: queryString.stringify({
                      fileType: [
                          FILE_TYPE_E.essay_required,
                          ...AGENT_SUPPORT_DOCUMENTS_A
                      ]
                  })
              }
            : null
    );

    const [optimisticFavToggles, setOptimisticFavToggles] = useState<
        Record<string, boolean>
    >({});
    const [mutationError, setMutationError] = useState<{
        error: unknown;
        res_status: number;
    } | null>(null);

    const putThreadFavoriteMutation = useMutation({
        mutationFn: (threadId: string) => putThreadFavorite(threadId),
        onError: (err: unknown, threadId: string) => {
            setMutationError({ error: err, res_status: 500 });
            setOptimisticFavToggles((prev) => {
                const next = { ...prev };
                delete next[threadId];
                return next;
            });
        },
        onSuccess: (resp: { data?: { success: boolean }; status?: number }) => {
            if (resp?.data?.success === false && resp?.status) {
                setMutationError({ error: resp, res_status: resp.status });
            } else {
                setMutationError(null);
            }
        }
    });

    const baseOpenTasksArr = useMemo(
        () =>
            open_tasks_v2(
                threadsData.threads as IDocumentthreadPopulated[]
            ),
        [threadsData.threads]
    );

    const open_tasks_arr_safe = useMemo(() => {
        const userIdStr = user?._id?.toString() ?? '';
        if (!userIdStr) return baseOpenTasksArr;
        return baseOpenTasksArr.map((row) => {
            const toggled = optimisticFavToggles[row.id];
            if (toggled === undefined) return row;
            const currentIncludes = (row.flag_by_user_id ?? []).includes(
                userIdStr
            );
            const newIncludes = toggled;
            if (currentIncludes === newIncludes) return row;
            return {
                ...row,
                flag_by_user_id: newIncludes
                    ? [...(row.flag_by_user_id ?? []), userIdStr]
                    : (row.flag_by_user_id ?? []).filter(
                          (uid) => uid !== userIdStr
                      )
            };
        });
    }, [baseOpenTasksArr, optimisticFavToggles, user?._id]);

    const handleFavoriteToggle = (id: string) => {
        if (typeof id !== 'string') return;
        const row = open_tasks_arr_safe.find((r) => r.id === id);
        const currentIsFav = (row?.flag_by_user_id ?? []).includes(
            user?._id?.toString() ?? ''
        );
        setOptimisticFavToggles((prev) => ({ ...prev, [id]: !currentIsFav }));
        setMutationError(null);
        putThreadFavoriteMutation.mutate(id);
    };

    if (!user) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const res_status = isThreadsError
        ? 500
        : (mutationError?.res_status ?? threadsData.status);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(t('Agent Support Documents', { ns: 'common' }));
    if (isLoadedThreads) {
        return <Loading />;
    }

    if (isThreadsError) {
        return <ErrorPage error={threadsError} res_status={res_status} />;
    }

    const tasks_withMyEssay_arr = open_tasks_arr_safe.filter(
        (open_task) =>
            (open_task.file_type != null &&
                [...AGENT_SUPPORT_DOCUMENTS_A].includes(open_task.file_type)) ||
            (
                open_task.outsourced_user_id as
                    | Array<{ _id: { toString: () => string } }>
                    | undefined
            )?.some(
                (outsourcedUser) =>
                    outsourcedUser._id.toString() ===
                    (user._id?.toString() ?? '')
            )
    );

    const open_tasks_withMyEssay_arr = tasks_withMyEssay_arr.filter(
        (open_task) => open_task.show && !open_task.isFinalVersion
    );

    const new_message_tasks = open_tasks_withMyEssay_arr.filter((open_task) =>
        is_new_message_status(user, open_task as unknown as IDocumentthread)
    );

    const fav_message_tasks = open_tasks_withMyEssay_arr.filter((open_task) =>
        is_my_fav_message_status(
            user,
            open_task as unknown as IDocumentthread
        )
    );

    const followup_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task) =>
            is_pending_status(
                user,
                open_task as unknown as IDocumentthread
            ) &&
            open_task.latest_message_left_by_id !== '- None - '
    );

    const pending_progress_tasks = open_tasks_withMyEssay_arr.filter(
        (open_task) =>
            is_pending_status(
                user,
                open_task as unknown as IDocumentthread
            ) &&
            open_task.latest_message_left_by_id === '- None - '
    );

    const closed_tasks = tasks_withMyEssay_arr.filter(
        (open_task) => open_task.show && open_task.isFinalVersion
    );

    return (
        <Box data-testid="cvmlrlcenter_component">
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('My Students', { ns: 'common' }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('Agent Support Documents', { ns: 'common' })
                    }
                ]}
            />
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
                        <b>Click me</b>
                    </Link>
                </Card>
            ) : null}
            <CVMLRLOverview
                closed_tasks={closed_tasks}
                fav_message_tasks={fav_message_tasks}
                followup_tasks={followup_tasks}
                handleFavoriteToggle={handleFavoriteToggle}
                isLoaded={!isLoadedThreads}
                new_message_tasks={new_message_tasks}
                pending_progress_tasks={pending_progress_tasks}
                success={threadsData.success}
            />
        </Box>
    );
};

export default AgentSupportDocuments;
