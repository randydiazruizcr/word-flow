import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('arma el nombre y lo deja en el portapapeles', async ({ page }) => {
    await page.getByLabel('Prefijo del proyecto').fill('CON');
    await page.getByLabel('Ticket', { exact: true }).fill('1234');
    await page.getByLabel('Descripción').fill('Arreglar el Login con tildes ñoño');

    await expect(page.getByTestId('branch-name')).toHaveText(
        'feature/CON-1234-arreglar-el-login-con-tildes-nono'
    );

    await page.getByRole('button', { name: 'Copiar rama' }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe('feature/CON-1234-arreglar-el-login-con-tildes-nono');
});

test('sin ticket no quedan separadores de más', async ({ page }) => {
    await page.getByLabel('Prefijo del proyecto').fill('CON');
    await page.getByLabel('Descripción').fill('Arreglar login');

    const name = await page.getByTestId('branch-name').textContent();
    expect(name).toBe('feature/CON-arreglar-login');
    expect(name).not.toContain('--');
});

test('una plantilla que termina en .lock queda marcada como inválida', async ({ page }) => {
    await page.getByLabel('Descripción').fill('Arreglar login');
    await page.getByLabel('Plantilla').fill('{type}/{slug}.lock');

    await expect(page.getByTestId('verdict')).toHaveAttribute('data-status', 'error');
    await expect(page.getByTestId('validation-issues')).toContainText('.lock');

    // Y no se ofrece el comando: copiarlo solo llevaría al error críptico de git.
    await expect(page.getByTestId('git-command')).toBeHidden();
});

test('el comando de git sale listo para pegar', async ({ page }) => {
    await page.getByLabel('Descripción').fill('Arreglar login');

    await expect(page.getByTestId('git-command')).toHaveText(
        'git checkout -b feature/arreglar-login'
    );

    await page.getByRole('button', { name: 'Copiar comando' }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe('git checkout -b feature/arreglar-login');
});
