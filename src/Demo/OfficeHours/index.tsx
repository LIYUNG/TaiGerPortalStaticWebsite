import React from 'react';
import {
    Avatar,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import moment from 'moment-timezone';
import {
    Navigate,
    useParams,
    Link as LinkDom,
    useSearchParams
} from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import _ from 'lodash';
import { is_TaiGer_Student } from '@taiger-common/core';
import { differenceInDays } from 'date-fns';

import {
    getNextDayDate,
    getTodayAsWeekday,
    getReorderWeekday,
    shiftDateByOffset,
    getTimezoneOffset,
    isInTheFuture,
    getUTCWithDST
} from '../../utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import Banner from '../../components/Banner/Banner';
import { TabTitle } from '../Utils/TabTitle';
import MyCalendar from '../../components/Calendar/components/Calendar';

import EventConfirmationCard from '../../components/Calendar/components/EventConfirmationCard';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import { appConfig } from '../../config';
import { CustomTabPanel, a11yProps } from '../../components/Tabs';
import useCalendarEvents from '../../hooks/useCalendarEvents';

const tabNameToIndexMap = {
    calendar: 0,
    events: 1,
    timeslots: 2
} as const;
const indexToTabNameMap: Record<number, keyof typeof tabNameToIndexMap> = {
    0: 'calendar',
    1: 'events',
    2: 'timeslots'
};

const OfficeHours = () => {
    const { user } = useAuth();
    const { user_id } = useParams();
    const { t } = useTranslation();
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const startTime = searchParams.get('startTime') || '';
    const endTime = searchParams.get('endTime') || '';
    const {
        events,
        agents,
        editors,
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
        handleConfirmAppointmentModalOpen,
        handleEditAppointmentModalOpen,
        handleModalBook,
        handleUpdateDescription,
        handleEditAppointmentModal,
        handleConfirmAppointmentModal,
        handleDeleteAppointmentModal,
        handleUpdateTimeSlot,
        handleConfirmAppointmentModalClose,
        handleEditAppointmentModalClose,
        handleDeleteAppointmentModalClose,
        handleDeleteAppointmentModalOpen,
        handleModalClose,
        handleChangeReceiver,
        handleSelectEvent,
        handleChange,
        handleSelectSlot,
        handleSelectAvailableTermin,
        handleNewEventModalClose,
        newEventStart,
        res_modal_message,
        res_modal_status,
        ConfirmError
    } = useCalendarEvents({
        user_id,
        startTime: startTime || '',
        endTime: endTime || '',
        requester_id: user_id
    });

    const getTabIndexFromName = (name: string | null): number => {
        if (name && name in tabNameToIndexMap) {
            return tabNameToIndexMap[name as keyof typeof tabNameToIndexMap];
        }
        return 0;
    };
    const tabParam = searchParams.get('tab');
    const value = tabParam ? getTabIndexFromName(tabParam) : 0;

    const handleChangeValue = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        const newParams = new URLSearchParams(searchParams);
        if (newValue === 0) {
            newParams.delete('tab');
        } else {
            const tabName = indexToTabNameMap[newValue];
            if (tabName) {
                newParams.set('tab', tabName);
            }
        }
        setSearchParams(newParams);
    };

    if (!user || !is_TaiGer_Student(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!isLoaded) {
        return <Loading />;
    }
    TabTitle(`Office Hours`);
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const available_termins_func = (users: typeof agents) => {
        return [0, 1, 2, 3, 4, 5].flatMap((iter, x) =>
            users.flatMap((agent) =>
                agent && agent.timezone && moment.tz.zone(agent.timezone)
                    ? getReorderWeekday(
                          getTodayAsWeekday(agent.timezone)
                      ).flatMap((weekday, i) => {
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
                                      const hour = parseInt(
                                          time_slot.value.split(':')[0],
                                          10
                                      );
                                      const minutes = parseInt(
                                          time_slot.value.split(':')[1],
                                          10
                                      );
                                      const time_difference =
                                          getTimezoneOffset(
                                              Intl.DateTimeFormat().resolvedOptions()
                                                  .timeZone
                                          ) - getTimezoneOffset(agent.timezone);
                                      const condition = booked_events.some(
                                          (booked_event) =>
                                              new Date(
                                                  booked_event.start
                                              ).toISOString() ===
                                                  shiftDateByOffset(
                                                      new Date(
                                                          year,
                                                          month - 1,
                                                          day,
                                                          hour,
                                                          minutes
                                                      ),
                                                      time_difference
                                                  ).toISOString() &&
                                              booked_event.receiver_id?.some(
                                                  (receiver) =>
                                                      receiver._id === agent._id
                                              )
                                      );
                                      const end_date = new Date(test_date);
                                      end_date.setMinutes(
                                          end_date.getMinutes() + 30
                                      );
                                      const available_time_slot = {
                                          id: j * 10 + i * 100 + x * 1000 + 1,
                                          title: `${user.firstname} ${user.lastname} ${
                                              user.firstname_chinese || ''
                                          } ${user.lastname_chinese || ''}`,
                                          start: new Date(test_date),
                                          end: end_date,
                                          provider: agent
                                      };
                                      if (condition) {
                                          return [];
                                      } else {
                                          return available_time_slot;
                                      }
                                  }
                              );
                          return timeSlots || [];
                      })
                    : []
            )
        );
    };

    let available_termins: ReturnType<typeof available_termins_func> = [];
    available_termins = available_termins_func([...agents, ...editors]);

    const receiver = event_temp?.receiver_id?.[0];
    const agent_or_editor = [...agents, ...editors].find(
        (u) => u.email === receiver?.email
    );
    const single_agent_editor_available_termins = available_termins_func(
        receiver && agent_or_editor ? [agent_or_editor] : []
    );

    const has_officehours = available_termins?.length !== 0;

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
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
                    {t('Office Hours', { ns: 'interviews' })}
                </Typography>
            </Breadcrumbs>

            <>
                <Box>
                    <Card sx={{ p: 2, my: 2 }}>
                        <Typography variant="h6">
                            {t('Office Hours')}
                        </Typography>
                        <Typography variant="body1">{t('Note')}</Typography>
                        <Typography variant="body2">
                            請一次只能約一個時段。為了有效率的討論，請詳述您的問題，並讓
                            Agent 有時間消化。
                        </Typography>
                    </Card>
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        aria-label="basic tabs example"
                        onChange={handleChangeValue}
                        scrollButtons="auto"
                        value={value}
                        variant="scrollable"
                    >
                        <Tab
                            label={t('Calendar', { ns: 'common' })}
                            {...a11yProps(value, 0)}
                        />
                        <Tab
                            label={t('My Events', { ns: 'common' })}
                            {...a11yProps(value, 1)}
                        />
                        <Tab
                            label={t('Available Timeslots', { ns: 'common' })}
                            {...a11yProps(value, 2)}
                        />
                    </Tabs>
                </Box>
                <CustomTabPanel index={0} value={value}>
                    {events?.filter(
                        (event) =>
                            differenceInDays(event.start, new Date()) >= -1
                    ).length !== 0 ? (
                        <Banner
                            ReadOnlyMode={true}
                            bg="primary"
                            link_name=""
                            notification_key={undefined}
                            path="/"
                            removeBanner={null}
                            text={
                                <>
                                    在您目前預訂的時段過後，您將可以再次預約時段。
                                </>
                            }
                            title="info"
                        />
                    ) : null}
                    {!has_officehours ? (
                        <Banner
                            ReadOnlyMode={true}
                            bg="primary"
                            link_name=""
                            notification_key={undefined}
                            path="/"
                            removeBanner={null}
                            text={
                                <>
                                    目前 Agent 無空出 Office hours
                                    時段，請聯繫您的 Agent。
                                </>
                            }
                            title="info"
                        />
                    ) : null}
                    <MyCalendar
                        BookButtonDisable={BookButtonDisable}
                        events={[...available_termins]}
                        handleChange={handleChange}
                        handleChangeReceiver={handleChangeReceiver}
                        handleModalBook={handleModalBook}
                        handleModalClose={handleModalClose}
                        handleNewEventModalClose={handleNewEventModalClose}
                        handleSelectEvent={handleSelectEvent}
                        handleSelectSlot={handleSelectSlot}
                        handleUpdateTimeSlot={handleUpdateTimeSlot}
                        isNewEventModalOpen={isNewEventModalOpen}
                        newDescription={newDescription}
                        newEventEnd={newEventEnd}
                        newReceiver={newReceiver}
                        selectedEvent={selectedEvent}
                    />
                </CustomTabPanel>
                <CustomTabPanel index={1} value={value}>
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
                                              isInTheFuture(event.end) &&
                                              (!event.isConfirmedReceiver ||
                                                  !event.isConfirmedRequester)
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
                            : null}
                        <Card sx={{ p: 2 }}>
                            <Box>
                                <Typography variant="h6">
                                    {t('Upcoming', { ns: 'common' })}
                                </Typography>
                                <Typography>
                                    {events?.filter(
                                        (event) =>
                                            isInTheFuture(event.end) &&
                                            event.isConfirmedReceiver &&
                                            event.isConfirmedRequester
                                    ).length !== 0
                                        ? _.reverse(
                                              _.sortBy(
                                                  events?.filter(
                                                      (event) =>
                                                          isInTheFuture(
                                                              event.end
                                                          ) &&
                                                          event.isConfirmedReceiver &&
                                                          event.isConfirmedRequester
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
                                </Typography>
                            </Box>
                        </Card>
                        <Card>
                            <Typography sx={{ p: 2 }} variant="h6">
                                {t('Past', { ns: 'common' })}
                            </Typography>
                            <Typography>
                                {_.reverse(
                                    _.sortBy(
                                        events?.filter(
                                            (event) => !isInTheFuture(event.end)
                                        ),
                                        ['start']
                                    )
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
                            </Typography>
                        </Card>
                        <Dialog
                            onClose={handleConfirmAppointmentModalClose}
                            open={isConfirmModalOpen}
                        >
                            <DialogTitle>
                                {t('Warning', { ns: 'common' })}
                            </DialogTitle>
                            <DialogContent>
                                {t(
                                    'You are aware of this meeting time and confirm.'
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    color="primary"
                                    disabled={
                                        event_id === '' ||
                                        event_temp?.description?.length === 0 ||
                                        BookButtonDisable
                                    }
                                    onClick={(e) =>
                                        handleConfirmAppointmentModal(
                                            e,
                                            event_id,
                                            event_temp
                                        )
                                    }
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
                                    color="primary"
                                    onClick={handleConfirmAppointmentModalClose}
                                    variant="contained"
                                >
                                    {t('Close', { ns: 'common' })}
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog
                            onClose={handleEditAppointmentModalClose}
                            open={isEditModalOpen}
                        >
                            <DialogTitle>
                                <Typography variant="h6">
                                    {t('Update Meeting', { ns: 'common' })}
                                </Typography>
                                <Typography>
                                    {t(
                                        'Please write down the topic you want to discuss'
                                    )}
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <TextField
                                    fullWidth
                                    inputProps={{ maxLength: 2000 }}
                                    error={
                                        (event_temp?.description?.length ?? 0) >
                                        2000
                                    }
                                    minRows={5}
                                    multiline
                                    onChange={(e) => handleUpdateDescription(e)}
                                    placeholder="Example：我想定案選校、選課，我想討論簽證，德語班。"
                                    value={event_temp?.description || ''}
                                />
                                <Badge
                                    color={
                                        (event_temp?.description?.length ?? 0) >
                                        2000
                                            ? 'error'
                                            : 'primary'
                                    }
                                >
                                    <Typography component="span">
                                        {event_temp?.description?.length || 0}/
                                        {2000}
                                    </Typography>
                                </Badge>
                                <Typography>
                                    <PersonIcon fontSize="small" />
                                    {t('Agent', { ns: 'common' })} or{' '}
                                    {t('Editor', { ns: 'common' })}:{' '}
                                    {event_temp?.receiver_id?.map(
                                        (receiver, x) => (
                                            <span key={x}>
                                                {receiver.firstname}{' '}
                                                {receiver.lastname}{' '}
                                                <MailOutlineIcon fontSize="small" />{' '}
                                                {receiver.email}
                                            </span>
                                        )
                                    )}
                                </Typography>
                                <FormControl fullWidth sx={{ my: 2 }}>
                                    <InputLabel id="Time_Slot">
                                        {t('Time Slot', { ns: 'common' })}
                                    </InputLabel>
                                    <Select
                                        id="time_slot"
                                        onChange={(e) =>
                                            handleUpdateTimeSlot(e)
                                        }
                                        size="small"
                                        value={
                                            event_temp?.start
                                                ? new Date(
                                                      event_temp.start
                                                  ).toISOString()
                                                : ''
                                        }
                                    >
                                        {single_agent_editor_available_termins
                                            .sort((a, b) =>
                                                a.start < b.start ? -1 : 1
                                            )
                                            .filter((event) =>
                                                event_temp?.receiver_id?.some(
                                                    (r_id) =>
                                                        event.provider?._id?.toString() ===
                                                        r_id?._id?.toString()
                                                )
                                            )
                                            .map((time_slot) => (
                                                <MenuItem
                                                    key={`${time_slot.start}`}
                                                    value={time_slot.start.toISOString()}
                                                >
                                                    {time_slot.start.toLocaleString()}{' '}
                                                    to{' '}
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
                                        (event_temp?.description?.length ??
                                            0) === 0 ||
                                        BookButtonDisable
                                    }
                                    onClick={(e) =>
                                        handleEditAppointmentModal(
                                            e,
                                            event_id,
                                            event_temp
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
                                {t('Do you want to cancel this meeting?')}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    color="primary"
                                    disabled={
                                        event_id === '' || BookButtonDisable
                                    }
                                    onClick={(e) =>
                                        handleDeleteAppointmentModal(
                                            e,
                                            event_id
                                        )
                                    }
                                    variant="contained"
                                >
                                    {BookButtonDisable ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        t('Delete', { ns: 'common' })
                                    )}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                </CustomTabPanel>
                <CustomTabPanel index={2} value={value}>
                    <Typography variant="h6">
                        {t('Available Timeslots')}
                    </Typography>
                    {available_termins
                        .sort((a, b) => (a.start < b.start ? -1 : 1))
                        .map((time_slot, j) => (
                            <Card
                                key={j}
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 2,
                                    justifyContent: 'space-between',
                                    mb: 2,
                                    p: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flex: 1,
                                        flexDirection: 'column',
                                        gap: 1.5
                                    }}
                                >
                                    <Box
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}
                                    >
                                        <AccessTimeIcon
                                            color="primary"
                                            fontSize="small"
                                            sx={{ opacity: 0.8 }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 600 }}
                                            variant="h6"
                                        >
                                            {time_slot.start?.toLocaleString()}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            →
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: 600 }}
                                            variant="h6"
                                        >
                                            {time_slot.end?.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    {time_slot.provider && (
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                gap: 1.5
                                            }}
                                        >
                                            <Avatar
                                                src={
                                                    time_slot.provider
                                                        .pictureUrl
                                                }
                                                sx={{
                                                    height: 36,
                                                    width: 36,
                                                    border: `2px solid ${theme.palette.divider}`
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 500,
                                                        lineHeight: 1.3
                                                    }}
                                                    variant="body2"
                                                >
                                                    {
                                                        time_slot.provider
                                                            .firstname
                                                    }{' '}
                                                    {
                                                        time_slot.provider
                                                            .lastname
                                                    }
                                                </Typography>
                                                {time_slot.provider.email && (
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            lineHeight: 1.2
                                                        }}
                                                        variant="caption"
                                                    >
                                                        {
                                                            time_slot.provider
                                                                .email
                                                        }
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                                <Button
                                    color="primary"
                                    onClick={() =>
                                        handleSelectAvailableTermin(time_slot)
                                    }
                                    size="medium"
                                    variant="contained"
                                >
                                    {t('Book', { ns: 'common' })}
                                </Button>
                            </Card>
                        ))}
                </CustomTabPanel>
                <Dialog
                    onClose={handleNewEventModalClose}
                    open={isNewEventModalOpen}
                >
                    <DialogTitle>
                        {t('Please write down the topic you want to discuss')}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            inputProps={{ maxLength: 2000 }}
                            error={(newDescription?.length ?? 0) > 2000}
                            minRows={5}
                            multiline
                            onChange={handleChange}
                            placeholder="Example：我想定案選校、選課，我想討論簽證，德語班。"
                            value={newDescription || ''}
                        />
                        <Badge
                            color={
                                (newDescription?.length ?? 0) > 2000
                                    ? 'error'
                                    : 'primary'
                            }
                        >
                            <Typography component="span">
                                {newDescription?.length || 0}/2000
                            </Typography>
                        </Badge>
                        {newReceiver && [...agents, ...editors]?.length > 0 && (
                            <Typography sx={{ mt: 2 }}>
                                <PersonIcon fontSize="small" />
                                {t('Agent', { ns: 'common' })} or{' '}
                                {t('Editor', { ns: 'common' })} :{' '}
                                {[...agents, ...editors]
                                    .filter(
                                        (agent) =>
                                            agent._id?.toString() ===
                                            newReceiver.toString()
                                    )
                                    .map((agent, x) => (
                                        <span key={x}>
                                            {agent.firstname} {agent.lastname}{' '}
                                            <MailOutlineIcon fontSize="small" />{' '}
                                            {agent.email}
                                        </span>
                                    ))}
                            </Typography>
                        )}
                        {newEventStart && (
                            <FormControl fullWidth sx={{ my: 2 }}>
                                <InputLabel id="Time_Slot">
                                    {t('Time Slot', { ns: 'common' })}
                                </InputLabel>
                                <Select
                                    id="time_slot"
                                    onChange={(e) => handleUpdateTimeSlot(e)}
                                    readOnly={true}
                                    size="small"
                                    value={
                                        newEventStart
                                            ? newEventStart.toISOString()
                                            : ''
                                    }
                                >
                                    {available_termins
                                        .sort((a, b) =>
                                            a.start < b.start ? -1 : 1
                                        )
                                        .map((time_slot) => (
                                            <MenuItem
                                                key={`${time_slot.start}`}
                                                value={time_slot.start.toISOString()}
                                            >
                                                {time_slot.start.toLocaleString()}{' '}
                                                to{' '}
                                                {time_slot.end.toLocaleString()}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            disabled={
                                !newDescription ||
                                newDescription.length === 0 ||
                                !newReceiver ||
                                BookButtonDisable
                            }
                            onClick={handleModalBook}
                            variant="contained"
                        >
                            {BookButtonDisable ? (
                                <CircularProgress size={16} />
                            ) : (
                                t('Book', { ns: 'common' })
                            )}
                        </Button>
                        <Button
                            onClick={handleNewEventModalClose}
                            variant="outlined"
                        >
                            {t('Cancel', { ns: 'common' })}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        </Box>
    );
};

export default OfficeHours;
