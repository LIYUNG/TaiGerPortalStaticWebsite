import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('./AIAssistPage', () => ({
    default: () => <div data-testid="ai-assist-page" />
}));

import AIAssist from './index';

describe('AIAssist', () => {
    it('renders the AI Assist page', () => {
        render(<AIAssist />);

        expect(screen.getByTestId('ai-assist-page')).toBeTruthy();
    });
});
