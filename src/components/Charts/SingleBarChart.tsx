import { BarChart } from '@mui/x-charts/BarChart';

interface SingleBarChartProps {
    data: Record<string, string | number>[];
    dataKey?: string;
    dataYKey?: string;
    label?: string;
    yLabel?: string;
}

const SingleBarChart = ({
    data,
    dataKey = 'name',
    dataYKey = 'uv',
    label,
    yLabel
}: SingleBarChartProps) => {
    const labels = data.map((d) => d[dataKey]);
    const active_a = data.map((d) => d[dataYKey]);
    return (
        <BarChart
            barLabel="value"
            height={300}
            series={[{ data: active_a, label: label }]}
            xAxis={[
                {
                    data: labels,
                    scaleType: 'band',
                    id: 'axis2'
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

export default SingleBarChart;
