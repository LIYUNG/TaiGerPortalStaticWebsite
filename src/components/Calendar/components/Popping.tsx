import React from 'react';
import {
    Badge,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import {
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Student
} from '@taiger-common/core';

import '../style/model.scss';
import {
    NoonNightLabel,
    convertDate,
    showTimezoneOffset
} from '../../../utils/contants';

import { useTranslation } from 'react-i18next';

interface CalendarEvent {
    id?: string;
    title?: string;
    start?: Date;
    end?: Date;
    description?: string;
    provider?: {
        _id?: { toString: () => string };
        firstname?: string;
        lastname?: string;
    };
}

/** Compatible with AuthUserData and UserProps (role from @taiger-common/core) */
interface UserWithAgents {
    _id?: string | { toString: () => string };
    firstname?: string;
    lastname?: string;
    role?: string;
    agents?: Array<{
        _id: { toString: () => string };
        firstname?: string;
        lastname?: string;
    }>;
}

interface PoppingProps {
    open: unknown;
    handleClose: () => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeReceiver: (e: { target: { value: string } }) => void;
    newReceiver: string;
    BookButtonDisable: boolean;
    event: CalendarEvent | null;
    handleBook: () => void;
    newDescription: string;
    user: UserWithAgents | null;
}

const Popping = ({
    open,
    handleClose,
    handleChange,
    handleChangeReceiver,
    newReceiver,
    BookButtonDisable,
    event,
    handleBook,
    newDescription,
    user
}: PoppingProps) => {
    const { t } = useTranslation();
    if (event?.id) {
        const { title, start, end } = event;
        const textLimit = 2000;

        const modal = () => {
            return (
                <Dialog onClose={handleClose} open={!!open}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        請寫下想討論的主題
                        <TextField
                            fullWidth
                            inputProps={{ maxLength: textLimit }}
                            minRows={5}
                            multiline
                            onChange={handleChange}
                            placeholder="Example：我想定案選校、選課，我想討論簽證，德語班。"
                            value={newDescription || ''}
                        />
                        <br />
                        <Badge
                            color={
                                newDescription?.length > textLimit
                                    ? 'error'
                                    : 'primary'
                            }
                            badgeContent={`${newDescription?.length || 0}/${textLimit}`}
                        >
                            <span />
                        </Badge>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="Agent">
                                {t('Agent', { ns: 'common' })} or{' '}
                                {t('Editor', { ns: 'common' })}
                            </InputLabel>
                            <Select
                                id="Agent"
                                label={t('Agent', { ns: 'common' })}
                                labelId="Agent"
                                name="Agent"
                                onChange={handleChangeReceiver}
                                value={
                                    user &&
                                    is_TaiGer_Student(user as UserProps)
                                        ? user.agents && user.agents.length > 0
                                            ? newReceiver
                                            : ''
                                        : ''
                                }
                            >
                                {is_TaiGer_Student(user) ? (
                                    <MenuItem value="">
                                        {t('Please Select', { ns: 'common' })}
                                    </MenuItem>
                                ) : null}
                                {is_TaiGer_Student(user) && event.provider ? (
                                    <MenuItem
                                        value={
                                            event.provider._id?.toString() ?? ''
                                        }
                                    >
                                        {event.provider.firstname}{' '}
                                        {event.provider.lastname}
                                    </MenuItem>
                                ) : is_TaiGer_Agent(user) ||
                                  is_TaiGer_Editor(user) ? (
                                    <MenuItem value={user._id.toString()}>
                                        {user.firstname}
                                        {user.lastname}
                                    </MenuItem>
                                ) : (
                                    (user?.agents?.map((agent, i) => (
                                        <MenuItem
                                            key={i}
                                            value={agent._id.toString()}
                                        >
                                            {agent.firstname}
                                            {agent.lastname}
                                        </MenuItem>
                                    )) ?? null)
                                )}
                            </Select>
                        </FormControl>
                        <br />
                        <ul>
                            <li className="col text-secondary pb-0 mb-0">
                                From: {start && convertDate(start)}{' '}
                                {start && NoonNightLabel(start)}{' '}
                                {
                                    Intl.DateTimeFormat().resolvedOptions()
                                        .timeZone
                                }{' '}
                                UTC
                                {showTimezoneOffset()}
                            </li>
                            <li className="col text-secondary pb-0 mb-0">
                                To: {end && convertDate(end)}{' '}
                                {
                                    Intl.DateTimeFormat().resolvedOptions()
                                        .timeZone
                                }{' '}
                                UTC
                                {showTimezoneOffset()}
                            </li>
                        </ul>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            disabled={
                                newDescription?.length === 0 ||
                                newReceiver === '' ||
                                BookButtonDisable
                            }
                            onClick={handleBook}
                            size="small"
                            sx={{ mr: 2 }}
                            variant="contained"
                        >
                            {BookButtonDisable ? (
                                <CircularProgress />
                            ) : (
                                t('Book')
                            )}
                        </Button>
                        <Button
                            color="secondary"
                            onClick={handleClose}
                            size="small"
                            variant="outlined"
                        >
                            {t('Close', { ns: 'common' })}
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        };
        return modal();
    }
    return <p>there is no modal to preview</p>;
};

export default Popping;
