import React, { useMemo } from 'react';
import { Card, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MuiDataGrid } from '../MuiDataGrid';
import DEMO from '../../store/constant';

const transform = (students = []) => {
    const rows = [];

    for (const student of students) {
        const apps = Array.isArray(student?.applications)
            ? student.applications
            : [];

        const finalEnrolments = apps
            .filter((a) => a?.finalEnrolment === true)
            .map((a) => {
                // Prefer programId object; fallback to program[0]
                const p =
                    (a && a.programId) ||
                    (Array.isArray(a?.program) ? a.program[0] : null);

                return {
                    key: a?._id || p?._id || Math.random().toString(36),
                    programId: p?._id || a?.programId?._id,
                    school: p?.school || '',
                    program_name: p?.program_name || '',
                    degree: p?.degree || '',
                    application_year: a?.application_year || '',
                    country: p?.country || '',
                    city: p?.city || a?.city || ''
                };
            });

        if (finalEnrolments.length === 0) continue;

        rows.push({
            id: student?._id?.toString(),
            studentId: student?._id?.toString(),
            name: `${student?.firstname || ''} ${student?.lastname || ''}`.trim(),
            finalEnrolments,
            finalEnrolmentsCount: finalEnrolments.length
        });
    }

    return rows;
};

const FinalDecisionOverview = ({ students }) => {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: t('First-/ Last Name', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                minWidth: 150,
                flex: 0.4,
                renderCell: (params) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.studentId,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            title={params.row.name}
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.row.name}
                        </Link>
                    );
                }
            },
            {
                field: 'finalEnrolments',
                headerName: t('Program / University', { ns: 'common' }),
                flex: 1.2,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => {
                    const items = params.row?.finalEnrolments || [];
                    if (!items.length) return '-';
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4
                            }}
                        >
                            {items.map((it) => {
                                const label = `${it.school} - ${it.program_name}${it.degree ? ` (${it.degree})` : ''}`;
                                const to = it.programId
                                    ? `/programs/${it.programId}`
                                    : null;
                                return to ? (
                                    <Link
                                        component={LinkDom}
                                        key={it.key}
                                        target="_blank"
                                        to={to}
                                        underline="hover"
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <span key={it.key}>{label}</span>
                                );
                            })}
                        </div>
                    );
                }
            },
            {
                field: 'cities',
                headerName: t('City', { ns: 'common' }),
                width: 80,
                sortable: false,
                renderCell: (params) => {
                    const items = params.row?.finalEnrolments || [];
                    if (!items.length) return '-';
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4
                            }}
                        >
                            {items.map((it) => {
                                const value = (it.city || '').toString() || '-';
                                return (
                                    <span
                                        key={it.key}
                                        style={{
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={value}
                                    >
                                        {value}
                                    </span>
                                );
                            })}
                        </div>
                    );
                }
            },
            {
                field: 'countries',
                headerName: t('Country', { ns: 'common' }),
                width: 90,
                sortable: false,
                renderCell: (params) => {
                    const items = params.row?.finalEnrolments || [];
                    if (!items.length) return '-';
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4
                            }}
                        >
                            {items.map((it) => {
                                const value =
                                    (it.country || '')
                                        .toString()
                                        .toUpperCase() || '-';
                                return (
                                    <span
                                        key={it.key}
                                        style={{
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={value}
                                    >
                                        {value}
                                    </span>
                                );
                            })}
                        </div>
                    );
                }
            },
            {
                field: 'finalEnrolmentsCount',
                headerName: t('Final Enrolments', { ns: 'common' }),
                width: 120,
                align: 'center',
                headerAlign: 'center'
            }
        ];
    }, [t]);

    const rows = transform(students);

    return (
        <Card>
            <MuiDataGrid columns={columns} rows={rows} />
        </Card>
    );
};

export default FinalDecisionOverview;
