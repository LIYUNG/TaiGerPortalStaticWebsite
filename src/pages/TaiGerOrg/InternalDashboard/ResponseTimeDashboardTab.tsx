import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    Button,
    ButtonGroup,
    Box,
    Card,
    CardHeader,
    CardContent,
    Collapse,
    Divider,
    Grid,
    Link,
    Typography
} from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import {
    KeyboardReturn,
    KeyboardArrowUp,
    KeyboardArrowDown
} from '@mui/icons-material';
import { getResponseIntervalByStudent } from '@/api';

// ---------------------------------------------------------------------------
// Local type definitions
// ---------------------------------------------------------------------------

interface IntervalItem {
    interval: number;
    intervalStartAt: string | Date;
}

interface ThreadInterval {
    threadId?: string;
    intervalType?: string;
    intervals: IntervalItem[];
}

interface ApplicationInterval {
    _id: string;
    school: string;
    program_name: string;
    threadIntervals: ThreadInterval[];
}

interface StudentIntervalData {
    communicationThreadIntervals?: IntervalItem[];
    applications?: ApplicationInterval[];
}

interface ChartDataItem {
    userId: string;
    name: string;
    interval: number;
    [key: string]: string | number | Date | null | undefined;
}

interface UserBarClickPayload {
    userId: string;
    name: string;
}

interface UserAvgResponseTime {
    _id: string;
    name: string;
    avgByType: Record<string, number>;
    agents?: string[];
    editors?: string[];
}

interface TeamMemberInfo {
    firstname: string;
    lastname: string;
}

type TeamMembersMap = Record<string, TeamMemberInfo>;

