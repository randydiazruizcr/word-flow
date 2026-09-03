'use client';

import { AlertTriangle, CircleCheck, CircleX } from 'lucide-react';
import type { TemplateIssue, ValidationResult } from '@/lib/branch/types';
import { cn } from '@/lib/cn';
import { useBranchResult } from '@/store/use-branch-result';

const VERDICT: Record<ValidationResult['status'], { text: string; className: string }> = {
    ok: { text: 'Sirve como nombre de rama.', className: 'text-ok' },
    warning: { text: 'Sirve, pero mirá esto.', className: 'text-warn' },
    error: { text: 'Git no va a aceptar este nombre.', className: 'text-danger' },
};

const VERDICT_ICON = {
    ok: CircleCheck,
    warning: AlertTriangle,
    error: CircleX,
};

function templateMessage(issue: TemplateIssue): string {
    switch (issue.kind) {
        case 'empty':
            return 'La plantilla está vacía: escribí algo o elegí una convención.';
        case 'unknown-token':
            return `«${issue.token}» no es un token: se copia tal cual. Los que existen son type, project, ticket y slug.`;
        case 'unclosed-brace':
            return 'Quedó una llave sin cerrar: lo que sigue se copia tal cual.';
    }
}

export function ValidationReport() {
    const { name, validation, templateIssues, slugDropped } = useBranchResult();
    const verdict = VERDICT[validation.status];
    const Icon = VERDICT_ICON[validation.status];

    // Una pantalla recién abierta no falló nada: no hay por qué recibirla en rojo.
    const untouched = name === '';

    return (
        <div className="flex flex-col gap-2 text-sm">
            {untouched ? (
                <p data-testid="verdict" data-status="empty" className="text-ink-mid">
                    Completá los campos y acá te digo si el nombre le sirve a git.
                </p>
            ) : (
                <p
                    data-testid="verdict"
                    data-status={validation.status}
                    className={cn('flex items-center gap-2 font-medium', verdict.className)}
                >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    {verdict.text}
                </p>
            )}

            {!untouched && validation.issues.length > 0 ? (
                <ul className="flex flex-col gap-1 text-ink-mid">
                    {validation.issues.map((issue) => (
                        <li key={issue.rule}>{issue.message}</li>
                    ))}
                </ul>
            ) : null}

            {templateIssues.length > 0 ? (
                <ul data-testid="template-issues" className="flex flex-col gap-1 text-ink-mid">
                    {templateIssues.map((issue, index) => (
                        <li key={index}>{templateMessage(issue)}</li>
                    ))}
                </ul>
            ) : null}

            {slugDropped ? (
                <p data-testid="slug-dropped" className="text-ink-mid">
                    De la descripción no sobrevivió ningún carácter que git pueda usar: un nombre de
                    rama solo admite letras sin tilde, números y guiones.
                </p>
            ) : null}
        </div>
    );
}
