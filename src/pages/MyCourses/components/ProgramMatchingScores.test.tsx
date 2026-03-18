import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramMatchingScores from './ProgramMatchingScores';

vi.mock('@components/GaugeCard', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid="gauge-card">{title}</div>
    )
}));

vi.mock('@mui/x-data-grid', () => ({
    DataGrid: () => <div data-testid="data-grid">DataGrid</div>
}));

vi.mock('./utils', () => ({
    acquiredECTS: vi.fn(() => 10),
    requiredECTS: vi.fn(() => 20),
    satisfiedRequirement: vi.fn(() => false),
    settings: {}
}));

const mockProgramSheetsArray = [
    {
        key: 'TU Munich CS',
        value: {
            sorted: {},
            scores: {},
            suggestion: {}
        }
    }
];

describe('ProgramMatchingScores', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramMatchingScores
                    programSheetsArray={mockProgramSheetsArray as any}
                    onProgramSelect={vi.fn()}
                />
            </MemoryRouter>
        );
    });

    it('renders Program-wise Matching Scores header', () => {
        expect(
            screen.getByText('Program-wise Matching Scores')
        ).toBeInTheDocument();
    });

    it('renders gauge card for each program', () => {
        expect(screen.getByTestId('gauge-card')).toBeInTheDocument();
        expect(screen.getByText('TU Munich CS')).toBeInTheDocument();
    });

    it('renders view toggle buttons', () => {
        expect(screen.getByLabelText('cards view')).toBeInTheDocument();
        expect(screen.getByLabelText('table view')).toBeInTheDocument();
    });
});
