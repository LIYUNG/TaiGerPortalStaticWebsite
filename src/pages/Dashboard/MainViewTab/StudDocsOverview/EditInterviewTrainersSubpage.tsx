import type { IInterviewWithId, IUserWithId } from '@taiger-common/model';

import EditUserListSubpage, {
    type InterviewForTrainers
} from './EditUserListSubpage';

interface Props {
    actor: string;
    interview: IInterviewWithId & {
        program_id?: {
            school?: string;
            program_name?: string;
            degree?: string;
            semester?: string;
        };
        student_id?: { _id?: string; firstname?: string; lastname?: string };
        trainer_id?: IUserWithId[];
    };
    isSubmitting?: boolean;
    onHide: () => void;
    setmodalhide?: () => void;
    show: boolean;
    submitUpdateInterviewTrainerlist: (
        e: React.MouseEvent<HTMLElement>,
        updateTrainerList: Record<string, boolean>,
        interview_id: string
    ) => void;
}

const EditInterviewTrainersSubpage = (props: Props) => (
    <EditUserListSubpage
        actor={props.actor}
        interview={props.interview as InterviewForTrainers}
        isSubmitting={props.isSubmitting}
        onHide={props.onHide}
        show={props.show}
        submitUpdateList={(e, updateList, entityId) =>
            props.submitUpdateInterviewTrainerlist(
                e as React.MouseEvent<HTMLElement>,
                updateList,
                entityId
            )
        }
        variant="interview_trainer"
    />
);

export default EditInterviewTrainersSubpage;
