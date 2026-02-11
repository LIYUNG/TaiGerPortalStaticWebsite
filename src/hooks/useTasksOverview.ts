import { useQuery } from '@tanstack/react-query';

import { getTasksOverviewQuery } from '@api/query';

/**
 * Fetches tasks overview (admin/editor to-do counts).
 * Unifies getTasksOverviewQuery usage across AdminMainView and EditorMainView.
 */
export function useTasksOverview() {
    const query = getTasksOverviewQuery();

    const result = useQuery(query);

    return {
        ...result,
        data: (result.data as { data?: Record<string, unknown> } | undefined)?.data ?? {},
        queryKey: query.queryKey
    };
}
