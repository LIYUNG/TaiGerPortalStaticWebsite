import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./DocumentsListItemsEditor', () => ({
    default: () => <div data-testid="docs-list-editor" />
}));

import DocPageEdit from './DocPageEdit';

const noop = () => undefined;
const noopSave = () => undefined;

describe('DocPageEdit', () => {
    it('renders without crashing', () => {
        render(
            <DocPageEdit
                category="general"
                document_title="Test Doc"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noopSave}
            />
        );
        expect(screen.getByTestId('docs-list-editor')).toBeInTheDocument();
    });

    it('renders a Card wrapper', () => {
        const { container } = render(
            <DocPageEdit
                category="general"
                document_title="My Document"
                editorState={{ blocks: [], time: 0, version: '2' }}
                handleClickEditToggle={noop}
                handleClickSave={noopSave}
            />
        );
        expect(container.firstChild).toBeTruthy();
    });
});
