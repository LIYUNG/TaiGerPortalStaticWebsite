import { useQuery } from '@tanstack/react-query';

import { getCRMLead } from '@/api';
import type {
    CRMLeadWithMeetings,
    GetCRMLeadResponse
} from '@taiger-common/model';

export type UseLeadOptions = {
    enabled?: boolean;
};

/**
 * Fetches a single CRM lead by id.
 * Normalizes response to a lead object.
 */
export function useLead(leadId: string | undefined, options?: UseLeadOptions) {
    const enabled = (options?.enabled ?? true) && !!leadId;

    const result = useQuery<
        GetCRMLeadResponse,
        Error,
        CRMLeadWithMeetings | undefined
    >({
        queryKey: ['crm/lead', leadId],
        queryFn: () => getCRMLead(leadId!),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
        select: (response) => response.data
    });

    const lead = result.data;

    return {
        ...result,
        lead,
        queryKey: ['crm/lead', leadId]
    };
}
