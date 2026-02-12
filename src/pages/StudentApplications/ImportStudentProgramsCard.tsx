import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import { HighlightText } from '../Utils/checking-functions';
import {
    createApplicationV2,
    getQueryStudentsResults,
    getApplicationStudentV2
} from '@api/index';
import { queryClient } from '@api/client';
import type { Application } from '@/api/types';
import { useSnackBar } from '@contexts/use-snack-bar';

export interface ImportStudentProgramsCardProps {
    student: Record<string, unknown> & { applications?: Application[] };
}

type CreateApplicationResponse = {
    success: boolean;
    data?: unknown;
    message?: string;
};

export const ImportStudentProgramsCard = (
    props: ImportStudentProgramsCardProps
) => {
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [importStudentProgramsCard, setImportStudentProgramsCardState] =
        useState({
            error: '',
            student: props.student,
            selectedStudentName: '',
            isLoaded: true,
            importedStudent: '',
            importedStudentPrograms: [],
            program_ids: [],
            importedStudentModalOpen: false,
            isButtonDisable: false,
            isImportingStudentPrograms: false,
            modalShowAssignSuccessWindow: false,
            program_id: null,
            success: false,
            searchResults: [],
            isResultsVisible: false,
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: ''
        });

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setImportStudentProgramsCardState((prevState) => ({
                    ...prevState,
                    isLoading: true
                }));
                const response = await getQueryStudentsResults(
                    importStudentProgramsCard.searchTerm
                );
                if (response.data.success) {
                    setImportStudentProgramsCardState((prevState) => ({
                        ...prevState,
                        searchResults: response.data.data,
                        isResultsVisible: true,
                        isLoading: false
                    }));
                } else {
                    setImportStudentProgramsCardState((prevState) => ({
                        ...prevState,
                        isResultsVisible: false,
                        searchTerm: '',
                        searchResults: [],
                        isErrorTerm: true,
                        isLoading: false,
                        res_modal_status: 401,
                        res_modal_message: 'Session expired. Please refresh.'
                    }));
                }
            } catch (error) {
                setImportStudentProgramsCardState((prevState) => ({
                    ...prevState,
                    isResultsVisible: false,
                    searchTerm: '',
                    searchResults: [],
                    isErrorTerm: true,
                    isLoading: false,
                    res_modal_status: 403,
                    res_modal_message: error
                }));
            }
        };
        const delayDebounceFn = setTimeout(() => {
            if (importStudentProgramsCard.searchTerm) {
                fetchSearchResults();
            } else {
                setImportStudentProgramsCardState((prevState) => ({
                    ...prevState,
                    searchResults: []
                }));
            }
        }, 300); // Adjust the delay as needed
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            clearTimeout(delayDebounceFn);
        };
    }, [fetchSearchResults, importStudentProgramsCard]);

    const handleClickOutside = () => {
        // Clicked outside, hide the result list
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            isResultsVisible: false
        }));
    };

    const onClickStudentHandler = (result) => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            importedStudentModalOpen: true,
            isImportingStudentPrograms: true
        }));
        // Call api:
        getApplicationStudentV2(result._id.toString()).then(
            (res) => {
                const { data, success, status } = res;
                if (success) {
                    setImportStudentProgramsCardState((prevState) => ({
                        ...prevState,
                        isImportingStudentPrograms: false,
                        importedStudentPrograms: data.applications,
                        selectedStudentName: `${result.firstname} ${result.lastname} ${
                            result.firstname_chinese || ''
                        } ${result.lastname_chinese || ''}`,
                        program_ids: data.applications?.map(
                            (app: Application) =>
                                String(app.programId?._id ?? '')
                        )
                    }));
                } else {
                    const { message } = res;
                    setImportStudentProgramsCardState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message
                    }));
                }
            },
            () => {}
        );
    };

    const onHideimportedStudentModalOpen = () => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            importedStudentModalOpen: false,
            importedStudentPrograms: []
        }));
    };

    const handleInputBlur = () => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            isResultsVisible: false
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            searchTerm: e.target.value.trimLeft()
        }));
        if (e.target.value.length === 0) {
            setImportStudentProgramsCardState((prevState) => ({
                ...prevState,
                isResultsVisible: false
            }));
        }
    };

    const onHideAssignSuccessWindow = () => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            modalShowAssignSuccessWindow: false
        }));
        window.location.reload(true);
    };

    const modifyImportingPrograms = (new_programId, isActive) => {
        let importing_program_ids_existing = [
            ...importStudentProgramsCard.program_ids
        ];

        if (isActive) {
            importing_program_ids_existing =
                importing_program_ids_existing.filter(
                    (item) => item !== new_programId
                );
            setImportStudentProgramsCardState((prevState) => ({
                ...prevState,
                program_ids: importing_program_ids_existing
            }));
        } else {
            importing_program_ids_existing.push(new_programId);
            setImportStudentProgramsCardState((prevState) => ({
                ...prevState,
                program_ids: importing_program_ids_existing
            }));
        }
    };

    const importProgramsMutation = useMutation({
        mutationFn: createApplicationV2,
        onSuccess: (res: CreateApplicationResponse) => {
            if (res.success) {
                const studentId = String(importStudentProgramsCard.student._id);
                queryClient
                    .refetchQueries({
                        queryKey: ['applications/student', studentId]
                    })
                    .then(() => {
                        setSeverity('success');
                        setMessage(t('Program(s) imported successfully'));
                        setOpenSnackbar(true);
                    });
                setImportStudentProgramsCardState((prevState) => ({
                    ...prevState,
                    importedStudentPrograms: res.data,
                    importedStudentModalOpen: false,
                    success: res.success
                }));
            } else {
                const errRes = res as { data?: { message?: string } };
                const message =
                    errRes.data?.message ?? res.message ?? 'Import failed';
                setImportStudentProgramsCardState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    importedStudentModalOpen: false,
                    res_modal_message: message
                }));
            }
        },
        onError: (error: Error) => {
            setImportStudentProgramsCardState((prevState) => ({
                ...prevState,
                isLoaded: true
            }));
            setSeverity('error');
            setMessage(
                error.message || t('An error occurred. Please try again.')
            );
            setOpenSnackbar(true);
        }
    });

    const { mutate, isPending } = importProgramsMutation;

    const handleImportProgramsConfirm = () => {
        mutate({
            studentId: String(importStudentProgramsCard.student._id),
            program_ids: importStudentProgramsCard.program_ids
        });
    };
    return (
        <>
            <Card sx={{ p: 2, minHeight: '340px', zIndex: 0 }}>
                <Typography>
                    {t('Import programs from another student')}
                </Typography>
                <Typography>
                    {t(
                        'Find the student (name or email) and import his/her progams'
                    )}
                </Typography>
                <Box sx={{ position: 'relative' }}>
                    <TextField
                        className="search-input"
                        fullWidth
                        onChange={handleInputChange}
                        onMouseDown={handleInputBlur}
                        placeholder={t('Search student...')}
                        size="small"
                        type="text"
                        value={importStudentProgramsCard.searchTerm}
                        variant="outlined"
                    />
                    {importStudentProgramsCard.isResultsVisible ? (
                        importStudentProgramsCard.searchResults?.length > 0 ? (
                            <Paper
                                sx={{
                                    marginTop: '5px',
                                    position: 'absolute',
                                    zIndex: 2,
                                    left: 0,
                                    right: 0,
                                    maxHeight: '220px',
                                    overflowY: 'auto'
                                }}
                            >
                                <List>
                                    {importStudentProgramsCard.searchResults?.map(
                                        (result, i) => (
                                            <ListItem
                                                button
                                                key={i}
                                                onClick={() =>
                                                    onClickStudentHandler(
                                                        result
                                                    )
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <>
                                                            <HighlightText
                                                                highlight={
                                                                    importStudentProgramsCard.searchTerm
                                                                }
                                                                text={`${result.firstname} ${result.lastname} ${
                                                                    result.firstname_chinese ||
                                                                    ''
                                                                } ${result.lastname_chinese || ''}`}
                                                            />
                                                            {result.email ? (
                                                                <Box
                                                                    component="span"
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        ml: 1
                                                                    }}
                                                                >
                                                                    <EmailIcon
                                                                        sx={{
                                                                            mr: 0.5
                                                                        }}
                                                                    />
                                                                    <HighlightText
                                                                        highlight={
                                                                            importStudentProgramsCard.searchTerm
                                                                        }
                                                                        text={
                                                                            result.email
                                                                        }
                                                                    />
                                                                </Box>
                                                            ) : null}
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        )
                                    )}
                                </List>
                            </Paper>
                        ) : (
                            <Paper
                                sx={{
                                    marginTop: '5px',
                                    position: 'absolute',
                                    zIndex: 2,
                                    left: 0,
                                    right: 0
                                }}
                            >
                                <List>
                                    <ListItem button>
                                        <ListItemText primary="No result" />
                                    </ListItem>
                                </List>
                            </Paper>
                        )
                    ) : null}
                </Box>
            </Card>
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={onHideimportedStudentModalOpen}
                open={importStudentProgramsCard.importedStudentModalOpen}
                size="xl"
            >
                <DialogTitle>
                    Import programs from{' '}
                    <b>{importStudentProgramsCard.selectedStudentName}</b>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to import the following programs?
                        <br />
                        (Same programs will <b>NOT</b> be duplicated :) )
                    </DialogContentText>
                    {importStudentProgramsCard.isImportingStudentPrograms ? (
                        <CircularProgress size={16} />
                    ) : (
                        <List>
                            {importStudentProgramsCard.importedStudentPrograms?.map(
                                (app, i) => (
                                    <ListItemButton
                                        dense
                                        key={i}
                                        onClick={() =>
                                            modifyImportingPrograms(
                                                app.programId._id.toString(),
                                                importStudentProgramsCard.program_ids?.some(
                                                    (program_id) =>
                                                        program_id ===
                                                        app.programId._id.toString()
                                                )
                                            )
                                        }
                                        role={undefined}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={importStudentProgramsCard.program_ids?.some(
                                                    (program_id) =>
                                                        program_id ===
                                                        app.programId._id.toString()
                                                )}
                                                disableRipple
                                                edge="start"
                                                tabIndex={-1}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${app.programId?.school} - ${app.programId?.program_name} ${app.programId?.degree} ${app.programId?.semester}`}
                                        />
                                    </ListItemButton>
                                )
                            ) || []}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={isPending}
                        onClick={handleImportProgramsConfirm}
                        variant="contained"
                    >
                        {isPending ? (
                            <CircularProgress size={16} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                    <Button
                        color="primary"
                        onClick={onHideimportedStudentModalOpen}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                onClose={onHideAssignSuccessWindow}
                open={importStudentProgramsCard.modalShowAssignSuccessWindow}
            >
                <DialogTitle>{t('Success', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    Program(s) imported to student successfully!
                </DialogContent>
                <DialogActions>
                    <Button onClick={onHideAssignSuccessWindow}>
                        {t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
