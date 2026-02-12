import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    List,
    ListItem,
    Typography,
    Switch,
    FormControl,
    FormGroup
} from '@mui/material';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { createApplicationV2 } from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import { useAuth } from '@components/AuthProvider';
import { is_TaiGer_Editor, is_TaiGer_Agent } from '@taiger-common/core';
import { useStudentsV3 } from '@hooks/useStudentsV3';
import { IProgram } from '@taiger-common/model';
import { IStudentResponse } from '@/types/taiger-common';

export interface AssignProgramsToStudentDialogProps {
    open: boolean;
    onClose: () => void;
    programs: IProgram[];
    handleOnSuccess: () => void;
    student: IStudentResponse;
}

export const AssignProgramsToStudentDialog = ({
    open,
    onClose,
    programs,
    handleOnSuccess,
    student
}: AssignProgramsToStudentDialogProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [showMyStudentsOnly, setShowMyStudentsOnly] = useState(true);

    const baseFilter = { archiv: false };
    const roleFilter = is_TaiGer_Editor(user)
        ? { ...baseFilter, editors: user._id }
        : is_TaiGer_Agent(user)
          ? { ...baseFilter, agents: user._id }
          : baseFilter;

    // Determine which filter to use based on toggle state
    const currentFilter = showMyStudentsOnly ? roleFilter : baseFilter;

    const {
        data,
        isLoading,
        isError: isQueryError,
        error
    } = useStudentsV3(currentFilter, { enabled: open });

    // Refetch data when filter changes
    const handleFilterToggle = (event) => {
        setShowMyStudentsOnly(event.target.checked);
    };

    const [studentId, setStudentId] = useState('');
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const {
        mutate,
        isPending,
        isError: isMutateError,
        error: mutateError
    } = useMutation({
        mutationFn: createApplicationV2,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: () => {
            handleOnSuccess();
            setSeverity('success');
            setMessage('Assigned programs successfully!');
            setStudentId('');
            setOpenSnackbar(true);
        }
    });

    const handleSetStudentId = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setStudentId(value);
    };

    const handleSubmit = () => {
        const program_ids = programs?.map(({ _id }) => _id);
        mutate({ studentId, program_ids });
    };

    const students = data ? (student ? [student] : data) : [];

    return (
        <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
            <DialogTitle>
                {t('Selected Programs', { ns: 'programList' })}
            </DialogTitle>
            <DialogContent>
                {programs?.map(
                    ({ school, program_name, degree, semester }, index) => (
                        <Box key={index}>
                            {school} - {program_name} - {degree} - {semester}
                        </Box>
                    )
                )}
                ---
                {/* Filter Toggle Section */}
                <Box sx={{ mb: 2, mt: 2 }}>
                    <FormControl component="fieldset">
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showMyStudentsOnly}
                                        color="primary"
                                        onChange={handleFilterToggle}
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {showMyStudentsOnly
                                            ? t('Show My Students Only', {
                                                  ns: 'common'
                                              })
                                            : t('Show All Students', {
                                                  ns: 'common'
                                              })}
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </FormControl>
                </Box>
                {isLoading ? <CircularProgress /> : null}
                {isQueryError ? (
                    <Typography color="error">
                        An error occurred: {error.message}
                    </Typography>
                ) : null}
                {!isLoading && !isQueryError && students ? (
                    <List dense>
                        {students.map((student, i) => (
                            <ListItem divider key={i}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentId === student._id}
                                            onChange={handleSetStudentId}
                                            value={student._id}
                                        />
                                    }
                                    label={`${student.firstname}, ${student.lastname}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
                {isMutateError ? (
                    <Typography color="error">
                        An error occurred: {mutateError.message}
                    </Typography>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={isPending || studentId === ''}
                    onClick={(e) => handleSubmit(e)}
                    variant="contained"
                >
                    {isPending ? (
                        <CircularProgress size={20} />
                    ) : (
                        t('Assign', { ns: 'common' })
                    )}
                </Button>
                <Button color="primary" onClick={onClose}>
                    {t('Close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
