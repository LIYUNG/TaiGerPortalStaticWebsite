import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GeneralCourseAnalysisComponent } from './GeneralCourseAnalysisComponent';

vi.mock('@taiger-common/core', () => ({
    Bayerische_Formel: vi.fn(() => 2.5)
}));

vi.mock('@components/GaugeCard', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid="gauge-card">{title}</div>
    )
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: React.ReactNode;
        index: number;
        value: number;
    }) => (index === value ? <div>{children}</div> : null),
    a11yProps: () => ({})
}));

vi.mock('./utils', () => ({
    settings: {},
    allRequiredECTSCrossPrograms: vi.fn(() => 100),
    allAcquiredECTSCrossPrograms: vi.fn(() => 75),
    allMissCoursesCrossPrograms: vi.fn(() => ({}))
}));

vi.mock('./GPACard', () => ({
    default: () => <div data-testid="gpa-card">GPACard</div>
}));

vi.mock('./ProgramMatchingScores', () => ({
    default: () => (
        <div data-testid="program-matching-scores">ProgramMatchingScores</div>
    )
}));

vi.mock('./CourseTable', () => ({
    default: () => <div data-testid="course-table">CourseTable</div>
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

const mockSheets = {
    'TU Munich CS': {
        sorted: {},
        scores: {},
        suggestion: {}
    }
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

describe('GeneralCourseAnalysisComponent', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <GeneralCourseAnalysisComponent
                    sheets={mockSheets as any}
                    student={mockStudent as any}
                    onProgramSelect={vi.fn()}
                />
            </MemoryRouter>
        );
    });

    it('renders Overview tab', () => {
        expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });

    it('renders Course Sorting tab', () => {
        expect(screen.getByText(/course sorting/i)).toBeInTheDocument();
    });

    it('renders Analyzed Programs card', () => {
        expect(screen.getByText('Analyzed Programs')).toBeInTheDocument();
    });

    it('renders ProgramMatchingScores component', () => {
        expect(
            screen.getByTestId('program-matching-scores')
        ).toBeInTheDocument();
    });
});
