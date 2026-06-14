import {
    searchParamsToMrtState,
    writeMrtTableParams,
    type MrtTableState,
    type MrtUrlStateConfig
} from '@utils/mrtUrlState';

// Backend filter keys are the column ids themselves; these are the columns that
// expose a server filter (archiv/createdAt are not server-filterable).
const FILTER_IDS = [
    'name_zh',
    'name_en',
    'agentNames',
    'editorNames',
    'attributesString',
    'attended_university',
    'attended_university_program',
    'application_year',
    'target_degree',
    'application_semester'
];

// Columns the backend can sort by (attributesString is filter-only).
const SORTABLE_IDS = [
    'name_zh',
    'name_en',
    'archiv',
    'agentNames',
    'editorNames',
    'attended_university',
    'attended_university_program',
    'application_year',
    'target_degree',
    'application_semester',
    'createdAt'
];

export const DEFAULT_SORT_ID = 'createdAt';
export const DEFAULT_SORT_DESC = true;
export const DEFAULT_PAGE_SIZE = 20;

const CONFIG: MrtUrlStateConfig = {
    filterIds: FILTER_IDS,
    sortableIds: SORTABLE_IDS,
    defaultSort: { id: DEFAULT_SORT_ID, desc: DEFAULT_SORT_DESC },
    defaultPageSize: DEFAULT_PAGE_SIZE
};

export type StudentsTableState = MrtTableState;

export const defaultStudentsTableState = (): StudentsTableState => ({
    globalFilter: '',
    sorting: [{ id: DEFAULT_SORT_ID, desc: DEFAULT_SORT_DESC }],
    columnFilters: [],
    pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }
});

export const searchParamsToStudentsTableState = (
    searchParams: URLSearchParams
): StudentsTableState => searchParamsToMrtState(searchParams, CONFIG);

export const writeStudentsTableParams = (
    prev: URLSearchParams,
    state: StudentsTableState
): URLSearchParams => writeMrtTableParams(prev, state, CONFIG);
