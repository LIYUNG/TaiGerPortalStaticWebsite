import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutosaveState } from './useAutosaveState';

describe('useAutosaveState', () => {
    it('starts with idle status and resultId 0', () => {
        const { result } = renderHook(() => useAutosaveState());

        expect(result.current.saveState).toEqual({
            status: 'idle',
            resultId: 0
        });
    });

    it('setSaving updates status without incrementing resultId', () => {
        const { result } = renderHook(() => useAutosaveState());

        act(() => {
            result.current.setSaving();
        });

        expect(result.current.saveState).toEqual({
            status: 'saving',
            errorMessage: undefined,
            resultId: 0
        });
    });

    it('setSuccess increments resultId and clears error', () => {
        const { result } = renderHook(() => useAutosaveState());

        act(() => {
            result.current.setError('first error');
        });
        expect(result.current.saveState.resultId).toBe(1);

        act(() => {
            result.current.setSuccess();
        });

        expect(result.current.saveState).toEqual({
            status: 'success',
            errorMessage: undefined,
            resultId: 2
        });
    });

    it('setError increments resultId and stores message', () => {
        const { result } = renderHook(() => useAutosaveState());

        act(() => {
            result.current.setError('failed to save');
        });

        expect(result.current.saveState).toEqual({
            status: 'error',
            errorMessage: 'failed to save',
            resultId: 1
        });
    });

    it('reset returns to idle and keeps current resultId', () => {
        const { result } = renderHook(() => useAutosaveState());

        act(() => {
            result.current.setError('failed to save');
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.saveState).toEqual({
            status: 'idle',
            resultId: 1
        });
    });

    it('calls onStateChange for each state transition', () => {
        const onStateChange = vi.fn();
        const { result } = renderHook(() =>
            useAutosaveState({ onStateChange })
        );

        act(() => {
            result.current.setSaving();
            result.current.setSuccess();
            result.current.setError('boom');
            result.current.reset();
        });

        expect(onStateChange).toHaveBeenCalledTimes(4);
        expect(onStateChange).toHaveBeenNthCalledWith(1, {
            status: 'saving',
            errorMessage: undefined,
            resultId: 0
        });
        expect(onStateChange).toHaveBeenNthCalledWith(2, {
            status: 'success',
            errorMessage: undefined,
            resultId: 1
        });
        expect(onStateChange).toHaveBeenNthCalledWith(3, {
            status: 'error',
            errorMessage: 'boom',
            resultId: 2
        });
        expect(onStateChange).toHaveBeenNthCalledWith(4, {
            status: 'idle',
            resultId: 2
        });
    });
});
