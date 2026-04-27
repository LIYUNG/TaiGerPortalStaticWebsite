import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { streamAIAssistFirstMessage } from './apis';

const createSseResponse = (chunks: string[]): Response => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            chunks.forEach((chunk) => {
                controller.enqueue(encoder.encode(chunk));
            });
            controller.close();
        }
    });

    return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
    });
};

describe('AI Assist stream API error handling', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws backend JSON message when streaming request is not ok', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    message: 'OpenAI API key is invalid or missing.'
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        );

        await expect(
            streamAIAssistFirstMessage({ message: 'hello' })
        ).rejects.toThrow(
            'AI Assist is temporarily unavailable. Please try again.'
        );
    });

    it('throws explicit SSE error payload instead of generic empty-stream error', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            createSseResponse([
                'event: error\n',
                'data: {"message":"OpenAI quota exceeded. Please retry later."}\n\n'
            ])
        );

        await expect(
            streamAIAssistFirstMessage({ message: 'hello' })
        ).rejects.toThrow(
            'AI Assist is temporarily unavailable. Please try again.'
        );
    });
});
