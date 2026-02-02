import React from 'react';
import { Link as LinkDom, useParams } from 'react-router-dom';
import {
    Avatar,
    Chip,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';

import {
    ATTRIBUTES,
    COLORS,
    convertDateUXFriendly,
    stringAvatar
} from '../../../../utils/contants';
import DEMO from '../../../../store/constant';
import { truncateText } from '../../../../Demo/Utils/util_functions';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth } from '../../../AuthProvider';
import { useTranslation } from 'react-i18next';

interface EmbeddedFriendData {
    _id?: { toString: () => string };
    firstname?: string;
    lastname?: string;
    firstname_chinese?: string;
    lastname_chinese?: string;
    pictureUrl?: string;
    attributes?: Array<{ _id: string; name: string; value: number }>;
    latestCommunication?: {
        message?: string;
        user_id?: { toString: () => string };
        student_id?: { toString: () => string };
        readBy?: string[];
        createdAt?: string;
        ignore_message?: boolean;
    };
}

interface AttributeChipsProps {
    attributes?: Array<{ _id: string; name: string; value: number }>;
}

const AttributeChips = ({ attributes }: AttributeChipsProps) =>
    attributes?.map((attribute) =>
        [1, 3, 8, 9, 10, 11].includes(attribute.value) ? (
            <Tooltip
                key={attribute._id}
                title={`${attribute.name}: ${
                    ATTRIBUTES[attribute.value - 1].definition
                }`}
            >
                <Chip
                    color={
                        COLORS[attribute.value] as
                            | 'default'
                            | 'primary'
                            | 'secondary'
                            | 'error'
                            | 'info'
                            | 'success'
                            | 'warning'
                    }
                    data-testid={`chip-${attribute.name}`}
                    label={attribute.name[0]}
                    size="small"
                />
            </Tooltip>
        ) : null
    ) ?? null;

interface EmbeddedFriendProps {
    data: EmbeddedFriendData;
    activeId: string;
}

const Friend = (props: EmbeddedFriendProps) => {
    const { student_id } = useParams<{ student_id?: string }>();
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const parsedObject = JSON.parse(
        props.data.latestCommunication?.message || '{}'
    ) as { blocks?: Array<{ type?: string; data?: { text?: string } }> };
    const lastReply = props.data.latestCommunication?.user_id;

    const firstText = parsedObject?.blocks?.length
        ? parsedObject.blocks
              .map((block) =>
                  block?.type === 'paragraph' ? block.data?.text : ''
              )
              ?.join('')
              .replace(/<\/?[^>]+(>|$)|&[^;]+;?/g, '') || ''
        : '';

    const isMessageRead =
        props.data?.latestCommunication?.readBy?.includes(props.activeId) ||
        props.data?.latestCommunication?.user_id?.toString() ===
            user._id?.toString();

    const backgroundColor = isMessageRead
        ? theme.palette.background.default
        : theme.palette.action.disabled;

    const isReplyNeeded =
        props.data?.latestCommunication?.user_id?.toString() ===
            props.data?.latestCommunication?.student_id?.toString() &&
        props.data?.latestCommunication?.ignore_message !== true;

    return (
        <ListItem
            disablePadding
            key={props.data?._id?.toString()}
            sx={{
                backgroundColor: backgroundColor,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover
                },
                transition: 'background-color 0.3s ease-in-out',
                color: isMessageRead
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary
            }}
        >
            <ListItemButton
                component={LinkDom}
                selected={props.data?._id?.toString() === student_id}
                title={`${
                    props.data.lastname_chinese
                        ? props.data.lastname_chinese
                        : ''
                }${props.data.firstname_chinese ? props.data.firstname_chinese : ''}${
                    props.data.firstname
                } ${props.data.lastname}`}
                to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                    props.data?._id?.toString() ?? ''
                )}`}
            >
                <ListItemIcon>
                    <IconButton edge="start">
                        <Avatar
                            alt={`${props.data.firstname} ${props.data.lastname}`}
                            {...stringAvatar(
                                `${props.data.firstname} ${props.data.lastname}`
                            )}
                            src={props.data?.pictureUrl}
                        />
                    </IconButton>
                    <ListItemText
                        primary={
                            <Typography style={{ fontWeight: 'bold' }}>
                                <AttributeChips attributes={props.data?.attributes} />
                                {truncateText(
                                    `${
                                        props.data.lastname_chinese
                                            ? props.data.lastname_chinese
                                            : ''
                                    } ${
                                        props.data.firstname_chinese
                                            ? props.data.firstname_chinese
                                            : ''
                                    } ${props.data.firstname} ${props.data.lastname}`,
                                    21
                                )}
                            </Typography>
                        }
                        secondary={`${
                            user._id?.toString() === lastReply?.toString()
                                ? `${t('You', { ns: 'common' })}: `
                                : ''
                        }${truncateText(firstText, 14)} • ${convertDateUXFriendly(
                            props.data?.latestCommunication?.createdAt
                        )}`}
                        style={{
                            marginLeft: '10px',
                            flex: 1
                        }}
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end">
                            {isReplyNeeded ? (
                                <FiberManualRecordIcon
                                    fontSize="small"
                                    style={{ marginLeft: '4px' }}
                                    title="Not Reply Yet"
                                />
                            ) : null}
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItemIcon>
            </ListItemButton>
        </ListItem>
    );
};

export default Friend;
