import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@hooks/useActiveStudents', () => ({
    useActiveStudents: vi.fn(() => ({ data: undefined, isLoading: true }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@components/StudentOverviewTable', () => ({
    default: () => <div data-testid="student-overview-table" />
}));

vi.mock('@components/StudentOverviewTable/finalDecisionOverview', () => ({
    default: () => <div data-testid="final-decision-overview" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import StudentAdmissionTables from './StudentAdmissionTables';

describe('StudentAdmissionTables', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <StudentAdmissionTables />
            </MemoryRouter>
        );
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders two tabs: Students at Risk and Final Decisions', () => {
        render(
            <MemoryRouter>
                <StudentAdmissionTables />
            </MemoryRouter>
        );
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(2);
    });

    it('shows loading spinner when data is loading', () => {
        render(
            <MemoryRouter>
                <StudentAdmissionTables />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
