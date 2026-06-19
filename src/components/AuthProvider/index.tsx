import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

import { verify, logout } from '@/api/index';
import { queryClient } from '@/api/client';
import Loading from '../Loading/Loading';
import type { AuthContextValue } from '@/api/types';
import { IUserWithId } from '@taiger-common/model';

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

// Stable key for the session-verification query.
// Used by login/logout to update the cached user imperatively.
const VERIFY_QUERY_KEY = ['auth/verify'] as const;

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
    const { data: queriedUser, isPending } = useQuery({
        queryKey: VERIFY_QUERY_KEY,
        queryFn: async () => {
            const resp = await verify();
            const { data, success } = resp.data as {
                data: IUserWithId;
                success: boolean;
            };
            return success ? data : null;
        },
        // Auth state changes are always driven imperatively (login/logout);
        // background refetches would reset the cache unexpectedly.
        staleTime: Infinity,
        // A 401 from /verify means "not logged in", not a transient error.
        retry: false
    });

    const user = queriedUser ?? null;

    const login = (data: IUserWithId): void => {
        queryClient.setQueryData(VERIFY_QUERY_KEY, data);
    };

    const handleLogout = (): void => {
        // Mark the session logged out first. staleTime: Infinity keeps this from
        // refetching, so removing the rest of the cache below can't trigger a
        // verify() that races the server logout and re-authenticates the user.
        queryClient.setQueryData(VERIFY_QUERY_KEY, null);
        // Drop every other cached query so the previous user's data (students,
        // communications, etc.) doesn't linger for the next session on this
        // browser. Keep only auth/verify, which we just set to null.
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== VERIFY_QUERY_KEY[0]
        });
        queryClient.getMutationCache().clear();
        // Fire server-side logout in the background; local session is already cleared
        logout().catch(() => undefined);
    };

    if (isPending) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoaded: !isPending,
                login,
                logout: handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
