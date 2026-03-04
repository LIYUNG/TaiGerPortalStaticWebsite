import { Link as LinkDom } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HelpIcon from '@mui/icons-material/Help';
import { Typography, Card, Link, Box, Stack, Chip } from '@mui/material';

import DEMO from '@store/constant';

export interface SimilarThread {
    _id: string;
    student_id?: { firstname?: string; lastname?: string };
    application_id?: { application_year?: string; admission?: string };
    file_type?: string;
}

export interface SimilarThreadsTabProps {
    similarThreads: SimilarThread[];
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const SimilarThreadsTab = ({ similarThreads, t }: SimilarThreadsTabProps) => {
    if (similarThreads && similarThreads.length > 0) {
        return (
            <Stack spacing={1.5} sx={{ mx: 2 }}>
                {similarThreads.map((thread) => (
                    <Card
                        key={thread._id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        <Link
                            component={LinkDom}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                flex: 1,
                                textDecoration: 'none'
                            }}
                            target="_blank"
                            to={DEMO.DOCUMENT_MODIFICATION_LINK(thread._id)}
                        >
                            <ArticleIcon sx={{ color: 'primary.main' }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight="bold" variant="subtitle1">
                                    {`${thread.student_id?.firstname} ${thread.student_id?.lastname}`}
                                </Typography>
                                <Typography color="text.secondary" variant="body2">
                                    {`${thread.application_id?.application_year} - ${thread.file_type}`}
                                </Typography>
                            </Box>
                        </Link>
                        {thread.application_id?.admission === 'O' ? (
                            <Chip
                                color="success"
                                icon={
                                    <CheckCircleIcon
                                        sx={{
                                            color: 'inherit !important'
                                        }}
                                    />
                                }
                                label="Admitted"
                                size="small"
                                sx={{
                                    fontWeight: 'bold',
                                    minWidth: 100
                                }}
                            />
                        ) : thread.application_id?.admission === 'X' ? (
                            <Chip
                                color="error"
                                icon={
                                    <CancelOutlinedIcon
                                        sx={{
                                            color: 'inherit !important'
                                        }}
                                    />
                                }
                                label="Rejected"
                                size="small"
                                sx={{
                                    fontWeight: 'bold',
                                    minWidth: 100
                                }}
                            />
                        ) : (
                            <Chip
                                color="default"
                                icon={
                                    <HelpIcon
                                        sx={{
                                            color: 'inherit !important'
                                        }}
                                    />
                                }
                                label="Pending"
                                size="small"
                                sx={{
                                    fontWeight: 'bold',
                                    minWidth: 100
                                }}
                                variant="outlined"
                            />
                        )}
                    </Card>
                ))}
            </Stack>
        );
    }

    return (
        <Typography sx={{ m: 2 }} variant="text.secondary">
            {t('No similar threads found', { ns: 'common' })}
        </Typography>
    );
};

export default SimilarThreadsTab;
