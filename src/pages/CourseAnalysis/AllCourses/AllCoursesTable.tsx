import { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { getTableConfig, useTableStyles } from '@components/table';
import { TopToolbar } from '@components/table/all-courses-table/TopToolbar';
import { DeleteCourseDialog } from './DeleteCourseDialog';
import { MRT_ColumnDef } from 'material-react-table';

export const AllCoursesTable = ({
    isLoading,
    data
}: {
    isLoading: boolean;
    data: Record<string, unknown>[];
}) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const columns: Array<MRT_ColumnDef<Record<string, unknown>>> = [
        {
            accessorKey: 'all_course_chinese',
            header: t('Course Name (ZH)', { ns: 'common' }),
            filterFn: 'contains',
            size: 240
        },
        {
            accessorKey: 'all_course_english',
            header: t('Course Name (EN)', { ns: 'common' }),
            filterFn: 'contains',
            size: 240
        },
        {
            accessorKey: 'udpatedAt',
            header: t('Updated at', { ns: 'common' }),
            filterFn: 'contains',
            size: 150
        },
        {
            accessorKey: 'createdAt',
            header: t('Created at', { ns: 'common' }),
            filterFn: 'contains',
            size: 150
        }
    ];

    const handleOnSuccess = () => {
        setOpenDeleteDialog(false);
    };

    const table = useMaterialReactTable({
        ...tableConfig,
        columns,
        state: { isLoading },
        data: data || [],
        renderTopToolbar: () => (
            <TopToolbar
                onDeleteClick={() => setOpenDeleteDialog(true)}
                table={table}
                toolbarStyle={customTableStyles.toolbarStyle}
            />
        )
    });

    const handleOnSuccessWithReset = () => {
        table.resetRowSelection();
        handleOnSuccess();
    };

    return (
        <>
            <MaterialReactTable table={table} />
            <DeleteCourseDialog
                courses={table
                    .getSelectedRowModel()
                    .rows?.map(
                        ({
                            original: {
                                _id,
                                all_course_chinese,
                                all_course_english
                            }
                        }) => ({
                            _id,
                            all_course_chinese,
                            all_course_english
                        })
                    )}
                handleOnSuccess={handleOnSuccessWithReset}
                onClose={() => setOpenDeleteDialog(false)}
                open={openDeleteDialog}
            />
        </>
    );
};
