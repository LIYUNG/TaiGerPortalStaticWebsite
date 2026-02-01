import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

export interface ConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    open: boolean;
    content: React.ReactNode;
    confirmText: string;
    closeText: string;
    isLoading?: boolean;
}

export const ConfirmationModal = ({
    onClose,
    onConfirm,
    title,
    open,
    content,
    confirmText,
    closeText,
    isLoading,
    children
}) => {
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
                {children}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={isLoading}
                    onClick={onConfirm}
                    startIcon={
                        isLoading ? <CircularProgress size={20} /> : undefined
                    }
                    variant="contained"
                >
                    {confirmText}
                </Button>
                <Button onClick={onClose} variant="outlined">
                    {closeText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
