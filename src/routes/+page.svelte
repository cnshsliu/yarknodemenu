<script lang="ts">
	import { menuData, menuDataInitial, menuRefreshFlag } from '$lib/MenuData';
	const demo_insert_sub = () => {
		let tmp = $menuData;
		let index = tmp.findIndex((mi) => {
			return mi.alias === 'Recents';
		});
		if (index) {
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
			$menuRefreshFlag = true;
		}
	};

	const demo_default = () => {
		$menuData = $menuDataInitial;
		$menuRefreshFlag = true;
	};
</script>

<div class="text-center">
	<h1>Welcome to yarknodeMenu</h1>
</div>

<h2>Introduction</h2>
<ul>
	<li>
		Click
		<img src={'/yn.png'} class={'tnt-logo-img'} alt="bizlogo" />
		logo to toggle between logo-only mode and expanded mode
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
			<a href={'#'} on:click={demo_insert_sub}>insert subitems</a>. then, see how the "Recents"
			menuitem changed with sub items inserted
		</li>
		<li>
			<a href={'#'} on:click={demo_default}>reset to default</a> to reset Recents to having no subitem
		</li>
	</ul>
	<li>
		Callback: Click on "Worklist" and it's sub menu "Running" and "Completed", take a look at
		"+layout.svelte" to see what happens around id: "_work_running"
	</li>
	<li>Sign in/out: Play with sign in/out to see what happens to the menu</li>
</ul>
