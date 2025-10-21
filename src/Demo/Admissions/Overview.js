import React, { useMemo } from 'react';
import { Box, Card, CardHeader, Divider, Typography } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { Chart } from 'react-google-charts';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { MuiDataGrid } from '../../components/MuiDataGrid';
import Loading from '../../components/Loading/Loading';
import { getApplicationsQuery } from '../../api/query';
import cityCoord from './cityCoord.json';

const Overview = () => {
    const { t } = useTranslation();

    // Fetch all applications directly
    const { data, isLoading } = useQuery(
        getApplicationsQuery(queryString.stringify({}))
    );

    // get final decision applications and poplate program details
    const { data: finalData, isLoading: isFinalLoading } = useQuery(
        getApplicationsQuery(
            queryString.stringify({ finalEnrolment: true, populate: true })
        )
    );

    // Normalize final applications (populated program details)
    const finalApplications = useMemo(() => {
        const items = finalData?.data || finalData?.result || [];
        return (Array.isArray(items) ? items : []).map((a) => {
            const prog =
                a && a.programId && typeof a.programId === 'object'
                    ? a.programId
                    : null;
            return {
                id: a?._id,
                programId: prog?._id || a?.programId,
                school: a?.school || prog?.school || '',
                program_name: a?.program_name || prog?.program_name || '',
                degree: a?.degree || prog?.degree || '',
                country: (a?.country || prog?.country || '')
                    .toString()
                    .toUpperCase(),
                city: a?.city || prog?.city || '',
                zipCode: a?.zipCode || prog?.zipCode || '',
                finalEnrolment: true
            };
        });
    }, [finalData]);

    // Normalize applications to the structure used by aggregations below
    const applications = useMemo(() => {
        const items = data?.data || data?.result || [];
        return (Array.isArray(items) ? items : []).map((a) => ({
            id: a?._id,
            application_year: a?.application_year || 'Unknown',
            decided: a?.decided || '-',
            closed: a?.closed || '-',
            admission: a?.admission || '-',
            finalEnrolment: !!a?.finalEnrolment,
            programId: a?.programId,
            // Program metadata may not be present on this endpoint; default gracefully
            school: a?.school || '',
            program_name: a?.program_name || '',
            degree: a?.degree || '',
            country: (a?.country || '').toString().toUpperCase()
        }));
    }, [data]);

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
        const known = offer + rejection;
        const acceptanceRate = known
            ? ((offer / known) * 100).toFixed(1) + '%'
            : '-';
        return { total, offer, rejection, unknown, finalCount, acceptanceRate };
    }, [applications]);

    // 1) Applications per year (offer/rejection/unknown)
    const byYearRows = useMemo(() => {
        const map = new Map();
        for (const app of applications) {
            const year = app?.application_year || 'N/A';
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
            if (app.admission === 'O') row.offer += 1;
            else if (app.admission === 'X') row.rejection += 1;
            else row.unknown += 1; // includes '-' and others
            row.total += 1;
        }
        const arr = Array.from(map.values()).sort((a, b) =>
            String(a.year).localeCompare(String(b.year))
        );
        return arr.map((r) => ({
            id: r.year,
            ...r,
            acceptanceRate:
                r.offer + r.rejection > 0
                    ? ((r.offer / (r.offer + r.rejection)) * 100).toFixed(1) +
                      '%'
                    : '-'
        }));
    }, [applications]);

    // Chart dataset for applications per year (stacked)
    const byYearChartDataset = useMemo(() => byYearRows, [byYearRows]);

    // Latest year across all applications
    const latestYear = useMemo(() => {
        const years = Array.from(
            new Set(
                applications
                    .map((a) => a.application_year)
                    .filter((y) => y && y !== 'Unknown')
            )
        );
        if (years.length === 0) return 'Unknown';
        years.sort((a, b) => String(b).localeCompare(String(a)));
        return years[0];
    }, [applications]);

    // 2) Top 10 programs overall (by total applications), list per-year offer/rejection/unknown
    const { topProgramsYearRows, topProgramKeys, programLabels } =
        useMemo(() => {
            // Group strictly by programId to represent a single program
            const programTotals = new Map(); // programId -> total applications
            const programInfo = new Map(); // programId -> { programId, school, program_name, degree }
            const programYearAgg = new Map(); // programId__year -> row agg

            for (const a of applications) {
                const pid = a.programId;
                if (!pid) continue; // skip entries without a proper program id
                const year = a.application_year || 'Unknown';

                programTotals.set(pid, (programTotals.get(pid) || 0) + 1);
                if (!programInfo.has(pid))
                    programInfo.set(pid, {
                        programId: pid,
                        school: a.school,
                        program_name: a.program_name,
                        degree: a.degree
                    });

                const aggKey = `${pid}__${year}`;
                if (!programYearAgg.has(aggKey)) {
                    const info = programInfo.get(pid);
                    programYearAgg.set(aggKey, {
                        id: aggKey,
                        programKey: pid,
                        year,
                        programId: info.programId,
                        school: info.school,
                        program_name: info.program_name,
                        degree: info.degree,
                        offer: 0,
                        rejection: 0,
                        unknown: 0,
                        total: 0
                    });
                }
                const row = programYearAgg.get(aggKey);
                if (a.admission === 'O') row.offer += 1;
                else if (a.admission === 'X') row.rejection += 1;
                else row.unknown += 1;
                row.total += 1;
            }

            // Determine top 10 programs by total applications
            const topProgramsKeys = Array.from(programTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([key]) => key);

            // Labels for chart/rows (include degree to disambiguate if names match)
            const programLabels = new Map(
                topProgramsKeys.map((k) => {
                    const info = programInfo.get(k) || {};
                    const deg = info.degree ? ` (${info.degree})` : '';
                    const name =
                        info.program_name ||
                        (info.programId ? `Program ${info.programId}` : '');
                    const schoolPart = info.school || '';
                    const label =
                        schoolPart && name
                            ? `${schoolPart} - ${name}${deg}`
                            : name || schoolPart || info.programId || '';
                    return [k, label.trim()];
                })
            );

            // Rows for table: one row per program per year for those top programs
            const topProgramsYearRows = Array.from(programYearAgg.values())
                .filter((r) => topProgramsKeys.includes(r.programKey))
                .map((r) => ({
                    ...r,
                    acceptanceRate:
                        r.offer + r.rejection > 0
                            ? (
                                  (r.offer / (r.offer + r.rejection)) *
                                  100
                              ).toFixed(1) + '%'
                            : '-'
                }))
                .sort((a, b) =>
                    a.school === b.school
                        ? a.program_name.localeCompare(b.program_name) ||
                          String(b.year).localeCompare(String(a.year))
                        : a.school.localeCompare(b.school)
                );

            return {
                topProgramsYearRows,
                topProgramKeys: topProgramsKeys,
                programLabels
            };
        }, [applications]);

    // Latest year KPIs
    const latestYearKPIs = useMemo(() => {
        if (!latestYear || latestYear === 'Unknown')
            return { total: '-', offer: '-', acceptanceRate: '-' };
        let offer = 0,
            rejection = 0,
            total = 0;
        for (const a of applications) {
            if (a.application_year !== latestYear) continue;
            if (a.admission === 'O') offer += 1;
            else if (a.admission === 'X') rejection += 1;
            total += 1;
        }
        const known = offer + rejection;
        const acceptanceRate = known
            ? ((offer / known) * 100).toFixed(1) + '%'
            : '-';
        return { total, offer, acceptanceRate };
    }, [applications, latestYear]);

    // Acceptance rate per year per top program (for chart)
    const { acceptanceRateDataset, acceptanceRateSeries } = useMemo(() => {
        if (!topProgramsYearRows || topProgramsYearRows.length === 0) {
            return { acceptanceRateDataset: [], acceptanceRateSeries: [] };
        }
        // Gather valid numeric years present across top programs
        const isValidYear = (y) => /^(19|20|21)\d{2}$/.test(String(y));
        const yearsSet = new Set();
        for (const r of topProgramsYearRows) {
            if (isValidYear(r.year)) yearsSet.add(Number(r.year));
        }
        const yearsSorted = Array.from(yearsSet).sort((a, b) => a - b);

        // Create alias for each top program key to keep series keys compact
        const aliases = (topProgramKeys || []).map((_, i) => `p${i}`);
        const aliasMap = new Map(
            (topProgramKeys || []).map((k, i) => [k, aliases[i]])
        );

        // Build dataset rows per year with acceptance rate for each program
        const dataset = yearsSorted.map((year) => {
            const obj = { year };
            for (const k of topProgramKeys || []) {
                const row = topProgramsYearRows.find(
                    (r) => r.programKey === k && String(r.year) === String(year)
                );
                const denom = row ? row.offer + row.rejection : 0;
                const rate = denom > 0 ? (row.offer / denom) * 100 : null;
                obj[aliasMap.get(k)] = rate != null ? +rate.toFixed(1) : null;
            }
            return obj;
        });

        const series = (topProgramKeys || []).map((k, i) => ({
            dataKey: aliases[i],
            label: programLabels?.get(k) || ''
        }));

        return { acceptanceRateDataset: dataset, acceptanceRateSeries: series };
    }, [topProgramsYearRows, topProgramKeys, programLabels]);

    // 3) Final decision count by country
    const finalByCountryRows = useMemo(() => {
        const map = new Map();
        for (const a of finalApplications) {
            if (!a.finalEnrolment) continue;
            const country = a.country || 'UNKNOWN';
            if (!map.has(country)) map.set(country, { country, count: 0 });
            map.get(country).count += 1;
        }
        return Array.from(map.values())
            .sort((a, b) => b.count - a.count)
            .map((r, idx) => ({ id: `${r.country}-${idx}`, ...r }));
    }, [finalApplications]);

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

    // Build heatmap markers using local cityCoord.json (no external geocoding)
    const cityMarkersData = useMemo(() => {
        // Aggregate counts per unique location key
        const counts = new Map();
        for (const a of finalApplications) {
            if (!a.finalEnrolment) continue;
            const country = (a.country || 'UNKNOWN').toString().toUpperCase();
            const city = (a.city || '').toString().trim();
            const zip = (a.zipCode || '').toString().trim();
            if (!city && !zip && !country) continue;
            const key = `${country}|${city}|${zip}`;
            const label = [[city, zip].filter(Boolean).join(' '), country]
                .filter(Boolean)
                .join(', ');
            const cur = counts.get(key) || {
                key,
                country,
                city,
                zip,
                label,
                count: 0
            };
            cur.count += 1;
            counts.set(key, cur);
        }

        const header = [
            'Latitude',
            'Longitude',
            'Final Decisions',
            { type: 'string', role: 'tooltip', p: { html: true } }
        ];
        const rows = [];

        for (const loc of counts.values()) {
            const city = loc.city;
            const coords = city ? cityCoord[city] : null;
            if (!coords || !Array.isArray(coords)) continue; // skip if city not in mapping or null
            const [lat, lng] = coords;
            if (
                typeof lat !== 'number' ||
                typeof lng !== 'number' ||
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            )
                continue;
            const tooltip = `\n<div style="padding:6px 8px;line-height:1.2">\n  <div><strong>${
                loc.city || loc.zip || loc.country
            }</strong></div>\n  <div>${loc.country}${
                loc.zip ? ` • ${loc.zip}` : ''
            }</div>\n  <div>${loc.count} final decision${
                loc.count > 1 ? 's' : ''
            }</div>\n</div>`;
            rows.push([lat, lng, loc.count, tooltip]);
        }

        rows.sort((a, b) => b[2] - a[2]);
        return [header, ...rows];
    }, [finalApplications]);

    const cityGeoOptions = useMemo(
        () => ({
            displayMode: 'markers',
            colorAxis: { colors: ['#BBDEFB', '#0D47A1'] },
            legend: 'none',
            tooltip: { isHtml: true },
            backgroundColor: 'transparent',
            datalessRegionColor: '#E0E0E0',
            defaultColor: '#F5F5F5',
            region: '150' // Europe viewport
        }),
        []
    );

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
                field: 'acceptanceRate',
                headerName: t('Acceptance Rate', { ns: 'common' }),
                width: 140
            }
        ],
        [t]
    );

    const topCols = useMemo(
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
                field: 'year',
                headerName: t('Year', { ns: 'common' }),
                width: 90,
                valueGetter: (params) => {
                    const y = params?.row?.year;
                    return /^(19|20|21)\d{2}$/.test(String(y)) ? Number(y) : '';
                },
                sortComparator: (a, b) => (a || 0) - (b || 0)
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
                field: 'acceptanceRate',
                headerName: t('Acceptance Rate', { ns: 'common' }),
                width: 140
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

    // Removed: Final decision count by program (chart and table)

    if (isLoading || isFinalLoading) return <Loading />;

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
                            {t('Acceptance Rate', { ns: 'common' })}
                        </Typography>
                        <Typography variant="h5">
                            {kpis.acceptanceRate}
                        </Typography>
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
                                        rate: latestYearKPIs.acceptanceRate
                                    }
                                )}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
            </Card>

            <Card sx={{ p: 2, gridColumn: '1 / -1' }}>
                <CardHeader
                    title={t('Applications per Year (Offer / Rejection)', {
                        ns: 'common'
                    })}
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
                            }
                        ]}
                        xAxis={[{ dataKey: 'year', scaleType: 'band' }]}
                    />
                </Box>
                <MuiDataGrid columns={yearCols} rows={byYearRows} simple />
            </Card>

            <Card sx={{ p: 2, gridColumn: '1 / -1' }}>
                <CardHeader
                    title={t(
                        'Top 10 Applied Programs — Acceptance Rate by Year',
                        {
                            ns: 'common'
                        }
                    )}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LineChart
                        dataset={acceptanceRateDataset}
                        height={420}
                        series={acceptanceRateSeries}
                        xAxis={[{ dataKey: 'year', scaleType: 'band' }]}
                        yAxis={[
                            {
                                label: t('Acceptance Rate %', { ns: 'common' }),
                                min: 0,
                                max: 100,
                                valueFormatter: (v) =>
                                    v == null ? '' : `${v}%`
                            }
                        ]}
                    />
                </Box>
                <MuiDataGrid
                    columns={topCols}
                    rows={topProgramsYearRows}
                    simple
                />
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
                    simple
                />
            </Card>

            <Card sx={{ p: 2 }}>
                <CardHeader
                    title={t('Final Decisions Heatmap (Cities)', {
                        ns: 'common'
                    })}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 1 }}>
                    {(cityMarkersData?.length || 0) > 1 ? (
                        <Chart
                            chartType="GeoChart"
                            data={cityMarkersData}
                            height="420px"
                            options={cityGeoOptions}
                            width="100%"
                        />
                    ) : (
                        <Typography color="text.secondary" variant="body2">
                            {t('No final decision locations to display yet.', {
                                ns: 'common'
                            })}
                        </Typography>
                    )}
                </Box>
                <Typography color="text.secondary" variant="caption">
                    {t(
                        'Bubble size and color indicate final decision counts per city/zip.',
                        { ns: 'common' }
                    )}
                </Typography>
            </Card>

            {/* Removed: Final Decision Count by Program card */}
        </Box>
    );
};

export default Overview;
