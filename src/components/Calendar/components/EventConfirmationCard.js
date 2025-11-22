import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Link,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    is_TaiGer_Agent,
    is_TaiGer_Student,
    is_TaiGer_role
} from '@taiger-common/core';

import {
    NoonNightLabel,
    convertDate,
    getDate,
    getTime,
    isInTheFuture,
    showTimezoneOffset
} from '../../../utils/contants';
import DEMO from '../../../store/constant';
import EventDateComponent from '../../DateComponent';
import { useAuth } from '../../AuthProvider';

export default function EventConfirmationCard(props) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();

    // Helper function to get initials from name
    const getInitials = (firstname, lastname) => {
        const first = firstname?.charAt(0)?.toUpperCase() || '';
        const last = lastname?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}` || '?';
    };

    const isConfirmed =
        props.event.isConfirmedReceiver && props.event.isConfirmedRequester;

    return (
        <Accordion
            defaultExpanded={
                !props.event.isConfirmedReceiver ||
                !props.event.isConfirmedRequester
                    ? isInTheFuture(props.event.end)
                    : null
            }
            sx={{
                mb: 2,
                '&:before': {
                    display: 'none'
                },
                borderRadius: '4px',
                boxShadow: theme.shadows[2],
                overflow: 'hidden'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: isConfirmed
                        ? theme.palette.success.light + '20'
                        : theme.palette.warning.light + '20',
                    '&:hover': {
                        backgroundColor: isConfirmed
                            ? theme.palette.success.light + '30'
                            : theme.palette.warning.light + '30'
                    }
                }}
            >
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 2,
                        width: '100%'
                    }}
                >
                    <Chip
                        color={isConfirmed ? 'success' : 'warning'}
                        icon={
                            isConfirmed ? (
                                <CheckCircleIcon />
                            ) : (
                                <HourglassBottomIcon />
                            )
                        }
                        label={
                            isConfirmed
                                ? t('Confirmed', { ns: 'common' })
                                : t('Pending', { ns: 'common' })
                        }
                        size="small"
                        sx={{ borderRadius: '4px' }}
                    />
                    <EventIcon color="primary" />
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            gap: 0.5
                        }}
                    >
                        <Typography sx={{ fontWeight: 600 }} variant="h6">
                            {convertDate(props.event.start)}{' '}
                            {NoonNightLabel(props.event.start)}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {Intl.DateTimeFormat().resolvedOptions().timeZone}{' '}
                            UTC
                            {showTimezoneOffset()}
                        </Typography>
                    </Box>
                    {is_TaiGer_role(user) &&
                        props.event.requester_id?.length > 0 && (
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    gap: 1
                                }}
                            >
                                <PersonIcon color="action" fontSize="small" />
                                <Typography variant="body2">
                                    {props.event.requester_id
                                        ?.map(
                                            (requester) =>
                                                `${requester.firstname} ${requester.lastname}`
                                        )
                                        .join(', ')}
                                </Typography>
                            </Box>
                        )}
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                    {/* Date & Time Section */}
                    <Grid item md={4} xs={12}>
                        <Stack spacing={2}>
                            <Card
                                sx={{
                                    backgroundColor:
                                        theme.palette.background.default,
                                    borderRadius: '4px'
                                }}
                                variant="outlined"
                            >
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <EventDateComponent
                                            eventDate={
                                                new Date(props.event.start)
                                            }
                                        />
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={1.5}>
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                gap: 1
                                            }}
                                        >
                                            <EventIcon
                                                color="primary"
                                                fontSize="small"
                                            />
                                            <Box>
                                                <Typography
                                                    color="text.secondary"
                                                    variant="caption"
                                                >
                                                    {t('Date', {
                                                        ns: 'common'
                                                    })}
                                                </Typography>
                                                <Typography
                                                    sx={{ fontWeight: 600 }}
                                                    variant="body1"
                                                >
                                                    {getDate(props.event.start)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                gap: 1
                                            }}
                                        >
                                            <AccessAlarmIcon
                                                color="primary"
                                                fontSize="small"
                                            />
                                            <Box>
                                                <Typography
                                                    color="text.secondary"
                                                    variant="caption"
                                                >
                                                    {t('Time', {
                                                        ns: 'common'
                                                    })}
                                                </Typography>
                                                <Typography
                                                    sx={{ fontWeight: 600 }}
                                                    variant="body1"
                                                >
                                                    {getTime(props.event.start)}{' '}
                                                    {NoonNightLabel(
                                                        props.event.start
                                                    )}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {
                                                Intl.DateTimeFormat().resolvedOptions()
                                                    .timeZone
                                            }{' '}
                                            UTC
                                            {showTimezoneOffset()}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Meeting Link Section */}
                            <Paper
                                sx={{ borderRadius: '4px', p: 2 }}
                                variant="outlined"
                            >
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: 1,
                                        mb: 1.5
                                    }}
                                >
                                    <LinkIcon
                                        color="primary"
                                        fontSize="small"
                                    />
                                    <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="subtitle1"
                                    >
                                        {t('Meeting Link', { ns: 'common' })}
                                    </Typography>
                                </Box>
                                {is_TaiGer_Student(user) ? (
                                    props.event.isConfirmedRequester ? (
                                        props.event.isConfirmedReceiver ? (
                                            props.disabled ? (
                                                <Typography
                                                    color="error"
                                                    variant="body2"
                                                >
                                                    {t('Meeting Link', {
                                                        ns: 'common'
                                                    })}{' '}
                                                    expired
                                                </Typography>
                                            ) : (
                                                <Link
                                                    component={LinkDom}
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        alignItems: 'center',
                                                        color: theme.palette
                                                            .primary.main,
                                                        display: 'inline-flex',
                                                        gap: 0.5,
                                                        wordBreak: 'break-all'
                                                    }}
                                                    target="_blank"
                                                    to={`${props.event.meetingLink}`}
                                                >
                                                    <LinkIcon fontSize="small" />
                                                    {props.event.meetingLink}
                                                </Link>
                                            )
                                        ) : (
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Will be available after the
                                                appointment is confirmed by the
                                                Agent.
                                            </Typography>
                                        )
                                    ) : (
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                width: '100%'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{ textAlign: 'center' }}
                                                variant="body2"
                                            >
                                                Please confirm the time to get
                                                the meeting link
                                            </Typography>
                                            <Button
                                                color="primary"
                                                fullWidth
                                                onClick={(e) =>
                                                    props.handleConfirmAppointmentModalOpen(
                                                        e,
                                                        props.event
                                                    )
                                                }
                                                size="small"
                                                startIcon={<CheckIcon />}
                                                variant="contained"
                                            >
                                                {t('Confirm', { ns: 'common' })}
                                            </Button>
                                        </Box>
                                    )
                                ) : null}
                                {is_TaiGer_role(user) ? (
                                    props.event.isConfirmedReceiver ? (
                                        props.event.isConfirmedRequester ? (
                                            props.disabled ? (
                                                <Typography
                                                    color="error"
                                                    variant="body2"
                                                >
                                                    Meeting Link expired
                                                </Typography>
                                            ) : (
                                                <Link
                                                    component={LinkDom}
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        alignItems: 'center',
                                                        color: theme.palette
                                                            .primary.main,
                                                        display: 'inline-flex',
                                                        gap: 0.5,
                                                        wordBreak: 'break-all'
                                                    }}
                                                    target="_blank"
                                                    to={`${props.event.meetingLink}`}
                                                >
                                                    <LinkIcon fontSize="small" />
                                                    {props.event.meetingLink}
                                                </Link>
                                            )
                                        ) : (
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Will be available after the
                                                appointment is confirmed by the
                                                Student.
                                            </Typography>
                                        )
                                    ) : (
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                width: '100%'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{ textAlign: 'center' }}
                                                variant="body2"
                                            >
                                                Please confirm the time to get
                                                the meeting link
                                            </Typography>
                                            <Button
                                                color="primary"
                                                fullWidth
                                                onClick={(e) =>
                                                    props.handleConfirmAppointmentModalOpen(
                                                        e,
                                                        props.event
                                                    )
                                                }
                                                size="small"
                                                startIcon={<CheckIcon />}
                                                variant="contained"
                                            >
                                                {t('Confirm', { ns: 'common' })}
                                            </Button>
                                        </Box>
                                    )
                                ) : null}
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Participants & Details Section */}
                    <Grid item md={8} xs={12}>
                        <Stack spacing={2}>
                            {/* Agent Section */}
                            <Paper
                                sx={{ borderRadius: '4px', p: 2 }}
                                variant="outlined"
                            >
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: 1,
                                        mb: 2
                                    }}
                                >
                                    <PersonIcon
                                        color="primary"
                                        fontSize="small"
                                    />
                                    <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="subtitle1"
                                    >
                                        {t('Agent', { ns: 'common' })}
                                    </Typography>
                                </Box>
                                {props.event.receiver_id?.map((receiver, x) => (
                                    <Box
                                        key={x}
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            gap: 1.5
                                        }}
                                    >
                                        <Avatar
                                            src={receiver.pictureUrl}
                                            sx={{
                                                border: `2px solid ${theme.palette.divider}`,
                                                height: 48,
                                                width: 48
                                            }}
                                        >
                                            {getInitials(
                                                receiver.firstname,
                                                receiver.lastname
                                            )}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                sx={{ fontWeight: 500 }}
                                                variant="body1"
                                            >
                                                {receiver.firstname}{' '}
                                                {receiver.lastname}
                                            </Typography>
                                            {receiver.email && (
                                                <Box
                                                    sx={{
                                                        alignItems: 'center',
                                                        display: 'flex',
                                                        gap: 0.5,
                                                        mt: 0.25
                                                    }}
                                                >
                                                    <EmailIcon
                                                        color="action"
                                                        fontSize="small"
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="caption"
                                                    >
                                                        {receiver.email}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Paper>

                            {/* Student Section */}
                            <Paper
                                sx={{ borderRadius: '4px', p: 2 }}
                                variant="outlined"
                            >
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: 1,
                                        mb: 2
                                    }}
                                >
                                    <PersonIcon
                                        color="primary"
                                        fontSize="small"
                                    />
                                    <Typography
                                        sx={{ fontWeight: 600 }}
                                        variant="subtitle1"
                                    >
                                        {t('Student', { ns: 'common' })}
                                    </Typography>
                                </Box>
                                {props.event.requester_id?.map(
                                    (requester, x) => (
                                        <Box
                                            key={x}
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                gap: 1.5
                                            }}
                                        >
                                            <Avatar
                                                src={requester.pictureUrl}
                                                sx={{
                                                    border: `2px solid ${theme.palette.divider}`,
                                                    height: 48,
                                                    width: 48
                                                }}
                                            >
                                                {getInitials(
                                                    requester.firstname,
                                                    requester.lastname
                                                )}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                {is_TaiGer_role(user) ? (
                                                    <Link
                                                        component={LinkDom}
                                                        sx={{
                                                            color: theme.palette
                                                                .primary.main,
                                                            fontWeight: 500,
                                                            textDecoration:
                                                                'none',
                                                            '&:hover': {
                                                                textDecoration:
                                                                    'underline'
                                                            }
                                                        }}
                                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                            requester._id.toString(),
                                                            DEMO.PROFILE_HASH
                                                        )}`}
                                                        variant="body1"
                                                    >
                                                        {requester.firstname}{' '}
                                                        {requester.lastname}
                                                    </Link>
                                                ) : (
                                                    <Typography
                                                        sx={{ fontWeight: 500 }}
                                                        variant="body1"
                                                    >
                                                        {requester.firstname}{' '}
                                                        {requester.lastname}
                                                    </Typography>
                                                )}
                                                {requester.email && (
                                                    <Box
                                                        sx={{
                                                            alignItems:
                                                                'center',
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            mt: 0.25
                                                        }}
                                                    >
                                                        <EmailIcon
                                                            color="action"
                                                            fontSize="small"
                                                            sx={{
                                                                fontSize: 16
                                                            }}
                                                        />
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                        >
                                                            {requester.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )
                                )}
                            </Paper>

                            {/* Description Section */}
                            <Paper
                                sx={{ borderRadius: '4px', p: 2 }}
                                variant="outlined"
                            >
                                <Typography
                                    sx={{ fontWeight: 600, mb: 1.5 }}
                                    variant="subtitle1"
                                >
                                    {t('Description', { ns: 'common' })}
                                </Typography>
                                <Typography
                                    sx={{
                                        mb: 2,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}
                                    variant="body2"
                                >
                                    {props.event.description || (
                                        <Typography
                                            color="text.secondary"
                                            component="span"
                                        >
                                            No description provided
                                        </Typography>
                                    )}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: {
                                            xs: 'column',
                                            sm: 'row'
                                        },
                                        gap: 2,
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {props.event.createdAt && (
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {t('Created', { ns: 'common' })}:{' '}
                                            {convertDate(props.event.createdAt)}
                                        </Typography>
                                    )}
                                    {props.event.updatedAt && (
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {t('Updated', { ns: 'common' })}:{' '}
                                            {convertDate(props.event.updatedAt)}
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Action Buttons Section */}
                    <Grid item xs={12}>
                        {props.event.event_type !== 'Interview' && (
                            <Paper
                                sx={{ borderRadius: '4px', p: 2 }}
                                variant="outlined"
                            >
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex',
                                        flexDirection: {
                                            xs: 'column',
                                            sm: 'row'
                                        },
                                        gap: 2,
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        {is_TaiGer_Student(user) &&
                                            (!props.event
                                                .isConfirmedRequester ||
                                                !props.event
                                                    .isConfirmedReceiver) && (
                                                <Chip
                                                    color={
                                                        props.event
                                                            .isConfirmedRequester
                                                            ? 'warning'
                                                            : 'default'
                                                    }
                                                    icon={
                                                        <HourglassBottomIcon />
                                                    }
                                                    label={
                                                        props.event
                                                            .isConfirmedRequester
                                                            ? t(
                                                                  'Pending Agent Confirmation',
                                                                  {
                                                                      ns: 'common'
                                                                  }
                                                              )
                                                            : t(
                                                                  'Awaiting Your Confirmation',
                                                                  {
                                                                      ns: 'common'
                                                                  }
                                                              )
                                                    }
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '4px',
                                                        mr: 1
                                                    }}
                                                />
                                            )}
                                        {is_TaiGer_Agent(user) &&
                                            (!props.event.isConfirmedReceiver ||
                                                !props.event
                                                    .isConfirmedRequester) && (
                                                <Chip
                                                    color={
                                                        props.event
                                                            .isConfirmedReceiver
                                                            ? 'warning'
                                                            : 'default'
                                                    }
                                                    icon={
                                                        <HourglassBottomIcon />
                                                    }
                                                    label={
                                                        props.event
                                                            .isConfirmedReceiver
                                                            ? t(
                                                                  'Pending Student Confirmation',
                                                                  {
                                                                      ns: 'common'
                                                                  }
                                                              )
                                                            : t(
                                                                  'Awaiting Your Confirmation',
                                                                  {
                                                                      ns: 'common'
                                                                  }
                                                              )
                                                    }
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '4px',
                                                        mr: 1
                                                    }}
                                                />
                                            )}
                                    </Box>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1}
                                        sx={{ flexWrap: 'wrap' }}
                                    >
                                        {is_TaiGer_Student(user) &&
                                            !props.event
                                                .isConfirmedRequester && (
                                                <Button
                                                    color="primary"
                                                    onClick={(e) =>
                                                        props.handleConfirmAppointmentModalOpen(
                                                            e,
                                                            props.event
                                                        )
                                                    }
                                                    size="small"
                                                    startIcon={<CheckIcon />}
                                                    variant="contained"
                                                >
                                                    {t('Confirm', {
                                                        ns: 'common'
                                                    })}
                                                </Button>
                                            )}
                                        {is_TaiGer_Agent(user) &&
                                            !props.event
                                                .isConfirmedReceiver && (
                                                <Button
                                                    color="primary"
                                                    onClick={(e) =>
                                                        props.handleConfirmAppointmentModalOpen(
                                                            e,
                                                            props.event
                                                        )
                                                    }
                                                    size="small"
                                                    startIcon={<CheckIcon />}
                                                    variant="contained"
                                                >
                                                    {t('Confirm', {
                                                        ns: 'common'
                                                    })}
                                                </Button>
                                            )}
                                        <Button
                                            color="primary"
                                            disabled={props.disabled}
                                            onClick={(e) =>
                                                props.handleEditAppointmentModalOpen(
                                                    e,
                                                    props.event
                                                )
                                            }
                                            size="small"
                                            startIcon={<EditIcon />}
                                            variant="outlined"
                                        >
                                            {t('Update', { ns: 'common' })}
                                        </Button>
                                        <Button
                                            color="error"
                                            disabled={props.disabled}
                                            onClick={(e) =>
                                                props.handleDeleteAppointmentModalOpen(
                                                    e,
                                                    props.event
                                                )
                                            }
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            variant="outlined"
                                        >
                                            {t('Delete', { ns: 'common' })}
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}
