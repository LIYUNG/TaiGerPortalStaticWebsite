import {
    Box,
    Card,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, FormEvent, MouseEvent } from 'react';

import { appConfig } from '../../../config';
import DEMO from '@store/constant';
import NoAgentsStudentsCard from '@pages/Dashboard/MainViewTab/NoAgentsStudentsCard/NoAgentsStudentsCard';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { IStudentResponse } from '@taiger-common/model';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

type SubmitUpdateAgentlist = (
    e: FormEvent<HTMLFormElement>,
    updateAgentList: unknown,
    student_id: string
) => void;

interface AssignAgentsPageProps {
    students: IStudentResponse[];
    submitUpdateAgentlist: SubmitUpdateAgentlist;
    /** Server-side pagination. Optional so the page renders standalone in tests. */
    isLoading?: boolean;
    page?: number;
    pageSize?: number;
    rowCount?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
}

interface NoAgentsTableProps {
    students: IStudentResponse[];
    submitUpdateAgentlist: SubmitUpdateAgentlist;
    isLoading: boolean;
}

const NoAgentsTable = ({
    students,
    submitUpdateAgentlist,
    isLoading
}: NoAgentsTableProps) => {
    const { t } = useTranslation();
    return (
        <Card sx={{ p: 2 }}>
            <Typography variant="h6">
                {t('No Agents Students', { ns: 'dashboard' })}
            </Typography>
            <TableContainer style={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>
                                {t('First-, Last Name', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Email', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Target Year', { ns: 'common' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading && students.length === 0 ? (
                            <TableRow>
                                <TableCell align="center" colSpan={4}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student, i) => (
                                <NoAgentsStudentsCard
                                    key={student._id?.toString() ?? i}
                                    isArchivPage={false}
                                    student={student}
                                    submitUpdateAgentlist={
                                        submitUpdateAgentlist
                                    }
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

const AssignAgentsPage = ({
    students,
    submitUpdateAgentlist,
    isLoading = false,
    page = 0,
    pageSize = ROWS_PER_PAGE_OPTIONS[0],
    rowCount,
    onPageChange,
    onPageSizeChange
}: AssignAgentsPageProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    { label: t('Assign Agents', { ns: 'common' }) }
                ]}
            />
            <NoAgentsTable
                isLoading={isLoading}
                students={students}
                submitUpdateAgentlist={submitUpdateAgentlist}
            />
            <TablePagination
                component="div"
                count={rowCount ?? students.length}
                onPageChange={(
                    _e: MouseEvent<HTMLButtonElement> | null,
                    newPage: number
                ) => onPageChange?.(newPage)}
                onRowsPerPageChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onPageSizeChange?.(parseInt(e.target.value, 10))
                }
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            />
        </Box>
    );
};

export default AssignAgentsPage;
