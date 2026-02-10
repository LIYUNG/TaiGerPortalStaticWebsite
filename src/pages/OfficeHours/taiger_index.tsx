import React, { useState, useEffect } from 'react';
import {
    Box,
    Badge,
    Button,
    Card,
    CircularProgress,
    Typography,
    TextField,
    Link,
    Breadcrumbs,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    ButtonGroup,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    Grid,
    Divider
} from '@mui/material';
import TimezoneSelect from 'react-timezone-select';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
    Navigate,
    useParams,
    Link as LinkDom,
    useSearchParams
} from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { is_TaiGer_Agent, is_TaiGer_Editor } from '@taiger-common/core';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import {
    getNextDayDate,
    getTodayAsWeekday,
    getReorderWeekday,
    isInTheFuture,
    getUTCWithDST,
    daysOfWeek,
    time_slots
} from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { TabTitle } from '../Utils/TabTitle';
import MyCalendar from '@components/Calendar/components/Calendar';
import EventConfirmationCard from '@components/Calendar/components/EventConfirmationCard';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import { CreateNewEventModal } from '@components/Calendar/components/CreateNewEventModal';
import useCalendarEvents from '@hooks/useCalendarEvents';
import { updateOfficehours } from '@api';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type DateRangeShortcut = 'week' | 'month' | 'year';

const DateRangePickerBasic = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [startTime, setStartTime] = useState<Dayjs | undefined>(
        searchParams.get('startTime')
            ? dayjs(searchParams.get('startTime'))
            : undefined
    );

    const [endTime, setEndTime] = useState<Dayjs | undefined>(
        searchParams.get('endTime')
            ? dayjs(searchParams.get('endTime'))
            : undefined
    );

    const { t } = useTranslation();

    const handleShortcut = (type: DateRangeShortcut) => {
        let newStartDate: Dayjs | undefined;
        let newEndDate: Dayjs | undefined;

        if (type === 'week') {
            newStartDate = dayjs().subtract(1, 'week').startOf('day');
            newEndDate = dayjs().endOf('day');
        } else if (type === 'month') {
            newStartDate = dayjs().subtract(1, 'month').startOf('day');
            newEndDate = dayjs().endOf('day');
        } else if (type === 'year') {
            newStartDate = dayjs().subtract(12, 'month').startOf('day');
            newEndDate = dayjs().endOf('day');
        }

        setStartTime(newStartDate);
        setEndTime(newEndDate);

        if (newStartDate && newEndDate) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(
                'startTime',
                newStartDate.startOf('minute').toDate().toISOString()
            );
            newParams.set(
                'endTime',
                newEndDate.startOf('minute').toDate().toISOString()
            );
            newParams.set('view', 'past');
            setSearchParams(newParams);
        }
    };

    const handleSubmit = () => {
        if (startTime && endTime) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(
                'startTime',
                startTime.startOf('minute').toDate().toISOString()
            );
            newParams.set(
                'endTime',
                endTime.startOf('minute').toDate().toISOString()
            );
            newParams.set('view', 'past');
            setSearchParams(newParams);
        } else {
            alert('Please select both start and end date-times.');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    justifyContent: 'space-between',
                    marginTop: 2
                }}
            >
                <Button
                    onClick={() => handleShortcut('week')}
                    variant="outlined"
                >
                    Last 1 Week
                </Button>
                <Button
                    onClick={() => handleShortcut('month')}
                    variant="outlined"
                >
                    Last 1 Month
                </Button>{' '}
                <Button
                    onClick={() => handleShortcut('year')}
                    variant="outlined"
                >
                    Last 1 Year
                </Button>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%'
                }}
            >
                <DateTimePicker
                    label="Start Date-Time"
                    onChange={(newValue) => setStartTime(newValue ?? undefined)}
                    slotProps={{ textField: { size: 'small' } }}
                    value={startTime ?? null}
                />
                <DateTimePicker
                    label="End Date-Time"
                    minDateTime={startTime ?? undefined}
                    onChange={(newValue) => setEndTime(newValue ?? undefined)}
                    slotProps={{ textField: { size: 'small' } }}
                    value={endTime ?? null}
                />

                <Button
                    disabled={!startTime || !endTime}
                    onClick={handleSubmit}
                    variant="contained"
                >
                    {t('Submit', { ns: 'common' })}
                </Button>
            </Box>
        </LocalizationProvider>
    );
};

