<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let { action } = data;
	$: ({ action } = data);
</script>

<div class="text-center fs-3">Workflow action: {action}</div>
