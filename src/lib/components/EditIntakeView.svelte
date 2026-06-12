<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import AddIntakeForm from '$lib/components/AddIntakeForm.svelte';
	import * as dayRepository from '$lib/db/day-repository';
	import * as presetRepository from '$lib/db/preset-repository';
	import { subscribeToChanges } from '$lib/db/pouch';
	import type { IntakeEntry, Preset } from '$lib/db/types';

	interface Props {
		date: string;
		id: string;
	}

	let { date, id }: Props = $props();

	let intake = $state<IntakeEntry | null>(null);
	let presets = $state<Preset[]>([]);
	let formTime = $state('');
	let formDescription = $state('');
	let formGrams = $state('');
	let formMultiplier = $state('1');
	let pendingDelete = $state(false);

	async function load() {
		const [day, loadedPresets] = await Promise.all([
			dayRepository.getDay(date),
			presetRepository.getPresets()
		]);
		presets = loadedPresets;
		const found = day.intakes.find((i) => i.id === id) ?? null;
		intake = found;
		if (found) {
			const multiplier = found.multiplier ?? 1;
			formTime = found.time;
			formDescription = found.description;
			formGrams = String(found.grams / multiplier);
			formMultiplier = String(multiplier);
		}
	}

	onMount(() => {
		void load();
		return subscribeToChanges(() => {
			void load();
		});
	});

	function selectPreset(preset: Preset) {
		formDescription = preset.description;
		formGrams = String(preset.grams);
	}

	async function saveIntake() {
		await dayRepository.updateIntake(date, id, {
			time: formTime,
			description: formDescription.trim(),
			grams: Number(formGrams) * Number(formMultiplier),
			multiplier: Number(formMultiplier)
		});
		await goto(resolve('/'));
	}

	function requestDelete() {
		pendingDelete = true;
	}

	function cancelDelete() {
		pendingDelete = false;
	}

	async function confirmDelete() {
		await dayRepository.removeIntake(date, id);
		pendingDelete = false;
		await goto(resolve('/'));
	}
</script>

<section class="space-y-4">
	<h1 class="text-xl font-semibold text-zinc-100">Edit intake</h1>

	{#if intake}
		<AddIntakeForm
			{presets}
			heading="Edit intake"
			bind:time={formTime}
			bind:description={formDescription}
			bind:grams={formGrams}
			bind:multiplier={formMultiplier}
			onSubmit={saveIntake}
			onCancel={() => goto(resolve('/'))}
			onSelectPreset={selectPreset}
			onDelete={requestDelete}
		/>
	{:else}
		<p class="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-400">
			Intake not found.
		</p>
		<a href={resolve('/')} class="block text-center text-sm text-emerald-400 hover:text-emerald-300">
			Back to today
		</a>
	{/if}
</section>

{#if pendingDelete && intake}
	<dialog
		open
		class="fixed inset-0 z-50 m-0 flex h-dvh max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-4 backdrop:bg-black/60"
		aria-labelledby="remove-intake-title"
		onclick={(e) => {
			if (e.currentTarget === e.target) cancelDelete();
		}}
		oncancel={(e) => {
			e.preventDefault();
			cancelDelete();
		}}
	>
		<div class="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-4">
			<h2 id="remove-intake-title" class="text-base font-semibold text-zinc-100">Remove intake?</h2>
			<p class="mt-2 text-sm text-zinc-400">
				{intake.description} ({intake.grams} g) will be deleted.
			</p>
			<div class="mt-4 flex gap-2">
				<button
					type="button"
					class="h-11 flex-1 rounded-lg bg-red-600 font-medium text-white active:bg-red-500"
					onclick={confirmDelete}
				>
					Remove
				</button>
				<button
					type="button"
					class="h-11 rounded-lg bg-zinc-800 px-4 text-zinc-200 active:bg-zinc-700"
					onclick={cancelDelete}
				>
					Cancel
				</button>
			</div>
		</div>
	</dialog>
{/if}
