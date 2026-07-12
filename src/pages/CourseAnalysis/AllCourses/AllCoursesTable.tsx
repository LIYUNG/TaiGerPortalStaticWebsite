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
import type { AllCourseItem } from '@hooks/useAllCourses';

type AllCourseRow = AllCourseItem;

export const AllCoursesTable = ({
    courses,
    isLoading
}: {
    courses: AllCourseRow[];
    isLoading: boolean;
}) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    // `useTableStyles()` exposes none of the keys `getTableConfig` reads
    // (tableHeadStyle, tableBodyRowStyle, ...), so it contributes no styles here.
    const tableConfig = getTableConfig({}, isLoading);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const columns: Array<MRT_ColumnDef<AllCourseRow>> = [
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

    const table = useMaterialReactTable<AllCourseRow>({
        ...tableConfig,
        // getTableConfig widens these `variant` / `size` literals to `string`.
        muiSearchTextFieldProps: {
            ...tableConfig.muiSearchTextFieldProps,
            variant: 'outlined'
        },
        muiFilterTextFieldProps: {
            ...tableConfig.muiFilterTextFieldProps,
            variant: 'outlined',
            size: 'small'
        },
        muiPaginationProps: {
            ...tableConfig.muiPaginationProps,
            variant: 'outlined'
        },
        columns,
        state: { isLoading },
        data: courses || [],
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
                    .rows?.map(({ original }) => original)
                    .filter(
                        (course): course is AllCourseRow & { _id: string } =>
                            course._id !== undefined
                    )
                    .map(({ _id, all_course_chinese, all_course_english }) => ({
                        _id,
                        all_course_chinese,
                        all_course_english
                    }))}
                handleOnSuccess={handleOnSuccessWithReset}
                onClose={() => setOpenDeleteDialog(false)}
                open={openDeleteDialog}
            />
        </>
    );
};
