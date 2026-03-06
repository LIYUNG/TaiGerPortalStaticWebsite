import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerticalDistributionBarCharts from './VerticalDistributionBarChart';

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="bar-chart">{children}</div>
    )
}));

const sampleData = [
    { name: 'Group A', value1: 10, value2: 5 },
    { name: 'Group B', value1: 20, value2: 12 }
];

describe('VerticalDistributionBarCharts', () => {
    it('renders without crashing', () => {
        render(
            <VerticalDistributionBarCharts
                data={sampleData}
                k="name"
                value1="value1"
                value2="value2"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with optional label props', () => {
        render(
            <VerticalDistributionBarCharts
                data={sampleData}
                dataALabel="Active"
                dataBLabel="Potential"
                k="name"
                value1="value1"
                value2="value2"
                xLabel="Count"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with empty data', () => {
        render(
            <VerticalDistributionBarCharts
                data={[]}
                k="name"
                value1="value1"
                value2="value2"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with xLabel only', () => {
        render(
            <VerticalDistributionBarCharts
                data={sampleData}
                k="name"
                value1="value1"
                value2="value2"
                xLabel="My X Label"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });
});
