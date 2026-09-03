'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PanelProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

export function Panel({ title, children, className }: PanelProps) {
    return (
        <section
            className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-panel',
                className
            )}
        >
            <header className="border-b border-line px-4 py-2.5">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-mid uppercase">
                    {title}
                </h2>
            </header>
            <div className="flex flex-col gap-4 p-4">{children}</div>
        </section>
    );
}
