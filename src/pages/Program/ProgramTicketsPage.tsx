import { useEffect, useMemo, useState } from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Breadcrumbs, Chip, Link, Typography } from '@mui/material';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_ColumnFiltersState,
    type MRT_PaginationState,
    type MRT_SortingState
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '@components/table';
import { is_TaiGer_role } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import {
    useProgramTickets,
    type ProgramTicketRow
} from '@hooks/useProgramTickets';
import ErrorPage from '../Utils/ErrorPage';

const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : '—';

const ProgramTicketsPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const customTableStyles = useTableStyles();

    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 20
    });
    const [sorting, setSorting] = useState<MRT_SortingState>([
        { id: 'createdAt', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    TabTitle(t('Program Update Requests', { ns: 'common' }));

    // Debounce the free-text search + status column filter, and snap back to the
    // first page whenever either changes.
    useEffect(() => {
        const id = window.setTimeout(() => {
            setDebouncedSearch(globalFilter.trim());
            const statusCol = columnFilters.find((f) => f.id === 'status');
            setStatusFilter(
                typeof statusCol?.value === 'string' ? statusCol.value : ''
            );
            setPagination((current) => ({ ...current, pageIndex: 0 }));
        }, 300);
        return () => window.clearTimeout(id);
    }, [globalFilter, columnFilters]);

    const sort = sorting[0];
    const { data, isLoading, isError, error, isFetching } = useProgramTickets({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
        status: statusFilter,
        sortBy: sort?.id,
        sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        enabled: Boolean(user) && is_TaiGer_role(user as IUser)
    });

    const tableConfig = getTableConfig(
        customTableStyles as Parameters<typeof getTableConfig>[0],
        isLoading || isFetching
    );

    const columns: Array<MRT_ColumnDef<ProgramTicketRow>> = useMemo(
        () => [
            {
                accessorFn: (row) =>
                    `${row.program_id?.school ?? ''} - ${row.program_id?.program_name ?? ''}`,
                id: 'program',
                header: t('Program', { ns: 'common' }),
                size: 280,
                enableColumnFilter: false,
                Cell: ({ row }) => {
                    const program = row.original.program_id;
                    if (!program?._id) {
                        return (
                            <Typography color="text.secondary" variant="body2">
                                {t('Unknown program', { ns: 'common' })}
                            </Typography>
                        );
                    }
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={`${DEMO.SINGLE_PROGRAM_LINK(String(program._id))}`}
                            underline="hover"
                        >
                            {program.school} - {program.program_name}
                        </Link>
                    );
                }
            },
            {
                accessorKey: 'description',
                header: t('Description', { ns: 'common' }),
                size: 320,
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Typography
                        sx={{
                            maxWidth: 320,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={row.original.description}
                        variant="body2"
                    >
                        {row.original.description || '—'}
                    </Typography>
                )
            },
            {
                accessorFn: (row) =>
                    `${row.requester_id?.firstname ?? ''} ${row.requester_id?.lastname ?? ''}`.trim() ||
                    '—',
                id: 'requester',
                header: t('Requested By', { ns: 'common' }),
                size: 160,
                enableColumnFilter: false
            },
            {
                accessorKey: 'status',
                header: t('Status', { ns: 'common' }),
                size: 120,
                filterVariant: 'select',
                filterSelectOptions: [
                    { value: 'open', label: t('open', { ns: 'common' }) },
                    {
                        value: 'resolved',
                        label: t('resolved', { ns: 'common' })
                    }
                ],
                Cell: ({ row }) => (
                    <Chip
                        color={
                            row.original.status === 'resolved'
                                ? 'success'
                                : 'warning'
                        }
                        label={t(row.original.status ?? 'open', {
                            ns: 'common'
                        })}
                        size="small"
                        variant={
                            row.original.status === 'resolved'
                                ? 'outlined'
                                : 'filled'
                        }
                    />
                )
            },
            {
                accessorKey: 'createdAt',
                header: t('Created', { ns: 'common' }),
                size: 130,
                enableColumnFilter: false,
                Cell: ({ row }) => formatDate(row.original.createdAt)
            },
            {
                accessorKey: 'updatedAt',
                header: t('Last update', { ns: 'common' }),
                size: 130,
                enableColumnFilter: false,
                Cell: ({ row }) => formatDate(row.original.updatedAt)
            }
        ],
        [t]
    );

    const table = useMaterialReactTable({
        ...(tableConfig as Record<string, unknown>),
        columns,
        data: data?.tickets ?? [],
        getRowId: (row) => String(row._id),
        enableRowSelection: false,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: data?.total ?? 0,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        state: {
            isLoading: isLoading || isFetching,
            pagination,
            sorting,
            globalFilter,
            columnFilters
        }
    } as Parameters<typeof useMaterialReactTable<ProgramTicketRow>>[0]);

    if (!user || !is_TaiGer_role(user as IUser)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isError) {
        return <ErrorPage error={error} />;
    }

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
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={DEMO.PROGRAMS}
                    underline="hover"
                >
                    {t('Program List', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {t('Program Update Requests', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            <Box mb={2} mt={2}>
                <Typography gutterBottom variant="h5">
                    {t('Program Update Requests', { ns: 'common' })}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'Search and review tickets requesting program data updates',
                        { ns: 'common' }
                    )}
                </Typography>
            </Box>

            <MaterialReactTable table={table} />
        </Box>
    );
};

export default ProgramTicketsPage;
