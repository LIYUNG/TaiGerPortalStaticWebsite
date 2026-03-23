import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerticalSingleBarChart from './VerticalSingleChart';

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="bar-chart">{children}</div>
    )
}));

const sampleData = [
    { key: 'Group A', student_num: 10 },
    { key: 'Group B', student_num: 20 }
];

describe('VerticalSingleBarChart', () => {
    it('renders without crashing', () => {
        render(<VerticalSingleBarChart data={sampleData} />);
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with xLabel prop', () => {
        render(
            <VerticalSingleBarChart
                data={sampleData}
                xLabel="Number of Students"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with empty data', () => {
        render(<VerticalSingleBarChart data={[]} />);
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('renders with single item', () => {
        render(
            <VerticalSingleBarChart
                data={[{ key: 'OnlyGroup', student_num: 5 }]}
                xLabel="Count"
            />
        );
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });
});
