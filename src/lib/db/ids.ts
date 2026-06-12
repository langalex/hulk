export const DAY_PREFIX = 'day:';
export const PRESETS_ID = 'settings:presets';
export const APP_SETTINGS_ID = 'settings:app';

export function dayId(date: string): string {
	return `${DAY_PREFIX}${date}`;
}
