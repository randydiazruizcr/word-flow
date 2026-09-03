'use client';

import { useEffect, useState } from 'react';

import { useBranchStore } from './branch-store';
import { useBranchResult } from './use-branch-result';

export type ShortcutFeedback = {
    /** Qué se acaba de copiar con el teclado, o null. Se limpia solo. */
    copied: 'name' | 'command' | null;
};

const FEEDBACK_MS = 1600;

export function useShortcuts(): ShortcutFeedback {
    const { name, command } = useBranchResult();
    const clearValues = useBranchStore((state) => state.clearValues);
    const [copied, setCopied] = useState<ShortcutFeedback['copied']>(null);

    useEffect(() => {
        async function copy(value: string, what: 'name' | 'command') {
            if (value === '') return;
            try {
                await navigator.clipboard.writeText(value);
                setCopied(what);
            } catch {
                setCopied(null);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            const mod = event.metaKey || event.ctrlKey;

            if (event.key === 'Enter') {
                event.preventDefault();
                void (mod ? copy(command, 'command') : copy(name, 'name'));
                return;
            }

            if (mod && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                document.getElementById('description')?.focus();
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                clearValues();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [name, command, clearValues]);

    useEffect(() => {
        if (copied === null) return;
        const timer = setTimeout(() => setCopied(null), FEEDBACK_MS);
        return () => clearTimeout(timer);
    }, [copied]);

    return { copied };
}
