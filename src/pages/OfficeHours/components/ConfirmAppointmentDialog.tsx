import { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

export interface ConfirmAppointmentDialogProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    event: Partial<EventConfirmationCardEvent>;
    bookButtonDisable: boolean;
    onConfirm: (
        e: FormEvent | ReactMouseEvent,
        eventId: string,
        event: Partial<EventConfirmationCardEvent>
    ) => void;
}

/** "You are aware of this meeting time and confirm" dialog (extracted from the
 *  office-hours list tab). */
export const ConfirmAppointmentDialog = ({
    open,
    onClose,
    eventId,
    event,
    bookButtonDisable,
    onConfirm
}: ConfirmAppointmentDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogContent>
                You are aware of this meeting time and confirm.
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={
                        eventId === '' ||
                        (event?.description?.length ?? 0) === 0 ||
                        bookButtonDisable
                    }
                    onClick={(e) => onConfirm(e, eventId, event)}
                    startIcon={
                        bookButtonDisable ? (
                            <CircularProgress size={24} />
                        ) : (
                            <CheckIcon />
                        )
                    }
                    variant="contained"
                >
                    {t('Yes', { ns: 'common' })}
                </Button>
                <Button color="primary" onClick={onClose} variant="outlined">
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmAppointmentDialog;
