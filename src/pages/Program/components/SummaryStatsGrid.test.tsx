import { render, screen } from '@testing-library/react';
import SummaryStatsGrid from './SummaryStatsGrid';

const t = (key: string) => key;

const defaultProps = {
    totalPrograms: 1234,
    totalCountries: 42,
    totalSchools: 300,
    avgAdmissionRate: '67.5',
    t
};

describe('SummaryStatsGrid', () => {
    beforeEach(() => {
        render(<SummaryStatsGrid {...defaultProps} />);
    });

    it('renders Total Programs value', () => {
        expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('renders Countries value', () => {
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders Total Universities value', () => {
        expect(screen.getByText('300')).toBeInTheDocument();
    });

    it('renders Avg Admission Rate with % sign', () => {
        expect(screen.getByText('67.5%')).toBeInTheDocument();
    });

    it('renders 4 stat card labels', () => {
        expect(screen.getByText('Total Programs')).toBeInTheDocument();
        expect(screen.getByText('Countries')).toBeInTheDocument();
        expect(screen.getByText('Total Universities')).toBeInTheDocument();
        expect(screen.getByText('Avg Admission Rate')).toBeInTheDocument();
    });
});

describe('SummaryStatsGrid – variant props', () => {
    it('renders numeric avgAdmissionRate as number prop', () => {
        render(<SummaryStatsGrid {...defaultProps} avgAdmissionRate={0} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });
});
