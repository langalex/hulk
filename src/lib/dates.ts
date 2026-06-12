export function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
	const [y, m, d] = s.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, n: number): string {
	const d = parseDate(dateStr);
	d.setDate(d.getDate() + n);
	return formatDate(d);
}

export function isToday(dateStr: string): boolean {
	return dateStr === formatDate(new Date());
}

export function formatDisplayDate(dateStr: string): string {
	if (isToday(dateStr)) return 'Today';
	return parseDate(dateStr).toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});
}

export function currentTime(): string {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
