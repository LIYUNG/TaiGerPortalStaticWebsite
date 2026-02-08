import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';

import { getEssayWriters } from '../../../../api';

const EditInterviewTrainersSubpage = (props) => {
    const [checkboxState, setCheckboxState] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        getEssayWriters().then(
            (resp) => {
                const { data, success } = resp.data;
                if (success) {
                    const trainers = data;
                    const { trainer_id: interview_trainers } = props.interview;
                    const updateTrainerList = trainers.reduce(
                        (prev, { _id }) => ({
                            ...prev,
                            [_id]: interview_trainers
                                ? interview_trainers.findIndex(
                                      (interview_trainer) =>
                                          interview_trainer._id === _id
                                  ) > -1
                                : false
                        }),
                        {}
                    );
                    setCheckboxState({ trainers, updateTrainerList });
                    setIsLoaded(true);
                } else {
                    setIsLoaded(true);
                }
            },
            () => {
                setIsLoaded(true);
            }
        );
    }, [props.interview.trainer_id]);

    const handleChangeTrainerlist = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setCheckboxState((prevState) => ({
            ...prevState,
            updateTrainerList: {
                ...prevState.updateTrainerList,
                [value]: !prevState.updateTrainerList[value]
            }
        }));
    };

    return (
        <Dialog onClose={props.onHide} open={props.show}>
            {isLoaded ? (
                <>
                    <DialogTitle>
                        {props.actor} for {props.interview.program_id?.school}-
                        {props.interview.program_id?.program_name}
                        {props.interview.program_id?.degree}
                        {props.interview.program_id?.semester}
                        {props.interview.student_id?.firstname}
                        {props.interview.student_id?.lastname}
                    </DialogTitle>
                    <DialogContent>
                        {t('Interview Trainer')}
                        <Table size="small">
                            <TableBody>
                                {checkboxState.trainers ? (
                                    checkboxState.trainers.map((trainer, i) => (
                                        <TableRow key={i + 1}>
                                            <TableCell>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={
                                                                checkboxState
                                                                    ?.updateTrainerList[
                                                                    trainer._id
                                                                ] || false
                                                            }
                                                            onChange={(e) =>
                                                                handleChangeTrainerlist(
                                                                    e
                                                                )
                                                            }
                                                            value={trainer._id}
                                                        />
                                                    }
                                                    label={`${trainer.lastname} ${trainer.firstname}`}
                                                />
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="h6">
                                                {t(
                                                    'No Interview Trainer Students'
                                                )}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            disabled={
                                !checkboxState.updateTrainerList ||
                                checkboxState.updateTrainerList?.length === 0 ||
                                props.isSubmitting
                            }
                            onClick={(e) =>
                                props.submitUpdateInterviewTrainerlist(
                                    e,
                                    checkboxState.updateTrainerList,
                                    props.interview._id
                                )
                            }
                            startIcon={
                                props.isSubmitting ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <SaveIcon />
                                )
                            }
                            variant="contained"
                        >
                            {t('Update', { ns: 'common' })}
                        </Button>
                        <Button onClick={props.onHide} variant="outlined">
                            {t('Cancel', { ns: 'common' })}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <CircularProgress size={24} />
            )}
        </Dialog>
    );
};
export default EditInterviewTrainersSubpage;
