import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { getActiveThreadsCounts, getMyStudentsThreadsCounts } from '@/api';
import type {
    ActiveThreadsCounts,
    GetActiveThreadsCountsResponse
} from '@/api/types';

const ZERO: ActiveThreadsCounts = {
    all: 0,
    closed: 0,
    in_progress: 0,
    no_input: 0,
    no_writer: 0,
    new_message: 0,
    fav: 0,
    followup: 0,
    pending_progress: 0
};

export interface UseActiveThreadsCountsParams {
    /** Doc type(s) to scope to (e.g. Essay). Omit for all CVMLRL types. */
    fileType?: string;
    /** Doc type(s) to exclude unless the viewer is outsourced on the thread. */
    excludeFileType?: string;
    /** Logged-in user id, for the viewer-dependent tab counts. */
    viewerId?: string;
    /** When set, scope to this user's supervised students (My Students view). */
    userId?: string;
    enabled?: boolean;
}

/**
 * Per-tab counts for the CVMLRL / Essay dashboards, computed in the DB.
 */
export function useActiveThreadsCounts({
    fileType,
    excludeFileType,
    viewerId,
    userId,
    enabled
}: UseActiveThreadsCountsParams = {}) {
    const queryStringValue = queryString.stringify(
        { file_type: fileType, excludeFileType, viewerId },
        { skipNull: true, skipEmptyString: true }
    );

    const result = useQuery<
        GetActiveThreadsCountsResponse,
        Error,
        ActiveThreadsCounts
    >({
        queryKey: userId
            ? ['active-threads/counts', userId, queryStringValue]
            : ['active-threads/counts', queryStringValue],
        queryFn: () =>
            userId
                ? getMyStudentsThreadsCounts({
                      userId,
                      queryString: queryStringValue
                  })
                : getActiveThreadsCounts(queryStringValue),
        staleTime: 1000 * 60 * 5,
        select: (response) => response.data ?? ZERO,
        enabled: enabled ?? true
    });

    return { ...result, counts: result.data ?? ZERO };
}
