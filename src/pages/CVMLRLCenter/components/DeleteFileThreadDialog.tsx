import React, { type ChangeEvent } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputLabel,
    TextField,
    Typography
} from '@mui/material';
import i18next from 'i18next';
import { spinner_style2 } from '@utils/contants';

export interface DeleteFileThreadDialogProps {
    open: boolean;
    onClose: () => void;
    docName: string;
    deleteField: string;
    isLoaded: boolean;
    onChangeDeleteField: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onConfirm: () => void;
}

const DeleteFileThreadDialog = ({
    open,
    onClose,
    docName,
    deleteField,
    isLoaded,
    onChangeDeleteField,
    onConfirm
}: DeleteFileThreadDialogProps) => (
    <Dialog
        aria-labelledby="contained-modal-title-vcenter"
        onClose={onClose}
        open={open}
    >
        <DialogTitle>{i18next.t('Warning', { ns: 'common' })}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Do you want to delete <b>{docName}</b>?
            </DialogContentText>
            <InputLabel>
                <Typography>
                    Please enter{' '}
                    <i>
                        <b>delete</b>
                    </i>{' '}
                    in order to delete the user.
                </Typography>
            </InputLabel>
            <TextField
                fullWidth
                onChange={onChangeDeleteField}
                placeholder="delete"
                size="small"
                type="text"
                value={deleteField}
            />
        </DialogContent>
        <DialogActions>
            <Button
                color="primary"
                disabled={!isLoaded || deleteField !== 'delete'}
                onClick={onConfirm}
                variant="contained"
            >
                {isLoaded ? (
                    i18next.t('Yes', { ns: 'common' })
                ) : (
                    <div style={spinner_style2 as React.CSSProperties}>
                        <CircularProgress />
                    </div>
                )}
            </Button>
            <Button color="primary" onClick={onClose} variant="outlined">
                {i18next.t('No', { ns: 'common' })}
            </Button>
        </DialogActions>
    </Dialog>
);

export default DeleteFileThreadDialog;
