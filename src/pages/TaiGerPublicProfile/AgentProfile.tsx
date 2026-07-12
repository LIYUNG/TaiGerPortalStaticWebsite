import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    Link,
    Grid,
    Typography,
    Checkbox,
    FormControl,
    FormControlLabel
} from '@mui/material';
import TimezoneSelect from 'react-timezone-select';
import { Link as LinkDom, useParams } from 'react-router-dom';
import Select from 'react-select';
import { is_TaiGer_Student } from '@taiger-common/core';
import i18next from 'i18next';

import { daysOfWeek, time_slots } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { getAgentProfile } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import type { IAgent } from '@taiger-common/model';

/** The model types office-hour slots as `unknown[]`; they are react-select options. */
type TimeSlotOption = { value: string; label: string };
type OfficeHoursState = Record<
    string,
    { active?: boolean; time_slots?: TimeSlotOption[] } | undefined
>;

interface AgentProfileState {
    error: string;
    role: string;
    isLoaded: boolean;
    data: null;
    success: boolean;
    agent: IAgent;
    selectedTimezone: string;
    updateconfirmed: boolean;
    updatecredentialconfirmed: boolean;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
}

const AgentProfile = () => {
    const { user } = useAuth();
    const { user_id } = useParams();
    const [agentProfileState, setAgentProfileState] =
        useState<AgentProfileState>({
            error: '',
            role: '',
            isLoaded: false,
            data: null,
            success: false,
            agent: {} as IAgent,
            selectedTimezone:
                user?.timezone ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            updateconfirmed: false,
            updatecredentialconfirmed: false,
            res_status: 0,
            res_modal_message: '',
            res_modal_status: 0
        });

    useEffect(() => {
        getAgentProfile(user_id ?? '').then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setAgentProfileState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        agent: data,
                        success: success,
                        res_status: status
                    }));
                } else {
                    setAgentProfileState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error) => {
                setAgentProfileState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, [user_id]);

    const ConfirmError = () => {
        setAgentProfileState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_status, isLoaded, res_modal_status, res_modal_message } =
        agentProfileState;
    const officehours: OfficeHoursState =
        (agentProfileState.agent.officehours as OfficeHoursState | undefined) ??
        {};

    if (!isLoaded) {
        return <Loading />;
    }
    TabTitle(`Agent Profile`);
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Card sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5">
                            {agentProfileState.agent?.firstname}{' '}
                            {agentProfileState.agent?.lastname} Profile
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        Email: {agentProfileState.agent?.email}
                    </Typography>
                    <Typography variant="h6">
                        {i18next.t('Introduction')}
                    </Typography>
                    {agentProfileState.agent?.selfIntroduction}
                </Grid>
                <Grid item xs={12}>
                    <Box>
                        <Typography variant="h6">
                            {i18next.t('Office Hours')}
                        </Typography>
                        <Typography variant="body1">
                            {i18next.t('Time zone')}
                        </Typography>
                        <TimezoneSelect
                            displayValue="UTC"
                            isDisabled={true}
                            value={agentProfileState.selectedTimezone}
                        />
                        <br />
                        <Grid container spacing={2}>
                            {daysOfWeek.map((day, i) => (
                                <Grid item key={i} xs={12}>
                                    <FormControl>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={
                                                        officehours[day]?.active
                                                    }
                                                    name="useProgramRequirementData"
                                                    sx={{
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: '1.5rem'
                                                        }
                                                    }}
                                                />
                                            }
                                            label={`${day}`}
                                        />
                                    </FormControl>
                                    {officehours[day]?.active ? (
                                        <Select
                                            id={`${day}`}
                                            isDisabled={true}
                                            isMulti
                                            options={time_slots}
                                            value={
                                                officehours[day]?.time_slots ??
                                                []
                                            }
                                        />
                                    ) : (
                                        <Typography>
                                            {i18next.t('Close', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                        {user != null && is_TaiGer_Student(user) ? (
                            <>
                                <Typography sx={{ my: 2 }} variant="body1">
                                    想要與顧問討論？
                                </Typography>
                                <Link
                                    component={LinkDom}
                                    to={`${DEMO.EVENT_STUDENT_STUDENTID_LINK(
                                        user._id.toString()
                                    )}`}
                                >
                                    <Button color="primary" variant="contained">
                                        {i18next.t('Book')}
                                    </Button>
                                </Link>
                            </>
                        ) : null}
                    </Box>
                </Grid>
            </Card>
        </Box>
    );
};

export default AgentProfile;
