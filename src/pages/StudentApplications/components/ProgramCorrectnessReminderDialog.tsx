import { useTranslation } from 'react-i18next';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { appConfig } from '../../../config';

export interface ProgramCorrectnessReminderDialogProps {
    open: boolean;
    onClose: () => void;
}

const ProgramCorrectnessReminderDialog = ({
    open,
    onClose
}: ProgramCorrectnessReminderDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open}>
            <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}{' '}
                    {`若發現 ${appConfig.companyName} Portal 資訊和學校官方網站資料有不同之處，請和顧問討論。`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    fullWidth
                    onClick={onClose}
                    variant="contained"
                >
                    {t('Accept', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProgramCorrectnessReminderDialog;
