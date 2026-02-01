import { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '../../components/table';
import { useTranslation } from 'react-i18next';
import { Link } from '@mui/material';
import { Box, Chip } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import DEMO from '../../store/constant';
import { TopToolbar } from '../../components/table/programs-table/TopToolbar';
import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';
import { COUNTRIES_ARRAY_OPTIONS } from '../../utils/contants';
import { PROGRAM_SUBJECTS } from '@taiger-common/core';
import { calculateProgramLockStatus } from '../Utils/checking-functions';

export const ProgramsTable = ({ isLoading, data, student }) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [openAssignDialog, setOpenAssignDialog] = useState(false);

    // Get unique subject groups from PROGRAM_SUBJECTS
    const subjectGroups = Object.entries(PROGRAM_SUBJECTS).map(
        ([code, { label, category }]) => ({
            code,
            label,
            category,
            groupBy: category
        })
    );

    const columns = [
        {
            accessorFn: (row) => {
                const lockStatus = calculateProgramLockStatus(row.original);
                return lockStatus.isLocked ? 'Locked' : 'Unlocked';
            },
            id: 'status',
            header: t('Status', { ns: 'common' }),
            size: 110,
            filterVariant: 'select',
            filterFn: (row, columnId, filterValue) => {
                const lockStatus = calculateProgramLockStatus(row.original);
                const status = lockStatus.isLocked ? 'Locked' : 'Unlocked';
                return status === filterValue;
            },
            filterSelectOptions: [
                {
                    value: 'Locked',
                    label: t('Locked', { ns: 'common' })
                },
                {
                    value: 'Unlocked',
                    label: t('Unlocked', { ns: 'common' })
                }
            ],
            Cell: ({ row }) => {
                const lockStatus = calculateProgramLockStatus(row.original);

                return lockStatus.isLocked ? (
                    <Chip
                        color="warning"
                        icon={<LockOutlinedIcon fontSize="small" />}
                        label={t('Locked', { ns: 'common' })}
                        size="small"
                    />
                ) : (
                    <Chip
                        icon={<LockOpenIcon fontSize="small" />}
                        label={t('Unlocked', { ns: 'common' })}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            accessorKey: 'school',
            header: t('School', { ns: 'common' }),
            //   filterVariant: 'autocomplete',
            filterFn: 'contains',
            size: 250,
            Cell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.original._id)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.school}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'program_name',
            header: t('Program', { ns: 'common' }),
            size: 250,
            Cell: (params) => {
                const linkUrl = `${DEMO.SINGLE_PROGRAM_LINK(params.row.original._id)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.program_name}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'programSubjects',
            header: t('Subjects', { ns: 'common' }),
            filterVariant: 'multi-select',
            filterSelectOptions: subjectGroups.map((item) => item.value),
            size: 200,
            Cell: ({ row }) => {
                const subjects = row.original.programSubjects || [];
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {subjects.map((subject, index) => (
                            <Chip
                                key={index}
                                label={subject}
                                size="small"
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'tags',
            header: t('Tags', { ns: 'common' }),
            filterVariant: 'multi-select',
            filterSelectOptions: subjectGroups.map((item) => item.value),
            size: 200,
            Cell: ({ row }) => {
                const tags = row.original.tags || [];
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'country',
            filterVariant: 'multi-select',
            filterSelectOptions: COUNTRIES_ARRAY_OPTIONS.map(
                (item) => item.value
            ),
            header: t('Country', { ns: 'common' }),
            size: 90
        },
        {
            accessorKey: 'degree',
            header: t('Degree', { ns: 'common' }),
            size: 90
        },
        {
            accessorKey: 'semester',
            header: t('Semester', { ns: 'common' }),
            size: 100
        },
        {
            accessorKey: 'lang',
            header: t('Language', { ns: 'common' }),
            size: 120
        },
        {
            accessorKey: 'toefl',
            header: t('TOEFL', { ns: 'common' }),
            size: 100
        },
        {
            accessorKey: 'ielts',
            header: t('IELTS', { ns: 'common' }),
            size: 100
        },
        { accessorKey: 'gre', header: t('GRE', { ns: 'common' }), size: 120 },
        { accessorKey: 'gmat', header: t('GMAT', { ns: 'common' }), size: 120 },
        {
            accessorKey: 'application_deadline',
            header: t('Deadline', { ns: 'common' }),
            size: 120
        },
        {
            accessorKey: 'updatedAt',
            header: t('Last update', { ns: 'common' }),
            size: 150
        }
    ];

    const table = useMaterialReactTable({
        ...tableConfig,
        columns,
        state: { isLoading },
        data: data || []
    });
    const selectedRows = table.getSelectedRowModel().rows ?? [];
    const programsForDialog = selectedRows.map(({ original }) => original);
    const handleAssignClick = () => {
        if (selectedRows.length === 0) {
            return;
        }
        setOpenAssignDialog(true);
    };

    const handleDialogClose = () => {
        setOpenAssignDialog(false);
    };

    const handleOnSuccess = () => {
        table.resetRowSelection();
        setOpenAssignDialog(false);
    };

    table.options.renderTopToolbar = (
        <TopToolbar
            onAssignClick={handleAssignClick}
            table={table}
            toolbarStyle={customTableStyles.toolbarStyle}
        />
    );

    return (
        <>
            <MaterialReactTable table={table} />
            <AssignProgramsToStudentDialog
                handleOnSuccess={handleOnSuccess}
                onClose={handleDialogClose}
                open={openAssignDialog}
                programs={programsForDialog}
                student={student}
            />
        </>
    );
};
