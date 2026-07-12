import { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMediaQuery, useTheme } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { getTableConfig, useTableStyles } from '@components/table';

import { TopToolbar } from '@components/table/interviews-table/TopToolbar';
import { AssignTrainerDialog } from './AssignTrainerDialog';
import { InterviewsMobileView } from './mobile/InterviewsMobileView';
import { getUsers, updateInterview, ESSAY_WRITERS_QUERY_STRING } from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import { useAuth } from '@components/AuthProvider';
import type { IUser, IUserWithId } from '@taiger-common/model';
import type {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

/**
 * Opt-in server-side mode. When provided, the table stops doing its own
 * pagination/sorting/filtering and reflects the controlled state, forwarding
 * user interactions to the parent (which refetches a page).
 */
export interface InterviewsTableServerMode {
    rowCount: number;
    pagination: MRT_PaginationState;
    onPaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
    sorting: MRT_SortingState;
    onSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
    globalFilter: string;
    onGlobalFilterChange: (updater: MRT_Updater<string>) => void;
    columnFilters: MRT_ColumnFiltersState;
    onColumnFiltersChange: (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => void;
}

export interface InterviewsTableProps {
    isLoading: boolean;
    data: Record<string, unknown>[] | undefined;
    columns: MRT_ColumnDef<Record<string, unknown>>[];
    /** When set, the table runs in server-side pagination/sort/filter mode. */
    serverMode?: InterviewsTableServerMode;
}

type InterviewRow = Record<string, unknown>;

export const InterviewsTable = ({
    isLoading,
    data,
    columns,
    serverMode
}: InterviewsTableProps) => {
    const { user } = useAuth();
    const theme = useTheme();
    // Below md the wide interview table forces horizontal scroll; show cards.
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const customTableStyles = useTableStyles();
    // useTableStyles() exposes none of the keys getTableConfig reads, so the
    // resulting `sx` values were already undefined at runtime.
    const tableConfig = getTableConfig({}, isLoading);
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [trainers, setTrainers] = useState<IUserWithId[]>([]);
    const [trainerId, setTrainerId] = useState<Set<string>>(new Set());
    // The interview currently being assigned a trainer — set from the MRT row
    // selection (desktop) or a card action (mobile).
    const [targetInterview, setTargetInterview] = useState<InterviewRow | null>(
        null
    );
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const canAssign = user != null && is_TaiGer_role(user as IUser);

    const table = useMaterialReactTable({
        ...tableConfig,
        // getTableConfig widens these MUI variant/size literals to `string`;
        // restate them so they keep their literal types (same values).
        muiSearchTextFieldProps: {
            ...tableConfig.muiSearchTextFieldProps,
            variant: 'outlined'
        },
        muiFilterTextFieldProps: {
            ...tableConfig.muiFilterTextFieldProps,
            variant: 'outlined',
            size: 'small'
        },
        muiPaginationProps: {
            ...tableConfig.muiPaginationProps,
            variant: 'outlined'
        },
        columns,
        state: {
            isLoading,
            ...(serverMode
                ? {
                      pagination: serverMode.pagination,
                      sorting: serverMode.sorting,
                      globalFilter: serverMode.globalFilter,
                      columnFilters: serverMode.columnFilters
                  }
                : {})
        },
        data: data || [],
        // Facets would only reflect the current page in server mode.
        enableFacetedValues: !serverMode,
        ...(serverMode
            ? {
                  manualPagination: true,
                  manualSorting: true,
                  manualFiltering: true,
                  rowCount: serverMode.rowCount,
                  onPaginationChange: serverMode.onPaginationChange,
                  onSortingChange: serverMode.onSortingChange,
                  onGlobalFilterChange: serverMode.onGlobalFilterChange,
                  onColumnFiltersChange: serverMode.onColumnFiltersChange
              }
            : {})
    });

    const loadTrainers = async (interview: InterviewRow | null) => {
        const res = await getUsers(ESSAY_WRITERS_QUERY_STRING);
        const editors_a = res.data?.data ?? [];
        setTrainers(editors_a);
        setTrainerId(
            new Set(
                (interview?.trainer_id as { _id: string }[] | undefined)?.map(
                    ({ _id }) => _id.toString()
                )
            )
        );
    };

    const openAssignFor = (interview: InterviewRow | null) => {
        if (!interview) return;
        setTargetInterview(interview);
        setOpenAssignDialog(true);
        loadTrainers(interview);
    };

    const updateTrainer = async () => {
        if (!targetInterview?._id) return;
        const temp_trainer_id_array = Array.from(trainerId);
        const resp = await updateInterview(
            (targetInterview._id as { toString: () => string }).toString(),
            {
                trainer_id: temp_trainer_id_array
            }
        );
        const { success } = resp.data;
        if (success) {
            table.resetRowSelection();
            setOpenAssignDialog(false);
            setTargetInterview(null);
            setTrainerId(new Set());
            setSeverity('success');
            setMessage('Assigned interview trainer successfully!');
            setOpenSnackbar(true);
        }
    };

    const modifyTrainer = (new_trainerId: string, isActive: boolean) => {
        if (isActive) {
            const temp = new Set([...trainerId]);
            temp.delete(new_trainerId);
            setTrainerId(new Set(temp));
        } else {
            const temp = new Set([...trainerId]);
            temp.add(new_trainerId);
            setTrainerId(new Set(temp));
        }
    };

    // Desktop: assign the single selected row.
    const handleAssignClick = () => {
        const selected = table.getSelectedRowModel()?.rows[0]?.original as
            | InterviewRow
            | undefined;
        openAssignFor(selected ?? null);
    };

    const handleDialogClose = () => {
        setOpenAssignDialog(false);
        setTargetInterview(null);
    };

    /* material-react-table expects toolbar to be assigned to options */
    // eslint-disable-next-line react-hooks/immutability
    table.options.renderTopToolbar = (
        <TopToolbar
            onAssignClick={handleAssignClick}
            table={table}
            toolbarStyle={customTableStyles.toolbarStyle}
            user={user}
        />
    );

    return (
        <>
            {isMobile && serverMode ? (
                <InterviewsMobileView
                    canAssign={canAssign}
                    columnFilters={serverMode.columnFilters}
                    globalFilter={serverMode.globalFilter}
                    isLoading={isLoading}
                    onAssign={openAssignFor}
                    pagination={serverMode.pagination}
                    rows={data ?? []}
                    setColumnFilters={serverMode.onColumnFiltersChange}
                    setGlobalFilter={serverMode.onGlobalFilterChange}
                    setPagination={serverMode.onPaginationChange}
                    total={serverMode.rowCount}
                />
            ) : (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MaterialReactTable table={table} />
                </LocalizationProvider>
            )}
            <AssignTrainerDialog
                modifyTrainer={modifyTrainer}
                onClose={handleDialogClose}
                open={openAssignDialog}
                trainerId={trainerId}
                trainers={trainers}
                updateTrainer={updateTrainer}
            />
        </>
    );
};
