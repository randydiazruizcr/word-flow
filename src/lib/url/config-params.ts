import { parseTypeList, type Config } from '@/store/branch-store';

const KEYS = { template: 't', project: 'p', types: 'types' } as const;

export function configToParams(config: Config): URLSearchParams {
    const params = new URLSearchParams();

    if (config.template !== '') params.set(KEYS.template, config.template);
    if (config.project !== '') params.set(KEYS.project, config.project);
    if (config.types.length > 0) params.set(KEYS.types, config.types.join(','));

    return params;
}

/** Solo devuelve las claves presentes: lo que no viaja en la URL no se pisa. */
export function configFromParams(params: URLSearchParams): Partial<Config> {
    const config: Partial<Config> = {};

    const template = params.get(KEYS.template);
    if (template !== null) config.template = template;

    const project = params.get(KEYS.project);
    if (project !== null) config.project = project;

    const types = params.get(KEYS.types);
    if (types !== null) config.types = parseTypeList(types);

    return config;
}
