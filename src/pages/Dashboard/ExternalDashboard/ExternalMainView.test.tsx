import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        setQueryData: vi.fn()
    }))
}));

vi.mock('@pages/Program/ProgramReportCard', () => ({
    default: () => <div data-testid="program-report-card" />
}));

import ExternalMainView from './ExternalMainView';

describe('ExternalMainView', () => {
    it('renders without crashing with empty students array', () => {
        render(
            <MemoryRouter>
                <ExternalMainView students={[]} />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('renders the External Dashboard text', () => {
        render(
            <MemoryRouter>
                <ExternalMainView students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('External Dashboard')).toBeTruthy();
    });

    it('renders the ProgramReportCard', () => {
        render(
            <MemoryRouter>
                <ExternalMainView students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('program-report-card')).toBeTruthy();
    });
});
