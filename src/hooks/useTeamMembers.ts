import { useQuery } from '@tanstack/react-query';

import { getTeamMembersQuery } from '@/api/query';

/**
 * Fetches team members (admins, agents, editors).
 * Unifies getTeamMembersQuery usage across TaiGerMember, Accounting, and TaiGerOrg.
 */
export function useTeamMembers() {
    const query = getTeamMembersQuery();
    const result = useQuery(query);

    const response = result.data as
        | { data?: { data?: unknown[]; success?: boolean }; status?: number }
        | undefined;
    const teams = response?.data?.data ?? [];
    const success = response?.data?.success;
    const status = response?.status;

    return {
        ...result,
        teams,
        success,
        status,
        queryKey: query.queryKey
    };
}
