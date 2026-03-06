import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TasksDistributionBarChart from './TasksDistributionBarChart';

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="bar-chart">{children}</div>
    )
}));

vi.mock('@mui/x-charts/ChartsAxis', () => ({
    axisClasses: {
        bottom: 'bottom',
        tickLabel: 'tickLabel'
    }
}));

const sampleData = [
    { month: 'Jan', active: 10, potential: 5 },
    { month: 'Feb', active: 15, potential: 8 }
];

describe('TasksDistributionBarChart', () => {
    it('renders without crashing', () => {
        render(
            <TasksDistributionBarChart
                data={sampleData}
                k="month"
                value1="active"
                value2="potential"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with yLabel prop', () => {
        render(
            <TasksDistributionBarChart
                data={sampleData}
                k="month"
                value1="active"
                value2="potential"
                yLabel="Count"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with empty data', () => {
        render(
            <TasksDistributionBarChart
                data={[]}
                k="month"
                value1="active"
                value2="potential"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with single data point', () => {
        render(
            <TasksDistributionBarChart
                data={[{ month: 'Jan', active: 10, potential: 5 }]}
                k="month"
                value1="active"
                value2="potential"
                yLabel="Tasks"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });
});
