'use client';

import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
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
            <Select
                id="type"
                value={type}
                options={types}
                onChange={setType}
                disabled={empty}
                placeholder="Sin tipos"
            />
        </Field>
    );
}
