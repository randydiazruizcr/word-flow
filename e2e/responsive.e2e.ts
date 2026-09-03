import { expect, test } from '@playwright/test';

const SIZES = [
    { name: 'teléfono', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'portátil', width: 1366, height: 768 },
];

for (const size of SIZES) {
    test(`en ${size.name} el resultado se ve sin scroll horizontal`, async ({ page }) => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto('/');

        await page.getByLabel('Prefijo del proyecto').fill('CON');
        await page.getByLabel('Ticket', { exact: true }).fill('1234');
        await page.getByLabel('Descripción').fill('Arreglar el login con tildes');

        await expect(page.getByTestId('branch-name')).toBeVisible();
        await expect(page.getByTestId('verdict')).toBeVisible();

        // Un nombre de rama largo no puede empujar la página a lo ancho.
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
    });
}
