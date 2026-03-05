import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

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
                <AdmissionsStat result={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });

    it('renders with result data', () => {
        const mockResult = [
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
        ];
        render(
            <MemoryRouter>
                <AdmissionsStat result={mockResult as never} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });
});
