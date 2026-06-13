import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnFiltersState,
    type MRT_PaginationState,
    type MRT_RowSelectionState,
    type MRT_Updater
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '@components/table';
import { useTranslation } from 'react-i18next';
import {
    Link,
    Box,
    Chip,
    Button,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import DEMO from '@store/constant';
import { TopToolbar } from '@components/table/programs-table/TopToolbar';
import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';
import { ProgramsMobileView } from './mobile/ProgramsMobileView';
import { COUNTRIES_ARRAY_OPTIONS } from '@utils/contants';
import { PROGRAM_SUBJECTS, SCHOOL_TAGS } from '@taiger-common/model';
import { calculateProgramLockStatus } from '../Utils/util_functions';
import { MRT_ColumnDef } from 'material-react-table';
import { usePrograms } from '@hooks/usePrograms';
import {
    columnFiltersToProgramListFilters,
    type ProgramListFilters
} from './programListFilters';
/** Program row in ProgramsTable (data array item) */
export interface ProgramsTableProgramRow {
    _id?: string | number;
    school?: string;
    program_name?: string;
    programSubjects?: string[];
    tags?: string[];
}

/** Student passed to AssignProgramsToStudentDialog */
export interface ProgramsTableStudent {
    _id?: string;
}

export interface ProgramsTableProps {
    student?: ProgramsTableStudent;
}

const getProgramRowId = (program: ProgramsTableProgramRow) =>
    String(program._id ?? '');

export const ProgramsTable = ({ student }: ProgramsTableProps) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    const theme = useTheme();
    // Below md the 13-column table forces horizontal scroll; render a card list.
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 20
    });
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedColumnFilters, setDebouncedColumnFilters] =
        useState<ProgramListFilters>({});
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [selectedProgramsById, setSelectedProgramsById] = useState<
        Record<string, ProgramsTableProgramRow>
    >({});

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(globalFilter.trim());
            setDebouncedColumnFilters(
                columnFiltersToProgramListFilters(columnFilters)
            );
            setPagination((current) => ({ ...current, pageIndex: 0 }));
            setRowSelection({});
            setSelectedProgramsById({});
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [globalFilter, columnFilters]);

    const { data, isLoading, isFetching } = usePrograms({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
        filters: debouncedColumnFilters
    });

    const selectedPrograms = useMemo(
        () => Object.values(selectedProgramsById),
        [selectedProgramsById]
    );
    const selectedCount = selectedPrograms.length;

    const clearSelection = useCallback(() => {
        setRowSelection({});
        setSelectedProgramsById({});
    }, []);

    // Toggle a single program's selection (used by the mobile card list). Feeds
    // the same rowSelection state the desktop table + assign flow rely on.
    const toggleProgramSelection = useCallback((programId: string) => {
        setRowSelection((previous) => {
            const next = { ...previous };
            if (next[programId]) {
                delete next[programId];
            } else {
                next[programId] = true;
            }
            return next;
        });
    }, []);

    const handleRowSelectionChange = useCallback(
        (updater: MRT_Updater<MRT_RowSelectionState>) => {
            setRowSelection((previousSelection) =>
                typeof updater === 'function'
                    ? updater(previousSelection)
                    : updater
            );
        },
        []
    );

    useEffect(() => {
        const currentPrograms = data?.programs ?? [];

        setSelectedProgramsById((previousPrograms) => {
            const nextPrograms = { ...previousPrograms };
            const currentPageIds = new Set(
                currentPrograms.map(getProgramRowId)
            );

            currentPageIds.forEach((id) => {
                if (rowSelection[id]) {
                    const program = currentPrograms.find(
                        (item) => getProgramRowId(item) === id
                    );
                    if (program) {
                        nextPrograms[id] = program;
                    }
                } else {
                    delete nextPrograms[id];
                }
            });

            return nextPrograms;
        });
    }, [rowSelection, data?.programs]);
    const tableConfig = getTableConfig(
        customTableStyles as Parameters<typeof getTableConfig>[0],
        isLoading || isFetching
    );

    const subjectGroups = useMemo(
        () =>
            Object.entries(PROGRAM_SUBJECTS).map(
                ([code, { label, category }]) => ({
                    code,
                    label,
                    category,
                    groupBy: category
                })
            ),
        []
    );

    const tagFilterOptions = useMemo(
        () =>
            Object.entries(SCHOOL_TAGS).map(([code, { label }]) => ({
                value: code,
                label
            })),
        []
    );

    // Filter option lists shared with the mobile filter drawer.
    const statusOptions = useMemo(
        () => [
            { value: 'Locked', label: t('Locked', { ns: 'common' }) },
            { value: 'Unlocked', label: t('Unlocked', { ns: 'common' }) }
        ],
        [t]
    );
    const countryOptions = useMemo(
        () =>
            COUNTRIES_ARRAY_OPTIONS.map((item) => ({
                value: String(item.value),
                label: String(item.label ?? item.value)
            })),
        []
    );
    const subjectFilterOptions = useMemo(
        () =>
            subjectGroups.map((item) => ({
                value: item.code,
                label: item.label
            })),
        [subjectGroups]
    );
    const columns: Array<MRT_ColumnDef<ProgramsTableProgramRow>> = [
        {
            accessorFn: (row) => {
                const lockStatus = calculateProgramLockStatus(row as never);
                return lockStatus.isLocked ? 'Locked' : 'Unlocked';
            },
            id: 'status',
            header: t('Status', { ns: 'common' }),
            size: 110,
            filterVariant: 'select',
            filterFn: (row, _columnId, filterValue) => {
                const lockStatus = calculateProgramLockStatus(
                    row.original as never
                );
                const status = lockStatus.isLocked ? 'Locked' : 'Unlocked';
                return status === filterValue;
            },
            filterSelectOptions: [
                {
                    value: 'Locked',
                    label: t('Locked', { ns: 'common' })
                },
                {
                    value: 'Unlocked',
                    label: t('Unlocked', { ns: 'common' })
                }
            ],
            Cell: ({ row }) => {
                const lockStatus = calculateProgramLockStatus(
                    row.original as never
                );

                return lockStatus.isLocked ? (
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
            accessorKey: 'school',
            header: t('School', { ns: 'common' }),
            filterFn: 'contains',
            size: 250,
            Cell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(String(params.row.original._id ?? ''))}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.school}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'program_name',
            header: t('Program', { ns: 'common' }),
            size: 250,
            Cell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(String(params.row.original._id ?? ''))}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.program_name}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'programSubjects',
            header: t('Subjects', { ns: 'common' }),
            filterVariant: 'multi-select',
            filterSelectOptions: subjectGroups.map((item) => ({
                value: item.code,
                label: item.label
            })),
            size: 200,
            Cell: ({ row }) => {
                const subjects = row.original.programSubjects || [];
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {subjects.map((subject, index) => (
                            <Chip
                                key={index}
                                label={subject}
                                size="small"
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'tags',
            header: t('Tags', { ns: 'common' }),
            filterVariant: 'multi-select',
            filterSelectOptions: tagFilterOptions,
            size: 200,
            Cell: ({ row }) => {
                const tags = row.original.tags || [];
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'country',
            filterVariant: 'multi-select',
            filterSelectOptions: COUNTRIES_ARRAY_OPTIONS.map(
                (item) => item.value
            ),
            header: t('Country', { ns: 'common' }),
            size: 90
        },
        {
            accessorKey: 'degree',
            header: t('Degree', { ns: 'common' }),
            filterVariant: 'text',
            size: 90
        },
        {
            accessorKey: 'semester',
            header: t('Semester', { ns: 'common' }),
            filterVariant: 'text',
            size: 100
        },
        {
            accessorKey: 'lang',
            header: t('Language', { ns: 'common' }),
            filterVariant: 'text',
            size: 120
        },
        {
            accessorKey: 'toefl',
            header: t('TOEFL', { ns: 'common' }),
            filterVariant: 'text',
            size: 100
        },
        {
            accessorKey: 'ielts',
            header: t('IELTS', { ns: 'common' }),
            filterVariant: 'text',
            size: 100
        },
        {
            accessorKey: 'gre',
            header: t('GRE', { ns: 'common' }),
            filterVariant: 'text',
            size: 120
        },
        {
            accessorKey: 'gmat',
            header: t('GMAT', { ns: 'common' }),
            filterVariant: 'text',
            size: 120
        },
        {
            accessorKey: 'application_deadline',
            header: t('Deadline', { ns: 'common' }),
            filterVariant: 'text',
            size: 120
        },
        {
            accessorKey: 'updatedAt',
            header: t('Last update', { ns: 'common' }),
            size: 150
        }
    ];

    const table = useMaterialReactTable({
        ...(tableConfig as Record<string, unknown>),
        columns,
        data: data?.programs ?? [],
        getRowId: (row) => getProgramRowId(row),
        manualPagination: true,
        manualFiltering: true,
        rowCount: data?.total ?? 0,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: handleRowSelectionChange,
        state: {
            isLoading: isLoading || isFetching,
            pagination,
            globalFilter,
            columnFilters,
            rowSelection
        },
        renderToolbarAlertBannerContent: () =>
            selectedCount > 0 ? (
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 2,
                        px: 2,
                        py: 1,
                        width: '100%'
                    }}
                >
                    <Typography variant="body2">
                        {t('{{count}} program(s) selected', {
                            count: selectedCount,
                            ns: 'programList',
                            defaultValue: `${selectedCount} program(s) selected`
                        })}
                    </Typography>
                    <Button onClick={clearSelection} size="small">
                        {t('Clear selection', { ns: 'common' })}
                    </Button>
                </Box>
            ) : null
    } as Parameters<typeof useMaterialReactTable<ProgramsTableProgramRow>>[0]);

    const handleAssignClick = () => {
        if (selectedCount === 0) {
            return;
        }
        setOpenAssignDialog(true);
    };

    const handleDialogClose = () => {
        setOpenAssignDialog(false);
    };

    const handleOnSuccess = () => {
        clearSelection();
        setOpenAssignDialog(false);
    };
    /* material-react-table expects toolbar to be assigned to options */
    // eslint-disable-next-line react-hooks/immutability
    table.options.renderTopToolbar = (
        <TopToolbar
            onAssignClick={handleAssignClick}
            selectedCount={selectedCount}
            table={table as never}
            toolbarStyle={customTableStyles.toolbarStyle}
        />
    );

    return (
        <>
            {isMobile ? (
                <ProgramsMobileView
                    clearSelection={clearSelection}
                    columnFilters={columnFilters}
                    countryOptions={countryOptions}
                    globalFilter={globalFilter}
                    isLoading={isLoading || isFetching}
                    onAssignClick={handleAssignClick}
                    onToggleSelect={toggleProgramSelection}
                    pagination={pagination}
                    programs={(data?.programs ?? []) as never[]}
                    rowSelection={rowSelection}
                    selectedCount={selectedCount}
                    setColumnFilters={setColumnFilters}
                    setGlobalFilter={setGlobalFilter}
                    setPagination={setPagination}
                    statusOptions={statusOptions}
                    subjectOptions={subjectFilterOptions}
                    tagOptions={tagFilterOptions}
                    total={data?.total ?? 0}
                />
            ) : (
                <MaterialReactTable table={table} />
            )}
            <AssignProgramsToStudentDialog
                handleOnSuccess={handleOnSuccess}
                onClose={handleDialogClose}
                open={openAssignDialog}
                programs={selectedPrograms as never[]}
                student={student as never}
            />
        </>
    );
};
