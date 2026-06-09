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
import { IStudentResponse } from '@taiger-common/model';

import NoEditorsStudentsCard from '@pages/Dashboard/MainViewTab/NoEditorsStudentsCard/NoEditorsStudentsCard';
import { appConfig } from '../../../config';
import DEMO from '@store/constant';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

type SubmitUpdateEditorlist = (
    e: FormEvent<HTMLFormElement>,
    updateEditorList: unknown,
    student_id: string
) => void;

const NoEditorsTableHeader = () => {
    const { t } = useTranslation();
    return (
        <TableHead>
            <TableRow>
                <TableCell />
                <TableCell>
                    {t('First-, Last Name', { ns: 'common' })}
                </TableCell>
                <TableCell>{t('Attributes', { ns: 'common' })}</TableCell>
                <TableCell>{t('Status', { ns: 'common' })}</TableCell>
                <TableCell>{t('Target Program Language')}</TableCell>
                <TableCell>{t('Target Year', { ns: 'common' })}</TableCell>
                <TableCell>{t('Agents', { ns: 'common' })}</TableCell>
            </TableRow>
        </TableHead>
    );
};

interface AssignEditorsPageProps {
    students: IStudentResponse[];
    submitUpdateEditorlist: SubmitUpdateEditorlist;
    /** Server-side pagination. Optional so the page renders standalone in tests. */
    isLoading?: boolean;
    page?: number;
    pageSize?: number;
    rowCount?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
}

const AssignEditorsPage = ({
    students,
    submitUpdateEditorlist,
    isLoading = false,
    page = 0,
    pageSize = ROWS_PER_PAGE_OPTIONS[0],
    rowCount,
    onPageChange,
    onPageSizeChange
}: AssignEditorsPageProps) => {
    const { t } = useTranslation();
    const no_editor_students = students?.map((student, i) => (
        <NoEditorsStudentsCard
            key={student._id?.toString() ?? i}
            isArchivPage={false}
            student={student}
            submitUpdateEditorlist={submitUpdateEditorlist}
        />
    ));

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    { label: t('Assign Editors', { ns: 'common' }) }
                ]}
            />
            <Card sx={{ p: 2 }}>
                <Typography variant="h6">{t('No Editors Students')}</Typography>
                <TableContainer style={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <NoEditorsTableHeader />
                        <TableBody>
                            {isLoading && students.length === 0 ? (
                                <TableRow>
                                    <TableCell align="center" colSpan={7}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                no_editor_students
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
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

export default AssignEditorsPage;
