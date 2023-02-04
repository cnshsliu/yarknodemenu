<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let { tpl_action } = data;
	$: ({ tpl_action } = data);
</script>

<div class="fs-3 text-center">tpl_action: {tpl_action}</div>
