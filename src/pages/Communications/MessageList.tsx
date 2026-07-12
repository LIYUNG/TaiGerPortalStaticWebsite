import { Fragment } from 'react';
import { Chip, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

import MessageContainer from './MessageContainer';
import type { ThreadMessage } from '@components/Message/MessageCard';
import type { IUserWithId } from '@taiger-common/model';

interface MessageListProps {
    thread: ThreadMessage[];
    accordionKeys: number[];
    isUpperMessagList: boolean;
    isDeleting: boolean;
    /** Id of the message currently being deleted (per-row loading overlay). */
    deletingMessageId?: string | null;
    isTaiGerView: boolean;
    onDeleteSingleMessage?: (messageId: string) => void;
    student_id: string;
    user?: IUserWithId;
}

/** Used when the (optional) delete handler is not supplied by the parent. */
const noopDeleteSingleMessage = (): void => {};

const isSameDay = (a?: string | Date, b?: string | Date): boolean => {
    if (!a || !b) return false;
    return new Date(a).toDateString() === new Date(b).toDateString();
};

const MessageList = (props: MessageListProps) => {
    const { t } = useTranslation();

    // Date separator label: Today / Yesterday / a localized date.
    const dayLabel = (date: string | Date): string => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) {
            return t('Today', { ns: 'common', defaultValue: 'Today' });
        }
        if (d.toDateString() === yesterday.toDateString()) {
            return t('Yesterday', { ns: 'common', defaultValue: 'Yesterday' });
        }
        return d.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return props.thread.map((message: ThreadMessage, i: number) => {
        const previous = props.thread[i - 1];
        // Show a date divider before the first message of each calendar day.
        const showDivider =
            !!message.createdAt &&
            (i === 0 || !isSameDay(message.createdAt, previous?.createdAt));

        return (
            <Fragment key={message._id.toString()}>
                {showDivider ? (
                    <Divider sx={{ my: 1.5 }}>
                        <Chip
                            label={dayLabel(message.createdAt as string | Date)}
                            size="small"
                        />
                    </Divider>
                ) : null}
                <MessageContainer
                    accordionKeys={props.accordionKeys}
                    idx={
                        props.isUpperMessagList
                            ? props.thread.length - i - 1
                            : i
                    }
                    isDeleting={
                        props.deletingMessageId != null
                            ? message._id.toString() === props.deletingMessageId
                            : props.isDeleting
                    }
                    isTaiGerView={props.isTaiGerView}
                    message={message}
                    onDeleteSingleMessage={
                        props.onDeleteSingleMessage ?? noopDeleteSingleMessage
                    }
                    student_id={props.student_id}
                />
            </Fragment>
        );
    });
};

export default MessageList;
