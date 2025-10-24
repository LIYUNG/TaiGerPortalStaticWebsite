import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardHeader,
    Divider,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { Chart } from 'react-google-charts';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import { MuiDataGrid } from '../../components/MuiDataGrid';
import Loading from '../../components/Loading/Loading';
import { getApplicationsQuery } from '../../api/query';
import cityCoord from './cityCoord.json';

const toUpperSafe = (value) => value?.toString().toUpperCase() || '';

const formatAcceptanceRate = (offer, rejection) => {
    const known = offer + rejection;
    return known > 0 ? `${((offer / known) * 100).toFixed(1)}%` : '-';
};

const isValidCoordinate = (value) =>
    typeof value === 'number' && !Number.isNaN(value);

const formatNumber = (v) =>
    typeof v === 'number'
        ? v.toLocaleString()
        : typeof v === 'string' && /^\d+(,\d{3})*$/.test(v)
          ? v
          : v;

// Compact stacked breakdown bar for Offer / Rejection / Unknown
const ResultsBreakdown = ({ offer, rejection, unknown, acceptance, t }) => {
    const total = offer + rejection + unknown;
    const p = (n) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
    const parts = [
        {
            key: 'offer',
            label: t('Offer'),
            value: offer,
            percent: p(offer),
            color: 'success.main'
        },
        {
            key: 'rejection',
            label: t('Rejection'),
            value: rejection,
            percent: p(rejection),
            color: 'error.main'
        },
        {
            key: 'unknown',
            label: t('Unknown'),
            value: unknown,
            percent: p(unknown),
            color: 'grey.500'
        }
    ];

    return (
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    mb: 1
                }}
            >
                <Typography color="text.secondary" variant="caption">
                    {t('Results breakdown')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography color="text.secondary" variant="caption">
                        {t('Acceptance Rate')}: {acceptance ?? '-'}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                        {t('Total')}: {formatNumber(total)}
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    height: 12,
                    width: '100%',
                    borderRadius: 6,
                    overflow: 'hidden',
                    mb: 1
                }}
            >
                {parts.map((part) => (
                    <Box
                        key={part.key}
                        sx={{
                            width: `${part.percent}%`,
                            bgcolor: part.color,
                            transition: 'width 300ms ease'
                        }}
                    />
                ))}
            </Box>
            {total === 0 ? (
                <Typography color="text.secondary" variant="caption">
                    {t('No data')}
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {parts.map((part) => (
                        <Box
                            key={part.key}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    bgcolor: part.color,
                                    borderRadius: 0.5
                                }}
                            />
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {`${part.label}: ${formatNumber(part.value)} (${part.percent}%)`}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

const Overview = () => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const [geoView, setGeoView] = useState('map');

    const handleGeoViewChange = (event, newValue) => {
        setGeoView(newValue);
    };

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
                country: toUpperSafe(a?.country || prog?.country),
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
            finalEnrolment: Boolean(a?.finalEnrolment),
            programId: a?.programId,
            // Program metadata may not be present on this endpoint; default gracefully
            school: a?.school || '',
            program_name: a?.program_name || '',
            degree: a?.degree || '',
            country: toUpperSafe(a?.country)
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
        const acceptanceRate = formatAcceptanceRate(offer, rejection);
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
            acceptanceRate: formatAcceptanceRate(r.offer, r.rejection)
        }));
    }, [applications]);

    // Chart dataset for applications per year (stacked)
    const byYearChartDataset = useMemo(() => byYearRows, [byYearRows]);

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
            const country = toUpperSafe(a.country) || 'UNKNOWN';
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
            if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) continue;
            const tooltip = `\n<div style="padding:6px 8px;line-height:1.2">\n  <div><strong>${
                loc.city || loc.zip || loc.country
            }</strong></div>\n  <div>${loc.country}${
                loc.zip ? ` • ${loc.zip}` : ''
            }</div>\n  <div>${t('finalDecisionsWithCount', { count: loc.count })}</div>\n</div>`;
            rows.push([lat, lng, loc.count, tooltip]);
        }

        rows.sort((a, b) => b[2] - a[2]);
        return [header, ...rows];
    }, [finalApplications, t]);

    const applicationsPerYearSeries = useMemo(
        () => [
            {
                dataKey: 'offer',
                label: t('Offer'),
                stack: 'result',
                color: theme.palette.success.main
            },
            {
                dataKey: 'rejection',
                label: t('Rejection'),
                stack: 'result',
                color: theme.palette.error.main
            }
        ],
        [t, theme]
    );

    const hasCityMarkers = useMemo(
        () => (cityMarkersData?.length || 0) > 1,
        [cityMarkersData]
    );

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
                headerName: t('Year'),
                width: 100
            },
            {
                field: 'offer',
                headerName: t('Offer'),
                width: 100
            },
            {
                field: 'rejection',
                headerName: t('Rejection'),
                width: 110
            },
            {
                field: 'unknown',
                headerName: t('Unknown'),
                width: 110
            },
            {
                field: 'total',
                headerName: t('Total'),
                width: 100
            },
            {
                field: 'acceptanceRate',
                headerName: t('Acceptance Rate'),
                width: 140
            }
        ],
        [t]
    );

    const countryCols = useMemo(
        () => [
            { field: 'country', headerName: t('Country'), width: 200 },
            { field: 'count', headerName: t('Final Decisions'), width: 150 }
        ],
        [t]
    );

    if (isLoading || isFinalLoading) return <Loading />;

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }
            }}
        >
            {/* Results breakdown (no card) */}
            <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                <ResultsBreakdown
                    acceptance={kpis.acceptanceRate}
                    offer={kpis.offer}
                    rejection={kpis.rejection}
                    t={t}
                    unknown={kpis.unknown}
                />
            </Box>

            <Card sx={{ p: 2, gridColumn: { xs: '1 / -1', lg: '1 / 2' } }}>
                <CardHeader
                    subheader={t(
                        'Track total applications and results by year'
                    )}
                    title={t('Applications per Year')}
                />
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: '100%', mb: 2 }}>
                    <BarChart
                        dataset={byYearChartDataset}
                        height={320}
                        series={applicationsPerYearSeries}
                        xAxis={[{ dataKey: 'year', scaleType: 'band' }]}
                    />
                </Box>
                <MuiDataGrid columns={yearCols} rows={byYearRows} simple />
            </Card>

            <Card sx={{ p: 2, gridColumn: { xs: '1 / -1', lg: '2 / 3' } }}>
                <CardHeader
                    subheader={t('Country distribution and city heatmap')}
                    title={t('Final Decisions by Geography')}
                />
                <Box
                    sx={{
                        width: '100%',
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                >
                    <Tabs
                        aria-label={t('Geography Views')}
                        onChange={handleGeoViewChange}
                        value={geoView}
                    >
                        <Tab label={t('Map View')} value="map" />
                        <Tab label={t('Country Breakdown')} value="country" />
                    </Tabs>
                </Box>

                {/* Map View */}
                {geoView === 'map' && (
                    <Box sx={{ pt: 2 }}>
                        {hasCityMarkers ? (
                            <Chart
                                chartType="GeoChart"
                                data={cityMarkersData}
                                height="360px"
                                options={cityGeoOptions}
                                width="100%"
                            />
                        ) : (
                            <Typography color="text.secondary" variant="body2">
                                {t(
                                    'No final decision locations to display yet'
                                )}
                            </Typography>
                        )}
                        <Typography color="text.secondary" variant="caption">
                            {t(
                                'Bubble size and color indicate final decision counts per city/zip'
                            )}
                        </Typography>
                    </Box>
                )}

                {/* Country Breakdown View */}
                {geoView === 'country' && (
                    <Box sx={{ pt: 2 }}>
                        <PieChart
                            height={260}
                            series={[
                                {
                                    data: finalByCountryChartData,
                                    innerRadius: 40,
                                    paddingAngle: 2,
                                    cornerRadius: 4
                                }
                            ]}
                            slotProps={{
                                legend: {
                                    labelStyle: { fontSize: 11 },
                                    itemMarkWidth: 10,
                                    itemMarkHeight: 10,
                                    markGap: 6,
                                    itemGap: 10
                                }
                            }}
                        />
                        <Divider sx={{ my: 2 }} />
                        <MuiDataGrid
                            columns={countryCols}
                            rows={finalByCountryRows}
                            simple
                        />
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default Overview;
