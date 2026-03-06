import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@components/EditorJs/EditorNew', () => ({
    default: () => <div data-testid="editor-new" />
}));

import DocumentsListItemsEditor from './DocumentsListItemsEditor';

const noop = () => undefined;

describe('DocumentsListItemsEditor', () => {
    it('renders the EditorNew component', () => {
        render(
            <DocumentsListItemsEditor
                category="general"
                doc_title="Test Doc"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noop}
            />
        );
        expect(screen.getByTestId('editor-new')).toBeInTheDocument();
    });

    it('renders without crashing with minimal props', () => {
        render(
            <DocumentsListItemsEditor
                doc_title="Another Doc"
                handleClickEditToggle={noop}
                handleClickSave={noop}
            />
        );
        expect(screen.getByTestId('editor-new')).toBeInTheDocument();
    });
});
