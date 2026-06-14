import {
    mrtStateToSearchParams,
    searchParamsToMrtState,
    writeMrtTableParams,
    type MrtTableState,
    type MrtUrlStateConfig
} from '@utils/mrtUrlState';

// MRT column id (= row field) -> backend sortBy value. Columns not listed are
// rendered with sortable: false (the backend cannot sort by them).
export const SORT_FIELD_MAP: Record<string, string> = {
    application_year: 'application_year',
    semester: 'semester',
    firstname_lastname: 'firstname_lastname',
    country: 'country',
    program: 'program_name',
    decided: 'decided',
    closed: 'closed',
    deadline: 'deadline'
};

// MRT column id (= row field) -> backend filter query key. Only these columns
// expose a column filter; the backend understands these keys.
export const FILTER_FIELD_MAP: Record<string, string> = {
    application_year: 'application_year',
    semester: 'semester',
    firstname_lastname: 'studentName',
    agents: 'agentName',
    editors: 'editorName',
    program: 'program',
    decided: 'decided',
    closed: 'closed',
    country: 'country'
};

// The only multi-select column filter; its value is an array of country codes.
const ARRAY_FILTER_IDS = new Set(['country']);

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SORT_ID = 'deadline';
export const DEFAULT_SORT_DESC = false;

const CONFIG: MrtUrlStateConfig = {
    filterIds: Object.keys(FILTER_FIELD_MAP),
    arrayFilterIds: ARRAY_FILTER_IDS,
    sortableIds: Object.keys(SORT_FIELD_MAP),
    defaultSort: { id: DEFAULT_SORT_ID, desc: DEFAULT_SORT_DESC },
    defaultPageSize: DEFAULT_PAGE_SIZE
};

export type ApplicationOverviewTableState = MrtTableState;

export const applicationTableStateToSearchParams = (
    state: ApplicationOverviewTableState
): URLSearchParams => mrtStateToSearchParams(state, CONFIG);

export const searchParamsToApplicationTableState = (
    searchParams: URLSearchParams
): ApplicationOverviewTableState =>
    searchParamsToMrtState(searchParams, CONFIG);

export const writeApplicationTableParams = (
    prev: URLSearchParams,
    state: ApplicationOverviewTableState
): URLSearchParams => writeMrtTableParams(prev, state, CONFIG);
