import { useState, Fragment, useCallback } from 'react';
import { Link as LinkDom, NavLink } from 'react-router-dom';
import {
    Box,
    Collapse,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import { convertDate } from '@utils/contants';
import DEMO from '@store/constant';

export interface ExpenseItem {
    amount: number;
    currency?: string;
    status?: string;
    description?: string;
    updatedAt?: string;
}

export interface DocThreadItem {
    doc_thread_id?: { _id?: string; file_type?: string };
    isFinalVersion?: boolean;
    updatedAt?: string;
}

export interface ApplicationItem {
    programId?: { school?: string; program_name?: string };
    doc_modification_thread?: DocThreadItem[];
}

export interface ExtendableTableStudent {
    _id?: { toString(): string };
    firstname: string;
    lastname: string;
    applying_program_count?: number;
    expenses: ExpenseItem[];
    generaldocs_threads?: DocThreadItem[];
    applications?: ApplicationItem[];
}

export interface ExtendableTableProps {
    data: ExtendableTableStudent[];
    onExpenseChange?: (
        studentIndex: number,
        expenseIndex: number,
        field: keyof ExpenseItem,
        value: string | number
    ) => void;
}

const getDocumentThreads = (
    student: ExtendableTableStudent
): { thread: DocThreadItem; label: string }[] => {
    const threads: { thread: DocThreadItem; label: string }[] = [];
    student.generaldocs_threads?.forEach((thread) => {
        threads.push({
            thread,
            label: thread.doc_thread_id?.file_type ?? '—'
        });
    });
    student.applications?.forEach((app) => {
        app.doc_modification_thread?.forEach((thread) => {
            threads.push({
                thread,
                label: `${thread.doc_thread_id?.file_type ?? ''} - ${app.programId?.school ?? ''} ${app.programId?.program_name ?? ''}`.trim()
            });
        });
    });
    return threads;
};

export const ExtendableTable = ({
    data,
    onExpenseChange
}: ExtendableTableProps) => {
    const { t } = useTranslation();
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [editedExpenses, setEditedExpenses] = useState<
        Record<string, ExpenseItem>
    >({});

    const toggleRow = (index: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const getExpenseKey = (studentIdx: number, expenseIdx: number) =>
        `${studentIdx}-${expenseIdx}`;

    const getExpense = useCallback(
        (
            student: ExtendableTableStudent,
            studentIdx: number,
            expenseIdx: number
        ) => {
            const key = getExpenseKey(studentIdx, expenseIdx);
            return editedExpenses[key] ?? student.expenses[expenseIdx];
        },
        [editedExpenses]
    );

    const handleExpenseFieldChange = (
        studentIdx: number,
        expenseIdx: number,
        field: keyof ExpenseItem,
        value: string | number
    ) => {
        const student = data[studentIdx];
        const current = getExpense(student, studentIdx, expenseIdx);
        const updated = { ...current, [field]: value };
        if (field === 'amount') updated.amount = Number(value) || 0;

        setEditedExpenses((prev) => ({
            ...prev,
            [getExpenseKey(studentIdx, expenseIdx)]: updated
        }));
        onExpenseChange?.(studentIdx, expenseIdx, field, value);
    };

    const getStudentTotal = (
        student: ExtendableTableStudent,
        studentIdx: number
    ) => {
        return student.expenses.reduce((sum, _, idx) => {
            const exp = getExpense(student, studentIdx, idx);
            return sum + (exp?.amount ?? 0);
        }, 0);
    };

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell width={48} />
                        <TableCell>{t('Name', { ns: 'common' })}</TableCell>
                        <TableCell align="right">
                            # {t('Applications')}
                        </TableCell>
                        <TableCell align="right">
                            # {t('Transactions')}
                        </TableCell>
                        <TableCell align="right">{t('Income')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((student, index) => {
                        const isExpanded = expandedRows.has(index);
                        const docThreads = getDocumentThreads(student);
                        const total = getStudentTotal(student, index);

                        return (
                            <Fragment key={index}>
                                <TableRow
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                    onClick={() => toggleRow(index)}
                                >
                                    <TableCell padding="checkbox">
                                        <IconButton size="small">
                                            {isExpanded ? (
                                                <ExpandLessIcon />
                                            ) : (
                                                <ExpandMoreIcon />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        {student._id ? (
                                            <NavLink
                                                to={DEMO.STUDENT_APPLICATIONS_ID_LINK(
                                                    student._id.toString()
                                                )}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {student.firstname}{' '}
                                                {student.lastname}
                                            </NavLink>
                                        ) : (
                                            <Typography
                                                component="span"
                                                fontWeight={600}
                                            >
                                                {student.firstname}{' '}
                                                {student.lastname}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {student.applying_program_count ?? 0}
                                    </TableCell>
                                    <TableCell align="right">
                                        {student.expenses.length}
                                    </TableCell>
                                    <TableCell align="right">{total}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        padding="none"
                                        sx={{ borderBottom: 0 }}
                                    >
                                        <Collapse
                                            in={isExpanded}
                                            timeout="auto"
                                            unmountOnExit
                                        >
                                            <Box
                                                sx={{
                                                    px: 3,
                                                    py: 2,
                                                    bgcolor: 'action.hover'
                                                }}
                                            >
                                                {/* Expenses section - editable */}
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ mb: 1.5 }}
                                                >
                                                    {t('Expenses', {
                                                        ns: 'common'
                                                    })}{' '}
                                                    — {t('Amount')},{' '}
                                                    {t('Status')},{' '}
                                                    {t('UpdateAt')}
                                                </Typography>
                                                <Table
                                                    size="small"
                                                    sx={{ mb: 2 }}
                                                >
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                {t('Amount')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t('Currency')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t('Status')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t(
                                                                    'Description',
                                                                    {
                                                                        ns: 'common'
                                                                    }
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t('UpdateAt')}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {student.expenses
                                                            .length > 0 ? (
                                                            student.expenses.map(
                                                                (
                                                                    _,
                                                                    expenseIdx
                                                                ) => {
                                                                    const expense =
                                                                        getExpense(
                                                                            student,
                                                                            index,
                                                                            expenseIdx
                                                                        );
                                                                    return (
                                                                        <TableRow
                                                                            key={
                                                                                expenseIdx
                                                                            }
                                                                        >
                                                                            <TableCell>
                                                                                <TextField
                                                                                    size="small"
                                                                                    type="number"
                                                                                    value={
                                                                                        expense.amount ??
                                                                                        0
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleExpenseFieldChange(
                                                                                            index,
                                                                                            expenseIdx,
                                                                                            'amount',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    sx={{
                                                                                        width: 100
                                                                                    }}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    size="small"
                                                                                    value={
                                                                                        expense.currency ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleExpenseFieldChange(
                                                                                            index,
                                                                                            expenseIdx,
                                                                                            'currency',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    sx={{
                                                                                        width: 80
                                                                                    }}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    size="small"
                                                                                    value={
                                                                                        expense.status ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleExpenseFieldChange(
                                                                                            index,
                                                                                            expenseIdx,
                                                                                            'status',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    sx={{
                                                                                        width: 120
                                                                                    }}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    size="small"
                                                                                    value={
                                                                                        expense.description ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleExpenseFieldChange(
                                                                                            index,
                                                                                            expenseIdx,
                                                                                            'description',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    fullWidth
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    size="small"
                                                                                    type="datetime-local"
                                                                                    value={
                                                                                        expense.updatedAt
                                                                                            ? expense.updatedAt.slice(
                                                                                                  0,
                                                                                                  16
                                                                                              )
                                                                                            : ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleExpenseFieldChange(
                                                                                            index,
                                                                                            expenseIdx,
                                                                                            'updatedAt',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    sx={{
                                                                                        width: 180
                                                                                    }}
                                                                                    InputLabelProps={{
                                                                                        shrink: true
                                                                                    }}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                }
                                                            )
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={5}
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        fontStyle:
                                                                            'italic'
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'No expenses',
                                                                        {
                                                                            ns: 'common'
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>

                                                {/* Document threads section - inline, no popup */}
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ mb: 1.5 }}
                                                >
                                                    {t('Document Threads', {
                                                        ns: 'common'
                                                    })}{' '}
                                                    — {t('Status')},{' '}
                                                    {t('Document')},{' '}
                                                    {t('UpdateAt')}
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell
                                                                width={60}
                                                            >
                                                                {t('Status')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t('Document', {
                                                                    ns: 'common'
                                                                })}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t('UpdateAt')}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {docThreads.length >
                                                        0 ? (
                                                            docThreads.map(
                                                                (
                                                                    {
                                                                        thread,
                                                                        label
                                                                    },
                                                                    i
                                                                ) => (
                                                                    <TableRow
                                                                        key={i}
                                                                    >
                                                                        <TableCell>
                                                                            {thread.isFinalVersion ? (
                                                                                <CheckCircleIcon
                                                                                    color="success"
                                                                                    fontSize="small"
                                                                                    titleAccess="Finished"
                                                                                />
                                                                            ) : (
                                                                                <RadioButtonUncheckedIcon
                                                                                    sx={{
                                                                                        color: 'grey.400'
                                                                                    }}
                                                                                    fontSize="small"
                                                                                    titleAccess="In progress"
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Link
                                                                                component={
                                                                                    LinkDom
                                                                                }
                                                                                to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                                                                    thread.doc_thread_id?._id?.toString() ??
                                                                                        ''
                                                                                )}
                                                                                underline="hover"
                                                                            >
                                                                                {
                                                                                    label
                                                                                }
                                                                            </Link>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {thread.updatedAt
                                                                                ? convertDate(
                                                                                      thread.updatedAt
                                                                                  )
                                                                                : '—'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={3}
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        fontStyle:
                                                                            'italic'
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'No document threads',
                                                                        {
                                                                            ns: 'common'
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
