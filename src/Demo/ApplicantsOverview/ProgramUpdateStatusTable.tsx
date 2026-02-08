import React, { useMemo } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import DEMO from '../../store/constant';
import { convertDate } from '../../utils/contants';

const ProgramUpdateStatusTable = ({ data, isLoading = false }) => {
    const { t } = useTranslation();

    // Remove duplicates based on program_id
    const uniquePrograms = useMemo(() => {
        const set = new Set();
        const result = [];

        data.forEach((program) => {
            if (!set.has(program.program_id)) {
                set.add(program.program_id);
                result.push({
                    ...program,
                    id: program.program_id
                });
            }
        });

        return result;
    }, [data]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'school',
                header: t('School'),
                size: 250,
                Cell: ({ row }) => {
                    const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(row.original.id)}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {row.original.school}
                        </Link>
                    );
                }
            },
            {
                accessorKey: 'program_name',
                header: t('Program', { ns: 'common' }),
                size: 250,
                Cell: ({ row }) => {
                    const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(row.original.id)}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={linkUrl}
                            underline="hover"
                        >
                            {row.original.program_name}
                        </Link>
                    );
                }
            },
            {
                accessorKey: 'degree',
                header: t('Degree', { ns: 'common' }),
                size: 100
            },
            {
                accessorKey: 'semester',
                header: t('Semester', { ns: 'common' }),
                size: 100
            },
            {
                accessorKey: 'whoupdated',
                header: t('Updated by', { ns: 'common' }),
                size: 120,
                Cell: ({ row }) => {
                    return row.original.whoupdated || '-';
                }
            },
            {
                accessorKey: 'updatedAt',
                header: t('Last update', { ns: 'common' }),
                size: 150,
                Cell: ({ row }) => {
                    return row.original.updatedAt
                        ? convertDate(row.original.updatedAt)
                        : '-';
                }
            }
        ],
        [t]
    );

    const table = useMaterialReactTable({
        columns,
        data: uniquePrograms,
        enableColumnFilterModes: true,
        enableColumnOrdering: true,
        enableGrouping: false,
        enableColumnPinning: false,
        enableRowSelection: false,
        enableColumnResizing: true,
        initialState: {
            showColumnFilters: false,
            showGlobalFilter: true,
            density: 'compact',
            pagination: { pageSize: 20, pageIndex: 0 }
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        muiSearchTextFieldProps: {
            placeholder: t('Search programs...', { ns: 'common' }),
            variant: 'outlined',
            size: 'small'
        },
        muiFilterTextFieldProps: {
            variant: 'outlined',
            size: 'small'
        },
        muiPaginationProps: {
            rowsPerPageOptions: [10, 20, 50, 100],
            variant: 'outlined'
        },
        muiToolbarAlertBannerProps: isLoading
            ? {
                  color: 'info',
                  children: t('Loading data...', { ns: 'common' })
              }
            : undefined,
        state: {
            isLoading
        }
    });

    return <MaterialReactTable table={table} />;
};

export default ProgramUpdateStatusTable;
