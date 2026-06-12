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

export async function syncTodayAppBadge(): Promise<void> {
	const day = await dayRepository.getDay(formatDate(new Date()));
	const total = day.intakes.reduce((sum, intake) => sum + intake.grams, 0);
	await setAppBadgeGrams(total);
}
