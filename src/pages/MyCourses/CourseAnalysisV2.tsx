import React, {
    useState,
    useEffect,
    Fragment,
    memo,
    useCallback,
    useMemo
} from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Select,
    MenuItem,
    TableContainer,
    TableBody,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Grid,
    Stack,
    Card,
    CardHeader,
    CardContent,
    Divider,
    TableFooter,
    Collapse,
    IconButton,
    ListItem,
    Tabs,
    Tab,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    InputAdornment
} from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom, useParams } from 'react-router-dom';
import 'react-datasheet-grid/dist/style.css';
import {
    Bayerische_Formel,
    is_TaiGer_AdminAgent,
    is_TaiGer_role
} from '@taiger-common/core';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import { green } from '@mui/material/colors';
import i18next, { t } from 'i18next';
import { useTheme } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SortIcon from '@mui/icons-material/Sort';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GaugeCard from '@components/GaugeCard';
import { DataGrid } from '@mui/x-data-grid';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableViewIcon from '@mui/icons-material/TableView';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';

import {
    convertDate,
    DIRECT_ADMISSION_SCORE,
    DIRECT_ADMISSION_SECOND_SCORE,
    DIRECT_REJECTION_SCORE,
    DIRECT_REJECTION_SECOND_SCORE,
    GENERAL_SCORES_COURSE,
    GENERAL_SCORES_GPA,
    GENERAL_SCORES_GPA_BOUNDARY,
    SCORES_TYPE_OBJ
} from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { analyzedFileV2Download, WidgetanalyzedFileV2Download } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import { IStudentResponse } from '@/types/taiger-common';

// const getTop3Keywords = (keywords) => {
//     const frequencyMap = {};

//     // Count frequency of each keyword
//     for (const keyword of keywords) {
//         frequencyMap[keyword] = (frequencyMap[keyword] || 0) + 1;
//     }

//     // Convert map to array of [keyword, frequency], then sort and take top 3
//     const top3 = Object.entries(frequencyMap)
//         .sort((a, b) => b[1] - a[1]) // Sort descending by frequency
//         .slice(0, 3) // Take top 3
//         .map((entry) => entry[0]); // Return only the keyword

//     return top3;
// };

const countSuggestedCourses = (data, missingCourses) => {
    delete data.Others;
    const categories = Object.keys(data);
    for (const category of categories) {
        const list = data[category];

        for (const item of list) {
            if (item && item['建議修課']) {
                const course = item['建議修課'];
                missingCourses[course] = (missingCourses[course] || 0) + 1;
            }
        }
    }

    return missingCourses;
};

const settings = {
    display: 'flex',
    width: 150,
    height: 150
};

const acquiredECTS = (table) => {
    return table[table.length - 1].credits;
};

const requiredECTS = (table) => {
    return table[table.length - 1].requiredECTS;
};

const satisfiedRequirement = (table) => {
    return acquiredECTS(table) >= requiredECTS(table);
};

const getMaxScoreECTS = (table) => {
    return table[table.length - 1].maxScore || 0;
};

/** Row in CourseTable: dynamic course name key (tableKey) plus credits and grades */
export interface CourseTableRow {
    credits?: number | string;
    grades?: string;
    [courseNameKey: string]: string | number | undefined;
}

