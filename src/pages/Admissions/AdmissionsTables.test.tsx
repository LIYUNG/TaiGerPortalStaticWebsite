import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false }))
}));

vi.mock('@/api/query', () => ({
    getAdmissionsOverviewQuery: vi.fn(() => ({
        queryKey: ['admissionsOverview'],
        queryFn: vi.fn()
    })),
    getAdmissionsQuery: vi.fn(() => ({
        queryKey: ['admissions'],
        queryFn: vi.fn()
    }))
}));

vi.mock('./AdmissionTable', () => ({
    default: () => <div data-testid="admission-table" />
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({
        children,
        value,
        index
    }: {
        children: ReactNode;
        value: number;
        index: number;
    }) => (value === index ? <div>{children}</div> : null),
    a11yProps: vi.fn(() => ({}))
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AdmissionsTables from './AdmissionsTables';

describe('AdmissionsTables', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AdmissionsTables />
            </MemoryRouter>
        );
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders all four tabs', () => {
        render(
            <MemoryRouter>
                <AdmissionsTables />
            </MemoryRouter>
        );
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(4);
    });

    it('shows admission table for the active tab', () => {
        render(
            <MemoryRouter>
                <AdmissionsTables />
            </MemoryRouter>
        );
        expect(screen.getByTestId('admission-table')).toBeInTheDocument();
    });
});
