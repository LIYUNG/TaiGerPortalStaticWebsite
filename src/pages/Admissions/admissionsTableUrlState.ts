import {
    mrtStateToSearchParams,
    searchParamsToMrtState,
    writeMrtTableParams,
    mrtOwnedParamKeys,
    type MrtTableState,
    type MrtUrlStateConfig
} from '@utils/mrtUrlState';

// MRT column id (= row field) -> backend sortBy value. Columns not listed are
// rendered with sortable: false (the backend cannot sort by them). decided /
// closed / admission are fixed per sub-tab, so they are not user-sortable here.
export const SORT_FIELD_MAP: Record<string, string> = {
    name: 'firstname_lastname',
    school: 'school',
    program_name: 'program_name',
    degree: 'degree',
    application_year: 'application_year',
    semester: 'semester'
};

// MRT column id (= row field) -> backend filter query key. Only these columns
// expose a column filter; the backend understands these keys. decided / closed /
// admission are fixed by the active sub-tab and therefore not exposed as filters.
export const FILTER_FIELD_MAP: Record<string, string> = {
    name: 'studentName',
    // The backend `program` filter matches the program's school OR program_name.
    program_name: 'program',
    application_year: 'application_year',
    semester: 'semester',
    agents: 'agentName',
    editors: 'editorName'
};

// No multi-select column filters on the admissions tables.
const ARRAY_FILTER_IDS = new Set<string>();

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SORT_ID = 'application_year';
export const DEFAULT_SORT_DESC = true;

export const ADMISSIONS_TABLE_CONFIG: MrtUrlStateConfig = {
    filterIds: Object.keys(FILTER_FIELD_MAP),
    arrayFilterIds: ARRAY_FILTER_IDS,
    sortableIds: Object.keys(SORT_FIELD_MAP),
    defaultSort: { id: DEFAULT_SORT_ID, desc: DEFAULT_SORT_DESC },
    defaultPageSize: DEFAULT_PAGE_SIZE
};

export type AdmissionsTableState = MrtTableState;

export const admissionsTableStateToSearchParams = (
    state: AdmissionsTableState
): URLSearchParams => mrtStateToSearchParams(state, ADMISSIONS_TABLE_CONFIG);

export const searchParamsToAdmissionsTableState = (
    searchParams: URLSearchParams
): AdmissionsTableState =>
    searchParamsToMrtState(searchParams, ADMISSIONS_TABLE_CONFIG);

export const writeAdmissionsTableParams = (
    prev: URLSearchParams,
    state: AdmissionsTableState
): URLSearchParams => writeMrtTableParams(prev, state, ADMISSIONS_TABLE_CONFIG);

// The query-string keys the admissions tables own — cleared when switching
// sub-tabs so each sub-tab starts from a clean (page 0, unfiltered) view.
export const admissionsTableOwnedParamKeys = (): string[] =>
    mrtOwnedParamKeys(ADMISSIONS_TABLE_CONFIG);
