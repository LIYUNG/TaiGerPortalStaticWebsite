import { useState, Fragment } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Divider,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableFooter,
    Collapse,
    IconButton,
    ListItem
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Bayerische_Formel } from '@taiger-common/core';
import {
    GENERAL_SCORES_COURSE,
    GENERAL_SCORES_GPA,
    GENERAL_SCORES_GPA_BOUNDARY,
    SCORES_TYPE_OBJ
} from '@utils/contants';
import type { IStudentResponse } from '@taiger-common/model';

import type { CategorySummaryRow, ScoreEntry } from './utils';
import { satisfiedRequirement, getMaxScoreECTS } from './utils';

interface EstimationCardProps {
    round: string[];
    sortedCourses: Record<string, CategorySummaryRow[]>;
    scores: Record<string, number>;
    academic_background: IStudentResponse['academic_background'];
    directAd: ScoreEntry;
    directRej: ScoreEntry;
    stage: number;
    subtitle: string;
}

export const EstimationCard = ({
    round,
    sortedCourses,
    scores,
    academic_background,
    directAd,
    directRej,
    stage,
    subtitle
}: EstimationCardProps) => {
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
    const acquiredECTS = (table: CategorySummaryRow[]) => {
        return table[table.length - 1].credits;
    };

    const requiredECTS = (table: CategorySummaryRow[]) => {
        return table[table.length - 1].requiredECTS;
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
            (consideredScore: string) =>
                consideredScore === GENERAL_SCORES_COURSE.name
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
            (consideredScore: string) =>
                ![GENERAL_SCORES_COURSE.name, GENERAL_SCORES_GPA.name].includes(
                    consideredScore
                )
        )
        .forEach((consideredScore: string) => {
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
            (consideredScore: string) =>
                consideredScore === GENERAL_SCORES_GPA.name
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
            value25: gpaScore,
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
