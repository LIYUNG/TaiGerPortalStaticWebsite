import {
    Button,
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ChangeEvent } from 'react';

export interface UserDeleteWarningProps {
    deleteUserWarning: boolean;
    setModalHideDDelete: () => void;
    firstname: string;
    lastname: string;
    delete_field: string;
    onChangeDeleteField: (e: ChangeEvent<HTMLInputElement>) => void;
    isDeletingUser?: boolean;
    selected_user_id: string;
    handleDeleteUser: (id: string) => void;
}

const UserDeleteWarning = (props: UserDeleteWarningProps) => {
    const { t } = useTranslation();
    return (
        <Dialog
            onClose={props.setModalHideDDelete}
            open={props.deleteUserWarning}
        >
            <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('Do you want to delete')}{' '}
                    <b>
                        {props.firstname} - {props.lastname}
                    </b>
                    ?
                </DialogContentText>
                <TextField
                    label={
                        <>
                            Please enter{' '}
                            <i>
                                <b>delete</b>
                            </i>
                        </>
                    }
                    onChange={(e) => props.onChangeDeleteField(e)}
                    placeholder="delete"
                    size="small"
                    type="text"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={
                        props.isDeletingUser ||
                        !(props.delete_field === 'delete')
                    }
                    onClick={() =>
                        props.handleDeleteUser(props.selected_user_id)
                    }
                    variant="contained"
                >
                    {props.isDeletingUser ? (
                        <CircularProgress size={24} />
                    ) : (
                        t('Yes', { ns: 'common' })
                    )}
                </Button>
                <Button
                    color="secondary"
                    onClick={props.setModalHideDDelete}
                    variant="outlined"
                >
                    {t('No', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default UserDeleteWarning;
