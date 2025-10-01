import React, { useState } from 'react';
import { Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UsersListSubpage from './UsersListSubpage';
import UserDeleteWarning from './UserDeleteWarning';
import { deleteUser, changeUserRole, updateArchivUser } from '../../api';
import { convertDate, getDate } from '../../utils/contants';
import UserArchivWarning from './UserArchivWarning';
import { getUsersQuery } from '../../api/query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTableStyles } from '../../components/table/users-table/styles';
import { getTableConfig } from '../../components/table/users-table/table-config';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import DEMO from '../../store/constant';
import { TopToolbar } from '../../components/table/users-table/TopToolbar';
import { queryClient } from '../../api/client';
import { useSnackBar } from '../../contexts/use-snack-bar';

const UsersList = (props) => {
    const { t } = useTranslation();
    const { data: usersList, isLoading } = useQuery(
        getUsersQuery(props.queryString)
    );
    const customTableStyles = useTableStyles();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [usersListState, setUsersListState] = useState({
        error: '',
        modalShow: false,
        delete_field: '',
        firstname: '',
        lastname: '',
        selected_user_role: '',
        selected_user_id: '',
        archiv: false,
        data: props.users,
        modalShowNewProgram: false,
        deleteUserWarning: false,
        archivUserWarning: false,
        success: props.success,
        isLoaded: props.isLoaded,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });

    const columns = [
        {
            accessorKey: 'firstname',
            header: t('First Name', { ns: 'common' }),
            size: 100,
            Cell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(params.row.original._id)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.firstname}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'lastname',
            header: t('Last Name', { ns: 'common' }),
            //   filterVariant: 'autocomplete',
            filterFn: 'contains',
            size: 100,
            Cell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(params.row.original._id)}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.lastname}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'birthday',
            header: t('Birthday', { ns: 'common' }),
            size: 100
        },
        {
            accessorKey: 'email',
            header: t('Email', { ns: 'common' }),
            size: 100
        },
        {
            accessorKey: 'isAccountActivated',
            header: t('Activated', { ns: 'common' }),
            size: 100,
            Cell: (params) => {
                return params.row.original.isAccountActivated
                    ? t('Yes', { ns: 'common' })
                    : t('No', { ns: 'common' });
            }
        },
        {
            accessorKey: 'archiv',
            header: t('Archived', { ns: 'common' }),
            size: 100,
            Cell: (params) => {
                return params.row.original.archiv
                    ? t('Yes', { ns: 'common' })
                    : t('No', { ns: 'common' });
            }
        },
        {
            accessorKey: 'createdAt',
            header: t('Created At', { ns: 'common' }),
            size: 100,
            Cell: (params) => {
                return <>{getDate(params.row.original.createdAt)}</>;
            }
        },
        {
            accessorKey: 'lastLoginAt',
            header: t('Last Login', { ns: 'auth' }),
            size: 100,
            Cell: (params) => {
                return <>{convertDate(params.row.original.lastLoginAt)}</>;
            }
        }
    ];

    const table = useMaterialReactTable({
        ...tableConfig,
        enableRowSelection: !props.readOnly,
        enableMultiRowSelection: !props.readOnly,
        columns,
        state: { isLoading },
        data: usersList || []
    });

    const { mutate: changeUserRoleMutation } = useMutation({
        mutationFn: changeUserRole,
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: () => {
            table.resetRowSelection();
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
                setOpenSnackbar(true);
                setUsersListState((prevState) => ({
                    ...prevState,
                    deleteUserWarning: false,
                    delete_field: ''
                }));
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
            table.resetRowSelection();
            setSeverity('success');
            setMessage('Update user archiv status successfully!');
            queryClient.invalidateQueries({
                queryKey: ['users', props.queryString]
            });
            queryClient.invalidateQueries({
                queryKey: ['users/count']
            });
            setUsersListState((prevState) => ({
                ...prevState,
                archivUserWarning: false,
                archiv: false,
                selected_user_id: '',
                firstname: '',
                lastname: ''
            }));
            setOpenSnackbar(true);
        }
    });

    const setModalShow = (
        user_firstname,
        user_lastname,
        user_role,
        user_id
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

    const setModalArchivHide = () => {
        setUsersListState((prevState) => ({
            ...prevState,
            archivUserWarning: false
        }));
    };
    const setModalHideDDelete = () => {
        setUsersListState((prevState) => ({
            ...prevState,
            deleteUserWarning: false,
            delete_field: ''
        }));
    };

    const setModalShowDelete = (user_firstname, user_lastname, user_id) => {
        setUsersListState((prevState) => ({
            ...prevState,
            deleteUserWarning: true,
            firstname: user_firstname,
            lastname: user_lastname,
            selected_user_id: user_id
        }));
    };

    const setModalArchiv = (user_firstname, user_lastname, user_id, archiv) => {
        setUsersListState((prevState) => ({
            ...prevState,
            archivUserWarning: true,
            firstname: user_firstname,
            lastname: user_lastname,
            selected_user_id: user_id,
            archiv
        }));
    };

    table.options.renderTopToolbar = (
        <TopToolbar
            onAddClick={props.openAddUserModal}
            onArchiveClick={setModalArchiv}
            onDeleteClick={setModalShowDelete}
            onEditClick={setModalShow}
            table={table}
            toolbarStyle={customTableStyles.toolbarStyle}
        />
    );

    const handleChange2 = (e) => {
        const { value } = e.target;
        setUsersListState((prevState) => ({
            ...prevState,
            selected_user_role: value
        }));
    };

    const handleDeleteUser = (user_id) => {
        deleteUserMutation({ id: user_id });
    };

    const onChangeDeleteField = (e) => {
        setUsersListState((prevState) => ({
            ...prevState,
            delete_field: e.target.value
        }));
    };

    const assignUserAs = (user_data) => {
        changeUserRoleMutation({ id: user_data._id, role: user_data.role });
    };

    const onSubmit2 = (e) => {
        e.preventDefault();
        const user_role = usersListState.selected_user_role;
        const user_id = usersListState.selected_user_id;
        assignUserAs({ role: user_role, _id: user_id });
    };

    return (
        <>
            <MaterialReactTable table={table} />

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
            <UserDeleteWarning
                deleteUserWarning={usersListState.deleteUserWarning}
                delete_field={usersListState.delete_field}
                firstname={usersListState.firstname}
                handleDeleteUser={handleDeleteUser}
                isDeletingUser={isDeletingUser}
                lastname={usersListState.lastname}
                onChangeDeleteField={onChangeDeleteField}
                selected_user_id={usersListState.selected_user_id}
                setModalHideDDelete={setModalHideDDelete}
            />
            <UserArchivWarning
                archiv={usersListState.archiv}
                archivUserWarning={usersListState.archivUserWarning}
                firstname={usersListState.firstname}
                isUpdatingArchivUser={isUpdatingArchivUser}
                lastname={usersListState.lastname}
                selected_user_id={usersListState.selected_user_id}
                setModalArchivHide={setModalArchivHide}
                updateUserArchivStatus={updateArchivUserMutation}
            />
        </>
    );
};

export default UsersList;
