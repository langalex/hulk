<script lang="ts">
	import type { IntakeEntry } from '$lib/db/types';

	interface Props {
		intakes: IntakeEntry[];
		onRemove?: (id: string) => void;
	}

	let { intakes, onRemove }: Props = $props();

	let pendingRemove = $state<IntakeEntry | null>(null);

	const sorted = $derived([...intakes].sort((a, b) => a.time.localeCompare(b.time)));

	function requestRemove(intake: IntakeEntry) {
		pendingRemove = intake;
	}

	function cancelRemove() {
		pendingRemove = null;
	}

	function confirmRemove() {
		if (pendingRemove && onRemove) {
			onRemove(pendingRemove.id);
			pendingRemove = null;
		}
	}
</script>

{#if sorted.length === 0}
	<p class="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-400">
		No protein recorded yet.
	</p>
{:else}
	<div class="overflow-x-auto rounded-lg border border-zinc-800">
		<table class="w-full text-left text-sm">
			<thead class="bg-zinc-900 text-zinc-400">
				<tr>
					<th class="px-3 py-2 font-medium">Description</th>
					<th class="px-3 py-2 text-right font-medium">Grams</th>
					{#if onRemove}
						<th class="w-10 px-2 py-2"><span class="sr-only">Remove</span></th>
					{/if}
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-800">
				{#each sorted as intake (intake.id)}
					<tr class="text-zinc-100">
						<td class="px-3 py-2">{intake.description}</td>
						<td class="px-3 py-2 text-right tabular-nums">{intake.grams} g</td>
						{#if onRemove}
							<td class="px-2 py-2 text-right">
								<button
									type="button"
									class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 active:bg-zinc-800"
									aria-label="Remove {intake.description}"
									onclick={() => requestRemove(intake)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.508 0 .91.093 1.25.25V3.75c0-.69-.56-1.25-1.25-1.25S8.75 3.06 8.75 3.75v.5c.34-.157.742-.25 1.25-.25ZM8.755 8.75a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm3.75.06a.75.75 0 0 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if pendingRemove}
	<dialog
		open
		class="fixed inset-0 z-50 m-0 flex h-dvh max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-4 backdrop:bg-black/60"
		aria-labelledby="remove-intake-title"
		onclick={(e) => {
			if (e.currentTarget === e.target) cancelRemove();
		}}
		oncancel={(e) => {
			e.preventDefault();
			cancelRemove();
		}}
	>
		<div class="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-4">
			<h2 id="remove-intake-title" class="text-base font-semibold text-zinc-100">Remove intake?</h2>
			<p class="mt-2 text-sm text-zinc-400">
				{pendingRemove.description} ({pendingRemove.grams} g) will be deleted.
			</p>
			<div class="mt-4 flex gap-2">
				<button
					type="button"
					class="h-11 flex-1 rounded-lg bg-red-600 font-medium text-white active:bg-red-500"
					onclick={confirmRemove}
				>
					Remove
				</button>
				<button
					type="button"
					class="h-11 rounded-lg bg-zinc-800 px-4 text-zinc-200 active:bg-zinc-700"
					onclick={cancelRemove}
				>
					Cancel
				</button>
			</div>
		</div>
	</dialog>
{/if}
