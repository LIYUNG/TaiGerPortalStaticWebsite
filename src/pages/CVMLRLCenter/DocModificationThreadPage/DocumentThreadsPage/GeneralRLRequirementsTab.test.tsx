import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneralRLRequirementsTab } from './GeneralRLRequirementsTab';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key
    })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual };
});

vi.mock('@/api/query', () => ({
    getStudentAndDocLinksQuery: vi.fn((params: { studentId: string }) => ({
        queryKey: ['studentAndDocLinks', params.studentId],
        queryFn: vi.fn()
    }))
}));

vi.mock('../../../Utils/util_functions', () => ({
    application_deadline_V2_calculator: vi.fn(() => '01/01/2025'),
    APPROVAL_COUNTRIES: ['germany']
}));

const mockApplications = [
    {
        _id: 'app1',
        decided: 'O',
        programId: {
            _id: 'prog1',
            school: 'TU Munich',
            program_name: 'Computer Science',
            rl_required: '2',
            is_rl_specific: false,
            rl_requirements: 'Two letters required'
        }
    }
];

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(() => ({
        data: {
            data: {
                data: { applications: mockApplications }
            }
        },
        isLoading: false
    }))
}));

describe('GeneralRLRequirementsTab', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <GeneralRLRequirementsTab studentId="student1" />
            </MemoryRouter>
        );
    });

    it('renders the table with RL requirements', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table head with column headers', () => {
        expect(screen.getByRole('columnheader', { name: /count/i })).toBeInTheDocument();
    });

    it('renders school name in the table', () => {
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
    });

    it('renders program name in the table', () => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
});
