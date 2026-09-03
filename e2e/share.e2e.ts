import { expect, test } from '@playwright/test';

test('un link con la configuración del equipo llega con todo puesto', async ({ page }) => {
    await page.goto('/?t=%7Bticket%7D-%7Bslug%7D&p=CON&types=feature,hotfix');

    await expect(page.getByLabel('Plantilla')).toHaveValue('{ticket}-{slug}');
    await expect(page.getByLabel('Prefijo del proyecto')).toHaveValue('CON');
    await expect(page.getByLabel('Tipos')).toHaveValue('feature, hotfix');
    await expect(page.getByLabel('Tipo', { exact: true }).locator('option')).toHaveText([
        'feature',
        'hotfix',
    ]);

    await page.getByLabel('Ticket', { exact: true }).fill('1234');
    await page.getByLabel('Descripción').fill('Arreglar login');
    await expect(page.getByTestId('branch-name')).toHaveText('1234-arreglar-login');
});

test('editar la configuración la deja escrita en la URL', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Prefijo del proyecto').fill('ACME');

    await expect(page).toHaveURL(/p=ACME/);
});

test('lo efímero no viaja: el ticket y la descripción no van en la URL', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Ticket', { exact: true }).fill('1234');
    await page.getByLabel('Descripción').fill('Arreglar login');

    // Se espera a que el debounce escriba algo, y recién ahí se mira qué escribió.
    await expect(page).toHaveURL(/t=/);
    expect(page.url()).not.toContain('1234');
    expect(page.url()).not.toContain('rreglar');
});
