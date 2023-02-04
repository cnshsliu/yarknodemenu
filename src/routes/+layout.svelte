<script lang="ts">
	import YarkNodeMenu from '$lib/YarkNodeMenu.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { writable } from 'svelte/store';
	import {
		menuMobile,
		menuPinned,
		menuInSession,
		menuMode,
		menuData,
		menuDataInitial,
		demoData
	} from '$lib/MenuData';
	import type { menuItemType, menuDataType, menuOperationType } from '$lib/MenuData';

	$menuInSession = $page.data.user ? true : false;

	function getBootstrapBreakpoint(w: number) {
		const ret = w < 576 ? 0 : w < 768 ? 1 : w < 992 ? 2 : w < 1200 ? 3 : w < 1400 ? 4 : 5;
		console.log('Get bootstrape breakpoint', ret);
		return ret;
	}

	const changeWorklistStatus = async (event: CustomEvent) => {
		const payload = event.detail;
		if (payload === undefined) return;

		$demoData = payload;
		console.log($demoData);
		goto(`/work`);
	};

	const testMenuDef: menuDataType[] = [
		{
			id: '_worklist',
			class: 'part1',
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
				{ id: '_template_import', alias: 'Import', href: '/template/import' },
				{ id: '_template_search', alias: 'Search', href: '/template/search' }
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
			id: '___demo',
			class: 'demo',
			alias: 'Demo',
			href: '/',
			icon: 'flower1'
		},
		{
			id: '___recentbiz',
			class: 'part3',
			alias: 'Recents',
			icon: 'calendar-heart'
		},
		{
			id: '____signin',
			class: 'toplevel',
			alias: 'Signin',
			icon: 'door-open',
			href: '/login',
			insession: -1
		},
		{
			id: '____ME',
			class: 'me',
			alias: '$mydn',
			icon: 'people',
			href: '/profile',
			insession: 1
		},
		{
			id: '____signout',
			class: 'toplevel',
			alias: 'Signout',
			icon: 'door-closed-fill',
			href: '/logout',
			insession: 1
		}
	];

	$menuDataInitial = testMenuDef;

	let isMobile: boolean = false;

	const dict: Record<string, string> = {
		mydn: 'Lucas',
		help: 'HELP' //may put i18n localization here
	};

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
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js"></script>
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

<YarkNodeMenu
	menuDef={testMenuDef}
	{dict}
	{isMobile}
	avatar={{ img: 'https://picsum.photos/id/237/32/32' }}
	logo={{ img: 'https://picsum.photos/id/238/32/32' }}
	on:changeWorklistStatus={changeWorklistStatus}
/>

<div class="p-0 {isMobile ? '' : $menuPinned ? 'ms-kfk-200' : 'ms-kfk-5'}">
	<slot />
</div>

<style>
	.ms-kfk-200 {
		margin-left: 200px;
	}
	.ms-kfk-5 {
		margin-left: 55px;
	}
</style>