interface TeamStatEntry {
    _id?: string;
    name?: string;
    avgByType: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

const editorThreadTypes = [
    'CV',
    'CV_US',
    'ML',
    'RL_A',
    'SOP',
    'PHS',
    'RL_B',
    'RL_C',
    'Essay'
];
const agentThreadTypes = ['communication', 'Supplementary_Form'];

const getIntervalAvg = (
    intervals: { interval: number }[] | undefined
): number => {
    if (!intervals) return 0;
    const sumInterval = intervals?.reduce(
        (acc: number, item: { interval: number }) => acc + item?.interval,
        0
    );
    const averageInterval = sumInterval / intervals?.length;
    return averageInterval;
};

const responseTimeToChartData = (
    responseTime: UserAvgResponseTime[],
    threadType: string
): ChartDataItem[] => {
    return responseTime
        ?.filter((user: UserAvgResponseTime) => user?.avgByType?.[threadType])
        ?.map((user: UserAvgResponseTime) => ({
            userId: user?._id,
            name: user?.name,
            interval: Number(user?.avgByType?.[threadType]?.toFixed(2))
        }));
};

const calculateAveragesByType = (
    data: UserAvgResponseTime[]
): Record<string, number> => {
    const avgByType = data.reduce(
        (
            acc: Record<string, { sum: number; count: number }>,
            item: UserAvgResponseTime
        ) => {
            for (const [key, value] of Object.entries(item.avgByType)) {
                if (!acc[key]) {
                    acc[key] = { sum: 0, count: 0 };
                }
                acc[key].sum += value as number;
                acc[key].count += 1;
            }
            return acc;
        },
        {}
    );

    return Object.fromEntries(
        Object.entries(avgByType).map(
            ([key, val]: [string, { sum: number; count: number }]) => [
                key,
                val.sum / val.count
            ]
        )
    );
};

const getTeamStats = (
    studentAvgResponseTime: UserAvgResponseTime[],
    teamType: string
): Record<string, TeamStatEntry> => {
    const groupStats = studentAvgResponseTime.reduce(
        (
            acc: Record<string, UserAvgResponseTime[]>,
            student: UserAvgResponseTime
        ) => {
            const teamField = student?.[teamType as 'agents' | 'editors'];
            const userId = teamField?.[0];
            if (!userId) return acc;
            if (!acc[userId]) {
                acc[userId] = [];
            }
            acc[userId].push(student);
            return acc;
        },
        {}
    );

    const averages: Record<string, TeamStatEntry> = Object.fromEntries(
        Object.entries(groupStats).map(
            ([key, array]: [string, UserAvgResponseTime[]]) => [
                key,
                { avgByType: calculateAveragesByType(array) }
            ]
        )
    );

    return averages;
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface ResponseTimeBarChartProps {
    chartData: ChartDataItem[];
    onBarClick: (payload: UserBarClickPayload) => void;
}

const ResponseTimeBarChart: React.FC<ResponseTimeBarChartProps> = ({
    chartData,
    onBarClick
}) => {
    return (
        <BarChart
            dataset={chartData}
            height={400}
            margin={{ top: 20, right: 30, left: 50, bottom: 110 }}
            onItemClick={(_event, barItemIdentifier) => {
                onBarClick({
                    userId: chartData[barItemIdentifier.dataIndex]?.userId,
                    name: chartData[barItemIdentifier.dataIndex]?.name
                });
            }}
            series={[{ dataKey: 'interval' }]}
            xAxis={[
                {
                    dataKey: 'name',
                    scaleType: 'band',
                    tickLabelStyle: {
                        angle: -90,
                        textAnchor: 'end'
                    }
                }
            ]}
            yAxis={[{ label: 'Average duration (days)' }]}
        />
    );
};

interface ChartOverviewProps {
    data: TeamStatEntry[] | UserAvgResponseTime[];
    teamType: string;
    onBarClick: (payload: UserBarClickPayload) => void;
}

const ChartOverview: React.FC<ChartOverviewProps> = ({
    data,
    teamType,
    onBarClick
}) => {
    const threadTypes =
        teamType === 'agents' ? agentThreadTypes : editorThreadTypes;

    return (
        <>
            {threadTypes.map((fileType) => {
                const chartData = responseTimeToChartData(
                    data as UserAvgResponseTime[],
                    fileType
                );
                if (!chartData || chartData?.length === 0) return null;
                const averageInterval = getIntervalAvg(chartData);
                return (
                    <Card key={fileType} sx={{ mb: 2 }}>
                        <CardHeader
                            subheader={`Average response time: ${averageInterval.toFixed(
                                2
                            )} days`}
                            title={`${fileType} Response Times`}
                        />
                        <CardContent>
                            <ResponseTimeBarChart
                                chartData={chartData}
                                onBarClick={onBarClick}
                            />
                        </CardContent>
                    </Card>
                );
            })}
        </>
    );
};

interface TeamOverviewProps {
    studentAvgResponseTime: UserAvgResponseTime[];
    teamMembers: TeamMembersMap;
    teamType: string;
    onBarClick: (payload: UserBarClickPayload) => void;
}

const TeamOverview: React.FC<TeamOverviewProps> = ({
    studentAvgResponseTime,
    teamMembers,
    teamType,
    onBarClick
}) => {
    const teamStats = getTeamStats(studentAvgResponseTime, teamType);
    Object.keys(teamStats).forEach((userId) => {
        teamStats[userId]._id = userId;
        teamStats[userId].name = teamMembers?.[userId]?.firstname || userId;
    });

    const teamData = Object.values(teamStats);

    return (
        <ChartOverview
            data={teamData}
            onBarClick={onBarClick}
            teamType={teamType}
        />
    );
};

interface MemberOverviewProps {
    studentAvgResponseTime: UserAvgResponseTime[];
    memberId: string;
    teamType: string;
    onBarClick: (payload: UserBarClickPayload) => void;
}

const MemberOverview: React.FC<MemberOverviewProps> = ({
    studentAvgResponseTime,
    memberId,
    teamType,
    onBarClick
}) => {
    const memberStats = studentAvgResponseTime?.filter(
        (student: UserAvgResponseTime) => {
            const teamField = student?.[teamType as 'agents' | 'editors'];
            return teamField?.[0] === memberId;
        }
    );
    return (
        <ChartOverview
            data={memberStats}
            onBarClick={onBarClick}
            teamType={teamType}
        />
    );
};

interface StudentProgramOverviewProps {
    title: string;
    threadIntervals: ThreadInterval[];
    collapse?: boolean;
    [key: string]: unknown;
}

const StudentProgramOverview: React.FC<StudentProgramOverviewProps> = ({
    title,
    threadIntervals,
    collapse = false,
    ...props
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapse);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setIsCollapsed((prevOpen) => !prevOpen);
    };

    return (
        <Card sx={{ mb: 2 }} {...props}>
            <CardHeader
                onClick={handleClick}
                subheader={`Average response time: ${getIntervalAvg(
                    threadIntervals?.flatMap(
                        (thread: ThreadInterval) => thread.intervals
                    )
                ).toFixed(2)} days`}
                title={
                    <>
                        {isCollapsed ? (
                            <KeyboardArrowUp />
                        ) : (
                            <KeyboardArrowDown />
                        )}{' '}
                        {title}
                    </>
                }
            />
            <CardContent>
                <Collapse in={isCollapsed}>
                    {threadIntervals.length !== 0
                        ? threadIntervals.map((thread: ThreadInterval) => (
                              <React.Fragment key={thread.threadId}>
                                  {thread.intervalType ? (
                                      <Divider
                                          sx={{ mb: 10, px: 6 }}
                                          textAlign="left"
                                      >
                                          <Typography
                                              sx={{ px: 1 }}
                                              variant="h6"
                                          >
                                              {thread.intervalType}
                                          </Typography>
                                      </Divider>
                                  ) : null}
                                  <LineChart
                                      dataset={thread.intervals
                                          .map((item: IntervalItem) => ({
                                              ...item,
                                              intervalStartAt: new Date(
                                                  item.intervalStartAt
                                              )
                                          }))
                                          .sort(
                                              (
                                                  a: { intervalStartAt: Date },
                                                  b: { intervalStartAt: Date }
                                              ) =>
                                                  a.intervalStartAt.getTime() -
                                                  b.intervalStartAt.getTime()
                                          )}
                                      height={400}
                                      margin={{
                                          top: 20,
                                          right: 30,
                                          left: 50,
                                          bottom: 110
                                      }}
                                      series={[{ dataKey: 'interval' }]}
                                      xAxis={[
                                          {
                                              // label: thread.intervalType,
                                              dataKey: 'intervalStartAt',
                                              scaleType: 'time'
                                          }
                                      ]}
                                      yAxis={[{ label: 'Duration (days)' }]}
                                  />
                              </React.Fragment>
                          ))
                        : null}
                </Collapse>
            </CardContent>
        </Card>
    );
};

interface StudentOverviewProps {
    studentId: string;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({ studentId }) => {
    const [studentIntervals, setStudentIntervals] = useState<
        StudentIntervalData | 'error'
    >('error');
    useEffect(() => {
        if (!studentId) return;
        getResponseIntervalByStudent(studentId).then((res) => {
            if (res?.status === 200) {
                const { data } = res.data;
                setStudentIntervals(data as unknown as StudentIntervalData);
            } else {
                setStudentIntervals('error');
            }
        });
    }, [studentId]);

    return (
        <>
            {studentIntervals !== 'error' &&
            !studentIntervals?.communicationThreadIntervals &&
            studentIntervals?.applications?.length == 0 ? (
                <Typography sx={{ p: 2 }} variant="h5">
                    No data available.
                </Typography>
            ) : null}
            {studentIntervals !== 'error' &&
            studentIntervals?.communicationThreadIntervals &&
            studentIntervals.communicationThreadIntervals.length > 0 ? (
                <StudentProgramOverview
                    collapse={true}
                    key="communication"
                    threadIntervals={[
                        {
                            intervals:
                                studentIntervals?.communicationThreadIntervals
                        }
                    ]}
                    title="Communication Thread"
                />
            ) : null}
            {studentIntervals !== 'error' &&
            studentIntervals?.applications &&
            studentIntervals.applications.length > 0
                ? studentIntervals.applications.map(
                      (application: ApplicationInterval) => (
                          <StudentProgramOverview
                              key={application._id}
                              threadIntervals={application?.threadIntervals}
                              title={`${application.school} - ${application.program_name} (${application.threadIntervals.length})`}
                          />
                      )
                  )
                : null}
        </>
    );
};

interface ResponseTimeDashboardTabProps {
    studentAvgResponseTime: UserAvgResponseTime[];
    agents: TeamMembersMap;
    editors: TeamMembersMap;
}

const ResponseTimeDashboardTab: React.FC<ResponseTimeDashboardTabProps> = ({
    studentAvgResponseTime,
    agents,
    editors
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const paramViewMode = searchParams.get('mode');
    const paramMemberId = searchParams.get('member');
    const paramStudentId = searchParams.get('student');

    const teams: Record<string, TeamMembersMap> = {
        agents: agents,
        editors: editors
    };
    const modes = ['agents', 'editors'];
    const [viewMode, setViewMode] = useState(
        modes.includes(paramViewMode ?? '')
            ? (paramViewMode as string)
            : 'agents'
    );
    const teamTypeLabel = viewMode === 'agents' ? 'Agent' : 'Editor';

    const [member, setMember] = useState<UserBarClickPayload | null>(
        paramMemberId
            ? {
                  userId: paramMemberId,
                  name:
                      teams?.[viewMode]?.[paramMemberId]?.firstname ??
                      paramMemberId
              }
            : null
    );
    const [student, setStudent] = useState<UserBarClickPayload | null>(
        paramStudentId
            ? {
                  userId: paramStudentId,
                  name:
                      studentAvgResponseTime?.find(
                          (s: UserAvgResponseTime) => s._id === paramStudentId
                      )?.name ?? paramStudentId
              }
            : null
    );

    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);

        if (viewMode) {
            newParams.set('mode', viewMode);
        } else {
            newParams.delete('mode');
        }
        if (student) {
            newParams.set('student', student?.userId);
        } else {
            newParams.delete('student');
        }
        if (member) {
            newParams.set('member', member?.userId);
        } else {
            newParams.delete('member');
        }

        const currentHash = window.location.hash;
        setSearchParams(newParams);
        window.location.hash = currentHash;

        // Clear URL parameters when component unmounts or when switching tabs
        return () => {
            const currentHash = window.location.hash;
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('mode');
            newParams.delete('student');
            newParams.delete('member');
            setSearchParams(newParams);
            window.location.hash = currentHash;
        };
    }, [viewMode, student, member, searchParams, setSearchParams]);

