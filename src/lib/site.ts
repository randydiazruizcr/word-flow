/** Public origin of the deployed site; `NEXT_PUBLIC_SITE_URL` overrides it (a custom domain, a preview). */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://word-flow-ashen.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'word-flow';
export const SITE_TITLE = 'word-flow · Nombres de rama de git';
export const SITE_DESCRIPTION =
    'Armá nombres de rama de git con tu propia plantilla: sin tildes, sin separadores de más y válidos para git. Todo pasa en tu navegador.';
