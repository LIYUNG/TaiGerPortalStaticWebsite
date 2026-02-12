import { TabTitle } from '../Utils/TabTitle';

import DashboardBody from './DashboardBody';
import { Box } from '@mui/material';

const Dashboard = () => {
    TabTitle('Home Page');

    return (
        <Box data-testid="dashoboard_component">
            <DashboardBody />
        </Box>
    );
};

export default Dashboard;
