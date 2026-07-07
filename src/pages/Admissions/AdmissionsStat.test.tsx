import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn(() => ({ data: { result: [] }, isLoading: false }))
}));

vi.mock('@/api/query', () => ({
    getAdmissionsProgramCountsQuery: vi.fn(() => ({
        queryKey: ['admissions', 'program-counts'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));

vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AdmissionsStat from './AdmissionsStat';

describe('AdmissionsStat', () => {
    it('renders without crashing with empty results', () => {
        render(
            <MemoryRouter>
                <AdmissionsStat />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });

    it('renders with fetched result data', () => {
        vi.mocked(useQuery).mockReturnValueOnce({
            data: {
                result: [
                    {
                        id: 'prog1',
                        school: 'MIT',
                        program_name: 'CS',
                        degree: 'Master',
                        semester: 'WS',
                        applicationCount: 10,
                        finalEnrolmentCount: 3,
                        admissionCount: 5,
                        rejectionCount: 2,
                        pendingResultCount: 3
                    }
                ]
            },
            isLoading: false
        } as never);
        render(
            <MemoryRouter>
                <AdmissionsStat />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });
});
