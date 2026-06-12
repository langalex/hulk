<script lang="ts">
	import { onMount } from 'svelte';
	import AddIntakeForm from '$lib/components/AddIntakeForm.svelte';
	import DateNav from '$lib/components/DateNav.svelte';
	import IntakeTable from '$lib/components/IntakeTable.svelte';
	import { addDays, currentTime, formatDate } from '$lib/dates';
	import * as dayRepository from '$lib/db/day-repository';
	import * as presetRepository from '$lib/db/preset-repository';
	import { subscribeToChanges } from '$lib/db/pouch';
	import type { DayDocument, Preset } from '$lib/db/types';

	let selectedDate = $state(formatDate(new Date()));
	let day = $state<DayDocument | null>(null);
	let presets = $state<Preset[]>([]);
	let showForm = $state(false);
	let formTime = $state(currentTime());
	let formDescription = $state('');
	let formGrams = $state('');
	let formMultiplier = $state('1');

	const total = $derived(day?.intakes.reduce((sum, i) => sum + i.grams, 0) ?? 0);

	async function loadDay() {
		day = await dayRepository.getDay(selectedDate);
	}

	async function loadPresets() {
		presets = await presetRepository.getPresets();
	}

	async function refresh() {
		await Promise.all([loadDay(), loadPresets()]);
	}

	onMount(() => {
		void refresh();
		return subscribeToChanges(() => {
			void refresh();
		});
	});

	function goPrev() {
		selectedDate = addDays(selectedDate, -1);
		void loadDay();
	}

	function goNext() {
		selectedDate = addDays(selectedDate, 1);
		void loadDay();
	}

	function goToday() {
		selectedDate = formatDate(new Date());
		void loadDay();
	}

	function openForm() {
		formTime = currentTime();
		formDescription = '';
		formGrams = '';
		formMultiplier = '1';
		showForm = true;
	}

	function closeForm() {
		showForm = false;
	}

	function selectPreset(preset: Preset) {
		formDescription = preset.description;
		formGrams = String(preset.grams);
	}

	async function saveIntake() {
		await dayRepository.addIntake(selectedDate, {
			time: formTime,
			description: formDescription.trim(),
			grams: Number(formGrams) * Number(formMultiplier),
			multiplier: Number(formMultiplier)
		});
		closeForm();
		await loadDay();
	}

	async function removeIntake(id: string) {
		await dayRepository.removeIntake(selectedDate, id);
		await loadDay();
	}
</script>

<section class="flex flex-1 flex-col gap-4">
	<DateNav date={selectedDate} onPrev={goPrev} onNext={goNext} onToday={goToday} />

	{#if day}
		<IntakeTable intakes={day.intakes} onRemove={removeIntake} />

		<div class="flex flex-col items-center rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-6 text-center shadow-lg shadow-emerald-500/10">
			<p class="text-xs uppercase tracking-wide text-zinc-400">Total protein</p>
			<p class="text-5xl font-extrabold tabular-nums text-emerald-400">{total} g</p>
		</div>
	{/if}

	{#if showForm}
		<AddIntakeForm
			{presets}
			bind:time={formTime}
			bind:description={formDescription}
			bind:grams={formGrams}
			bind:multiplier={formMultiplier}
			onSubmit={saveIntake}
			onCancel={closeForm}
			onSelectPreset={selectPreset}
		/>
	{/if}
</section>

{#if !showForm}
	<div class="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
		<div class="mx-auto max-w-lg">
			<button
				type="button"
				class="h-12 w-full rounded-lg bg-emerald-600 text-base font-semibold text-white active:bg-emerald-500"
				onclick={openForm}
			>
				Add protein
			</button>
		</div>
	</div>
{/if}
