import React, { useCallback, useEffect, useState } from 'react';
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
import { createApplicationV2, queryClient, Application } from '@/api';
import type { StudentSearchResult } from '@taiger-common/model';
import { useApplicationStudent } from '@hooks/useApplicationStudent';
import { useStudentSearch } from '@hooks/useStudentSearch';
import { useSnackBar } from '@contexts/use-snack-bar';

export interface ImportStudentProgramsCardProps {
    student: Record<string, unknown> & { applications?: Application[] };
    compact?: boolean;
}

type CreateApplicationResponse = {
    success: boolean;
    data?: unknown;
    message?: string;
};

export const ImportStudentProgramsCard = (
    props: ImportStudentProgramsCardProps
) => {
    const { compact = false } = props;
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [importStudentProgramsCard, setImportStudentProgramsCardState] =
        useState({
            error: '',
            student: props.student,
            selectedStudentName: '',
            isLoaded: true,
            importedStudent: '',
            importedStudentPrograms: [] as Application[],
            program_ids: [] as string[],
            importedStudentModalOpen: false,
            isButtonDisable: false,
            isImportingStudentPrograms: false,
            program_id: null as string | null,
            success: false,
            searchTerm: '',
            isResultsVisible: false,
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: '',
            selectedImportStudentId: null as string | null,
            deselectedImportProgramIds: [] as string[]
        });

    const selectedImportStudentId =
        importStudentProgramsCard.selectedImportStudentId ?? undefined;
    const {
        data: importSourceData,
        isLoading: isImportSourceLoading,
        isError: isImportSourceError,
        error: importSourceError
    } = useApplicationStudent(selectedImportStudentId, {
        enabled: !!selectedImportStudentId
    });

    const importSourceApplications =
        (importSourceData as { applications?: Application[] } | undefined)
            ?.applications ?? [];
    const importSourceProgramIds = importSourceApplications.map((app) =>
        String(app.programId?._id ?? '')
    );
    const selectedProgramIds = importSourceProgramIds.filter(
        (id) =>
            !importStudentProgramsCard.deselectedImportProgramIds.includes(id)
    );

    const { results: searchDisplayResults, isSuccess: searchQueryIsSuccess } =
        useStudentSearch(importStudentProgramsCard.searchTerm, {
            debounceMs: 300
        });

    const handleClickOutside = useCallback(() => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            isResultsVisible: false
        }));
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [handleClickOutside]);

    const onClickStudentHandler = (result: StudentSearchResult) => {
        const studentId = String(result._id ?? '');
        const selectedStudentName =
            `${result.firstname ?? ''} ${result.lastname ?? ''} ${
                result.firstname_chinese ?? ''
            } ${result.lastname_chinese ?? ''}`.trim();
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            importedStudentModalOpen: true,
            selectedImportStudentId: studentId,
            selectedStudentName,
            deselectedImportProgramIds: []
        }));
    };

    const onHideimportedStudentModalOpen = () => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            importedStudentModalOpen: false,
            selectedImportStudentId: null,
            deselectedImportProgramIds: []
        }));
    };

    const handleInputBlur = () => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            isResultsVisible: false
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trimLeft();
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            searchTerm: value,
            isResultsVisible: value.length > 0
        }));
    };

    const modifyImportingPrograms = (
        new_programId: string,
        currentlySelected: boolean
    ) => {
        setImportStudentProgramsCardState((prevState) => ({
            ...prevState,
            deselectedImportProgramIds: currentlySelected
                ? [...prevState.deselectedImportProgramIds, new_programId]
                : prevState.deselectedImportProgramIds.filter(
                      (id) => id !== new_programId
                  )
        }));
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
                    importedStudentPrograms: (res.data ?? []) as Application[],
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
            program_ids: selectedProgramIds
        });
    };
    return (
        <>
            <Card
                sx={{
                    p: compact ? 1 : 2,
                    minHeight: compact ? 'auto' : '340px',
                    zIndex: 0,
                    width: compact ? { xs: '100%', md: 360 } : '100%'
                }}
                variant={compact ? 'outlined' : 'elevation'}
            >
                <Typography variant={compact ? 'subtitle2' : 'body1'}>
                    {t('Import programs from another student')}
                </Typography>
                {!compact ? (
                    <Typography>
                        {t(
                            'Find the student (name or email) and import his/her progams'
                        )}
                    </Typography>
                ) : null}
                <Box sx={{ position: 'relative' }}>
                    <TextField
                        className="search-input"
                        fullWidth
                        onChange={handleInputChange}
                        onMouseDown={handleInputBlur}
                        placeholder={
                            compact
                                ? t('Search student to import...')
                                : t('Search student...')
                        }
                        size="small"
                        type="text"
                        value={importStudentProgramsCard.searchTerm}
                        variant="outlined"
                    />
                    {importStudentProgramsCard.isResultsVisible &&
                    (searchDisplayResults.length > 0 ||
                        searchQueryIsSuccess) ? (
                        searchDisplayResults.length > 0 ? (
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
                                    {searchDisplayResults.map((result, i) => (
                                        <ListItem
                                            button
                                            key={i}
                                            onClick={() =>
                                                onClickStudentHandler(result)
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
                                    ))}
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
                    {isImportSourceLoading ? (
                        <CircularProgress size={16} />
                    ) : isImportSourceError ? (
                        <DialogContentText>
                            {(importSourceError as Error)?.message ??
                                'Failed to load applications'}
                        </DialogContentText>
                    ) : (
                        <List>
                            {importSourceApplications.map((app, i) => {
                                const programIdStr =
                                    app.programId?._id?.toString() ?? '';
                                const isSelected =
                                    selectedProgramIds.includes(programIdStr);
                                return (
                                    <ListItemButton
                                        dense
                                        key={i}
                                        onClick={() =>
                                            modifyImportingPrograms(
                                                programIdStr,
                                                isSelected
                                            )
                                        }
                                        role={undefined}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={isSelected}
                                                disableRipple
                                                edge="start"
                                                tabIndex={-1}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${app.programId?.school} - ${app.programId?.program_name} ${app.programId?.degree} ${app.programId?.semester}`}
                                        />
                                    </ListItemButton>
                                );
                            })}
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
        </>
    );
};