interface CourseTableProps {
    data?: CourseTableRow[];
    tableKey?: string;
}
const CourseTable = ({ data = [], tableKey }: CourseTableProps) => {
    return (
        <TableContainer style={{ overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            {i18next.t('Course', {
                                ns: 'common'
                            })}
                        </TableCell>
                        <TableCell>
                            {i18next.t('Credits', {
                                ns: 'common'
                            })}
                        </TableCell>
                        <TableCell>
                            {i18next.t('Grades', {
                                ns: 'common'
                            })}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((course, index) => (
                        <TableRow key={index}>
                            <TableCell>{course[tableKey]}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.grades}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const EstimationCard = ({
    round,
    sortedCourses,
    scores,
    academic_background,
    directAd,
    directRej,
    stage,
    subtitle
}) => {
    const [open, setOpen] = useState(false);

    const { Highest_GPA_Uni, Passing_GPA_Uni, My_GPA_Uni } =
        academic_background?.university
            ? academic_background.university
            : { Highest_GPA_Uni: 4.3, Passing_GPA_Uni: 1.7, My_GPA_Uni: 3 };
    let germanGPA = 3;
    if (Passing_GPA_Uni && Highest_GPA_Uni && My_GPA_Uni) {
        try {
            germanGPA = parseFloat(
                Bayerische_Formel(Highest_GPA_Uni, Passing_GPA_Uni, My_GPA_Uni)
            );
        } catch {
            germanGPA = 0;
        }
    }
    const acquiredECTS = (table) => {
        return table[table.length - 1].credits;
    };

    const requiredECTS = (table) => {
        return table[table.length - 1].requiredECTS;
    };

    const satisfiedRequirement = (table) => {
        return acquiredECTS(table) >= requiredECTS(table);
    };

    const getMaxScoreECTS = (table) => {
        return table[table.length - 1].maxScore || 0;
    };
    const getOverallCourseScoreArray = () => {
        const scoreArray = Object.keys(sortedCourses).map((category) =>
            satisfiedRequirement(sortedCourses[category])
                ? getMaxScoreECTS(sortedCourses[category])
                : 0
        );

        return scoreArray.slice(0, -1);
    };
    const getOverallCourseScorePairArray = () => {
        const scoreArray = Object.keys(sortedCourses).map((category) =>
            satisfiedRequirement(sortedCourses[category])
                ? {
                      name: category,
                      got: getMaxScoreECTS(sortedCourses[category])
                  }
                : { name: category, got: 0 }
        );

        return scoreArray.slice(0, -1);
    };

    const getOverallCourseScore = () => {
        const scoreSum = getOverallCourseScoreArray().reduce(
            (sum, current) => sum + current,
            0
        );
        return scoreSum;
    };

    const data = [];

    if (
        round.findIndex(
            (consideredScore) => consideredScore === GENERAL_SCORES_COURSE.name
        ) > -1
    ) {
        const courseScore = getOverallCourseScore();
        data.push({
            name: 'Courses Score',
            value25: courseScore,
            value50: courseScore,
            value75: courseScore,
            value100: courseScore,
            expandable: true,
            description: (
                <Box>
                    Your courses score {courseScore} is the sum
                    {getOverallCourseScorePairArray()?.map((pair, i) => (
                        <ListItem key={i}>
                            {pair.name}: {pair.got}
                        </ListItem>
                    ))}
                </Box>
            )
        });
    }
    round
        .filter(
            (consideredScore) =>
                ![GENERAL_SCORES_COURSE.name, GENERAL_SCORES_GPA.name].includes(
                    consideredScore
                )
        )
        .forEach((consideredScore) => {
            data.push({
                name: SCORES_TYPE_OBJ[consideredScore]?.label,
                value25: scores[consideredScore] * 0.25,
                value50: scores[consideredScore] * 0.5,
                value75: scores[consideredScore] * 0.75,
                value100: scores[consideredScore]
            });
        });

    if (
        round.findIndex(
            (consideredScore) => consideredScore === GENERAL_SCORES_GPA.name
        ) > -1
    ) {
        const gpaMaxScore = scores[GENERAL_SCORES_GPA.name];
        const gpaMinimum = scores[GENERAL_SCORES_GPA_BOUNDARY.name];
        let gpaScore = 0;
        if (gpaMinimum - germanGPA > 0) {
            gpaScore = Math.round(
                ((gpaMinimum - germanGPA) * gpaMaxScore) / (gpaMinimum - 1)
            );
        }
        data.push({
            name: `Your German GPA ${germanGPA}`,
            value25: gpaScore, //TODO
            value50: gpaScore,
            value75: gpaScore,
            value100: gpaScore,
            expandable: true,
            description: (
                <Box>
                    You get {gpaScore} is based on the your German {germanGPA}.
                    If your German GPA is 1.0, you will get max. score{' '}
                    {gpaMaxScore} and get 0 if your German GPA worse than{' '}
                    {gpaMinimum}
                </Box>
            )
        });
    }
    const columnSums = ['value25', 'value50', 'value75', 'value100'].map(
        (key) => data.reduce((sum, row) => sum + row[key], 0)
    );

    return (
        <Card sx={{ mb: 1 }}>
            <CardHeader
                subheader={`${subtitle}`}
                title={`Stage ${stage} Evaluation`}
            />
            <CardContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Evaluation</TableCell>
                                <TableCell align="right">
                                    Pessimistic (25%)
                                </TableCell>
                                <TableCell align="right">50%</TableCell>
                                <TableCell align="right">75%</TableCell>
                                <TableCell align="right">
                                    Optimistic (100%)
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, index) => (
                                <Fragment key={index}>
                                    <TableRow
                                        sx={{
                                            '& > *': {
                                                borderBottom: row.expandable
                                                    ? 'unset'
                                                    : ''
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            {row.expandable ? (
                                                <IconButton
                                                    aria-label="expand row"
                                                    onClick={() =>
                                                        setOpen(!open)
                                                    }
                                                    size="small"
                                                >
                                                    {open ? (
                                                        <KeyboardArrowUpIcon />
                                                    ) : (
                                                        <KeyboardArrowDownIcon />
                                                    )}
                                                </IconButton>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="right">
                                            {row.value25}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.value50}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.value75}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.value100}
                                        </TableCell>
                                    </TableRow>
                                    {row.expandable ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                style={{
                                                    paddingBottom: 0,
                                                    paddingTop: 0
                                                }}
                                            >
                                                <Collapse
                                                    in={open}
                                                    timeout="auto"
                                                    unmountOnExit
                                                >
                                                    <Box sx={{ margin: 1 }}>
                                                        <Typography
                                                            component="div"
                                                            gutterBottom
                                                        >
                                                            {row.description}
                                                        </Typography>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </Fragment>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell />
                                <TableCell>Total</TableCell>
                                {columnSums.map((sum, index) => (
                                    <TableCell align="right" key={index}>
                                        {sum}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
                <Divider />
                <Typography>
                    {directAd.label} : {scores[directAd.name]}
                </Typography>
                <Typography>
                    {directRej.label} : {scores[directRej.name]}
                </Typography>
                <Typography>
                    If your total score is higer than {scores[directAd.name]},
                    you will get directly admitted.
                </Typography>
                <Typography>
                    If your total score is loewer than {scores[directRej.name]},
                    you will get directly rejected.
                </Typography>
                {scores[directRej.name] !== scores[directAd.name] &&
                scores[directAd.name] !== 0 ? (
                    <Typography>
                        If your total score is between {scores[directAd.name]}{' '}
                        and {scores[directRej.name]}, you will get to next round
                        evalution.
                    </Typography>
                ) : null}
            </CardContent>
        </Card>
    );
};

export const CourseAnalysisComponent = ({
    factor,
    sheet,
    student,
    onBackToOverview,
    currentProgram,
    programs,
    onProgramChange
}) => {
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
                                    {programs.map((program, index) => (
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
                                    ))}
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
                                            .map((sug) => sug['建議修課'])
                                            .filter((sug) => sug)
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

const allRequiredECTSCrossPrograms = (programSheetsArray) => {
    let sum = 0;
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const sortedCourses = programSheetsArray[i]?.value?.sorted;
        sum += Object.keys(sortedCourses)
            ?.map((category) =>
                category !== 'Others'
                    ? requiredECTS(sortedCourses[category])
                    : 0
            )
            ?.reduce((sum, i) => sum + i, 0);
    }
    return sum;
};

const allMissCoursesCrossPrograms = (programSheetsArray) => {
    let missingCourses = {};
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const suggestionCourses = programSheetsArray[i]?.value?.suggestion;
        missingCourses = countSuggestedCourses(
            suggestionCourses,
            missingCourses
        );
    }
    return missingCourses;
};

const allAcquiredECTSCrossPrograms = (programSheetsArray) => {
    let sum = 0;
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const sortedCourses = programSheetsArray[i]?.value?.sorted;
        sum += Object.keys(sortedCourses)
            ?.map((category) =>
                category !== 'Others'
                    ? acquiredECTS(sortedCourses[category]) >
                      requiredECTS(sortedCourses[category])
                        ? requiredECTS(sortedCourses[category])
                        : acquiredECTS(sortedCourses[category])
                    : 0
            )
            ?.reduce((sum, i) => sum + i, 0);
    }
    return sum;
};

const GPACard = memo(({ student, myGermanGPA }) => {
    const theme = useTheme();
    const university = student?.academic_background?.university || {};

    const getGradeColor = (gpa) => {
        if (!gpa) return theme.palette.text.secondary;
        if (gpa <= 1.5) return theme.palette.success.main;
        if (gpa <= 2.5) return theme.palette.info.main;
        if (gpa <= 3.5) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const getGradeLabel = (gpa) => {
        if (!gpa) return 'N/A';
        if (gpa <= 1.5) return '(Sehr gut)';
        if (gpa <= 2.5) return '(Gut)';
        if (gpa <= 3.5) return '(Befriedigend)';
        return '(Ausreichend)';
    };

    return (
        <Card>
            <CardHeader
                sx={{ pb: 1 }}
                title="GPA Information"
                titleTypography={{ variant: 'h6', fontWeight: 'medium' }}
            />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Box>
                            <Typography
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontSize: '0.875rem', mb: 0.5 }}
                                variant="subtitle2"
                            >
                                My GPA
                            </Typography>
                            <Stack
                                alignItems="baseline"
                                direction="row"
                                spacing={1}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '2rem',
                                        fontWeight: 'medium',
                                        lineHeight: 1
                                    }}
                                    variant="h4"
                                >
                                    {university?.My_GPA_Uni || 'N/A'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                    variant="body1"
                                >
                                    / {university?.Highest_GPA_Uni || '-'}
                                </Typography>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                Passing Grade:{' '}
                                {university?.Passing_GPA_Uni || '-'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box>
                            <Typography
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontSize: '0.875rem', mb: 0.5 }}
                                variant="subtitle2"
                            >
                                German GPA Equivalent
                            </Typography>
                            <Stack
                                alignItems="baseline"
                                direction="row"
                                spacing={1}
                            >
                                <Typography
                                    color={getGradeColor(myGermanGPA)}
                                    sx={{
                                        fontSize: '2rem',
                                        fontWeight: 'medium',
                                        lineHeight: 1
                                    }}
                                >
                                    {myGermanGPA || 'N/A'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                    variant="body1"
                                >
                                    {getGradeLabel(myGermanGPA)}
                                </Typography>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                German Scale: 1.0 (Best) - 4.0 (Passing)
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                1.0-1.5: Excellent | 1.6-2.5: Good | 2.6-3.5:
                                Satisfactory | 3.6-4.0: Sufficient
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});
GPACard.displayName = 'GPACard';

const ProgramMatchingScores = memo(
    ({ programSheetsArray, onProgramSelect }) => {
        const theme = useTheme();
        const [viewMode, setViewMode] = useState('cards');
        const [pageSize, setPageSize] = useState(10);
        const [searchText, setSearchText] = useState('');

        const handleViewChange = (event, newView) => {
            if (newView !== null) {
                setViewMode(newView);
            }
        };

        const calculateProgramMatchingScore = (sortedCourses) => {
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
            return requiredects > 0 ? (acquiredects * 100) / requiredects : 0;
        };

        const calculateRequiredECTS = (sortedCourses) => {
            return Object.keys(sortedCourses).reduce(
                (sum, category) => sum + requiredECTS(sortedCourses[category]),
                0
            );
        };

        const calculateAcquiredECTS = (sortedCourses) => {
            return Object.keys(sortedCourses).reduce(
                (sum, category) =>
                    sum +
                    (satisfiedRequirement(sortedCourses[category])
                        ? requiredECTS(sortedCourses[category])
                        : acquiredECTS(sortedCourses[category])),
                0
            );
        };

        const getScoreColor = (score) => {
            if (score >= 75) return theme.palette.primary.main;
            if (score >= 50) return theme.palette.success.main;
            return theme.palette.error.main;
        };

        const getECTSColor = (acquired, required) => {
            const percentage = (acquired / required) * 100;
            if (percentage >= 100) return theme.palette.success.main;
            if (percentage >= 75) return theme.palette.primary.main;
            if (percentage >= 50) return theme.palette.warning.main;
            return theme.palette.error.main;
        };

        const columns = [
            {
                field: 'programName',
                headerName: 'Program Name',
                flex: 2,
                minWidth: 280,
                renderCell: (params) => (
                    <Link
                        component="button"
                        onClick={() => onProgramSelect(params.row.index)}
                        sx={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        {params.value}
                    </Link>
                )
            },
            {
                field: 'matchingScore',
                headerName: 'Matching Score',
                flex: 1,
                minWidth: 150,
                type: 'number',
                renderCell: (params) => {
                    const score = params.value;
                    return (
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Box
                                sx={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: getScoreColor(score),
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            >
                                {score}%
                            </Box>
                            <Box>
                                {score >= 75
                                    ? 'Excellent Match'
                                    : score >= 50
                                      ? 'Good Match'
                                      : 'Low Match'}
                            </Box>
                        </Box>
                    );
                },
                sortComparator: (v1, v2) => Number(v1) - Number(v2)
            },
            {
                field: 'ectsProgress',
                headerName: 'ECTS Progress',
                flex: 1.5,
                minWidth: 200,
                renderCell: (params) => {
                    const acquired = params.row.acquiredECTS;
                    const required = params.row.requiredECTS;
                    const percentage = Math.min(
                        100,
                        (acquired / required) * 100
                    );

                    return (
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                justifyContent: 'center',
                                height: '100%'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%'
                                }}
                            >
                                <Typography
                                    color={getECTSColor(acquired, required)}
                                    sx={{ fontWeight: 'medium' }}
                                    variant="body2"
                                >
                                    {acquired} / {required} ECTS
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {percentage.toFixed(0)}%
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: '100%',
                                    bgcolor: 'background.neutral',
                                    borderRadius: 1,
                                    height: 6
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        borderRadius: 1,
                                        bgcolor: getECTSColor(
                                            acquired,
                                            required
                                        ),
                                        transition: 'width 0.5s ease-in-out'
                                    }}
                                />
                            </Box>
                        </Box>
                    );
                }
            }
        ];

        const rows = programSheetsArray.map(
            (
                {
                    key,
                    value
                }: { key: string; value: { sorted: Record<string, unknown> } },
                index: number
            ) => {
                const requiredECTS = calculateRequiredECTS(value.sorted);
                const acquiredECTS = calculateAcquiredECTS(value.sorted);
                return {
                    id: index,
                    index: index,
                    programName: key,
                    matchingScore: Number(
                        calculateProgramMatchingScore(value.sorted)
                    ).toFixed(0),
                    requiredECTS,
                    acquiredECTS
                };
            }
        );

        const filteredRows = searchText
            ? rows.filter(
                  (row) =>
                      row.programName
                          .toLowerCase()
                          .includes(searchText.toLowerCase()) ||
                      row.matchingScore.toString().includes(searchText) ||
                      row.requiredECTS.toString().includes(searchText) ||
                      row.acquiredECTS.toString().includes(searchText)
              )
            : rows;

        return (
            <Card>
                <CardHeader
                    action={
                        <Stack alignItems="center" direction="row" spacing={2}>
                            {viewMode === 'table' && (
                                <Box sx={{ width: 250 }}>
                                    <TextField
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                        fullWidth
                                        onChange={(e) =>
                                            setSearchText(e.target.value)
                                        }
                                        placeholder="Search programs..."
                                        size="small"
                                        value={searchText}
                                    />
                                </Box>
                            )}
                            <ToggleButtonGroup
                                exclusive
                                onChange={handleViewChange}
                                size="small"
                                value={viewMode}
                            >
                                <ToggleButton
                                    aria-label="cards view"
                                    value="cards"
                                >
                                    <ViewModuleIcon />
                                </ToggleButton>
                                <ToggleButton
                                    aria-label="table view"
                                    value="table"
                                >
                                    <TableViewIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    }
                    subheader="Course requirement coverage for each analyzed program"
                    title="Program-wise Matching Scores"
                    titleTypography={{ variant: 'h6', fontWeight: 'medium' }}
                />
                <CardContent sx={{ pb: 3 }}>
                    {viewMode === 'cards' ? (
                        <Grid container spacing={3}>
                            {programSheetsArray.map(({ key, value }, index) => {
                                const score = Number(
                                    calculateProgramMatchingScore(value.sorted)
                                ).toFixed(0);
                                return (
                                    <Grid
                                        item
                                        key={key}
                                        lg={3}
                                        md={4}
                                        sm={6}
                                        xs={12}
                                    >
                                        <GaugeCard
                                            onClick={() =>
                                                onProgramSelect(index)
                                            }
                                            score={score}
                                            settings={settings}
                                            subtitle="Click to view details"
                                            title={key}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Box sx={{ height: 600, width: '100%' }}>
                            <DataGrid
                                columns={columns}
                                density="comfortable"
                                disableSelectionOnClick
                                initialState={{
                                    sorting: {
                                        sortModel: [
                                            {
                                                field: 'matchingScore',
                                                sort: 'desc'
                                            }
                                        ]
                                    }
                                }}
                                onPageSizeChange={(newPageSize) =>
                                    setPageSize(newPageSize)
                                }
                                onRowClick={(params) =>
                                    onProgramSelect(params.row.index)
                                }
                                pageSize={pageSize}
                                rows={filteredRows}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                sx={{
                                    '& .MuiDataGrid-cell:focus': {
                                        outline: 'none'
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: 'action.hover',
                                        cursor: 'pointer'
                                    },
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: 'background.neutral',
                                        borderRadius: 1
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: `1px solid ${theme.palette.divider}`
                                    }
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    }
);
ProgramMatchingScores.displayName = 'ProgramMatchingScores';

interface GeneralCourseAnalysisComponentProps {
    sheets: Record<string, Record<string, Record<string, string[]>>>;
    student: IStudentResponse;
    onProgramSelect: (index: number) => void;
}

export const GeneralCourseAnalysisComponent = ({
    sheets,
    student,
    onProgramSelect
}: GeneralCourseAnalysisComponentProps) => {
    const [tabTag, setTabTag] = useState(0);
    const theme = useTheme();

    const handleTabChange = useCallback((event, newValue) => {
        setTabTag(newValue);
    }, []);

    const programSheetsArray = useMemo(
        () =>
            Object.entries(sheets)
                .filter(([key]) => !['General'].includes(key))
                .map(([key, value]) => ({ key, value })),
        [sheets]
    );

    const generalSheetKeysArray = useMemo(
        () => Object.keys(sheets?.General || {}),
        [sheets?.General]
    );

    const myGermanGPA = useMemo(
        () =>
            Bayerische_Formel(
                student?.academic_background?.university?.Highest_GPA_Uni,
                student?.academic_background?.university?.Passing_GPA_Uni,
                student?.academic_background?.university?.My_GPA_Uni
            ),
        [student?.academic_background?.university]
    );

    const matchingOverallECTSPercentage = useMemo(() => {
        const required = allRequiredECTSCrossPrograms(programSheetsArray);
        return required > 0
            ? (allAcquiredECTSCrossPrograms(programSheetsArray) * 100) /
                  required
            : 0;
    }, [programSheetsArray]);

    const missingCoursesRanking = useMemo(() => {
        const missing_courses_ranking =
            allMissCoursesCrossPrograms(programSheetsArray);
        return missing_courses_ranking;
    }, [programSheetsArray]);
    // can you sort by value to get the top 3 courses of missingCoursesRanking? also show number of courses
    const topMissingCourses = useMemo(() => {
        return Object.entries(missingCoursesRanking)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([course, count]) => ({ course, count }));
    }, [missingCoursesRanking]);

    const numPrograms = useMemo(
        () =>
            Object.entries(sheets).filter(([key]) => !['General'].includes(key))
                ?.length,
        [sheets]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                aria-label="Course analysis tabs"
                onChange={handleTabChange}
                scrollButtons="auto"
                sx={{
                    mb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                        minWidth: 120,
                        fontWeight: 'medium',
                        minHeight: 40,
                        py: 0.5
                    },
                    '& .MuiTab-iconWrapper': {
                        marginRight: 1,
                        marginBottom: '0 !important'
                    }
                }}
                value={tabTag}
                variant="scrollable"
            >
                <Tab
                    label={i18next.t('Overview', { ns: 'courses' })}
                    {...a11yProps(tabTag, 0)}
                    icon={<AssessmentIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                />
                <Tab
                    label="Course Sorting"
                    {...a11yProps(tabTag, 1)}
                    icon={<SortIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                />
            </Tabs>

            <CustomTabPanel index={0} value={tabTag}>
                <Grid container spacing={2}>
                    <Grid item md={3} xs={12}>
                        <Card sx={{ height: 280 }}>
                            <CardHeader
                                subheader="Total number of programs being analyzed"
                                title="Analyzed Programs"
                                titleTypography={{
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }}
                            />
                            <CardContent>
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={2}
                                    sx={{ height: '100%' }}
                                >
                                    <Typography
                                        color="primary"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '4rem'
                                        }}
                                        variant="h1"
                                    >
                                        {numPrograms}
                                    </Typography>
                                    <Typography
                                        align="center"
                                        color="text.secondary"
                                        variant="subtitle1"
                                    >
                                        {numPrograms === 1
                                            ? 'Program'
                                            : 'Programs'}{' '}
                                        Analyzed
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <GaugeCard
                            CardHeaderProps={{
                                titleTypography: {
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }
                            }}
                            score={Number(
                                matchingOverallECTSPercentage
                            ).toFixed(0)}
                            settings={settings}
                            subtitle="Average course requirement coverage across all programs"
                            sx={{ height: 280 }}
                            title="Overall Matching Score"
                        />
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <GPACard myGermanGPA={myGermanGPA} student={student} />
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Card sx={{ height: 280, overflowY: 'auto' }}>
                            <CardHeader
                                title="Top Missing Courses"
                                titleTypography={{
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }}
                            />
                            <CardContent>
                                <Box
                                    sx={{
                                        height: 'calc(100% - 48px)',
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#888',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: '#555'
                                            }
                                        }
                                    }}
                                >
                                    {topMissingCourses.map((course) => (
                                        <Typography
                                            key={course.course}
                                            sx={{
                                                py: 0.5,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                        >
                                            {course.course} ({course.count})
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <ProgramMatchingScores
                            onProgramSelect={onProgramSelect}
                            programSheetsArray={programSheetsArray}
                        />
                    </Grid>
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel index={1} value={tabTag}>
                <Grid container spacing={3}>
                    {generalSheetKeysArray?.map((keyName) => (
                        <Grid item key={keyName} xs={12}>
                            <Card
                                elevation={2}
                                sx={{
                                    p: 3,
                                    '&:hover': {
                                        boxShadow: theme.shadows[4]
                                    },
                                    transition: 'box-shadow 0.3s ease-in-out'
                                }}
                            >
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    {sheets.General?.[keyName][0][keyName]}
                                </Typography>
                                <CourseTable
                                    data={sheets.General?.[keyName] || []}
                                    tableKey="courses"
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CustomTabPanel>
        </Box>
    );
};

export default function CourseAnalysisV2() {
    const { user_id } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [value, setValue] = useState(0);
    const [sheetName, setSheetName] = useState('General');
    const [statedata, setStatedata] = useState({
        error: '',
        isLoaded: false,
        sheets: {},
        sheetNames: [],
        success: false,
        student: null,
        excel_file: {},
        studentId: '',
        file: '',
        isDownloading: false,
        LastModified: '',
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });
    useEffect(() => {
        const downloadFn = window.location.href.includes('internal')
            ? WidgetanalyzedFileV2Download
            : analyzedFileV2Download; // Get the full URI
        downloadFn(user_id).then(
            (resp) => {
                const { success, json, student } = resp.data;
                if (success) {
                    const timestamp = json['timestamp'];
                    delete json['timestamp'];
                    const factor = json['factor'];
                    delete json['factor'];
                    setStatedata((prevState) => ({
                        ...prevState,
                        sheetNames: Object.keys(json),
                        sheets: json,
                        factor,
                        student,
                        isLoaded: true,
                        timestamp
                    }));
                    setSheetName('General');
                } else {
                    const { statusText } = resp;
                    setStatedata((state) => ({
                        ...state,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: statusText
                    }));
                }
            },
            (error) => {
                setStatedata((state) => ({
                    ...state,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    }, [user_id]);

    const handleProgramChange = useCallback(
        (event) => {
            const selectedIndex = event.target.value + 1;
            setValue(selectedIndex);
            setSheetName(statedata.sheetNames[selectedIndex]);
        },
        [statedata.sheetNames]
    );

    const handleProgramSelect = useCallback(
        (index) => {
            const selectedIndex = index + 1;
            setValue(selectedIndex);
            setSheetName(statedata.sheetNames[selectedIndex]);
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [statedata.sheetNames]
    );

    const handleBackToOverview = useCallback(() => {
        setValue(0);
        setSheetName('General');
    }, []);

    const ConfirmError = () => {
        setStatedata((state) => ({
            ...state,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    if (!statedata?.isLoaded) {
        return <Loading />;
    }
    const student_name = `${statedata.student?.firstname} ${statedata.student?.lastname}`;
    TabTitle(`Student ${student_name} || Courses Analysis`);
    if (statedata.res_status >= 400) {
        return <ErrorPage res_status={statedata.res_status} />;
    }

    return (
        <Box>
            {statedata.res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={statedata.res_modal_message}
                    res_modal_status={statedata.res_modal_status}
                />
            ) : null}
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                {!window.location.href.includes('internal') &&
                is_TaiGer_role(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            statedata.student?._id?.toString(),
                            DEMO.PROFILE_HASH
                        )}`}
                        underline="hover"
                    >
                        {student_name}
                    </Link>
                ) : null}
                {window.location.href.includes('internal') ? (
                    <Typography>{t('Tools', { ns: 'common' })}</Typography>
                ) : null}
                {window.location.href.includes('internal') ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.INTERNAL_WIDGET_COURSE_ANALYSER_LINK}`}
                        underline="hover"
                    >
                        {t('Course Analyser', { ns: 'common' })}
                    </Link>
                ) : null}
                {!window.location.href.includes('internal') ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.COURSES_INPUT_LINK(statedata.student?._id?.toString())}`}
                        underline="hover"
                    >
                        {t('My Courses')}
                    </Link>
                ) : null}
                <Typography color="text.primary">
                    {t('Courses Analysis')}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.primary" sx={{ pt: 2 }} variant="h6">
                    {t('Courses Analysis')}
                </Typography>
                {is_TaiGer_AdminAgent(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        sx={{ mr: 1 }}
                        to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                            statedata.student._id.toString()
                        )}`}
                        underline="hover"
                    >
                        <Button
                            color="primary"
                            size="small"
                            startIcon={<MessageIcon />}
                            variant="contained"
                        >
                            <b>{t('Message', { ns: 'common' })}</b>
                        </Button>
                    </Link>
                ) : null}
            </Box>
            {sheetName === 'General' ? (
                <GeneralCourseAnalysisComponent
                    onProgramSelect={handleProgramSelect}
                    sheets={statedata.sheets}
                    student={statedata.student}
                />
            ) : null}
            {sheetName !== 'General' ? (
                <CourseAnalysisComponent
                    currentProgram={value}
                    factor={statedata.factor}
                    onBackToOverview={handleBackToOverview}
                    onProgramChange={handleProgramChange}
                    programs={statedata.sheetNames.filter(
                        (name) => name !== 'General'
                    )}
                    sheet={statedata.sheets?.[sheetName]}
                    student={statedata.student}
                />
            ) : null}
            {t('Last update', { ns: 'common' })}{' '}
            {convertDate(statedata.timestamp)}
        </Box>
    );
}
