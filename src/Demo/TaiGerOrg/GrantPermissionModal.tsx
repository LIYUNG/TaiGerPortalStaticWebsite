import React, { useState } from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface UserPermissions {
    canAssignEditors?: boolean;
    canAssignAgents?: boolean;
    canModifyProgramList?: boolean;
    canModifyAllBaseDocuments?: boolean;
    canAccessAllChat?: boolean;
    canModifyDocumentation?: boolean;
    canAccessStudentDatabase?: boolean;
    canAddUser?: boolean;
    canUseTaiGerAI?: boolean;
    taigerAiQuota?: string | number;
}

interface GrantPermissionModalProps {
    firstname: string;
    lastname: string;
    modalShow: boolean;
    setModalHide: () => void;
    onUpdatePermissions: (
        e: React.FormEvent,
        permissions: UserPermissions
    ) => void;
    user_permissions: UserPermissions[];
}

const GrantPermissionModal = (props: GrantPermissionModalProps) => {
    const { t } = useTranslation();
    const [grantPermissionModalState, setGrantPermissionModalState] = useState({
        permissions:
            props.user_permissions.length > 0
                ? props.user_permissions[0]
                : ({
                      canAssignEditors: false,
                      canAssignAgents: false
                  } as UserPermissions),
        changed: false
    });

    const onChangePermissions = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setGrantPermissionModalState((prevState) => ({
            ...prevState,
            permissions: {
                ...prevState.permissions,
                [value]: checked
            },
            changed: true
        }));
    };

    const onChangePermissions_Quota = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { value, id } = e.target;
        setGrantPermissionModalState((prevState) => ({
            ...prevState,
            permissions: {
                ...prevState.permissions,
                [id]: value
            },
            changed: true
        }));
    };

    const onSubmitHandler = (e: React.FormEvent) => {
        props.onUpdatePermissions(e, grantPermissionModalState.permissions);
    };

    const permissions: [string, string][] = [
        ['canModifyProgramList', 'Can modify program list'],
        [
            'canModifyAllBaseDocuments',
            'Can modify all Base Documents And Survey Data'
        ],
        ['canAccessAllChat', 'Can access all chat'],
        ['canAssignAgents', 'Can assign agents'],
        ['canAssignEditors', 'Can assign editors'],
        ['canModifyDocumentation', 'Can modify documentation'],
        ['canAccessStudentDatabase', 'Can access student database'],
        ['canAddUser', 'Can add user'],
        ['canUseTaiGerAI', 'Can use TaiGer AI']
    ];
    const permissionsQuota: [string, string][] = [
        ['taigerAiQuota', 'TaiGerAI Quota']
    ];

    return (
        <Dialog
            aria-labelledby="contained-modal-title-vcenter"
            onClose={props.setModalHide}
            open={props.modalShow}
        >
            <DialogTitle>
                Edit {props.firstname} - {props.lastname} permissions:
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Permission</TableCell>
                            <TableCell>Check</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map((permission, i) => (
                            <TableRow key={i + 1}>
                                <TableCell>{permission[1]}</TableCell>
                                <TableCell>
                                    <FormControl>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={
                                                        !!grantPermissionModalState
                                                            .permissions[
                                                            permission[0] as keyof UserPermissions
                                                        ]
                                                    }
                                                    onChange={(e) =>
                                                        onChangePermissions(
                                                            e as React.ChangeEvent<HTMLInputElement>
                                                        )
                                                    }
                                                    sx={{
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: '1.5rem'
                                                        }
                                                    }}
                                                    value={permission[0]}
                                                />
                                            }
                                        />
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                        {permissionsQuota.map((permission_quota, j) => (
                            <TableRow key={j + 1000}>
                                <TableCell>{permission_quota[1]}</TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        id={permission_quota[0]}
                                        label="Quota"
                                        name={permission_quota[0]}
                                        onChange={(e) =>
                                            onChangePermissions_Quota(e)
                                        }
                                        placeholder="1000"
                                        type="number"
                                        value={
                                            grantPermissionModalState
                                                .permissions[
                                                permission_quota[0] as keyof UserPermissions
                                            ] ?? ''
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={!grantPermissionModalState.changed}
                    onClick={(e) => onSubmitHandler(e)}
                    variant="contained"
                >
                    {t('Update', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    onClick={props.setModalHide}
                    variant="outlined"
                >
                    {t('Cancel', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default GrantPermissionModal;
