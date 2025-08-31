import React, { useState } from 'react';
import {
    Box,
    Tooltip,
    Chip,
    Typography,
    Stack,
    IconButton,
    Collapse
} from '@mui/material';
import {
    FiberManualRecord as StatusIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { isTerminalStatus, getStatusColor } from './statusUtils';

/**
 * DealItem
 * Props:
 * - deal
 * - t: i18next t fn
 * - onOpenStatusMenu: (event, deal) => void
 * - onEditDeal: (deal) => void
 * - isUpdating: boolean
 */
const DealItem = ({ deal, t, onOpenStatusMenu, onEditDeal, isUpdating }) => {
    const items = [
        { key: 'initiatedAt', status: 'initiated' },
        { key: 'sentAt', status: 'sent' },
        { key: 'signedAt', status: 'signed' },
        { key: 'closedAt', status: 'closed' },
        { key: 'canceledAt', status: 'canceled' }
    ];
    const events = items.filter((it) => Boolean(deal?.[it.key]));
    const [open, setOpen] = useState(false);
    const hasTimeline = events.length > 0;

    return (
        <Box>
            <Box
                aria-expanded={hasTimeline ? open : undefined}
                onClick={hasTimeline ? () => setOpen((v) => !v) : undefined}
                onKeyDown={
                    hasTimeline
                        ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setOpen((v) => !v);
                              }
                          }
                        : undefined
                }
                role={hasTimeline ? 'button' : undefined}
                sx={{
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: hasTimeline ? 'pointer' : 'default'
                }}
                tabIndex={hasTimeline ? 0 : undefined}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    <Tooltip
                        title={
                            isTerminalStatus(deal?.status)
                                ? t('common.noNextStep', {
                                      ns: 'crm',
                                      defaultValue: 'No next step'
                                  })
                                : t('actions.changeStatus', {
                                      ns: 'crm',
                                      defaultValue: 'Change status'
                                  })
                        }
                    >
                        <span onClick={(e) => e.stopPropagation()}>
                            <Chip
                                clickable={!isTerminalStatus(deal?.status)}
                                color={getStatusColor(deal?.status)}
                                disabled={
                                    isUpdating || isTerminalStatus(deal?.status)
                                }
                                icon={<StatusIcon fontSize="small" />}
                                label={t(`deals.statusLabels.${deal?.status}`, {
                                    ns: 'crm',
                                    defaultValue: deal?.status || 'N/A'
                                })}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenStatusMenu(e, deal);
                                }}
                                size="small"
                                variant="outlined"
                            />
                        </span>
                    </Tooltip>
                    {(deal?.closedAt || deal?.closedDate) && (
                        <Typography
                            sx={{ color: 'text.secondary' }}
                            variant="body2"
                        >
                            {new Date(
                                deal.closedAt || deal.closedDate
                            ).toLocaleDateString()}
                        </Typography>
                    )}
                    {deal?.dealSizeNtd && (
                        <Typography sx={{ fontWeight: 600 }} variant="body2">
                            NTD {Number(deal.dealSizeNtd).toLocaleString()}
                        </Typography>
                    )}
                    {deal?.note && (
                        <Typography
                            sx={{ color: 'text.primary' }}
                            variant="body2"
                        >
                            {deal.note}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {hasTimeline && (
                        <Tooltip
                            title={
                                open
                                    ? t('common.collapse', {
                                          ns: 'crm',
                                          defaultValue: 'Collapse'
                                      })
                                    : t('common.expand', {
                                          ns: 'crm',
                                          defaultValue: 'Expand'
                                      })
                            }
                        >
                            <IconButton
                                aria-label="toggle-deal-timeline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen((v) => !v);
                                }}
                                size="small"
                            >
                                {open ? (
                                    <ExpandLessIcon fontSize="small" />
                                ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={t('actions.edit', { ns: 'crm' })}>
                        <IconButton
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditDeal(deal);
                            }}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {hasTimeline && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 1.5, pl: 2.5 }}>
                        <Stack spacing={1.25}>
                            {events.map((it, idx2) => {
                                const colorKey = getStatusColor(it.status);
                                const date = new Date(deal[it.key]);
                                const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                                return (
                                    <Stack
                                        alignItems="flex-start"
                                        direction="row"
                                        key={it.key}
                                        spacing={1.5}
                                    >
                                        <Box
                                            sx={{
                                                width: 20,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 2,
                                                    flex: 1,
                                                    bgcolor: (theme) =>
                                                        theme.palette.divider,
                                                    visibility:
                                                        idx2 === 0
                                                            ? 'hidden'
                                                            : 'visible'
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    border: '2px solid #fff',
                                                    boxShadow: 1,
                                                    bgcolor: (theme) =>
                                                        colorKey === 'default'
                                                            ? theme.palette
                                                                  .grey[500]
                                                            : theme.palette[
                                                                  colorKey
                                                              ].main
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 2,
                                                    flex: 1,
                                                    bgcolor: (theme) =>
                                                        theme.palette.divider,
                                                    visibility:
                                                        idx2 ===
                                                        events.length - 1
                                                            ? 'hidden'
                                                            : 'visible'
                                                }}
                                            />
                                        </Box>
                                        <Stack spacing={0.25}>
                                            <Typography
                                                sx={{ fontWeight: 600 }}
                                                variant="body2"
                                            >
                                                {dateStr}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: (theme) =>
                                                        colorKey === 'default'
                                                            ? theme.palette.text
                                                                  .secondary
                                                            : theme.palette[
                                                                  colorKey
                                                              ].main
                                                }}
                                                variant="body2"
                                            >
                                                {t(
                                                    `deals.statusLabels.${it.status}`,
                                                    {
                                                        ns: 'crm',
                                                        defaultValue: it.status
                                                    }
                                                )}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Box>
                </Collapse>
            )}
        </Box>
    );
};

export default DealItem;
