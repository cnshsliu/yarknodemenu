<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let { bizid } = data;
	$: ({ bizid } = data);
</script>

<div class="fs-3 text-center">Biz: {bizid}</div>
