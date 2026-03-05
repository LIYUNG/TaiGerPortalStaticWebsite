import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography
} from '@mui/material';
import DEMO from '@store/constant';

export interface ProgramUnlockDialogProps {
    open: boolean;
    onClose: () => void;
    isRefreshing: boolean;
    programId: string;
    onConfirmUnlock: () => void;
}

const ProgramUnlockDialog = ({
    open,
    onClose,
    isRefreshing,
    programId,
    onConfirmUnlock
}: ProgramUnlockDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog
            aria-describedby="unlock-dialog-description"
            aria-labelledby="unlock-dialog-title"
            onClose={onClose}
            open={open}
        >
            <DialogTitle id="unlock-dialog-title">
                {t('Unlock Program Manually', { ns: 'common' })}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="unlock-dialog-description">
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography
                            sx={{ fontWeight: 'bold', mb: 1 }}
                            variant="body1"
                        >
                            {t('Important: Verify Program Information', {
                                ns: 'common'
                            })}
                        </Typography>
                        <Typography variant="body2">
                            {t(
                                'Before manually unlocking this program, please ensure that all required information in the program list has been reviewed and updated, including:',
                                { ns: 'common' }
                            )}
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, mb: 1, pl: 3 }}>
                            <Typography component="li" variant="body2">
                                {t('Application deadlines and dates', {
                                    ns: 'common'
                                })}
                            </Typography>
                            <Typography component="li" variant="body2">
                                {t('Language requirements and test scores', {
                                    ns: 'common'
                                })}
                            </Typography>
                            <Typography component="li" variant="body2">
                                {t(
                                    'Required documents and special requirements',
                                    { ns: 'common' }
                                )}
                            </Typography>
                            <Typography component="li" variant="body2">
                                {t('Any other program-specific information', {
                                    ns: 'common'
                                })}
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 1 }} variant="body2">
                            {t(
                                'Manually unlocking will update the program timestamp and reset the automatic locking mechanism. Only proceed if you have confirmed that all program information is current and accurate.',
                                { ns: 'common' }
                            )}
                        </Typography>
                    </Alert>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={onClose}>
                    {t('Cancel', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    component={LinkDom}
                    disabled={isRefreshing}
                    to={DEMO.PROGRAM_EDIT(programId)}
                    variant="outlined"
                >
                    {t('Edit', { ns: 'common' })}
                </Button>
                <Button
                    color="secondary"
                    disabled={isRefreshing}
                    onClick={() => {
                        onClose();
                        onConfirmUnlock();
                    }}
                    startIcon={<RefreshIcon />}
                    variant="contained"
                >
                    {isRefreshing
                        ? t('Unlocking...', { ns: 'common' })
                        : t('Confirm Unlock', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProgramUnlockDialog;
