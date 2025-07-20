import { Navigate, useNavigate } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Button,
    Stack
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArchiveIcon from '@mui/icons-material/Archive';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { is_TaiGer_role } from '@taiger-common/core';
import { useEffect, useState } from 'react';

import { request } from '../../api/request';

const TranscriptDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // Temporory workaround to fetch transcripts
    // TODO: implement actual/proper API call to fetch transcripts with UseQuery
    const [transcripts, setTranscripts] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meeting-summaries')
            .then((data) => {
                setTranscripts(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch transcripts:', error);
            });
    }, []);

    TabTitle(i18next.t('CRM Overview', { ns: 'common' }));

    const columns = [
        {
            accessorKey: 'leadFullName',
            header: 'Lead',
            size: 150,
            Cell: ({ row }) =>
                row.original.leadId ? (
                    <Link
                        onClick={() =>
                            navigate(`/crm/leads/${row.original.leadId}`)
                        }
                        sx={{ cursor: 'pointer' }}
                        underline="hover"
                    >
                        {row.original.leadFullName || ''}
                    </Link>
                ) : (
                    <Typography color="text.secondary">
                        No Lead Assigned
                    </Typography>
                )
        },
        {
            accessorKey: 'title',
            header: 'Title',
            size: 200,
            Cell: ({ row }) => (
                <Link
                    onClick={() => navigate(`/crm/meetings/${row.original.id}`)}
                    sx={{ cursor: 'pointer' }}
                    underline="hover"
                >
                    {row.original.title || ''}
                </Link>
            )
        },
        {
            accessorKey: 'date',
            header: 'Date',
            size: 200,
            Cell: ({ cell }) => {
                const date = new Date(cell.getValue());
                return date.toLocaleString();
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            size: 300,
            enableSorting: false,
            Cell: ({ row }) => {
                const leadId = row.original.leadId;
                return (
                    <Stack direction="row" spacing={1}>
                        {!leadId && (
                            <>
                                <Button
                                    onClick={() =>
                                        alert('Assign to Existing Lead clicked')
                                    }
                                    size="small"
                                    startIcon={<PersonIcon />}
                                    variant="outlined"
                                >
                                    Assign to Lead
                                </Button>
                                <Button
                                    onClick={() =>
                                        alert('Create New Lead clicked')
                                    }
                                    size="small"
                                    startIcon={<PersonAddIcon />}
                                    variant="outlined"
                                >
                                    Create Lead
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => alert('Archive clicked')}
                            size="small"
                            startIcon={<ArchiveIcon />}
                            variant="outlined"
                        >
                            Archive
                        </Button>
                    </Stack>
                );
            }
        }
    ];

    return (
        <Box data-testid="student_overview">
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {i18next.t('CRM', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('Meetings', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Overview', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {i18next.t('Transcript Summaries', { ns: 'common' })}
                </Typography>
                <MaterialReactTable
                    columns={columns}
                    data={transcripts}
                    initialState={{
                        density: 'compact',
                        pagination: { pageSize: 10 }
                    }}
                    positionToolbarAlertBanner="bottom"
                />
            </Box>
        </Box>
    );
};

export default TranscriptDashboard;
