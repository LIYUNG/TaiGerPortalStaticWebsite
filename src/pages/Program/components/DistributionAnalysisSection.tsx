import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import { School, Language, Public } from '@mui/icons-material';

interface DistributionItem {
    country?: string;
    degree?: string;
    language?: string;
    subject?: string;
    count: number;
}

interface DistributionAnalysisSectionProps {
    byCountry: DistributionItem[];
    byDegree: DistributionItem[];
    byLanguage: DistributionItem[];
    totalPrograms: number;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const DistributionAnalysisSection = ({
    byCountry,
    byDegree,
    byLanguage,
    totalPrograms,
    t
}: DistributionAnalysisSectionProps) => {
    const navigate = useNavigate();

    return (
        <>
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Distribution Analysis', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Programs by Country */}
                <Grid item md={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/country')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <Public sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Country', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {byCountry
                                            .slice(0, 8)
                                            .map((item, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                alignItems="center"
                                                                display="flex"
                                                                justifyContent="space-between"
                                                            >
                                                                <Typography>
                                                                    {
                                                                        item.country
                                                                    }
                                                                </Typography>
                                                                <Chip
                                                                    color="primary"
                                                                    label={
                                                                        item.count
                                                                    }
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                sx={{ mt: 1 }}
                                                                value={
                                                                    (item.count /
                                                                        totalPrograms) *
                                                                    100
                                                                }
                                                                variant="determinate"
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Programs by Degree */}
                <Grid item md={3} sm={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/degree')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <School sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Degree', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {byDegree.map((item, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            alignItems="center"
                                                            display="flex"
                                                            justifyContent="space-between"
                                                        >
                                                            <Typography>
                                                                {item.degree}
                                                            </Typography>
                                                            <Chip
                                                                color="secondary"
                                                                label={
                                                                    item.count
                                                                }
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <LinearProgress
                                                            color="secondary"
                                                            sx={{ mt: 1 }}
                                                            value={
                                                                (item.count /
                                                                    totalPrograms) *
                                                                100
                                                            }
                                                            variant="determinate"
                                                        />
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Programs by Language */}
                <Grid item md={3} sm={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/language')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <Language sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Language', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {byLanguage.map((item, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            alignItems="center"
                                                            display="flex"
                                                            justifyContent="space-between"
                                                        >
                                                            <Typography>
                                                                {item.language}
                                                            </Typography>
                                                            <Chip
                                                                color="success"
                                                                label={
                                                                    item.count
                                                                }
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <LinearProgress
                                                            color="success"
                                                            sx={{ mt: 1 }}
                                                            value={
                                                                (item.count /
                                                                    totalPrograms) *
                                                                100
                                                            }
                                                            variant="determinate"
                                                        />
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default DistributionAnalysisSection;
