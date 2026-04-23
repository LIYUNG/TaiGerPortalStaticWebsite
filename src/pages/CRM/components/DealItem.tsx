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
import type { TFunction } from 'i18next';
import type { CRMDealItem } from '@taiger-common/model';
import { isTerminalStatus, getStatusColor } from './statusUtils';

/** Helper to safely read an arbitrary key from the deal record */
const getDealValue = (deal: CRMDealItem, key: string): unknown =>
    (deal as Record<string, unknown>)[key];

interface DealItemProps {
    deal: CRMDealItem;
    t: TFunction;
    onOpenStatusMenu: (
        event: React.MouseEvent<HTMLElement>,
        deal: CRMDealItem
    ) => void;
    onEditDeal: (deal: CRMDealItem) => void;
    isUpdating: boolean;
}

const DealItem = ({
    deal,
    t,
    onOpenStatusMenu,
    onEditDeal,
    isUpdating
}: DealItemProps) => {
    const items = [
        { key: 'initiatedAt', status: 'initiated' },
        { key: 'sentAt', status: 'sent' },
        { key: 'signedAt', status: 'signed' },
        { key: 'closedAt', status: 'closed' },
        { key: 'canceledAt', status: 'canceled' }
    ];
    const dealStatus = String(deal?.status ?? '');
    const events = items.filter((it) => Boolean(getDealValue(deal, it.key)));
    const [open, setOpen] = useState(false);
    const hasTimeline = events.length > 0;

    return (
        <Box>
            <Box
                aria-expanded={hasTimeline ? open : undefined}
                onClick={hasTimeline ? () => setOpen((v) => !v) : undefined}
                onKeyDown={
                    hasTimeline
                        ? (e: React.KeyboardEvent<HTMLDivElement>) => {
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
                            isTerminalStatus(dealStatus)
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
                                clickable={!isTerminalStatus(dealStatus)}
                                color={getStatusColor(dealStatus) as 'info' | 'warning' | 'success' | 'error' | 'default'}
                                disabled={
                                    isUpdating || isTerminalStatus(dealStatus)
                                }
                                icon={<StatusIcon fontSize="small" />}
                                label={t(`deals.statusLabels.${dealStatus}`, {
                                    ns: 'crm',
                                    defaultValue: dealStatus || 'N/A'
                                })}
                                onClick={(
                                    e: React.MouseEvent<HTMLDivElement>
                                ) => {
                                    e.stopPropagation();
                                    onOpenStatusMenu(e, deal);
                                }}
                                size="small"
                                variant="outlined"
                            />
                        </span>
                    </Tooltip>
                    {!!(getDealValue(deal, 'closedAt') || getDealValue(deal, 'closedDate')) && (
                        <Typography
                            sx={{ color: 'text.secondary' }}
                            variant="body2"
                        >
                            {new Date(
                                String(getDealValue(deal, 'closedAt') || getDealValue(deal, 'closedDate'))
                            ).toLocaleDateString()}
                        </Typography>
                    )}
                    {!!getDealValue(deal, 'dealSizeNtd') && (
                        <Typography sx={{ fontWeight: 600 }} variant="body2">
                            NTD {Number(getDealValue(deal, 'dealSizeNtd')).toLocaleString()}
                        </Typography>
                    )}
                    {!!getDealValue(deal, 'note') && (
                        <Typography
                            sx={{ color: 'text.primary' }}
                            variant="body2"
                        >
                            {String(getDealValue(deal, 'note'))}
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
                                const date = new Date(String(getDealValue(deal, it.key)));
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
                                                            : (theme.palette as unknown as Record<string, { main: string }>)[colorKey].main
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
                                                            : (theme.palette as unknown as Record<string, { main: string }>)[colorKey].main
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