    const onBarClickLayer1 = ({ userId, name }: UserBarClickPayload) => {
        const user = { userId, name };
        if (!teams?.[viewMode]?.[userId]) {
            return;
        }
        setMember(user);
    };
    const onBarClickLayer2 = ({ userId, name }: UserBarClickPayload) => {
        if (!userId) return;
        const user = { userId, name };
        setStudent(user);
    };

    return (
        <Grid container spacing={2}>
            {!member && !student ? (
                <>
                    <Grid item xs={12}>
                        <Box sx={{ p: 2 }}>
                            <ButtonGroup
                                aria-label="outlined primary button group"
                                variant="contained"
                            >
                                <Button
                                    onClick={() => setViewMode('agents')}
                                    variant={
                                        viewMode === 'agents'
                                            ? 'contained'
                                            : 'outlined'
                                    }
                                >
                                    Agent View
                                </Button>
                                <Button
                                    onClick={() => setViewMode('editors')}
                                    variant={
                                        viewMode === 'editors'
                                            ? 'contained'
                                            : 'outlined'
                                    }
                                >
                                    Editor View
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <TeamOverview
                            onBarClick={onBarClickLayer1}
                            studentAvgResponseTime={studentAvgResponseTime}
                            teamMembers={teams?.[viewMode]}
                            teamType={viewMode}
                        />
                    </Grid>
                </>
            ) : null}
            {member && !student ? (
                <>
                    <Grid item xs={12}>
                        <Box sx={{ p: 2 }}>
                            <Button
                                color="primary"
                                onClick={() => setMember(null)}
                                sx={{ mr: 1 }}
                            >
                                <KeyboardReturn sx={{ mr: 1 }} /> Return
                            </Button>
                            <Typography
                                component="span"
                                variant="h5"
                            >{`${teamTypeLabel} Overview - ${member?.name}`}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <MemberOverview
                            memberId={member?.userId}
                            onBarClick={onBarClickLayer2}
                            studentAvgResponseTime={studentAvgResponseTime}
                            teamType={viewMode}
                        />
                    </Grid>
                </>
            ) : null}
            {student ? (
                <Grid item xs={12}>
                    <Box sx={{ p: 2 }}>
                        <Button
                            color="primary"
                            onClick={() => setStudent(null)}
                            sx={{ mr: 1 }}
                        >
                            <KeyboardReturn sx={{ mr: 1 }} /> Return
                        </Button>
                        <Typography component="span" variant="h5">
                            {`Student Overview - `}
                            <Link
                                href={`/communications/t/${student?.userId?.toString()}`}
                                target="_blank"
                                underline="hover"
                            >
                                {student?.name}
                            </Link>
                        </Typography>
                    </Box>
                    <Grid item xs={12}>
                        <StudentOverview studentId={student?.userId} />
                    </Grid>
                </Grid>
            ) : null}
        </Grid>
    );
};

export default ResponseTimeDashboardTab;
