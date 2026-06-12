import PouchDB from 'pouchdb';
import MemoryAdapter from 'pouchdb-adapter-memory';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PRESETS_ID } from './ids';
import { addPreset, getPresets, removePreset } from './preset-repository';
import { clearDbSingleton, resetDbForTests } from './pouch';

PouchDB.plugin(MemoryAdapter);

describe('preset-repository', () => {
	let db: PouchDB.Database;

	beforeEach(() => {
		db = new PouchDB('test-presets', { adapter: 'memory' });
		resetDbForTests(db as never);
	});

	afterEach(async () => {
		await db.destroy();
		clearDbSingleton();
	});

	it('returns empty list when document is missing', async () => {
		expect(await getPresets()).toEqual([]);
	});

	it('adds presets to settings document', async () => {
		await addPreset({ description: 'Shake', grams: 30 });
		const presets = await getPresets();
		expect(presets).toHaveLength(1);
		expect(presets[0].description).toBe('Shake');
		expect(presets[0].grams).toBe(30);
	});

	it('removes preset by id', async () => {
		await addPreset({ id: 'preset-1', description: 'Shake', grams: 30 });
		await removePreset('preset-1');
		expect(await getPresets()).toEqual([]);
	});

	it('stores presets under settings:presets id', async () => {
		await addPreset({ description: 'Yogurt', grams: 15 });
		const doc = await db.get(PRESETS_ID);
		expect(doc._id).toBe(PRESETS_ID);
	});
});
