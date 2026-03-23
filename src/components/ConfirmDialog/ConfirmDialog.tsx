import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';

export type ConfirmDialogVariant = 'alert' | 'confirm';

export interface RequireTypedConfirmOptions {
    keyword: string;
    label?: React.ReactNode;
}

export interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    content: React.ReactNode;
    variant?: ConfirmDialogVariant;
    confirmLabel?: React.ReactNode;
    cancelLabel?: React.ReactNode;
    onConfirm?: () => void;
    confirmDisabled?: boolean;
    /** When set, shows a text field; confirm is disabled until input matches keyword (e.g. "delete") */
    requireTypedConfirm?: RequireTypedConfirmOptions;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
    const {
        open,
        onClose,
        title,
        content,
        variant = 'confirm',
        confirmLabel = 'OK',
        cancelLabel = 'Cancel',
        onConfirm,
        confirmDisabled = false,
        requireTypedConfirm
    } = props;

    const [typedValue, setTypedValue] = useState('');
    const keyword = requireTypedConfirm?.keyword ?? '';
    const typedMatch =
        !keyword || typedValue.trim().toLowerCase() === keyword.toLowerCase();

    useEffect(() => {
        if (!open) {
            queueMicrotask(() => setTypedValue(''));
        }
    }, [open]);

    const handleConfirm = () => {
        onConfirm?.();
    };

    const showCancel = variant === 'confirm';
    const isConfirmDisabled =
        confirmDisabled || (requireTypedConfirm && !typedMatch);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            data-testid="confirm-dialog"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                {typeof content === 'string' ? (
                    <DialogContentText>{content}</DialogContentText>
                ) : (
                    content
                )}
                {requireTypedConfirm && (
                    <TextField
                        autoFocus
                        fullWidth
                        margin="normal"
                        label={
                            requireTypedConfirm.label ??
                            `Type "${keyword}" to confirm`
                        }
                        value={typedValue}
                        onChange={(e) => setTypedValue(e.target.value)}
                        inputProps={{
                            'data-testid': 'confirm-dialog-typed-input'
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                {showCancel && (
                    <Button
                        onClick={onClose}
                        color="primary"
                        variant="outlined"
                        data-testid="confirm-dialog-cancel"
                    >
                        {cancelLabel}
                    </Button>
                )}
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    data-testid="confirm-dialog-confirm"
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
