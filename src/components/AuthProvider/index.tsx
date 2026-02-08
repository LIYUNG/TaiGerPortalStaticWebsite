import React, { useEffect, createContext, useContext, useState } from 'react';

import { verify, logout } from '../../api/index';
import Loading from '../Loading/Loading';
import type {
    AuthContextValue,
    AuthUserdataState,
    AuthUserData
} from '../../api/types';

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [, forceUpdate] = useState({});
    const [userdata, setUserdata] = useState<AuthUserdataState>({
        error: '',
        success: false,
        data: null,
        isLoaded: false,
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        verify().then(
            (resp: {
                data: { data?: AuthUserData; success?: boolean };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                if (success) {
                    setUserdata((state) => ({
                        ...state,
                        success: success ?? false,
                        data: data ?? null,
                        isLoaded: true
                    }));
                    setIsAuthenticated(true);
                } else {
                    setUserdata((state) => ({
                        ...state,
                        data: null,
                        isLoaded: true
                    }));
                }
            },
            (error: unknown) => {
                setUserdata((state) => ({
                    ...state,
                    isLoaded: true,
                    error,
                    res_modal_status: 500
                }));
            }
        );
    }, []);

    const login = (data: AuthUserData): void => {
        setUserdata((state) => ({
            ...state,
            data
        }));
        setIsAuthenticated(true);
    };

    const handleLogout = (): void => {
        logout().then(
            () => {
                setUserdata((state) => ({
                    ...state,
                    data: null
                }));
            },
            (error: unknown) => {
                setUserdata((state) => ({
                    ...state,
                    isLoaded: true,
                    error
                }));
            }
        );

        setIsAuthenticated(false);
        forceUpdate({});
    };

    const authData: AuthContextValue = {
        user: userdata.data,
        isAuthenticated,
        isLoaded: userdata.isLoaded,
        login,
        logout: handleLogout
    };

    if (!userdata.isLoaded) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
