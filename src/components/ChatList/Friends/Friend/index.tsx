import React from 'react';
import {
    Avatar,
    Box,
    Divider,
    Grid,
    MenuItem,
    Typography,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
    convertDateUXFriendly,
    menuWidth,
    stringAvatar
} from '../../../../utils/contants';
import DEMO from '../../../../store/constant';
import { truncateText } from '../../../../Demo/Utils/checking-functions';
import { useAuth } from '../../../AuthProvider';
import { useTranslation } from 'react-i18next';

interface FriendData {
    _id?: { toString: () => string };
    firstname?: string;
    lastname?: string;
    firstname_chinese?: string;
    lastname_chinese?: string;
    pictureUrl?: string;
    latestCommunication?: {
        message?: string;
        user_id?: { toString: () => string };
        student_id?: { toString: () => string };
        readBy?: string[];
        createdAt?: string;
        ignore_message?: boolean;
    };
}

interface FriendProps {
    data: FriendData;
    activeId: string;
    handleCloseChat?: () => void;
}

const Friend = (props: FriendProps) => {
    const navigate = useNavigate();
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

    const handleToChat = () => {
        props.handleCloseChat?.();
        navigate(
            `${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(props.data?._id?.toString() ?? '')}`
        );
    };

    return (
        <MenuItem
            onClick={handleToChat}
            sx={{
                width: menuWidth,
                backgroundColor:
                    props.data?.latestCommunication?.readBy?.includes(
                        props.activeId
                    ) ||
                    props.data?.latestCommunication?.user_id?.toString() ===
                        user._id?.toString()
                        ? theme.palette.background.default
                        : theme.palette.action.disabled
            }}
            title={`${
                props.data.lastname_chinese ? props.data.lastname_chinese : ''
            }${props.data.firstname_chinese ? props.data.firstname_chinese : ''} ${
                props.data.firstname
            } ${props.data.lastname}`}
        >
            <Grid alignItems="center" container justifyContent="space-between">
                <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        alt={`${props.data.firstname} ${props.data.lastname}`}
                        {...stringAvatar(
                            `${props.data.firstname} ${props.data.lastname}`
                        )}
                        src={props.data?.pictureUrl}
                    />
                    <Box
                        style={{
                            marginLeft: '10px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1px'
                        }}
                    >
                        <Typography
                            color="text.primary"
                            fontWeight="bold"
                            variant="body1"
                        >
                            {truncateText(
                                `${
                                    props.data.lastname_chinese
                                        ? props.data.lastname_chinese
                                        : ''
                                }${
                                    props.data.firstname_chinese
                                        ? props.data.firstname_chinese
                                        : ''
                                } ${props.data.firstname} ${props.data.lastname}`,
                                30
                            )}
                        </Typography>
                        <Typography variant="caption">
                            {`${
                                user._id?.toString() === lastReply?.toString()
                                    ? `${t('You', { ns: 'common' })}: `
                                    : ''
                            }${truncateText(firstText, 26)} ${
                                props.data?.latestCommunication?.createdAt
                                    ? `• ${convertDateUXFriendly(
                                          props.data.latestCommunication
                                              .createdAt
                                      )}`
                                    : ''
                            }`}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box
                        style={{
                            textAlign: 'right',
                            padding: '8px 8px'
                        }}
                    >
                        <Typography variant="body2">
                            {props.data?.latestCommunication?.user_id?.toString() ===
                                props.data?.latestCommunication?.student_id?.toString() &&
                            props.data?.latestCommunication?.ignore_message !==
                                true ? (
                                <FiberManualRecordIcon
                                    fontSize="small"
                                    style={{ marginLeft: '4px' }}
                                    title="Not Reply Yet"
                                />
                            ) : null}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Divider />
        </MenuItem>
    );
};

export default Friend;
