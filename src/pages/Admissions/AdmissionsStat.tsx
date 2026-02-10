import { useMemo } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Link } from '@mui/material';

import DEMO from '../../store/constant';
import { useTranslation } from 'react-i18next';
import { MuiDataGrid } from '@components/MuiDataGrid';
import type { AdmissionsStatRow } from '@api/types';

export interface AdmissionsStatProps {
    result: AdmissionsStatRow[];
}

const AdmissionsStat = ({ result }: AdmissionsStatProps) => {
    const { t } = useTranslation();

    type RenderCellParams = {
        value: unknown;
        row: Record<string, unknown>;
        field: string;
    };
    const memoizedColumns = useMemo(() => [
        {
            field: 'school',
            headerName: t('School', { ns: 'common' }),
            width: 300,
            renderCell: (params: RenderCellParams) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.id as string)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {String(params.value)}
                    </Link>
                );
            }
        },
        {
            field: 'program_name',
            headerName: t('Program', { ns: 'common' }),
            width: 300,
            renderCell: (params: RenderCellParams) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.id as string)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {String(params.value)}
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
    ], [t]);

    return (
        <MuiDataGrid
            columns={memoizedColumns}
            rows={result as unknown as Record<string, unknown>[]}
        />
    );
};

export default AdmissionsStat;
