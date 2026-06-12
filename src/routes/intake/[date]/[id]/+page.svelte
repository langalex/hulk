<script lang="ts">
	import { page } from '$app/state';
	import EditIntakeView from '$lib/components/EditIntakeView.svelte';

	const date = $derived(page.params.date ?? '');
	const id = $derived(page.params.id ?? '');
</script>

<EditIntakeView {date} {id} />
