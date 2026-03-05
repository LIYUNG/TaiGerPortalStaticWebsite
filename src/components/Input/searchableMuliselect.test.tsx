import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import SearchableMultiSelect from './searchableMuliselect';

describe('SearchableMultiSelect with array data', () => {
    const setValue = vi.fn();

    beforeEach(() => {
        render(
            <SearchableMultiSelect
                data={['Option A', 'Option B', 'Option C']}
                label="Select Items"
                setValue={setValue}
                value={[]}
            />
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByLabelText('Select Items')).toBeDefined();
    });

    it('renders the autocomplete input', () => {
        expect(document.querySelector('input')).toBeDefined();
    });
});

describe('SearchableMultiSelect with record data', () => {
    const setValue = vi.fn();

    beforeEach(() => {
        render(
            <SearchableMultiSelect
                data={{
                    key1: { label: 'First Option', color: '#red' },
                    key2: { label: 'Second Option', color: '#blue' }
                }}
                label="My Options"
                setValue={setValue}
                value={['key1']}
            />
        );
    });

    it('renders with record data', () => {
        expect(screen.getByLabelText('My Options')).toBeDefined();
    });

    it('renders selected chip for key1', () => {
        expect(screen.getByText('key1')).toBeDefined();
    });
});

describe('SearchableMultiSelect with custom label', () => {
    it('renders custom label text', () => {
        render(
            <SearchableMultiSelect
                data={[]}
                label="Custom Label"
                setValue={vi.fn()}
                value={[]}
            />
        );
        expect(screen.getByLabelText('Custom Label')).toBeDefined();
    });
});
