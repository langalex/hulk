import PouchDB from 'pouchdb';
import MemoryAdapter from 'pouchdb-adapter-memory';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dayId } from './ids';
import { addIntake, getDay, removeIntake } from './day-repository';
import { clearDbSingleton, resetDbForTests } from './pouch';

PouchDB.plugin(MemoryAdapter);

describe('day-repository', () => {
	let db: PouchDB.Database;

	beforeEach(() => {
		db = new PouchDB('test-days', { adapter: 'memory' });
		resetDbForTests(db as never);
	});

	afterEach(async () => {
		await db.destroy();
		clearDbSingleton();
	});

	it('returns empty day when document is missing', async () => {
		const day = await getDay('2026-06-12');
		expect(day).toEqual({ _id: dayId('2026-06-12'), date: '2026-06-12', intakes: [] });
	});

	it('adds and sorts intakes by time', async () => {
		await addIntake('2026-06-12', { time: '14:00', description: 'Lunch', grams: 30 });
		await addIntake('2026-06-12', { time: '08:00', description: 'Breakfast', grams: 20 });

		const day = await getDay('2026-06-12');
		expect(day.intakes).toHaveLength(2);
		expect(day.intakes[0].description).toBe('Breakfast');
		expect(day.intakes[1].description).toBe('Lunch');
	});

	it('removes intake and deletes doc when last intake removed', async () => {
		await addIntake('2026-06-12', { time: '08:00', description: 'Breakfast', grams: 20 });
		const day = await getDay('2026-06-12');
		await removeIntake('2026-06-12', day.intakes[0].id);

		const after = await getDay('2026-06-12');
		expect(after.intakes).toHaveLength(0);
	});
});
