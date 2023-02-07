<script lang="ts">
	import { menuInSession } from '$lib/MenuData';
	const login = () => {
		$menuInSession = true;
	};
	const logout = () => {
		$menuInSession = false;
	};
</script>

<div class="text-center">
	<div class="fs-3">inSession: {$menuInSession}</div>

	{#if $menuInSession}
		<button class="btn btn-primary" on:click={logout}>Click to Logout</button>
	{:else}
		<button class="btn btn-primary" on:click={login}>Click to Login</button>
	{/if}

	<div>After login, see your avatar is inserted with your display name</div>
</div>
