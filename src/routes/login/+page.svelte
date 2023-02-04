<script lang="ts">
	import { page } from '$app/stores';
	import { demoData, menuInSession } from '$lib/MenuData';
	const login = () => {
		$menuInSession = true;
	};
</script>

<div class="text-center">
	<div class="fs-3">inSession: {$menuInSession}</div>

	<button class="btn btn-primary" on:click={login}>Click to Login</button>

	<div>After login, see your avatar is inserted with your display name</div>
</div>
