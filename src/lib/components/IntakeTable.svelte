<script lang="ts">
	import { resolve } from '$app/paths';
	import type { IntakeEntry } from '$lib/db/types';

	interface Props {
		intakes: IntakeEntry[];
		date: string;
	}

	let { intakes, date }: Props = $props();

	const sorted = $derived([...intakes].sort((a, b) => a.time.localeCompare(b.time)));
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
					<th class="w-10 px-2 py-2"><span class="sr-only">Edit</span></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-800">
				{#each sorted as intake (intake.id)}
					<tr class="text-zinc-100">
						<td class="px-3 py-2">
							{intake.description}
							{#if intake.multiplier && intake.multiplier !== 1}
								<span class="ml-1 text-xs text-zinc-500">×{intake.multiplier}</span>
							{/if}
						</td>
						<td class="px-3 py-2 text-right tabular-nums">{intake.grams} g</td>
						<td class="px-2 py-2 text-right">
							<a
								href={resolve(`/intake/${date}/${intake.id}/`)}
								class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-emerald-400 active:bg-zinc-800"
								aria-label="Edit {intake.description}"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="h-4 w-4"
									aria-hidden="true"
								>
									<path
										d="m2.695 14.363-1.72 3.956a.75.75 0 0 0 .926.926l3.956-1.72 10.242-10.242a2.25 2.25 0 0 0-3.182-3.182L2.695 14.363Zm12.686-8.686 1.068 1.068-1.647 1.647-1.068-1.068 1.647-1.647Z"
									/>
								</svg>
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
