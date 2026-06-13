import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@taiger-common/core', () => ({
    isProgramAdmitted: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false),
    isProgramWithdraw: vi.fn(() => false)
}));

import ApplicationProgressCards from './ApplicationProgressCards';

const renderCards = (student: { applications?: unknown[] }) =>
    render(
        <MemoryRouter>
            <ApplicationProgressCards student={student as never} />
        </MemoryRouter>
    );

const application = {
    _id: 'a1',
    decided: '-',
    admission: '-',
    finalEnrolment: false,
    programId: {
        _id: 'p1',
        school: 'MIT',
        degree: 'MSc',
        program_name: 'Computer Science',
        semester: 'WS'
        // no application_deadline -> deadline/days-left render as '-'
    }
};

describe('ApplicationProgressCards', () => {
    it('shows an empty state when there are no applications', () => {
        renderCards({ applications: [] });
        expect(screen.getByText('No applications')).toBeInTheDocument();
    });

    it('handles an undefined applications array', () => {
        renderCards({});
        expect(screen.getByText('No applications')).toBeInTheDocument();
    });

    it('renders an application card with school, program and status chips', () => {
        renderCards({ applications: [application] });
        expect(screen.getByText('MIT')).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
        // The four progress dimensions are surfaced as labelled chips.
        expect(screen.getByText('Decided')).toBeInTheDocument();
        expect(screen.getByText('Submitted')).toBeInTheDocument();
        expect(screen.getByText('Admitted')).toBeInTheDocument();
        expect(screen.getByText('Final Enrolment')).toBeInTheDocument();
    });
});
