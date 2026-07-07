import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from '@mui/material';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import DEMO from '@store/constant';
import { BASE_URL } from '@/api';
import { useStudentsApplicationsPaginated } from '@hooks/useStudentsApplicationsPaginated';
import { MuiDataGrid, type MuiDataGridColumn } from '@components/MuiDataGrid';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import {
    FILTER_FIELD_MAP,
    SORT_FIELD_MAP,
    searchParamsToAdmissionsTableState,
    writeAdmissionsTableParams
} from './admissionsTableUrlState';

interface AdmissionTableProps {
    /**
     * Fixed application-status codes for the active sub-tab (decided / closed /
     * admission). Sent to the backend verbatim as exact filters; not exposed as
     * user-editable column filters.
     */
    query: Record<string, unknown>;
}

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const BASE_FILTER_KEYS = ['decided', 'closed', 'admission'] as const;

export default function AdmissionTable({ query }: AdmissionTableProps) {
    const { t } = useTranslation();

    // Seed table state from the URL on mount so a shared link reproduces the
    // exact search/sort/filter/page view. URL writes after this are one-way
    // (state -> URL), so we only read the query string once.
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTableState = useMemo(
        () => searchParamsToAdmissionsTableState(searchParams),
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
    // so the active `tab` / `subtab` params set by the parent tabs are preserved.
    useEffect(() => {
        setSearchParams(
            (prev) =>
                writeAdmissionsTableParams(prev, {
                    globalFilter,
                    sorting,
                    columnFilters,
                    pagination
                }),
            { replace: true }
        );
    }, [globalFilter, sorting, columnFilters, pagination, setSearchParams]);

    const sortColumn = sorting[0];
    const sortBy = sortColumn ? SORT_FIELD_MAP[sortColumn.id] : undefined;
    const sortOrder = sortColumn?.desc ? 'desc' : 'asc';

    // The sub-tab's fixed status codes always apply.
    const baseFilters = useMemo(() => {
        const out: Record<string, string> = {};
        BASE_FILTER_KEYS.forEach((key) => {
            const value = query[key];
            if (typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [query]);

    // Translate MRT column filters into the backend's filter query keys.
    const columnFilterParams = useMemo(() => {
        const out: Record<string, string> = {};
        columnFilters.forEach(({ id, value }) => {
            const key = FILTER_FIELD_MAP[id];
            if (!key) return;
            if (Array.isArray(value)) {
                const joined = value.filter(Boolean).map(String).join(',');
                if (joined !== '') out[key] = joined;
            } else if (typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [columnFilters]);

    const filters = useMemo(
        () => ({ ...baseFilters, ...columnFilterParams }),
        [baseFilters, columnFilterParams]
    );

    const { rows, rowCount, isLoading, isFetching } =
        useStudentsApplicationsPaginated({
            page: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy,
            sortOrder,
            search: globalFilter || undefined,
            filters
            // archiv omitted: admissions span all students, including archived.
        });

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

    const memoizedColumns = useMemo(
        () => [
            {
                field: 'firstname_chinese',
                headerName: t('First Name Chinese', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                width: 80,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.student_id,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'lastname_chinese',
                headerName: t('Last Name Chinese', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                width: 80,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.student_id,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'name',
                headerName: t('Name', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                width: 150,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.student_id,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'agents',
                headerName: t('Agents', { ns: 'common' }),
                width: 100,
                sortable: false
            },
            {
                field: 'editors',
                headerName: t('Editors', { ns: 'common' }),
                width: 100,
                sortable: false
            },
            {
                field: 'attended_high_school',
                headerName: t('Attended High School', { ns: 'common' }),
                width: 100,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'attended_university',
                headerName: t('Attended University', { ns: 'common' }),
                width: 100,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'attended_university_program',
                headerName: t('Attended University Program', { ns: 'common' }),
                width: 100,
                sortable: false,
                enableColumnFilter: false
            },
            {
                field: 'school',
                headerName: t('School', { ns: 'common' }),
                width: 250,
                enableColumnFilter: false,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.programId)}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'program_name',
                headerName: t('Program', { ns: 'common' }),
                width: 250,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.programId)}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'degree',
                headerName: t('Degree', { ns: 'common' }),
                width: 120,
                enableColumnFilter: false
            },
            {
                field: 'application_year',
                headerName: t('Application Year', { ns: 'common' }),
                width: 120
            },
            {
                field: 'semester',
                headerName: t('Semester', { ns: 'common' }),
                width: 120
            },
            {
                field: 'admission_file_path',
                headerName: t('Admission Letter', { ns: 'common' }),
                width: 150,
                sortable: false,
                enableColumnFilter: false,
                renderCell: (params: GridRenderCellParams) => {
                    const linkUrl = `${BASE_URL}/api/admissions/${params.row.admission_file_path?.replace(
                        /\\/g,
                        '/'
                    )}`;
                    return (
                        <Link
                            component={RouterLink}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.row.admission_file_path !== ''
                                ? params.row.admission === 'O'
                                    ? t('Admission Letter', { ns: 'common' })
                                    : params.row.admission === 'X'
                                      ? t('Rejection Letter', { ns: 'common' })
                                      : ''
                                : null}
                        </Link>
                    );
                }
            },
            {
                field: 'finalEnrolment',
                headerName: t('Decision', { ns: 'common' }),
                width: 150,
                sortable: false,
                enableColumnFilter: false
            }
        ],
        [t]
    );

    return (
        <MuiDataGrid
            columns={
                memoizedColumns as MuiDataGridColumn<Record<string, unknown>>[]
            }
            isLoading={isLoading || isFetching}
            rows={(rows ?? []).map((application: unknown) => {
                const app = application as {
                    _id: string;
                    programId?: {
                        _id?: string;
                        school?: string;
                        program_name?: string;
                        semester?: string;
                        degree?: string;
                    };
                    studentId?: {
                        _id?: string;
                        firstname?: string;
                        lastname?: string;
                        firstname_chinese?: string;
                        lastname_chinese?: string;
                        academic_background?: {
                            university?: {
                                attended_high_school?: string;
                                attended_university?: string;
                                attended_university_program?: string;
                            };
                        };
                        agents?: { firstname?: string }[];
                        editors?: { firstname?: string }[];
                    };
                    finalEnrolment?: boolean;
                    admission_letter?: { admission_file_path?: string };
                    application_year?: string;
                    decided?: string;
                    admission?: string;
                    [key: string]: unknown;
                };
                return {
                    ...app,
                    id: String(app._id),
                    programId: app.programId?._id,
                    firstname: app.studentId?.firstname,
                    lastname: app.studentId?.lastname,
                    firstname_chinese: app.studentId?.firstname_chinese,
                    lastname_chinese: app.studentId?.lastname_chinese,
                    student_id: app.studentId?._id,
                    agents: app.studentId?.agents
                        ?.map(
                            (agent: { firstname?: string }) => agent.firstname
                        )
                        .join(' '),
                    editors: app.studentId?.editors
                        ?.map(
                            (editor: { firstname?: string }) => editor.firstname
                        )
                        .join(' '),
                    attended_high_school:
                        app.studentId?.academic_background?.university
                            ?.attended_high_school,
                    attended_university:
                        app.studentId?.academic_background?.university
                            ?.attended_university,
                    attended_university_program:
                        app.studentId?.academic_background?.university
                            ?.attended_university_program,
                    school: app.programId?.school,
                    program_name: app.programId?.program_name,
                    semester: app.programId?.semester,
                    degree: app.programId?.degree,
                    name: `${app.studentId?.firstname}, ${app.studentId?.lastname}`,
                    finalEnrolment: app.finalEnrolment ? 'O' : '',
                    admission_file_path:
                        app.admission_letter?.admission_file_path,
                    application_year: app.application_year
                };
            })}
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
    );
}
