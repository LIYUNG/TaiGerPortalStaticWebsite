import { BarChart } from '@mui/x-charts/BarChart';

interface VerticalSingleChartProps {
    data: { key: string; student_num: number }[];
    xLabel?: string;
}

const VerticalSingleBarChart = ({ data, xLabel }: VerticalSingleChartProps) => {
    const labels = data.map((d) => d.key);
    const active_a = data.map((d) => d.student_num);
    return (
        <BarChart
            barLabel="value"
            grid={{ vertical: true }}
            height={300}
            layout="horizontal"
            series={[{ data: active_a, label: 'Active' }]}
            xAxis={[
                {
                    label: xLabel
                }
            ]}
            yAxis={[
                {
                    data: labels,
                    scaleType: 'band',
                    id: 'axis2',
                    interval: 0
                }
            ]}
        />
    );
};

export default VerticalSingleBarChart;
