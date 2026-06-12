import { PRESETS_ID } from './ids';
import { getDb } from './pouch';
import type { Preset, PresetsDocument } from './types';

function emptyPresets(): PresetsDocument {
	return { _id: PRESETS_ID, presets: [] };
}

async function getPresetsDoc(): Promise<PresetsDocument> {
	const db = getDb();
	try {
		return await db.get<PresetsDocument>(PRESETS_ID);
	} catch (err: unknown) {
		if (isNotFound(err)) {
			return emptyPresets();
		}
		throw err;
	}
}

export async function getPresets(): Promise<Preset[]> {
	const doc = await getPresetsDoc();
	return doc.presets;
}

export async function addPreset(preset: Omit<Preset, 'id'> & { id?: string }): Promise<void> {
	const db = getDb();
	const doc = await getPresetsDoc();
	const item: Preset = {
		id: preset.id ?? crypto.randomUUID(),
		description: preset.description,
		grams: preset.grams
	};
	doc.presets = [...doc.presets, item];
	await db.put(doc);
}

export async function removePreset(id: string): Promise<void> {
	const db = getDb();
	const doc = await getPresetsDoc();
	doc.presets = doc.presets.filter((p) => p.id !== id);
	if (doc.presets.length === 0) {
		try {
			const existing = await db.get<PresetsDocument>(PRESETS_ID);
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
