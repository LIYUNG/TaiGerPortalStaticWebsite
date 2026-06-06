import { useMemo, useState } from 'react';
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

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const DEFAULT_PAGE_SIZE = 20;

export interface StudentsTablePaginatedProps {
    /** Scope to (non-)archived students. Omit for all students. */
    archiv?: boolean;
    /** Scope to students supervised by this agent id. */
    agents?: string;
    /** Scope to students supervised by this editor id. */
    editors?: string;
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
    editors
}: StudentsTablePaginatedProps = {}) => {
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE
    });
    // Default to newest students first (by creation date).
    const [sorting, setSorting] = useState<MRT_SortingState>([
        { id: 'createdAt', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );

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
