import { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Badge,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_RowSelectionState,
    MRT_Updater
} from 'material-react-table';

import DEMO from '@store/constant';
import { ProgramCard, type ProgramCardRow } from './ProgramCard';
import {
    ProgramsFilterDrawer,
    type FilterOption
} from './ProgramsFilterDrawer';
import { countActiveFilters } from './programMobileFilters';

export interface ProgramsMobileViewProps {
    programs: ProgramCardRow[];
    total: number;
    isLoading: boolean;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: (updater: MRT_Updater<MRT_ColumnFiltersState>) => void;
    pagination: MRT_PaginationState;
    setPagination: (updater: MRT_Updater<MRT_PaginationState>) => void;
    rowSelection: MRT_RowSelectionState;
    onToggleSelect: (programId: string) => void;
    selectedCount: number;
    clearSelection: () => void;
    onAssignClick: () => void;
    statusOptions: FilterOption[];
    countryOptions: FilterOption[];
    subjectOptions: FilterOption[];
    tagOptions: FilterOption[];
}

export const ProgramsMobileView = ({
    programs,
    total,
    isLoading,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    rowSelection,
    onToggleSelect,
    selectedCount,
    clearSelection,
    onAssignClick,
    statusOptions,
    countryOptions,
    subjectOptions,
    tagOptions
}: ProgramsMobileViewProps) => {
    const { t } = useTranslation();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const activeFilters = countActiveFilters(columnFilters, globalFilter);
    const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

    const menuLinks = [
        {
            to: DEMO.PROGRAMS_OVERVIEW,
            label: t('View Overview', { ns: 'common' })
        },
        {
            to: DEMO.PROGRAM_TICKETS,
            label: t('Program Update Requests', { ns: 'common' })
        },
        {
            to: DEMO.PROGRAM_ANALYSIS,
            label: t('Program Requirements', { ns: 'common' })
        },
        {
            to: DEMO.SCHOOL_CONFIG,
            label: t('School Configuration', { ns: 'common' })
        },
        { to: DEMO.NEW_PROGRAM, label: t('Add New Program', { ns: 'common' }) }
    ];

    return (
        <Box>
            {/* Sticky action bar */}
            <Box
                sx={{
                    bgcolor: 'background.default',
                    pb: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={t('Search', { ns: 'common' })}
                        size="small"
                        value={globalFilter}
                    />
                    <IconButton
                        aria-label={t('Filters', { ns: 'common' })}
                        onClick={() => setFiltersOpen(true)}
                    >
                        <Badge badgeContent={activeFilters} color="primary">
                            <FilterListIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        aria-label={t('More', { ns: 'common' })}
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        onClose={() => setMenuAnchor(null)}
                        open={Boolean(menuAnchor)}
                    >
                        {menuLinks.map((link) => (
                            <MenuItem
                                component={LinkDom}
                                key={link.to}
                                onClick={() => setMenuAnchor(null)}
                                to={link.to}
                            >
                                {link.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>

                {selectedCount > 0 ? (
                    <Box
                        sx={{
                            alignItems: 'center',
                            bgcolor: 'action.selected',
                            borderRadius: 1,
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'space-between',
                            mt: 1,
                            px: 1,
                            py: 0.5
                        }}
                    >
                        <Typography variant="body2">
                            {t('{{count}} selected', {
                                count: selectedCount,
                                ns: 'common',
                                defaultValue: `${selectedCount} selected`
                            })}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button onClick={clearSelection} size="small">
                                {t('Clear', { ns: 'common' })}
                            </Button>
                            <Button
                                color="success"
                                onClick={onAssignClick}
                                size="small"
                                startIcon={<PersonAddIcon />}
                                variant="contained"
                            >
                                {t('Assign ({{count}})', {
                                    count: selectedCount,
                                    ns: 'common',
                                    defaultValue: `Assign (${selectedCount})`
                                })}
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Typography
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                        variant="caption"
                    >
                        {t('{{count}} programs', {
                            count: total,
                            ns: 'common',
                            defaultValue: `${total} programs`
                        })}
                    </Typography>
                )}
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : programs.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {t('No programs found', { ns: 'common' })}
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ mt: 1 }}>
                    {programs.map((program) => {
                        const id = String(program._id ?? '');
                        return (
                            <ProgramCard
                                key={id}
                                onToggleSelect={onToggleSelect}
                                program={program}
                                selected={Boolean(rowSelection[id])}
                            />
                        );
                    })}
                </Box>
            )}

            {pageCount > 1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination
                        color="primary"
                        count={pageCount}
                        onChange={(_e, page) =>
                            setPagination((prev) => ({
                                ...prev,
                                pageIndex: page - 1
                            }))
                        }
                        page={pagination.pageIndex + 1}
                        siblingCount={0}
                        size="small"
                    />
                </Box>
            ) : null}

            <ProgramsFilterDrawer
                columnFilters={columnFilters}
                countryOptions={countryOptions}
                globalFilter={globalFilter}
                onClose={() => setFiltersOpen(false)}
                open={filtersOpen}
                setColumnFilters={setColumnFilters}
                setGlobalFilter={setGlobalFilter}
                statusOptions={statusOptions}
                subjectOptions={subjectOptions}
                tagOptions={tagOptions}
            />
        </Box>
    );
};

export default ProgramsMobileView;
