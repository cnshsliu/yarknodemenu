<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let { url } = data;
	$: ({ url } = data);
</script>

<div class="fs-3 text-center">Workflow admin</div>
<div class="text-center">{url}</div>
<div class="text-center">{url.searchParams.get('mode')}</div>
