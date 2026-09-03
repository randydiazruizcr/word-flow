// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBranchStore } from './branch-store';
import { useShortcuts } from './use-shortcuts';

const initial = useBranchStore.getState();

function spyOnClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    return writeText;
}

/** Async: la copia se resuelve en una microtarea, después del despacho. */
async function press(key: string, options: KeyboardEventInit = {}) {
    await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
    });
}

describe('useShortcuts', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
        useBranchStore.getState().setType('feature');
        useBranchStore.getState().setDescription('Arreglar login');
    });

    it('Enter copia el nombre', async () => {
        const writeText = spyOnClipboard();
        renderHook(() => useShortcuts());

        await press('Enter');

        expect(writeText).toHaveBeenCalledWith('feature/arreglar-login');
    });

    it('Ctrl+Enter copia el comando', async () => {
        const writeText = spyOnClipboard();
        renderHook(() => useShortcuts());

        await press('Enter', { ctrlKey: true });

        expect(writeText).toHaveBeenCalledWith('git checkout -b feature/arreglar-login');
    });

    it('avisa qué copió, porque con el teclado no hay botón que se ponga en «Copiado»', async () => {
        spyOnClipboard();
        const { result } = renderHook(() => useShortcuts());

        await press('Enter');

        expect(result.current.copied).toBe('name');
    });

    it('Escape limpia los valores pero no la configuración', async () => {
        spyOnClipboard();
        useBranchStore.getState().setProject('CON');
        renderHook(() => useShortcuts());

        await press('Escape');

        expect(useBranchStore.getState().values.description).toBe('');
        expect(useBranchStore.getState().config.project).toBe('CON');
    });

    it('sin nombre que copiar no toca el portapapeles', async () => {
        const writeText = spyOnClipboard();
        useBranchStore.getState().setDescription('');
        useBranchStore.getState().setType('');
        renderHook(() => useShortcuts());

        await press('Enter');

        expect(writeText).not.toHaveBeenCalled();
    });
});
