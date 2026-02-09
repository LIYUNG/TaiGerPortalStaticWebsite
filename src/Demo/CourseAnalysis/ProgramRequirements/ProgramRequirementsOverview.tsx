import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery,
    Tooltip,
    Stack,
    lighten
} from '@mui/material';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    MaterialReactTable,
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton
} from 'material-react-table';
import React, { useState, useMemo } from 'react';
import DEMO from '../../../store/constant';
import { useTranslation } from 'react-i18next';
import { deleteProgramRequirement } from '../../../api';

const ProgramRequirementsOverview = ({ programRequirements }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [programRequirementsState, setProgramRequirementsState] =
        useState(programRequirements);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [requirementIdToBeDeleted, setRequirementIdToBeDeleted] =
        useState('');
    const navigate = useNavigate();

    const handleRequirementEdit = (requirementId) => {
        navigate(DEMO.EDIT_PROGRAM_ANALYSIS(requirementId));
    };

    const handleDeleteModal = (requirementId) => {
        setDeleteModalOpen(!deleteModalOpen);
        setRequirementIdToBeDeleted(requirementId);
    };

    const handleRequirementDelete = async () => {
        setIsDeleting(true);
        const resp = await deleteProgramRequirement(requirementIdToBeDeleted);
        const { success } = resp.data;
        if (!success) {
            alert('Failed!');
            setIsDeleting(false);
        } else {
            setProgramRequirementsState(
                programRequirementsState.filter(
                    (r) => r._id !== requirementIdToBeDeleted
                )
            );
            setRequirementIdToBeDeleted('');
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => row.programId[0].school,
                id: 'school',
                header: 'School',
                size: 200,
                filterVariant: 'autocomplete'
            },
            {
                accessorFn: (row) => row.programId[0].program_name,
                id: 'program_name',
                header: 'Program Name',
                size: 250,
                filterVariant: 'autocomplete'
            },
            {
                accessorFn: (row) => row.programId[0].degree,
                id: 'degree',
                header: 'Degree',
                size: 120,
                filterVariant: 'autocomplete'
            },
            {
                accessorFn: (row) => row.programId[0].lang,
                id: 'language',
                header: 'Language',
                size: 100,
                filterVariant: 'autocomplete'
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 100,
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <Tooltip title="Edit">
                            <IconButton
                                onClick={() =>
                                    handleRequirementEdit(row.original._id)
                                }
                                size="small"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                onClick={() =>
                                    handleDeleteModal(row.original._id)
                                }
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )
            }
        ],
        [handleDeleteModal, handleRequirementEdit]
    );

    const renderDetailPanel = ({ row }) => {
        const categories = row.original.program_categories;
        return (
            <Box sx={{ p: 2 }}>
                <Typography gutterBottom variant="h6">
                    Program Categories
                </Typography>
                <MaterialReactTable
                    columns={[
                        {
                            accessorKey: 'program_category',
                            header: 'Category Name',
                            size: 150
                        },
                        {
                            accessorKey: 'requiredECTS',
                            header: 'Required ECTS',
                            size: 120
                        },
                        {
                            accessorFn: (row) =>
                                row.keywordSets?.[0]?.keywords?.en?.join(
                                    ', '
                                ) || '',
                            header: 'Keywords (EN)',
                            size: 200
                        },
                        {
                            accessorFn: (row) =>
                                row.keywordSets?.[0]?.keywords?.zh?.join(
                                    ', '
                                ) || '',
                            header: 'Keywords (ZH)',
                            size: 200
                        },
                        {
                            accessorFn: (row) =>
                                row.keywordSets?.[0]?.antiKeywords?.en?.join(
                                    ', '
                                ) || '',
                            header: 'Anti-Keywords (EN)',
                            size: 200
                        },
                        {
                            accessorFn: (row) =>
                                row.keywordSets?.[0]?.antiKeywords?.zh?.join(
                                    ', '
                                ) || '',
                            header: 'Anti-Keywords (ZH)',
                            size: 200
                        },
                        {
                            accessorFn: (row) =>
                                row.keywordSets?.[0]?.description || '',
                            header: 'Description',
                            size: 200
                        }
                    ]}
                    data={categories}
                    enableBottomToolbar={false}
                    enableColumnActions={false}
                    enableColumnFilters={false}
                    enableTopToolbar={false}
                    muiTableProps={{
                        sx: {
                            tableLayout: 'fixed'
                        }
                    }}
                />
            </Box>
        );
    };

    const renderTopToolbar = ({ table }) => (
        <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            sx={{
                p: '16px',
                backgroundColor: lighten(theme.palette.background.default, 0.05)
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    spacing={1}
                >
                    <MRTGlobalFilterTextField table={table} />
                    <MRTToggleFiltersButton table={table} />
                </Stack>
            </Box>
            <Box>
                <Button
                    color="primary"
                    component={LinkDom}
                    sx={{ mr: 2 }}
                    to={`${DEMO.KEYWORDS_EDIT}`}
                    variant="outlined"
                >
                    {t('Edit Keywords', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    component={LinkDom}
                    target="_blank"
                    to={`${DEMO.CREATE_NEW_PROGRAM_ANALYSIS}`}
                    variant="contained"
                >
                    {t('Create New Analysis', { ns: 'common' })}
                </Button>
            </Box>
        </Stack>
    );

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <MaterialReactTable
                    columns={columns}
                    data={programRequirementsState}
                    enableColumnFilterModes
                    enableColumnOrdering
                    enableExpanding
                    enableFacetedValues
                    initialState={{
                        showColumnFilters: true,
                        density: 'compact'
                    }}
                    muiTableBodyRowProps={() => ({
                        sx: {
                            cursor: 'pointer'
                        }
                    })}
                    muiTablePaperProps={{
                        sx: {
                            '--MRT-row-detail-panel-bg':
                                theme.palette.background.default
                        }
                    }}
                    renderDetailPanel={renderDetailPanel}
                    renderTopToolbar={renderTopToolbar}
                />
            </Box>
            <Dialog
                onClose={() => setDeleteModalOpen(false)}
                open={deleteModalOpen}
                size="small"
            >
                <DialogTitle>{t('Attention', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <Typography id="modal-modal-description" sx={{ my: 2 }}>
                        {t('Do you want to delete')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        disabled={isDeleting}
                        onClick={() => handleRequirementDelete()}
                        sx={{ mr: 1 }}
                        title="Undo"
                        variant="contained"
                    >
                        {isDeleting ? (
                            <CircularProgress size={20} />
                        ) : (
                            t('Confirm', { ns: 'common' })
                        )}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() => setDeleteModalOpen(false)}
                        title="Undo"
                        variant="outlined"
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProgramRequirementsOverview;
