import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as LinkDom, useSearchParams } from 'react-router-dom';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_RowSelectionState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import DEMO from '@store/constant';
import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';
import { ProgramsMobileView } from './mobile/ProgramsMobileView';
import { ProgramsFilterRail } from './ProgramsFilterRail';
import { ProgramResultsList } from './desktop/ProgramResultsList';
import type { ProgramResultRow } from './desktop/ProgramResultCard';
import { COUNTRIES_ARRAY_OPTIONS } from '@utils/contants';
import { PROGRAM_SUBJECTS, SCHOOL_TAGS } from '@taiger-common/model';
import { usePrograms } from '@hooks/usePrograms';
import {
    columnFiltersToProgramListFilters,
    programTableStateToSearchParams,
    searchParamsToProgramTableState,
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
    const { t } = useTranslation();
    const theme = useTheme();
    // Below md the rail + card row does not fit; the mobile view owns that case.
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openAssignDialog, setOpenAssignDialog] = useState(false);

    // Seed table state from the URL on mount so a shared link reproduces the
    // exact search/filter/page view. URL writes after this are one-way
    // (state -> URL), so we only read the query string once.
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTableState = useMemo(
        () => searchParamsToProgramTableState(searchParams),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [pagination, setPagination] = useState<MRT_PaginationState>(
        initialTableState.pagination
    );
    const [globalFilter, setGlobalFilter] = useState(
        initialTableState.globalFilter
    );
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        initialTableState.columnFilters
    );
    const [sorting, setSorting] = useState<MRT_SortingState>(
        initialTableState.sorting
    );
    const [debouncedSearch, setDebouncedSearch] = useState(
        initialTableState.globalFilter.trim()
    );
    const [debouncedColumnFilters, setDebouncedColumnFilters] =
        useState<ProgramListFilters>(
            columnFiltersToProgramListFilters(initialTableState.columnFilters)
        );
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [selectedProgramsById, setSelectedProgramsById] = useState<
        Record<string, ProgramsTableProgramRow>
    >({});

    const isInitialFilterRun = useRef(true);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(globalFilter.trim());
            setDebouncedColumnFilters(
                columnFiltersToProgramListFilters(columnFilters)
            );
            // Don't reset the page on the first run — a shared URL may point at
            // a specific page. Only changing a filter afterwards sends the user
            // back to page 1.
            if (isInitialFilterRun.current) {
                isInitialFilterRun.current = false;
            } else {
                setPagination((current) => ({ ...current, pageIndex: 0 }));
                setRowSelection({});
                setSelectedProgramsById({});
            }
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [globalFilter, columnFilters]);

    // Mirror the current search/filter/sort/page state into the URL (replace, so
    // we don't spam browser history) so the address bar is always shareable.
    useEffect(() => {
        const nextParams = programTableStateToSearchParams({
            globalFilter,
            columnFilters,
            sorting,
            pagination
        });
        setSearchParams(nextParams, { replace: true });
    }, [globalFilter, columnFilters, sorting, pagination, setSearchParams]);

    // Server-side sort: forward the active column + direction so the BACKEND
    // sorts the whole result set (not just the current page). `sortBy` is the
    // column id (matches the server's allowed fields); omitted when unsorted.
    const sortColumn = sorting[0];
    const { data, isLoading, isFetching } = usePrograms({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
        filters: debouncedColumnFilters,
        sortBy: sortColumn?.id,
        sortOrder: sortColumn ? (sortColumn.desc ? 'desc' : 'asc') : undefined
    });

    // Changing the sort returns the user to the first page (and clears any
    // selection), like the filter/search handlers do.
    const handleSortingChange = useCallback(
        (updater: MRT_Updater<MRT_SortingState>) => {
            setSorting((previous) =>
                typeof updater === 'function' ? updater(previous) : updater
            );
            setPagination((current) => ({ ...current, pageIndex: 0 }));
            setRowSelection({});
            setSelectedProgramsById({});
        },
        []
    );

    const selectedPrograms = useMemo(
        () => Object.values(selectedProgramsById),
        [selectedProgramsById]
    );
    const selectedCount = selectedPrograms.length;

    const clearSelection = useCallback(() => {
        setRowSelection({});
        setSelectedProgramsById({});
    }, []);

    // Toggle a single program's selection. Shared by the desktop cards and the
    // mobile card list; both feed the same rowSelection the assign flow reads.
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

    // Select/deselect every program on the current page at once.
    const handleSelectPage = useCallback(
        (programIds: string[], selected: boolean) => {
            setRowSelection((previous) => {
                const next = { ...previous };
                programIds.forEach((id) => {
                    if (selected) {
                        next[id] = true;
                    } else {
                        delete next[id];
                    }
                });
                return next;
            });
        },
        []
    );

    // Keep the full program objects for the current selection: the assign dialog
    // needs the rows themselves, and they would otherwise be lost when the user
    // pages away from them.
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

    const subjectGroups = useMemo(
        () =>
            Object.entries(PROGRAM_SUBJECTS).map(([code, { label }]) => ({
                code,
                label
            })),
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

    // Filter option lists shared with the desktop rail and the mobile drawer.
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

    // The page actions used to live in the table toolbar; they now sit at the
    // top of the filter rail.
    const railActions = (
        <>
            <Button
                color="success"
                disabled={selectedCount === 0}
                fullWidth
                onClick={handleAssignClick}
                startIcon={<PersonAddIcon />}
                variant="contained"
            >
                {selectedCount > 0
                    ? `${t('Assign', { ns: 'common' })} (${selectedCount})`
                    : t('Assign', { ns: 'common' })}
            </Button>
            <Button
                component={LinkDom}
                fullWidth
                to={DEMO.NEW_PROGRAM}
                variant="contained"
            >
                {t('Add New Program')}
            </Button>
            <Button
                component={LinkDom}
                fullWidth
                to={DEMO.PROGRAM_ANALYSIS}
                variant="outlined"
            >
                {t('Program Requirements', { ns: 'common' })}
            </Button>
            <Button
                component={LinkDom}
                fullWidth
                to={DEMO.SCHOOL_CONFIG}
                variant="outlined"
            >
                {t('School Configuration', { ns: 'common' })}
            </Button>
        </>
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
                <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
                    <ProgramsFilterRail
                        actions={railActions}
                        columnFilters={columnFilters}
                        countryOptions={countryOptions}
                        globalFilter={globalFilter}
                        setColumnFilters={setColumnFilters}
                        setGlobalFilter={setGlobalFilter}
                        statusOptions={statusOptions}
                        subjectOptions={subjectFilterOptions}
                        tagOptions={tagFilterOptions}
                    />
                    {/* minWidth:0 lets the results column shrink instead of
                        overflowing the flex row. */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ProgramResultsList
                            clearSelection={clearSelection}
                            globalFilter={globalFilter}
                            isLoading={isLoading || isFetching}
                            onSelectPage={handleSelectPage}
                            onToggleSelect={toggleProgramSelection}
                            pagination={pagination}
                            programs={
                                (data?.programs ?? []) as ProgramResultRow[]
                            }
                            rowSelection={rowSelection}
                            selectedCount={selectedCount}
                            setGlobalFilter={setGlobalFilter}
                            setPagination={setPagination}
                            setSorting={handleSortingChange}
                            sorting={sorting}
                            total={data?.total ?? 0}
                        />
                    </Box>
                </Box>
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
