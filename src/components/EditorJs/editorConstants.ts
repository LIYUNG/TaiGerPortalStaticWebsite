import type { OutputData } from '@editorjs/editorjs';

/** Empty EditorJS state used when resetting compose editors after submit */
export const EMPTY_EDITOR_STATE: OutputData = { blocks: [] };

/** Type for editor state compatible with EditorJS OutputData (used by message/compose flows) */
export type EditorStateData = OutputData;
