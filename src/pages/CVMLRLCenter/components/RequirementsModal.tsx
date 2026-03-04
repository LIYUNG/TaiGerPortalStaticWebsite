import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import i18next from 'i18next';
import { LinkableNewlineText } from '../../Utils/checking-functions';

export interface RequirementsModalProps {
    open: boolean;
    onClose: () => void;
    requirements: string;
}

const RequirementsModal = ({
    open,
    onClose,
    requirements
}: RequirementsModalProps) => (
    <Dialog
        aria-labelledby="contained-modal-title-vcenter"
        onClose={onClose}
        open={open}
    >
        <DialogTitle>
            {i18next.t('Special Requirements', { ns: 'common' })}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                <LinkableNewlineText text={requirements} />
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button color="primary" onClick={onClose} variant="outlined">
                {i18next.t('Close', { ns: 'common' })}
            </Button>
        </DialogActions>
    </Dialog>
);

export default RequirementsModal;
