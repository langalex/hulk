<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Preset } from '$lib/db/types';

	interface Props {
		presets: Preset[];
		time: string;
		description: string;
		grams: string;
		multiplier: string;
		heading?: string;
		footerHeight?: number;
		onSubmit: () => void;
		onCancel: () => void;
		onSelectPreset: (preset: Preset) => void;
		onDelete?: () => void;
	}

	let {
		presets,
		time = $bindable(),
		description = $bindable(),
		grams = $bindable(),
		multiplier = $bindable(),
		heading = 'Add intake',
		footerHeight = 0,
		onSubmit,
		onCancel,
		onSelectPreset,
		onDelete
	}: Props = $props();

	let submitButton: HTMLButtonElement | undefined;

	function scrollSubmitIntoView() {
		if (!submitButton) return;

		const gap = 8;
		const rect = submitButton.getBoundingClientRect();
		const maxBottom = window.innerHeight - footerHeight - gap;
		const scrollDelta = rect.bottom - maxBottom;

		if (scrollDelta > 0) {
			window.scrollBy({ top: scrollDelta, behavior: 'smooth' });
		}
	}

	onMount(() => {
		void tick().then(scrollSubmitIntoView);
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit();
	}

	function handleSelectPreset(preset: Preset) {
		onSelectPreset(preset);
		void tick().then(scrollSubmitIntoView);
	}
</script>

<form
	class="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
	aria-label={heading}
	onsubmit={handleSubmit}
>
	<h2 class="text-base font-semibold text-zinc-100">{heading}</h2>

	{#if presets.length > 0}
		<div class="space-y-2">
			<p class="text-xs text-zinc-400">Presets</p>
			<div class="flex flex-wrap gap-2">
				{#each presets as preset (preset.id)}
					<button
						type="button"
						class="rounded-full bg-zinc-800 px-3 py-2 text-xs text-zinc-200 active:bg-emerald-900"
						onclick={() => handleSelectPreset(preset)}
					>
						{preset.description} ({preset.grams} g)
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<label class="block space-y-1">
		<span class="text-xs text-zinc-400">Time</span>
		<input
			type="time"
			bind:value={time}
			required
			class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-xs text-zinc-400">Description</span>
		<input
			type="text"
			bind:value={description}
			required
			placeholder="e.g. Greek yogurt"
			class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
		/>
	</label>

	<div class="grid grid-cols-2 gap-3">
		<label class="block space-y-1">
			<span class="text-xs text-zinc-400">Grams</span>
			<input
				type="number"
				bind:value={grams}
				required
				min="0"
				step="0.1"
				class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
			/>
		</label>
		<label class="block space-y-1">
			<span class="text-xs text-zinc-400">Multiplier</span>
			<input
				type="number"
				bind:value={multiplier}
				required
				min="0.1"
				step="0.1"
				class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
			/>
		</label>
	</div>

	<div class="flex gap-2 pt-1">
		<button
			bind:this={submitButton}
			type="submit"
			class="h-11 flex-1 rounded-lg bg-emerald-600 font-medium text-white active:bg-emerald-500"
		>
			Save
		</button>
		<button
			type="button"
			class="h-11 rounded-lg bg-zinc-800 px-4 text-zinc-200 active:bg-zinc-700"
			onclick={onCancel}
		>
			Cancel
		</button>
	</div>

	{#if onDelete}
		<button
			type="button"
			class="h-11 w-full rounded-lg border border-red-900/50 text-red-400 active:bg-red-950/40"
			onclick={onDelete}
		>
			Delete
		</button>
	{/if}
</form>
