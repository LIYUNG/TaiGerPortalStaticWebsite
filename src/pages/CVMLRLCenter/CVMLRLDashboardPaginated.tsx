import { useMemo } from 'react';
import { Tabs, Tab, Box, Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { MRT_ColumnDef } from 'material-react-table';

import { c1_mrt, convertDate } from '@utils/contants';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import ExampleWithLocalizationProvider from '@components/MaterialReactTable';
import { useActiveThreadsPaginated } from '@hooks/useActiveThreadsPaginated';
import type { ThreadCategory } from '@hooks/useActiveThreadsPaginated';
import { useActiveThreadsCounts } from '@hooks/useActiveThreadsCounts';
import { useMrtTabUrlState } from '@utils/useMrtTabUrlState';
import type { MrtUrlStateConfig } from '@utils/mrtUrlState';

// MRT column id -> backend sortBy. Columns not listed are not server-sortable.
const SORT_FIELD_MAP: Record<string, string> = {
    deadline: 'deadline',
    days_left: 'days_left',
    document_name: 'document_name',
    updatedAt: 'updatedAt',
    firstname_lastname: 'firstname_lastname'
};

// MRT column id -> backend filter param. Columns not listed are not
// server-filterable (display-only under pagination).
const FILTER_FIELD_MAP: Record<string, string> = {
    firstname_lastname: 'name',
    document_name: 'document_name',
    deadline: 'deadline',
    lang: 'lang',
    status: 'status',
    editors_joined: 'editorName',
    agents_joined: 'agentName',
    outsourced_user_name_joined: 'essayWriterName'
};

// Tab index -> backend category.
const TAB_CATEGORIES: ThreadCategory[] = [
    'in_progress',
    'no_input',
    'closed',
    'all'
];

// Tab index -> readable URL slug (aligned with TAB_CATEGORIES order).
const TAB_SLUGS = ['in-progress', 'no-input', 'closed', 'all'] as const;

const URL_STATE_CONFIG: MrtUrlStateConfig = {
    filterIds: Object.keys(FILTER_FIELD_MAP),
    sortableIds: Object.keys(SORT_FIELD_MAP),
    defaultSort: { id: 'deadline', desc: false },
    defaultPageSize: 20
};

const CVMLRLDashboardPaginated = () => {
    const { t } = useTranslation();
    const {
        tab,
        pagination,
        sorting,
        globalFilter,
        columnFilters,
        handleTabChange,
        handleSortingChange,
        handleGlobalFilterChange,
        handleColumnFiltersChange,
        handlePaginationChange
    } = useMrtTabUrlState(URL_STATE_CONFIG, TAB_SLUGS);

    const category = TAB_CATEGORIES[tab];
    const sortColumn = sorting[0];
    const { counts } = useActiveThreadsCounts();

    const filters = useMemo(() => {
        const out: Record<string, string> = {};
        columnFilters.forEach(({ id, value }) => {
            const key = FILTER_FIELD_MAP[id];
            if (key && typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [columnFilters]);

    const { rows, rowCount, isLoading, isFetching } = useActiveThreadsPaginated(
        {
            page: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy: sortColumn ? SORT_FIELD_MAP[sortColumn.id] : undefined,
            sortOrder: sortColumn?.desc ? 'desc' : 'asc',
            search: globalFilter || undefined,
            category,
            filters
        }
    );

    // Format the (raw) updatedAt date for display, matching the old transform.
    const data = useMemo(
        () =>
            rows.map((row) => ({
                ...row,
                updatedAt: row.updatedAt
                    ? convertDate(row.updatedAt as string)
                    : row.updatedAt
            })),
        [rows]
    );

    // Only the supported columns stay sortable/filterable in server mode. The
    // shared "Editors / Writer" column becomes an Editor filter; Agent and
    // Essay Writer get their own filterable columns (data joined server-side).
    const columns = useMemo(() => {
        const base = (c1_mrt as MRT_ColumnDef<Record<string, unknown>>[]).map(
            (col) => {
                const id = String(col.accessorKey ?? '');
                return {
                    ...col,
                    ...(id === 'editors_joined' ? { header: 'Editor' } : {}),
                    enableSorting: Boolean(SORT_FIELD_MAP[id]),
                    enableColumnFilter: Boolean(FILTER_FIELD_MAP[id])
                };
            }
        );
        const staffColumns: MRT_ColumnDef<Record<string, unknown>>[] = [
            {
                accessorKey: 'agents_joined',
                header: 'Agent',
                size: 120,
                enableSorting: false,
                enableColumnFilter: true
            },
            {
                accessorKey: 'outsourced_user_name_joined',
                header: 'Essay Writer',
                size: 130,
                enableSorting: false,
                enableColumnFilter: true
            }
        ];
        return [...base, ...staffColumns];
    }, []);

    const serverMode = {
        rowCount,
        isLoading: isLoading || isFetching,
        pagination,
        onPaginationChange: handlePaginationChange,
        sorting,
        onSortingChange: handleSortingChange,
        globalFilter,
        onGlobalFilterChange: handleGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange: handleColumnFiltersChange
    };

    const TAB_ALERTS = [
        <Alert data-testid="banner" key="in_progress" severity="warning">
            Received students inputs and Active Tasks. Be aware of the deadline!
        </Alert>,
        <Alert key="no_input" severity="info">
            No student inputs tasks. Agents should push students
        </Alert>,
        <Box key="closed">
            <Alert severity="success">These tasks are closed</Alert>
            <Typography sx={{ p: 2 }}>
                {t(
                    'Note: if the documents are not closed but locate here, it is because the applications are already submitted. The documents can safely closed eventually.',
                    { ns: 'cvmlrl' }
                )}
            </Typography>
        </Box>,
        <Alert key="all" severity="info">
            All tasks
        </Alert>
    ];

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="cvmlrl tabs"
                    onChange={handleTabChange}
                    scrollButtons="auto"
                    value={tab}
                    variant="scrollable"
                >
                    <Tab
                        label={`${t('In Progress', { ns: 'common' })} (${counts.in_progress})`}
                        {...a11yProps(tab, 0)}
                    />
                    <Tab
                        label={`${t('No Input', { ns: 'common' })} (${counts.no_input})`}
                        {...a11yProps(tab, 1)}
                    />
                    <Tab
                        label={`${t('Closed', { ns: 'common' })} (${counts.closed})`}
                        {...a11yProps(tab, 2)}
                    />
                    <Tab
                        label={`${t('All', { ns: 'common' })} (${counts.all})`}
                        {...a11yProps(tab, 3)}
                    />
                </Tabs>
            </Box>
            {TAB_CATEGORIES.map((cat, index) => (
                <CustomTabPanel index={index} key={cat} value={tab}>
                    {TAB_ALERTS[index]}
                    {tab === index ? (
                        <ExampleWithLocalizationProvider
                            col={columns}
                            data={data as Record<string, unknown>[]}
                            serverMode={serverMode}
                        />
                    ) : null}
                </CustomTabPanel>
            ))}
        </>
    );
};

export default CVMLRLDashboardPaginated;
