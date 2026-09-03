'use client';

import { Field, inputClassName } from '@/components/ui/Field';
import { useBranchStore } from '@/store/branch-store';

export function TicketInput() {
    const ticket = useBranchStore((state) => state.values.ticket);
    const setTicket = useBranchStore((state) => state.setTicket);

    return (
        <Field label="Ticket" htmlFor="ticket" tokenClassName="text-tok-ticket">
            <input
                id="ticket"
                // Numérico para el teclado del teléfono, pero sin restringir: hay tableros
                // cuyas claves no son números.
                inputMode="numeric"
                value={ticket}
                onChange={(event) => setTicket(event.target.value)}
                placeholder="1234"
                spellCheck={false}
                autoComplete="off"
                className={inputClassName}
            />
        </Field>
    );
}
