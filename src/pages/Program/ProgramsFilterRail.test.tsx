import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    render,
    screen,
    fireEvent,
    within,
    cleanup
} from '@testing-library/react';
import type { MRT_ColumnFiltersState } from 'material-react-table';

import { ProgramsFilterRail } from './ProgramsFilterRail';

const statusOptions = [
    { value: 'Locked', label: 'Locked' },
    { value: 'Unlocked', label: 'Unlocked' }
];
const countryOptions = [
    { value: 'Germany', label: 'Germany' },
    { value: 'UK', label: 'UK' }
];
const subjectOptions = [{ value: 'CS', label: 'Computer Science' }];
const tagOptions = [{ value: 'TOP50', label: 'Top 50' }];

const renderRail = (
    columnFilters: MRT_ColumnFiltersState = [],
    globalFilter = ''
) => {
    const setColumnFilters = vi.fn();
    const setGlobalFilter = vi.fn();
    render(
        <ProgramsFilterRail
            columnFilters={columnFilters}
            countryOptions={countryOptions}
            globalFilter={globalFilter}
            setColumnFilters={setColumnFilters}
            setGlobalFilter={setGlobalFilter}
            statusOptions={statusOptions}
            subjectOptions={subjectOptions}
            tagOptions={tagOptions}
        />
    );
    return { setColumnFilters, setGlobalFilter };
};

describe('ProgramsFilterRail', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders every filter group', () => {
        renderRail();
        expect(screen.getByText('Refine your search')).toBeDefined();
        for (const name of ['Status', 'Country', 'Subjects', 'Tags']) {
            expect(
                screen.getByRole('combobox', { name: new RegExp(name, 'i') })
            ).toBeDefined();
        }
    });

    it('never offers the "Please Select" placeholder as a filter value', () => {
        renderRail();
        const degree = screen.getByRole('combobox', { name: /degree/i });
        fireEvent.keyDown(degree, { key: 'ArrowDown' });
        const options = within(screen.getByRole('listbox'))
            .getAllByRole('option')
            .map((option) => option.textContent);

        expect(options).toContain('Bachelor');
        // The form arrays lead with a "-"/"Please Select" placeholder; as a
        // filter that would search for a literal "-" and match nothing.
        expect(options).not.toContain('Please Select');
        expect(options).not.toContain('-');
    });

    it.each([
        [/degree/i, 'Bachelor'],
        [/semester/i, 'Winter Semester (Semester begins on October)'],
        [/language/i, 'English']
    ])(
        '%s accepts a typed keyword as well as its known values',
        (labelPattern, knownOption) => {
            const { setColumnFilters } = renderRail();
            const input = screen.getByRole('combobox', { name: labelPattern });

            // Free text — the backend filters these columns with a `contains`
            // regex, so an arbitrary keyword is a valid query.
            fireEvent.change(input, { target: { value: 'Eng' } });
            expect(setColumnFilters).toHaveBeenCalled();

            // …and the known values are still offered as suggestions.
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(
                within(screen.getByRole('listbox')).getByText(knownOption)
            ).toBeDefined();
        }
    );

    it.each([
        [/private university/i],
        [/partner school/i],
        [/nc \(restricted admission\)/i]
    ])('%s is a tri-state Yes/No filter', (labelPattern) => {
        renderRail();
        fireEvent.mouseDown(
            screen.getByRole('combobox', { name: labelPattern })
        );
        const options = within(screen.getByRole('listbox'))
            .getAllByRole('option')
            .map((option) => option.textContent);

        // "All" (unset) must exist and be distinct from "No": unset means the
        // flag is not filtered on, whereas No explicitly excludes flagged rows.
        expect(options).toEqual(['All', 'Yes', 'No']);
    });

    it('counts the active filters (column filters + global search)', () => {
        renderRail([{ id: 'country', value: ['Germany'] }], 'munich');
        expect(screen.getByText('2')).toBeDefined();
    });

    it('reflects the filter state it is given', () => {
        renderRail([{ id: 'country', value: ['Germany'] }]);
        // The rail is a view over columnFilters — a country already in state
        // must show as a selected chip, so a shared URL renders correctly.
        expect(screen.getByText('Germany')).toBeDefined();
    });

    it('writes a selection into the shared columnFilters state', () => {
        const { setColumnFilters } = renderRail();
        fireEvent.mouseDown(screen.getByRole('combobox', { name: /status/i }));
        fireEvent.click(
            within(screen.getByRole('listbox')).getByText('Locked')
        );
        expect(setColumnFilters).toHaveBeenCalledTimes(1);
    });

    it('disables Reset all when nothing is filtered', () => {
        renderRail();
        expect(
            screen.getByRole('button', { name: /reset all/i })
        ).toHaveProperty('disabled', true);
    });

    it('Reset all clears both the column filters and the search', () => {
        const { setColumnFilters, setGlobalFilter } = renderRail(
            [{ id: 'country', value: ['Germany'] }],
            'munich'
        );
        fireEvent.click(screen.getByRole('button', { name: /reset all/i }));
        expect(setColumnFilters).toHaveBeenCalledTimes(1);
        expect(setGlobalFilter).toHaveBeenCalledWith('');
    });
});
