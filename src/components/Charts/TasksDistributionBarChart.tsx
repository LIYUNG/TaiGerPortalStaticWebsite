import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

interface TasksDistributionBarChartProps {
    data: Record<string, string | number>[];
    k: string;
    value1: string;
    value2: string;
    yLabel?: string;
}

const TasksDistributionBarChart = ({
    data,
    k,
    value1,
    value2,
    yLabel
}: TasksDistributionBarChartProps) => {
    const labels = data.map((d) => d[k]);
    const active_a = data.map((d) => d[value1]);
    const potential_a = data.map((d) => d[value2]);
    return (
        <BarChart
            barLabel="value"
            height={300}
            series={[
                { data: active_a, stack: 'A', label: 'Active' },
                { data: potential_a, stack: 'A', label: 'Potentials' }
            ]}
            sx={{
                [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
                    transform: 'rotateZ(-45deg)',
                    textAnchor: 'end',
                    dy: '10px'
                }
            }}
            xAxis={[
                {
                    data: labels,
                    scaleType: 'band',
                    id: 'axis1',
                    interval: 0
                }
            ]}
            yAxis={[
                {
                    label: yLabel
                }
            ]}
        />
    );
};

export default TasksDistributionBarChart;
