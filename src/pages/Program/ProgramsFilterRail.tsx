import { useState, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Collapse,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { MRT_ColumnFiltersState, MRT_Updater } from 'material-react-table';

import {
    getColumnFilterValue,
    setColumnFilterValue
} from './mobile/programMobileFilters';
import type { FilterOption } from './mobile/ProgramsFilterDrawer';
import {
    DEGREE_CATOGARY_ARRAY_OPTIONS,
    LANGUAGES_ARRAY_OPTIONS,
    SEMESTER_ARRAY_OPTIONS
} from '@utils/contants';
import { CountryFlag } from '@components/CountryFlag';

/**
 * Persistent desktop filter rail.
 *
 * It is a *view* over the table's existing `columnFilters` state — it holds no
 * state of its own. Everything downstream (server-side filtering, the shareable
 * URL, the MRT column-filter inputs in the header, the mobile drawer) therefore
 * keeps working unchanged, and the rail stays in sync with them automatically.
 */

// Free-text columns. degree/semester/lang are NOT here — they have a fixed set
// of valid values, so they get dropdowns (below) instead of a text box that
// invites typos the backend will never match.
const TEXT_FIELDS: Array<{ id: string; labelKey: string }> = [
    { id: 'school', labelKey: 'School' },
    { id: 'program_name', labelKey: 'Program' },
    { id: 'toefl', labelKey: 'TOEFL' },
    { id: 'ielts', labelKey: 'IELTS' },
    { id: 'gre', labelKey: 'GRE' },
    { id: 'gmat', labelKey: 'GMAT' },
    { id: 'application_deadline', labelKey: 'Deadline' }
];

/**
 * The same option lists the Create/Edit Program form uses, so a filter can only
 * ever be set to a value a program could actually hold.
 *
 * Those arrays lead with a `{ value: '-', label: 'Please Select' }` placeholder
 * for the form's empty state. As a filter that would mean "match the literal
 * string -", so it is stripped; the empty "All" option clears the filter.
 */
const asFilterOptions = (
    options: Array<{ value: string | number; label: string }>
): FilterOption[] =>
    options
        .filter((option) => option.value !== '-' && option.value !== '')
        .map((option) => ({
            value: String(option.value),
            label: option.label
        }));

const DEGREE_FILTER_OPTIONS = asFilterOptions(DEGREE_CATOGARY_ARRAY_OPTIONS);
const SEMESTER_FILTER_OPTIONS = asFilterOptions(SEMESTER_ARRAY_OPTIONS);
const LANGUAGE_FILTER_OPTIONS = asFilterOptions(LANGUAGES_ARRAY_OPTIONS);

export interface ProgramsFilterRailProps {
    /** Page actions (Assign, Add New Program, …) pinned above the filters. */
    actions?: ReactNode;
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: (updater: MRT_Updater<MRT_ColumnFiltersState>) => void;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    statusOptions: FilterOption[];
    countryOptions: FilterOption[];
    subjectOptions: FilterOption[];
    tagOptions: FilterOption[];
}

export const ProgramsFilterRail = ({
    actions,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    statusOptions,
    countryOptions,
    subjectOptions,
    tagOptions
}: ProgramsFilterRailProps) => {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);

    // Tri-state: unset ("All") means the flag is not filtered on at all — it is
    // NOT the same as "No", which explicitly excludes flagged programs.
    const yesNoOptions: FilterOption[] = [
        {
            value: 'true',
            label: t('Yes', { ns: 'common', defaultValue: 'Yes' })
        },
        { value: 'false', label: t('No', { ns: 'common', defaultValue: 'No' }) }
    ];

    const update = (id: string, value: unknown) =>
        setColumnFilters((prev) => setColumnFilterValue(prev, id, value));

    const asString = (id: string): string => {
        const value = getColumnFilterValue(columnFilters, id);
        return typeof value === 'string' ? value : '';
    };
    const asArray = (id: string): string[] => {
        const value = getColumnFilterValue(columnFilters, id);
        return Array.isArray(value) ? (value as string[]) : [];
    };

    const handleMultiChange =
        (id: string) => (e: SelectChangeEvent<string[]>) => {
            const { value } = e.target;
            update(id, typeof value === 'string' ? value.split(',') : value);
        };

    const clearAll = () => {
        setColumnFilters(() => []);
        setGlobalFilter('');
    };

    const activeCount =
        columnFilters.length + (globalFilter.trim().length > 0 ? 1 : 0);

    /**
     * Dropdown that also accepts a typed keyword.
     *
     * The known values are offered as options, but the backend filters these
     * columns with a case-insensitive `contains` regex, so an arbitrary keyword
     * is a perfectly valid query too (e.g. "Eng" to catch every English-taught
     * variant). Free text and selection write to the same column filter.
     */
    const renderComboBox = (
        id: string,
        label: string,
        options: FilterOption[]
    ) => (
        <Autocomplete
            freeSolo
            inputValue={asString(id)}
            onInputChange={(_event, value) => update(id, value)}
            options={options.map((option) => option.value)}
            renderInput={(params) => (
                <TextField {...params} label={label} size="small" />
            )}
            renderOption={(props, option) => {
                const match = options.find((item) => item.value === option);
                return (
                    <li {...props} key={option}>
                        {match?.label ?? option}
                    </li>
                );
            }}
            size="small"
            value={asString(id)}
        />
    );

    /** Single-value dropdown backed by one column filter. "" clears it. */
    const renderSelect = (
        id: string,
        label: string,
        options: FilterOption[]
    ) => (
        <FormControl fullWidth size="small">
            {/* labelId/id wire the InputLabel to the Select — without them MUI
                leaves the combobox with no accessible name. */}
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
                id={id}
                label={label}
                labelId={`${id}-label`}
                onChange={(e) => update(id, e.target.value)}
                value={asString(id)}
            >
                <MenuItem value="">
                    <em>{t('All', { ns: 'common' })}</em>
                </MenuItem>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    const renderMultiSelect = (
        id: string,
        label: string,
        options: FilterOption[],
        // Optional leading icon per option (used for country flags). Rendered in
        // both the dropdown list and the selected chips.
        getIcon?: (value: string) => ReactElement | null
    ) => {
        const selected = asArray(id);
        const labelById = new Map(options.map((o) => [o.value, o.label]));
        return (
            <FormControl fullWidth size="small">
                {/* labelId/id wire the InputLabel to the Select — without them
                    MUI leaves the combobox with no accessible name. */}
                <InputLabel id={`${id}-label`}>{label}</InputLabel>
                <Select
                    id={id}
                    input={<OutlinedInput label={label} />}
                    labelId={`${id}-label`}
                    multiple
                    onChange={handleMultiChange(id)}
                    renderValue={(values) => (
                        <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                            {(values as string[]).map((v) => (
                                <Chip
                                    icon={getIcon?.(v) ?? undefined}
                                    key={v}
                                    label={labelById.get(v) ?? v}
                                    size="small"
                                />
                            ))}
                        </Box>
                    )}
                    value={selected}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {getIcon ? (
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: 1
                                    }}
                                >
                                    {getIcon(option.value)}
                                    {option.label}
                                </Box>
                            ) : (
                                option.label
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };

    return (
        <Paper
            sx={{
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
                position: 'sticky',
                top: 16,
                width: 280
            }}
            variant="outlined"
        >
            {actions ? (
                <>
                    <Stack spacing={1} sx={{ p: 2 }}>
                        {actions}
                    </Stack>
                    <Divider />
                </>
            ) : null}

            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5
                }}
            >
                <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
                    {t('Refine your search', {
                        ns: 'common',
                        defaultValue: 'Refine your search'
                    })}
                </Typography>
                {activeCount > 0 ? (
                    <Chip color="primary" label={activeCount} size="small" />
                ) : null}
            </Box>
            <Divider />

            <Stack spacing={2} sx={{ p: 2 }}>
                {renderSelect(
                    'status',
                    t('Status', { ns: 'common' }),
                    statusOptions
                )}

                {renderComboBox(
                    'degree',
                    t('Degree', { ns: 'common' }),
                    DEGREE_FILTER_OPTIONS
                )}
                {renderComboBox(
                    'semester',
                    t('Semester', { ns: 'common' }),
                    SEMESTER_FILTER_OPTIONS
                )}
                {renderComboBox(
                    'lang',
                    t('Language', { ns: 'common' }),
                    LANGUAGE_FILTER_OPTIONS
                )}

                {renderMultiSelect(
                    'country',
                    t('Country', { ns: 'common' }),
                    countryOptions,
                    (value) => (
                        <CountryFlag country={value} />
                    )
                )}
                {renderMultiSelect(
                    'programSubjects',
                    t('Subjects', { ns: 'common' }),
                    subjectOptions
                )}
                {renderMultiSelect(
                    'tags',
                    t('Tags', { ns: 'common' }),
                    tagOptions
                )}

                {renderSelect(
                    'isPrivateSchool',
                    t('Private university', {
                        ns: 'common',
                        defaultValue: 'Private university'
                    }),
                    yesNoOptions
                )}
                {renderSelect(
                    'isPartnerSchool',
                    t('Partner school', {
                        ns: 'common',
                        defaultValue: 'Partner school'
                    }),
                    yesNoOptions
                )}
                {renderSelect(
                    'isNC',
                    t('NC (restricted admission)', {
                        ns: 'common',
                        defaultValue: 'NC (restricted admission)'
                    }),
                    yesNoOptions
                )}

                <Button
                    endIcon={showMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowMore((open) => !open)}
                    size="small"
                    sx={{ justifyContent: 'space-between' }}
                >
                    {t('More filters', { ns: 'common' })}
                </Button>

                <Collapse in={showMore} unmountOnExit>
                    <Stack spacing={1.5}>
                        {TEXT_FIELDS.map((field) => (
                            <TextField
                                fullWidth
                                key={field.id}
                                label={t(field.labelKey, { ns: 'common' })}
                                onChange={(e) =>
                                    update(field.id, e.target.value)
                                }
                                size="small"
                                value={asString(field.id)}
                            />
                        ))}
                    </Stack>
                </Collapse>
            </Stack>

            <Divider />
            <Box sx={{ p: 2 }}>
                <Button
                    disabled={activeCount === 0}
                    fullWidth
                    onClick={clearAll}
                    size="small"
                    startIcon={<RestartAltIcon />}
                    variant="outlined"
                >
                    {t('Reset all', {
                        ns: 'common',
                        defaultValue: 'Reset all'
                    })}
                </Button>
            </Box>
        </Paper>
    );
};

export default ProgramsFilterRail;
