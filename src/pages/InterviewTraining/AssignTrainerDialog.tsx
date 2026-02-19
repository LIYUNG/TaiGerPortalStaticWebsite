import { IUserWithId } from '@/types/taiger-common';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AssignTrainerDialogProps {
    open: boolean;
    onClose: () => void;
    modifyTrainer: (trainerId: string, isActive: boolean) => void;
    trainers: IUserWithId[];
    updateTrainer: () => void;
    trainerId: Set<string>;
}

export const AssignTrainerDialog = ({
    open,
    onClose,
    modifyTrainer,
    trainers,
    updateTrainer,
    trainerId
}: AssignTrainerDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t('Assign Trainer')}</DialogTitle>
            <DialogContent>
                <List>
                    {trainers?.map((trainer, i) => (
                        <ListItemButton
                            dense
                            key={i}
                            onClick={() =>
                                modifyTrainer(
                                    trainer._id.toString(),
                                    trainerId.has(trainer._id.toString())
                                )
                            }
                            role={undefined}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={trainerId.has(
                                        trainer._id.toString()
                                    )}
                                    disableRipple
                                    edge="start"
                                    tabIndex={-1}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${trainer.firstname} ${trainer.lastname}`}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    onClick={updateTrainer}
                    variant="contained"
                >
                    {t('Assign', { ns: 'common' })}
                </Button>
                <Button color="secondary" onClick={onClose} variant="contained">
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
