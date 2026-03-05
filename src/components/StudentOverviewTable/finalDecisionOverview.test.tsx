import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string) => `/students/${id}`,
        PROFILE_HASH: '#profile'
    }
}));

import FinalDecisionOverview from './finalDecisionOverview';

const mockStudents = [
    {
        _id: 's1',
        firstname: 'Alice',
        lastname: 'Smith',
        applications: [
            {
                _id: 'app1',
                finalEnrolment: true,
                programId: {
                    _id: 'prog1',
                    school: 'TU Munich',
                    program_name: 'Computer Science',
                    degree: 'MSc',
                    country: 'DE',
                    city: 'Munich'
                },
                application_year: '2024'
            }
        ]
    }
];

describe('FinalDecisionOverview', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <FinalDecisionOverview students={mockStudents} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });
});

describe('FinalDecisionOverview with no enrollments', () => {
    it('renders with students without final enrolments', () => {
        render(
            <MemoryRouter>
                <FinalDecisionOverview
                    students={[
                        {
                            _id: 's2',
                            firstname: 'Bob',
                            lastname: 'Jones',
                            applications: []
                        }
                    ]}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });

    it('renders with empty students array', () => {
        render(
            <MemoryRouter>
                <FinalDecisionOverview students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mui-data-grid')).toBeDefined();
    });
});
