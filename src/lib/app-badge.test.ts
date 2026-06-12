import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAppBadgeGrams } from './app-badge';

describe('setAppBadgeGrams', () => {
	const setAppBadge = vi.fn().mockResolvedValue(undefined);
	const clearAppBadge = vi.fn().mockResolvedValue(undefined);
	const requestPermission = vi.fn().mockResolvedValue('granted');

	beforeEach(() => {
		vi.stubGlobal('navigator', { setAppBadge, clearAppBadge });
		vi.stubGlobal('Notification', { permission: 'granted', requestPermission });
		setAppBadge.mockClear();
		clearAppBadge.mockClear();
		requestPermission.mockClear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sets badge when grams are logged', async () => {
		await setAppBadgeGrams(42);
		expect(setAppBadge).toHaveBeenCalledWith(42);
	});

	it('clears badge when no grams are logged', async () => {
		await setAppBadgeGrams(0);
		expect(clearAppBadge).toHaveBeenCalled();
	});

	it('requests permission before setting a non-zero badge', async () => {
		vi.stubGlobal('Notification', { permission: 'default', requestPermission });
		await setAppBadgeGrams(25);
		expect(requestPermission).toHaveBeenCalled();
		expect(setAppBadge).toHaveBeenCalledWith(25);
	});

	it('does nothing when the Badging API is unavailable', async () => {
		vi.stubGlobal('navigator', {});
		await setAppBadgeGrams(10);
		expect(setAppBadge).not.toHaveBeenCalled();
	});

	it('does nothing when notification permission is denied', async () => {
		vi.stubGlobal('Notification', { permission: 'denied', requestPermission });
		await setAppBadgeGrams(10);
		expect(setAppBadge).not.toHaveBeenCalled();
	});
});
