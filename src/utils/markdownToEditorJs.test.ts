import { markdownToEditorJsBlocks } from './markdownToEditorJs';

describe('markdownToEditorJsBlocks', () => {
    it('produces one paragraph block per non-empty line', () => {
        const out = markdownToEditorJsBlocks('First line\n\nSecond line');
        expect(out.blocks).toHaveLength(2);
        expect(out.blocks[0]).toMatchObject({
            type: 'paragraph',
            data: { text: 'First line' }
        });
        expect(out.blocks[1].data.text).toBe('Second line');
    });

    it('converts inline bold, italic and links to HTML', () => {
        const out = markdownToEditorJsBlocks(
            'See **CV guide** at [here](https://example.com/docs) now *please*'
        );
        expect(out.blocks[0].data.text).toBe(
            'See <b>CV guide</b> at <a href="https://example.com/docs">here</a> now <i>please</i>'
        );
    });

    it('renders headings as bold paragraphs and lists as prefixed lines', () => {
        const out = markdownToEditorJsBlocks('# Title\n- one\n- two\n1. first');
        expect(out.blocks[0].data.text).toBe('<b>Title</b>');
        expect(out.blocks[1].data.text).toBe('• one');
        expect(out.blocks[2].data.text).toBe('• two');
        expect(out.blocks[3].data.text).toBe('1. first');
    });

    it('escapes raw HTML so model output cannot inject markup', () => {
        const out = markdownToEditorJsBlocks('a <script>alert(1)</script> b');
        expect(out.blocks[0].data.text).toBe(
            'a &lt;script&gt;alert(1)&lt;/script&gt; b'
        );
    });

    it('returns a single empty paragraph for empty input', () => {
        const out = markdownToEditorJsBlocks('');
        expect(out.blocks).toHaveLength(1);
        expect(out.blocks[0].data.text).toBe('');
    });
});
