import { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '../../components/table';

import { TopToolbar } from '../../components/table/interviews-table/TopToolbar';
import { AssignTrainerDialog } from './AssignTrainerDialog';
import { getEssayWriters, updateInterview } from '../../api';
import { useSnackBar } from '../../contexts/use-snack-bar';
import { useAuth } from '../../components/AuthProvider';

export const InterviewsTable = ({ isLoading, data, columns }) => {
    const { user } = useAuth();
    const customTableStyles = useTableStyles();
    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [trainerId, setTrainerId] = useState(new Set());
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const table = useMaterialReactTable({
        ...tableConfig,
        columns,
        state: { isLoading },
        data: data || [],
        enableFacetedValues: true,
    });

    const updateTrainer = async () => {
        const temp_trainer_id_array = Array.from(trainerId);
        console.log(temp_trainer_id_array);
        const resp = await updateInterview(
            table.getSelectedRowModel()?.rows[0].original._id.toString(),
            {
                trainer_id: temp_trainer_id_array
            }
        );
        const { success } = resp.data;
        if (success) {
            table.resetRowSelection();
            setOpenAssignDialog(false);
            setTrainerId(new Set());
            setSeverity('success');
            setMessage('Assigned interview trainer successfully!');
            setOpenSnackbar(true);
        }
    };

    const getTrainer = async () => {
        const { data } = await getEssayWriters();
        const { data: editors_a } = data;
        setTrainers(editors_a);
        setTrainerId(
            new Set(
                table
                    .getSelectedRowModel()
                    .rows[0]?.original?.trainer_id?.map(({ _id }) =>
                        _id.toString()
                    )
            )
        );
    };

    const modifyTrainer = (new_trainerId, isActive) => {
        if (isActive) {
            const temp_0 = [...trainerId];
            const temp = new Set(temp_0);
            temp.delete(new_trainerId);
            setTrainerId(new Set(temp));
        } else {
            const temp_0 = [...trainerId];
            const temp = new Set(temp_0);
            temp.add(new_trainerId);
            setTrainerId(new Set(temp));
        }
    };

    const handleAssignClick = () => {
        setOpenAssignDialog(true);
        getTrainer();
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
            user={user}
        />
    );

    return (
        <>
            <MaterialReactTable table={table} />
            <AssignTrainerDialog
                handleOnSuccess={handleOnSuccess}
                modifyTrainer={modifyTrainer}
                onClose={handleDialogClose}
                open={openAssignDialog}
                trainerId={trainerId}
                trainers={trainers}
                updateTrainer={updateTrainer}
            />
        </>
    );
};
