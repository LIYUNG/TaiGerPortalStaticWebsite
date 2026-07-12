import type {
    IApplicationPopulated,
    IStudentResponse
} from '@taiger-common/model';

import EditableFileThread, {
    type EditableFileThreadThread
} from './EditableFileThread';

/**
 * The shared model types describe the *unpopulated* embedded thread shape
 * (`doc_thread_id?: string`, no `_id`), while the API actually returns them
 * populated. Validate at the boundary instead of trusting either type.
 */
const isPopulatedFileThread = (
    thread: unknown
): thread is EditableFileThreadThread => {
    if (typeof thread !== 'object' || thread === null) {
        return false;
    }
    if (!('_id' in thread) || !('doc_thread_id' in thread)) {
        return false;
    }
    return (
        typeof thread._id === 'string' &&
        typeof thread.doc_thread_id === 'object' &&
        thread.doc_thread_id !== null
    );
};

const populatedThreads = (threads: unknown): EditableFileThreadThread[] =>
    Array.isArray(threads) ? threads.filter(isPopulatedFileThread) : [];

interface ManualFilesListProps {
    application: IApplicationPopulated | null;
    student: IStudentResponse;
    handleAsFinalFile: (
        docThreadId: string,
        studentId: string,
        applicationId: string | undefined,
        isFinal: boolean,
        documenName: string
    ) => void;
    isLocked?: boolean;
    onDeleteFileThread: (
        docThreadId: string,
        application: IApplicationPopulated | null,
        studentId: string,
        documenName: string
    ) => void;
    onDeleteProgramSpecificThread?: (...args: unknown[]) => void;
    onFormSubmit?: (...args: unknown[]) => void;
    onTrashClick?: (...args: unknown[]) => void;
}

const ManualFilesList = (props: ManualFilesListProps) => {
    const application = props.application;
    let message_threads;
    if (application === null) {
        // general
        message_threads = props.student.generaldocs_threads
            ? populatedThreads(props.student.generaldocs_threads).map(
                  (thread) => (
                      <EditableFileThread
                          application={application}
                          decided="O"
                          handleAsFinalFile={props.handleAsFinalFile}
                          isProgramLocked={false}
                          key={thread._id}
                          onDeleteFileThread={props.onDeleteFileThread}
                          onDeleteProgramSpecificThread={
                              props.onDeleteProgramSpecificThread
                          }
                          onFormSubmit={props.onFormSubmit}
                          onTrashClick={props.onTrashClick}
                          student={props.student}
                          thread={thread}
                      />
                  )
              )
            : '';
    } else {
        // program specific
        message_threads = application.doc_modification_thread
            ? populatedThreads(application.doc_modification_thread).map(
                  (thread) => (
                      <EditableFileThread
                          application={application}
                          decided={application.decided}
                          handleAsFinalFile={props.handleAsFinalFile}
                          isApplicationLocked={props.isLocked}
                          isProgramLocked={props.isLocked}
                          key={thread._id}
                          onDeleteFileThread={props.onDeleteFileThread}
                          onDeleteProgramSpecificThread={
                              props.onDeleteProgramSpecificThread
                          }
                          onTrashClick={props.onTrashClick}
                          program_id={application.programId?._id}
                          student={props.student}
                          thread={thread}
                      />
                  )
              )
            : '';
    }

    return message_threads;
};

export default ManualFilesList;
