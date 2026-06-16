import {
    useState,
    useRef,
    useEffect,
    useMemo,
    type ChangeEvent,
    type KeyboardEvent,
    type ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role, Role } from '@taiger-common/core';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import SchoolIcon from '@mui/icons-material/School';
import ArticleIcon from '@mui/icons-material/Article';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    Box,
    Paper,
    Popper,
    List,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    ClickAwayListener,
    Typography
} from '@mui/material';

import { getQueryPublicResults, getQueryResults } from '@/api';
import ModalMain from '@pages/Utils/ModalHandler/ModalMain';
import './search.css';
import { useAuth } from '../../AuthProvider';
import { Search, SearchIconWrapper, StyledInputBase } from '@utils/contants';
import DEMO from '@store/constant';

export interface SearchResultItem {
    _id: string;
    role?: string;
    firstname?: string;
    lastname?: string;
    firstname_chinese?: string;
    lastname_chinese?: string;
    school?: string;
    program_name?: string;
    degree?: string;
    semester?: string;
    title?: string;
    internal?: boolean;
}

interface NavSearchState {
    error: string;
    res_status: number;
    res_modal_status: number;
    res_modal_message: string | unknown;
}

type SearchResultType =
    | 'student'
    | 'agent'
    | 'editor'
    | 'program'
    | 'internalDoc'
    | 'doc';

// Render order of the grouped sections in the dropdown.
const TYPE_ORDER: SearchResultType[] = [
    'student',
    'agent',
    'editor',
    'program',
    'internalDoc',
    'doc'
];

// Classify a raw search hit into one of the known result types. Mirrors the
// original chained-ternary precedence (role first, then program, then docs).
const classifyResult = (result: SearchResultItem): SearchResultType => {
    if (result.role === Role.Student) return 'student';
    if (result.role === Role.Agent) return 'agent';
    if (result.role === Role.Editor) return 'editor';
    if (result.school) return 'program';
    if (result.internal) return 'internalDoc';
    return 'doc';
};

// Primary / secondary lines shown for a result of a given type.
const labelFor = (
    type: SearchResultType,
    r: SearchResultItem
): { primary: string; secondary: string } => {
    const fullName = `${r.firstname ?? ''} ${r.lastname ?? ''}`.trim();
    switch (type) {
        case 'student':
            return {
                primary: fullName,
                secondary: `${r.firstname_chinese ?? ''}${
                    r.lastname_chinese ?? ''
                }`.trim()
            };
        case 'agent':
        case 'editor':
            return { primary: fullName, secondary: '' };
        case 'program':
            return {
                // Lead with the program name (the identifier) + degree so a long
                // school name can't truncate it away; school + semester become
                // the secondary context line.
                primary:
                    [r.program_name, r.degree].filter(Boolean).join(' ') ||
                    (r.school ?? ''),
                secondary: [r.school, r.semester].filter(Boolean).join(' · ')
            };
        default:
            return { primary: r.title ?? '', secondary: '' };
    }
};

