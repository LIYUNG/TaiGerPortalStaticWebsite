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

import { MuiDataGrid, type MuiDataGridColumn } from '@components/MuiDataGrid';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import DEMO from '@store/constant';
import { ATTRIBUTES, COLORS, convertDate } from '@utils/contants';
import { APPROVAL_COUNTRIES } from '../Utils/util_functions';
import { useAuth } from '@components/AuthProvider';
import { putThreadFavorite, queryClient } from '@/api';
import { useActiveThreadsPaginated } from '@hooks/useActiveThreadsPaginated';
import type { ThreadCategory } from '@hooks/useActiveThreadsPaginated';
import { useActiveThreadsCounts } from '@hooks/useActiveThreadsCounts';
import type { OpenTaskRow } from '@/api/types';

type CellParams = { value: unknown; row: OpenTaskRow; field: string };

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
    lang: 'lang',
    status: 'status',
    deadline: 'deadline'
};
const TAB_CATEGORIES: ThreadCategory[] = [
    'new_message',
    'fav',
    'followup',
    'pending_progress',
    'closed'
];

const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const DEFAULT_PAGE_SIZE = 20;

export interface CVMLRLOverviewPaginatedProps {
    /** Scope to this TaiGer user's supervised students (+ outsourced essays). */
    userId: string;
    /** Comma-separated doc types to include. Omit for all. */
    fileType?: string;
    /**
     * Comma-separated doc types to exclude unless the viewer is an outsourced
     * collaborator on the thread (e.g. agent-support docs in the CVMLRL center).
     */
    excludeFileType?: string;
}

