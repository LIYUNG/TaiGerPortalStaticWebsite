import type { IStudentResponse } from '@taiger-common/model';

import EditUserListSubpage from './EditUserListSubpage';

interface Props {
    onHide: () => void;
    show: boolean;
    student: IStudentResponse;
    submitUpdateAgentlist: (
        e: React.SyntheticEvent,
        updateAgentList: Record<string, boolean>,
        student_id: string
    ) => void;
}

const EditAgentsSubpage = (props: Props) => (
    <EditUserListSubpage
        onHide={props.onHide}
        show={props.show}
        student={props.student}
        submitUpdateList={props.submitUpdateAgentlist}
        variant="agent"
    />
);

export default EditAgentsSubpage;
