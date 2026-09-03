'use client';

import type { Segment } from '@/lib/branch/types';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn } from '@/lib/cn';
import { useBranchResult } from '@/store/use-branch-result';

/** El único uso de color de la app: de qué token salió cada pedazo del nombre. */
const COLOR_BY_SOURCE: Record<Segment['source'], string> = {
    type: 'text-tok-type',
    project: 'text-tok-project',
    ticket: 'text-tok-ticket',
    slug: 'text-tok-slug',
    literal: 'text-ink-muted',
};

export function BranchPreview() {
    const { segments, name, nodes } = useBranchResult();

    return (
        <div className="flex items-start justify-between gap-4">
            {name === '' ? (
                <p
                    data-testid="branch-placeholder"
                    className="branch-glyphs min-w-0 flex-1 text-ink-muted"
                >
                    {nodes.map((node, index) =>
                        node.kind === 'token' ? (
                            <span
                                key={index}
                                className={cn('opacity-70', COLOR_BY_SOURCE[node.name])}
                            >
                                {node.name}
                            </span>
                        ) : (
                            <span key={index}>{node.text}</span>
                        )
                    )}
                </p>
            ) : (
                <p data-testid="branch-name" className="branch-glyphs min-w-0 flex-1">
                    {segments.map((segment, index) => (
                        <span
                            key={index}
                            data-testid={`segment-${segment.source}`}
                            className={COLOR_BY_SOURCE[segment.source]}
                        >
                            {segment.text}
                        </span>
                    ))}
                </p>
            )}

            <CopyButton value={name} label="Copiar rama" variant="primary" />
        </div>
    );
}
