import { Typography, Grid, Card } from '@mui/material';

import SingleBarChart from '@components/Charts/SingleBarChart';

interface KPIDashboardTabProps {
    CVdataWithDuration: Record<string, string | number>[];
    MLdataWithDuration: Record<string, string | number>[];
    RLdataWithDuration: Record<string, string | number>[];
}

const KPIDashboardTab = ({
    CVdataWithDuration,
    MLdataWithDuration,
    RLdataWithDuration
}: KPIDashboardTabProps) => {
    return (
        <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography>Closed CV KPI</Typography>
                    <SingleBarChart
                        data={CVdataWithDuration}
                        label="name"
                        yLabel="Duration (days)"
                    />
                </Card>
            </Grid>
            <Grid item md={4} xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography>Closed ML KPI</Typography>
                    <SingleBarChart
                        data={MLdataWithDuration}
                        label="name"
                        yLabel="Duration (days)"
                    />
                </Card>
            </Grid>
            <Grid item md={4} xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography>Closed RL KPI</Typography>
                    <SingleBarChart
                        data={RLdataWithDuration}
                        label="name"
                        yLabel="Duration (days)"
                    />
                </Card>
            </Grid>
        </Grid>
    );
};

export default KPIDashboardTab;