// Destination route when a result is selected.
const routeFor = (type: SearchResultType, r: SearchResultItem): string => {
    const id = r._id.toString();
    switch (type) {
        case 'student':
            return DEMO.STUDENT_DATABASE_STUDENTID_LINK(id, DEMO.PROFILE_HASH);
        case 'agent':
            return `/teams/agents/${id}`;
        case 'editor':
            return `/teams/editors/${id}`;
        case 'program':
            return `/programs/${id}`;
        case 'internalDoc':
            return `/docs/internal/search/${id}`;
        default:
            return `/docs/search/${id}`;
    }
};

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Bold every part of `text` that matches any whitespace-separated term in the
// query, so users can see why a result was returned. The backend matches each
// term independently (a multi-word query can span fields), so we highlight each
// term — e.g. "tum elektrotechnik" bolds "TUM" in the school and
// "Elektrotechnik" in the program name.
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return <>{text}</>;

    const lowerTerms = new Set(terms.map((term) => term.toLowerCase()));
    const matcher = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
    const parts = text.split(matcher);

    return (
        <>
            {parts.map((part, index) =>
                lowerTerms.has(part.toLowerCase()) ? (
                    <Box component="span" key={index} sx={{ fontWeight: 700 }}>
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

const NavSearch = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [statedata, setStatedata] = useState<NavSearchState>({
        error: '',
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isErrorTerm, setIsErrorTerm] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const anchorRef = useRef<HTMLDivElement>(null);
    // Guards against out-of-order responses: only the latest request may write
    // results, so a slow early request can't clobber a faster later one.
    const requestIdRef = useRef(0);

    const TYPE_META: Record<
        SearchResultType,
        { label: string; icon: ReactNode }
    > = {
        student: {
            label: t('Students', { ns: 'common' }),
            icon: <PersonIcon fontSize="small" />
        },
        agent: {
            label: t('Agents', { ns: 'common' }),
            icon: <SupportAgentIcon fontSize="small" />
        },
        editor: {
            label: t('Editors', { ns: 'common' }),
            icon: <DriveFileRenameOutlineIcon fontSize="small" />
        },
        program: {
            label: t('Programs', { ns: 'common' }),
            icon: <SchoolIcon fontSize="small" />
        },
        internalDoc: {
            label: t('Internal Docs', { ns: 'common' }),
            icon: <LockOutlinedIcon fontSize="small" />
        },
        doc: {
            label: t('Documentations', { ns: 'common' }),
            icon: <ArticleIcon fontSize="small" />
        }
    };

    // Group results by type (ordered) and build a flat list mirroring the render
    // order so keyboard navigation maps 1:1 to what's on screen.
    const { groups, flatItems } = useMemo(() => {
        const byType = new Map<SearchResultType, SearchResultItem[]>();
        searchResults.forEach((result) => {
            const type = classifyResult(result);
            const bucket = byType.get(type);
            if (bucket) {
                bucket.push(result);
            } else {
                byType.set(type, [result]);
            }
        });
        const grouped = TYPE_ORDER.filter((type) => byType.has(type)).map(
            (type) => ({ type, items: byType.get(type) ?? [] })
        );
        const flat = grouped.flatMap((group) =>
            group.items.map((item) => ({ item, type: group.type }))
        );
        return { groups: grouped, flatItems: flat };
    }, [searchResults]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            // Idempotent clear: return the SAME array reference when already
            // empty so React can bail out of the re-render. Setting a fresh `[]`
            // unconditionally would re-render on every pass and, combined with an
            // unstable `user` reference in the deps, spin into an infinite loop.
            setSearchResults((previous) =>
                previous.length === 0 ? previous : []
            );
            setLoading(false);
            return;
        }

        const fetchSearchResults = async () => {
            const requestId = ++requestIdRef.current;
            try {
                setLoading(true);
                const response =
                    user != null && is_TaiGer_role(user)
                        ? await getQueryResults(searchTerm)
                        : await getQueryPublicResults(searchTerm);
                // Drop stale responses (a newer keystroke already fired).
                if (requestId !== requestIdRef.current) return;
                if (response.data.success) {
                    setSearchResults(
                        (response.data.data ?? []) as SearchResultItem[]
                    );
                    setOpen(true);
                } else {
                    setOpen(false);
                    setStatedata((state) => ({
                        ...state,
                        res_modal_status: 401,
                        res_modal_message: 'Session expired. Please refresh.'
                    }));
                    setSearchTerm('');
                    setSearchResults([]);
                    setIsErrorTerm(true);
                }
            } catch (error) {
                if (requestId !== requestIdRef.current) return;
                setOpen(false);
                setStatedata((state) => ({
                    ...state,
                    res_modal_status: 403,
                    res_modal_message: error
                }));
                setSearchTerm('');
                setSearchResults([]);
                setIsErrorTerm(true);
            } finally {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        };

        const delayDebounceFn = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, user]);

    // Keep the highlighted option scrolled into view during keyboard nav.
    useEffect(() => {
        if (activeIndex < 0) return;
        document
            .getElementById(`nav-search-option-${activeIndex}`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trimStart();
        setSearchTerm(value);
        setActiveIndex(-1);
        setOpen(value !== '');
    };

    const handleFocus = () => {
        if (searchTerm.trim() !== '') {
            setOpen(true);
        }
    };

    const handleSelect = (result: SearchResultItem, type: SearchResultType) => {
        navigate(routeFor(type, result));
        setSearchResults([]);
        setOpen(false);
        setSearchTerm('');
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setOpen(false);
            return;
        }
        if (!open || flatItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((index) => (index + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((index) =>
                index <= 0 ? flatItems.length - 1 : index - 1
            );
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const { item, type } = flatItems[activeIndex];
            handleSelect(item, type);
        }
    };

    const ConfirmError = () => {
        window.location.reload();
    };

    const isOpen = open && searchTerm.trim() !== '';

    return (
        <Box>
            {isErrorTerm ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={statedata.res_modal_message as string}
                    res_modal_status={statedata.res_modal_status}
                />
            ) : null}
            <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Box className="search-container">
                    <Search ref={anchorRef}>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            autoComplete="off"
                            autoFocus={false}
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                            placeholder={`${t('Search', { ns: 'common' })}...`}
                            value={searchTerm}
                        />
                    </Search>
                    <Popper
                        anchorEl={anchorRef.current}
                        disablePortal
                        open={isOpen}
                        placement="bottom-start"
                        sx={{
                            zIndex: (theme) => theme.zIndex.modal,
                            width: anchorRef.current?.clientWidth,
                            minWidth: 360,
                            maxWidth: 480
                        }}
                    >
                        <Paper
                            elevation={6}
                            sx={{
                                mt: 0.5,
                                maxHeight: 420,
                                overflowY: 'auto',
                                borderRadius: 2
                            }}
                        >
                            {loading && flatItems.length === 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 2,
                                        color: 'text.secondary'
                                    }}
                                >
                                    <CircularProgress size={18} />
                                    <Typography variant="body2">
                                        {t('Searching', { ns: 'common' })}...
                                    </Typography>
                                </Box>
                            ) : flatItems.length === 0 ? (
                                <Box sx={{ p: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        {t('No result', { ns: 'common' })}
                                    </Typography>
                                </Box>
                            ) : (
                                <List dense disablePadding>
                                    {groups.map((group) => (
                                        <li key={group.type}>
                                            <ul style={{ padding: 0 }}>
                                                <ListSubheader
                                                    sx={{
                                                        lineHeight: '32px',
                                                        bgcolor:
                                                            'background.paper'
                                                    }}
                                                >
                                                    {
                                                        TYPE_META[group.type]
                                                            .label
                                                    }
                                                </ListSubheader>
                                                {group.items.map((item) => {
                                                    const flatIndex =
                                                        flatItems.findIndex(
                                                            (entry) =>
                                                                entry.item ===
                                                                item
                                                        );
                                                    const {
                                                        primary,
                                                        secondary
                                                    } = labelFor(
                                                        group.type,
                                                        item
                                                    );
                                                    return (
                                                        <ListItemButton
                                                            id={`nav-search-option-${flatIndex}`}
                                                            key={item._id}
                                                            onClick={() =>
                                                                handleSelect(
                                                                    item,
                                                                    group.type
                                                                )
                                                            }
                                                            onMouseEnter={() =>
                                                                setActiveIndex(
                                                                    flatIndex
                                                                )
                                                            }
                                                            selected={
                                                                flatIndex ===
                                                                activeIndex
                                                            }
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 36,
                                                                    color: 'text.secondary'
                                                                }}
                                                            >
                                                                {
                                                                    TYPE_META[
                                                                        group
                                                                            .type
                                                                    ].icon
                                                                }
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <HighlightedText
                                                                        query={
                                                                            searchTerm
                                                                        }
                                                                        text={
                                                                            primary
                                                                        }
                                                                    />
                                                                }
                                                                primaryTypographyProps={{
                                                                    noWrap: true
                                                                }}
                                                                secondary={
                                                                    secondary ? (
                                                                        <HighlightedText
                                                                            query={
                                                                                searchTerm
                                                                            }
                                                                            text={
                                                                                secondary
                                                                            }
                                                                        />
                                                                    ) : undefined
                                                                }
                                                                secondaryTypographyProps={{
                                                                    noWrap: true
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Popper>
                </Box>
            </ClickAwayListener>
        </Box>
    );
};

export default NavSearch;
