<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import {
		menuMode,
		menuMobile,
		menuData,
		menuInSession,
		menuDataInitial,
		menuDataForSetting,
		menuDataFromServer,
		menuExtra,
		menuConfig,
		menuRefreshFlag,
		menuPinned
	} from '$lib/MenuData';
	import type { menuItemType, menuDataType, menuOperationType } from '$lib/MenuData';

	export let dataMode: string = 'static';
	export let menuDef: menuDataType[] = [{ id: 'Welcome' }];
	export let isMobile: boolean = false;
	export let avatar: any = { img: 'unknown' };
	export let logo: any = { img: '/yarknode_logo.png' };
	export let dict: Record<string, string> = {};

	$menuData = menuDef;
	$menuMobile = isMobile;

	const dispatch = createEventDispatcher();
	let recentTemplates: string[] = [];

	$menuMode = $menuMobile ? 'float-logo' : 'float-small';
	let lastMenuMode = $menuMobile ? 'float-big' : 'float-small';

	let overflag: Record<string, boolean> = {};
	let pinned = false;
	let lastPath = '';
	let theAvatar: any;
	let tenantList: any[] = [];

	let foldersExpanding: any = {};
	let menuItems: menuItemType[] = [];

	const parseDataToItems = (items: any[], data: any[], level: number = 0, folder: string) => {
		foldersExpanding[folder] = false;
		for (let i = 0; i < data.length; i++) {
			let mi: menuItemType = {
				...data[i],
				level,
				display: dataMode === 'editting' ? true : false,
				folder: folder,
				hasSub: data[i].sub ? true : false,
				expanded: false,
				path: folder + data[i].id
			};
			items.push(mi);
			if (mi.hasSub) {
				parseDataToItems(items, data[i].sub, level + 1, folder + data[i].id + '/');
			}
		}
	};

	const displayInSession = (item: menuItemType, originDisplay: boolean): boolean => {
		if (item.insession) {
			//>0 只在已登录状态显示
			console.log($menuInSession);
			if (item.insession > 0) return $menuInSession;
			else return !$menuInSession;
		}
		return originDisplay;
	};

	const expandFolder = (folder: string) => {
		foldersExpanding[folder] = true;
		for (let i = 0; i < menuItems.length; i++) {
			if (menuItems[i].folder === folder) {
				//展开当前菜单及其所有直接子级
				menuItems[i].display = true;
			} else if (menuItems[i].folder.indexOf(folder) === 0) {
				//展开 之前被展开过的孙级
				if (foldersExpanding[menuItems[i].folder]) {
					menuItems[i].display = true;
				}
			}
		}
	};

	const expandItem = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		expandFolder(selfFolder);
		item.expanded = true;
	};
	const collapseItem = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		collapseFolder(selfFolder);
		item.expanded = false;
	};

	const isExpanded = (item: menuItemType) => {
		let selfFolder = item.folder + item.id + '/';
		return foldersExpanding[selfFolder];
	};

	const isFolder = (item: menuItemType) => {
		return item.hasSub;
	};

	const collapseFolder = (folder: string) => {
		if (dataMode === 'editting') return;
		foldersExpanding[folder] = false;
		for (let i = 0; i < menuItems.length; i++) {
			if (menuItems[i].folder.indexOf(folder) === 0) {
				menuItems[i].display = false;
			}
		}
	};

	const shrink = () => {
		if ($menuMode === 'float-big') {
			setTimeout(() => {
				$menuMode = 'float-small';
			}, 3);
		}
	};
	const shrinkNow = () => {
		$menuMode = 'float-small';
	};

	const onMouseOver = () => {
		if (dataMode === 'editting') return;
		if ($menuMode === 'float-small') {
			$menuMode = 'float-big';
		}
	};
	const onMouseOut = () => {
		if (dataMode === 'editting') return;
		if ($menuMode === 'float-big' && !pinned && !$menuMobile) {
			$menuMode = 'float-small';
		}
	};
	const onClickLogo = () => {
		if ($menuMode === 'float-logo') $menuMode = $menuMobile ? lastMenuMode : 'float-big';
		else {
			lastMenuMode = $menuMode;
			$menuMode = 'float-logo';
		}
	};
	const onBlur = () => {};
	const onFocus = () => {};
	const onTogglePin = (e: Event) => {
		e.preventDefault();
		if (pinned) {
			//$menuMode = $menuMobile ? 'float-logo' : 'float-small';
		} else {
			$menuMode = 'float-big';
		}
		pinned = !pinned;
		$menuPinned = pinned;
		/*
		if ($menuMode === 'float-logo') {
			$menuMode = lastMenuMode;
		} else {
			lastMenuMode = $menuMode;
			$menuMode = 'float-logo';
		}
		console.log($menuMode);
		*/
	};
	const onClickItem = (e: Event, item: menuItemType) => {
		if (dataMode === 'editting') return;
		e.preventDefault();
		if (isFolder(item)) {
			if (item.expanded === false) {
				expandItem(item);
				if ($menuConfig.expandOneOnSameLevel) {
					let changed = false;
					for (let i = 0; i < menuItems.length; i++) {
						if (
							menuItems[i].level === item.level &&
							menuItems[i].path !== item.path &&
							menuItems[i].expanded === true
						) {
							collapseItem(menuItems[i]);
							changed = true;
						}
					}
					if (changed) {
						menuItems = menuItems;
					}
				}
			} else {
				if (lastPath.indexOf(item.path) === 0 || !item.href) collapseItem(item);
			}
		} else {
			if ($menuMobile && !$menuPinned) {
				$menuMode = 'float-logo';
			}
		}
		if (item.callback) {
			try {
				dispatch(item.callback, item.payload);
			} catch (e) {
				console.error(e);
			}
		}
		if (dataMode !== 'editting') {
			if (item.target) {
				window && window.open(item.href, item.target);
			} else if (item.href) goto(item.href);
		}
		lastPath = item.path;
		menuItems = menuItems;
	};

	//TODO:
	const getLabel = (item: menuItemType): string => {
		let label = item.id;
		if (item.alias) {
			if (item.alias.startsWith('$')) {
				label = item.alias.slice(1);
				label = dict[label] ?? label;
			} else {
				label = item.alias;
			}
		} else {
			label = item.id;
		}
		return label;
	};

	export const replaceChildren = (theID: string, children: menuDataType[]) => {
		let rbIndex = menuItems.map((mi) => mi.id).indexOf(theID);
		if (rbIndex >= 0) {
			let rb = menuItems[rbIndex];
			let oldChildren = menuItems.filter((mi) => {
				return mi.folder === rb.folder + rb.id + '/';
			});
			let oldChildrenCount = oldChildren.length;
			menuItems[rbIndex].hasSub = false;
			const newChildrenDataDef = [
				{
					id: menuItems[rbIndex].id,
					class: menuItems[rbIndex].class,
					alias: menuItems[rbIndex].alias,
					icon: menuItems[rbIndex].icon,
					sub: children
				}
			];
			let tmpItems: menuItemType[] = [];
			parseDataToItems(
				tmpItems,
				newChildrenDataDef,
				menuItems[rbIndex].level,
				menuItems[rbIndex].folder + menuItems[rbIndex].id
			);
			tmpItems[0].display = true;
			menuItems.splice(rbIndex, oldChildrenCount + 1, ...tmpItems);
			menuItems = menuItems;
		}
	};

	export const refreshMenu = () => {
		console.log('In refresh menu 2', menuDef);
		switch (dataMode) {
			case 'static':
				break;
			case 'editting':
				$menuData = $menuDataForSetting;
				break;
		}
		menuItems.length = 0;
		parseDataToItems(menuItems, menuDef, 0, '/');
		expandFolder('/');

		if (dataMode === 'editing') {
			menuItems = menuItems.map((x) => {
				x.display = true;
				x.expanded = true;
				return x;
			});
		}
		menuItems = menuItems;
		console.log('In refresh menu 2', menuItems);
	};

	onMount(async () => {
		refreshMenu();
		dispatch('menuMounted');
	});

	// 在整个应用中,如果需要重新刷新菜单,只需要将$menuRefreshFlag = true,  即可
	$: $menuRefreshFlag &&
		(() => {
			console.log('RefreshFlag', $menuRefreshFlag);
			refreshMenu();
			$menuRefreshFlag = false;
		})();
