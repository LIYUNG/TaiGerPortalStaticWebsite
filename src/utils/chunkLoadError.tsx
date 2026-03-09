import { useCallback, useMemo, type ReactNode } from 'react';
import { Component, type ErrorInfo } from 'react';

/**
 * Detect chunk load failure (e.g. after a new deploy when cached HTML
 * references old chunk URLs). See Vite troubleshooting:
 * https://vite.dev/guide/troubleshooting#_failed-to-fetch-dynamically-imported-module
 */
export function isChunkLoadError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('failed to fetch dynamically imported module') ||
            msg.includes('loading chunk') ||
            msg.includes('loading css chunk') ||
            msg.includes('importing a script')
        );
    }
    return false;
}

const RELOAD_KEY = 'chunk-load-reload';

type ChunkLoadErrorBoundaryInnerProps = {
    children: ReactNode;
    onChunkError: () => void;
    fallback: ReactNode;
};

type State = { hasError: boolean; error: Error | null };

/**
 * Inner class component – React requires a class for error boundaries
 * (no hook equivalent for componentDidCatch / getDerivedStateFromError).
 */
class ChunkLoadErrorBoundaryInner extends Component<
    ChunkLoadErrorBoundaryInnerProps,
    State
> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
        if (!isChunkLoadError(error)) return;
        this.props.onChunkError();
    }

    render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            if (isChunkLoadError(this.state.error)) {
                return this.props.fallback;
            }
            throw this.state.error;
        }
        return this.props.children;
    }
}

const defaultFallback = (
    <div
        style={{
            padding: 24,
            textAlign: 'center',
            fontFamily: 'sans-serif'
        }}
    >
        New version available. Reloading…
    </div>
);

/**
 * Error boundary that catches chunk load errors and reloads the page so the user
 * gets fresh HTML and new chunk URLs (graceful fallback for version skew).
 * Non–chunk-load errors are rethrown for a parent boundary or the app to handle.
 * Implemented as a function component that delegates to a minimal class (React
 * requires a class for error boundaries).
 */
export function ChunkLoadErrorBoundary({ children }: { children: ReactNode }) {
    const onChunkError = useCallback(() => {
        const didReload = sessionStorage.getItem(RELOAD_KEY);
        if (didReload) {
            sessionStorage.removeItem(RELOAD_KEY);
            return;
        }
        sessionStorage.setItem(RELOAD_KEY, '1');
        window.location.reload();
    }, []);

    const fallback = useMemo(() => defaultFallback, []);

    return (
        <ChunkLoadErrorBoundaryInner
            onChunkError={onChunkError}
            fallback={fallback}
        >
            {children}
        </ChunkLoadErrorBoundaryInner>
    );
}
