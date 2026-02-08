import { useMemo } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Link } from '@mui/material';

import DEMO from '../../store/constant';
import { useTranslation } from 'react-i18next';
import { MuiDataGrid } from '../../components/MuiDataGrid';

const AdmissionsStat = ({ result }) => {
    const { t } = useTranslation();

    const admisstionStatColumns = [
        {
            field: 'school',
            headerName: t('School', { ns: 'common' }),
            width: 300,
            renderCell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.id)}`;
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
            width: 300,
            renderCell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.id)}`;
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
        { field: 'degree', headerName: 'Degree', width: 100 },
        {
            field: 'semester',
            headerName: t('Semester', { ns: 'common' }),
            width: 100
        },
        {
            field: 'applicationCount',
            headerName: t('applicationCount', { ns: 'common' }),
            width: 100
        },
        {
            field: 'finalEnrolmentCount',
            headerName: t('enrolment', { ns: 'common' }),
            width: 100
        },
        {
            field: 'admissionCount',
            headerName: t('Admission', { ns: 'common' }),
            width: 100
        },
        {
            field: 'rejectionCount',
            headerName: t('Rejection', { ns: 'common' }),
            width: 100
        },
        {
            field: 'pendingResultCount',
            headerName: t('Pending Result', { ns: 'common' }),
            width: 100
        }
    ];
    const memoizedColumns = useMemo(
        () => admisstionStatColumns,
        [admisstionStatColumns]
    );

    return <MuiDataGrid columns={memoizedColumns} rows={result} />;
};

export default AdmissionsStat;
