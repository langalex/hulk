<script lang="ts">
	import { onMount } from 'svelte';
	import * as presetRepository from '$lib/db/preset-repository';
	import * as settingsRepository from '$lib/db/settings-repository';
	import { subscribeToChanges } from '$lib/db/pouch';
	import type { Preset } from '$lib/db/types';
	import { formatGrams } from '$lib/grams';

	let presets = $state<Preset[]>([]);
	let description = $state('');
	let grams = $state('');
	let proteinGoal = $state('');
	let savedProteinGoal = $state<number | null>(null);

	async function loadPresets() {
		presets = await presetRepository.getPresets();
	}

	async function loadProteinGoal() {
		const goal = await settingsRepository.getProteinGoal();
		savedProteinGoal = goal;
		proteinGoal = goal === null ? '' : String(goal);
	}

	async function loadSettings() {
		await Promise.all([loadPresets(), loadProteinGoal()]);
	}

	onMount(() => {
		void loadSettings();
		return subscribeToChanges(() => {
			void loadSettings();
		});
	});

	async function saveProteinGoal(e: SubmitEvent) {
		e.preventDefault();
		const value = Number(proteinGoal);
		if (Number.isNaN(value) || value < 0) return;
		if (savedProteinGoal === value) return;

		await settingsRepository.setProteinGoal(value);
		await loadProteinGoal();
	}

	async function addPreset(e: SubmitEvent) {
		e.preventDefault();
		const value = Number(grams);
		if (!description.trim() || Number.isNaN(value)) return;

		await presetRepository.addPreset({
			description: description.trim(),
			grams: value
		});
		description = '';
		grams = '';
		await loadPresets();
	}

	async function removePreset(id: string) {
		await presetRepository.removePreset(id);
		await loadPresets();
	}
</script>

<section class="space-y-6">
	<div>
		<h1 class="text-xl font-semibold text-zinc-100">Settings</h1>
	</div>

	<form
		class="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
		onsubmit={saveProteinGoal}
	>
		<h2 class="text-sm font-medium text-zinc-300">Daily protein goal</h2>
		<p class="text-sm text-zinc-400">
			After setting a goal, remaining instead of total protein is shown.
		</p>
		<label class="block space-y-1">
			<span class="text-xs text-zinc-400">Goal (grams)</span>
			<input
				type="number"
				bind:value={proteinGoal}
				required
				min="0"
				step="1"
				placeholder="e.g. 150"
				class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
			/>
		</label>
		<button
			type="submit"
			class="h-11 w-full rounded-lg bg-emerald-600 font-medium text-white active:bg-emerald-500"
		>
			Save goal
		</button>
	</form>

	<div>
		<h2 class="text-lg font-semibold text-zinc-100">Preset intakes</h2>
		<p class="mt-1 text-sm text-zinc-400">
			Create shortcuts you can pick when logging protein on the daily overview.
		</p>
	</div>

	<form class="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4" onsubmit={addPreset}>
		<h2 class="text-sm font-medium text-zinc-300">Add preset</h2>
		<label class="block space-y-1">
			<span class="text-xs text-zinc-400">Description</span>
			<input
				type="text"
				bind:value={description}
				required
				placeholder="e.g. Protein shake"
				class="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
			/>
		</label>
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
		<button
			type="submit"
			class="h-11 w-full rounded-lg bg-emerald-600 font-medium text-white active:bg-emerald-500"
		>
			Add preset
		</button>
	</form>

	{#if presets.length === 0}
		<p class="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-400">
			No presets yet.
		</p>
	{:else}
		<ul class="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
			{#each presets as preset (preset.id)}
				<li class="flex items-center justify-between gap-3 px-4 py-3">
					<div>
						<p class="font-medium text-zinc-100">{preset.description}</p>
						<p class="text-sm tabular-nums text-zinc-400">{formatGrams(preset.grams)} g</p>
					</div>
					<button
						type="button"
						class="text-sm text-zinc-500 hover:text-red-400"
						aria-label="Remove {preset.description}"
						onclick={() => removePreset(preset.id)}
					>
						Remove
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>
