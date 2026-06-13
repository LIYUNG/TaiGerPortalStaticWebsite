import { useQuery } from '@tanstack/react-query';

import { getTicketsOverviewV2 } from '@/api';
import type { GetTicketsOverviewResponse } from '@/api/apis';

export interface TicketProgramRef {
    _id: string;
    school?: string;
    program_name?: string;
    degree?: string;
    semester?: string;
}

export interface TicketRequesterRef {
    _id?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
}

export interface ProgramTicketRow {
    _id: string;
    type?: string;
    status?: string;
    description?: string;
    program_id?: TicketProgramRef | null;
    requester_id?: TicketRequesterRef | null;
    createdAt?: string;
    updatedAt?: string;
}

export type UseProgramTicketsOptions = {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
};

export type ProgramTicketsResult = {
    tickets: ProgramTicketRow[];
    total: number;
    page: number;
    limit: number;
};

/**
 * Fetches a paginated, searchable page of program-update-request tickets.
 * Server-side: search spans the program (school/name) and requester name, not
 * just the ticket description.
 */
export function useProgramTickets(options?: UseProgramTicketsOptions) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const search = options?.search?.trim() ?? '';
    const type = options?.type ?? 'program';
    const status = options?.status ?? '';
    const sortBy = options?.sortBy;
    const sortOrder = options?.sortOrder;

    return useQuery<GetTicketsOverviewResponse, Error, ProgramTicketsResult>({
        queryKey: [
            'tickets',
            'overview',
            page,
            limit,
            search,
            type,
            status,
            sortBy,
            sortOrder
        ],
        queryFn: () =>
            getTicketsOverviewV2({
                page,
                limit,
                search,
                type,
                status: status || undefined,
                sortBy,
                sortOrder
            }),
        staleTime: 1000 * 60,
        enabled: options?.enabled ?? true,
        select: (response) => ({
            tickets: (response.data ?? []) as ProgramTicketRow[],
            total: response.total ?? 0,
            page: response.page ?? page,
            limit: response.limit ?? limit
        })
    });
}
