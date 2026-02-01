import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role, Role } from '@taiger-common/core';
import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';

import { getQueryPublicResults, getQueryResults } from '../../../api';
import ModalMain from '../../../Demo/Utils/ModalHandler/ModalMain';
import './search.css';
import { useAuth } from '../../AuthProvider';
import {
    Search,
    SearchIconWrapper,
    StyledInputBase
} from '../../../utils/contants';
import DEMO from '../../../store/constant';

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
    const [, setLoading] = useState(false);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const response = is_TaiGer_role(user)
                    ? await getQueryResults(searchTerm)
                    : await getQueryPublicResults(searchTerm);
                if (response.data.success) {
                    setSearchResults(response.data.data ?? []);
                    setIsResultsVisible(true);
                    setLoading(false);
                } else {
                    setIsResultsVisible(false);
                    setStatedata((state) => ({
                        ...state,
                        res_modal_status: 401,
                        res_modal_message: 'Session expired. Please refresh.'
                    }));
                    setSearchTerm('');
                    setSearchResults([]);
                    setIsErrorTerm(true);
                    setLoading(false);
                }
            } catch (error) {
                setIsResultsVisible(false);
                setStatedata((state) => ({
                    ...state,
                    res_modal_status: 403,
                    res_modal_message: error
                }));
                setSearchTerm('');
                setSearchResults([]);
                setIsErrorTerm(true);
                setLoading(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsResultsVisible(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== '') {
                fetchSearchResults();
            } else {
                setSearchResults([]);
            }
        }, 300);

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            clearTimeout(delayDebounceFn);
        };
    }, [searchTerm, user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.trimStart());
        if (e.target.value.length === 0) {
            setIsResultsVisible(false);
        }
    };

    const handleInputBlur = () => {
        setIsResultsVisible(false);
    };

    const onClickStudentHandler = (result: SearchResultItem) => {
        navigate(
            `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                result._id.toString(),
                DEMO.PROFILE_HASH
            )}`
        );
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const onClickAgentHandler = (result: SearchResultItem) => {
        navigate(`/teams/agents/${result._id.toString()}`);
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const onClickEditorHandler = (result: SearchResultItem) => {
        navigate(`/teams/editors/${result._id.toString()}`);
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const onClickProgramHandler = (result: SearchResultItem) => {
        navigate(`/programs/${result._id.toString()}`);
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const onClickDocumentationHandler = (result: SearchResultItem) => {
        navigate(`/docs/search/${result._id.toString()}`);
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const onClickInternalDocumentationHandler = (result: SearchResultItem) => {
        navigate(`/docs/internal/search/${result._id.toString()}`);
        setSearchResults([]);
        setIsResultsVisible(false);
        setSearchTerm('');
    };

    const ConfirmError = () => {
        window.location.reload();
    };

    return (
        <Box>
            {isErrorTerm ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={statedata.res_modal_message}
                    res_modal_status={statedata.res_modal_status}
                />
            ) : null}
            <Box className="search-container" ref={searchContainerRef}>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        autoComplete="off"
                        autoFocus={false}
                        inputProps={{ 'aria-label': 'search' }}
                        onChange={handleInputChange}
                        onMouseDown={handleInputBlur}
                        placeholder={`${t('Search', { ns: 'common' })}...`}
                        value={searchTerm}
                    />
                </Search>
                {isResultsVisible ? (
                    searchResults.length > 0 ? (
                        <Box className="search-results result-list">
                            {searchResults.map((result, i) =>
                                result.role === Role.Student ? (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickStudentHandler(result)
                                        }
                                    >
                                        {`${result.firstname ?? ''} ${result.lastname ?? ''} ${
                                            result.firstname_chinese ?? ' '
                                        }${result.lastname_chinese ?? ' '}`}
                                    </li>
                                ) : result.role === Role.Agent ? (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickAgentHandler(result)
                                        }
                                    >
                                        {`${result.firstname ?? ''} ${result.lastname ?? ''}`}
                                    </li>
                                ) : result.role === Role.Editor ? (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickEditorHandler(result)
                                        }
                                    >
                                        {`${result.firstname ?? ''} ${result.lastname ?? ''}`}
                                    </li>
                                ) : result.school ? (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickProgramHandler(result)
                                        }
                                    >
                                        {`${result.school} ${result.program_name ?? ''} ${result.degree ?? ''} ${result.semester ?? ''}`}
                                    </li>
                                ) : result.internal ? (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickInternalDocumentationHandler(
                                                result
                                            )
                                        }
                                    >
                                        {`${result.title ?? ''}`}
                                    </li>
                                ) : (
                                    <li
                                        key={i}
                                        onClick={() =>
                                            onClickDocumentationHandler(result)
                                        }
                                    >
                                        {`${result.title ?? ''}`}
                                    </li>
                                )
                            )}
                        </Box>
                    ) : (
                        <Box className="search-results result-list">
                            <li>No result</li>
                        </Box>
                    )
                ) : null}
            </Box>
        </Box>
    );
};

export default NavSearch;
