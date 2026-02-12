import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';

import { useAuth } from '@components/AuthProvider';

export interface ProgramReportUpdateModalProps {
    ticket: Record<string, unknown>;
    isUpdateReport: boolean;
    setReportUpdateModalHide: () => void;
    uni_name: string;
    program_name: string;
    submitProgramUpdateReport: (
        ticket_id: string,
        updatedTicket: Record<string, unknown>
    ) => void;
}

const ProgramReportUpdateModal = ({
    ticket,
    isUpdateReport,
    setReportUpdateModalHide,
    uni_name,
    program_name,
    submitProgramUpdateReport
}: ProgramReportUpdateModalProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [programReportUpdateModalState, ProgramReportUpdateModalState] =
        useState({
            ticket: ticket
        });
    useEffect(() => {
        queueMicrotask(() => {
            ProgramReportUpdateModalState((prevState) => ({
                ...prevState,
                ticket: ticket
            }));
        });
    }, [ticket]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const temp_ticket = { ...programReportUpdateModalState.ticket };
        temp_ticket[e.target.name] = e.target.value;
        ProgramReportUpdateModalState((prevState) => ({
            ...prevState,
            ticket: temp_ticket
        }));
    };

    return (
        <Dialog onClose={setReportUpdateModalHide} open={isUpdateReport}>
            <DialogTitle>Report</DialogTitle>
            <DialogContent>
                What information is inaccurate for {uni_name} - {program_name}?{' '}
                <TextField
                    fullWidth
                    minRows={10}
                    multiline
                    name="description"
                    onChange={(e) => handleChange(e)}
                    placeholder="Deadline is wrong."
                    type="textarea"
                    value={programReportUpdateModalState.ticket.description}
                />
                <Typography variant="body1">Feedback</Typography>
                <TextField
                    defaultValue={programReportUpdateModalState.ticket.feedback}
                    fullWidth
                    minRows={10}
                    multiline
                    name="feedback"
                    onChange={(e) => handleChange(e)}
                    placeholder="Deadline is for Non-EU (05-15)"
                    type="textarea"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={!is_TaiGer_role(user)}
                    onClick={() =>
                        submitProgramUpdateReport(ticket._id.toString(), {
                            ...programReportUpdateModalState.ticket,
                            status: 'resolved'
                        })
                    }
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {t('Resolve ticket', { ns: 'programList' })}
                </Button>
                <Button
                    color="secondary"
                    onClick={setReportUpdateModalHide}
                    variant="outlined"
                >
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ProgramReportUpdateModal;
