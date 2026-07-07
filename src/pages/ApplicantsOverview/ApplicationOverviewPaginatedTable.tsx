import { useEffect, useMemo, useState } from 'react';
import { Box, Link, Popover, Typography } from '@mui/material';
import { Link as LinkDom, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isProgramDecided, isProgramSubmitted } from '@taiger-common/core';
import type {
    IAgentWithId,
    IApplicationPopulated,
    IEditorWithId,
    IStudentResponse
} from '@taiger-common/model';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import { MuiDataGrid } from '@components/MuiDataGrid';
import ApplicationProgressCardBody from '@components/ApplicationProgressCard/ApplicationProgressCardBody';
import DEMO from '@store/constant';
import {
    COUNTRIES_ARRAY_OPTIONS,
    DECISION_STATUS_E,
    SUBMISSION_STATUS_E
} from '@utils/contants';
import { programs_refactor_v2 } from '../Utils/util_functions';
import { useStudentsApplicationsPaginated } from '@hooks/useStudentsApplicationsPaginated';
import type { Application } from '@/api/types';
import {
    FILTER_FIELD_MAP,
    SORT_FIELD_MAP,
    searchParamsToApplicationTableState,
    writeApplicationTableParams
} from './applicationOverviewUrlState';

type ApplicationDecisionLike = Parameters<typeof isProgramDecided>[0];

// `decided` / `closed` are stored as short status codes, so a select filter is
// clearer than free text. Values are sent verbatim to the backend.
const DECIDED_FILTER_OPTIONS = [
    { label: 'Decided (O)', value: 'O' },
    { label: 'Not decided (X)', value: 'X' },
    { label: 'Undecided (-)', value: '-' }
];
const CLOSED_FILTER_OPTIONS = [
    { label: 'Submitted (O)', value: 'O' },
    { label: 'Not submitted (X)', value: 'X' },
    { label: 'Open (-)', value: '-' }
];

// Country is a multi-select over the known country list (same source/logic as
// ProgramsTable). Values are the stored country codes; the backend matches with
// $in over comma-separated values.
const COUNTRY_FILTER_OPTIONS = COUNTRIES_ARRAY_OPTIONS.map(
    (item) => item.value
);

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

export interface ApplicationOverviewPaginatedTableProps {
    /**
     * When provided, scope to the applications of the students this TaiGer user
     * supervises (My Students view). Omit for the all-active-students view.
     */
    userId?: string;
}

