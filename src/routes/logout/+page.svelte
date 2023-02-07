<script lang="ts">
	import { menuInSession } from '$lib/MenuData';
	const logout = () => {
		$menuInSession = false;
	};
</script>

<div class="text-center">
	<div class="fs-3">
		inSession: {$menuInSession}
	</div>
	{#if $menuInSession === false}
		<div><a href="/login">Login</a></div>
	{:else}
		<button class="btn btn-primary" on:click={logout}>Click to Logout</button>
	{/if}
</div>
