import React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import i18next from 'i18next';
import { spinner_style2 } from '@utils/contants';

export interface SetAsFinalFileDialogProps {
    open: boolean;
    onClose: () => void;
    docName: string;
    isFinal: boolean;
    isLoaded: boolean;
    onConfirm: () => void;
}

const SetAsFinalFileDialog = ({
    open,
    onClose,
    docName,
    isFinal,
    isLoaded,
    onConfirm
}: SetAsFinalFileDialogProps) => (
    <Dialog
        aria-labelledby="contained-modal-title-vcenter"
        onClose={onClose}
        open={open}
    >
        <DialogTitle>{i18next.t('Warning', { ns: 'common' })}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Do you want to set {docName} as {isFinal ? 'final' : 'open'}?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                color="primary"
                disabled={!isLoaded}
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
            <Button onClick={onClose} variant="outlined">
                {i18next.t('No', { ns: 'common' })}
            </Button>
        </DialogActions>
    </Dialog>
);

export default SetAsFinalFileDialog;
