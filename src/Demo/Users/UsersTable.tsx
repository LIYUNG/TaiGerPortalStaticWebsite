import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Tabs,
    Tab,
    Box,
    Link,
    Typography,
    Breadcrumbs,
    Button
} from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';

import UsersList from './UsersList';
import AddUserModal from './AddUserModal';
import ErrorPage from '../Utils/ErrorPage';
import DEMO from '../../store/constant';
import { addUser } from '../../api';
import { TabTitle } from '../Utils/TabTitle';
import { is_TaiGer_role } from '@taiger-common/core';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { CustomTabPanel, a11yProps } from '../../components/Tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../api/client';
import { useSnackBar } from '../../contexts/use-snack-bar';
import { getUsersCountQuery } from '../../api/query';

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

const UsersTable = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [userTableState, setUserTableState] = useState({
        error: null,
        addUserModalState: false,
        isLoaded: false,
        users: null,
        success: false,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });
    const [value, setValue] = useState(0);

    const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const { data: usersCount } = useQuery(getUsersCountQuery());

    const { mutate: addUserMutation, isPending: isAddingUser } = useMutation({
        mutationFn: (user_information) => addUser(user_information),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users/count'] });
            setUserTableState((prevState) => ({
                ...prevState,
                addUserModalState: false
            }));
            setMessage(t('User added successfully'));
            setSeverity('success');
            setOpenSnackbar(true);
        },
        onError: (error) => {
            setMessage(error.message);
            setSeverity('error');
            setOpenSnackbar(true);
        }
    });

    const openAddUserModal = () => {
        setUserTableState((prevState) => ({
            ...prevState,
            addUserModalState: true
        }));
    };
    const cloaseAddUserModal = () => {
        setUserTableState((prevState) => ({
            ...prevState,
            addUserModalState: false
        }));
    };

    const AddUserSubmit = (
        e: FormEvent<HTMLFormElement>,
        user_information: {
            firstname: string;
            lastname: string;
            email: string;
            role?: string;
        }
    ) => {
        addUserMutation(user_information);
    };

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(t('User List', { ns: 'common' }));
    const { res_status } = userTableState;

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    return (
        <Box data-testid="users_table_page">
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('User List', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            {/* Header Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1
                }}
            >
                <Box sx={{ mt: 1 }}>
                    <Typography variant="h5">
                        {t('User management', { ns: 'common' })}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t('Manage your team members here.', { ns: 'common' })}
                    </Typography>
                </Box>
                <Box>
                    <Button
                        color="primary"
                        onClick={openAddUserModal}
                        sx={{ mt: 1 }}
                        variant="contained"
                    >
                        {t('Add New User')}
                    </Button>
                </Box>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant="scrollable"
                >
                    <Tab
                        data-testid="users_table_page_student_tab"
                        label={`${t('Student', { ns: 'common' })} (${
                            usersCount?.studentCount
                        })`}
                        {...a11yProps(value, 0)}
                    />
                    <Tab
                        data-testid="users_table_page_agent_tab"
                        label={`${t('Agents', { ns: 'common' })} (${usersCount?.agentCount})`}
                        {...a11yProps(value, 1)}
                    />
                    <Tab
                        data-testid="users_table_page_editor_tab"
                        label={`${t('Editor', { ns: 'common' })} (${usersCount?.editorCount})`}
                        {...a11yProps(value, 2)}
                    />
                    <Tab
                        data-testid="users_table_page_external_tab"
                        label={`${t('External', { ns: 'common' })} (${
                            usersCount?.externalCount
                        })`}
                        {...a11yProps(value, 3)}
                    />
                    <Tab
                        data-testid="users_table_page_admin_tab"
                        label={`${t('Admin', { ns: 'common' })} (${usersCount?.adminCount})`}
                        {...a11yProps(value, 4)}
                    />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={value}>
                <UsersList
                    openAddUserModal={openAddUserModal}
                    queryString={queryString.stringify({ role: 'Student' })}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                <UsersList
                    openAddUserModal={openAddUserModal}
                    queryString={queryString.stringify({ role: 'Agent' })}
                />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={value}>
                <UsersList
                    openAddUserModal={openAddUserModal}
                    queryString={queryString.stringify({ role: 'Editor' })}
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={value}>
                <UsersList
                    openAddUserModal={openAddUserModal}
                    queryString={queryString.stringify({ role: 'External' })}
                />
            </CustomTabPanel>
            <CustomTabPanel index={4} value={value}>
                <UsersList
                    openAddUserModal={openAddUserModal}
                    queryString={queryString.stringify({ role: 'Admin' })}
                    readOnly={true}
                />
            </CustomTabPanel>
            <AddUserModal
                AddUserSubmit={AddUserSubmit}
                addUserModalState={userTableState.addUserModalState}
                cloaseAddUserModal={cloaseAddUserModal}
                isloading={isAddingUser}
                selected_user_id={userTableState.selected_user_id}
            />
        </Box>
    );
};

export default UsersTable;
