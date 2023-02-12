<script lang="ts">
	import { mygoto } from '$lib/Util';
	import Menu from '$lib/Menu.svelte';
	import { onMount } from 'svelte';
	import { menuInSession, demoData } from '$lib/MenuData';
	import type { menuDataType } from '$lib/MenuData';
	import { Toast } from 'bootstrap';

	let theMenu: any;
	$menuInSession = false;

	let isMobile: boolean = false;
	let menuStyle: string = 'browser';
	let mainAreaClass: string = 'main-area-width-small';
	let notify = { message: '' };

	const onChangeWorklistStatus = async (event: CustomEvent) => {
		const payload = event.detail;
		if (payload === undefined) return;

		$demoData = payload;
		mygoto(`/work`);
	};

	const onSizeChanged = async (event: CustomEvent) => {
		const payload = event.detail;
		if (payload === undefined) return;
		if (menuStyle === 'mobile') return '';
		switch (payload.to) {
			case 'float-logo':
			case 'float-small':
				mainAreaClass = 'main-area-width-small';
				break;
			case 'float-big':
				mainAreaClass = 'main-area-width-big';
				break;
		}
	};

	const onChangeStyle = async (event: CustomEvent) => {
		const payload = event.detail;
		if (payload === undefined) return;
		menuStyle = payload.style;
		notify.message = `Style changed to ${menuStyle}`;
		const toast = new Toast(document.getElementById('liveToast') as Element);
		toast.show();
	};

	const checkValue = (what: string, expect: any) => {
		let ret = false;
		switch (what) {
			case 'inSession':
				ret = $menuInSession === expect;
				break;
		}
		return ret;
	};

	const menuDef: menuDataType[] = [
		{
			id: '_worklist',
			class: ['part1', 'lucas'],
			alias: 'Worklist',
			//on click, it will goto this href and expand sub
			href: '/work',
			icon: 'check-square',
			sub: [
				{
					id: '_work_running',
					alias: 'Running',
					href: '/work',
					callback: 'changeWorklistStatus',
					payload: { status: 'ST_RUN' }
				},
				{
					id: '_work_done',
					alias: 'Completed',
					href: '/work',
					callback: 'changeWorklistStatus',
					payload: { status: 'ST_DONE' }
				},
				{ id: '_new_flexible', alias: 'Flexible action', href: '/flexible' }
			]
		},
		{
			id: '_template',
			alias: 'Planning',
			//on click, it will goto this href and expand sub
			href: '/template',
			icon: 'box',
			img: 'https://picsum.photos/16/16',
			sub: [
				{ id: '_template_create', alias: 'Create', href: '/template/create' },
				{
					id: '_template_import',
					alias: 'Import',
					href: '/template/import',
					sub: [
						{ id: '_template_create', alias: 'Create', href: '/template/create' },
						{ id: '_template_import', alias: 'Import', href: '/template/import' },
						{ id: '_template_search', alias: 'Search', href: '/template/search' }
					]
				},
				{
					id: '_template_search',
					alias: 'Search',
					href: '/template/search',
					sub: [
						{ id: '_template_create', alias: 'Create', href: '/template/create' },
						{ id: '_template_import', alias: 'Import', href: '/template/import' },
						{ id: '_template_search', alias: 'Search', href: '/template/search' }
					]
				}
			]
		},
		{
			//This parent node has no href
			id: '_workflow',
			alias: 'Workflow',
			icon: 'fan',
			sub: [
				{
					id: '_workflow_normal',
					alias: 'Normal mode',
					href: '/workflow/normal'
				},
				{
					id: '_workflow_mingin',
					alias: 'Mining mode',
					href: '/workflow/mining'
				}
			]
		},
		{
			id: '_discuss',
			class: 'part3',
			alias: 'Forum',
			href: '/discuss',
			icon: 'chat-quote'
		},
		{
			id: '___setting',
			class: 'part3',
			alias: 'Settings',
			href: '/settings',
			icon: 'gear'
		},
		{
			id: '___documents',
			class: 'part3',
			alias: 'Help',
			href: 'https://cnshsliu.github.io/mtcdocs/',
			target: '_yarknodedoc',
			icon: 'question-circle'
		},
		{
			id: '___searchEngine',
			class: 'part3',
			href: '/',
			alias: 'SearchEngine',
			icon: 'google'
		},
		{
			id: '___recentbiz',
			class: 'part3',
			href: '/biz',
			alias: 'Recents',
			icon: 'calendar-heart'
		},
		{
			id: '____signin',
			class: 'toplevel',
			alias: 'Signin',
			icon: 'door-open',
			href: '/login',
			check_visible: { fn: checkValue, what: 'inSession', expect: false }
		},
		{
			id: '____signout',
			class: 'toplevel',
			alias: 'Signout',
			icon: 'door-closed-fill',
			href: '/logout',
			check_visible: { fn: checkValue, what: 'inSession', expect: true }
		},
		{
			id: '____demostye',
			alias: 'Menu Style',
			icon: 'flower1',
			sub: [
				{
					id: '__ds_browser',
					alias: 'Browser',
					callback: 'changeStyle',
					payload: { style: 'browser' }
				},
				{
					id: '__ds_browser',
					alias: 'PC',
					callback: 'changeStyle',
					payload: { style: 'pc' }
				},
				{
					id: '__ds_browser',
					alias: 'Mobile',
					callback: 'changeStyle',
					payload: { style: 'mobile' }
				},
				{
					id: '__ds_browser',
					alias: 'Windows',
					callback: 'changeStyle',
					payload: { style: 'windows' }
				}
			]
		}
	];

	onMount(() => {
		isMobile = navigator
			? navigator.userAgent.match(/Android/i) ||
			  navigator.userAgent.match(/webOS/i) ||
			  navigator.userAgent.match(/iPhone/i) ||
			  navigator.userAgent.match(/iPad/i) ||
			  navigator.userAgent.match(/iPod/i) ||
			  navigator.userAgent.match(/BlackBerry/i) ||
			  navigator.userAgent.match(/Windows Phone/i)
				? true
				: false
			: false;

		if (isMobile) {
			menuStyle = 'mobile';
		} else {
			menuStyle = 'browser';
		}

		if (menuStyle === 'mobile') mainAreaClass = '';
	});

	$: $menuInSession + theMenu?.tickMenu();
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
	/>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.min.css"
	/>
	<link rel="stylesheet" href="/demo.css" />
</svelte:head>

<Menu
	bind:this={theMenu}
	{menuDef}
	{menuStyle}
	pinned={true}
	avatar={{ img: '/avatar.png' }}
	logo={{ img: '/yn.png' }}
	on:changeWorklistStatus={onChangeWorklistStatus}
	on:sizeChanged={onSizeChanged}
	on:changeStyle={onChangeStyle}
/>

<div class="p-0 {mainAreaClass}  w-100 h-100">
	<div class="top-50 start-50 translate-middle text-center" style="position:absolute;">
		<div><img src="/yn.png" alt="yn" style="width:32px; " /></div>
		<div><slot /></div>
	</div>
</div>
<div class="toast-container position-fixed top-0 end-0 p-3">
	<div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
		<div class="toast-header">
			<img src="/block.svg" class="rounded me-2" alt="..." />
			<strong class="me-auto">Yarknode Menu</strong>
			<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" />
		</div>
		<div class="toast-body">{notify.message}</div>
	</div>
</div>

<style>
	.main-area-width-big {
		margin-left: 200px;
	}
	.main-area-width-small {
		margin-left: 55px;
	}
</style>
