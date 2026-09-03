'use client';

import { useState } from 'react';

import { Field, inputClassName } from '@/components/ui/Field';
import { parseTypeList, useBranchStore } from '@/store/branch-store';

export function TypeListInput() {
    const types = useBranchStore((state) => state.config.types);
    const setTypes = useBranchStore((state) => state.setTypes);

    /**
     * El campo guarda su propio texto crudo. Si mostrara `types.join(', ')`, la coma y el
     * espacio recién escritos desaparecerían al normalizar y nunca se podría agregar un
     * segundo tipo.
     */
    const [raw, setRaw] = useState(() => types.join(', '));
    const [seenTypes, setSeenTypes] = useState(types);

    // Ajuste durante el render, que es como React resuelve «sincronizar con lo de afuera»
    // sin un efecto: si la lista cambió por un preset o por la URL, el texto se rehace.
    if (types !== seenTypes) {
        setSeenTypes(types);
        if (parseTypeList(raw).join(',') !== types.join(',')) setRaw(types.join(', '));
    }

    return (
        <Field
            label="Tipos"
            htmlFor="types"
            tokenClassName="text-tok-type"
            hint="Separados por coma. Son las opciones del selector."
        >
            <input
                id="types"
                value={raw}
                onChange={(event) => {
                    setRaw(event.target.value);
                    setTypes(event.target.value);
                }}
                spellCheck={false}
                autoComplete="off"
                className={inputClassName}
            />
        </Field>
    );
}
