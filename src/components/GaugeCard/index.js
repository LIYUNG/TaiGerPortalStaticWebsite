import React from 'react';
import { Card, CardContent, CardHeader, Stack } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';

const getGaugeColor = (value) => {
    const theme = useTheme();
    if (value >= 75) return theme.palette.primary.main;
    if (value >= 50) return theme.palette.success.main;
    return theme.palette.error.main;
};

const GaugeCard = ({
    title,
    score,
    onClick,
    minHeight = 250,
    gaugeSize = 100,
    startAngle = -110,
    endAngle = 110,
    settings = {},
    CardProps = {},
    CardHeaderProps = {},
    GaugeProps = {},
    subtitle,
    sx
}) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                height: 'auto',
                minHeight,
                display: 'flex',
                flexDirection: 'column',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick
                    ? {
                          boxShadow: (theme) => theme.shadows[4],
                          transform: 'translateY(-2px)',
                          bgcolor: 'action.hover'
                      }
                    : {},
                transition: 'all 0.2s ease-in-out',
                ...CardProps.sx,
                ...sx
            }}
            variant="outlined"
            {...CardProps}
        >
            <CardHeader
                subheader={subtitle}
                sx={{
                    pb: 1,
                    '& .MuiCardHeader-content': {
                        overflow: 'visible'
                    },
                    ...CardHeaderProps.sx
                }}
                title={title}
                {...CardHeaderProps}
            />
            <CardContent>
                <Stack
                    alignItems="center"
                    direction="column"
                    justifyContent="center"
                    sx={{ height: '100%' }}
                >
                    <Gauge
                        {...settings}
                        {...GaugeProps}
                        endAngle={endAngle}
                        size={gaugeSize}
                        startAngle={startAngle}
                        sx={{
                            [`& .${gaugeClasses.valueArc}`]: {
                                fill: getGaugeColor(score)
                            },
                            [`& .${gaugeClasses.valueText}`]: {
                                fontSize: 30,
                                fontWeight: 'bold'
                            },
                            ...GaugeProps.sx
                        }}
                        text={({ value }) => `${value}%`}
                        value={score}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

export default GaugeCard;
