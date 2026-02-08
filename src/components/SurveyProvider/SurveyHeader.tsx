import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';

export interface SurveyBreadcrumb {
    to?: string;
    label: string;
}

export interface SurveyHeaderProps {
    breadcrumbs?: SurveyBreadcrumb[];
    title: string;
    subtitle?: string;
    interviewName?: string;
    instructions?: string;
}

export default function SurveyHeader({
    breadcrumbs = [],
    title,
    subtitle,
    interviewName,
    instructions
}: SurveyHeaderProps) {
    return (
        <Box sx={{ mb: 4 }}>
            {breadcrumbs.length > 0 && (
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    {breadcrumbs.map((crumb, index) =>
                        crumb.to ? (
                            <Link
                                color="inherit"
                                component={LinkDom}
                                key={index}
                                to={crumb.to}
                                underline="hover"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <Typography color="text.primary" key={index}>
                                {crumb.label}
                            </Typography>
                        )
                    )}
                </Breadcrumbs>
            )}

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                    color="primary.main"
                    fontWeight="bold"
                    gutterBottom
                    variant="h4"
                >
                    {title}
                </Typography>

                {interviewName && (
                    <Typography color="text.primary" gutterBottom variant="h6">
                        {interviewName}
                    </Typography>
                )}

                {subtitle && (
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                        variant="body1"
                    >
                        {subtitle}
                    </Typography>
                )}

                {instructions && (
                    <Typography
                        color="primary.contrastText"
                        fontWeight="bold"
                        sx={{
                            p: 2,
                            backgroundColor: 'primary.main',
                            borderRadius: 2,
                            display: 'inline-block',
                            boxShadow: 2,
                            border: '2px solid',
                            borderColor: 'primary.dark'
                        }}
                        variant="body2"
                    >
                        {instructions}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
