import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import i18next from 'i18next';

export interface SetProgramStatusDialogProps {
    open: boolean;
    onClose: () => void;
    isApplicationSubmitted: boolean;
    isLoaded: boolean;
    studentFirstname: string;
    onConfirm: () => void;
}

const SetProgramStatusDialog = ({
    open,
    onClose,
    isApplicationSubmitted,
    isLoaded,
    studentFirstname,
    onConfirm
}: SetProgramStatusDialogProps) => (
    <Dialog
        aria-labelledby="contained-modal-title-vcenter"
        onClose={onClose}
        open={open}
    >
        <DialogTitle>{i18next.t('Attention')}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Do you want to {isApplicationSubmitted ? 're-open' : 'close'}{' '}
                this program for {studentFirstname}?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                color="primary"
                disabled={!isLoaded}
                onClick={onConfirm}
                variant="contained"
            >
                {i18next.t('Yes', { ns: 'common' })}
            </Button>
            <Button color="primary" onClick={onClose} variant="outlined">
                {i18next.t('No', { ns: 'common' })}
            </Button>
        </DialogActions>
    </Dialog>
);

export default SetProgramStatusDialog;
