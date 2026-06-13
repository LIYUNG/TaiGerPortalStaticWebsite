import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { MRT_ColumnFiltersState, MRT_Updater } from 'material-react-table';

import {
    getColumnFilterValue,
    setColumnFilterValue
} from './programMobileFilters';

export interface FilterOption {
    value: string;
    label: string;
}

export interface ProgramsFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: (updater: MRT_Updater<MRT_ColumnFiltersState>) => void;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    statusOptions: FilterOption[];
    countryOptions: FilterOption[];
    subjectOptions: FilterOption[];
    tagOptions: FilterOption[];
}

// The text column filters, mirroring the desktop table's filterable columns.
const TEXT_FIELDS: Array<{ id: string; labelKey: string }> = [
    { id: 'school', labelKey: 'School' },
    { id: 'program_name', labelKey: 'Program' },
    { id: 'degree', labelKey: 'Degree' },
    { id: 'semester', labelKey: 'Semester' },
    { id: 'lang', labelKey: 'Language' },
    { id: 'toefl', labelKey: 'TOEFL' },
    { id: 'ielts', labelKey: 'IELTS' },
    { id: 'gre', labelKey: 'GRE' },
    { id: 'gmat', labelKey: 'GMAT' },
    { id: 'application_deadline', labelKey: 'Deadline' }
];

export const ProgramsFilterDrawer = ({
    open,
    onClose,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    statusOptions,
    countryOptions,
    subjectOptions,
    tagOptions
}: ProgramsFilterDrawerProps) => {
    const { t } = useTranslation();

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

    const renderMultiSelect = (
        id: string,
        label: string,
        options: FilterOption[]
    ) => {
        const selected = asArray(id);
        const labelById = new Map(options.map((o) => [o.value, o.label]));
        return (
            <FormControl fullWidth size="small">
                <InputLabel>{label}</InputLabel>
                <Select
                    input={<OutlinedInput label={label} />}
                    multiple
                    onChange={handleMultiChange(id)}
                    renderValue={(values) => (
                        <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                            {(values as string[]).map((v) => (
                                <Chip
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
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };

    return (
        <Drawer
            PaperProps={{
                sx: { maxHeight: '88vh', borderRadius: '12px 12px 0 0' }
            }}
            anchor="bottom"
            onClose={onClose}
            open={open}
        >
            <Box sx={{ p: 2, pb: 1 }}>
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography variant="h6">
                        {t('Filters', { ns: 'common' })}
                    </Typography>
                    <Button onClick={clearAll} size="small">
                        {t('Clear all', { ns: 'common' })}
                    </Button>
                </Box>
            </Box>
            <Divider />
            <Stack spacing={2} sx={{ overflowY: 'auto', p: 2 }}>
                <TextField
                    fullWidth
                    label={t('Search', { ns: 'common' })}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    size="small"
                    value={globalFilter}
                />

                <FormControl fullWidth size="small">
                    <InputLabel>{t('Status', { ns: 'common' })}</InputLabel>
                    <Select
                        label={t('Status', { ns: 'common' })}
                        onChange={(e) => update('status', e.target.value)}
                        value={asString('status')}
                    >
                        <MenuItem value="">
                            <em>{t('All', { ns: 'common' })}</em>
                        </MenuItem>
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {renderMultiSelect(
                    'country',
                    t('Country', { ns: 'common' }),
                    countryOptions
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

                <Divider textAlign="left">
                    <Typography color="text.secondary" variant="caption">
                        {t('More filters', { ns: 'common' })}
                    </Typography>
                </Divider>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: 'repeat(2, 1fr)'
                    }}
                >
                    {TEXT_FIELDS.map((field) => (
                        <TextField
                            fullWidth
                            key={field.id}
                            label={t(field.labelKey, { ns: 'common' })}
                            onChange={(e) => update(field.id, e.target.value)}
                            size="small"
                            value={asString(field.id)}
                        />
                    ))}
                </Box>
            </Stack>
            <Divider />
            <Box sx={{ p: 2 }}>
                <Button fullWidth onClick={onClose} variant="contained">
                    {t('Show results', { ns: 'common' })}
                </Button>
            </Box>
        </Drawer>
    );
};

export default ProgramsFilterDrawer;
