import React, { useState } from 'react';
import {
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ProgramReportModalProps {
    isReport: boolean;
    setReportModalHideDelete: () => void;
    uni_name: string;
    program_name: string;
    program_id: string;
    submitProgramReport: (program_id: string, description: string) => void;
}

const ProgramReportModal = ({
    isReport,
    setReportModalHideDelete,
    uni_name,
    program_name,
    program_id,
    submitProgramReport
}: ProgramReportModalProps) => {
    const { t } = useTranslation();
    const [programReportModalState, setProgramReportModalState] = useState({
        description: ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProgramReportModalState((prevState) => ({
            ...prevState,
            description: e.target.value
        }));
    };

    return (
        <Dialog onClose={setReportModalHideDelete} open={isReport}>
            <DialogTitle>Report</DialogTitle>
            <DialogContent>
                What information is inaccurate for {uni_name} - {program_name}?
                <TextField
                    fullWidth
                    inputProps={{ maxLength: 2000 }}
                    isInvalid={
                        programReportModalState.description?.length > 2000
                    }
                    minRows={10}
                    multiline
                    onChange={(e) => handleChange(e)}
                    placeholder="Deadline is wrong."
                    type="textarea"
                    value={programReportModalState.description || ''}
                />
                <Badge>
                    {programReportModalState.description?.length || 0}/{2000}
                </Badge>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={programReportModalState.description?.length === 0}
                    onClick={() =>
                        submitProgramReport(
                            program_id,
                            programReportModalState.description
                        )
                    }
                    variant="contained"
                >
                    {t('Create ticket', { ns: 'programList' })}
                </Button>
                <Button
                    color="secondary"
                    onClick={setReportModalHideDelete}
                    variant="outlined"
                >
                    {t('Close', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ProgramReportModal;
