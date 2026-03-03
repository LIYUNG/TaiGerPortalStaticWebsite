import MessageContainer from './MessageContainer';
import type { ThreadMessage } from '@components/Message/MessageCard';
import type { IUserWithId } from '@taiger-common/model';

interface MessageListProps {
    thread: ThreadMessage[];
    accordionKeys: number[];
    isUpperMessagList: boolean;
    isDeleting?: boolean;
    isTaiGerView?: boolean;
    onDeleteSingleMessage?: (messageId: string) => void;
    onTrashClick?: (messageId: string) => void;
    student_id: string;
    user?: IUserWithId;
    lastupdate?: string;
}

const MessageList = (props: MessageListProps) => {
    const messageList = props.thread.map(
        (message: ThreadMessage, i: number) => (
            <MessageContainer
                accordionKeys={props.accordionKeys}
                idx={props.isUpperMessagList ? props.thread.length - i - 1 : i}
                isDeleting={props.isDeleting}
                isTaiGerView={props.isTaiGerView}
                key={message._id.toString()}
                lastupdate={props.lastupdate}
                message={message}
                onDeleteSingleMessage={props.onDeleteSingleMessage}
                onTrashClick={props.onTrashClick}
                student_id={props.student_id}
            />
        )
    );
    return messageList;
};

export default MessageList;
