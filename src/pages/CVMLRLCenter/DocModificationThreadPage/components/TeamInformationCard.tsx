import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Card,
    Box,
    Avatar,
    Stack,
    Divider,
    Chip,
    Tooltip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';

import { is_TaiGer_role } from '@taiger-common/core';
import type { IUserWithId, IDocumentthreadPopulated } from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

import DEMO from '@store/constant';
import { stringAvatar } from '@utils/contants';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E
} from '../../../Utils/util_functions';

const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
};

interface TeamInformationCardProps {
    agents: IUserWithId[];
    editors: IUserWithId[];
    thread: IDocumentthreadPopulated;
    user: IUserWithId;
    teamGradient: { start: string; end: string };
    startEditingEditor: () => void;
}

const TeamInformationCard = ({
    agents,
    editors,
    thread,
    user,
    teamGradient,
    startEditingEditor
}: TeamInformationCardProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${teamGradient.start} 0%, ${teamGradient.end} 100%)`,
                    color: 'white',
                    p: 1.5
                }}
            >
                <Stack alignItems="center" direction="row" spacing={0.75}>
                    <PersonIcon fontSize="small" />
                    <Typography fontWeight="600" variant="subtitle1">
                        Your Team
                    </Typography>
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            mb: 0.75
                        }}
                        variant="overline"
                    >
                        {t('Agent', { ns: 'common' })}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {agents.length > 0 ? (
                            agents.map((agent, i) => (
                                <Tooltip
                                    key={i}
                                    title={`${agent.firstname}`}
                                >
                                    {is_TaiGer_role(user) ? (
                                        <Chip
                                            avatar={
                                                <Avatar
                                                    src={agent.pictureUrl}
                                                    {...stringAvatar(
                                                        `${agent.firstname} ${agent.lastname}`
                                                    )}
                                                    sx={{
                                                        bgcolor:
                                                            theme.palette
                                                                .primary.main,
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        width: 24,
                                                        height: 24
                                                    }}
                                                >
                                                    {getInitials(
                                                        agent.firstname,
                                                        agent.lastname
                                                    )}
                                                </Avatar>
                                            }
                                            clickable
                                            component={LinkDom}
                                            label={`${agent.firstname}`}
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                                height: 28,
                                                '&:hover': {
                                                    bgcolor: 'primary.50'
                                                }
                                            }}
                                            target="_blank"
                                            to={`${DEMO.TEAM_AGENT_LINK(agent._id.toString())}`}
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Chip
                                            avatar={
                                                <Avatar
                                                    src={agent.pictureUrl}
                                                    {...stringAvatar(
                                                        `${agent.firstname} ${agent.lastname}`
                                                    )}
                                                    sx={{
                                                        bgcolor:
                                                            theme.palette
                                                                .primary.main,
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        width: 24,
                                                        height: 24
                                                    }}
                                                >
                                                    {getInitials(
                                                        agent.firstname,
                                                        agent.lastname
                                                    )}
                                                </Avatar>
                                            }
                                            label={`${agent.firstname}`}
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                                height: 28
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Tooltip>
                            ))
                        ) : (
                            <Typography
                                color="text.secondary"
                                sx={{ fontSize: '0.85rem' }}
                                variant="body2"
                            >
                                No agents assigned
                            </Typography>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box>
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            mb: 0.75
                        }}
                        variant="overline"
                    >
                        {thread.file_type === 'Essay'
                            ? t('Essay Writer', { ns: 'common' })
                            : t('Editor', { ns: 'common' })}
                    </Typography>
                    {[
                        ...AGENT_SUPPORT_DOCUMENTS_A,
                        FILE_TYPE_E.essay_required
                    ].includes(thread.file_type) ? (
                        thread?.outsourced_user_id?.length > 0 ? (
                            <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                {thread?.outsourced_user_id?.map(
                                    (outsourcer) => (
                                        <Tooltip
                                            key={outsourcer._id}
                                            title={`${outsourcer.firstname} ${outsourcer.lastname}`}
                                        >
                                            {is_TaiGer_role(user) ? (
                                                <Chip
                                                    avatar={
                                                        <Avatar
                                                            src={
                                                                outsourcer.pictureUrl
                                                            }
                                                            {...stringAvatar(
                                                                `${outsourcer.firstname} ${outsourcer.lastname}`
                                                            )}
                                                            sx={{
                                                                bgcolor:
                                                                    theme
                                                                        .palette
                                                                        .secondary
                                                                        .main,
                                                                color: 'white',
                                                                fontSize:
                                                                    '0.65rem',
                                                                width: 24,
                                                                height: 24
                                                            }}
                                                        >
                                                            {getInitials(
                                                                outsourcer.firstname,
                                                                outsourcer.lastname
                                                            )}
                                                        </Avatar>
                                                    }
                                                    clickable
                                                    component={LinkDom}
                                                    label={`${outsourcer.firstname}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontSize: '0.8rem',
                                                        height: 28,
                                                        '&:hover': {
                                                            bgcolor:
                                                                'secondary.50'
                                                        }
                                                    }}
                                                    target="_blank"
                                                    to={`${DEMO.TEAM_EDITOR_LINK(
                                                        outsourcer._id.toString()
                                                    )}`}
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    avatar={
                                                        <Avatar
                                                            src={
                                                                outsourcer.pictureUrl
                                                            }
                                                            {...stringAvatar(
                                                                `${outsourcer.firstname} ${outsourcer.lastname}`
                                                            )}
                                                            sx={{
                                                                bgcolor:
                                                                    theme
                                                                        .palette
                                                                        .secondary
                                                                        .main,
                                                                color: 'white',
                                                                fontSize:
                                                                    '0.65rem',
                                                                width: 24,
                                                                height: 24
                                                            }}
                                                        >
                                                            {getInitials(
                                                                outsourcer.firstname,
                                                                outsourcer.lastname
                                                            )}
                                                        </Avatar>
                                                    }
                                                    label={`${outsourcer.firstname}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontSize: '0.8rem',
                                                        height: 28
                                                    }}
                                                    variant="outlined"
                                                />
                                            )}
                                        </Tooltip>
                                    )
                                )}
                            </Stack>
                        ) : (
                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontStyle: 'italic',
                                    py: 0.5,
                                    fontSize: '0.85rem'
                                }}
                                variant="body2"
                            >
                                {[...AGENT_SUPPORT_DOCUMENTS_A].includes(
                                    thread.file_type
                                )
                                    ? 'If needed, editor can be added'
                                    : 'To Be Assigned'}
                            </Typography>
                        )
                    ) : null}
                    {![
                        ...AGENT_SUPPORT_DOCUMENTS_A,
                        FILE_TYPE_E.essay_required
                    ].includes(thread.file_type) && editors.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                            {editors.map((editor, i) => (
                                <Tooltip
                                    key={i}
                                    title={`${editor.firstname} ${editor.lastname}`}
                                >
                                    {is_TaiGer_role(user) ? (
                                        <Chip
                                            avatar={
                                                <Avatar
                                                    src={editor.pictureUrl}
                                                    {...stringAvatar(
                                                        `${editor.firstname} ${editor.lastname}`
                                                    )}
                                                    sx={{
                                                        bgcolor:
                                                            theme.palette
                                                                .secondary.main,
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        width: 24,
                                                        height: 24
                                                    }}
                                                >
                                                    {getInitials(
                                                        editor.firstname,
                                                        editor.lastname
                                                    )}
                                                </Avatar>
                                            }
                                            clickable
                                            component={LinkDom}
                                            label={`${editor.firstname}`}
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                                height: 28,
                                                '&:hover': {
                                                    bgcolor: 'secondary.50'
                                                }
                                            }}
                                            target="_blank"
                                            to={`${DEMO.TEAM_EDITOR_LINK(editor._id.toString())}`}
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Chip
                                            avatar={
                                                <Avatar
                                                    src={editor.pictureUrl}
                                                    {...stringAvatar(
                                                        `${editor.firstname} ${editor.lastname}`
                                                    )}
                                                    sx={{
                                                        bgcolor:
                                                            theme.palette
                                                                .secondary.main,
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        width: 24,
                                                        height: 24
                                                    }}
                                                >
                                                    {getInitials(
                                                        editor.firstname,
                                                        editor.lastname
                                                    )}
                                                </Avatar>
                                            }
                                            label={`${editor.firstname}`}
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                                height: 28
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Tooltip>
                            ))}
                        </Stack>
                    ) : null}
                    {is_TaiGer_role(user) &&
                    [
                        ...AGENT_SUPPORT_DOCUMENTS_A,
                        FILE_TYPE_E.essay_required
                    ].includes(thread.file_type) ? (
                        <Chip
                            color="secondary"
                            icon={<AddIcon />}
                            onClick={startEditingEditor}
                            size="small"
                            sx={{ mt: 1, pl: 1 }}
                        />
                    ) : null}
                </Box>
            </Box>
        </Card>
    );
};

export default TeamInformationCard;
