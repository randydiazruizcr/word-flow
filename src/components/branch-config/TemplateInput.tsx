'use client';

import { useRef } from 'react';

import { TOKEN_NAMES } from '@/lib/branch/template';
import type { TokenName } from '@/lib/branch/types';
import { Field, inputClassName } from '@/components/ui/Field';
import { cn } from '@/lib/cn';
import { useBranchStore } from '@/store/branch-store';

const CHIP_COLOR: Record<TokenName, string> = {
    type: 'text-tok-type',
    project: 'text-tok-project',
    ticket: 'text-tok-ticket',
    slug: 'text-tok-slug',
};

export function TemplateInput() {
    const template = useBranchStore((state) => state.config.template);
    const setTemplate = useBranchStore((state) => state.setTemplate);
    const inputRef = useRef<HTMLInputElement>(null);

    /** El campo conserva su selección aunque el clic en el chip le saque el foco. */
    function insertToken(name: TokenName) {
        const token = `{${name}}`;
        const input = inputRef.current;
        const at = input?.selectionStart ?? template.length;
        const next = `${template.slice(0, at)}${token}${template.slice(at)}`;

        setTemplate(next);

        requestAnimationFrame(() => {
            input?.focus();
            input?.setSelectionRange(at + token.length, at + token.length);
        });
    }

    return (
        <Field
            label="Plantilla"
            htmlFor="template"
            hint="Todo lo que no sea un token se copia tal cual."
        >
            <input
                id="template"
                ref={inputRef}
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                spellCheck={false}
                autoComplete="off"
                className={cn(inputClassName, 'font-mono')}
            />
            <div className="flex flex-wrap gap-1.5">
                {TOKEN_NAMES.map((name) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => insertToken(name)}
                        className={cn(
                            'rounded border border-line px-1.5 py-0.5 font-mono text-xs transition hover:border-line-strong',
                            CHIP_COLOR[name]
                        )}
                    >
                        {`{${name}}`}
                    </button>
                ))}
            </div>
        </Field>
    );
}
