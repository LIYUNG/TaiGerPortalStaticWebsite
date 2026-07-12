import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TablePagination,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type {
    MRT_PaginationState,
    MRT_RowSelectionState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import { ProgramResultCard, type ProgramResultRow } from './ProgramResultCard';

/**
 * The server-sortable fields. The MRT table exposed these as clickable column
 * headers; with a card layout there are no headers, so they move into an
 * explicit "Sort by" control. Keep in step with PROGRAM_SORTABLE_IDS —
 * anything else is silently ignored by the backend.
 */
const SORT_FIELDS: Array<{ id: string; labelKey: string }> = [
    { id: 'school', labelKey: 'School' },
    { id: 'program_name', labelKey: 'Program' },
    { id: 'country', labelKey: 'Country' },
    { id: 'degree', labelKey: 'Degree' },
    { id: 'semester', labelKey: 'Semester' },
    { id: 'application_deadline', labelKey: 'Deadline' },
    { id: 'updatedAt', labelKey: 'Last update' }
];

const UNSORTED = '';

export interface ProgramResultsListProps {
    programs: ProgramResultRow[];
    total: number;
    isLoading: boolean;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    sorting: MRT_SortingState;
    setSorting: (updater: MRT_Updater<MRT_SortingState>) => void;
    pagination: MRT_PaginationState;
    setPagination: (updater: MRT_Updater<MRT_PaginationState>) => void;
    rowSelection: MRT_RowSelectionState;
    onToggleSelect: (programId: string) => void;
    onSelectPage: (programIds: string[], selected: boolean) => void;
    selectedCount: number;
    clearSelection: () => void;
}

export const ProgramResultsList = ({
    programs,
    total,
    isLoading,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    pagination,
    setPagination,
    rowSelection,
    onToggleSelect,
    onSelectPage,
    selectedCount,
    clearSelection
}: ProgramResultsListProps) => {
    const { t } = useTranslation();

    const sortValue = sorting[0]
        ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}`
        : UNSORTED;

    const pageIds = useMemo(
        () => programs.map((program) => String(program._id ?? '')),
        [programs]
    );
    const selectedOnPage = pageIds.filter((id) => rowSelection[id]).length;
    const allPageSelected =
        pageIds.length > 0 && selectedOnPage === pageIds.length;

    const handleSortChange = (value: string) => {
        if (value === UNSORTED) {
            setSorting(() => []);
            return;
        }
        const [id, direction] = value.split(':');
        setSorting(() => [{ id, desc: direction === 'desc' }]);
    };

    return (
        <Stack spacing={2}>
            <Paper sx={{ p: 2 }} variant="outlined">
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={t('Search by program, school, country…', {
                            ns: 'common',
                            defaultValue: 'Search by program, school, country…'
                        })}
                        size="small"
                        sx={{ flex: 1, minWidth: 260 }}
                        value={globalFilter}
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="program-sort-label">
                            {t('Sort by', {
                                ns: 'common',
                                defaultValue: 'Sort by'
                            })}
                        </InputLabel>
                        <Select
                            id="program-sort"
                            label={t('Sort by', {
                                ns: 'common',
                                defaultValue: 'Sort by'
                            })}
                            labelId="program-sort-label"
                            onChange={(e) =>
                                handleSortChange(String(e.target.value))
                            }
                            value={sortValue}
                        >
                            <MenuItem value={UNSORTED}>
                                <em>
                                    {t('Relevance', {
                                        ns: 'common',
                                        defaultValue: 'Relevance'
                                    })}
                                </em>
                            </MenuItem>
                            {SORT_FIELDS.flatMap((field) => [
                                <MenuItem
                                    key={`${field.id}:asc`}
                                    value={`${field.id}:asc`}
                                >
                                    {t(field.labelKey, { ns: 'common' })} ↑
                                </MenuItem>,
                                <MenuItem
                                    key={`${field.id}:desc`}
                                    value={`${field.id}:desc`}
                                >
                                    {t(field.labelKey, { ns: 'common' })} ↓
                                </MenuItem>
                            ])}
                        </Select>
                    </FormControl>
                </Box>

                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 1,
                        mt: 1
                    }}
                >
                    <Checkbox
                        checked={allPageSelected}
                        indeterminate={selectedOnPage > 0 && !allPageSelected}
                        inputProps={{
                            'aria-label': t('Select all on this page', {
                                ns: 'common',
                                defaultValue: 'Select all on this page'
                            })
                        }}
                        onChange={(e) =>
                            onSelectPage(pageIds, e.target.checked)
                        }
                        size="small"
                    />
                    <Typography color="text.secondary" variant="body2">
                        {isLoading
                            ? t('Loading…', {
                                  ns: 'common',
                                  defaultValue: 'Loading…'
                              })
                            : t('{{count}} programs', {
                                  count: total,
                                  ns: 'common',
                                  defaultValue: `${total} programs`
                              })}
                    </Typography>

                    {selectedCount > 0 ? (
                        <>
                            <Typography sx={{ ml: 1 }} variant="body2">
                                {t('{{count}} program(s) selected', {
                                    count: selectedCount,
                                    ns: 'programList',
                                    defaultValue: `${selectedCount} program(s) selected`
                                })}
                            </Typography>
                            <Button onClick={clearSelection} size="small">
                                {t('Clear selection', { ns: 'common' })}
                            </Button>
                        </>
                    ) : null}
                </Box>
            </Paper>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : null}

            {!isLoading && programs.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }} variant="outlined">
                    <Typography color="text.secondary">
                        {t('No programs found', {
                            ns: 'common',
                            defaultValue: 'No programs found'
                        })}
                    </Typography>
                </Paper>
            ) : null}

            {!isLoading
                ? programs.map((program) => {
                      const id = String(program._id ?? '');
                      return (
                          <ProgramResultCard
                              key={id}
                              onToggleSelect={onToggleSelect}
                              program={program}
                              selected={Boolean(rowSelection[id])}
                          />
                      );
                  })
                : null}

            <TablePagination
                component="div"
                count={total}
                onPageChange={(_e, page) =>
                    setPagination((current) => ({
                        ...current,
                        pageIndex: page
                    }))
                }
                onRowsPerPageChange={(e) =>
                    setPagination(() => ({
                        pageIndex: 0,
                        pageSize: Number(e.target.value)
                    }))
                }
                page={pagination.pageIndex}
                rowsPerPage={pagination.pageSize}
                rowsPerPageOptions={[10, 20, 50, 100]}
            />
        </Stack>
    );
};

export default ProgramResultsList;
