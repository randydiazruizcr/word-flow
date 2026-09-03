'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

type CopyButtonProps = {
    value: string;
    label: string;
    variant?: 'primary' | 'ghost';
    className?: string;
};

/** Copia al portapapeles y confirma en el mismo botón; un toast sería mucho aparato. */
export function CopyButton({ value, label, variant = 'ghost', className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1600);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <Button
            variant={variant}
            disabled={value === ''}
            aria-label={label}
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(value);
                    setCopied(true);
                } catch {
                    setCopied(false);
                }
            }}
            className={cn('shrink-0', className)}
        >
            {copied ? (
                <Check aria-hidden className="size-3.5 text-ok" />
            ) : (
                <Copy aria-hidden className="size-3.5" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
        </Button>
    );
}
