import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackBarProvider } from '../contexts/use-snack-bar';
import { CustomThemeProvider } from '@components/ThemeProvider';

/** Default mock user for useAuth - avoids redirects and permission errors in smoke tests */
export const defaultMockUser = {
    _id: 'test-user-id',
    role: 'Agent',
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com'
};

const createTestQueryClient = (): QueryClient =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    });

interface AllTheProvidersProps {
    children: React.ReactNode;
    initialEntries?: string[];
}

function AllTheProviders({
    children,
    initialEntries = ['/']
}: AllTheProvidersProps): ReactElement {
    const queryClient = createTestQueryClient();
    return (
        <CustomThemeProvider>
            <QueryClientProvider client={queryClient}>
                <SnackBarProvider>
                    <MemoryRouter initialEntries={initialEntries}>
                        {children}
                    </MemoryRouter>
                </SnackBarProvider>
            </QueryClientProvider>
        </CustomThemeProvider>
    );
}

function customRender(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & {
        initialEntries?: string[];
    }
): ReturnType<typeof render> {
    const { initialEntries, ...renderOptions } = options ?? {};
    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders initialEntries={initialEntries}>
                {children}
            </AllTheProviders>
        ),
        ...renderOptions
    });
}

export { customRender as renderWithProviders, createTestQueryClient };
