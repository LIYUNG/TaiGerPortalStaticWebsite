import { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '../../components/table';

import { TopToolbar } from '../../components/table/interviews-table/TopToolbar';
// import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';

export const InterviewsTable = ({ isLoading, data, columns }) => {
    const customTableStyles = useTableStyles();
    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [, setOpenAssignDialog] = useState(false);

    const table = useMaterialReactTable({
        ...tableConfig,
        columns,
        state: { isLoading },
        data: data || []
    });
    const handleAssignClick = () => {
        setOpenAssignDialog(true);
    };

    // const handleDialogClose = () => {
    //     setOpenAssignDialog(false);
    // };

    // const handleOnSuccess = () => {
    //     table.resetRowSelection();
    //     setOpenAssignDialog(false);
    // };

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
            {/* <AssignProgramsToStudentDialog
                handleOnSuccess={handleOnSuccess}
                onClose={handleDialogClose}
                open={openAssignDialog}
                programs={table
                    .getSelectedRowModel()
                    .rows?.map(
                        ({
                            original: {
                                _id,
                                school,
                                program_name,
                                degree,
                                semester
                            }
                        }) => ({
                            _id,
                            school,
                            program_name,
                            degree,
                            semester
                        })
                    )}
            /> */}
        </>
    );
};
