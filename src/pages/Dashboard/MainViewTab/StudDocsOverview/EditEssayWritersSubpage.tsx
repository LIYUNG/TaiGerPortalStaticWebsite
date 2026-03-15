import EditUserListSubpage, {
    type EssayDocumentThreadForWriters
} from './EditUserListSubpage';

export interface EditEssayWritersSubpageProps {
    actor: string;
    essayDocumentThread: EssayDocumentThreadForWriters;
    isSubmitting?: boolean;
    onHide: () => void;
    show: boolean;
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
        isSubmitting={props.isSubmitting}
        onHide={props.onHide}
        show={props.show}
        submitUpdateList={props.submitUpdateEssayWriterlist}
        variant="essay_writer"
    />
);

export default EditEssayWritersSubpage;
