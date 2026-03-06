import {
    Box,
    Typography,
    Select,
    MenuItem,
    Paper,
    Grid,
    Stack,
    Card,
    CardHeader,
    CardContent,
    Button
} from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { t } from 'i18next';
import i18next from 'i18next';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { green } from '@mui/material/colors';
import {
    DIRECT_ADMISSION_SCORE,
    DIRECT_ADMISSION_SECOND_SCORE,
    DIRECT_REJECTION_SCORE,
    DIRECT_REJECTION_SECOND_SCORE
} from '@utils/contants';
import type { SelectChangeEvent } from '@mui/material';
import type { IStudentResponse } from '@taiger-common/model';

import type { ProgramSheet } from './utils';
import {
    acquiredECTS,
    requiredECTS,
    satisfiedRequirement,
    getMaxScoreECTS,
    settings
} from './utils';
import CourseTable from './CourseTable';
import { EstimationCard } from './EstimationCard';

interface CourseAnalysisComponentProps {
    factor: number;
    sheet: ProgramSheet;
    student: IStudentResponse;
    onBackToOverview: () => void;
    currentProgram: number;
    programs: string[];
    onProgramChange: (event: SelectChangeEvent<number>) => void;
}

export const CourseAnalysisComponent = ({
    factor,
    sheet,
    student,
    onBackToOverview,
    currentProgram,
    programs,
    onProgramChange
}: CourseAnalysisComponentProps) => {
    const sortedCourses = sheet.sorted;
    const scores = sheet.scores;
    const firstRoundConsidered = scores.firstRoundConsidered;
    const secondRoundConsidered = scores.secondRoundConsidered;
    const suggestedCourses = sheet.suggestion;
    const academic_background = student?.academic_background;

    const requiredects = Object.keys(sortedCourses).reduce(
        (sum, category) => sum + requiredECTS(sortedCourses[category]),
        0
    );
    const acquiredects = Object.keys(sortedCourses).reduce(
        (sum, category) =>
            sum +
            (satisfiedRequirement(sortedCourses[category])
                ? requiredECTS(sortedCourses[category])
                : acquiredECTS(sortedCourses[category])),
        0
    );
    const matchingOverallECTSPercentage =
        requiredects > 0 ? (acquiredects * 100) / requiredects : 0;

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Button
                        onClick={onBackToOverview}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        variant="outlined"
                    >
                        Back to Overview
                    </Button>
                    <Typography sx={{ flexGrow: 1 }} variant="h6">
                        {t('Program Analysis', {
                            ns: 'courses'
                        })}
                    </Typography>
                </Box>
                <Card variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                        <Grid alignItems="center" container spacing={2}>
                            <Grid item md={4} xs={12}>
                                <Typography
                                    color="text.secondary"
                                    gutterBottom
                                    variant="subtitle2"
                                >
                                    Current Program
                                </Typography>
                                <Select
                                    fullWidth
                                    onChange={(e) => onProgramChange(e)}
                                    size="small"
                                    value={currentProgram - 1}
                                >
                                    {programs.map(
                                        (program: string, index: number) => (
                                            <MenuItem
                                                key={program}
                                                sx={{
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word'
                                                }}
                                                value={index}
                                            >
                                                {program}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </Grid>
                            <Grid item md={8} xs={12}>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={2}
                                >
                                    <Box>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                            variant="subtitle2"
                                        >
                                            Matching Score
                                        </Typography>
                                        <Typography
                                            color="primary"
                                            variant="h6"
                                        >
                                            {matchingOverallECTSPercentage.toFixed(
                                                0
                                            )}
                                            %
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                            variant="subtitle2"
                                        >
                                            Required ECTS
                                        </Typography>
                                        <Typography variant="h6">
                                            {acquiredects}/{requiredects}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
            <Grid container spacing={1}>
                <Grid item md={6} xs={12}>
                    {Object.keys(sortedCourses).map((category, i) => (
                        <Paper key={i} sx={{ p: 2, mb: 1 }}>
                            <Box
                                alignItems="center"
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    justifyContent="flex-start"
                                >
                                    {satisfiedRequirement(
                                        sortedCourses[category]
                                    ) ? (
                                        <CheckCircleIcon
                                            style={{
                                                color: green[500],
                                                marginRight: '8px'
                                            }}
                                        />
                                    ) : (
                                        <WarningIcon
                                            style={{
                                                color: 'red',
                                                marginRight: '8px'
                                            }}
                                        />
                                    )}
                                    <Typography fontWeight="bold" variant="h5">
                                        {category}
                                    </Typography>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    justifyContent="flex-end"
                                >
                                    {getMaxScoreECTS(
                                        sortedCourses[category]
                                    ) !== 0 ? (
                                        <Typography
                                            fontWeight="bold"
                                            variant="h5"
                                        >
                                            {i18next.t('acquired-score')}:{' '}
                                            {satisfiedRequirement(
                                                sortedCourses[category]
                                            )
                                                ? getMaxScoreECTS(
                                                      sortedCourses[category]
                                                  )
                                                : 0}
                                            {' / '}
                                            {getMaxScoreECTS(
                                                sortedCourses[category]
                                            )}
                                        </Typography>
                                    ) : null}
                                </Stack>
                            </Box>

                            {/* Sorted Courses */}
                            {sortedCourses[category].length > 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={2}
                                    sx={{ mb: 3 }}
                                >
                                    <Box
                                        alignItems="center"
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <Box sx={{ ml: 2 }}>
                                            <Typography variant="body1">
                                                {i18next.t(
                                                    'ects-conversion-rate'
                                                )}
                                                :{factor}x
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Box
                                                alignItems="center"
                                                display="flex"
                                            >
                                                <FlagIcon
                                                    style={{
                                                        marginRight: '8px'
                                                    }}
                                                />
                                                <Typography
                                                    style={{
                                                        fontWeight: 'normal',
                                                        color: 'inherit'
                                                    }}
                                                >
                                                    {i18next.t('required-ects')}
                                                    :{' '}
                                                    {requiredECTS(
                                                        sortedCourses[category]
                                                    )}
                                                </Typography>
                                            </Box>
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                justifyContent="flex-end"
                                            >
                                                {satisfiedRequirement(
                                                    sortedCourses[category]
                                                ) ? (
                                                    <>
                                                        <CheckCircleIcon
                                                            style={{
                                                                color: green[500]
                                                            }}
                                                        />
                                                        <Typography
                                                            style={{
                                                                fontWeight:
                                                                    'normal',
                                                                color: 'inherit'
                                                            }}
                                                        >
                                                            {i18next.t(
                                                                'your-acquired-ects'
                                                            )}
                                                            :{' '}
                                                            {acquiredECTS(
                                                                sortedCourses[
                                                                    category
                                                                ]
                                                            )}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <WarningIcon
                                                            style={{
                                                                color: 'red'
                                                            }}
                                                        />
                                                        <Typography
                                                            style={{
                                                                fontWeight:
                                                                    'bold',
                                                                color: 'red'
                                                            }}
                                                        >
                                                            {i18next.t(
                                                                'your-acquired-ects'
                                                            )}
                                                            :{' '}
                                                            {acquiredECTS(
                                                                sortedCourses[
                                                                    category
                                                                ]
                                                            )}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>
                                    <CourseTable
                                        data={sortedCourses[category]?.slice(
                                            0,
                                            -1
                                        )}
                                        tableKey={category}
                                    />
                                </Box>
                            ) : null}

                            {/* Suggested Courses */}
                            {suggestedCourses[category] &&
                            suggestedCourses[category].length > 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={2}
                                >
                                    <Typography variant="h6">
                                        {i18next.t('Suggested Courses', {
                                            ns: 'courses'
                                        })}
                                    </Typography>
                                    <Typography variant="body1">
                                        {suggestedCourses[category]
                                            .map(
                                                (sug: Record<string, string>) =>
                                                    sug['建議修課']
                                            )
                                            .filter((sug: string) => sug)
                                            .join('， ')}
                                    </Typography>
                                </Box>
                            ) : null}
                        </Paper>
                    ))}
                </Grid>
                <Grid item md={6} xs={12}>
                    <Card sx={{ height: 300, mb: 1 }}>
                        <CardHeader
                            subheader="Course requirement covergage for this program"
                            title="Course Matching Score"
                        />
                        <CardContent>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <Gauge
                                    {...settings}
                                    endAngle={110}
                                    startAngle={-110}
                                    sx={{
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 40,
                                            transform: 'translate(0px, 0px)'
                                        }
                                    }}
                                    text={({ value }) => `${value}%`}
                                    value={matchingOverallECTSPercentage.toFixed(
                                        0
                                    )}
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                    {firstRoundConsidered &&
                    firstRoundConsidered?.length > 0 ? (
                        <EstimationCard
                            academic_background={academic_background}
                            directAd={DIRECT_ADMISSION_SCORE}
                            directRej={DIRECT_REJECTION_SCORE}
                            round={firstRoundConsidered}
                            scores={scores}
                            sortedCourses={sortedCourses}
                            stage={1}
                            subtitle="Basic Academic background check"
                        />
                    ) : null}
                    {secondRoundConsidered &&
                    secondRoundConsidered?.length > 0 ? (
                        <EstimationCard
                            academic_background={academic_background}
                            directAd={DIRECT_ADMISSION_SECOND_SCORE}
                            directRej={DIRECT_REJECTION_SECOND_SCORE}
                            round={secondRoundConsidered}
                            scores={scores}
                            sortedCourses={sortedCourses}
                            stage={2}
                            subtitle="Advanced academic background check"
                        />
                    ) : null}
                </Grid>
            </Grid>
        </>
    );
};
