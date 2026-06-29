import type { OutputData } from '@editorjs/editorjs';

// Minimal Markdown → EditorJS converter for AI reply drafts. The composer's
// EditorJS instance always has the paragraph tool, so EVERYTHING is emitted as
// paragraph blocks (whose `text` holds inline HTML) — this avoids "unknown
// tool" failures if list/header tools aren't registered. Headings become bold
// lines; bullet/numbered list items become prefixed lines.

// Escape HTML first, then re-introduce the small set of inline tags EditorJS
// paragraphs render. Order matters: links before bold/italic so a `*` inside a
// URL isn't mangled.
const inlineMarkdownToHtml = (input: string): string =>
    input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/__([^_]+)__/g, '<b>$1</b>')
        .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

const paragraph = (text: string) => ({
    type: 'paragraph',
    data: { text }
});

export const markdownToEditorJsBlocks = (markdown: string): OutputData => {
    const lines = (markdown || '').replace(/\r\n/g, '\n').split('\n');
    const blocks: Array<{ type: string; data: { text: string } }> = [];

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
            blocks.push(
                paragraph(`<b>${inlineMarkdownToHtml(heading[1])}</b>`)
            );
            continue;
        }

        const bullet = line.match(/^[-*]\s+(.*)$/);
        if (bullet) {
            blocks.push(paragraph(`• ${inlineMarkdownToHtml(bullet[1])}`));
            continue;
        }

        const numbered = line.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
            blocks.push(
                paragraph(
                    `${numbered[1]}. ${inlineMarkdownToHtml(numbered[2])}`
                )
            );
            continue;
        }

        blocks.push(paragraph(inlineMarkdownToHtml(line)));
    }

    if (blocks.length === 0) {
        blocks.push(paragraph(''));
    }

    return { time: Date.now(), blocks, version: '2.0.0' } as OutputData;
};

export default markdownToEditorJsBlocks;
