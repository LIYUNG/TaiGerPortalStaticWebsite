import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { getTeamMembers } from '@/api';
import type { GetTeamMembersResponse } from '@taiger-common/model';

/**
 * Fetches team members (admins, agents, editors).
 */
export function useTeamMembers() {
    const result = useQuery({
        queryKey: ['team-members'],
        queryFn: () => getTeamMembers(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 5
    });

    const axiosResponse = result.data as
        | AxiosResponse<GetTeamMembersResponse>
        | undefined;
    const body = axiosResponse?.data;
    const teams = body?.data ?? [];
    const success = body?.success;
    const status = axiosResponse?.status;

    return {
        ...result,
        teams,
        success,
        status,
        queryKey: ['team-members'] as const
    };
}
