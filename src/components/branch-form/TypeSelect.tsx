'use client';

import { Field, inputClassName } from '@/components/ui/Field';
import { cn } from '@/lib/cn';
import { useBranchStore } from '@/store/branch-store';

export function TypeSelect() {
    const types = useBranchStore((state) => state.config.types);
    const type = useBranchStore((state) => state.values.type);
    const setType = useBranchStore((state) => state.setType);
    const empty = types.length === 0;

    return (
        <Field
            label="Tipo"
            htmlFor="type"
            tokenClassName="text-tok-type"
            hint={empty ? 'Agregá algún tipo en la configuración.' : undefined}
        >
            <select
                id="type"
                value={type}
                disabled={empty}
                onChange={(event) => setType(event.target.value)}
                className={cn(inputClassName, 'disabled:text-ink-muted')}
            >
                {types.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </Field>
    );
}
