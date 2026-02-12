import { render, screen } from '@testing-library/react';
import { CustomThemeProvider } from './index';

describe('CustomThemeProvider', () => {
    test('renders children without crashing', () => {
        render(
            <CustomThemeProvider>
                <div>Child content</div>
            </CustomThemeProvider>
        );
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });
});
