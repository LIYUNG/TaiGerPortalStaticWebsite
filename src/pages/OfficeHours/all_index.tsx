import React, { useState } from 'react';
import {
    Box,
    Button,
    Breadcrumbs,
    Card,
    CircularProgress,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { Navigate, Link as LinkDom, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { is_TaiGer_role } from '@taiger-common/core';
import type { IUserWithId } from '@taiger-common/model';
import { getUsersQuery } from '@/api/query';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { TabTitle } from '../Utils/TabTitle';
import MyCalendar from '@components/Calendar/components/Calendar';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '@components/Loading/Loading';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import useCalendarEvents from '@hooks/useCalendarEvents';
import { useCalendarRangeEvents } from '@hooks/useCalendarRangeEvents';
import { useEventsPaginated } from '@hooks/useEventsPaginated';
import { bucketEvents } from './utils/bucketEvents';
import { EventConfirmationList } from './components/EventConfirmationList';

const PAST_PAGE_SIZE = 10;

import { ConfirmAppointmentDialog } from './components/ConfirmAppointmentDialog';
import { DeleteAppointmentDialog } from './components/DeleteAppointmentDialog';
import { EditAppointmentDialog } from './components/EditAppointmentDialog';

const AllOfficeHours = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [value, setValue] = useState(0);
    const handleChangeValue = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setValue(newValue);
    };
    const receiverIdFromUrl = searchParams.get('receiver_id') || '';

    // Stable "now" pinned at mount: the boundary between the future (list
    // Pending/Upcoming) and the paginated Past window. Pinning it keeps the
    // react-query keys stable across renders (no refetch loop).
    const [nowIso] = useState(() => new Date().toISOString());

    // Calendar tab fetches only the visible date range (refetched on navigation),
    // not all events.
    const {
        calendarEvents,
        handleRangeChange,
        isFetching: isCalendarFetching
    } = useCalendarRangeEvents({
        receiver_id: receiverIdFromUrl || undefined
    });

    const { data: agentsList, isLoading: isLoadingAgents } = useQuery(
        getUsersQuery('role=Agent&archiv=false')
    );
    const agents = (agentsList as IUserWithId[] | undefined) ?? [];

    const {
        events,
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
        newEventStart,
        newEventEnd,
        isNewEventModalOpen,
        isDeleteModalOpen,
        deleteMode,
        student_id,
        students,
        handleConfirmAppointmentModalOpen,
        handleEditAppointmentModalOpen,
        handleModalBook,
        handleUpdateDescription,
        handleEditAppointmentModal,
        handleConfirmAppointmentModal,
        handleDeleteAppointmentModal,
        handleUpdateTimeSlotAgent,
        handleConfirmAppointmentModalClose,
        handleEditAppointmentModalClose,
        handleDeleteAppointmentModalClose,
        handleDeleteAppointmentModalOpen,
        handleModalClose,
        handleChangeReceiver,
        handleSelectEvent,
        handleChange,
        handleSelectSlot,
        handleNewEventModalClose,
        handleModalCreateEvent,
        handleSelectStudent,
        res_modal_message,
        res_modal_status,
        ConfirmError
    } = useCalendarEvents({
        user_id: '',
        isAll: true,
        // List "Pending"/"Upcoming" sections only need future events (end >= now);
        // "Past" is served separately by the paginated endpoint below. This also
        // removes the previously unbounded "all events" fetch.
        startTime: nowIso,
        endTime: '',
        receiver_id: receiverIdFromUrl || undefined
    });

    // "Past" list — server-side paginated (role-scoped). "Load more" grows the
    // page size; keepPreviousData keeps the list visible between fetches.
    const [pastLimit, setPastLimit] = useState(PAST_PAGE_SIZE);
    const {
        rows: pastEvents,
        rowCount: pastTotal,
        isFetching: isFetchingPast
    } = useEventsPaginated({
        page: 0,
        pageSize: pastLimit,
        before: nowIso,
        receiver_id: receiverIdFromUrl || undefined,
        sortOrder: 'desc'
    });

    const handleAgentChange = (event: { target: { value: string } }) => {
        const selectedReceiverId = event.target.value;
        const newSearchParams = new URLSearchParams(searchParams);

        if (selectedReceiverId) {
            newSearchParams.set('receiver_id', selectedReceiverId);
        } else {
            newSearchParams.delete('receiver_id');
        }

        setSearchParams(newSearchParams, { replace: true });
    };

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!isLoaded || !students) {
        return <Loading />;
    }
    TabTitle(`Office Hours`);
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    // Calendar markers come from the range-scoped query (only the visible window).
    const booked_events = calendarEvents.map((event) => ({
        ...event,
        id: event._id?.toString() ?? '',
        start: new Date(event.start),
        end: new Date(event.end),
        provider: (event.requester_id?.[0] as
            | { firstname?: string; lastname?: string }
            | undefined) || {
            firstname: 'TBD',
            lastname: 'TBD'
        }
    }));

    // Future events split into the two future list sections (Past is paginated
    // separately above). Replaces the previously duplicated inline
    // filter/sort/map blocks.
    const { pending, upcoming } = bucketEvents(events);

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
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Calendar Events', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mb: 2, mt: 2 }}>
                <FormControl fullWidth size="small" sx={{ maxWidth: 400 }}>
                    <InputLabel id="agent-select-label">
                        {t('Filter by Agent', { ns: 'common' })}
                    </InputLabel>
                    <Select
                        disabled={isLoadingAgents}
                        id="agent-select"
                        label={t('Filter by Agent', { ns: 'common' })}
                        labelId="agent-select-label"
                        onChange={handleAgentChange}
                        value={receiverIdFromUrl || ''}
                    >
                        <MenuItem value="">
                            <em>{t('All Agents', { ns: 'common' })}</em>
                        </MenuItem>
                        {isLoadingAgents ? (
                            <MenuItem disabled>
                                {t('Loading...', { ns: 'common' })}
                            </MenuItem>
                        ) : agents.length > 0 ? (
                            agents.map((agent: IUserWithId) => (
                                <MenuItem key={agent._id} value={agent._id}>
                                    {agent.firstname} {agent.lastname}
                                    {agent.email && ` (${agent.email})`}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                {t('No agents found', { ns: 'common' })}
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
                {receiverIdFromUrl && (
                    <Button
                        color="secondary"
                        onClick={() => {
                            const newSearchParams = new URLSearchParams(
                                searchParams
                            );
                            newSearchParams.delete('receiver_id');
                            setSearchParams(newSearchParams, { replace: true });
                        }}
                        size="small"
                        sx={{ ml: 2 }}
                        variant="outlined"
                    >
                        {t('Clear Filter', { ns: 'common' })}
                    </Button>
                )}
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
                        label={t('Events', { ns: 'common' })}
                        {...a11yProps(value, 1)}
                    />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={value}>
                <MyCalendar
                    BookButtonDisable={BookButtonDisable}
                    events={[...booked_events]}
                    handleChange={handleChange}
                    handleChangeReceiver={handleChangeReceiver}
                    handleModalBook={handleModalBook}
                    handleModalClose={handleModalClose}
                    handleModalCreateEvent={handleModalCreateEvent}
                    handleNewEventModalClose={handleNewEventModalClose}
                    handleSelectEvent={handleSelectEvent}
                    handleSelectSlot={handleSelectSlot}
                    handleSelectStudent={handleSelectStudent}
                    handleUpdateTimeSlot={handleUpdateTimeSlotAgent}
                    isLoading={isCalendarFetching}
                    isNewEventModalOpen={isNewEventModalOpen}
                    newDescription={newDescription}
                    newEventEnd={newEventEnd}
                    newEventStart={newEventStart}
                    newReceiver={newReceiver}
                    onRangeChange={handleRangeChange}
                    selectedEvent={
                        selectedEvent as Partial<
                            import('@components/Calendar/components/Calendar').CalendarEventType
                        > | null
                    }
                    student_id={student_id}
                    students={students}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                <>
                    <EventConfirmationList
                        events={pending}
                        handleConfirmAppointmentModalOpen={
                            handleConfirmAppointmentModalOpen
                        }
                        handleDeleteAppointmentModalOpen={
                            handleDeleteAppointmentModalOpen
                        }
                        handleEditAppointmentModalOpen={
                            handleEditAppointmentModalOpen
                        }
                    />
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">
                            {t('Upcoming', { ns: 'common' })}
                        </Typography>
                        {upcoming.length !== 0 ? (
                            <EventConfirmationList
                                events={upcoming}
                                handleConfirmAppointmentModalOpen={
                                    handleConfirmAppointmentModalOpen
                                }
                                handleDeleteAppointmentModalOpen={
                                    handleDeleteAppointmentModalOpen
                                }
                                handleEditAppointmentModalOpen={
                                    handleEditAppointmentModalOpen
                                }
                            />
                        ) : (
                            t('No upcoming event', { ns: 'common' })
                        )}
                    </Card>
                    <Card>
                        <Typography sx={{ p: 2 }} variant="h6">
                            {t('Past', { ns: 'common' })}
                        </Typography>
                        <EventConfirmationList
                            disabled
                            events={pastEvents}
                            handleConfirmAppointmentModalOpen={
                                handleConfirmAppointmentModalOpen
                            }
                            handleDeleteAppointmentModalOpen={
                                handleDeleteAppointmentModalOpen
                            }
                            handleEditAppointmentModalOpen={
                                handleEditAppointmentModalOpen
                            }
                        />
                        {pastEvents.length < pastTotal ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    p: 2
                                }}
                            >
                                <Button
                                    disabled={isFetchingPast}
                                    onClick={() =>
                                        setPastLimit(
                                            (limit) => limit + PAST_PAGE_SIZE
                                        )
                                    }
                                    startIcon={
                                        isFetchingPast ? (
                                            <CircularProgress size={16} />
                                        ) : undefined
                                    }
                                    variant="outlined"
                                >
                                    {t('Load more', { ns: 'common' })}
                                </Button>
                            </Box>
                        ) : null}
                    </Card>
                    <ConfirmAppointmentDialog
                        bookButtonDisable={BookButtonDisable}
                        event={event_temp}
                        eventId={event_id}
                        onClose={handleConfirmAppointmentModalClose}
                        onConfirm={handleConfirmAppointmentModal}
                        open={isConfirmModalOpen}
                    />
                    <DeleteAppointmentDialog
                        bookButtonDisable={BookButtonDisable}
                        eventId={event_id}
                        mode={deleteMode}
                        onClose={handleDeleteAppointmentModalClose}
                        onDelete={handleDeleteAppointmentModal}
                        open={isDeleteModalOpen}
                    />
                </>
            </CustomTabPanel>
            <EditAppointmentDialog
                bookButtonDisable={BookButtonDisable}
                event={event_temp}
                eventId={event_id}
                onClose={handleEditAppointmentModalClose}
                onUpdate={handleEditAppointmentModal}
                onUpdateDescription={handleUpdateDescription}
                open={isEditModalOpen}
            />
        </Box>
    );
};

export default AllOfficeHours;
