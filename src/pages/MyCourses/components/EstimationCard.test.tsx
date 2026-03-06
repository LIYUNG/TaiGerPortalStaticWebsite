import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@taiger-common/core', () => ({
    Bayerische_Formel: vi.fn(() => '2.5')
}));

vi.mock('@utils/contants', () => ({
    GENERAL_SCORES_COURSE: { name: 'course' },
    GENERAL_SCORES_GPA: { name: 'gpa' },
    GENERAL_SCORES_GPA_BOUNDARY: { name: 'gpaBoundary' },
    SCORES_TYPE_OBJ: {}
}));

import { EstimationCard } from './EstimationCard';
import type { CategorySummaryRow } from './utils';

const makeRow = (
    credits: number,
    required: number,
    maxScore?: number
): CategorySummaryRow => ({
    credits,
    requiredECTS: required,
    maxScore
});

const sortedCourses = {
    Math: [{ Math: 'Calculus', credits: 6, requiredECTS: 6 }, makeRow(6, 6, 5)]
};

const baseProps = {
    round: [],
    sortedCourses,
    scores: {
        directAdmission: 80,
        directRejection: 20
    },
    academic_background: {
        university: {
            Highest_GPA_Uni: 4.3,
            Passing_GPA_Uni: 1.7,
            My_GPA_Uni: 3.0
        }
    } as any,
    directAd: { name: 'directAdmission', label: 'Direct Admission' },
    directRej: { name: 'directRejection', label: 'Direct Rejection' },
    stage: 1,
    subtitle: 'Basic check'
};

describe('EstimationCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        render(<EstimationCard {...baseProps} />);
    });

    it('renders card with stage title', () => {
        expect(screen.getByText('Stage 1 Evaluation')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
        expect(screen.getByText('Basic check')).toBeInTheDocument();
    });

    it('renders direct admission and rejection labels', () => {
        expect(screen.getByText(/Direct Admission/)).toBeInTheDocument();
        expect(screen.getByText(/Direct Rejection/)).toBeInTheDocument();
    });

    it('renders table headers', () => {
        expect(screen.getByText('Evaluation')).toBeInTheDocument();
        expect(screen.getByText('Pessimistic (25%)')).toBeInTheDocument();
        expect(screen.getByText('Optimistic (100%)')).toBeInTheDocument();
    });

    it('renders Total row in footer', () => {
        expect(screen.getByText('Total')).toBeInTheDocument();
    });
});

describe('EstimationCard — with course round', () => {
    it('expands course score row when expand button is clicked', () => {
        vi.clearAllMocks();
        render(<EstimationCard {...baseProps} round={['course']} />);
        const expandButton = screen.getByRole('button', { name: 'expand row' });
        fireEvent.click(expandButton);
        expect(screen.getByText(/Your courses score/)).toBeInTheDocument();
    });
});