const CVMLRLOverviewPaginated = ({
    userId,
    fileType,
    excludeFileType
}: CVMLRLOverviewPaginatedProps) => {
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
        fileType,
        excludeFileType,
        viewerId,
        userId
    });

    const filters = useMemo(() => {
        const out: Record<string, string> = {};
        if (fileType) out.file_type = fileType;
        if (excludeFileType) out.excludeFileType = excludeFileType;
        columnFilters.forEach(({ id, value }) => {
            const key = FILTER_FIELD_MAP[id];
            if (key && typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [columnFilters, fileType, excludeFileType]);

    const { rows, rowCount, isLoading, isFetching } = useActiveThreadsPaginated(
        {
            page: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy: sortColumn ? SORT_FIELD_MAP[sortColumn.id] : undefined,
            sortOrder: sortColumn?.desc ? 'desc' : 'asc',
            search: globalFilter || undefined,
            category,
            filters,
            viewerId,
            userId
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
                minWidth: 200,
                renderCell: (params: CellParams) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        String(params.row.student_id ?? ''),
                        DEMO.PROFILE_HASH
                    )}`;
                    const val = String(params.value ?? '');
                    const isFav = (
                        params.row.flag_by_user_id as string[] | undefined
                    )?.includes(viewerId ?? '');
                    return (
                        <>
                            <IconButton
                                onClick={() =>
                                    toggleFavorite(params.row.id as string)
                                }
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
                                title={val}
                                to={linkUrl}
                                underline="hover"
                            >
                                {val}
                            </Link>
                        </>
                    );
                }
            },
            {
                field: 'deadline',
                headerName: t('Deadline', { ns: 'common' }),
                minWidth: 100,
                // Year/month text match against the displayed deadline string
                // (e.g. "2025/09"); also matches "Rolling"/"WITHDRAW". Filtered
                // server-side via a regex on the computed deadline field.
                filterVariant: 'text'
            },
            {
                field: 'days_left',
                headerName: t('Days left', { ns: 'common' }),
                minWidth: 80,
                enableColumnFilter: false
            },
            {
                field: 'lang',
                headerName: t('Program Language', { ns: 'common' }),
                minWidth: 80,
                sortable: false
            },
            {
                field: 'status',
                headerName: t('Status', { ns: 'common' }),
                minWidth: 110,
                sortable: false,
                filterVariant: 'select',
                filterSelectOptions: [
                    { value: 'Locked', label: t('Locked', { ns: 'common' }) },
                    {
                        value: 'Unlocked',
                        label: t('Unlocked', { ns: 'common' })
                    }
                ],
                renderCell: (params: CellParams) => {
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
                field: 'document_name',
                headerName: t('Document name', { ns: 'common' }),
                minWidth: 380,
                filterFn: 'contains',
                renderCell: (params: CellParams) => {
                    const linkUrl = `${DEMO.DOCUMENT_MODIFICATION_LINK(
                        params.row.thread_id as string
                    )}`;
                    const programCountry = params.row?.country as
                        | string
                        | undefined;
                    const isNonApprovalCountry = programCountry
                        ? !APPROVAL_COUNTRIES.includes(
                              String(programCountry).toLowerCase()
                          )
                        : false;
                    const attributes = (params.row?.attributes ?? []) as Array<{
                        _id: string;
                        value: number;
                        name: string;
                    }>;
                    const val = String(params.value ?? '');
                    return (
                        <Box>
                            {attributes
                                .filter((a) =>
                                    [1, 3, 9, 10, 11].includes(a.value)
                                )
                                .map((a) => (
                                    <Tooltip
                                        key={a._id}
                                        title={`${a.name}: ${ATTRIBUTES[a.value - 1]?.definition ?? ''}`}
                                    >
                                        <Chip
                                            color={COLORS[a.value]}
                                            label={a.name?.[0]}
                                            size="small"
                                        />
                                    </Tooltip>
                                ))}
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
                                title={val}
                                to={linkUrl}
                                underline="hover"
                            >
                                {String(params.row.file_type ?? '')}
                                {params.row.program_id
                                    ? ` - ${String(params.row.program_name ?? '')} - ${String(params.row.degree ?? '')}`
                                    : ''}
                            </Link>
                            <Typography
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.25 }}
                                variant="caption"
                            >
                                {String(params.row.school ?? '')}
                            </Typography>
                        </Box>
                    );
                }
            },
            {
                field: 'aged_days',
                headerName: t('Aged days', { ns: 'common' }),
                minWidth: 80,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'number_input_from_editors',
                headerName: t('Editor Feedback (#Messages/#Files)', {
                    ns: 'common'
                }),
                width: 80,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'number_input_from_student',
                headerName: t('Student Feedback (#Messages/#Files)', {
                    ns: 'common'
                }),
                width: 80,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'latest_reply',
                headerName: t('Latest Reply', { ns: 'common' }),
                width: 100,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'updatedAt',
                headerName: t('Last Update', { ns: 'common' }),
                width: 100,
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
        `${t('TODO', { ns: 'common' })} (${counts.new_message})`,
        `${t('My Favorites', { ns: 'common' })} (${counts.fav})`,
        `${t('Follow up', { ns: 'common' })} (${counts.followup})`,
        `${t('No Action', { ns: 'common' })} (${counts.pending_progress})`,
        `${t('Closed', { ns: 'common' })} (${counts.closed})`
    ];
    const TAB_ALERTS = [
        <Alert data-testid="banner" key="new" severity="warning">
            {' '}
            Please reply:{' '}
        </Alert>,
        null,
        <Alert key="followup" severity="info">
            {' '}
            Follow up{' '}
        </Alert>,
        <Alert key="pending" severity="info">
            Waiting inputs. No action needed
        </Alert>,
        <Box key="closed">
            <Alert severity="success"> These tasks are closed. </Alert>
            <Typography variant="body2">
                {t(
                    'Note: if the documents are not closed but locate here, it is because the applications are already submitted. The documents can safely closed eventually.',
                    { ns: 'cvmlrl' }
                )}
            </Typography>
        </Box>
    ];

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="cvmlrl overview tabs"
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

export default CVMLRLOverviewPaginated;
