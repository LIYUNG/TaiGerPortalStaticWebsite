import { FormEvent, MouseEvent as ReactMouseEvent, useState } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface DeleteAppointmentDialogProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    bookButtonDisable: boolean;
    /** 'reject' = agent/editor declining a pending request; 'cancel' = calling
     *  off a meeting. Drives the wording; both require a reason. */
    mode?: 'reject' | 'cancel';
    onDelete: (
        e: FormEvent | ReactMouseEvent,
        eventId: string,
        reason: string
    ) => void;
}

/** Reject / cancel dialog. A reason is REQUIRED and is delivered to the other
 *  party (by email) so they understand why the meeting was rejected/cancelled. */
export const DeleteAppointmentDialog = ({
    open,
    onClose,
    eventId,
    bookButtonDisable,
    mode = 'cancel',
    onDelete
}: DeleteAppointmentDialogProps) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');

    // Clear the reason on close / after submit so it never leaks into the next
    // open (no effect needed — both exit paths reset it).
    const handleClose = () => {
        setReason('');
        onClose();
    };

    const isReject = mode === 'reject';
    const actionLabel = isReject
        ? t('Reject request', { ns: 'common' })
        : t('Cancel meeting', { ns: 'common' });
    const trimmed = reason.trim();

    return (
        <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
            <DialogTitle>{actionLabel}</DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }} variant="body2">
                    {isReject
                        ? t(
                              'Let the student know why you are rejecting this request.'
                          )
                        : t('Let the other party know why you are cancelling.')}
                </Typography>
                <TextField
                    autoFocus
                    fullWidth
                    inputProps={{ maxLength: 2000 }}
                    label={t('Reason', { ns: 'common' })}
                    minRows={3}
                    multiline
                    onChange={(e) => setReason(e.target.value)}
                    required
                    value={reason}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    disabled={
                        eventId === '' || bookButtonDisable || trimmed === ''
                    }
                    onClick={(e) => {
                        onDelete(e, eventId, trimmed);
                        setReason('');
                    }}
                    startIcon={
                        bookButtonDisable ? (
                            <CircularProgress size={16} />
                        ) : undefined
                    }
                    variant="contained"
                >
                    {actionLabel}
                </Button>
                <Button
                    color="primary"
                    onClick={handleClose}
                    variant="outlined"
                >
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAppointmentDialog;
