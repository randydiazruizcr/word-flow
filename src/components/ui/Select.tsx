'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

type SelectProps = {
    /** Va al disparador, así la etiqueta con htmlFor lo nombra. */
    id: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
};

/**
 * Listbox propio en vez del <select> del sistema. El motivo no es capricho: el desplegable
 * nativo lo dibuja el sistema operativo, no la página, así que sobre un fondo oscuro se abre
 * una lista blanca que no hay CSS que arregle.
 *
 * A cambio hay que reponer a mano lo que el nativo daba gratis: teclado, roles y foco.
 */
export function Select({ id, value, options, onChange, disabled, placeholder }: SelectProps) {
    const listId = useId();
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.indexOf(value)));
    const containerRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (!open) return;

        function onPointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        }

        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    useEffect(() => {
        if (open) activeRef.current?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIndex]);

    function openAt(index: number) {
        setActiveIndex(Math.min(Math.max(index, 0), options.length - 1));
        setOpen(true);
    }

    function choose(index: number) {
        const option = options[index];
        if (option !== undefined) onChange(option);
        setOpen(false);
    }

    function onKeyDown(event: React.KeyboardEvent) {
        if (disabled) return;

        // Esc y Enter tienen atajos globales en la página. Mientras la lista está abierta son
        // de la lista, así que no se dejan subir hasta el listener de document.
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                openAt(open ? activeIndex + 1 : Math.max(0, options.indexOf(value)));
                return;
            case 'ArrowUp':
                event.preventDefault();
                openAt(open ? activeIndex - 1 : Math.max(0, options.indexOf(value)));
                return;
            case 'Home':
                if (!open) return;
                event.preventDefault();
                setActiveIndex(0);
                return;
            case 'End':
                if (!open) return;
                event.preventDefault();
                setActiveIndex(options.length - 1);
                return;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (open) {
                    event.stopPropagation();
                    choose(activeIndex);
                } else {
                    openAt(Math.max(0, options.indexOf(value)));
                }
                return;
            case 'Escape':
                if (!open) return;
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                return;
            case 'Tab':
                setOpen(false);
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                id={id}
                type="button"
                role="combobox"
                aria-controls={listId}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
                disabled={disabled}
                onClick={() =>
                    open ? setOpen(false) : openAt(Math.max(0, options.indexOf(value)))
                }
                onKeyDown={onKeyDown}
                className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md border border-line bg-sunk px-3 py-2 text-left text-sm text-ink',
                    'hover:border-line-strong disabled:text-ink-muted disabled:hover:border-line'
                )}
            >
                <span className={cn(value === '' && 'text-ink-muted')}>
                    {value === '' ? (placeholder ?? '') : value}
                </span>
                <ChevronDown
                    aria-hidden
                    className={cn(
                        'size-4 shrink-0 text-ink-muted transition-transform',
                        open && 'rotate-180'
                    )}
                />
            </button>

            {open ? (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label="Opciones"
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line-strong bg-surface-raised py-1 shadow-panel"
                >
                    {options.map((option, index) => {
                        const active = index === activeIndex;
                        const selected = option === value;

                        return (
                            <li
                                key={option}
                                id={`${listId}-${index}`}
                                ref={active ? activeRef : undefined}
                                role="option"
                                aria-selected={selected}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => choose(index)}
                                className={cn(
                                    'flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-sm',
                                    active ? 'bg-accent-wash text-ink' : 'text-ink-mid'
                                )}
                            >
                                {option}
                                {selected ? (
                                    <Check aria-hidden className="size-3.5 text-accent" />
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
