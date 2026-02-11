import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import i18next from 'i18next';

export interface UserArchivWarningProps {
    archivUserWarning: boolean;
    setModalArchivHide: () => void;
    firstname: string;
    lastname: string;
    isUpdatingArchivUser?: boolean;
    selected_user_id: string;
    archiv?: boolean;
    updateUserArchivStatus: (params: {
        user_id: string;
        isArchived: boolean;
    }) => void;
}

const UserArchivWarning = (props: UserArchivWarningProps) => {
    return (
        <Dialog
            aria-labelledby="contained-modal-title-vcenter"
            onClose={props.setModalArchivHide}
            open={props.archivUserWarning}
        >
            <DialogTitle>{i18next.t('Warning', { ns: 'common' })}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {' '}
                    Do you want to archiv{' '}
                    <b>
                        {props.firstname} - {props.lastname}
                    </b>
                    ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={props.isUpdatingArchivUser}
                    onClick={() =>
                        props.updateUserArchivStatus({
                            user_id: props.selected_user_id,
                            isArchived: props.archiv === true ? false : true
                        })
                    }
                    variant="contained"
                >
                    {props.isUpdatingArchivUser
                        ? i18next.t('Loading')
                        : i18next.t('Yes', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    onClick={props.setModalArchivHide}
                    variant="outlined"
                >
                    {i18next.t('No', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default UserArchivWarning;
