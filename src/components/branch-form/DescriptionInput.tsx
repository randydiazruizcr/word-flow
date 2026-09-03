'use client';

import { Field, inputClassName } from '@/components/ui/Field';
import { useBranchStore } from '@/store/branch-store';

export function DescriptionInput() {
    const description = useBranchStore((state) => state.values.description);
    const setDescription = useBranchStore((state) => state.setDescription);

    return (
        <Field
            label="Descripción"
            htmlFor="description"
            hint="Escribila como la dirías. De acá sale {slug}."
        >
            <input
                id="description"
                autoFocus
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Arreglar el login con tildes"
                className={inputClassName}
            />
        </Field>
    );
}
