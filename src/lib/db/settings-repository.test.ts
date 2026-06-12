import PouchDB from 'pouchdb';
import MemoryAdapter from 'pouchdb-adapter-memory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SETTINGS_ID, dayId } from './ids';
import { getDay } from './day-repository';
import { getProteinGoal, setProteinGoal } from './settings-repository';
import { clearDbSingleton, resetDbForTests } from './pouch';

PouchDB.plugin(MemoryAdapter);

describe('settings-repository', () => {
	let db: PouchDB.Database;

	beforeEach(() => {
		db = new PouchDB('test-settings', { adapter: 'memory' });
		resetDbForTests(db as never);
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-12T12:00:00'));
	});

	afterEach(async () => {
		vi.useRealTimers();
		await db.destroy();
		clearDbSingleton();
	});

	it('returns null when goal is not set', async () => {
		expect(await getProteinGoal()).toBeNull();
	});

	it('stores protein goal in settings document', async () => {
		await setProteinGoal(150);
		expect(await getProteinGoal()).toBe(150);

		const doc = await db.get(APP_SETTINGS_ID);
		expect(doc).toMatchObject({ proteinGoalGrams: 150 });
	});

	it('stores goal on today when protein goal changes', async () => {
		await setProteinGoal(150);
		const today = await getDay('2026-06-12');
		expect(today.goalGrams).toBe(150);
	});

	it('does not update today when protein goal is unchanged', async () => {
		await setProteinGoal(150);
		const before = await db.get(dayId('2026-06-12'));
		await setProteinGoal(150);
		const after = await db.get(dayId('2026-06-12'));
		expect(after._rev).toBe(before._rev);
	});
});
