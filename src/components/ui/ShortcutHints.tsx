'use client';

import type { ShortcutFeedback } from '@/store/use-shortcuts';

const SHORTCUTS: { keys: string[]; what: string }[] = [
    { keys: ['Enter'], what: 'copiar la rama' },
    { keys: ['Ctrl', 'Enter'], what: 'copiar el comando' },
    { keys: ['Ctrl', 'K'], what: 'ir a la descripción' },
    { keys: ['Esc'], what: 'limpiar ticket y descripción' },
];

const COPIED_TEXT: Record<NonNullable<ShortcutFeedback['copied']>, string> = {
    name: 'Rama copiada.',
    command: 'Comando copiado.',
};

export function ShortcutHints({ copied }: ShortcutFeedback) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
            {SHORTCUTS.map((shortcut) => (
                <p key={shortcut.what} className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5">
                        {shortcut.keys.map((key) => (
                            <kbd
                                key={key}
                                className="rounded border border-line bg-sunk px-1.5 py-0.5 font-mono text-ink-mid"
                            >
                                {key}
                            </kbd>
                        ))}
                    </span>
                    {shortcut.what}
                </p>
            ))}

            {/* Con el teclado no hay botón que se ponga en «Copiado», así que se dice acá. */}
            <p aria-live="polite" className="text-ok">
                {copied === null ? '' : COPIED_TEXT[copied]}
            </p>
        </div>
    );
}
