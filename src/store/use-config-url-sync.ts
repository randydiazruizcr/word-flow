'use client';

import { useEffect, useRef } from 'react';

import { configFromParams, configToParams } from '@/lib/url/config-params';
import { useBranchStore } from './branch-store';

const DEBOUNCE_MS = 300;

/**
 * Lee la configuración de la URL al montar y la vuelve a escribir mientras se edita.
 * Solo viaja la convención del equipo: el ticket y la descripción se quedan acá.
 */
export function useConfigUrlSync(): void {
    const template = useBranchStore((state) => state.config.template);
    const project = useBranchStore((state) => state.config.project);
    const types = useBranchStore((state) => state.config.types);
    const loadConfig = useBranchStore((state) => state.loadConfig);
    const loaded = useRef(false);

    useEffect(() => {
        loadConfig(configFromParams(new URLSearchParams(window.location.search)));
        loaded.current = true;
    }, [loadConfig]);

    useEffect(() => {
        // No escribir antes de leer, o la primera pintura borra la URL compartida.
        if (!loaded.current) return;

        const timer = window.setTimeout(() => {
            const query = configToParams({ template, project, types }).toString();
            // replaceState: escribir la plantilla no debe llenar el botón «atrás».
            window.history.replaceState(
                null,
                '',
                query === '' ? window.location.pathname : `?${query}`
            );
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [template, project, types]);
}
