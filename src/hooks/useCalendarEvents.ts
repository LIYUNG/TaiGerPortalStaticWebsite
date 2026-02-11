import { ChangeEvent, FormEvent, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import queryString from 'query-string';

import { confirmEvent, deleteEvent, postEvent, updateEvent } from '@api';
import { getEventsQuery, getBookedEventsQuery } from '@api/query';
import { useStudentsV3 } from '@hooks/useStudentsV3';
import {
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Student
} from '@taiger-common/core';
import { useAuth } from '@components/AuthProvider';
import { getUTCWithDST, time_slots } from '@utils/contants';
import { useSnackBar } from '@contexts/use-snack-bar';
import { queryClient } from '@api/client';

export interface UseCalendarEventsProps {
    startTime: string;
    endTime: string;
    requester_id?: string;
    receiver_id?: string;
    isAll?: boolean;
}

function useCalendarEvents(props: UseCalendarEventsProps) {
    const { user } = useAuth();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

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

    const bookedEventsQuery = useQuery({
        ...getBookedEventsQuery({
            startTime: props.startTime,
            endTime: props.endTime
        }),
        enabled: !props.isAll && is_TaiGer_Student(user)
    });
    const studentsParams = is_TaiGer_Agent(user)
        ? { agents: user?._id, archiv: false }
        : { editors: user?._id, archiv: false };
    const studentsQuery = useStudentsV3(studentsParams, {
        enabled:
            !props.isAll &&
            (is_TaiGer_Agent(user) || is_TaiGer_Editor(user)) &&
            !!user?._id
    });

    const eventsResponse = eventsQuery.data?.data || {};
    const events = eventsResponse.data || [];
    const agents = eventsResponse.agents || {};
    const editors = eventsResponse.editors || [];
    const students = studentsQuery.data || [];
    const hasEvents = eventsResponse.hasEvents || false;
    const booked_events = bookedEventsQuery.data?.data?.data || [];
    const res_status = eventsQuery.data?.status || 0;
    const success = eventsResponse.success || false;

    const [calendarEventsState, setCalendarEventsState] = useState<{
        student_id: string;
        isDeleteModalOpen: boolean;
        isEditModalOpen: boolean;
        isConfirmModalOpen: boolean;
        event_temp: Record<string, unknown>;
        event_id: string;
        selectedEvent: Record<string, unknown>;
        newReceiver: string;
        BookButtonDisable: boolean;
        newDescription: string;
        newEventStart: Date | string | null;
        newEventEnd: Date | string | null;
        isNewEventModalOpen: boolean;
        res_modal_message: string;
        res_modal_status: number;
        selected_year: number | null;
        selected_month: number | null;
        selected_day: number | null;
        showBookedEvents: boolean;
    }>({
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
        showBookedEvents: false
    });

    const createEventMutation = useMutation({
        mutationFn: (eventData: Record<string, unknown>) =>
            postEvent(eventData),
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false
            }));
        },
        onSuccess: async () => {
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

            setCalendarEventsState((prevState) => ({
                ...prevState,
                newDescription: '',
                newReceiver: '',
                selectedEvent: {},
                student_id: '',
                showBookedEvents: true,
                isNewEventModalOpen: false,
                BookButtonDisable: false
            }));
            setSeverity('success');
            setMessage('Meeting created successfully!');
            setOpenSnackbar(true);
        }
    });

    const handleModalCreateEvent = (
        newEvent: Record<string, unknown>
    ): void => {
        const eventWrapper = { ...newEvent };
        if (is_TaiGer_Agent(user) || is_TaiGer_Editor(user)) {
            const temp_std = students.find(
                (std: { _id: { toString: () => string } }) =>
                    std._id.toString() === calendarEventsState.student_id
            );
            if (temp_std) {
                eventWrapper.title = `${temp_std.firstname} ${temp_std.lastname} ${temp_std.firstname_chinese ?? ''} ${temp_std.lastname_chinese ?? ''}`;
                eventWrapper.requester_id = calendarEventsState.student_id;
                eventWrapper.receiver_id = user._id?.toString();
            }
        }
        createEventMutation.mutate(eventWrapper);
    };

    const handleModalBook = (e: FormEvent): void => {
        e.preventDefault();
        let eventWrapper: Record<string, unknown> = {};

        if (calendarEventsState.newEventStart) {
            const startDate =
                calendarEventsState.newEventStart instanceof Date
                    ? calendarEventsState.newEventStart
                    : new Date(calendarEventsState.newEventStart);

            const endDate =
                calendarEventsState.newEventEnd instanceof Date
                    ? calendarEventsState.newEventEnd
                    : calendarEventsState.newEventEnd
                      ? new Date(calendarEventsState.newEventEnd as string)
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
            eventWrapper = { ...calendarEventsState.selectedEvent };
        }

        if (is_TaiGer_Student(user)) {
            eventWrapper.requester_id = user._id?.toString();
            eventWrapper.description = calendarEventsState.newDescription;
            eventWrapper.receiver_id = calendarEventsState.newReceiver;
        }
        createEventMutation.mutate(eventWrapper);
    };

    const confirmEventMutation = useMutation({
        mutationFn: ({
            eventId,
            updatedEvent
        }: {
            eventId: string;
            updatedEvent: Record<string, unknown>;
        }) => confirmEvent(eventId, updatedEvent),
        onSuccess: async (resp: { status?: number }) => {
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

            setSeverity('success');
            setMessage('Meeting confirmed successfully!');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                isConfirmModalOpen: false,
                event_temp: {},
                event_id: '',
                BookButtonDisable: false,
                res_modal_status: status ?? 0
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false
            }));
        }
    });

    const handleConfirmAppointmentModal = (
        e: FormEvent,
        event_id: string,
        updated_event: Record<string, unknown>
    ): void => {
        e.preventDefault();
        confirmEventMutation.mutate({
            eventId: event_id,
            updatedEvent: updated_event
        });
    };

    const updateEventMutation = useMutation({
        mutationFn: ({
            eventId,
            updatedEvent
        }: {
            eventId: string;
            updatedEvent: Record<string, unknown>;
        }) => updateEvent(eventId, updatedEvent),
        onSuccess: async () => {
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

            setSeverity('success');
            setMessage('Meeting updated successfully!');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                isEditModalOpen: false,
                BookButtonDisable: false,
                event_id: ''
            }));
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false
            }));
        }
    });

    const handleEditAppointmentModal = (
        e: FormEvent,
        event_id: string,
        updated_event: Record<string, unknown>
    ): void => {
        e.preventDefault();
        updateEventMutation.mutate({
            eventId: event_id,
            updatedEvent: updated_event
        });
    };

    const deleteEventMutation = useMutation({
        mutationFn: (eventId: string) => deleteEvent(eventId),
        onSuccess: async () => {
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

            setCalendarEventsState((prevState) => ({
                ...prevState,
                event_id: '',
                BookButtonDisable: false,
                isDeleteModalOpen: false
            }));
            setSeverity('success');
            setMessage('Meeting deleted successfully!');
            setOpenSnackbar(true);
        },
        onMutate: () => {
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: true
            }));
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
            setCalendarEventsState((prevState) => ({
                ...prevState,
                BookButtonDisable: false
            }));
        }
    });

    const handleDeleteAppointmentModal = (
        e: FormEvent,
        event_id: string
    ): void => {
        e.preventDefault();
        deleteEventMutation.mutate(event_id);
    };

    const handleConfirmAppointmentModalOpen = (
        e: MouseEvent,
        event: { _id: { toString: () => string }; [key: string]: unknown }
    ): void => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isConfirmModalOpen: true,
            event_temp: event,
            event_id: event._id.toString()
        }));
    };

    const handleEditAppointmentModalOpen = (
        e: MouseEvent,
        event: { _id: { toString: () => string }; [key: string]: unknown }
    ): void => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isEditModalOpen: true,
            event_temp: event,
            event_id: event._id.toString()
        }));
    };

    const handleUpdateDescription = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const new_description_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            event_temp: {
                ...prevState.event_temp,
                description: new_description_temp
            }
        }));
    };

    const handleUpdateTimeSlot = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
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

    const handleUpdateTimeSlotAgent = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
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

    const handleConfirmAppointmentModalClose = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isConfirmModalOpen: false
        }));
    };

    const handleEditAppointmentModalClose = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isEditModalOpen: false
        }));
    };

    const handleDeleteAppointmentModalClose = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isDeleteModalOpen: false
        }));
    };

    const handleDeleteAppointmentModalOpen = (
        e: MouseEvent,
        event: { _id: { toString: () => string } }
    ): void => {
        e.preventDefault();
        e.stopPropagation();
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isDeleteModalOpen: true,
            event_id: event._id.toString()
        }));
    };

    const handleModalClose = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            selectedEvent: {},
            newDescription: '',
            newReceiver: ''
        }));
    };

    const handleChangeReceiver = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const receiver_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newReceiver: receiver_temp
        }));
    };

    const handleSelectEvent = (event: Record<string, unknown>): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            selectedEvent: event
        }));
    };
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const description_temp = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newDescription: description_temp
        }));
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            newEventStart: slotInfo.start,
            newEventEnd: slotInfo.end,
            isNewEventModalOpen: true
        }));
    };

    const handleSelectSlotAgent = (slotInfo: {
        start: Date;
        end: Date;
    }): void => {
        const Some_Date = new Date(slotInfo.start);
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

    const handleSelectAvailableTermin = (timeSlot: {
        start: Date | string;
        end: Date | string;
        provider?: { _id?: string | { toString: () => string } };
    }): void => {
        const startDate = new Date(timeSlot.start);
        const endDate = new Date(timeSlot.end);
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();

        const receiverId =
            timeSlot.provider?._id?.toString?.() ??
            (timeSlot.provider?._id as string) ??
            '';

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

    const handleNewEventModalClose = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            isNewEventModalOpen: false,
            newDescription: ''
        }));
    };

    const ConfirmError = (): void => {
        setCalendarEventsState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const handleSelectStudent = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const student_id = e.target.value;
        setCalendarEventsState((prevState) => ({
            ...prevState,
            student_id
        }));
    };

    let available_termins_full: Array<{
        id: number;
        title: string;
        start: Date;
        end: Date;
    }> = [];
    function getAvailableTermins({
        selected_day,
        selected_month,
        selected_year
    }: {
        selected_day: number | null;
        selected_month: number | null;
        selected_year: number | null;
    }) {
        return time_slots.flatMap((time_slot: { value: string }, j: number) => {
            const year = selected_year;
            const month = selected_month;
            const day = selected_day;

            const test_date = getUTCWithDST(
                year ?? 0,
                month ?? 0,
                day ?? 0,
                (user as { timezone?: string })?.timezone ?? '',
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
            };
        });
    }
    if (
        (is_TaiGer_Agent(user) || is_TaiGer_Editor(user)) &&
        calendarEventsState.selected_year
    ) {
        available_termins_full = getAvailableTermins({
            selected_day: calendarEventsState.selected_day,
            selected_month: calendarEventsState.selected_month,
            selected_year: calendarEventsState.selected_year
        });
    }

    return {
        events,
        agents,
        editors,
        hasEvents,
        showBookedEvents: calendarEventsState.showBookedEvents,
        booked_events,
        isLoaded: eventsQuery.isLoading === false,
        isLoading: eventsQuery.isLoading,
        error: eventsQuery.error,
        res_status,
        success,
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
        students,
        student_id: calendarEventsState.student_id,
        available_termins_full,
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
        handleSelectSlot,
        handleSelectSlotAgent,
        handleSelectAvailableTermin,
        handleNewEventModalClose,
        handleModalCreateEvent,
        handleSelectStudent,
        res_modal_message: calendarEventsState.res_modal_message,
        res_modal_status: calendarEventsState.res_modal_status,
        ConfirmError,
        refetch: eventsQuery.refetch
    };
}

export default useCalendarEvents;
