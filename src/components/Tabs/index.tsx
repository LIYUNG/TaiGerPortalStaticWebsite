import React from 'react';
import { Box, Typography } from '@mui/material';

interface CustomTabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
    [key: string]: unknown;
}

export const CustomTabPanel = ({
    children,
    value,
    index,
    ...other
}: CustomTabPanelProps) => {
    return (
        <div
            aria-labelledby={`simple-tab-${index}`}
            data-testid={`custom_tab_panel-${index}`}
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            role="tabpanel"
            {...other}
        >
            {value === index ? (
                <Box>
                    <Typography component="span">{children}</Typography>
                </Box>
            ) : null}
        </div>
    );
};

export const a11yProps = (value: number, index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
        sx: {
            fontWeight: value === index ? 'bold' : 'normal'
        }
    };
};
