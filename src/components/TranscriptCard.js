import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
    Card,
    Chip,
    CardHeader,
    CardContent,
    Collapse,
    IconButton,
    Typography,
    Link,
    Button,
    Grid
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    Archive as ArchiveIcon,
    Mic as MicIcon,
    Group as GroupIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const TranscriptCard = ({ transcript }) => {
    const [expanded, setExpanded] = useState(false);
    const {
        title,
        dateString,
        speakers,
        summary,
        transcript_url,
        userId,
        participants = []
    } = transcript;

    return (
        <Card
            sx={{
                width: '100%',
                maxWidth: 'none',
                margin: '16px 0',
                boxShadow: 3
            }}
        >
            <CardHeader
                sx={{ pb: 0 }}
                title={
                    <Grid
                        alignItems="flex-start"
                        container
                        justifyContent="space-between"
                    >
                        <Grid item sm={8} xs={12}>
                            <Typography variant="h6">{title}</Typography>
                            <Grid
                                alignItems="center"
                                container
                                spacing={1}
                                sx={{ mt: 0.5 }}
                            >
                                <Grid item>
                                    <CalendarTodayIcon
                                        fontSize="small"
                                        sx={{
                                            color: 'text.secondary',
                                            mr: 0.5
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {dayjs(dateString).format(
                                            'YYYY-MM-DD HH:mm'
                                        )}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sm="auto" xs={12}>
                            <Grid
                                alignItems="center"
                                container
                                justifyContent={{
                                    xs: 'flex-start',
                                    sm: 'flex-end'
                                }}
                                spacing={1}
                            >
                                {userId ? (
                                    <Grid item>
                                        <Chip
                                            color="success"
                                            icon={
                                                <PersonIcon
                                                    sx={{
                                                        color: 'success.main'
                                                    }}
                                                />
                                            }
                                            label={userId}
                                            size="small"
                                        />
                                    </Grid>
                                ) : (
                                    <>
                                        <Grid item>
                                            <Button
                                                onClick={() =>
                                                    alert(
                                                        'Assign to Existing User clicked'
                                                    )
                                                }
                                                size="small"
                                                startIcon={<PersonIcon />}
                                                variant="outlined"
                                            >
                                                Assign to User
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                onClick={() =>
                                                    alert(
                                                        'Create New User clicked'
                                                    )
                                                }
                                                size="small"
                                                startIcon={<PersonAddIcon />}
                                                variant="outlined"
                                            >
                                                Create User
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                onClick={() =>
                                                    alert('Archive clicked')
                                                }
                                                size="small"
                                                startIcon={<ArchiveIcon />}
                                                variant="outlined"
                                            >
                                                Archive
                                            </Button>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                }
            />
            <CardContent sx={{ pt: 1 }}>
                <Grid alignItems="center" container spacing={1} sx={{ mb: 1 }}>
                    <Grid item>
                        <MicIcon
                            fontSize="small"
                            sx={{ color: 'text.secondary' }}
                        />
                    </Grid>
                    <Grid item>
                        <Typography color="text.secondary" variant="body2">
                            <strong>Speakers:</strong>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={0.5}>
                            {speakers?.map((s, idx) => (
                                <Grid item key={idx}>
                                    <Chip
                                        label={s.name || s}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                {participants.length > 0 && (
                    <Grid
                        alignItems="center"
                        container
                        spacing={1}
                        sx={{ mb: 1 }}
                    >
                        <Grid item>
                            <GroupIcon
                                fontSize="small"
                                sx={{ color: 'text.secondary' }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography color="text.secondary" variant="body2">
                                <strong>Participants:</strong>
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Grid container spacing={0.5}>
                                {participants.map((p, idx) => (
                                    <Grid item key={idx}>
                                        <Chip
                                            label={p}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                <Typography gutterBottom sx={{ mt: 1 }} variant="body2">
                    <strong>Action Items:</strong>
                </Typography>
                <Typography
                    component="pre"
                    sx={{
                        p: 1,
                        borderRadius: 1,
                        mb: 0,
                        backgroundColor: 'blue.50',
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {(() => {
                        const text = summary?.action_items;
                        if (!text) return 'N/A';
                        let trimmed = text;
                        while (trimmed.startsWith('\n'))
                            trimmed = trimmed.slice(1);
                        while (trimmed.endsWith('\n'))
                            trimmed = trimmed.slice(0, -1);
                        return trimmed;
                    })()}
                </Typography>
                <Grid container justifyContent="center" sx={{ mt: 1 }}>
                    <Grid item>
                        <IconButton onClick={() => setExpanded(!expanded)}>
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Grid>
                </Grid>
            </CardContent>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography gutterBottom variant="body2">
                        <strong>Bullet Summary:</strong>
                    </Typography>
                    <ul
                        style={{
                            paddingLeft: 20,
                            marginTop: 4,
                            marginBottom: 12
                        }}
                    >
                        {(summary?.bullet_gist || [])
                            .split('\n')
                            .filter(Boolean)
                            .map((point, idx) => (
                                <li
                                    key={idx}
                                    style={{ fontSize: 14, color: '#555' }}
                                >
                                    {point}
                                </li>
                            ))}
                    </ul>
                    <Typography gutterBottom variant="subtitle1">
                        <strong>Summary:</strong>{' '}
                        {summary?.short_summary || 'No summary available.'}
                    </Typography>
                    <Link
                        href={transcript_url}
                        rel="noopener noreferrer"
                        target="_blank"
                        underline="hover"
                    >
                        🔗 View Transcript
                    </Link>
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default TranscriptCard;
