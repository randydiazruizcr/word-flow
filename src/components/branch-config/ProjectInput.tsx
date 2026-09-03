'use client';

import { Field, inputClassName } from '@/components/ui/Field';
import { useBranchStore } from '@/store/branch-store';

export function ProjectInput() {
    const project = useBranchStore((state) => state.config.project);
    const setProject = useBranchStore((state) => state.setProject);

    return (
        <Field
            label="Prefijo del proyecto"
            htmlFor="project"
            tokenClassName="text-tok-project"
            hint="Alimenta {project}. Conserva las mayúsculas."
        >
            <input
                id="project"
                value={project}
                onChange={(event) => setProject(event.target.value)}
                placeholder="CON"
                spellCheck={false}
                autoComplete="off"
                className={inputClassName}
            />
        </Field>
    );
}
