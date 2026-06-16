import { useEffect, useRef, useState } from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

import { searchCommunicationThread } from '@/api';
import type { ThreadSearchMessage } from '@/api';
import { stringAvatar, convertDate } from '@utils/contants';

interface ChatSearchProps {
    studentId: string;
    onResultClick: (messageId: string) => void;
}

// Extract readable plain text from an EditorJS message JSON string so we can
// build a search snippet (the stored `message` is EditorJS blocks, not text).
//
// We parse the block HTML with an INERT DOMParser document and read only its
// textContent: scripts never execute, real tags are dropped, and literal angle
// brackets in normal text (e.g. "IELTS < 6.0") are preserved. The snippet is
// ultimately rendered as a React text child (auto-escaped), so this is
// defense-in-depth, not the sole guard.
const stripHtml = (value: string): string => {
    if (typeof DOMParser !== 'undefined') {
        return (
            new DOMParser().parseFromString(value, 'text/html').body
                .textContent ?? ''
        );
    }
    // Non-DOM fallback (e.g. SSR): drop every angle bracket so no markup can
    // survive. (A regex tag-strip like /<[^>]*>/g is an incomplete sanitizer —
    // bypassable via nested tags — so we don't rely on it here.)
    return value.replace(/[<>]/g, '');
};
const editorJsToPlainText = (raw?: string): string => {
    if (!raw) return '';
    let parsed: { blocks?: Array<{ data?: Record<string, unknown> }> };
    try {
        parsed = JSON.parse(raw);
    } catch {
        return '';
    }
    if (!Array.isArray(parsed?.blocks)) return '';
    const parts: string[] = [];
    for (const block of parsed.blocks) {
        const data = block?.data ?? {};
        if (typeof data.text === 'string') parts.push(stripHtml(data.text));
        if (Array.isArray(data.items)) {
            for (const item of data.items) {
                if (typeof item === 'string') parts.push(stripHtml(item));
                else if (item && typeof item === 'object') {
                    const obj = item as { content?: string; text?: string };
                    parts.push(stripHtml(obj.content ?? obj.text ?? ''));
                }
            }
        }
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
};

// A short snippet centered on the first match of `q`.
const buildSnippet = (text: string, q: string): string => {
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text.slice(0, 120);
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + q.length + 80);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${
        end < text.length ? '…' : ''
    }`;
};

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Bold the matched term within a snippet.
const Highlighted = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'ig'));
    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <Box
                        component="span"
                        key={index}
                        sx={{
                            bgcolor: 'warning.light',
                            borderRadius: 0.5,
                            fontWeight: 700
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <Box component="span" key={index}>
                        {part}
                    </Box>
                )
            )}
        </>
    );
};

const ChatSearch = ({ studentId, onResultClick }: ChatSearchProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ThreadSearchMessage[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    // Guard against out-of-order responses on fast typing.
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!open) return;
        const term = query.trim();
        const requestId = ++requestIdRef.current;
        // Defer all state updates into the timer callback so nothing is set
        // synchronously during the effect. Short queries clear immediately.
        const timer = window.setTimeout(
            () => {
                if (term.length < 2) {
                    setResults([]);
                    setTotal(0);
                    setLoading(false);
                    return;
                }
                setLoading(true);
                searchCommunicationThread(studentId, term)
                    .then((resp) => {
                        if (requestId !== requestIdRef.current) return;
                        setResults(resp.data.data ?? []);
                        setTotal(resp.data.total ?? 0);
                    })
                    .catch(() => {
                        if (requestId !== requestIdRef.current) return;
                        setResults([]);
                        setTotal(0);
                    })
                    .finally(() => {
                        if (requestId === requestIdRef.current) {
                            setLoading(false);
                        }
                    });
            },
            term.length < 2 ? 0 : 300
        );
        return () => window.clearTimeout(timer);
    }, [query, studentId, open]);

    const term = query.trim();

    const closeDrawer = () => setOpen(false);
    const handleSelect = (messageId: string) => {
        onResultClick(messageId);
        setOpen(false);
    };

    return (
        <>
            <Tooltip
                title={t('Search in conversation', {
                    ns: 'common',
                    defaultValue: 'Search in conversation'
                })}
            >
                <IconButton
                    aria-label="search conversation"
                    onClick={() => setOpen(true)}
                    size="small"
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Drawer
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' }
                }}
                anchor="right"
                onClose={closeDrawer}
                open={open}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5
                        }}
                    >
                        <Typography variant="h6">
                            {t('Search in conversation', {
                                ns: 'common',
                                defaultValue: 'Search in conversation'
                            })}
                        </Typography>
                        <IconButton
                            aria-label="close search"
                            onClick={closeDrawer}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ px: 2, pb: 1 }}>
                        <TextField
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: loading ? (
                                    <InputAdornment position="end">
                                        <CircularProgress size={16} />
                                    </InputAdornment>
                                ) : query !== '' ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="clear search"
                                            onClick={() => setQuery('')}
                                            size="small"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                            autoFocus
                            fullWidth
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('Search in conversation', {
                                ns: 'common',
                                defaultValue: 'Search in conversation'
                            })}
                            size="small"
                            value={query}
                        />
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {term.length < 2 ? (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('Type at least 2 characters', {
                                        ns: 'common',
                                        defaultValue:
                                            'Type at least 2 characters'
                                    })}
                                </Typography>
                            </Box>
                        ) : loading && results.length === 0 ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : results.length === 0 ? (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('No results found', {
                                        ns: 'common',
                                        defaultValue: 'No results found'
                                    })}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography
                                    color="text.secondary"
                                    sx={{ px: 2, pt: 1, display: 'block' }}
                                    variant="caption"
                                >
                                    {t('{{count}} results', {
                                        ns: 'common',
                                        count: total,
                                        defaultValue: `${total} results`
                                    })}
                                </Typography>
                                <List dense disablePadding>
                                    {results.map((message) => {
                                        const author =
                                            `${message.user_id?.firstname ?? 'Staff'} ${message.user_id?.lastname ?? ''}`.trim();
                                        const snippet = buildSnippet(
                                            editorJsToPlainText(
                                                message.message
                                            ),
                                            term
                                        );
                                        return (
                                            <ListItemButton
                                                alignItems="flex-start"
                                                key={message._id}
                                                onClick={() =>
                                                    handleSelect(message._id)
                                                }
                                                sx={{ gap: 1 }}
                                            >
                                                <Avatar
                                                    {...stringAvatar(
                                                        author || 'Staff'
                                                    )}
                                                    src={
                                                        message.user_id
                                                            ?.pictureUrl
                                                    }
                                                    sx={{
                                                        ...stringAvatar(
                                                            author || 'Staff'
                                                        ).sx,
                                                        width: 32,
                                                        height: 32,
                                                        fontSize: 13,
                                                        mt: 0.5
                                                    }}
                                                />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600
                                                            }}
                                                            variant="caption"
                                                        >
                                                            {author}
                                                        </Typography>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                        >
                                                            {convertDate(
                                                                message.createdAt ??
                                                                    ''
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        sx={{
                                                            color: 'text.secondary'
                                                        }}
                                                        variant="body2"
                                                    >
                                                        <Highlighted
                                                            query={term}
                                                            text={snippet}
                                                        />
                                                    </Typography>
                                                </Box>
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            </>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default ChatSearch;