export const ApplicationOverviewPaginatedTable = ({
    userId
}: ApplicationOverviewPaginatedTableProps = {}) => {
    const { t } = useTranslation();

    // Seed table state from the URL on mount so a shared link reproduces the
    // exact search/sort/filter/page view. URL writes after this are one-way
    // (state -> URL), so we only read the query string once.
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTableState = useMemo(
        () => searchParamsToApplicationTableState(searchParams),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [pagination, setPagination] = useState<MRT_PaginationState>(
        initialTableState.pagination
    );
    const [sorting, setSorting] = useState<MRT_SortingState>(
        initialTableState.sorting
    );
    const [globalFilter, setGlobalFilter] = useState(
        initialTableState.globalFilter
    );
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        initialTableState.columnFilters
    );

    // Mirror the current search/sort/filter/page state into the URL (replace,
    // so we don't spam browser history). Only the table's own keys are touched,
    // so the active `tab` param set by the parent tabs is preserved.
    useEffect(() => {
        setSearchParams(
            (prev) =>
                writeApplicationTableParams(prev, {
                    globalFilter,
                    sorting,
                    columnFilters,
                    pagination
                }),
            { replace: true }
        );
    }, [globalFilter, sorting, columnFilters, pagination, setSearchParams]);

    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
        null
    );
    const [selectedRowData, setSelectedRowData] = useState<Record<
        string,
        unknown
    > | null>(null);

    const sortColumn = sorting[0];
    const sortBy = sortColumn ? SORT_FIELD_MAP[sortColumn.id] : undefined;
    const sortOrder = sortColumn?.desc ? 'desc' : 'asc';

    // Translate MRT column filters into the backend's filter query keys.
    // Multi-select filters (e.g. country) arrive as arrays -> comma-joined,
    // which the backend splits and matches with $in.
    const filters = useMemo(() => {
        const out: Record<string, string> = {};
        columnFilters.forEach(({ id, value }) => {
            const key = FILTER_FIELD_MAP[id];
            if (!key) return;
            if (Array.isArray(value)) {
                const joined = value.filter(Boolean).join(',');
                if (joined !== '') out[key] = joined;
            } else if (typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [columnFilters]);

    const { rows, rowCount, isLoading, isFetching } =
        useStudentsApplicationsPaginated({
            page: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy,
            sortOrder,
            search: globalFilter || undefined,
            filters,
            userId,
            // Applicants overview covers active students only.
            archiv: false
        });

    // Run the existing row transform on just this page of populated documents.
    const tableRows = useMemo(
        () => programs_refactor_v2(rows as IApplicationPopulated[]),
        [rows]
    );

    // Reset to the first page whenever the sort or search changes.
    const handleSortingChange = (updater: MRT_Updater<MRT_SortingState>) => {
        setSorting((prev) => applyUpdater(updater, prev));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };
    const handleGlobalFilterChange = (updater: MRT_Updater<string>) => {
        setGlobalFilter((prev) => applyUpdater(updater, prev));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };
    const handleColumnFiltersChange = (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => {
        setColumnFilters((prev) => applyUpdater(updater, prev));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };
    const handlePaginationChange = (
        updater: MRT_Updater<MRT_PaginationState>
    ) => {
        setPagination((prev) => applyUpdater(updater, prev));
    };

    const handleRowClick = (
        row: Record<string, unknown>,
        event: React.MouseEvent<HTMLTableRowElement>
    ) => {
        setPopoverAnchorEl(event.currentTarget);
        setSelectedRowData(row);
    };
    const handlePopoverClose = () => {
        setPopoverAnchorEl(null);
        setSelectedRowData(null);
    };

    const columns = useMemo(
        () => [
            {
                field: 'application_year',
                headerName: t('Application Year', { ns: 'common' }),
                width: 110
            },
            {
                field: 'semester',
                headerName: t('Semester', { ns: 'common' }),
                width: 100
            },
            {
                field: 'firstname_lastname',
                headerName: t('First-, Last Name', { ns: 'common' }),
                width: 180,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.student_id as string,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {String(params.value)}
                        </Link>
                    );
                }
            },
            {
                field: 'agents',
                headerName: t('Agent', { ns: 'common' }),
                width: 180,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) => {
                    return (
                        params.row.studentId as IStudentResponse
                    )?.agents?.map((agent: IAgentWithId) => {
                        return (
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to={DEMO.TEAM_AGENT_LINK(agent._id)}
                                underline="hover"
                            >
                                {String(agent.firstname)}{' '}
                            </Link>
                        );
                    });
                },
                // Backend cannot sort by agent, but supports an agent-name
                // contains filter (matches any supervising agent's name).
                sortable: false
            },
            {
                field: 'editors',
                headerName: t('Editor', { ns: 'common' }),
                width: 180,
                // Backend cannot sort by editor, but supports an editor-name
                // contains filter (matches any supervising editor's name).
                sortable: false,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) => {
                    return (
                        params.row.studentId as IStudentResponse
                    )?.editors?.map((editor: IEditorWithId) => {
                        return (
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to={DEMO.TEAM_EDITOR_LINK(editor._id)}
                                underline="hover"
                            >
                                {String(editor.firstname)}{' '}
                            </Link>
                        );
                    });
                }
            },
            {
                field: 'country',
                headerName: t('Country', { ns: 'common' }),
                width: 180,
                filterVariant: 'multi-select' as const,
                filterSelectOptions: COUNTRY_FILTER_OPTIONS
            },
            {
                field: 'program',
                headerName: t('Program', { ns: 'common' }),
                width: 250,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) => {
                    const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.program_id as string)}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {String(params.value)}
                        </Link>
                    );
                }
            },
            {
                field: 'decided',
                headerName: t('Decided', { ns: 'common' }),
                width: 120,
                filterVariant: 'select' as const,
                filterSelectOptions: DECIDED_FILTER_OPTIONS,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) =>
                    params.row.decided === '-'
                        ? DECISION_STATUS_E.UNKNOWN_SYMBOL
                        : isProgramDecided(
                                params.row as ApplicationDecisionLike
                            )
                          ? DECISION_STATUS_E.OK_SYMBOL
                          : DECISION_STATUS_E.NOT_OK_SYMBOL
            },
            {
                field: 'closed',
                headerName: t('Closed', { ns: 'common' }),
                width: 120,
                filterVariant: 'select' as const,
                filterSelectOptions: CLOSED_FILTER_OPTIONS,
                renderCell: (params: {
                    value: unknown;
                    row: Record<string, unknown>;
                    field: string;
                }) =>
                    params.row.closed === '-'
                        ? SUBMISSION_STATUS_E.UNKNOWN_SYMBOL
                        : isProgramSubmitted(
                                params.row as ApplicationDecisionLike
                            )
                          ? SUBMISSION_STATUS_E.OK_SYMBOL
                          : SUBMISSION_STATUS_E.NOT_OK_SYMBOL
            },
            {
                field: 'deadline',
                headerName: t('Deadline', { ns: 'common' }),
                width: 120,
                enableColumnFilter: false
            },
            {
                field: 'days_left',
                headerName: t('Days left', { ns: 'common' }),
                width: 120,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'status',
                headerName: t('Status(%)', { ns: 'common' }),
                width: 120,
                sortable: false,
                enableColumnFilter: false
            }
        ],
        [t]
    );

    return (
        <>
            <MuiDataGrid
                columns={columns}
                getRowId={(row: Record<string, unknown>) => String(row.id)}
                isLoading={isLoading || isFetching}
                onRowClick={handleRowClick}
                rows={tableRows}
                serverMode={{
                    rowCount,
                    pagination,
                    onPaginationChange: handlePaginationChange,
                    sorting,
                    onSortingChange: handleSortingChange,
                    globalFilter,
                    onGlobalFilterChange: handleGlobalFilterChange,
                    columnFilters,
                    onColumnFiltersChange: handleColumnFiltersChange
                }}
            />
            <Popover
                anchorEl={popoverAnchorEl}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                onClose={handlePopoverClose}
                open={Boolean(popoverAnchorEl)}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, maxWidth: 400 }}>
                    <Typography gutterBottom variant="h6">
                        {String(selectedRowData?.firstname_lastname ?? '')}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                    >
                        {String(selectedRowData?.program ?? '')}
                    </Typography>
                    {selectedRowData?.application &&
                    selectedRowData?.student ? (
                        <ApplicationProgressCardBody
                            application={
                                selectedRowData.application as Application
                            }
                            student={
                                selectedRowData.student as IStudentResponse
                            }
                        />
                    ) : null}
                </Box>
            </Popover>
        </>
    );
};

export default ApplicationOverviewPaginatedTable;
