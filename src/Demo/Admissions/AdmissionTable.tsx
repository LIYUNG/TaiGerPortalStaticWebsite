import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom } from '@mui/material';

import DEMO from '../../store/constant';
import { BASE_URL } from '../../api/request';
import { getAdmissionsQuery } from '../../api/query';
import { MuiDataGrid } from '../../components/MuiDataGrid';

export default function AdmissionTable({ query }) {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery(
        getAdmissionsQuery(queryString.stringify(query))
    );

    const memoizedColumns = useMemo(
        () => [
        {
            field: 'firstname_chinese',
            headerName: t('First Name Chinese', { ns: 'common' }),
            align: 'left',
            headerAlign: 'left',
            width: 80,
            renderCell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    params.row.student_id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
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
            renderCell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    params.row.student_id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
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
            renderCell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    params.row.student_id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
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
            renderCell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.programId)}`;
                return (
                    <Link
                        component={LinkDom}
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
            renderCell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.programId)}`;
                return (
                    <Link
                        component={LinkDom}
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
            renderCell: (params) => {
                const linkUrl = `${BASE_URL}/api/admissions/${params.row.admission_file_path?.replace(
                    /\\/g,
                    '/'
                )}`;
                return (
                    <Link
                        component={LinkDom}
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
            columns={memoizedColumns}
            isLoading={isLoading}
            rows={
                data?.data.map((application) => ({
                    ...application,
                    id: `${application._id}${application.programId}`,
                    programId: application.programId?._id,
                    firstname: application.studentId?.firstname,
                    lastname: application.studentId?.lastname,
                    firstname_chinese: application.studentId?.firstname_chinese,
                    lastname_chinese: application.studentId?.lastname_chinese,
                    student_id: application.studentId?._id,
                    agents: application.studentId?.agents
                        ?.map((agent) => agent.firstname)
                        .join(' '),
                    editors: application.studentId?.editors
                        ?.map((editor) => editor.firstname)
                        .join(' '),
                    school: application.programId?.school,
                    program_name: application.programId?.program_name,
                    semester: application.programId?.semester,
                    degree: application.programId?.degree,
                    name: `${application.studentId?.firstname}, ${application.studentId?.lastname}`,
                    finalEnrolment: application.finalEnrolment ? 'O' : '',
                    admission_file_path:
                        application.admission_letter?.admission_file_path,
                    application_year: application.application_year
                })) || []
            }
        />
    );
}
