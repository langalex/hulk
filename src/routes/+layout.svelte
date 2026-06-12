<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { syncTodayAppBadge } from '$lib/app-badge';
	import { initPouchDb } from '$lib/db/pouch.client';
	import { subscribeToChanges } from '$lib/db/pouch';

	if (browser) {
		initPouchDb();
	}

	let { children } = $props();

	onMount(() => {
		void syncTodayAppBadge();
		return subscribeToChanges(() => {
			void syncTodayAppBadge();
		});
	});

	const isSettings = $derived(page.url.pathname.startsWith('/settings'));
</script>

<svelte:head>
	<title>Hulk</title>
</svelte:head>

<div class="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
	<header class="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
		<div class="mx-auto flex max-w-lg items-center justify-between">
			<a href={resolve('/')} class="text-lg font-bold tracking-tight text-emerald-400">Hulk</a>
			{#if isSettings}
				<a href={resolve('/')} class="text-sm text-zinc-400 hover:text-zinc-200">Today</a>
			{:else}
				<a href={resolve('/settings')} class="text-sm text-zinc-400 hover:text-zinc-200">Settings</a>
			{/if}
		</div>
	</header>

	<main class="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-4 pb-24">
		{@render children()}
	</main>
</div>
