<script lang="ts">
	import { currentBiz } from '$lib/MenuData';
	function generateRandom(maxLimit = 100) {
		let rand = Math.random() * maxLimit;
		rand = Math.floor(rand); // 99

		return rand;
	}
	const addRandomBizId = () => {
		$currentBiz = 'Biz ' + generateRandom(100);
	};
</script>

<div class="fs-3 text-center">Business admin</div>

<div class="text-center">
	<button class="btn btn-primary" on:click={addRandomBizId}>demo:Add one biz</button>

	<div>See submenus under "Recents"</div>
</div>
