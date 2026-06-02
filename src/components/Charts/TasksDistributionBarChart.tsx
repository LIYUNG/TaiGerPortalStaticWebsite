import { BarChart, BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

const ACTIVE_COLOR = '#d32f2f';
const POTENTIALS_COLOR = '#A9A9A9';
const CUMULATIVE_COLOR = '#1976d2';

const rotatedTickSx = {
    [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
        transform: 'rotateZ(-45deg)',
        textAnchor: 'end' as const,
        dy: '10px'
    }
};

interface TasksDistributionBarChartProps {
    data: Record<string, string | number>[];
    k: string;
    value1: string;
    value2: string;
    yLabel?: string;
    /**
     * Overlay a cumulative line of `value1` (active) on a secondary axis, in the
     * data's existing order. Off by default.
     */
    showCumulative?: boolean;
}

const TasksDistributionBarChart = ({
    data,
    k,
    value1,
    value2,
    yLabel,
    showCumulative = false
}: TasksDistributionBarChartProps) => {
    const labels = data.map((d) => d[k]);
    const active_a = data.map((d) => {
        const v = d[value1];
        return typeof v === 'number' ? v : null;
    });
    const potential_a = data.map((d) => {
        const v = d[value2];
        return typeof v === 'number' ? v : null;
    });

    if (!showCumulative) {
        return (
            <BarChart
                barLabel="value"
                colors={[ACTIVE_COLOR, POTENTIALS_COLOR]}
                height={300}
                series={[
                    { data: active_a, stack: 'A', label: 'Active' },
                    { data: potential_a, stack: 'A', label: 'Potentials' }
                ]}
                sx={rotatedTickSx}
                xAxis={[{ data: labels, scaleType: 'band', id: 'axis1' }]}
                yAxis={[{ label: yLabel }]}
            />
        );
    }

    // Running total of active (decided) in the given order, on a right axis.
    const cumulativeActive = active_a.map((_, index) =>
        active_a
            .slice(0, index + 1)
            .reduce((sum: number, v) => sum + (v ?? 0), 0)
    );

    return (
        <ResponsiveChartContainer
            height={300}
            margin={{ right: 60 }}
            series={[
                {
                    type: 'bar',
                    data: active_a,
                    stack: 'A',
                    label: 'Active',
                    color: ACTIVE_COLOR,
                    yAxisId: 'count'
                },
                {
                    type: 'bar',
                    data: potential_a,
                    stack: 'A',
                    label: 'Potentials',
                    color: POTENTIALS_COLOR,
                    yAxisId: 'count'
                },
                {
                    type: 'line',
                    data: cumulativeActive,
                    label: 'Active (cumulative)',
                    color: CUMULATIVE_COLOR,
                    yAxisId: 'cumulative'
                }
            ]}
            sx={rotatedTickSx}
            xAxis={[{ data: labels, scaleType: 'band', id: 'axis1' }]}
            yAxis={[
                { id: 'count', scaleType: 'linear', label: yLabel },
                { id: 'cumulative', scaleType: 'linear', position: 'right' }
            ]}
        >
            <ChartsGrid horizontal />
            <BarPlot barLabel="value" />
            <LinePlot />
            <MarkPlot />
            <ChartsXAxis axisId="axis1" />
            <ChartsYAxis axisId="count" />
            <ChartsYAxis
                axisId="cumulative"
                label="Active (cumulative)"
                position="right"
            />
            <ChartsLegend />
            <ChartsTooltip />
        </ResponsiveChartContainer>
    );
};

export default TasksDistributionBarChart;
