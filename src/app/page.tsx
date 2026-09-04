'use client';

import { PresetPicker } from '@/components/branch-config/PresetPicker';
import { ProjectInput } from '@/components/branch-config/ProjectInput';
import { TemplateInput } from '@/components/branch-config/TemplateInput';
import { TypeListInput } from '@/components/branch-config/TypeListInput';
import { DescriptionInput } from '@/components/branch-form/DescriptionInput';
import { TicketInput } from '@/components/branch-form/TicketInput';
import { TypeSelect } from '@/components/branch-form/TypeSelect';
import { BranchPreview } from '@/components/branch-output/BranchPreview';
import { GitCommand } from '@/components/branch-output/GitCommand';
import { ValidationReport } from '@/components/branch-output/ValidationReport';
import { Panel } from '@/components/ui/Panel';
import { ShortcutHints } from '@/components/ui/ShortcutHints';
import { useShortcuts } from '@/store/use-shortcuts';

export default function Home() {
    const { copied } = useShortcuts();

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
            <header className="flex flex-col gap-1">
                <h1 className="font-mono text-2xl font-semibold tracking-tight">word-flow</h1>
                <p className="max-w-prose text-sm text-ink-mid">
                    Armá el nombre de la rama con la convención de tu equipo. Todo pasa en tu
                    navegador: nada de esto sale de la pestaña.
                </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Configuración">
                    <PresetPicker />
                    <TemplateInput />
                    <TypeListInput />
                    <ProjectInput />
                </Panel>

                <Panel title="Rama">
                    <TypeSelect />
                    <TicketInput />
                    <DescriptionInput />
                </Panel>
            </div>

            {/* El resultado es lo que viniste a buscar, así que es lo más grande de la pantalla. */}
            <section className="flex flex-col gap-4 rounded-lg border border-line-strong bg-surface-raised p-5 shadow-panel">
                <BranchPreview />
                <ValidationReport />
                <GitCommand />
            </section>

            <ShortcutHints copied={copied} />
        </main>
    );
}
