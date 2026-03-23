import { useEffect, useState, type ChangeEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, ListItem, MenuItem, Skeleton, Typography } from '@mui/material';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';

import Friends from './Friends';
import {
    getMyCommunicationThread,
    getQueryStudentResults,
    queryClient
} from '@/api';
import { getMyCommunicationQuery } from '@/api/query';
import { useAuth } from '../AuthProvider';
import {
    Search,
    SearchIconWrapper,
    StyledInputBase,
    menuWidth,
    EmbeddedChatListWidth
} from '@utils/contants';
import type { IStudentResponse } from '@taiger-common/model';

interface ChatListState {
    success: boolean;
    searchMode: boolean;
    students: IStudentResponse[];
    isLoaded: boolean;
    res_status?: number;
    res_modal_status?: number;
    res_modal_message?: string | unknown;
    error?: unknown;
}

interface ChatListProps {
    /** Render as an embedded sidebar list (uses React Query, Link navigation, attribute chips) */
    embedded?: boolean;
    /** Called when a chat item is clicked — only used in non-embedded (dropdown) mode */
    handleCloseChat?: () => void;
    /** Current open student id — only used in embedded mode to invalidate query */
    student_id?: string;
}

const ChatList = ({ embedded, handleCloseChat, student_id }: ChatListProps) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<IStudentResponse[]>([]);
    const [chatListState, setChatListState] = useState<ChatListState>({
        success: false,
        searchMode: false,
        students: [],
        isLoaded: !embedded
    });

    // Embedded mode: React Query data fetching
    const { data: queryData, isLoading: isQueryLoading } = useQuery({
        ...getMyCommunicationQuery(),
        enabled: !!embedded
    });

    // Embedded mode: invalidate query when the active student changes
    useEffect(() => {
        if (embedded) {
            queryClient.invalidateQueries({
                queryKey: ['communications', 'my']
            });
        }
    }, [student_id, embedded]);

    // Non-embedded mode: promise-based data fetching
    useEffect(() => {
        if (embedded) return;
        setChatListState((prev) => ({ ...prev, isLoaded: false }));
        getMyCommunicationThread().then(
            (resp) => {
                const payload = resp.data as {
                    success?: boolean;
                    data?: { students?: IStudentResponse[] };
                };
                const { success, data } = payload;
                const { status } = resp;
                if (success && data) {
                    setChatListState((prev) => ({
                        ...prev,
                        success: success ?? false,
                        students: data.students ?? [],
                        isLoaded: true,
                        res_status: status
                    }));
                } else {
                    setChatListState((prev) => ({
                        ...prev,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setChatListState((prev) => ({
                    ...prev,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, [embedded]);

    const fetchSearchResults = async () => {
        try {
            const response = await getQueryStudentResults(searchTerm);
            const resData = response.data as {
                success?: boolean;
                data?: { students?: IStudentResponse[] };
            };
            if (resData.success && resData.data) {
                setSearchResults(resData.data.students ?? []);
                setChatListState((prev) => ({ ...prev, isLoaded: true }));
            } else {
                setSearchTerm('');
                setSearchResults([]);
                setChatListState((prev) => ({
                    ...prev,
                    res_modal_status: 401,
                    res_modal_message: 'Session expired. Please refresh.',
                    isLoaded: true
                }));
            }
        } catch (error) {
            setSearchTerm('');
            setSearchResults([]);
            setChatListState((prev) => ({
                ...prev,
                isLoaded: true,
                res_modal_status: 403,
                res_modal_message: error
            }));
        }
    };

    useEffect(() => {
        if (chatListState.searchMode) {
            setChatListState((prev) => ({ ...prev, isLoaded: false }));
            const delayDebounceFn = setTimeout(() => {
                if (searchTerm) {
                    fetchSearchResults();
                } else {
                    setSearchResults([]);
                    setChatListState((prev) => ({ ...prev, isLoaded: true }));
                }
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, chatListState.searchMode]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '') {
            setSearchTerm(e.target.value);
            setChatListState((prev) => ({
                ...prev,
                searchMode: true,
                isLoaded: false
            }));
        } else {
            setSearchTerm('');
            setChatListState((prev) => ({
                ...prev,
                searchMode: false,
                isLoaded: true
            }));
        }
    };

    const isLoading = embedded ? isQueryLoading : !chatListState.isLoaded;

    const students: IStudentResponse[] = chatListState.searchMode
        ? searchResults
        : embedded
          ? ((queryData as { data?: { students?: IStudentResponse[] } })?.data
                ?.students ?? [])
          : chatListState.students;

    const searchBar = (
        <Search>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                id="search-friends"
                inputProps={{ 'aria-label': 'search' }}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search…"
                value={searchTerm}
            />
        </Search>
    );

    if (embedded) {
        return (
            <Box>
                {searchBar}
                {isLoading
                    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                          <MenuItem key={i}>
                              <Skeleton
                                  height={40}
                                  variant="circular"
                                  width={40}
                              />
                              <Skeleton
                                  height={54}
                                  style={{ marginLeft: '10px' }}
                                  variant="rectangular"
                                  width={EmbeddedChatListWidth - 50}
                              />
                          </MenuItem>
                      ))
                    : null}
                {!isLoading && user != null ? (
                    <Friends embedded students={students} user={user} />
                ) : null}
            </Box>
        );
    }

    return (
        <>
            <ListItem onClick={(e) => e.stopPropagation()}>
                <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h6">
                            {i18next.t('Chat', { ns: 'common' })}
                        </Typography>
                    </Box>
                </Box>
            </ListItem>
            {searchBar}
            {!chatListState.isLoaded
                ? [0, 1, 2, 3].map((_, i) => (
                      <MenuItem key={i}>
                          <Skeleton
                              height={40}
                              variant="rectangular"
                              width={menuWidth}
                          />
                      </MenuItem>
                  ))
                : null}
            {chatListState.isLoaded && user != null ? (
                <Friends
                    handleCloseChat={handleCloseChat}
                    students={students}
                    user={user}
                />
            ) : null}
        </>
    );
};

export default ChatList;