</script>

<!-- svelte-ignore missing-declaration -->
<div
	class={'kfk-menu' +
		' ' +
		($menuMobile ? 'kfk-menu-mobile' : 'kfk-menu-pc') +
		' ' +
		($menuMode === 'float-logo' && $menuMobile ? 'kfk-ball' : '') +
		' ' +
		(dataMode === 'editting' ? 'editting-menu' : 'kfk-menu-' + $menuMode + ' tnt-navmenu')}
	on:mouseenter={onMouseOver}
	on:mouseleave={onMouseOut}
	on:blur={onBlur}
	on:focus={onFocus}
>
	{#if dataMode !== 'editting'}
		<div class="hstack  gap-2">
			<div
				class={'col ' + ($menuInSession ? 'org-logo' : 'tnt-logo')}
				on:click={onClickLogo}
				on:keydown={onClickLogo}
				on:mouseenter={() => {
					overflag['logo'] = true;
				}}
				on:mouseleave={() => {
					overflag['logo'] = false;
				}}
				on:blur={onBlur}
				on:focus={onFocus}
			>
				<img
					src={logo.img}
					class={logo.class ?? 'tnt-logo-img' + ' ' + (overflag['logo'] ? 'logo-over' : '')}
					alt="bizlogo"
				/>
			</div>
			<div class="ms-auto hstack gap-2">
				<slot name="me">
					{#if avatar.img !== 'unknown'}
						<div
							class="togglepin "
							on:mouseenter={() => {
								overflag['top-avatar'] = true;
							}}
							on:mouseleave={() => {
								overflag['top-avatar'] = false;
							}}
						>
							<img
								src={avatar.img}
								class={(avatar.class ?? 'avatar32') +
									' ' +
									(overflag['top-avatar'] ? 'avatar-over' : '')}
								alt="avatar"
							/>
						</div>
					{/if}
				</slot>
				<div
					class="togglepin"
					on:mouseenter={() => {
						overflag['home'] = true;
					}}
					on:mouseleave={() => {
						overflag['home'] = false;
					}}
				>
					<a href={'/'} alt="pinit">
						<i class={'bi fs-5 bi-house' + (overflag['home'] ? '-fill' : '')} />
					</a>
				</div>
				<div
					class="m-0 p-0 togglepin"
					on:mouseenter={() => {
						overflag['pin'] = true;
					}}
					on:mouseleave={() => {
						overflag['pin'] = false;
					}}
				>
					<a href={null} alt="pinit">
						<i
							class={'bi fs-5 ' +
								(pinned
									? overflag['pin']
										? 'bi-pin'
										: 'bi-pin-fill'
									: overflag['pin']
									? 'bi-pin-angle-fill'
									: 'bi-pin-angle')}
							on:click={onTogglePin}
							on:keydown={onTogglePin}
						/>
					</a>
				</div>
				<div
					class="m-0 p-0 togglepin"
					on:mouseenter={() => {
						overflag['close'] = true;
					}}
					on:mouseleave={() => {
						overflag['close'] = false;
					}}
				>
					<a href={null} alt="closeit">
						<i
							class={'bi fs-5 ' + (overflag['close'] ? 'bi-x-circle-fill' : 'bi-x-lg')}
							on:click={onClickLogo}
							on:keydown={onClickLogo}
						/>
					</a>
				</div>
			</div>
		</div>
	{/if}
	{#if $menuMode !== 'float-logo'}
		<div>
			{#each menuItems as item, index (item)}
				{#if item.display && (!item.insession || (item.insession > 0 && $menuInSession) || (item.insession < 0 && !$menuInSession))}
					<div
						class={dataMode === 'editting' ? 'menuitem-editting' : 'menuitem'}
						style={$menuMode === 'float-small' && dataMode !== 'editting'
							? 'margin-left: 8px;'
							: `margin-left: ${8 + (item.level ?? 0) * 16}px;`}
						on:keydown={null}
						on:click={(e) => {
							onClickItem(e, item);
						}}
					>
						<div class="w-100 row m-0 p-0">
							<div class="col m-0 p-0">
								<!--start 显示图标 -->
								{#if item.id === '____ME'}
									{#if $menuInSession && avatar.img !== 'unknown'}
										<img src={avatar.img} class={avatar.class ?? 'avatar16'} alt="avatar" />
									{:else}
										<i class="bi bi-person" />
									{/if}
								{:else if item.icon}
									<i class={`bi bi-${item.icon}`} />
								{:else if item.img}
									<img src={item.img} alt={item.id} class="avatar16" />
								{/if}
								<!--end 显示图标 -->
								<!--start 显示文字 -->
								{#if dataMode !== 'editting' && $menuMode === 'float-small'}
									<!-- 窄屏方式且没有icon,显示第一个字符 -->
									{#if !(item.icon || item.img)}
										<div class="w-100 text-center">
											{getLabel(item).charAt(0)}
										</div>
									{/if}
								{:else}
									<!-- 宽屏方式显示文字 -->
									{getLabel(item)}
								{/if}
								<!--end 显示文字 -->
							</div>
							{#if $menuMode === 'float-big' && item.hasSub}
								<div class="col-auto m-0 ms-5 p-0">
									<i class={'bi ' + (item.expanded ? 'bi-chevron-up' : 'bi-chevron-right')} />
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.kfk-menu {
		border: 0px;
		border-radius: 0px;
		margin-left: 5px;
		padding-left: 5px;
		padding-right: 5px;
		padding-top: 5px;
		z-index: 1000;
		background-color: #cccccc;
		border-radius: 5px;
	}
	.kfk-ball {
		border-radius: 100px !important;
	}
	.kfk-menu-pc {
		left: 0px;
		top: 10px;
	}
	.kfk-menu-mobile {
		right: 2px;
		bottom: 2px;
	}
	.kfk-menu-float-logo {
		position: fixed;
		width: 42px;
	}
	.kfk-menu-float-big {
		position: fixed;
	}
	.kfk-menu-float-small {
		position: fixed;
		max-width: 42px;
		min-width: 42px;
		width: 42px;
	}
	.kfk-menu-float-small .togglepin {
		display: none;
	}
	.kfk-menu-float-logo .togglepin {
		display: none;
	}
	.kfk-menu-float-small .tnt-logo {
		height: 32px;
		background-size: 32px 32px;
	}

	.menuitem {
		overflow: scroll;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		margin-top: 10px;
		margin-right: 8px;
	}
	.menuitem img {
		width: 16px;
		height: 16px;
	}
	.menuitem a {
		text-decoration: none;
	}
	.menuitem:hover {
		background-color: var(--bs-primary);
		cursor: pointer;
	}
	.ynmi:hover {
		background-color: var(--bs-primary);
		cursor: pointer;
	}
	.avatar32 {
		width: 32px;
		height: 32px;
		border-radius: 16px;
	}
	.avatar-over {
		border: inset;
		border-color: var(--bs-primary);
	}
	.logo-over {
		border: inset;
		border-color: var(--bs-primary);
	}
	.tnt-logo-img {
		width: 32px;
		height: 32px;
	}
</style>
