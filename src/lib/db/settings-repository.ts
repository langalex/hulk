import { formatDate } from '$lib/dates';
import { APP_SETTINGS_ID, dayId } from './ids';
import { getDb } from './pouch';
import type { AppSettingsDocument, DayDocument } from './types';

function emptySettings(): AppSettingsDocument {
	return { _id: APP_SETTINGS_ID, proteinGoalGrams: null };
}

async function getSettingsDoc(): Promise<AppSettingsDocument> {
	const db = getDb();
	try {
		return await db.get<AppSettingsDocument>(APP_SETTINGS_ID);
	} catch (err: unknown) {
		if (isNotFound(err)) {
			return emptySettings();
		}
		throw err;
	}
}

export async function getProteinGoal(): Promise<number | null> {
	const doc = await getSettingsDoc();
	return doc.proteinGoalGrams;
}

export async function setProteinGoal(grams: number): Promise<void> {
	const db = getDb();
	const doc = await getSettingsDoc();
	const previous = doc.proteinGoalGrams;
	doc.proteinGoalGrams = grams;
	await db.put(doc);

	if (previous !== grams) {
		await setTodayGoal(grams);
	}
}

async function setTodayGoal(goalGrams: number): Promise<void> {
	const db = getDb();
	const today = formatDate(new Date());
	let doc: DayDocument;
	try {
		doc = await db.get<DayDocument>(dayId(today));
	} catch (err: unknown) {
		if (isNotFound(err)) {
			doc = { _id: dayId(today), date: today, intakes: [] };
		} else {
			throw err;
		}
	}
	doc.goalGrams = goalGrams;
	await db.put(doc);
}

function isNotFound(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'name' in err &&
		(err as { name: string }).name === 'not_found'
	);
}
