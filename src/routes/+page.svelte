<script lang="ts">
	import { onMount } from 'svelte';
	import AddIntakeForm from '$lib/components/AddIntakeForm.svelte';
	import DateNav from '$lib/components/DateNav.svelte';
	import IntakeTable from '$lib/components/IntakeTable.svelte';
	import { remainingGoalGrams } from '$lib/app-badge';
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
	const hasGoal = $derived(day?.goalGrams !== undefined);
	const displayGrams = $derived(
		hasGoal && day?.goalGrams !== undefined
			? remainingGoalGrams(day.goalGrams, total)
			: total
	);
	const displayLabel = $derived(hasGoal ? 'Remaining protein' : 'Total protein');

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
</script>

<section class="flex flex-1 flex-col gap-4 pb-44">
	<DateNav date={selectedDate} onPrev={goPrev} onNext={goNext} onToday={goToday} />

	{#if day}
		<IntakeTable intakes={day.intakes} date={selectedDate} />
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

{#if day}
	<div
		class="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur"
	>
		<div
			class="mx-auto max-w-lg overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-950/30 shadow-lg shadow-emerald-500/10"
		>
			<div class="px-4 py-4 text-center">
				<p class="text-xs uppercase tracking-wide text-zinc-400">{displayLabel}</p>
				<p class="text-4xl font-extrabold tabular-nums text-emerald-400">{displayGrams} g</p>
			</div>
			{#if !showForm}
				<button
					type="button"
					class="h-12 w-full border-t border-emerald-500/20 bg-emerald-600 text-base font-semibold text-white active:bg-emerald-500"
					onclick={openForm}
				>
					Add protein
				</button>
			{/if}
		</div>
	</div>
{/if}
