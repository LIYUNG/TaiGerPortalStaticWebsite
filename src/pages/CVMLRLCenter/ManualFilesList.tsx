import type {
    IApplicationPopulated,
    IStudentResponse
} from '@taiger-common/model';

import EditableFileThread from './EditableFileThread';

interface ManualFilesListProps {
    application: IApplicationPopulated | null;
    student: IStudentResponse;
    handleAsFinalFile: (...args: unknown[]) => void;
    isLocked?: boolean;
    onDeleteFileThread: (...args: unknown[]) => void;
    onDeleteProgramSpecificThread?: (...args: unknown[]) => void;
    onFormSubmit?: (...args: unknown[]) => void;
    onTrashClick?: (...args: unknown[]) => void;
}

const ManualFilesList = (props: ManualFilesListProps) => {
    let message_threads;
    if (props.application === null) {
        // general
        message_threads = props.student.generaldocs_threads
            ? props.student.generaldocs_threads.map((thread) => (
                  <EditableFileThread
                      application={props.application}
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
              ))
            : '';
    } else {
        // program specific
        message_threads =
            props.application && props.application.doc_modification_thread
                ? props.application.doc_modification_thread.map((thread) => (
                      <EditableFileThread
                          application={props.application}
                          decided={props.application.decided}
                          handleAsFinalFile={props.handleAsFinalFile}
                          isApplicationLocked={props.isLocked}
                          isProgramLocked={props.isLocked}
                          key={thread._id}
                          onDeleteFileThread={props.onDeleteFileThread}
                          onDeleteProgramSpecificThread={
                              props.onDeleteProgramSpecificThread
                          }
                          onTrashClick={props.onTrashClick}
                          program_id={props.application.programId._id}
                          student={props.student}
                          thread={thread}
                      />
                  ))
                : '';
    }

    return message_threads;
};

export default ManualFilesList;
