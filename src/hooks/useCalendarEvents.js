import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';

import { confirmEvent, deleteEvent, postEvent, updateEvent } from '../api';
import {
    getEventsQuery,
    getBookedEventsQuery,
    getStudentsV3Query
} from '../api/query';
import { is_TaiGer_Agent, is_TaiGer_Student } from '@taiger-common/core';
import { useAuth } from '../components/AuthProvider';
import { getUTCWithDST, time_slots } from '../utils/contants';

function useCalendarEvents(props) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Query for fetching events
    const eventsQuery = useQuery(
        getEventsQuery(
            queryString.stringify({
                startTime: props.startTime,
                endTime: props.endTime,
                requester_id: props.requester_id,
                receiver_id: props.receiver_id
            })
        )
    );

    // Query for fetching booked events (only for students)
    const bookedEventsQuery = useQuery({
        ...getBookedEventsQuery({
            startTime: props.startTime,
            endTime: props.endTime
        }),
        enabled: !props.isAll && is_TaiGer_Student(user)
    });

    // Query for fetching students (only for agents)
    const studentsQuery = useQuery({
        ...getStudentsV3Query(`agents=${user?._id}&archiv=false`),
        enabled: !props.isAll && is_TaiGer_Agent(user) && !!user?._id
    });

    // Extract data from query response
    const eventsResponse = eventsQuery.data?.data || {};
    const events = eventsResponse.data || [];
    const agents = eventsResponse.agents || {};
    const students = studentsQuery.data?.data || [];
    const hasEvents = eventsResponse.hasEvents || false;
    const booked_events = bookedEventsQuery.data?.data?.data || [];
    const res_status = eventsQuery.data?.status || 0;
    const success = eventsResponse.success || false;

    // UI state management
    const [calendarEventsState, setCalendarEventsState] = useState({
        student_id: '',
        isDeleteModalOpen: false,
        isEditModalOpen: false,
        isConfirmModalOpen: false,
        event_temp: {},
        event_id: '',
        selectedEvent: {},
        newReceiver: '',
        BookButtonDisable: false,
        newDescription: '',
        newEventStart: null,
        newEventEnd: null,
        isNewEventModalOpen: false,
        res_modal_message: '',
        res_modal_status: 0,
        selected_year: null,
        selected_month: null,
        selected_day: null,
        showBookedEvents: false // View state: false = calendar view, true = booked events view
    });

    // Mutation for creating events
    const createEventMutation = useMutation({
        mutationFn: (eventData) => postEvent(eventData),
        onSuccess: async (resp) => {
            const { success } = resp.data;
            const { status } = resp;
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['events', 'booked'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['students/v3'],
                exact: false
            });
            if (success) {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    newDescription: '',
                    newReceiver: '',
                    selectedEvent: {},
                    student_id: '',
                    showBookedEvents: true,
                    isNewEventModalOpen: false,
                    BookButtonDisable: false,
                    res_modal_status: status
                }));
            } else {
                const { message } = resp.data;
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    newDescription: '',
                    newReceiver: '',
                    selectedEvent: {},
                    isNewEventModalOpen: false,
                    BookButtonDisable: false,
                    res_modal_message: message,
                    res_modal_status: status
                }));
            }
        },
        onError: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                newDescription: '',
                newReceiver: '',
                isNewEventModalOpen: false,
                selectedEvent: {},
                BookButtonDisable: false
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        }
    });

    // Only Agent can request
    const handleModalCreateEvent = (newEvent) => {
        const eventWrapper = { ...newEvent };
        if (is_TaiGer_Agent(user)) {
            const temp_std = students.find(
                (std) => std._id.toString() === calendarEventsState.student_id
            );
            if (temp_std) {
                eventWrapper.title = `${temp_std.firstname} ${temp_std.lastname} ${temp_std.firstname_chinese} ${temp_std.lastname_chinese}`;
                eventWrapper.requester_id = calendarEventsState.student_id;
                eventWrapper.receiver_id = user._id.toString();
            }
        }
        createEventMutation.mutate(eventWrapper);
    };

    const handleModalBook = (e) => {
        e.preventDefault();
        let eventWrapper = {};

        // If booking from available time slots, create event from newEventStart/newEventEnd
        if (calendarEventsState.newEventStart) {
            // Ensure we have Date objects
            const startDate =
                calendarEventsState.newEventStart instanceof Date
                    ? calendarEventsState.newEventStart
                    : new Date(calendarEventsState.newEventStart);

            const endDate =
                calendarEventsState.newEventEnd instanceof Date
                    ? calendarEventsState.newEventEnd
                    : calendarEventsState.newEventEnd
                      ? new Date(calendarEventsState.newEventEnd)
                      : (() => {
                            const end = new Date(startDate);
                            end.setMinutes(end.getMinutes() + 30);
                            return end;
                        })();

            eventWrapper = {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            };
        } else {
            // Otherwise, use selectedEvent (for calendar slot booking)
            eventWrapper = { ...calendarEventsState.selectedEvent };
        }

        if (is_TaiGer_Student(user)) {
            eventWrapper.requester_id = user._id.toString();
            eventWrapper.description = calendarEventsState.newDescription;
            eventWrapper.receiver_id = calendarEventsState.newReceiver;
        }
        createEventMutation.mutate(eventWrapper);
    };

    // Mutation for confirming events
    const confirmEventMutation = useMutation({
        mutationFn: ({ eventId, updatedEvent }) =>
            confirmEvent(eventId, updatedEvent),
        onSuccess: async (resp) => {
            const { success } = resp.data;
            const { status } = resp;
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['events', 'booked'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['students/v3'],
                exact: false
            });
            if (success) {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    isConfirmModalOpen: false,
                    event_temp: {},
                    event_id: '',
                    BookButtonDisable: false,
                    res_status: status
                }));
            } else {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    event_temp: {},
                    event_id: '',
                    BookButtonDisable: false,
                    res_status: status
                }));
            }
        },
        onError: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false,
                res_status: 500
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        }
    });

    const handleConfirmAppointmentModal = (e, event_id, updated_event) => {
        e.preventDefault();
        confirmEventMutation.mutate({
            eventId: event_id,
            updatedEvent: updated_event
        });
    };

    // Mutation for updating events
    const updateEventMutation = useMutation({
        mutationFn: ({ eventId, updatedEvent }) =>
            updateEvent(eventId, updatedEvent),
        onSuccess: async (resp) => {
            const { success } = resp.data;
            const { status } = resp;
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['events', 'booked'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['students/v3'],
                exact: false
            });
            if (success) {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    isEditModalOpen: false,
                    BookButtonDisable: false,
                    event_id: '',
                    res_status: status
                }));
            } else {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    BookButtonDisable: false,
                    event_id: '',
                    res_status: status
                }));
            }
        },
        onError: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false,
                res_status: 500
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        }
    });

    const handleEditAppointmentModal = (e, event_id, updated_event) => {
        e.preventDefault();
        updateEventMutation.mutate({
            eventId: event_id,
            updatedEvent: updated_event
        });
    };

    // Mutation for deleting events
    const deleteEventMutation = useMutation({
        mutationFn: (eventId) => deleteEvent(eventId),
        onSuccess: async (resp) => {
            const { success } = resp.data;
            const { status } = resp;
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['events', 'booked'],
                exact: false
            });
            await queryClient.invalidateQueries({
                queryKey: ['students/v3'],
                exact: false
            });
            if (success) {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    event_id: '',
                    BookButtonDisable: false,
                    isDeleteModalOpen: false,
                    res_status: status
                }));
            } else {
                setCalendarEventsState((prevState) => ({
                    ...prevState,
                    event_id: '',
                    BookButtonDisable: false,
                    res_status: status
                }));
            }
        },
        onError: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false,
                res_status: 500
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        }
    });

    const handleDeleteAppointmentModal = (e, event_id) => {
        e.preventDefault();
        deleteEventMutation.mutate(event_id);
    };

    const handleConfirmAppointmentModalOpen = (e, event) => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isConfirmModalOpen: true,
            event_temp: event,
            event_id: event._id.toString()
        }));
    };

    const handleEditAppointmentModalOpen = (e, event) => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isEditModalOpen: true,
            event_temp: event,
            event_id: event._id.toString()
        }));
    };

    const handleUpdateDescription = (e) => {
        const new_description_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            event_temp: {
                ...prevState.event_temp,
                description: new_description_temp
            }
        }));
    };

    const handleUpdateTimeSlot = (e) => {
        const new_timeslot_temp = e.target.value;
        const startDate = new Date(new_timeslot_temp);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 30);
        setCalendarEventsState((prevState) => ({
            ...prevState,
            event_temp: { ...prevState.event_temp, start: new_timeslot_temp },
            newEventStart: startDate,
            newEventEnd: endDate
        }));
    };

    const handleUpdateTimeSlotAgent = (e) => {
        const new_timeslot_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            event_temp: {
                ...prevState.event_temp,
                start: new_timeslot_temp
            },
            newEventStart: new_timeslot_temp
        }));
    };

    const handleConfirmAppointmentModalClose = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isConfirmModalOpen: false
        }));
    };

    const handleEditAppointmentModalClose = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isEditModalOpen: false
        }));
    };

    const handleDeleteAppointmentModalClose = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isDeleteModalOpen: false
        }));
    };

    const handleDeleteAppointmentModalOpen = (e, event) => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isDeleteModalOpen: true,
            event_id: event._id.toString()
        }));
    };

    const handleModalClose = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            selectedEvent: {},
            newDescription: '',
            newReceiver: ''
        }));
    };

    const handleChangeReceiver = (e) => {
        const receiver_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newReceiver: receiver_temp
        }));
    };

    // Calendar handler:
    const handleSelectEvent = (event) => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            selectedEvent: event
        }));
    };
    const handleChange = (e) => {
        const description_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newDescription: description_temp
        }));
    };

    const handleSelectSlot = (slotInfo) => {
        // When an empty date slot is clicked, open the modal to create a new event
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newEventStart: slotInfo.start,
            newEventEnd: slotInfo.end,
            isNewEventModalOpen: true
        }));
    };

    const handleSelectSlotAgent = (slotInfo) => {
        // When an empty date slot is clicked, open the modal to create a new event
        const Some_Date = new Date(slotInfo.start); //bug
        const year = Some_Date.getFullYear();
        const month = Some_Date.getMonth() + 1;
        const day = Some_Date.getDate();

        setCalendarEventsState((prevState) => ({
            ...prevState,
            newEventStart: slotInfo.start,
            newEventEnd: slotInfo.end,
            isNewEventModalOpen: true,
            selected_year: year,
            selected_month: month,
            selected_day: day
        }));
    };

    // Handler for clicking on an available time slot (termin) to book a meeting
    const handleSelectAvailableTermin = (timeSlot) => {
        const startDate = new Date(timeSlot.start);
        const endDate = new Date(timeSlot.end);
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();

        // Auto-select the provider agent if available
        const receiverId =
            timeSlot.provider?._id?.toString() || timeSlot.provider?._id || '';

        // Set event_temp to match the structure expected by the dialog
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newEventStart: startDate,
            newEventEnd: endDate,
            newReceiver: receiverId,
            event_temp: {
                ...prevState.event_temp,
                start: startDate,
                end: endDate,
                receiver_id: timeSlot.provider
                    ? [timeSlot.provider]
                    : prevState.event_temp.receiver_id
            },
            isNewEventModalOpen: true,
            selected_year: year,
            selected_month: month,
            selected_day: day
        }));
    };

    const handleNewEventModalClose = () => {
        // Close the modal for creating a new event
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isNewEventModalOpen: false,
            newDescription: ''
        }));
    };

    const ConfirmError = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const handleSelectStudent = (e) => {
        const student_id = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            student_id: student_id
        }));
    };

    // View management: Toggle between calendar view and booked events view
    // This is placed after all handler functions for better organization
    const switchCalendarAndMyBookedEvents = () => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            showBookedEvents: !prevState.showBookedEvents
        }));
    };

    let available_termins_full = [];
    function getAvailableTermins({
        selected_day,
        selected_month,
        selected_year
    }) {
        return time_slots.flatMap((time_slot, j) => {
            const year = selected_year;
            const month = selected_month;
            const day = selected_day;

            const test_date = getUTCWithDST(
                year,
                month,
                day,
                user.timezone,
                time_slot.value
            );
            const start_date = new Date(test_date);
            const end_date = new Date(start_date);
            end_date.setMinutes(end_date.getMinutes() + 30);
            return {
                id: j * 10,
                title: `${start_date.getHours()}:${time_slot.value.split(':')[1]}`,
                start: start_date,
                end: end_date
                // provider: agent
            };
        });
    }
    if (is_TaiGer_Agent(user) && calendarEventsState.selected_year) {
        available_termins_full = getAvailableTermins({
            selected_day: calendarEventsState.selected_day,
            selected_month: calendarEventsState.selected_month,
            selected_year: calendarEventsState.selected_year
        });
    }

    return {
        events: events,
        agents: agents,
        hasEvents: hasEvents, // Data flag: whether there are events from API
        showBookedEvents: calendarEventsState.showBookedEvents, // View state: which view to show
        booked_events: booked_events,
        isLoaded: eventsQuery.isLoading === false,
        isLoading: eventsQuery.isLoading,
        error: eventsQuery.error,
        res_status: res_status,
        success: success,
        isConfirmModalOpen: calendarEventsState.isConfirmModalOpen,
        event_id: calendarEventsState.event_id,
        event_temp: calendarEventsState.event_temp,
        BookButtonDisable: calendarEventsState.BookButtonDisable,
        isEditModalOpen: calendarEventsState.isEditModalOpen,
        newReceiver: calendarEventsState.newReceiver,
        newDescription: calendarEventsState.newDescription,
        selectedEvent: calendarEventsState.selectedEvent,
        newEventStart: calendarEventsState.newEventStart,
        newEventEnd: calendarEventsState.newEventEnd,
        isNewEventModalOpen: calendarEventsState.isNewEventModalOpen,
        isDeleteModalOpen: calendarEventsState.isDeleteModalOpen,
        students: students,
        student_id: calendarEventsState.student_id,
        available_termins_full: available_termins_full,
        handleConfirmAppointmentModalOpen: handleConfirmAppointmentModalOpen,
        handleEditAppointmentModalOpen: handleEditAppointmentModalOpen,
        handleModalBook: handleModalBook,
        handleUpdateDescription: handleUpdateDescription,
        handleEditAppointmentModal: handleEditAppointmentModal,
        handleConfirmAppointmentModal: handleConfirmAppointmentModal,
        handleDeleteAppointmentModal: handleDeleteAppointmentModal,
        handleUpdateTimeSlot: handleUpdateTimeSlot,
        handleUpdateTimeSlotAgent: handleUpdateTimeSlotAgent,
        handleConfirmAppointmentModalClose: handleConfirmAppointmentModalClose,
        handleEditAppointmentModalClose: handleEditAppointmentModalClose,
        handleDeleteAppointmentModalClose: handleDeleteAppointmentModalClose,
        handleDeleteAppointmentModalOpen: handleDeleteAppointmentModalOpen,
        handleModalClose: handleModalClose,
        handleChangeReceiver: handleChangeReceiver,
        handleSelectEvent: handleSelectEvent,
        handleChange: handleChange,
        handleSelectSlot: handleSelectSlot,
        handleSelectSlotAgent: handleSelectSlotAgent,
        handleSelectAvailableTermin: handleSelectAvailableTermin,
        handleNewEventModalClose: handleNewEventModalClose,
        switchCalendarAndMyBookedEvents: switchCalendarAndMyBookedEvents,
        handleModalCreateEvent: handleModalCreateEvent,
        handleSelectStudent: handleSelectStudent,
        res_modal_message: calendarEventsState.res_modal_message,
        res_modal_status: calendarEventsState.res_modal_status,
        ConfirmError,
        refetch: eventsQuery.refetch
    };
}

export default useCalendarEvents;
