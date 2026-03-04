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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { School, Category, Person } from '@mui/icons-material';

interface AdditionalInsightsSectionProps {
    bySubject?: { subject: string; count: number }[];
    bySchoolType?: {
        schoolType: string;
        count: number;
        isPrivateSchool?: boolean;
        isPartnerSchool?: boolean;
        avgPrograms?: number;
    }[];
    topContributors?: {
        contributor?: string;
        lastUpdate?: string;
        updateCount?: number;
        name?: string;
        email?: string;
        programsAdded?: number;
    }[];
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const AdditionalInsightsSection = ({
    bySubject,
    bySchoolType,
    topContributors,
    t
}: AdditionalInsightsSectionProps) => {
    const navigate = useNavigate();

    if (
        !(bySubject?.length > 0) &&
        !(bySchoolType?.length > 0) &&
        !(topContributors?.length > 0)
    ) {
        return null;
    }

    return (
        <>
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Additional Insights', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Programs by Subject */}
                {bySubject?.length > 0 && (
                    <Grid item md={6} xs={12}>
                        <Card
                            onClick={() =>
                                navigate('/programs/distribution/subject')
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
                                            <Category sx={{ mr: 1 }} />
                                            <Typography variant="h6">
                                                {t('Top Program Subjects', {
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
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            overflow: 'auto'
                                        }}
                                    >
                                        <List dense>
                                            {bySubject.map((item, index) => (
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
                                                                        item.subject
                                                                    }
                                                                </Typography>
                                                                <Chip
                                                                    color="info"
                                                                    label={
                                                                        item.count
                                                                    }
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                color="info"
                                                                sx={{
                                                                    mt: 1
                                                                }}
                                                                value={
                                                                    (item.count /
                                                                        Math.max(
                                                                            ...bySubject.map(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.count
                                                                            )
                                                                        )) *
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
                )}

                {/* School Type Distribution */}
                {bySchoolType?.length > 0 && (
                    <Grid item md={6} xs={12}>
                        <Card sx={{ height: 450 }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box alignItems="center" display="flex" mb={2}>
                                    <School sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                        {t('School Type Distribution', {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <TableContainer
                                    sx={{
                                        flexGrow: 1,
                                        overflow: 'auto'
                                    }}
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    {t('School Type', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('Private', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('Partner', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {t('Count', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bySchoolType?.map((type) => (
                                                <TableRow key={type.schoolType}>
                                                    <TableCell>
                                                        {type.schoolType || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {type.isPrivateSchool
                                                            ? '✓'
                                                            : '✗'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {type.isPartnerSchool
                                                            ? '✓'
                                                            : '✗'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {type.count}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Top Contributors */}
                {topContributors && topContributors.length > 0 && (
                    <Grid item md={6} xs={12}>
                        <Card sx={{ height: 450 }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box alignItems="center" display="flex" mb={2}>
                                    <Person sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                        {t('Top Contributors', {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        overflow: 'auto'
                                    }}
                                >
                                    <List dense>
                                        {topContributors.map(
                                            (contributor, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                alignItems="center"
                                                                display="flex"
                                                                justifyContent="space-between"
                                                            >
                                                                <Box>
                                                                    <Typography>
                                                                        {
                                                                            contributor.contributor
                                                                        }
                                                                    </Typography>
                                                                    <Typography
                                                                        color="textSecondary"
                                                                        variant="caption"
                                                                    >
                                                                        {t(
                                                                            'Last update',
                                                                            {
                                                                                ns: 'common'
                                                                            }
                                                                        )}
                                                                        :{' '}
                                                                        {new Date(
                                                                            contributor.lastUpdate
                                                                        ).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                                <Chip
                                                                    color="warning"
                                                                    label={`${contributor.updateCount} ${t('updates', { ns: 'common' })}`}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                color="warning"
                                                                sx={{
                                                                    mt: 1
                                                                }}
                                                                value={
                                                                    (contributor.updateCount /
                                                                        Math.max(
                                                                            ...topContributors.map(
                                                                                (
                                                                                    c
                                                                                ) =>
                                                                                    c.updateCount
                                                                            )
                                                                        )) *
                                                                    100
                                                                }
                                                                variant="determinate"
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </>
    );
};

export default AdditionalInsightsSection;
