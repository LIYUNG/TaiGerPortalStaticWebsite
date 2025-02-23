import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

export const ErrorModal = ({ onClose, title, open, content, confirmText }) => {
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
