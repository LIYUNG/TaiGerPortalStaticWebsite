import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import { Box, Button, Breadcrumbs, Link, Typography } from '@mui/material';
import {
    is_TaiGer_role,
    isProgramAdmitted,
    isProgramDecided,
    isProgramRejected
} from '@taiger-common/core';
import type {
    IEvent,
    IInterviewWithId,
    IUser,
    IUserWithId,
    IStudentResponse,
    IProgram
} from '@taiger-common/model';
import type {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import ErrorPage from '../Utils/ErrorPage';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { convertDate, showTimezoneOffset } from '@utils/contants';
import { useInterviewsPaginated } from '@hooks/useInterviewsPaginated';
import { InterviewsTable } from './InterviewsTable';

import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

// MRT column id (= row field) -> backend sortBy value. Columns not listed get
// enableSorting: false (the backend cannot sort by them).
const SORT_FIELD_MAP: Record<string, string> = {
    status: 'status',
    isDuplicate: 'isDuplicate',
    surveySubmitted: 'surveySubmitted',
    firstname_lastname: 'firstname_lastname',
    start: 'start',
    interview_date: 'interview_date',
    program_name: 'program_name'
};

// MRT column id (= row field) -> backend filter query key.
const FILTER_FIELD_MAP: Record<string, string> = {
    status: 'status',
    isDuplicate: 'isDuplicate',
    surveySubmitted: 'surveySubmitted',
    firstname_lastname: 'studentName',
    trainer_name: 'trainerName',
    program_name: 'program'
};

// Status values are computed server-side (see addInterviewStatus); list them
// explicitly because faceted values would only reflect the current page.
const STATUS_FILTER_OPTIONS = [
    'Open',
    'Scheduled',
    'Trained',
    'Interviewed',
    'Closed',
    'N/A'
];

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T,>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const DEFAULT_PAGE_SIZE = 20;

const InterviewTraining = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const scope = is_TaiGer_role(user as IUser) ? 'all' : 'my';

    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE
    });
    const [sorting, setSorting] = useState<MRT_SortingState>([
        { id: 'interview_date', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );

    const sortColumn = sorting[0];
    const sortBy = sortColumn ? SORT_FIELD_MAP[sortColumn.id] : undefined;
    const sortOrder = sortColumn?.desc ? 'desc' : 'asc';

    // Translate MRT column filters into the backend's filter query keys.
    // Multi-select filters (e.g. status) arrive as arrays -> comma-joined,
    // which the backend splits and matches with $in.
    const filters = useMemo(() => {
        const out: Record<string, string> = {};
        columnFilters.forEach(({ id, value }) => {
            const key = FILTER_FIELD_MAP[id];
            if (!key) return;
            if (Array.isArray(value)) {
                const joined = value.filter(Boolean).join(',');
                if (joined !== '') out[key] = joined;
            } else if (typeof value === 'string' && value !== '') {
                out[key] = value;
            }
        });
        return out;
    }, [columnFilters]);

    const {
        rows,
        rowCount,
        isLoading,
        isFetching,
        isError,
        student,
        existingInterviewProgramIds
    } = useInterviewsPaginated({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy,
        sortOrder,
        search: globalFilter || undefined,
        filters,
        scope
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

    // Programs the student can still request an interview for: decided, not yet
    // admitted/rejected, and not already interviewed (using the server-provided
    // existing-program-id list so it is correct across all pages).
    const available_interview_request_programs = useMemo(() => {
        if (scope !== 'my' || !student?.applications) return [];
        const existing = new Set(existingInterviewProgramIds);
        return student.applications
            .filter(
                (application) =>
                    isProgramDecided(application) &&
                    !isProgramAdmitted(application) &&
                    !isProgramRejected(application) &&
                    !existing.has(application.programId?._id?.toString() ?? '')
            )
            .map((application) => ({
                key: application.programId?._id?.toString() ?? '',
                value: `${application.programId?.school ?? ''} ${application.programId?.program_name ?? ''} ${application.programId?.degree ?? ''} ${application.programId?.semester ?? ''}`
            }));
    }, [scope, student, existingInterviewProgramIds]);

    const handleClick = () => {
        navigate(`${DEMO.INTERVIEW_ADD_LINK}`);
    };

    TabTitle('Interview training');
    const columns: Array<MRT_ColumnDef<Record<string, unknown>>> = [
        {
            accessorKey: 'status',
            filterVariant: 'multi-select',
            filterSelectOptions: STATUS_FILTER_OPTIONS,
            header: t('Status', { ns: 'common' }),
            size: 180
        },
        {
            accessorKey: 'isDuplicate',
            filterVariant: 'select',
            filterSelectOptions: [
                { value: 'true', label: t('Yes', { ns: 'common' }) },
                { value: 'false', label: t('No', { ns: 'common' }) }
            ],
            header: t('Duplicate', { ns: 'common' }),
            size: 150,
            Cell: ({ cell }) =>
                cell.getValue() ? <ErrorIcon color="warning" /> : ''
        },
        {
            accessorKey: 'surveySubmitted',
            filterVariant: 'select',
            filterSelectOptions: [
                { value: 'true', label: t('Closed', { ns: 'common' }) },
                { value: 'false', label: t('Pending', { ns: 'common' }) }
            ],
            header: t('Survey', { ns: 'common' }),
            size: 150,
            Cell: ({ cell }) =>
                cell.getValue() ? (
                    <CheckCircleIcon color="success" />
                ) : (
                    <ErrorIcon color="error" />
                )
        },
        {
            accessorKey: 'firstname_lastname',
            header: t('First-/ Last Name', { ns: 'common' }),
            size: 200,
            Cell: (params) => {
                const { row } = params;
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    row.original.student_id as string,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.firstname_lastname as string}
                        to={linkUrl}
                        underline="hover"
                    >
                        {row.original.firstname_lastname as string}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'trainer_name',
            header: t('Trainer', { ns: 'common' }),
            // Backend cannot sort by trainer, but supports a trainer-name filter.
            enableSorting: false,
            size: 150
        },
        {
            accessorKey: 'start',
            header: `${t('Training Time', { ns: 'interviews' })} (${
                Intl.DateTimeFormat().resolvedOptions().timeZone
            } ${showTimezoneOffset()})`,
            // Formatted date string can't be filtered server-side; sortable only.
            enableColumnFilter: false,
            size: 280,
            Cell: (params) => {
                const { row } = params;
                return row.original.start as string;
            }
        },
        {
            accessorKey: 'interview_date',
            header: t('Official Interview Time', { ns: 'interviews' }),
            enableColumnFilter: false,
            size: 220,
            Cell: (params) => {
                const { row } = params;
                return row.original.interview_date as string;
            }
        },
        {
            accessorKey: 'program_name',
            header: t('Interview', { ns: 'interviews' }),
            size: 400,
            Cell: (params) => {
                const { row } = params;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.program_name as string}
                        to={DEMO.INTERVIEW_SINGLE_LINK(
                            row.original.id as string
                        )}
                        underline="hover"
                    >
                        {row.original.program_name as string}
                    </Link>
                );
            }
        }
    ];

    // Transform one page of populated interview documents into table rows. The
    // computed columns (status, isDuplicate, surveySubmitted) come from the
    // server via the spread; here we only format dates/names for display.
    const transform = (interviews: IInterviewWithId[]) => {
        const result: Record<string, unknown>[] = [];
        if (!interviews) {
            return [];
        }

        for (const interview of interviews) {
            const studentId = (
                interview.student_id as unknown as IStudentResponse
            )._id;
            const eventStart = (
                interview.event_id as unknown as IEvent | undefined
            )?.start;
            const programId = interview.program_id as unknown as IProgram;
            const student_obj =
                interview.student_id as unknown as IStudentResponse;
            result.push({
                ...interview,
                id: `${interview._id}`,
                start:
                    (eventStart && convertDate(eventStart ?? new Date())) || '',
                interview_date:
                    (interview.interview_date &&
                        convertDate(interview.interview_date)) ||
                    '',
                student_id: studentId,
                trainer_name:
                    (interview.trainer_id as unknown as IUserWithId[])
                        ?.map((trainer) => trainer.firstname)
                        ?.join(', ') || '',
                program_name: `${programId.school} ${programId.program_name} ${programId.degree} ${programId.semester}`,
                firstname_lastname: `${student_obj.firstname} ${student_obj.lastname}`
            });
        }
        return result;
    };

    if (isError) {
        return <ErrorPage res_status={500} />;
    }

    const tableRows = transform(rows as unknown as IInterviewWithId[]);

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
                <Typography color="text.primary">
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Interview Center', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
                sx={{ my: 1 }}
            >
                <Typography variant="h6">
                    {is_TaiGer_role(user as IUser)
                        ? t('All Interviews', { ns: 'interviews' })
                        : t('My Interviews', { ns: 'interviews' })}
                </Typography>
                {/* Button on the right */}
                <Box>
                    {!is_TaiGer_role(user as IUser) &&
                    available_interview_request_programs.length > 0 ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                    {is_TaiGer_role(user as IUser) ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                </Box>
            </Box>
            <InterviewsTable
                columns={columns}
                data={tableRows}
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
            />
        </Box>
    );
};

export default InterviewTraining;
