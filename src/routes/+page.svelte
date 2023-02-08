<script lang="ts">
	import { menuDataForGet, menuDataForSet, menuRefreshFlag } from '$lib/MenuData';
	import type { menuDataType } from '$lib/MenuData';
	const demo_insert_searchengine = () => {
		let tmp = $menuDataForGet;
		console.log(tmp);
		let index = tmp.findIndex((mi) => {
			return mi.alias === 'SearchEngine';
		});
		if (index >= 0) {
			console.log('Found SearchEngine at ', index);
			tmp[index].sub = [
				{
					id: '___setting',
					class: 'part3',
					alias: 'Bing',
					href: 'https://bing.com',
					target: '__searchwindow',
					icon: 'gear'
				},
				{
					id: '___documents',
					class: 'part3',
					alias: 'Google',
					href: 'https://google.com',
					target: '__searchwindow',
					icon: 'question-circle'
				}
			];
			console.log(tmp[index]);
			$menuDataForSet = tmp;
			$menuRefreshFlag = true;
		} else {
			console.log('SearchEngine not found');
		}
	};

	const demo_reset_searchengine = () => {
		let tmp = $menuDataForGet;
		let index = tmp.findIndex((mi) => {
			return mi.alias === 'SearchEngine';
		});
		if (index >= 0) {
			tmp[index].sub = [];
			$menuDataForSet = tmp;
			$menuRefreshFlag = true;
		}
	};
</script>

<div class="text-center mb-5">
	<h1>@yarknode/svelte-menu Demo</h1>
</div>

<div class="text-start">
	<ul class="mt-5">
		<h2>On the menu:</h2>
		<li>
			Click
			<img src={'/yn.png'} width="24px" alt="bizlogo" />
			<div>In pc style: goto home page</div>
			<div>In other styles: toggle between logo-only mode and expanded mode</div>
		</li>
		<li>
			Back to home (here)
			<div>
				In pc style: click
				<img src={'/yn.png'} width="24px" alt="bizlogo" />
			</div>
			<div>In other styles: click on <i class="bi bi-house" /></div>
		</li>
		<li>Move mouse in/out menu area to toggle icon-only mode</li>
		<li>
			Click <i class="bi bi-pin" /> to toggle pin-mode, under pin-mode, mouse in/out will have no effect
		</li>
		<li>
			Click <i class="bi bi-house" /> to go back here at any time
		</li>
		<li>Try to change menu items on demand</li>
		<ul>
			<li>
				<a href={'#'} on:click={demo_insert_searchengine}>set search engine menu</a>. then, see how
				the "SearchEngine" menuitem changed with sub items inserted
			</li>
			<li>
				<a href={'#'} on:click={demo_reset_searchengine}>clear search engine menu</a> to reset SearchEngine
				empty.
			</li>
			<li>Click on "Recents" and play there</li>
		</ul>
		<li>
			Callback: Click on "Worklist" and it's sub menu "Running" and "Completed", take a look at
			"+layout.svelte" to see what happens around id: "_work_running"
		</li>
		<li>Sign in/out: Play with sign in/out to see what happens to the menu</li>
	</ul>
</div>
