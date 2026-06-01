import React, { useMemo, useState } from 'react';
import {
    Tabs,
    Tab,
    Box,
    Typography,
    Link,
    Tooltip,
    Chip,
    IconButton,
    Alert
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import { MuiDataGrid, MuiDataGridColumn } from '@components/MuiDataGrid';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import DEMO from '@store/constant';
import { ATTRIBUTES, COLORS, convertDate } from '@utils/contants';
import {
    APPROVAL_COUNTRIES,
    file_category_const
} from '../Utils/util_functions';
import { useAuth } from '@components/AuthProvider';
import { putThreadFavorite, queryClient } from '@/api';
import { useActiveThreadsPaginated } from '@hooks/useActiveThreadsPaginated';
import type { ThreadCategory } from '@hooks/useActiveThreadsPaginated';
import { useActiveThreadsCounts } from '@hooks/useActiveThreadsCounts';
import type { OpenTaskRow } from '@/api/types';

const ESSAY_FILE_TYPE = file_category_const.essay_required; // 'Essay'

const SORT_FIELD_MAP: Record<string, string> = {
    deadline: 'deadline',
    days_left: 'days_left',
    document_name: 'document_name',
    updatedAt: 'updatedAt',
    firstname_lastname: 'firstname_lastname'
};
const FILTER_FIELD_MAP: Record<string, string> = {
    firstname_lastname: 'name',
    document_name: 'document_name',
    status: 'status'
};
// Tab index -> backend category.
const TAB_CATEGORIES: ThreadCategory[] = [
    'no_writer',
    'new_message',
    'fav',
    'followup',
    'pending_progress',
    'closed',
    'all'
];

const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const DEFAULT_PAGE_SIZE = 20;

const EssayDashboardPaginated = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const viewerId = user?._id?.toString();

    const [tab, setTab] = useState(0);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE
    });
    const [sorting, setSorting] = useState<MRT_SortingState>([
        { id: 'deadline', desc: false }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );

    const category = TAB_CATEGORIES[tab];
    const sortColumn = sorting[0];

    const { counts } = useActiveThreadsCounts({
        fileType: ESSAY_FILE_TYPE,
        viewerId
    });

    const filters = useMemo(() => {
        const out: Record<string, string> = { file_type: ESSAY_FILE_TYPE };
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
            filters,
            viewerId
        }
    );

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

    const { mutate: toggleFavorite } = useMutation({
        mutationFn: (id: string) => putThreadFavorite(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['active-threads/paginated']
            });
            queryClient.invalidateQueries({
                queryKey: ['active-threads/counts']
            });
        }
    });

    const resetPage = () =>
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        resetPage();
    };
    const handleSortingChange = (updater: MRT_Updater<MRT_SortingState>) => {
        setSorting((prev) => applyUpdater(updater, prev));
        resetPage();
    };
    const handleGlobalFilterChange = (updater: MRT_Updater<string>) => {
        setGlobalFilter((prev) => applyUpdater(updater, prev));
        resetPage();
    };
    const handleColumnFiltersChange = (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => {
        setColumnFilters((prev) => applyUpdater(updater, prev));
        resetPage();
    };
    const handlePaginationChange = (
        updater: MRT_Updater<MRT_PaginationState>
    ) => {
        setPagination((prev) => applyUpdater(updater, prev));
    };

    const columns = useMemo<MuiDataGridColumn<OpenTaskRow>[]>(
        () => [
            {
                field: 'firstname_lastname',
                headerName: t('First-, Last Name', { ns: 'common' }),
                width: 170,
                renderCell: (params) => {
                    const row = params.row;
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        String(row.student_id ?? ''),
                        DEMO.PROFILE_HASH
                    )}`;
                    const isFav = (
                        row.flag_by_user_id as string[] | undefined
                    )?.includes(viewerId ?? '');
                    return (
                        <>
                            <IconButton
                                onClick={() => toggleFavorite(row.id as string)}
                                size="small"
                            >
                                {isFav ? (
                                    <StarRoundedIcon color="primary" />
                                ) : (
                                    <StarBorderRoundedIcon color="action" />
                                )}
                            </IconButton>
                            <Link
                                component={LinkDom}
                                target="_blank"
                                title={String(params.value ?? '')}
                                to={linkUrl}
                                underline="hover"
                            >
                                {String(params.value ?? '')}
                            </Link>
                        </>
                    );
                }
            },
            {
                field: 'outsourced_user_name_joined',
                headerName: t('Essay Writer', { ns: 'common' }),
                width: 130,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params) =>
                    (
                        params.row.outsourced_user_id as
                            | Array<{ _id: string; firstname: string }>
                            | undefined
                    )?.map((o) => (
                        <Link
                            component={LinkDom}
                            key={String(o._id)}
                            sx={{ mr: 0.5 }}
                            target="_blank"
                            to={DEMO.TEAM_EDITOR_LINK(String(o._id))}
                            underline="hover"
                        >
                            {o.firstname}
                        </Link>
                    )) || []
            },
            {
                field: 'editors_joined',
                headerName: t('Editors', { ns: 'common' }),
                width: 120,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params) =>
                    (
                        params.row.editors as
                            | Array<{ _id: string; firstname: string }>
                            | undefined
                    )?.map((e) => (
                        <Link
                            component={LinkDom}
                            key={String(e._id)}
                            sx={{ mr: 0.5 }}
                            target="_blank"
                            to={DEMO.TEAM_EDITOR_LINK(String(e._id))}
                            underline="hover"
                        >
                            {e.firstname}
                        </Link>
                    ))
            },
            {
                field: 'agents_joined',
                headerName: t('Agent', { ns: 'common' }),
                width: 120,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params) =>
                    (
                        params.row.agents as
                            | Array<{ _id: string; firstname: string }>
                            | undefined
                    )?.map((a) => (
                        <Link
                            component={LinkDom}
                            key={String(a._id)}
                            sx={{ mr: 0.5 }}
                            target="_blank"
                            to={DEMO.TEAM_AGENT_LINK(String(a._id))}
                            underline="hover"
                        >
                            {a.firstname}
                        </Link>
                    ))
            },
            {
                field: 'deadline',
                headerName: t('Deadline', { ns: 'common' }),
                width: 110,
                enableColumnFilter: false
            },
            {
                field: 'semester',
                headerName: t('Semester', { ns: 'common' }),
                width: 90,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'days_left',
                headerName: t('Days left', { ns: 'common' }),
                width: 90,
                enableColumnFilter: false
            },
            {
                field: 'status',
                headerName: t('Status', { ns: 'common' }),
                width: 120,
                sortable: false,
                filterVariant: 'select',
                filterSelectOptions: [
                    { value: 'Locked', label: t('Locked', { ns: 'common' }) },
                    {
                        value: 'Unlocked',
                        label: t('Unlocked', { ns: 'common' })
                    }
                ],
                renderCell: (params) => {
                    const isLocked =
                        params.row?.isApplicationLocked === true ||
                        params.row?.isProgramLocked === true;
                    return isLocked ? (
                        <Chip
                            color="warning"
                            icon={<LockOutlinedIcon fontSize="small" />}
                            label={t('Locked', { ns: 'common' })}
                            size="small"
                        />
                    ) : (
                        <Chip
                            icon={<LockOpenIcon fontSize="small" />}
                            label={t('Unlocked', { ns: 'common' })}
                            size="small"
                            variant="outlined"
                        />
                    );
                }
            },
            {
                field: 'essay_difficulty',
                headerName: t('Essay Difficulty', { ns: 'common' }),
                width: 90,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'document_name',
                headerName: t('Document name', { ns: 'common' }),
                width: 380,
                filterFn: 'contains',
                renderCell: (params) => {
                    const row = params.row;
                    const linkUrl = `${DEMO.DOCUMENT_MODIFICATION_LINK(
                        String(row.thread_id ?? '')
                    )}`;
                    const programCountry = row.country as string | undefined;
                    const isNonApprovalCountry = programCountry
                        ? !APPROVAL_COUNTRIES.includes(
                              String(programCountry).toLowerCase()
                          )
                        : false;
                    return (
                        <>
                            {(
                                row.attributes as
                                    | Array<{
                                          _id: string;
                                          value: number;
                                          name: string;
                                      }>
                                    | undefined
                            )?.map(
                                (attribute) =>
                                    [1, 3, 9, 10, 11].includes(
                                        attribute.value
                                    ) && (
                                        <Tooltip
                                            key={attribute._id}
                                            title={`${attribute.name}: ${
                                                ATTRIBUTES[attribute.value - 1]
                                                    ?.definition ?? ''
                                            }`}
                                        >
                                            <Chip
                                                color={COLORS[attribute.value]}
                                                label={attribute.name?.[0]}
                                                size="small"
                                            />
                                        </Tooltip>
                                    )
                            )}
                            {row.isFinalVersion ? (
                                <Chip
                                    color="primary"
                                    label="Closed"
                                    size="small"
                                />
                            ) : null}
                            {isNonApprovalCountry && (
                                <Tooltip
                                    title={t('Lack of experience country', {
                                        ns: 'common'
                                    })}
                                >
                                    <WarningAmberIcon
                                        fontSize="small"
                                        sx={{
                                            color: 'warning.main',
                                            ml: 0.5,
                                            mr: 0.5
                                        }}
                                    />
                                </Tooltip>
                            )}
                            <Link
                                component={LinkDom}
                                target="_blank"
                                title={String(params.value ?? '')}
                                to={linkUrl}
                                underline="hover"
                            >
                                {String(params.value ?? '')}
                            </Link>
                        </>
                    );
                }
            },
            {
                field: 'aged_days',
                headerName: t('Aged days', { ns: 'common' }),
                width: 90,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'latest_reply',
                headerName: t('Latest Reply', { ns: 'common' }),
                width: 120,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'updatedAt',
                headerName: t('Last Update', { ns: 'common' }),
                width: 120,
                enableColumnFilter: false
            }
        ],
        [t, viewerId, toggleFavorite]
    );

    const serverMode = {
        rowCount,
        pagination,
        onPaginationChange: handlePaginationChange,
        sorting,
        onSortingChange: handleSortingChange,
        globalFilter,
        onGlobalFilterChange: handleGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange: handleColumnFiltersChange
    };

    const TAB_LABELS = [
        `NO ESSAY WRITER (${counts.no_writer})`,
        `TODO (${counts.new_message})`,
        `My Favorites (${counts.fav})`,
        `FOLLOW UP (${counts.followup})`,
        `NO ACTION (${counts.pending_progress})`,
        `CLOSED (${counts.closed})`,
        `All (${counts.all})`
    ];
    const TAB_ALERTS = [
        <Alert key="0" severity="warning">
            Please assign essay writer to the following essays:
        </Alert>,
        <Alert key="1" severity="warning">
            Follow up
        </Alert>,
        <Alert key="2" severity="info">
            My Favorite
        </Alert>,
        <Alert key="3" severity="info">
            Follow up
        </Alert>,
        <Alert key="4" severity="info">
            Waiting inputs. No action needed
        </Alert>,
        <Box key="5">
            <Alert severity="success">These tasks are closed.</Alert>
            <Typography variant="body2">
                {t(
                    'Note: if the documents are not closed but locate here, it is because the applications are already submitted. The documents can safely closed eventually.',
                    { ns: 'cvmlrl' }
                )}
            </Typography>
        </Box>,
        <Alert key="6" severity="info">
            All Essays
        </Alert>
    ];

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="essay tabs"
                    onChange={handleTabChange}
                    scrollButtons="auto"
                    value={tab}
                    variant="scrollable"
                >
                    {TAB_LABELS.map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            {...a11yProps(tab, index)}
                        />
                    ))}
                </Tabs>
            </Box>
            {TAB_CATEGORIES.map((cat, index) => (
                <CustomTabPanel index={index} key={cat} value={tab}>
                    {TAB_ALERTS[index]}
                    {tab === index ? (
                        <MuiDataGrid
                            autoHeight
                            columnVisibilityModel={{
                                number_input_from_editors: false,
                                number_input_from_student: false
                            }}
                            columns={columns}
                            isLoading={isLoading || isFetching}
                            rows={data as Record<string, unknown>[]}
                            serverMode={serverMode}
                        />
                    ) : null}
                </CustomTabPanel>
            ))}
        </>
    );
};

export default EssayDashboardPaginated;
