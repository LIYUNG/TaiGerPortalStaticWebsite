import React, { memo, useState } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Grid,
    Stack,
    Link,
    TextField,
    InputAdornment,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableViewIcon from '@mui/icons-material/TableView';
import { DataGrid } from '@mui/x-data-grid';
import GaugeCard from '@components/GaugeCard';
import type { GridRenderCellParams } from '@mui/x-data-grid';

import type { CategorySummaryRow, ProgramSheetEntry } from './utils';
import {
    acquiredECTS,
    requiredECTS,
    satisfiedRequirement,
    settings
} from './utils';

interface ProgramMatchingScoresProps {
    programSheetsArray: ProgramSheetEntry[];
    onProgramSelect: (index: number) => void;
}

const ProgramMatchingScores = memo(
    ({ programSheetsArray, onProgramSelect }: ProgramMatchingScoresProps) => {
        const theme = useTheme();
        const [viewMode, setViewMode] = useState('cards');
        const [pageSize, setPageSize] = useState(10);
        const [searchText, setSearchText] = useState('');

        const handleViewChange = (
            _event: React.MouseEvent<HTMLElement>,
            newView: string | null
        ) => {
            if (newView !== null) {
                setViewMode(newView);
            }
        };

        const calculateProgramMatchingScore = (
            sortedCourses: Record<string, CategorySummaryRow[]>
        ) => {
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

        const calculateRequiredECTS = (
            sortedCourses: Record<string, CategorySummaryRow[]>
        ) => {
            return Object.keys(sortedCourses).reduce(
                (sum, category) => sum + requiredECTS(sortedCourses[category]),
                0
            );
        };

        const calculateAcquiredECTS = (
            sortedCourses: Record<string, CategorySummaryRow[]>
        ) => {
            return Object.keys(sortedCourses).reduce(
                (sum, category) =>
                    sum +
                    (satisfiedRequirement(sortedCourses[category])
                        ? requiredECTS(sortedCourses[category])
                        : acquiredECTS(sortedCourses[category])),
                0
            );
        };

        const getScoreColor = (score: number) => {
            if (score >= 75) return theme.palette.primary.main;
            if (score >= 50) return theme.palette.success.main;
            return theme.palette.error.main;
        };

        const getECTSColor = (acquired: number, required: number) => {
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
                renderCell: (params: GridRenderCellParams) => (
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
                renderCell: (params: GridRenderCellParams) => {
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
                sortComparator: (v1: string | number, v2: string | number) =>
                    Number(v1) - Number(v2)
            },
            {
                field: 'ectsProgress',
                headerName: 'ECTS Progress',
                flex: 1.5,
                minWidth: 200,
                renderCell: (params: GridRenderCellParams) => {
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

        const rows = programSheetsArray.map(({ key, value }, index) => {
            const requiredECTSVal = calculateRequiredECTS(value.sorted);
            const acquiredECTSVal = calculateAcquiredECTS(value.sorted);
            return {
                id: index,
                index: index,
                programName: key,
                matchingScore: Number(
                    calculateProgramMatchingScore(value.sorted)
                ).toFixed(0),
                requiredECTS: requiredECTSVal,
                acquiredECTS: acquiredECTSVal
            };
        });

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
                                onPageSizeChange={(newPageSize: number) =>
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

export default ProgramMatchingScores;
