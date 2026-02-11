import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';
import { useMutation, useQuery } from '@tanstack/react-query';

import { putThreadFavorite } from '@api';
import { TabTitle } from '../Utils/TabTitle';
import { file_category_const, open_tasks_v2 } from '../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '@components/Loading/Loading';
import EssayOverview from './EssayOverview';
import {
    is_my_fav_message_status,
    is_new_message_status,
    is_pending_status
} from '@utils/contants';
import { getActiveThreadsQuery } from '@api/query';
import { queryClient } from '@api/client';

const EssayDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const { data = [], isLoading } = useQuery(
        getActiveThreadsQuery(
            queryString.stringify({
                file_type: file_category_const.essay_required
            })
        )
    );

    const { mutate: handleFavoriteToggleMutation } = useMutation({
        mutationFn: (id: string) => putThreadFavorite(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getActiveThreadsQuery(
                    queryString.stringify({
                        file_type: file_category_const.essay_required
                    })
                ).queryKey
            });
        }
    });

    const open_tasks_arr = open_tasks_v2(data as unknown[]);

    const handleFavoriteToggle = (id: string) => {
        handleFavoriteToggleMutation(id);
    };

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle('Essay Dashboard');
    if (isLoading) {
        return <Loading />;
    }

    const open_tasks_withMyEssay_arr = open_tasks_arr?.filter(
        (open_task: { show?: boolean; isFinalVersion?: boolean }) =>
            open_task.show && !open_task.isFinalVersion
    );
    const no_essay_writer_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task: { outsourced_user_id?: unknown[] }) =>
            open_task.outsourced_user_id === undefined ||
            open_task.outsourced_user_id.length === 0
    );

    const new_message_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task: unknown) => is_new_message_status(user, open_task)
    );

    const fav_message_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task: unknown) => is_my_fav_message_status(user, open_task)
    );

    const followup_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task: { latest_message_left_by_id?: string }) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id !== ''
    );

    const pending_progress_tasks = open_tasks_withMyEssay_arr?.filter(
        (open_task: { latest_message_left_by_id?: string }) =>
            is_pending_status(user, open_task) &&
            open_task.latest_message_left_by_id === ''
    );

    const closed_tasks = open_tasks_arr?.filter(
        (open_task: { show?: boolean; isFinalVersion?: boolean }) =>
            open_task.show && open_task.isFinalVersion
    );

    const all_active_message_tasks = open_tasks_arr?.filter(
        (open_task: { show?: boolean }) => open_task.show
    );

    return (
        <Box>
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
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Essay Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <EssayOverview
                all_active_message_tasks={all_active_message_tasks}
                closed_tasks={closed_tasks}
                fav_message_tasks={fav_message_tasks}
                followup_tasks={followup_tasks}
                handleFavoriteToggle={handleFavoriteToggle}
                isLoading={isLoading}
                new_message_tasks={new_message_tasks}
                no_essay_writer_tasks={no_essay_writer_tasks}
                pending_progress_tasks={pending_progress_tasks}
            />
        </Box>
    );
};

export default EssayDashboard;
