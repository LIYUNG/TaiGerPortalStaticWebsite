import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import type { SurveyDocLinkEditDialogProps } from '../types';

const SurveyDocLinkEditDialog = ({
    open,
    onClose,
    onSave,
    surveyLink,
    onChangeURL,
    docName = 'Grading System',
    saving,
    t
}: SurveyDocLinkEditDialogProps) => {
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t('Edit', { ns: 'common' })}</DialogTitle>
            <DialogContent>
                <TextField
                    label={`Documentation Link for ${docName}`}
                    onChange={onChangeURL}
                    placeholder="https://taigerconsultancy-portal.com/docs/search/12345678"
                    value={surveyLink ?? ''}
                />
            </DialogContent>
            <DialogActions>
                <Button disabled={saving} onClick={onSave}>
                    {t('Save', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SurveyDocLinkEditDialog;
