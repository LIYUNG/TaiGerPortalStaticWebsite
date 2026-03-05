import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
    useQuery: mockUseQuery
}));

vi.mock('@/api/query', () => ({
    getProgramRequirementsQuery: () => ({ queryKey: ['program-req'] })
}));

vi.mock('@utils/contants', () => ({
    convertDateUXFriendly: (d: string) => d
}));

vi.mock('@components/ProgramRequirementsTable/ProgramRequirementsTable', () => ({
    ProgramRequirementsTable: () => (
        <div data-testid="program-requirements-table">ProgramRequirementsTable</div>
    )
}));

import { ProgramRequirementsTableWrapper } from './ProgramRequirementsTableWrapper';

const mockData = {
    data: [
        {
            _id: 'req1',
            programId: [{ school: 'TU Munich', program_name: 'CS', degree: 'M.Sc.', lang: 'English', country: 'Germany' }],
            attributes: ['EE'],
            updatedAt: '2025-01-01'
        }
    ]
};

describe('ProgramRequirementsTableWrapper', () => {
    beforeEach(() => {
        mockUseQuery.mockReturnValue({ data: { data: mockData.data }, isLoading: false });
        render(
            <MemoryRouter>
                <ProgramRequirementsTableWrapper onAnalyseV2={vi.fn()} />
            </MemoryRouter>
        );
    });

    it('renders ProgramRequirementsTable', () => {
        expect(screen.getByTestId('program-requirements-table')).toBeInTheDocument();
    });
});

describe('ProgramRequirementsTableWrapper - loading', () => {
    it('shows loading while fetching', () => {
        mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
        render(
            <MemoryRouter>
                <ProgramRequirementsTableWrapper onAnalyseV2={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
