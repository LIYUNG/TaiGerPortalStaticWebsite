import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: () => true
}));

vi.mock('@components/EditorJs/EditorNew', () => ({
    default: () => <div data-testid="editor-new" />
}));

vi.mock('@utils/contants', () => ({
    convertDate: (_ts: number) => '2024-01-01'
}));

import DocPageView from './DocPageView';

const noop = () => undefined;

describe('DocPageView', () => {
    it('renders the editor', () => {
        render(
            <DocPageView
                editorState={{ blocks: [], time: Date.now(), version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noop}
                author="John"
            />
        );
        expect(screen.getByTestId('editor-new')).toBeInTheDocument();
    });

    it('renders Edit button for admin agent', () => {
        render(
            <DocPageView
                editorState={{ blocks: [], time: Date.now(), version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noop}
                author="Jane"
            />
        );
        expect(
            screen.getByRole('button', { name: /Edit/i })
        ).toBeInTheDocument();
    });

    it('renders author info', () => {
        render(
            <DocPageView
                editorState={{ blocks: [], time: Date.now(), version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noop}
                author="Alice"
            />
        );
        expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });
});
