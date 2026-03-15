import type { IUserWithId } from '@taiger-common/model';

import EditUserListSubpage, {
    type EssayDocumentThreadForWriters
} from './EditUserListSubpage';

export interface EditEssayWritersSubpageProps {
    show: boolean;
    onHide: () => void;
    actor: string;
    essayDocumentThread: EssayDocumentThreadForWriters;
    editors?: IUserWithId[];
    isSubmitting?: boolean;
    submitUpdateEssayWriterlist: (
        e: React.SyntheticEvent,
        updateEssayWriterList: Record<string, boolean>,
        essayDocumentThread_id: string
    ) => void;
}

const EditEssayWritersSubpage = (props: EditEssayWritersSubpageProps) => (
    <EditUserListSubpage
        actor={props.actor}
        essayDocumentThread={props.essayDocumentThread}
        editors={props.editors}
        isSubmitting={props.isSubmitting}
        onHide={props.onHide}
        show={props.show}
        submitUpdateList={props.submitUpdateEssayWriterlist}
        variant="essay_writer"
    />
);

export default EditEssayWritersSubpage;
