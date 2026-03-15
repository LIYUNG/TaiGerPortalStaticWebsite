import type { IStudentResponse } from '@taiger-common/model';

import EditUserListSubpage from './EditUserListSubpage';

interface Props {
    onHide: () => void;
    show: boolean;
    student: IStudentResponse;
    submitUpdateEditorlist: (
        e: React.SyntheticEvent,
        updateEditorList: Record<string, boolean>,
        student_id: string
    ) => void;
}

const EditEditorsSubpage = (props: Props) => (
    <EditUserListSubpage
        onHide={props.onHide}
        show={props.show}
        student={props.student}
        submitUpdateList={props.submitUpdateEditorlist}
        variant="editor"
    />
);

export default EditEditorsSubpage;
