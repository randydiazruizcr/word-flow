'use client';

import { CopyButton } from '@/components/ui/CopyButton';
import { useBranchResult } from '@/store/use-branch-result';

/** Lo que hacés apenas tenés el nombre, así que va acá y no hay que escribirlo. */
export function GitCommand() {
    const { command } = useBranchResult();

    if (command === '') return null;

    return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-sunk px-3 py-2">
            <code
                data-testid="git-command"
                className="min-w-0 truncate font-mono text-sm text-ink-mid"
            >
                {command}
            </code>
            <CopyButton value={command} label="Copiar comando" />
        </div>
    );
}
