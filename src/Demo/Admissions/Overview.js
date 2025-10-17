import React, { useMemo } from 'react';
import { Box, Card, CardHeader, Divider, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { MuiDataGrid } from '../../components/MuiDataGrid';
import Loading from '../../components/Loading/Loading';
import { getActiveStudentsQuery } from '../../api/query';

// Helper to safely extract program object from an application
const getProgram = (app) => {
    if (!app) return null;
    const prog = app.program;
    if (prog && !Array.isArray(prog)) return prog; // object form
    if (Array.isArray(prog) && prog.length > 0) return prog[0]; // array form
    return null;
};

const Overview = () => {
    const { t } = useTranslation();

    // Fetch all active students (not archived)
    const { data, isLoading } = useQuery(
        getActiveStudentsQuery(queryString.stringify({ archiv: false }))
    );

    const students = data?.data || [];

    // Flatten all applications for simpler aggregation
    const applications = useMemo(() => {
        const apps = [];
        for (const s of students) {
            if (!Array.isArray(s?.applications)) continue;
            for (const a of s.applications) {
                const p = getProgram(a) || {};
                apps.push({
                    id: a?._id,
                    application_year: a?.application_year || 'Unknown',
                    decided: a?.decided || '-',
                    closed: a?.closed || '-',
                    admission: a?.admission || '-',
                    finalEnrolment: !!a?.finalEnrolment,
                    programId: a?.programId || p?._id,
                    school: p?.school || '',
                    program_name: p?.program_name || '',
                    degree: p?.degree || '',
                    country: (p?.country || '').toString().toUpperCase()
                });
            }
        }
        return apps;
    }, [students]);

    // Overall KPIs
    const kpis = useMemo(() => {
        let offer = 0,
            rejection = 0,
            unknown = 0,
            finalCount = 0;
        for (const a of applications) {
            if (a.admission === 'O') offer += 1;
            else if (a.admission === 'X') rejection += 1;
            else unknown += 1;
            if (a.finalEnrolment) finalCount += 1;
        }
        const total = applications.length;
        const offerRate = total
            ? ((offer / total) * 100).toFixed(1) + '%'
            : '-';
        return { total, offer, rejection, unknown, finalCount, offerRate };
    }, [applications]);

    // 1) Applications per year (offer/rejection/unknown)
    const byYearRows = useMemo(() => {
        const map = new Map();
        for (const a of applications) {
            const year = a.application_year || 'Unknown';
            const key = year;
            if (!map.has(key))
                map.set(key, {
                    year,
                    offer: 0,
                    rejection: 0,
                    unknown: 0,
                    total: 0
                });
            const row = map.get(key);
            // Categorize by admission result
            if (a.admission === 'O') row.offer += 1;
            else if (a.admission === 'X') row.rejection += 1;
            else row.unknown += 1; // includes '-' and others
            row.total += 1;
        }
        const arr = Array.from(map.values()).sort((a, b) =>
            String(a.year).localeCompare(String(b.year))
        );
        return arr.map((r) => ({
            id: r.year,
            ...r,
            offerRate: r.total
                ? ((r.offer / r.total) * 100).toFixed(1) + '%'
                : '-'
        }));
    }, [applications]);

    // Chart dataset for applications per year (stacked)
    const byYearChartDataset = useMemo(() => byYearRows, [byYearRows]);

    // 2) Top 20 applied programs result per year (offer/rejection/unknown)
    const { topProgramsRows, latestYear } = useMemo(() => {
        const map = new Map();
        for (const a of applications) {
            const year = a.application_year || 'Unknown';
            const pid = a.programId || a.program_name || 'Unknown';
            const key = `${year}__${pid}`;
            if (!map.has(key))
                map.set(key, {
                    key,
                    year,
                    programId: a.programId,
                    school: a.school,
                    program_name: a.program_name,
                    degree: a.degree,
                    offer: 0,
                    rejection: 0,
                    unknown: 0,
                    total: 0
                });
            const row = map.get(key);
            if (a.admission === 'O') row.offer += 1;
            else if (a.admission === 'X') row.rejection += 1;
            else row.unknown += 1;
            row.total += 1;
        }
        const arr = Array.from(map.values());
        // Determine the latest year among applications
        const years = Array.from(
            new Set(arr.map((r) => r.year).filter((y) => y && y !== 'Unknown'))
        );
        let latestYear = 'Unknown';
        if (years.length > 0) {
            years.sort((a, b) => String(b).localeCompare(String(a)));
            latestYear = years[0];
        }
        // Focus on the latest year for the Top 20
        const filtered = arr.filter((r) => r.year === latestYear);
        filtered.sort((a, b) => b.total - a.total);
        const top20 = filtered.slice(0, 20).map((r) => ({
            id: r.key,
            ...r,
            offerRate: r.total
                ? ((r.offer / r.total) * 100).toFixed(1) + '%'
                : '-'
        }));
        return { topProgramsRows: top20, latestYear };
    }, [applications]);

    // Latest year KPIs
    const latestYearKPIs = useMemo(() => {
        if (!latestYear || latestYear === 'Unknown')
            return { total: '-', offer: '-', offerRate: '-' };
        let offer = 0,
            total = 0;
        for (const a of applications) {
            if (a.application_year !== latestYear) continue;
            if (a.admission === 'O') offer += 1;
            total += 1;
        }
        const offerRate = total
            ? ((offer / total) * 100).toFixed(1) + '%'
            : '-';
        return { total, offer, offerRate };
    }, [applications, latestYear]);

    // Chart dataset for top programs (latest year) horizontal stacked bars
    const topProgramsChartDataset = useMemo(() => {
        return topProgramsRows.map((r) => ({
            label: `${r.school || ''} - ${r.program_name || ''}`.trim(),
            offer: r.offer,
            rejection: r.rejection,
            unknown: r.unknown,
            total: r.total
        }));
    }, [topProgramsRows]);

    // 3) Final decision count by country
    const finalByCountryRows = useMemo(() => {
        const map = new Map();
        for (const a of applications) {
            if (!a.finalEnrolment) continue;
            const country = a.country || 'UNKNOWN';
            if (!map.has(country)) map.set(country, { country, count: 0 });
            map.get(country).count += 1;
        }
        return Array.from(map.values())
            .sort((a, b) => b.count - a.count)
            .map((r, idx) => ({ id: `${r.country}-${idx}`, ...r }));
    }, [applications]);

    // Chart data for final decisions by country (pie)
    const finalByCountryChartData = useMemo(
        () =>
            finalByCountryRows.map((r) => ({
                id: r.country,
                value: r.count,
                label: r.country
            })),
        [finalByCountryRows]
    );

    // 4) Final decision count by program
    const finalByProgramRows = useMemo(() => {
        const map = new Map();
        for (const a of applications) {
            if (!a.finalEnrolment) continue;
            const key =
                a.programId || `${a.school}__${a.program_name}__${a.degree}`;
            if (!map.has(key))
                map.set(key, {
                    key,
                    programId: a.programId,
                    school: a.school,
                    program_name: a.program_name,
                    degree: a.degree,
                    country: a.country,
                    count: 0
                });
            map.get(key).count += 1;
        }
        return Array.from(map.values())
            .sort((a, b) => b.count - a.count)
            .map((r) => ({ id: r.key, ...r }));
    }, [applications]);

    // Chart dataset for final decisions by program (top 20) horizontal bars
    const finalByProgramChartDataset = useMemo(() => {
        const top = [...finalByProgramRows].slice(0, 20);
        return top.map((r) => ({
            label: `${r.school || ''} - ${r.program_name || ''}`.trim(),
            count: r.count
        }));
    }, [finalByProgramRows]);

    // Column definitions
    const yearCols = useMemo(
        () => [
            {
                field: 'year',
                headerName: t('Year', { ns: 'common' }),
                width: 100
            },
            {
                field: 'offer',
                headerName: t('Offer', { ns: 'common' }),
                width: 100
            },
            {
                field: 'rejection',
                headerName: t('Rejection', { ns: 'common' }),
                width: 110
            },
            {
                field: 'unknown',
                headerName: t('Unknown', { ns: 'common' }),
                width: 110
            },
            {
                field: 'total',
                headerName: t('Total', { ns: 'common' }),
                width: 100
            },
            {
                field: 'offerRate',
                headerName: t('Offer Rate', { ns: 'common' }),
                width: 120
            }
        ],
        [t]
    );

    const topCols = useMemo(
        () => [
            {
                field: 'year',
                headerName: t('Year', { ns: 'common' }),
                width: 90
            },
            {
                field: 'school',
                headerName: t('School', { ns: 'common' }),
                width: 240
            },
            {
                field: 'program_name',
                headerName: t('Program', { ns: 'common' }),
                width: 280
            },
            {
                field: 'degree',
                headerName: t('Degree', { ns: 'common' }),
                width: 90
            },
            {
                field: 'offer',
                headerName: t('Offer', { ns: 'common' }),
                width: 90
            },
            {
                field: 'rejection',
                headerName: t('Rejection', { ns: 'common' }),
                width: 110
            },
            {
                field: 'unknown',
                headerName: t('Unknown', { ns: 'common' }),
                width: 110
            },
            {
                field: 'total',
                headerName: t('Total', { ns: 'common' }),
                width: 90
            },
            {
                field: 'offerRate',
                headerName: t('Offer Rate', { ns: 'common' }),
                width: 110
            }
        ],
        [t]
    );

    const byCountryCols = useMemo(
        () => [
            {
                field: 'country',
                headerName: t('Country', { ns: 'common' }),
                width: 140
            },
            {
                field: 'count',
                headerName: t('Final Decisions', { ns: 'common' }),
                width: 160
            }
        ],
        [t]
    );

    const byProgramCols = useMemo(
        () => [
            {
                field: 'school',
                headerName: t('School', { ns: 'common' }),
                width: 240
            },
            {
                field: 'program_name',
                headerName: t('Program', { ns: 'common' }),
                width: 280
            },
            {
                field: 'degree',
                headerName: t('Degree', { ns: 'common' }),
                width: 90
            },
            {
                field: 'country',
                headerName: t('Country', { ns: 'common' }),
                width: 100
            },
            {
                field: 'count',
                headerName: t('Final Decisions', { ns: 'common' }),
                width: 150
            }
        ],
        [t]
    );

    if (isLoading) return <Loading />;

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }
            }}
        >
            {/* KPI summary */}
            <Card sx={{ p: 2, gridColumn: '1 / -1' }}>
                <CardHeader title={t('Key Metrics', { ns: 'common' })} />
                <Divider />
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: '1fr 1fr',
                            sm: '1fr 1fr 1fr',
                            md: '1fr 1fr 1fr 1fr',
                            lg: '1fr 1fr 1fr 1fr 1fr 1fr'
                        },
                        mt: 2
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Applications', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.total}</Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Offers', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.offer}</Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Rejections', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.rejection}</Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Unknown', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.unknown}</Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Final Decisions', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.finalCount}</Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography color="text.secondary" variant="caption">
                            {t('Offer Rate', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">{kpis.offerRate}</Typography>
                        {latestYear && latestYear !== 'Unknown' ? (
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {t(
                                    'Latest {{year}}: {{offer}}/{{total}} ({{rate}})',
                                    {
                                        ns: 'common',
                                        year: latestYear,
                                        offer: latestYearKPIs.offer,
                                        total: latestYearKPIs.total,
                                        rate: latestYearKPIs.offerRate
                                    }
                                )}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
            </Card>

            <Card sx={{ p: 2, gridColumn: '1 / -1' }}>
                <CardHeader
                    title={t(
                        'Applications per Year (Offer / Rejection / Unknown)',
                        {
                            ns: 'common'
                        }
                    )}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <BarChart
                        dataset={byYearChartDataset}
                        height={320}
                        series={[
                            {
                                dataKey: 'offer',
                                label: t('Offer', { ns: 'common' }),
                                stack: 'result'
                            },
                            {
                                dataKey: 'rejection',
                                label: t('Rejection', { ns: 'common' }),
                                stack: 'result'
                            },
                            {
                                dataKey: 'unknown',
                                label: t('Unknown', { ns: 'common' }),
                                stack: 'result'
                            }
                        ]}
                        xAxis={[{ dataKey: 'year', scaleType: 'band' }]}
                    />
                </Box>
                <MuiDataGrid columns={yearCols} rows={byYearRows} />
            </Card>

            <Card sx={{ p: 2, gridColumn: '1 / -1' }}>
                <CardHeader
                    title={t(
                        'Top 20 Applied Programs (Latest Year: {{year}})',
                        {
                            ns: 'common',
                            year: latestYear
                        }
                    )}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <BarChart
                        dataset={topProgramsChartDataset}
                        height={Math.max(
                            360,
                            topProgramsChartDataset.length * 28
                        )}
                        layout="horizontal"
                        series={[
                            {
                                dataKey: 'offer',
                                label: t('Offer', { ns: 'common' }),
                                stack: 'result'
                            },
                            {
                                dataKey: 'rejection',
                                label: t('Rejection', { ns: 'common' }),
                                stack: 'result'
                            },
                            {
                                dataKey: 'unknown',
                                label: t('Unknown', { ns: 'common' }),
                                stack: 'result'
                            }
                        ]}
                        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
                    />
                </Box>
                <MuiDataGrid columns={topCols} rows={topProgramsRows} />
            </Card>

            <Card sx={{ p: 2 }}>
                <CardHeader
                    title={t('Final Decision Count by Country', {
                        ns: 'common'
                    })}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <PieChart
                        height={320}
                        series={[
                            {
                                data: finalByCountryChartData,
                                innerRadius: 40,
                                paddingAngle: 2,
                                cornerRadius: 4
                            }
                        ]}
                    />
                </Box>
                <MuiDataGrid
                    columns={byCountryCols}
                    rows={finalByCountryRows}
                />
            </Card>

            <Card sx={{ p: 2 }}>
                <CardHeader
                    title={t('Final Decision Count by Program', {
                        ns: 'common'
                    })}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <BarChart
                        dataset={finalByProgramChartDataset}
                        height={Math.max(
                            360,
                            finalByProgramChartDataset.length * 26
                        )}
                        layout="horizontal"
                        series={[
                            {
                                dataKey: 'count',
                                label: t('Final Decisions', { ns: 'common' })
                            }
                        ]}
                        yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
                    />
                </Box>
                <MuiDataGrid
                    columns={byProgramCols}
                    rows={finalByProgramRows}
                />
            </Card>
        </Box>
    );
};

export default Overview;
