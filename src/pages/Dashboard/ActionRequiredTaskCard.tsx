import { Link as LinkDom } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { Box, Card, Link, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

export interface ActionRequiredTaskCardProps {
    /** Route for the card / task count link */
    to: string;
    /** Number of tasks (action required) */
    count: number;
    /**
     * When true, the whole card is clickable and shows alert styling (error background, icon) when count > 0.
     * When false, neutral card with link only on the task count (e.g. Editor dashboard).
     */
    highlightWhenPending?: boolean;
}

const ActionRequiredTaskCard = ({
    to,
    count,
    highlightWhenPending = false
}: ActionRequiredTaskCardProps) => {
    const { t } = useTranslation();
    const hasPending = count > 0;
    const showHighlight = highlightWhenPending && hasPending;

    const cardContent = (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                {highlightWhenPending &&
                    (hasPending ? (
                        <AssignmentIcon
                            fontSize="small"
                            sx={{ color: showHighlight ? 'white' : undefined }}
                        />
                    ) : (
                        <CheckCircleIcon fontSize="small" color="success" />
                    ))}
                <Typography
                    variant="body2"
                    color={showHighlight ? 'white' : 'text.secondary'}
                >
                    {hasPending
                        ? t('Action required', { ns: 'common' })
                        : t('No Action', { ns: 'common' })}
                </Typography>
            </Box>
            <Typography
                variant="h6"
                component="p"
                fontWeight={showHighlight ? 'bold' : 'normal'}
                color={showHighlight ? 'white' : 'primary.main'}
            >
                {t('Task', { ns: 'common', count })}
            </Typography>
        </>
    );

    const cardSx = {
        p: 2,
        height: '100%',
        ...(highlightWhenPending && {
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, background-color 0.2s',
            ...(showHighlight && {
                bgcolor: 'error.light',
                borderLeft: 4,
                borderColor: 'error.main'
            }),
            '&:hover': {
                boxShadow: 2,
                backgroundColor: (theme: Theme) =>
                    showHighlight
                        ? alpha(theme.palette.error.main, 0.2)
                        : theme.palette.action.hover
            }
        })
    };

    if (highlightWhenPending) {
        return (
            <Link
                component={LinkDom}
                to={to}
                underline="none"
                color="inherit"
                sx={{ display: 'block', height: '100%' }}
            >
                <Card sx={cardSx}>{cardContent}</Card>
            </Link>
        );
    }

    return (
        <Card sx={cardSx}>
            <Typography color="text.secondary">
                {t('Action required', { ns: 'common' })}
            </Typography>
            <Typography variant="h6">
                <Link component={LinkDom} to={to} underline="hover">
                    <b>{t('Task', { ns: 'common', count })}</b>
                </Link>
            </Typography>
        </Card>
    );
};

export default ActionRequiredTaskCard;
