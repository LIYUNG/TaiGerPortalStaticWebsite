import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface CustomTabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
    /**
     * When true, the active panel fills its (flex) parent and lets its content
     * manage scrolling — used for app-shell layouts. Default false keeps the
     * original inline markup unchanged for all other consumers.
     */
    fillHeight?: boolean;
    [key: string]: unknown;
}

export const CustomTabPanel = ({
    children,
    value,
    index,
    fillHeight = false,
    ...other
}: CustomTabPanelProps) => {
    const active = value === index;
    return (
        <div
            aria-labelledby={`simple-tab-${index}`}
            data-testid={`custom_tab_panel-${index}`}
            hidden={!active}
            id={`simple-tabpanel-${index}`}
            role="tabpanel"
            // Only apply the flex style while active — leaving it off when hidden
            // lets the `hidden` attribute actually hide the panel.
            style={
                fillHeight && active
                    ? {
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden'
                      }
                    : undefined
            }
            {...other}
        >
            {active ? (
                fillHeight ? (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {children}
                    </Box>
                ) : (
                    <Box>
                        <Typography component="span">{children}</Typography>
                    </Box>
                )
            ) : null}
        </div>
    );
};

export const a11yProps = (_value: number, index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
};
