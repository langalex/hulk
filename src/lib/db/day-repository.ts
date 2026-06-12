import { dayId } from './ids';
import { getDb } from './pouch';
import * as settingsRepository from './settings-repository';
import type { DayDocument, IntakeEntry } from './types';

function emptyDay(date: string): DayDocument {
	return { _id: dayId(date), date, intakes: [] };
}

export async function getDay(date: string): Promise<DayDocument> {
	const db = getDb();
	try {
		return await db.get<DayDocument>(dayId(date));
	} catch (err: unknown) {
		if (isNotFound(err)) {
			return emptyDay(date);
		}
		throw err;
	}
}

export async function addIntake(
	date: string,
	entry: Omit<IntakeEntry, 'id'> & { id?: string }
): Promise<void> {
	const db = getDb();
	const doc = await getDay(date);
	if (doc.goalGrams === undefined) {
		const goal = await settingsRepository.getProteinGoal();
		if (goal !== null) {
			doc.goalGrams = goal;
		}
	}
	const intake: IntakeEntry = {
		id: entry.id ?? crypto.randomUUID(),
		time: entry.time,
		description: entry.description,
		grams: entry.grams,
		multiplier: entry.multiplier
	};
	doc.intakes = [...doc.intakes, intake].sort((a, b) => a.time.localeCompare(b.time));
	await db.put(doc);
}

export async function updateIntake(
	date: string,
	id: string,
	entry: Omit<IntakeEntry, 'id'>
): Promise<void> {
	const db = getDb();
	const doc = await getDay(date);
	const index = doc.intakes.findIndex((i) => i.id === id);
	if (index === -1) return;
	doc.intakes[index] = { ...entry, id };
	doc.intakes = [...doc.intakes].sort((a, b) => a.time.localeCompare(b.time));
	await db.put(doc);
}

export async function removeIntake(date: string, id: string): Promise<void> {
	const db = getDb();
	const doc = await getDay(date);
	if (doc.intakes.length === 0) return;
	doc.intakes = doc.intakes.filter((i) => i.id !== id);
	if (doc.intakes.length === 0) {
		try {
			const existing = await db.get<DayDocument>(dayId(date));
			await db.remove({ ...existing, _rev: existing._rev! });
		} catch (err: unknown) {
			if (!isNotFound(err)) throw err;
		}
	} else {
		await db.put(doc);
	}
}

function isNotFound(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'name' in err &&
		(err as { name: string }).name === 'not_found'
	);
}
