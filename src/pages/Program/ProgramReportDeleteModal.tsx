import React, { useState } from 'react';
import {
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ProgramReportDeleteModalProps {
    program_name: string;
    uni_name: string;
    ticket: Record<string, unknown>;
    isReportDelete: boolean;
    setReportDeleteModalHide: () => void;
    submitProgramDeleteReport: (ticket_id: string) => void;
}

const ProgramReportDeleteModal = ({
    program_name,
    uni_name,
    ticket,
    isReportDelete,
    setReportDeleteModalHide,
    submitProgramDeleteReport
}: ProgramReportDeleteModalProps) => {
    const [programReportDeleteModal, setProgramReportDeleteModalState] =
        useState({
            ticket: {},
            delete: ''
        });
    const { t } = useTranslation();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const temp_ticket = { ...programReportDeleteModal.ticket };
        temp_ticket[e.target.id] = e.target.value;
        setProgramReportDeleteModalState((prevState) => ({
            ...prevState,
            ticket: temp_ticket
        }));
    };

    const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProgramReportDeleteModalState((prevState) => ({
            ...prevState,
            delete: e.target.value
        }));
    };

    return (
        <Dialog onClose={setReportDeleteModalHide} open={isReportDelete}>
            <DialogTitle>
                {t('Delete ticket', { ns: 'programList' })}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Do you want to delelete {uni_name} - {program_name} ticket?
                </DialogContentText>
                {t('Description', { ns: 'common' })}
                <TextField
                    defaultValue={ticket.description}
                    fullWidth
                    inputProps={{ maxLength: 2000 }}
                    isInvalid={ticket.description?.length > 2000}
                    minRows={4}
                    multiline
                    onChange={(e) => handleChange(e)}
                    placeholder="Deadline is wrong."
                    type="textarea"
                />
                <Badge>
                    {ticket.description?.length || 0}/{2000}
                </Badge>
                <DialogContentText>
                    {t('Feedback', { ns: 'common' })}
                </DialogContentText>
                <TextField
                    defaultValue={ticket.feedback}
                    fullWidth
                    inputProps={{ maxLength: 2000 }}
                    isInvalid={ticket.feedback?.length > 2000}
                    minRows={4}
                    multiline
                    onChange={(e) => handleChange(e)}
                    placeholder="Deadline is wrong."
                    type="textarea"
                />
                <Badge>
                    {ticket.feedback?.length || 0}/{2000}
                </Badge>
                <DialogContentText>
                    Please enter <i>delete</i> in order to delete the ticket.
                </DialogContentText>
                <TextField
                    fullWidth
                    id="delete"
                    onChange={(e) => handleDeleteChange(e)}
                    placeholder="delete"
                    size="small"
                    type="text"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={programReportDeleteModal.delete !== 'delete'}
                    onClick={() =>
                        submitProgramDeleteReport(ticket._id.toString())
                    }
                    variant="contained"
                >
                    {t('Delete ticket', { ns: 'programList' })}
                </Button>
                <Button
                    color="secondary"
                    onClick={setReportDeleteModalHide}
                    variant="outlined"
                >
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ProgramReportDeleteModal;
