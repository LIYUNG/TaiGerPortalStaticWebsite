import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@components/Charts/SingleBarChart', () => ({
    default: () => <div data-testid="single-bar-chart" />
}));

vi.mock('@components/Charts/VerticalDistributionBarChart', () => ({
    default: () => <div data-testid="vertical-dist-chart" />
}));

vi.mock('@components/Charts/VerticalSingleChart', () => ({
    default: () => <div data-testid="vertical-single-chart" />
}));

vi.mock('@mui/x-charts/LineChart', () => ({
    LineChart: () => <div data-testid="line-chart" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import OverviewDashboardTab from './OverviewDashboardTab';

const defaultProps = {
    studentsCreationDates: [{ createdAt: '2024-01-15T00:00:00Z' }],
    agentData: [{ key: 'Alice', student_num_no_offer: 2, student_num_with_offer: 3 }],
    editorData: [{ firstname: 'Bob', task_counts: { active: 5, potentials: 2 } }],
    studentsYearsPair: [{ name: '2024', uv: 10 }],
    documents: { CV: { count: 5 }, ML: { count: 3 } }
};

describe('OverviewDashboardTab', () => {
    beforeEach(() => {
        render(<OverviewDashboardTab {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders Month View and Week View buttons', () => {
        expect(screen.getByText('Month View')).toBeTruthy();
        expect(screen.getByText('Week View')).toBeTruthy();
    });

    it('renders line chart', () => {
        expect(screen.getByTestId('line-chart')).toBeTruthy();
    });

    it('renders bar charts', () => {
        const charts = screen.getAllByTestId('single-bar-chart');
        expect(charts.length).toBeGreaterThan(0);
    });
});