const TaiGerOfficeHours = () => {
    const { user } = useAuth();
    const { user_id } = useParams();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const startTime = searchParams.get('startTime') || '';
    const endTime = searchParams.get('endTime') || '';
    const [viewMode, setViewMode] = useState<'past' | 'future'>(
        startTime && endTime ? 'past' : 'future'
    );
    const {
        events,
        booked_events,
        res_status,
        isLoaded,
        isConfirmModalOpen,
        event_id,
        event_temp,
        BookButtonDisable,
        isEditModalOpen,
        newReceiver,
        newDescription,
        selectedEvent,
        newEventEnd,
        isNewEventModalOpen,
        isDeleteModalOpen,
        available_termins_full,
        student_id,
        students,
        handleConfirmAppointmentModalOpen,
        handleEditAppointmentModalOpen,
        handleModalBook,
        handleUpdateDescription,
        handleEditAppointmentModal,
        handleConfirmAppointmentModal,
        handleDeleteAppointmentModal,
        handleUpdateTimeSlot,
        handleUpdateTimeSlotAgent,
        handleConfirmAppointmentModalClose,
        handleEditAppointmentModalClose,
        handleDeleteAppointmentModalClose,
        handleDeleteAppointmentModalOpen,
        handleModalClose,
        handleChangeReceiver,
        handleSelectEvent,
        handleChange,
        handleSelectSlotAgent,
        handleNewEventModalClose,
        handleModalCreateEvent,
        handleSelectStudent,
        res_modal_message,
        res_modal_status,
        ConfirmError
    } = useCalendarEvents({
        user_id,
        startTime: startTime || new Date().toISOString().slice(0, 16) + 'Z',
        endTime: endTime || '',
        receiver_id: user_id
    });

    const tabNameToIndex = {
        calendar: 0,
        events: 1,
        settings: 2
    } as const;
    const indexToTabName: Record<number, keyof typeof tabNameToIndex> = {
        0: 'calendar',
        1: 'events',
        2: 'settings'
    };

    const getTabIndexFromName = (name: string | null): number => {
        if (name && name in tabNameToIndex) {
            return tabNameToIndex[name as keyof typeof tabNameToIndex];
        }
        return 0;
    };
    const tabParam = searchParams.get('tab');
    const mainTabValue = tabParam ? getTabIndexFromName(tabParam) : 0;

    type OfficeHoursState = Record<
        string,
        { active?: boolean; time_slots?: { value: string; label: string }[] }
    >;
    const [officeHours, setOfficeHours] = useState<OfficeHoursState>(
        (user?.officehours as OfficeHoursState) || {}
    );
    const [selectedTimezone, setSelectedTimezone] = useState(
        user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    const [isOfficeHoursModified, setIsOfficeHoursModified] = useState(false);
    const [updateOfficeHoursConfirmed, setUpdateOfficeHoursConfirmed] =
        useState(false);
    const [isSubmittingOfficeHours, setIsSubmittingOfficeHours] =
        useState(false);

    useEffect(() => {
        if (user?.officehours) {
            setOfficeHours(user.officehours as OfficeHoursState);
        }
        if (user?.timezone) {
            setSelectedTimezone(user.timezone);
        }
    }, [user?.officehours, user?.timezone]);

    const handleMainTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        const newParams = new URLSearchParams(searchParams);
        if (newValue === 0) {
            newParams.delete('tab');
        } else {
            const tabName = indexToTabName[newValue];
            if (tabName) {
                newParams.set('tab', tabName);
            }
        }
        setSearchParams(newParams);
    };

    const handleTimezoneChange = (timezone: { value: string }) => {
        setSelectedTimezone(timezone.value);
        setIsOfficeHoursModified(true);
    };

    const handleToggleDay = (
        e: React.ChangeEvent<HTMLInputElement>,
        day: string
    ) => {
        setOfficeHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                active: e.target.checked,
                time_slots: prev[day]?.time_slots || []
            }
        }));
        setIsOfficeHoursModified(true);
    };

    const handleTimeSlotsChange = (
        _e: React.SyntheticEvent,
        newValues: { value: string; label: string }[],
        day: string
    ) => {
        setOfficeHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                time_slots: newValues
            }
        }));
        setIsOfficeHoursModified(true);
    };

    const handleSubmitOfficeHours = () => {
        if (!user?._id) return;
        setIsSubmittingOfficeHours(true);
        updateOfficehours(user._id.toString(), officeHours, selectedTimezone)
            .then((resp) => {
                const { success } = resp.data;
                if (success) {
                    setIsOfficeHoursModified(false);
                    setUpdateOfficeHoursConfirmed(true);
                } else {
                    const { message } = resp.data;
                    console.error('Update failed:', message);
                    alert(message || t('Update failed', { ns: 'common' }));
                }
                setIsSubmittingOfficeHours(false);
            })
            .catch((error) => {
                console.error('Update error:', error);
                alert(t('An error occurred', { ns: 'common' }));
                setIsSubmittingOfficeHours(false);
            });
    };

    const handleCloseOfficeHoursDialog = () => {
        setUpdateOfficeHoursConfirmed(false);
        window.location.reload();
    };

    if (!user || (!is_TaiGer_Agent(user) && !is_TaiGer_Editor(user))) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!isLoaded || !students) {
        return <Loading />;
    }
    TabTitle(`Office Hours`);
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    let available_termins: {
        id: number;
        title: string;
        start: Date;
        end: Date;
        provider: typeof user;
    }[] = [];
    available_termins = [0, 1, 2, 3, 4, 5].flatMap((iter, x) =>
        [user].flatMap((agent) =>
            agent.timezone && moment.tz.zone(agent.timezone)
                ? getReorderWeekday(getTodayAsWeekday(agent.timezone)).flatMap(
                      (weekday, i) => {
                          const timeSlots =
                              agent.officehours &&
                              agent.officehours[weekday]?.active &&
                              agent.officehours[weekday].time_slots.flatMap(
                                  (time_slot, j) => {
                                      const { year, month, day } =
                                          getNextDayDate(
                                              getReorderWeekday(
                                                  getTodayAsWeekday(
                                                      agent.timezone
                                                  )
                                              ),
                                              weekday,
                                              agent.timezone,
                                              iter
                                          );
                                      const test_date = getUTCWithDST(
                                          year,
                                          month,
                                          day,
                                          agent.timezone,
                                          time_slot.value
                                      );

                                      const end_date = new Date(test_date);
                                      end_date.setMinutes(
                                          end_date.getMinutes() + 30
                                      );
                                      return {
                                          id: j * 10 + i * 100 + x * 1000 + 1,
                                          title: `${new Date(test_date)}`,
                                          start: new Date(test_date),
                                          end: end_date,
                                          provider: agent
                                      };
                                  }
                              );
                          return timeSlots || [];
                      }
                  )
                : []
        )
    );

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('Office Hours', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        aria-label="office hours tabs"
                        indicatorColor="primary"
                        onChange={handleMainTabChange}
                        scrollButtons="auto"
                        value={mainTabValue}
                        variant="scrollable"
                    >
                        <Tab
                            label={t('Calendar', { ns: 'common' })}
                            {...a11yProps(mainTabValue, 0)}
                        />
                        <Tab
                            label={t('My Events', { ns: 'common' })}
                            {...a11yProps(mainTabValue, 1)}
                        />
                        <Tab
                            label={t('Settings', { ns: 'common' })}
                            {...a11yProps(mainTabValue, 2)}
                        />
                    </Tabs>
                </Box>
                <CustomTabPanel index={0} value={mainTabValue}>
                    <MyCalendar
                        events={[...booked_events]}
                        handleChange={handleChange}
                        handleChangeReceiver={handleChangeReceiver}
                        handleModalBook={handleModalBook}
                        handleModalClose={handleModalClose}
                        handleModalCreateEvent={handleModalCreateEvent}
                        handleNewEventModalClose={handleNewEventModalClose}
                        handleSelectEvent={handleSelectEvent}
                        handleSelectSlot={handleSelectSlotAgent}
                        handleSelectStudent={handleSelectStudent}
                        handleUpdateTimeSlot={handleUpdateTimeSlot}
                        isNewEventModalOpen={isNewEventModalOpen}
                        newDescription={newDescription}
                        newEventEnd={newEventEnd}
                        newReceiver={newReceiver}
                        selectedEvent={selectedEvent}
                    />
                </CustomTabPanel>

                <CustomTabPanel index={1} value={mainTabValue}>
                    <Box sx={{ p: 2 }}>
                        <>
                            <ButtonGroup
                                aria-label="outlined primary button group"
                                style={{ marginBottom: '20px' }}
                                variant="contained"
                            >
                                <Button
                                    onClick={() => {
                                        const newParams = new URLSearchParams(
                                            searchParams
                                        );
                                        newParams.set('view', 'future');
                                        const now = new Date();
                                        newParams.set(
                                            'startTime',
                                            now.toISOString().slice(0, 16) + 'Z'
                                        );
                                        newParams.delete('endTime');
                                        setSearchParams(newParams);
                                        setViewMode('future');
                                    }}
                                    variant={
                                        viewMode === 'future'
                                            ? 'contained'
                                            : 'outlined'
                                    }
                                >
                                    {t('Upcoming', { ns: 'common' })}
                                </Button>
                                <Button
                                    onClick={() => {
                                        const newParams = new URLSearchParams(
                                            searchParams
                                        );
                                        newParams.set('view', 'past');
                                        newParams.delete('startTime');
                                        newParams.delete('endTime');
                                        setSearchParams(newParams);
                                        setViewMode('past');
                                    }}
                                    variant={
                                        viewMode === 'past'
                                            ? 'contained'
                                            : 'outlined'
                                    }
                                >
                                    {t('Past', { ns: 'common' })}
                                </Button>
                            </ButtonGroup>

                            {viewMode === 'future' ? (
                                <>
                                    {events?.filter(
                                        (event) =>
                                            isInTheFuture(event.end) &&
                                            (!event.isConfirmedReceiver ||
                                                !event.isConfirmedRequester)
                                    ).length !== 0
                                        ? _.reverse(
                                              _.sortBy(
                                                  events?.filter(
                                                      (event) =>
                                                          isInTheFuture(
                                                              event.end
                                                          ) &&
                                                          (!event.isConfirmedReceiver ||
                                                              !event.isConfirmedRequester)
                                                  ),
                                                  ['start']
                                              )
                                          )?.map((event, i) => (
                                              <EventConfirmationCard
                                                  event={event}
                                                  handleConfirmAppointmentModalOpen={
                                                      handleConfirmAppointmentModalOpen
                                                  }
                                                  handleDeleteAppointmentModalOpen={
                                                      handleDeleteAppointmentModalOpen
                                                  }
                                                  handleEditAppointmentModalOpen={
                                                      handleEditAppointmentModalOpen
                                                  }
                                                  key={i}
                                              />
                                          ))
                                        : null}
                                    <Card sx={{ p: 2 }}>
                                        <Typography variant="h6">
                                            {t('Upcoming', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                        <Box>
                                            {events?.filter(
                                                (event) =>
                                                    isInTheFuture(event.end) &&
                                                    event.isConfirmedRequester &&
                                                    event.isConfirmedReceiver
                                            ).length !== 0
                                                ? _.reverse(
                                                      _.sortBy(
                                                          events?.filter(
                                                              (event) =>
                                                                  isInTheFuture(
                                                                      event.end
                                                                  ) &&
                                                                  event.isConfirmedRequester &&
                                                                  event.isConfirmedReceiver
                                                          ),
                                                          ['start']
                                                      )
                                                  ).map((event, i) => (
                                                      <EventConfirmationCard
                                                          event={event}
                                                          handleConfirmAppointmentModalOpen={
                                                              handleConfirmAppointmentModalOpen
                                                          }
                                                          handleDeleteAppointmentModalOpen={
                                                              handleDeleteAppointmentModalOpen
                                                          }
                                                          handleEditAppointmentModalOpen={
                                                              handleEditAppointmentModalOpen
                                                          }
                                                          key={i}
                                                      />
                                                  ))
                                                : t('No upcoming event', {
                                                      ns: 'common'
                                                  })}
                                        </Box>
                                    </Card>
                                </>
                            ) : null}

                            {viewMode === 'past' ? (
                                isLoaded ? (
                                    <Card sx={{ p: 2 }}>
                                        <DateRangePickerBasic />
                                        <Typography sx={{ p: 2 }} variant="h6">
                                            {t('Past', { ns: 'common' })}
                                        </Typography>
                                        <Box>
                                            {_.reverse(
                                                _.sortBy(events, ['start'])
                                            ).map((event, i) => (
                                                <EventConfirmationCard
                                                    disabled={true}
                                                    event={event}
                                                    handleConfirmAppointmentModalOpen={
                                                        handleConfirmAppointmentModalOpen
                                                    }
                                                    handleDeleteAppointmentModalOpen={
                                                        handleDeleteAppointmentModalOpen
                                                    }
                                                    handleEditAppointmentModalOpen={
                                                        handleEditAppointmentModalOpen
                                                    }
                                                    key={i}
                                                />
                                            ))}
                                        </Box>
                                    </Card>
                                ) : (
                                    <CircularProgress />
                                )
                            ) : null}

                            <Dialog
                                onClose={handleConfirmAppointmentModalClose}
                                open={isConfirmModalOpen}
                            >
                                <DialogTitle>
                                    {t('Confirm Meeting', { ns: 'common' })}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        You are aware of this meeting time and
                                        confirm.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        color="primary"
                                        disabled={
                                            event_id === '' ||
                                            (event_temp?.description?.length ??
                                                0) === 0 ||
                                            BookButtonDisable
                                        }
                                        fullWidth
                                        onClick={(e) =>
                                            handleConfirmAppointmentModal(
                                                e,
                                                event_id,
                                                event_temp
                                            )
                                        }
                                        size="small"
                                        startIcon={
                                            BookButtonDisable ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <CheckIcon />
                                            )
                                        }
                                        variant="contained"
                                    >
                                        {t('Yes', { ns: 'common' })}
                                    </Button>
                                    <Button
                                        color="secondary"
                                        fullWidth
                                        onClick={
                                            handleConfirmAppointmentModalClose
                                        }
                                        size="small"
                                        variant="outlined"
                                    >
                                        {t('Close', { ns: 'common' })}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog
                                onClose={handleDeleteAppointmentModalClose}
                                open={isDeleteModalOpen}
                            >
                                <DialogTitle>
                                    {t('Warning', { ns: 'common' })}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        {t(
                                            'Do you want to cancel this meeting?'
                                        )}
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        color="secondary"
                                        disabled={
                                            event_id === '' || BookButtonDisable
                                        }
                                        onClick={(e) =>
                                            handleDeleteAppointmentModal(
                                                e,
                                                event_id
                                            )
                                        }
                                        size="small"
                                        startIcon={
                                            BookButtonDisable ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                <DeleteIcon />
                                            )
                                        }
                                        variant="contained"
                                    >
                                        {t('Delete', { ns: 'common' })}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    </Box>
                </CustomTabPanel>
                <CustomTabPanel index={2} value={mainTabValue}>
                    <Box sx={{ p: 3 }}>
                        <Typography
                            sx={{ mb: 3, fontWeight: 600 }}
                            variant="h5"
                        >
                            {t('Office Hours Settings', { ns: 'common' })}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography
                                sx={{ mb: 1.5, fontWeight: 500 }}
                                variant="subtitle1"
                            >
                                {t('Time zone', { ns: 'common' })}
                            </Typography>
                            <TimezoneSelect
                                displayValue="UTC"
                                isDisabled={false}
                                onChange={handleTimezoneChange}
                                value={selectedTimezone}
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography
                            sx={{ mb: 2, fontWeight: 500 }}
                            variant="subtitle1"
                        >
                            {t('Weekly Schedule', { ns: 'common' })}
                        </Typography>

                        <Grid container spacing={2}>
                            {daysOfWeek.map((day, i) => (
                                <Grid item key={i} md={4} sm={6} xs={12}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            backgroundColor: officeHours[day]
                                                ?.active
                                                ? 'action.selected'
                                                : 'background.paper',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={
                                                        officeHours[day]
                                                            ?.active || false
                                                    }
                                                    onChange={(e) =>
                                                        handleToggleDay(e, day)
                                                    }
                                                />
                                            }
                                            label={
                                                <Typography
                                                    fontWeight={500}
                                                    variant="body1"
                                                >
                                                    {day}
                                                </Typography>
                                            }
                                        />
                                        {officeHours[day]?.active ? (
                                            <Autocomplete
                                                disableCloseOnSelect
                                                getOptionLabel={(option) =>
                                                    option.label
                                                }
                                                isOptionEqualToValue={(
                                                    option,
                                                    value
                                                ) =>
                                                    option.value === value.value
                                                }
                                                multiple
                                                onChange={(e, newValue) =>
                                                    handleTimeSlotsChange(
                                                        e,
                                                        newValue,
                                                        day
                                                    )
                                                }
                                                options={time_slots}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={t('Time Slots', {
                                                            ns: 'common'
                                                        })}
                                                        placeholder={t(
                                                            'Select time slots',
                                                            {
                                                                ns: 'common'
                                                            }
                                                        )}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                                renderOption={(
                                                    props,
                                                    option,
                                                    { selected }
                                                ) => (
                                                    <li {...props}>
                                                        <Checkbox
                                                            checked={selected}
                                                            checkedIcon={
                                                                checkedIcon
                                                            }
                                                            icon={icon}
                                                            style={{
                                                                marginRight: 8
                                                            }}
                                                        />
                                                        {option.label}
                                                    </li>
                                                )}
                                                sx={{ width: '100%' }}
                                                value={
                                                    officeHours[day]
                                                        ?.time_slots || []
                                                }
                                            />
                                        ) : (
                                            <Typography
                                                color="text.secondary"
                                                sx={{ ml: 4.5 }}
                                                variant="body2"
                                            >
                                                {t('Closed', { ns: 'common' })}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <Button
                                color="primary"
                                disabled={
                                    !isOfficeHoursModified ||
                                    isSubmittingOfficeHours
                                }
                                onClick={handleSubmitOfficeHours}
                                size="large"
                                variant="contained"
                            >
                                {isSubmittingOfficeHours
                                    ? t('Updating...', { ns: 'common' })
                                    : t('Update', { ns: 'common' })}
                            </Button>
                        </Box>
                    </Box>
                </CustomTabPanel>
            </Card>
            <Dialog
                onClose={handleEditAppointmentModalClose}
                open={isEditModalOpen}
            >
                <DialogTitle>{t('Edit', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <TextField
                        error={(event_temp?.description?.length ?? 0) > 2000}
                        fullWidth
                        inputProps={{ maxLength: 2000 }}
                        label="請寫下想討論的主題"
                        multiline
                        onChange={(e) => handleUpdateDescription(e)}
                        placeholder="Example：我想定案選校、選課，我想討論簽證，德語班。"
                        rows={10}
                        value={event_temp?.description || ''}
                    />
                    <Badge
                        color={
                            (event_temp?.description?.length ?? 0) > 2000
                                ? 'error'
                                : 'primary'
                        }
                    >
                        <Typography component="span">
                            {event_temp?.description?.length || 0}/{2000}
                        </Typography>
                    </Badge>
                    <Typography variant="body1">Student: </Typography>
                    {event_temp?.requester_id?.map((requester, idx) => (
                        <Typography fontWeight="bold" key={idx}>
                            {requester.firstname} {requester.lastname}
                        </Typography>
                    ))}
                    <Typography>
                        Time zone: {user.timezone}. (Please update it in{' '}
                        <a href="/profile" rel="noreferrer" target="_blank">
                            Profile
                        </a>
                        )
                    </Typography>
                    <br />
                    <FormControl fullWidth>
                        <InputLabel id="time-slot">
                            {t('Time Slot', { ns: 'common' })}
                        </InputLabel>
                        <Select
                            id="study_group"
                            label="Select target group"
                            labelId="time-slot"
                            name="study_group"
                            onChange={(e) => handleUpdateTimeSlot(e)}
                            value={
                                event_temp?.start
                                    ? new Date(event_temp.start).toString()
                                    : ''
                            }
                        >
                            {available_termins
                                .sort((a, b) => (a.start < b.start ? -1 : 1))
                                .map((time_slot) => (
                                    <MenuItem
                                        key={`${time_slot.start}`}
                                        value={time_slot.start.toISOString()}
                                    >
                                        {time_slot.start.toLocaleString()} to{' '}
                                        {time_slot.end.toLocaleString()}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="primary"
                        disabled={
                            event_id === '' ||
                            (event_temp?.description?.length ?? 0) === 0 ||
                            BookButtonDisable
                        }
                        onClick={(e) =>
                            handleEditAppointmentModal(e, event_id, event_temp)
                        }
                        size="small"
                        startIcon={
                            BookButtonDisable ? (
                                <CircularProgress size={16} />
                            ) : (
                                <CheckIcon />
                            )
                        }
                        variant="contained"
                    >
                        {BookButtonDisable ? (
                            <CircularProgress size={16} />
                        ) : (
                            t('Update', { ns: 'common' })
                        )}
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleEditAppointmentModalClose}
                        size="small"
                        startIcon={<CloseIcon />}
                        variant="outlined"
                    >
                        {t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
            {(is_TaiGer_Agent(user) || is_TaiGer_Editor(user)) && (
                <CreateNewEventModal
                    BookButtonDisable={BookButtonDisable}
                    available_termins={available_termins_full}
                    events={events}
                    handleModalCreateEvent={handleModalCreateEvent}
                    handleNewEventModalClose={handleNewEventModalClose}
                    handleSelectStudent={handleSelectStudent}
                    handleUpdateTimeSlot={handleUpdateTimeSlotAgent}
                    isNewEventModalOpen={isNewEventModalOpen}
                    newEventStart={newEventStart}
                    student_id={student_id}
                    students={students}
                />
            )}

            <Dialog
                aria-labelledby="office-hours-update-dialog-title"
                onClose={handleCloseOfficeHoursDialog}
                open={updateOfficeHoursConfirmed}
            >
                <DialogTitle id="office-hours-update-dialog-title">
                    {t('Update Successfully', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('Office Hours time slots updated', {
                            ns: 'common'
                        })}{' '}
                        {t('Successfully', { ns: 'common' })}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={handleCloseOfficeHoursDialog}
                        variant="contained"
                    >
                        {t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaiGerOfficeHours;
