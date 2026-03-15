import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Card,
    Box,
    IconButton,
    Stack,
    Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LaunchIcon from '@mui/icons-material/Launch';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import { is_TaiGer_AdminAgent } from '@taiger-common/core';
import type {
    IUserWithId,
    IDocumentthreadPopulated,
    IProgramWithId
} from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

import DEMO from '@store/constant';

interface DeadlineCardProps {
    deadline: string;
    isFavorite: boolean;
    thread: IDocumentthreadPopulated;
    user: IUserWithId;
    urgent: boolean;
    deadlineGradient: { start: string; end: string };
    handleFavoriteToggle: (threadId: string) => void;
}

const DeadlineCard = ({
    deadline,
    isFavorite,
    thread,
    user,
    urgent,
    deadlineGradient,
    handleFavoriteToggle
}: DeadlineCardProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Card
            elevation={urgent ? 4 : 2}
            sx={{
                background: `linear-gradient(135deg, ${deadlineGradient.start} 0%, ${deadlineGradient.end} 100%)`,
                color: 'white',
                borderRadius: 2,
                boxShadow: urgent ? theme.shadows[4] : theme.shadows[1],
                border: urgent
                    ? `2px solid ${theme.palette.error.light}`
                    : `1px solid ${theme.palette.divider}`
            }}
        >
            <Box sx={{ p: 1.5 }}>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ mb: 1 }}
                >
                    <EventIcon sx={{ fontSize: 24 }} />
                    <Typography
                        sx={{
                            opacity: 0.85,
                            fontSize: '0.65rem'
                        }}
                        variant="caption"
                    >
                        {urgent ? (
                            <Stack
                                alignItems="center"
                                component="span"
                                direction="row"
                                spacing={0.3}
                            >
                                <WarningAmberIcon sx={{ fontSize: 12 }} />
                                <span>URGENT</span>
                            </Stack>
                        ) : (
                            t('Deadline', { ns: 'common' })
                        )}
                    </Typography>
                </Stack>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography fontWeight="700" variant="body1">
                            {deadline || 'Not Set'}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                        {is_TaiGer_AdminAgent(user) && thread.program_id && (
                            <Tooltip title="Update Deadline">
                                <IconButton
                                    component={LinkDom}
                                    size="small"
                                    sx={{ color: 'white', p: 0.5 }}
                                    target="_blank"
                                    to={`${DEMO.SINGLE_PROGRAM_LINK(
                                        (thread.program_id as IProgramWithId)._id.toString()
                                    )}`}
                                >
                                    <LaunchIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip
                            title={
                                isFavorite
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                            }
                        >
                            <IconButton
                                onClick={() => handleFavoriteToggle(thread._id)}
                                size="small"
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isFavorite ? (
                                    <StarRoundedIcon fontSize="small" />
                                ) : (
                                    <StarBorderRoundedIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>
        </Card>
    );
};

export default DeadlineCard;
