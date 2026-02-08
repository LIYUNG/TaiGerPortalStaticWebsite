import { useEffect, useState } from 'react';
import {
    updateAgents,
    updateArchivStudents,
    updateAttributes,
    updateEditors,
    updateProfileDocumentStatus
} from '../api';

interface StudentRecord {
    _id: string;
    [key: string]: unknown;
}

interface UseStudentsProps {
    students: StudentRecord[];
}

function useStudents(props: UseStudentsProps) {
    const [studentsState, setStudentsState] = useState({
        error: '' as unknown,
        students: props.students,
        updateAgentList: {} as Record<string, unknown>,
        updateEditorList: {} as Record<string, unknown>,
        success: false,
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        setStudentsState((prevState) => ({
            ...prevState,
            students: props.students
        }));
    }, [props.students?.length]);

    const submitUpdateAgentlist = (
        e: React.FormEvent,
        updateAgentList: unknown,
        student_id: string
    ): void => {
        e.preventDefault();
        UpdateAgentlist(e, updateAgentList, student_id);
    };

    const submitUpdateEditorlist = (
        e: React.FormEvent,
        updateEditorList: unknown,
        student_id: string
    ): void => {
        e.preventDefault();
        UpdateEditorlist(e, updateEditorList, student_id);
    };

    const submitUpdateAttributeslist = (
        e: React.FormEvent,
        updateEditorList: unknown,
        student_id: string
    ): void => {
        e.preventDefault();
        UpdateAttributeslist(e, updateEditorList, student_id);
    };

    const UpdateAgentlist = (
        _e: React.FormEvent,
        updateAgentList: unknown,
        student_id: string
    ): void => {
        updateAgents(updateAgentList as string[], student_id).then(
            (resp: {
                data: {
                    data?: StudentRecord;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    const students_temp = [...studentsState.students];
                    const studentIdx = students_temp.findIndex(
                        ({ _id }) => _id === student_id
                    );
                    students_temp[studentIdx] = data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        students: students_temp,
                        success: success ?? false,
                        updateAgentList: [],
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setStudentsState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const UpdateEditorlist = (
        _e: React.FormEvent,
        updateEditorList: unknown,
        student_id: string
    ): void => {
        updateEditors(updateEditorList as string[], student_id).then(
            (resp: {
                data: {
                    data?: StudentRecord;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    const students_temp = [...studentsState.students];
                    const studentIdx = students_temp.findIndex(
                        ({ _id }) => _id === student_id
                    );
                    students_temp[studentIdx] = data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        students: students_temp,
                        success: success ?? false,
                        updateAgentList: [],
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setStudentsState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const UpdateAttributeslist = (
        _e: React.FormEvent,
        updateAttributesList: unknown,
        student_id: string
    ): void => {
        updateAttributes(updateAttributesList as string[], student_id).then(
            (resp: {
                data: {
                    data?: StudentRecord;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    const students_temp = [...studentsState.students];
                    const studentIdx = students_temp.findIndex(
                        ({ _id }) => _id === student_id
                    );
                    students_temp[studentIdx] = data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        students: students_temp,
                        success: success ?? false,
                        updateAgentList: [],
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setStudentsState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const updateStudentArchivStatus = (
        studentId: string,
        isArchived: boolean,
        shouldInform: boolean
    ): void => {
        updateArchivStudents(studentId, isArchived, shouldInform).then(
            (resp: {
                data: { success?: boolean; message?: string };
                status?: number;
            }) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    const students_temp = [...studentsState.students];
                    const studentIdx = students_temp.findIndex(
                        ({ _id }) => _id === studentId
                    );
                    if (studentIdx !== -1) {
                        (
                            students_temp[studentIdx] as StudentRecord & {
                                archiv?: boolean;
                            }
                        ).archiv = isArchived;
                    }
                    setStudentsState((prevState) => ({
                        ...prevState,
                        students: students_temp,
                        success: success ?? false,
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setStudentsState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onUpdateProfileFilefromstudent = (
        category: string,
        student_id: string,
        status: string,
        feedback: string
    ): void => {
        const student_arrayidx = studentsState.students.findIndex(
            (student) => student._id === student_id
        );
        const students = [...studentsState.students];
        updateProfileDocumentStatus(
            category,
            student_id,
            status,
            feedback
        ).then(
            (res: {
                data: {
                    success?: boolean;
                    data?: StudentRecord;
                    message?: string;
                };
                status?: number;
            }) => {
                const { success, data } = res.data;
                const resStatus = res.status;
                if (success && data && student_arrayidx !== -1) {
                    students[student_arrayidx] = data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        students,
                        success: success ?? false,
                        res_modal_status: resStatus ?? 0
                    }));
                } else {
                    const { message } = res.data;
                    setStudentsState((prevState) => ({
                        ...prevState,
                        res_modal_message: message ?? '',
                        res_modal_status: resStatus ?? 0
                    }));
                }
            },
            (error: unknown) => {
                setStudentsState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const ConfirmError = (): void => {
        setStudentsState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    return {
        students: studentsState.students,
        res_modal_message: studentsState.res_modal_message,
        res_modal_status: studentsState.res_modal_status,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus,
        onUpdateProfileFilefromstudent,
        ConfirmError
    };
}

export default useStudents;
