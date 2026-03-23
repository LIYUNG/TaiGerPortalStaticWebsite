import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { Link as RouterLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@mui/material';

import DEMO from '@store/constant';
import { BASE_URL } from '@/api';
import { getAdmissionsQuery } from '@/api/query';
import { MuiDataGrid, type MuiDataGridColumn } from '@components/MuiDataGrid';
import type { GridRenderCellParams } from '@mui/x-data-grid';

interface AdmissionTableProps {
    query: Record<string, unknown>;
}

export default function AdmissionTable({ query }: AdmissionTableProps) {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery(
        getAdmissionsQuery(queryString.stringify(query))
    );
    const rawData = (data as { data?: unknown[] } | undefined)?.data;

    const memoizedColumns = useMemo(
        () => [
            {
                field: 'firstname_chinese',
                headerName: t('First Name Chinese', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                width: 80,
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
                width: 100
            },
            {
                field: 'editors',
                headerName: t('Editors', { ns: 'common' }),
                width: 100
            },
            {
                field: 'school',
                headerName: t('School', { ns: 'common' }),
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
                width: 120
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
                width: 150
            }
        ],
        [t]
    );

    return (
        <MuiDataGrid
            columns={
                memoizedColumns as MuiDataGridColumn<Record<string, unknown>>[]
            }
            isLoading={isLoading}
            rows={(rawData ?? []).map((application: unknown) => {
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
                    id: `${app._id}${app.programId}`,
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
        />
    );
}
