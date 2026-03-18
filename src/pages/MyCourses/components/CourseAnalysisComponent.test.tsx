import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CourseAnalysisComponent } from './CourseAnalysisComponent';

vi.mock('@mui/x-charts/Gauge', () => ({
    Gauge: () => <div data-testid="gauge">Gauge</div>,
    gaugeClasses: { valueText: 'valueText' }
}));

vi.mock('./utils', () => ({
    acquiredECTS: vi.fn(() => 10),
    requiredECTS: vi.fn(() => 20),
    satisfiedRequirement: vi.fn(() => false),
    getMaxScoreECTS: vi.fn(() => 20),
    settings: {}
}));

vi.mock('./CourseTable', () => ({
    default: () => <div data-testid="course-table">CourseTable</div>
}));

vi.mock('./EstimationCard', () => ({
    EstimationCard: () => (
        <div data-testid="estimation-card">EstimationCard</div>
    )
}));

vi.mock('@utils/contants', () => ({
    DIRECT_ADMISSION_SCORE: 80,
    DIRECT_ADMISSION_SECOND_SCORE: 70,
    DIRECT_REJECTION_SCORE: 30,
    DIRECT_REJECTION_SECOND_SCORE: 20
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k },
    t: (k: string) => k
}));

const mockSheet = {
    sorted: {},
    scores: {
        firstRoundConsidered: [],
        secondRoundConsidered: []
    },
    suggestion: {}
};

const mockStudent = {
    _id: 's1',
    firstname: 'Alice',
    academic_background: {
        university: {
            Highest_GPA_Uni: '4.0',
            Passing_GPA_Uni: '2.0',
            My_GPA_Uni: '3.5'
        }
    }
};

const defaultProps = {
    factor: 1.5,
    sheet: mockSheet as any,
    student: mockStudent as any,
    onBackToOverview: vi.fn(),
    currentProgram: 1,
    programs: ['TU Munich CS'],
    onProgramChange: vi.fn()
};

describe('CourseAnalysisComponent', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CourseAnalysisComponent {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders Back to Overview button', () => {
        expect(
            screen.getByRole('button', { name: /back to overview/i })
        ).toBeInTheDocument();
    });

    it('renders Program Analysis heading', () => {
        expect(screen.getByText(/program analysis/i)).toBeInTheDocument();
    });

    it('renders gauge', () => {
        expect(screen.getByTestId('gauge')).toBeInTheDocument();
    });

    it('renders Matching Score label', () => {
        expect(screen.getByText('Matching Score')).toBeInTheDocument();
    });
});
