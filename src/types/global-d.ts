/**
 * Global module declarations for packages without @types.
 * Referenced by tsconfig.json "types" or included via /// <reference.
 */

declare module 'react-big-calendar' {
    import type { ComponentType } from 'react';
    export interface BigCalendarProps {
        events?: unknown[];
        startAccessor?: string;
        endAccessor?: string;
        titleAccessor?: string;
        defaultDate?: Date;
        defaultView?: string;
        views?: unknown;
        onSelectEvent?: (event: unknown) => void;
        onSelectSlot?: (slotInfo: unknown) => void;
        localizer?: unknown;
        [key: string]: unknown;
    }
    function momentLocalizer(moment: unknown): unknown;
    const Calendar: ComponentType<BigCalendarProps>;
    export { Calendar, momentLocalizer };
    export default Calendar;
}

declare module '@editorjs/header';
declare module '@editorjs/list';
declare module '@editorjs/embed';
declare module '@editorjs/image';
declare module '@editorjs/table';
declare module '@editorjs/inline-code';
declare module '@editorjs/delimiter';
declare module '@editorjs/code';
declare module '@editorjs/quote';
declare module '@editorjs/underline';
declare module '@editorjs/attaches';
declare module '@editorjs/warning';
declare module 'editorjs-text-color-plugin';
declare module '@canburaks/text-align-editorjs';
declare module 'react-file-icon';
