import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: true }))
}));

vi.mock('@/api/query', () => ({
    getAdmissionsQuery: vi.fn(() => ({
        queryKey: ['admissions'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}#${hash}`,
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AdmissionTable from './AdmissionTable';

describe('AdmissionTable', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AdmissionTable
                    query={{ decided: 'O', closed: 'O', admission: 'O' }}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });

    it('renders with empty query object', () => {
        render(
            <MemoryRouter>
                <AdmissionTable query={{}} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });
});
