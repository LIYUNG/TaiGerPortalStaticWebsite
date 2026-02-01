import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomTabPanel, a11yProps } from './index';

describe('Tabs', () => {
    describe('CustomTabPanel', () => {
        it('renders without crashing', () => {
            render(
                <CustomTabPanel index={0} value={0}>
                    Tab content
                </CustomTabPanel>
            );
            expect(screen.getByText('Tab content')).toBeInTheDocument();
        });

        it('hides content when value does not match index', () => {
            render(
                <CustomTabPanel index={0} value={1}>
                    Tab content
                </CustomTabPanel>
            );
            const panel = screen.getByTestId('custom_tab_panel-0');
            expect(panel).toHaveAttribute('hidden');
        });
    });

    describe('a11yProps', () => {
        it('returns id and aria-controls', () => {
            const props = a11yProps(0, 0);
            expect(props.id).toBe('simple-tab-0');
            expect(props['aria-controls']).toBe('simple-tabpanel-0');
        });
    });
});
