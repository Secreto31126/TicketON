import { test, expect } from '@playwright/test';

const domain = 'localhost:3000';

test('test', async ({ page }) => {
	await page.goto(domain + '/buy/test');
	await page
		.locator('#mp div')
		.filter({ hasText: 'Tarjeta de crédito Cuotas disponibles' })
		.nth(2)
		.click();
	await page
		.frameLocator('iframe[name="cardNumber"]')
		.getByPlaceholder('1234 1234 1234 1234')
		.click();
	await page
		.frameLocator('iframe[name="cardNumber"]')
		.getByPlaceholder('1234 1234 1234 1234')
		.fill('5031 7557 3453 0604');
	await page.frameLocator('iframe[name="expirationDate"]').getByPlaceholder('MM/AA').click();
	await page.frameLocator('iframe[name="expirationDate"]').getByPlaceholder('MM/AA').fill('11/25');
	await page.frameLocator('iframe[name="expirationDate"]').getByPlaceholder('MM/AA').press('Tab');
	await page.frameLocator('iframe[name="securityCode"]').getByPlaceholder('123').fill('123');
	await page.getByPlaceholder('María López').click();
	await page.getByPlaceholder('María López').fill('APRO');
	await page.getByPlaceholder('99999999').click();
	await page.getByPlaceholder('99999999').fill('12345678');
	await page.getByRole('combobox').nth(1).selectOption('1');
	await page.getByPlaceholder('ejemplo@email.com').click();
	await page.getByPlaceholder('ejemplo@email.com').fill('ejemplo@gmail.com');
	await page.getByRole('button', { name: 'Pagar' }).click();
	await page.waitForURL(domain + '/buy/test/success?*');
});
