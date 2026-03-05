import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./DocumentsListItemsEditor', () => ({
    default: () => <div data-testid="docs-list-editor" />
}));

vi.mock('@utils/contants', () => ({
    valid_categories: [{ key: 'general', value: 'General' }],
    valid_internal_categories: [{ key: 'internal', value: 'Internal' }]
}));

import SingleDocEdit from './SingleDocEdit';

const noop = () => undefined;
const noopSave = () => undefined;

describe('SingleDocEdit', () => {
    it('renders the editor for public category', () => {
        render(
            <SingleDocEdit
                category="general"
                document_title="My Doc"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickSave={noopSave}
                handleClickEditToggle={noop}
            />
        );
        expect(screen.getByTestId('docs-list-editor')).toBeInTheDocument();
    });

    it('renders Category: Public label', () => {
        render(
            <SingleDocEdit
                category="general"
                document_title="My Doc"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickSave={noopSave}
                handleClickEditToggle={noop}
            />
        );
        expect(screen.getByText(/Public/i)).toBeInTheDocument();
    });

    it('renders internal category label when internal=true', () => {
        render(
            <SingleDocEdit
                category="internal"
                document_title="Internal Doc"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickSave={noopSave}
                handleClickEditToggle={noop}
                internal={true}
            />
        );
        // The Typography shows "Category: Internal" — use getAllByText to handle multiple matches
        const internals = screen.getAllByText(/Internal/i);
        expect(internals.length).toBeGreaterThan(0);
    });
});
