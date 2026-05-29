import type { MRT_ColumnFiltersState } from 'material-react-table';

export type ProgramListFilters = {
    search?: string;
    lockStatus?: 'Locked' | 'Unlocked';
    school?: string;
    program_name?: string;
    country?: string[];
    programSubjects?: string[];
    tags?: string[];
    degree?: string;
    semester?: string;
    lang?: string;
    toefl?: string;
    ielts?: string;
    gre?: string;
    gmat?: string;
    application_deadline?: string;
};

const TEXT_FILTER_IDS = new Set([
    'school',
    'program_name',
    'degree',
    'semester',
    'lang',
    'toefl',
    'ielts',
    'gre',
    'gmat',
    'application_deadline'
]);

const ARRAY_FILTER_IDS = new Set(['country', 'programSubjects', 'tags']);

const isEmptyFilterValue = (value: unknown) =>
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

export const columnFiltersToProgramListFilters = (
    columnFilters: MRT_ColumnFiltersState
): ProgramListFilters => {
    const filters: ProgramListFilters = {};

    columnFilters.forEach(({ id, value }) => {
        if (isEmptyFilterValue(value)) {
            return;
        }

        if (id === 'status') {
            if (value === 'Locked' || value === 'Unlocked') {
                filters.lockStatus = value;
            }
            return;
        }

        if (ARRAY_FILTER_IDS.has(id)) {
            filters[id as keyof ProgramListFilters] = (
                Array.isArray(value) ? value : [value]
            ).map(String) as never;
            return;
        }

        if (TEXT_FILTER_IDS.has(id)) {
            filters[id as keyof ProgramListFilters] = String(value) as never;
        }
    });

    return filters;
};

export const programListFiltersToQueryParams = (
    filters: ProgramListFilters
): Record<string, string> => {
    const params: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (isEmptyFilterValue(value)) {
            return;
        }

        if (Array.isArray(value)) {
            params[key] = value.join(',');
            return;
        }

        params[key] = String(value);
    });

    return params;
};
