import { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
    Badge,
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
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

const MAX_DESCRIPTION = 2000;

export interface EditAppointmentDialogProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    event: Partial<EventConfirmationCardEvent>;
    bookButtonDisable: boolean;
    onUpdateDescription: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onUpdate: (
        e: FormEvent | ReactMouseEvent,
        eventId: string,
        event: Partial<EventConfirmationCardEvent>
    ) => void;
}

/** Edit-meeting (description) dialog (extracted from the office-hours list tab). */
export const EditAppointmentDialog = ({
    open,
    onClose,
    eventId,
    event,
    bookButtonDisable,
    onUpdateDescription,
    onUpdate
}: EditAppointmentDialogProps) => {
    const { t } = useTranslation();
    const descriptionLength = event?.description?.length ?? 0;
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t('Edit', { ns: 'common' })}</DialogTitle>
            <DialogContent>
                <Typography component="span">請寫下想討論的主題</Typography>
                <TextField
                    error={descriptionLength > MAX_DESCRIPTION}
                    fullWidth
                    inputProps={{ maxLength: MAX_DESCRIPTION }}
                    minRows={10}
                    multiline
                    onChange={onUpdateDescription}
                    placeholder="Example：我想定案選校、選課，我想討論簽證，德語班。"
                    value={event?.description || ''}
                />
                <Badge
                    color={
                        descriptionLength > MAX_DESCRIPTION
                            ? 'error'
                            : 'primary'
                    }
                >
                    <Typography component="span">
                        {descriptionLength}/{MAX_DESCRIPTION}
                    </Typography>
                </Badge>
                <Typography>
                    {t('Student', { ns: 'common' })}:{' '}
                    {event?.requester_id?.map((requester, idx) => (
                        <Typography fontWeight="bold" key={idx}>
                            {requester.firstname} {requester.lastname}
                        </Typography>
                    ))}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={
                        eventId === '' ||
                        descriptionLength === 0 ||
                        bookButtonDisable
                    }
                    onClick={(e) => onUpdate(e, eventId, event)}
                    variant="contained"
                >
                    {bookButtonDisable ? (
                        <CircularProgress size={16} />
                    ) : (
                        t('Update', { ns: 'common' })
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditAppointmentDialog;
