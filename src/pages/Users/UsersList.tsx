import React, { useState, useMemo } from 'react';
import { Box, Typography, Avatar, Chip, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    MaterialReactTable,
    MRT_ColumnDef,
    useMaterialReactTable
} from 'material-react-table';
import {
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Student
} from '@taiger-common/core';

import UsersListSubpage from './UsersListSubpage';
import { deleteUser, changeUserRole, updateArchivUser } from '@/api';
import { stringAvatar } from '@utils/contants';
import { ConfirmDialog, useConfirmDialog } from '@components/ConfirmDialog';
import { getUsersQuery } from '@/api/query';
import { useMutation, useQuery } from '@tanstack/react-query';
import DEMO from '@store/constant';
import { queryClient } from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import { useTableStyles } from '@components/table';
import { getTableConfig } from '@components/table/users-table/table-config';
import { TopToolbar } from '@components/table/users-table/TopToolbar';
import type { QueryString } from '@/api/types';

export interface UsersListProps {
    queryString: QueryString;
    openAddUserModal: () => void;
    readOnly?: boolean;
}

const UsersList = (props: UsersListProps) => {
    const { t } = useTranslation();
    const { data: usersList, isLoading } = useQuery(
        getUsersQuery(props.queryString)
    );
    const customTableStyles = useTableStyles();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const [usersListState, setUsersListState] = useState({
        modalShow: false,
        firstname: '',
        lastname: '',
        selected_user_role: '',
        selected_user_id: '',
        modalShowNewProgram: false
    });
    const archivDialog = useConfirmDialog();
    const deleteDialog = useConfirmDialog();

    // Format date for display (e.g., "Mar 4, 2024")
    const formatDate = (date: string | number | Date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const link = (user: Record<string, unknown>) => {
        if (is_TaiGer_Student(user)) {
            return `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(user._id)}`;
        } else if (is_TaiGer_Agent(user)) {
            return `${DEMO.TEAM_AGENT_LINK(user._id)}`;
        } else if (is_TaiGer_Editor(user)) {
            return `${DEMO.TEAM_EDITOR_LINK(user._id)}`;
        }
        return ``;
    };

    const columns = useMemo<MRT_ColumnDef<Record<string, unknown>>[]>(
        () => [
            {
                accessorKey: 'user',
                header: t('User name', { ns: 'common' }),
                size: 300,
                // Return searchable string for global filter
                accessorFn: (row) => {
                    const fullName =
                        `${row.firstname || ''} ${row.lastname || ''}`.trim();
                    const email = row.email || '';
                    return `${fullName} ${email}`.toLowerCase();
                },
                Cell: ({ row }) => {
                    const user = row.original;
                    const fullName =
                        `${user.firstname || ''} ${user.lastname || ''}`.trim();
                    const linkUrl = link(user);

                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Avatar
                                {...stringAvatar(fullName)}
                                src={user.pictureUrl}
                                sx={{ width: 40, height: 40 }}
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Link
                                    component={LinkDom}
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'text.primary',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                    to={linkUrl}
                                >
                                    {fullName || t('Unnamed', { ns: 'common' })}
                                </Link>
                                <Typography
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 0.25 }}
                                    variant="caption"
                                >
                                    {user.email || '-'}
                                </Typography>
                            </Box>
                        </Box>
                    );
                },
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    const nameA =
                        `${rowA.original.firstname || ''} ${rowA.original.lastname || ''}`
                            .trim()
                            .toLowerCase();
                    const nameB =
                        `${rowB.original.firstname || ''} ${rowB.original.lastname || ''}`
                            .trim()
                            .toLowerCase();
                    return nameA.localeCompare(nameB);
                }
            },
            {
                accessorKey: 'role',
                header: t('Role', { ns: 'common' }),
                size: 150,

                Cell: ({ row }) => {
                    return (
                        <Chip
                            key={row.original._id}
                            label={row.original.role}
                            size="small"
                            sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                            variant="outlined"
                        />
                    );
                },
                enableSorting: false
            },
            {
                accessorKey: 'lastLoginAt',
                header: t('Last active', { ns: 'common' }),
                size: 150,
                // Return searchable string for global filter
                accessorFn: (row) => {
                    if (!row.lastLoginAt) return '';
                    return formatDate(row.lastLoginAt).toLowerCase();
                },
                Cell: ({ row }) => {
                    return (
                        <Typography color="text.secondary" variant="body2">
                            {row.original.lastLoginAt
                                ? formatDate(row.original.lastLoginAt)
                                : '-'}
                        </Typography>
                    );
                },
                enableSorting: true,
                sortingFn: (rowA, rowB): number => {
                    const dateA = rowA.original.lastLoginAt
                        ? new Date(rowA.original.lastLoginAt).getTime()
                        : 0;
                    const dateB = rowB.original.lastLoginAt
                        ? new Date(rowB.original.lastLoginAt).getTime()
                        : 0;
                    return dateA - dateB;
                }
            },
            {
                accessorKey: 'createdAt',
                header: t('Date added', { ns: 'common' }),
                size: 150,
                // Return searchable string for global filter
                accessorFn: (row) => {
                    if (!row.createdAt) return '';
                    return formatDate(row.createdAt).toLowerCase();
                },
                Cell: ({ row }) => {
                    return (
                        <Typography color="text.secondary" variant="body2">
                            {row.original.createdAt
                                ? formatDate(row.original.createdAt)
                                : '-'}
                        </Typography>
                    );
                },
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    const dateA = rowA.original.createdAt
                        ? new Date(rowA.original.createdAt).getTime()
                        : 0;
                    const dateB = rowB.original.createdAt
                        ? new Date(rowB.original.createdAt).getTime()
                        : 0;
                    return dateA - dateB;
                }
            },
            {
                accessorKey: 'isAccountActivated',
                header: t('Account Active', { ns: 'common' }),
                size: 200,
                accessorFn: (row) => {
                    return row.isAccountActivated
                        ? t('Yes', { ns: 'common' })
                        : t('No', { ns: 'common' });
                },
                Cell: ({ row }) => {
                    return (
                        <Typography color="text.secondary" variant="body2">
                            {row.original.isAccountActivated
                                ? t('Yes', { ns: 'common' })
                                : t('No', { ns: 'common' })}
                        </Typography>
                    );
                },
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    const a = rowA.original.isAccountActivated ? 1 : 0;
                    const b = rowB.original.isAccountActivated ? 1 : 0;
                    return a - b;
                }
            },
            {
                accessorKey: 'archiv',
                header: t('Archived', { ns: 'common' }),
                size: 160,
                accessorFn: (row) => {
                    return row.archiv
                        ? t('Yes', { ns: 'common' })
                        : t('No', { ns: 'common' });
                },
                Cell: ({ row }) => {
                    return (
                        <Typography color="text.secondary" variant="body2">
                            {row.original.archiv
                                ? t('Yes', { ns: 'common' })
                                : t('No', { ns: 'common' })}
                        </Typography>
                    );
                },
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    const a = rowA.original.archiv ? 1 : 0;
                    const b = rowB.original.archiv ? 1 : 0;
                    return a - b;
                }
            }
        ],
        [t]
    );

    const { mutate: changeUserRoleMutation } = useMutation({
        mutationFn: changeUserRole,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: () => {
            setSeverity('success');
            setMessage('Update user role successfully!');
            queryClient.invalidateQueries({
                queryKey: ['users', props.queryString]
            });
            queryClient.invalidateQueries({
                queryKey: ['users/count']
            });
            setUsersListState((prevState) => ({
                ...prevState,
                modalShow: false
            }));
            setOpenSnackbar(true);
        }
    });

    const { mutate: deleteUserMutation, isPending: isDeletingUser } =
        useMutation({
            mutationFn: deleteUser,
            onError: (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
            },
            onSuccess: () => {
                setSeverity('success');
                setMessage('Delete user successfully!');
                queryClient.invalidateQueries({
                    queryKey: ['users', props.queryString]
                });
                queryClient.invalidateQueries({
                    queryKey: ['users/count']
                });
                deleteDialog.closeDialog();
                setOpenSnackbar(true);
            }
        });

    const {
        mutate: updateArchivUserMutation,
        isPending: isUpdatingArchivUser
    } = useMutation({
        mutationFn: updateArchivUser,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: () => {
            setSeverity('success');
            setMessage('Update user archiv status successfully!');
            queryClient.invalidateQueries({
                queryKey: ['users', props.queryString]
            });
            queryClient.invalidateQueries({
                queryKey: ['users/count']
            });
            archivDialog.closeDialog();
            setOpenSnackbar(true);
        }
    });

    const setModalShow = (
        user_firstname: string,
        user_lastname: string,
        user_role: string,
        user_id: string
    ) => {
        setUsersListState((prevState) => ({
            ...prevState,
            modalShow: true,
            firstname: user_firstname,
            lastname: user_lastname,
            selected_user_role: user_role,
            selected_user_id: user_id
        }));
    };

    const setModalHide = () => {
        setUsersListState((prevState) => ({
            ...prevState,
            modalShow: false
        }));
    };

    const handleDeleteClick = (
        user_firstname: string,
        user_lastname: string,
        user_id: string
    ) => {
        deleteDialog.openDialog({
            title: t('Warning', { ns: 'common' }),
            content: (
                <>
                    {t('Do you want to delete')}{' '}
                    <b>
                        {user_firstname} - {user_lastname}
                    </b>
                    ?
                </>
            ),
            variant: 'confirm',
            confirmLabel: t('Yes', { ns: 'common' }),
            cancelLabel: t('No', { ns: 'common' }),
            requireTypedConfirm: {
                keyword: 'delete',
                label: (
                    <>
                        Please enter{' '}
                        <i>
                            <b>delete</b>
                        </i>
                    </>
                )
            },
            onConfirm: () => deleteUserMutation({ id: user_id })
        });
    };

    const handleArchiveClick = (
        user_firstname: string,
        user_lastname: string,
        user_id: string,
        archiv?: boolean
    ) => {
        archivDialog.openDialog({
            title: t('Warning', { ns: 'common' }),
            content: (
                <>
                    Do you want to archiv{' '}
                    <b>
                        {user_firstname} - {user_lastname}
                    </b>
                    ?
                </>
            ),
            variant: 'confirm',
            confirmLabel: t('Yes', { ns: 'common' }),
            cancelLabel: t('No', { ns: 'common' }),
            onConfirm: () =>
                updateArchivUserMutation({
                    user_id,
                    isArchived: archiv === true ? false : true
                })
        });
    };

    const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setUsersListState((prevState) => ({
            ...prevState,
            selected_user_role: value
        }));
    };

    const assignUserAs = (user_data: { _id: string; role: string }) => {
        changeUserRoleMutation({ id: user_data._id, role: user_data.role });
    };

    const onSubmit2 = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const user_role = usersListState.selected_user_role;
        const user_id = usersListState.selected_user_id;
        assignUserAs({ role: user_role, _id: user_id });
    };

    const tableConfig = getTableConfig(customTableStyles, isLoading);

    const table = useMaterialReactTable({
        ...tableConfig,
        enableRowSelection: !props.readOnly,
        enableMultiRowSelection: !props.readOnly,
        columns,
        data: usersList || [],
        state: { isLoading },
        enableGlobalFilter: true,
        enableColumnFilters: false, // Hide column filters by default, show via Filters button
        enableSorting: true,
        initialState: {
            ...tableConfig.initialState,
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true,
            showColumnFilters: false,
            density: 'comfortable'
        },
        muiSearchTextFieldProps: {
            placeholder: t('Search', { ns: 'common' }),
            size: 'small',
            sx: { minWidth: 200 }
        },
        muiTableContainerProps: {
            sx: {
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
            }
        },
        muiTablePaperProps: {
            elevation: 0
        },
        renderTopToolbar: ({ table }) => (
            <TopToolbar
                onArchiveClick={handleArchiveClick}
                onDeleteClick={handleDeleteClick}
                onEditClick={setModalShow}
                table={table}
                toolbarStyle={customTableStyles.toolbarStyle}
            />
        )
    });

    return (
        <Box sx={{ pb: 4, mt: 1 }}>
            <MaterialReactTable table={table} />

            {/* Modals */}
            <UsersListSubpage
                firstname={usersListState.firstname}
                handleChange2={handleChange2}
                lastname={usersListState.lastname}
                onSubmit2={onSubmit2}
                selected_user_id={usersListState.selected_user_id}
                selected_user_role={usersListState.selected_user_role}
                setModalHide={setModalHide}
                show={usersListState.modalShow}
            />
            <ConfirmDialog
                open={deleteDialog.open}
                onClose={deleteDialog.closeDialog}
                {...deleteDialog.dialogConfig}
                confirmDisabled={isDeletingUser}
                confirmLabel={
                    isDeletingUser
                        ? t('Loading')
                        : deleteDialog.dialogConfig.confirmLabel
                }
            />
            <ConfirmDialog
                open={archivDialog.open}
                onClose={archivDialog.closeDialog}
                {...archivDialog.dialogConfig}
                confirmDisabled={isUpdatingArchivUser}
                confirmLabel={
                    isUpdatingArchivUser
                        ? t('Loading')
                        : archivDialog.dialogConfig.confirmLabel
                }
            />
        </Box>
    );
};

export default UsersList;
