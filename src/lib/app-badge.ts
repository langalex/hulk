import { formatDate } from '$lib/dates';
import * as dayRepository from '$lib/db/day-repository';

export async function setAppBadgeGrams(grams: number): Promise<void> {
	if (!('setAppBadge' in navigator)) return;

	let permission = Notification.permission;
	if (permission === 'denied') return;
	if (permission === 'default' && grams > 0) {
		permission = await Notification.requestPermission();
	}
	if (permission !== 'granted') return;

	if (grams > 0) {
		await navigator.setAppBadge!(grams);
	} else {
		await navigator.clearAppBadge!();
	}
}

function intakeTotalGrams(intakes: { grams: number }[]): number {
	return intakes.reduce((sum, intake) => sum + intake.grams, 0);
}

export function remainingGoalGrams(goalGrams: number, totalGrams: number): number {
	return Math.max(0, goalGrams - totalGrams);
}

export async function syncTodayAppBadge(): Promise<void> {
	const day = await dayRepository.getDay(formatDate(new Date()));
	if (day.goalGrams === undefined) {
		await setAppBadgeGrams(0);
		return;
	}

	const remaining = remainingGoalGrams(day.goalGrams, intakeTotalGrams(day.intakes));
	await setAppBadgeGrams(remaining);
}
