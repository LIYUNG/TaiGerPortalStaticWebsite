import { useQuery } from '@tanstack/react-query';

import { getCRMLeadQuery } from '@/api/query';

export type UseLeadOptions = {
    enabled?: boolean;
};

/**
 * Fetches a single CRM lead by id.
 * Unifies getCRMLeadQuery usage and normalizes response to a lead object.
 */
export function useLead(leadId: string | undefined, options?: UseLeadOptions) {
    const query = getCRMLeadQuery(leadId ?? '');

    const result = useQuery({
        ...query,
        enabled: (options?.enabled ?? true) && !!leadId
    });

    const lead = result.data?.data?.data ?? {};

    return {
        ...result,
        lead,
        queryKey: query.queryKey
    };
}
