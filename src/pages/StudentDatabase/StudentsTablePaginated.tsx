import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';
import type { IStudentResponse } from '@taiger-common/model';

import useStudents from '@hooks/useStudents';
import { useStudentsV3Paginated } from '@hooks/useStudentsV3Paginated';
import { student_transform } from '../Utils/util_functions';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { StudentsTable } from './StudentsTable';
import {
    defaultStudentsTableState,
    searchParamsToStudentsTableState,
    writeStudentsTableParams
} from './studentsTableUrlState';

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

export interface StudentsTablePaginatedProps {
    /** Scope to (non-)archived students. Omit for all students. */
    archiv?: boolean;
    /** Scope to students supervised by this agent id. */
    agents?: string;
    /** Scope to students supervised by this editor id. */
    editors?: string;
    /**
     * Mirror search/sort/filter/pagination into the URL query string so the
     * view is shareable. Opt-in, since this table also renders on pages where
     * URL sync would collide with other state. Default false.
     */
    syncUrl?: boolean;
}

/**
 * Server-side paginated students table. Self-contained: fetches one page via
 * useStudentsV3Paginated, runs the existing row transform on it, and wires the
 * agent/editor/attributes/archive mutation modals (via useStudents) + error
 * modal. Backend sort/filter keys are the table column ids, so they map 1:1.
 */
export const StudentsTablePaginated = ({
    archiv,
    agents,
    editors,
    syncUrl = false
}: StudentsTablePaginatedProps = {}) => {
    // Seed from the URL on mount when sharing is enabled; otherwise fall back to
    // the table defaults (newest students first). URL writes after this are
    // one-way (state -> URL), so we only read the query string once.
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTableState = useMemo(
        () =>
            syncUrl
                ? searchParamsToStudentsTableState(searchParams)
                : defaultStudentsTableState(),
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

    // Mirror the current state into the URL (replace, so we don't spam history).
    // Only the table's own keys are touched, preserving e.g. the active `tab`.
    useEffect(() => {
        if (!syncUrl) {
            return;
        }
        setSearchParams(
            (prev) =>
                writeStudentsTableParams(prev, {
                    globalFilter,
                    sorting,
                    columnFilters,
                    pagination
                }),
            { replace: true }
        );
    }, [
        syncUrl,
        globalFilter,
        sorting,
        columnFilters,
        pagination,
        setSearchParams
    ]);

    const sortColumn = sorting[0];

    // Backend filter keys are the column ids (name_en, agentNames, ...), so the
    // column filters map directly.
    const filters = useMemo(() => {
        const out: Record<string, string> = {};
        columnFilters.forEach(({ id, value }) => {
            if (typeof value === 'string' && value !== '') {
                out[id] = value;
            }
        });
        return out;
    }, [columnFilters]);

    const { rows, rowCount, isLoading, isFetching } = useStudentsV3Paginated({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sortColumn?.id,
        sortOrder: sortColumn?.desc ? 'desc' : 'asc',
        search: globalFilter || undefined,
        archiv,
        agents,
        editors,
        filters
    });

    // useStudents keeps an optimistically-patched copy of the page rows, so the
    // agent/editor/attributes/archive modals update the visible row in place.
    const {
        res_modal_status,
        res_modal_message,
        ConfirmError,
        students,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus
    } = useStudents({ students: rows as IStudentResponse[] });

    const data = useMemo(() => student_transform(students), [students]);

    // Reset to the first page whenever the sort / search / filters change.
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

    return (
        <>
            <StudentsTable
                data={data}
                isLoading={isLoading || isFetching}
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
                submitUpdateAgentlist={submitUpdateAgentlist}
                submitUpdateAttributeslist={submitUpdateAttributeslist}
                submitUpdateEditorlist={submitUpdateEditorlist}
                updateStudentArchivStatus={updateStudentArchivStatus}
            />
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
        </>
    );
};

export default StudentsTablePaginated;
