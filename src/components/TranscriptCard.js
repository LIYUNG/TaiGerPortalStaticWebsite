import React, { useState } from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Link from '@mui/material/Link';

const TranscriptCard = ({ transcript }) => {
    const [expanded, setExpanded] = useState(false);
    const { title, dateString, speakers, summary, transcript_url } = transcript;

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
                action={
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                }
                subheader={dayjs(dateString).format('YYYY-MM-DD HH:mm')}
                title={title}
            />
            <CardContent sx={{ pt: 0 }}>
                <Typography color="text.secondary" variant="body2">
                    <strong>Speakers:</strong>{' '}
                    {speakers?.map((s) => s.name).join(', ')}
                </Typography>
            </CardContent>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography gutterBottom variant="subtitle1">
                        <strong>Summary:</strong>{' '}
                        {summary?.gist || 'No summary available.'}
                    </Typography>
                    <Typography gutterBottom variant="body2">
                        <strong>Keywords:</strong>{' '}
                        {summary?.keywords?.join(', ') || 'N/A'}
                    </Typography>
                    <Typography gutterBottom variant="body2">
                        <strong>Bullet Summary:</strong>
                    </Typography>
                    <Typography
                        component="pre"
                        sx={{ background: '#f5f5f5', p: 1, borderRadius: 1 }}
                    >
                        {summary?.bullet_gist || 'N/A'}
                    </Typography>
                    <Typography gutterBottom variant="body2">
                        <strong>Action Items:</strong>
                    </Typography>
                    <Typography
                        component="pre"
                        sx={{ background: '#f5f5f5', p: 1, borderRadius: 1 }}
                    >
                        {summary?.action_items || 'N/A'}
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
