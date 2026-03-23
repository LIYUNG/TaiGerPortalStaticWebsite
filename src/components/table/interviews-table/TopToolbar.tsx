import { Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTranslation } from 'react-i18next';
import type { IUser } from '@taiger-common/model';
import { is_TaiGer_role } from '@taiger-common/core';

import { GenericTopToolbar } from '@components/table/GenericTopToolbar';

interface TopToolbarProps {
    table: {
        getSelectedRowModel: () => { rows: unknown[] };
    };
    toolbarStyle?: object;
    onAssignClick: () => void;
    user: IUser | null;
}

export const TopToolbar = ({
    table,
    toolbarStyle,
    onAssignClick,
    user
}: TopToolbarProps) => {
    const { t } = useTranslation();

    return (
        <GenericTopToolbar
            actions={
                user != null && is_TaiGer_role(user) ? (
                    <Button
                        color="success"
                        disabled={
                            table.getSelectedRowModel().rows?.length !== 1
                        }
                        onClick={onAssignClick}
                        startIcon={<PersonAddIcon />}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {t('Assign', { ns: 'common' })}
                    </Button>
                ) : null
            }
            table={table}
            toolbarStyle={toolbarStyle}
        />
    );
};
