import { useQuery } from '@tanstack/react-query';

import { getTasksOverview } from '@/api';
import type {
    GetTasksOverviewResponse,
    TasksOverviewData
} from '@taiger-common/model';

/**
 * Fetches tasks overview (admin/editor to-do counts).
 */
export function useTasksOverview() {
    const result = useQuery<GetTasksOverviewResponse, Error, TasksOverviewData>({
        queryKey: ['tasks-overview'],
        queryFn: getTasksOverview,
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (response) => response.data ?? ({} as TasksOverviewData)
    });

    return {
        ...result,
        data: result.data ?? ({} as TasksOverviewData),
        queryKey: ['tasks-overview'] as const
    };
}
