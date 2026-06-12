<script lang="ts">
	import { formatDisplayDate, isToday } from '$lib/dates';

	interface Props {
		date: string;
		onPrev: () => void;
		onNext: () => void;
		onToday: () => void;
	}

	let { date, onPrev, onNext, onToday }: Props = $props();
</script>

<nav class="flex items-center justify-between gap-2" aria-label="Date navigation">
	<button
		type="button"
		class="flex h-11 min-w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 active:bg-zinc-700"
		aria-label="Previous day"
		onclick={onPrev}
	>
		←
	</button>
	<div class="flex flex-1 items-center justify-center gap-2">
		<p class="text-sm font-medium text-zinc-100">{formatDisplayDate(date)}</p>
		{#if !isToday(date)}
			<button
				type="button"
				class="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white active:bg-emerald-500"
				aria-label="Go to today"
				onclick={onToday}
			>
				Today
			</button>
		{/if}
	</div>
	<button
		type="button"
		class="flex h-11 min-w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 active:bg-zinc-700"
		aria-label="Next day"
		onclick={onNext}
	>
		→
	</button>
</nav>
