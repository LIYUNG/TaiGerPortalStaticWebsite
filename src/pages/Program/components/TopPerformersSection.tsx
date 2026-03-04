import { Link as LinkDom, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Divider,
    Grid,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import {
    TrendingUp,
    School
} from '@mui/icons-material';

import DEMO from '@store/constant';

interface TopSchoolItem {
    school: string;
    country: string;
    city: string;
    programCount: number;
}

interface TopProgramItem {
    programId: string;
    program_name: string;
    degree: string;
    semester: string;
    school: string;
    country: string;
    totalApplications: number;
    submittedCount: number;
    admittedCount: number;
    rejectedCount: number;
    pendingCount: number;
    admissionRate: number;
}

interface TopPerformersSectionProps {
    topSchools: TopSchoolItem[];
    topApplicationPrograms: TopProgramItem[];
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const TopPerformersSection = ({
    topSchools,
    topApplicationPrograms,
    t
}: TopPerformersSectionProps) => {
    const navigate = useNavigate();

    return (
        <>
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Top Performers', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Top Schools Table */}
                <Grid item md={6} xs={12}>
                    <Card
                        onClick={() => navigate('/programs/schools')}
                        sx={{ height: 500, cursor: 'pointer' }}
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
                                            {t('Top Schools by Program Count', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for all schools', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <TableContainer
                                    component={Paper}
                                    style={{ maxHeight: 400 }}
                                >
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    {t('School', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('Country', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('City', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {t('Programs', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topSchools.map(
                                                (school, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {school.school}
                                                        </TableCell>
                                                        <TableCell>
                                                            {school.country}
                                                        </TableCell>
                                                        <TableCell>
                                                            {school.city}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {
                                                                school.programCount
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Top Application Programs */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ height: 500 }}>
                        <CardContent
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box alignItems="center" display="flex" mb={2}>
                                <TrendingUp sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    {t('Most Popular Programs', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer
                                sx={{ flexGrow: 1, overflow: 'auto' }}
                            >
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {t('Program', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {t('School', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('Total Apps', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('Submitted', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip
                                                    title={t(
                                                        'Admissions / Submitted Applications',
                                                        { ns: 'common' }
                                                    )}
                                                >
                                                    <span>
                                                        {t('Admission Rate', {
                                                            ns: 'common'
                                                        })}
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topApplicationPrograms?.map(
                                            (program) => (
                                                <TableRow
                                                    key={program.programId}
                                                >
                                                    <TableCell>
                                                        <Link
                                                            component={LinkDom}
                                                            to={`${DEMO.SINGLE_PROGRAM_LINK(program.programId)}`}
                                                            underline="hover"
                                                        >
                                                            {
                                                                program.program_name
                                                            }
                                                        </Link>
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {program.degree} -{' '}
                                                            {program.semester}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {program.school}
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {program.country}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {
                                                            program.totalApplications
                                                        }
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="bold">
                                                            {
                                                                program.submittedCount
                                                            }
                                                        </Typography>
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {
                                                                program.admittedCount
                                                            }
                                                            ✓{' '}
                                                            {
                                                                program.rejectedCount
                                                            }
                                                            ✗{' '}
                                                            {
                                                                program.pendingCount
                                                            }
                                                            ⏳
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            color={
                                                                program.admissionRate >=
                                                                50
                                                                    ? 'success'
                                                                    : program.admissionRate >=
                                                                        30
                                                                      ? 'warning'
                                                                      : 'error'
                                                            }
                                                            label={`${program.admissionRate.toFixed(1)}%`}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default TopPerformersSection;
