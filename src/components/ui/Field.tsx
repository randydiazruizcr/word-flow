'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FieldProps = {
    label: string;
    htmlFor: string;
    hint?: ReactNode;
    /**
     * Color del token que alimenta este campo. Es el cable entre lo que escribís y el
     * pedazo del nombre que sale de acá: la etiqueta lleva el mismo color que su segmento.
     */
    tokenClassName?: string;
    children: ReactNode;
};

export function Field({ label, htmlFor, hint, tokenClassName, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={htmlFor}
                className={cn('text-xs font-semibold', tokenClassName ?? 'text-ink-mid')}
            >
                {label}
            </label>
            {children}
            {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
        </div>
    );
}

/** Todos los campos de texto de la app comparten esta caja. */
export const inputClassName = cn(
    'w-full rounded-md border border-line bg-sunk px-3 py-2 text-sm text-ink',
    'placeholder:text-ink-muted focus:border-line-strong'
);
