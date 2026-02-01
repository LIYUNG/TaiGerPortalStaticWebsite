import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface GrantManagerModalProps {
    firstname: string;
    lastname: string;
    managerModalShow: boolean;
    setManagerModalHide: () => void;
    onUpdatePermissions: (
        e: React.FormEvent,
        permissions: Record<string, unknown>
    ) => void;
}

const GrantManagerModal = (props: GrantManagerModalProps) => {
    const { t } = useTranslation();
    const [grantManagerModalState, setGrantManagerModalState] = useState<{
        payload: Record<string, string>;
        changed: boolean;
    }>({
        payload: {},
        changed: false
    });

    const onChange = (e: { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setGrantManagerModalState((prevState) => ({
            payload: {
                ...prevState.payload,
                [id]: value
            },
            changed: true
        }));
    };

    const onSubmitHandler = (e: React.FormEvent) => {
        props.onUpdatePermissions(e, grantManagerModalState.payload);
    };

    return (
        <Dialog
            onClose={props.setManagerModalHide}
            open={props.managerModalShow}
        >
            <DialogTitle>
                Set {props.firstname} - {props.lastname} as Manager:
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="select-manager-type">
                        {t('Configure Manager Type')}
                    </InputLabel>
                    <Select
                        id="manager_type"
                        label="Select target group"
                        labelId="select-manager-type"
                        name="manager_type"
                        onChange={(e) =>
                            onChange({
                                target: {
                                    id: 'manager_type',
                                    value: e.target.value as string
                                }
                            })
                        }
                        value={
                            grantManagerModalState.payload.manager_type ?? ''
                        }
                    >
                        <MenuItem value="">Please Select</MenuItem>
                        <MenuItem value="Agent">Agent Manager</MenuItem>
                        <MenuItem value="Editor">Editor Manager</MenuItem>
                        <MenuItem value="AgentAndEditor">
                            Both Agent and Editor Manager
                        </MenuItem>
                    </Select>
                </FormControl>
                <br />
                configure agents
                <br />
                configure editors
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={!grantManagerModalState.changed}
                    onClick={(e) => onSubmitHandler(e)}
                    variant="contained"
                >
                    {t('Confirm', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    onClick={props.setManagerModalHide}
                    variant="outlined"
                >
                    {t('Cancel', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default GrantManagerModal;
