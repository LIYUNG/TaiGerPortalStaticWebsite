import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useMrtTabUrlState } from './useMrtTabUrlState';
import type { MrtUrlStateConfig } from './mrtUrlState';

const CONFIG: MrtUrlStateConfig = {
    filterIds: ['status', 'document_name'],
    sortableIds: ['deadline', 'updatedAt'],
    defaultSort: { id: 'deadline', desc: false },
    defaultPageSize: 20
};
const SLUGS = ['in-progress', 'closed', 'all'] as const;

const renderAt = (initialEntry: string) =>
    renderHook(
        () => ({
            api: useMrtTabUrlState(CONFIG, SLUGS),
            search: useSearchParams()[0].toString()
        }),
        {
            wrapper: ({ children }: { children: ReactNode }) => (
                <MemoryRouter initialEntries={[initialEntry]}>
                    {children}
                </MemoryRouter>
            )
        }
    );

describe('useMrtTabUrlState', () => {
    it('seeds tab + table state from the URL', () => {
        const { result } = renderAt(
            '/x?tab=closed&search=foo&document_name=cv&sort=updatedAt&sortDir=desc&page=2'
        );

        expect(result.current.api.tab).toBe(1);
        expect(result.current.api.globalFilter).toBe('foo');
        expect(result.current.api.sorting).toEqual([
            { id: 'updatedAt', desc: true }
        ]);
        expect(result.current.api.pagination).toEqual({
            pageIndex: 1,
            pageSize: 20
        });
        expect(result.current.api.columnFilters).toEqual([
            { id: 'document_name', value: 'cv' }
        ]);
    });

    it('writes the default tab slug to a clean URL on mount', () => {
        const { result } = renderAt('/x');
        expect(result.current.search).toBe('tab=in-progress');
    });

    it('resets the query when switching tabs', () => {
        const { result } = renderAt(
            '/x?tab=in-progress&search=foo&document_name=cv&page=3'
        );
        expect(result.current.api.globalFilter).toBe('foo');

        act(() => result.current.api.handleTabChange({} as never, 1));

        expect(result.current.api.tab).toBe(1);
        expect(result.current.api.globalFilter).toBe('');
        expect(result.current.api.columnFilters).toEqual([]);
        expect(result.current.api.pagination.pageIndex).toBe(0);
        expect(result.current.search).toBe('tab=closed');
    });

    it('reflects a filter change in the URL and resets the page', () => {
        const { result } = renderAt('/x?tab=all&page=4');
        expect(result.current.api.pagination.pageIndex).toBe(3);

        act(() => result.current.api.handleGlobalFilterChange('bar'));

        expect(result.current.api.globalFilter).toBe('bar');
        expect(result.current.api.pagination.pageIndex).toBe(0);
        const params = new URLSearchParams(result.current.search);
        expect(params.get('search')).toBe('bar');
        expect(params.get('tab')).toBe('all');
        expect(params.get('page')).toBeNull();
    });
});
