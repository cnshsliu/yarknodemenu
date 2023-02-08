<script lang="ts">
	import PcMenu from './PcMenu.svelte';
	import { mygoto } from '$lib/Util';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import {
		menuDataForGet,
		menuDataForSet,
		menuInSession,
		menuDataForSetting,
		menuConfig,
		menuPinned,
		menuRefreshFlag
	} from '$lib/MenuData';
	import type { menuItemType, menuDataType } from '$lib/MenuData';

	export let dataMode: string = 'static';
	export let menuDef: menuDataType[] = [{ id: 'Welcome' }];
	export let avatar: any = { img: 'unknown' };
	export let logo: any = { img: '/yarknode_logo.png' };
	export let menuStyle: string = 'browser';

	const dispatch = createEventDispatcher();

	//copy menuDef to $menuDataForGet once changed.
	//Else where, could get internal menuDef by $menuDataForGet
	$: $menuDataForGet = menuDef;
	//Once menuRefreshFlag was set to true, refresh menu with data in $menuDataForSet;
	$: $menuRefreshFlag &&
		(() => {
			refreshMenu($menuDataForSet);
			$menuRefreshFlag = false;
		})();

	let menuMode: string = menuStyle === 'mobile' ? 'float-logo' : 'float-small';
	let lastMenuMode: string = menuStyle === 'mobile' ? 'float-big' : 'float-small';

	if (['mobile', 'pc', 'browser', 'windows'].indexOf(menuStyle) < 0) menuStyle = 'browser';

	let overflag: Record<string, boolean> = {};
	let pinned = false;
	let lastPath = '';

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
				hasSub: data[i].sub ? (data[i].sub.length > 0 ? true : false) : false,
				expanded: false,
				path: folder + data[i].id
			};
			items.push(mi);
			if (mi.hasSub) {
				parseDataToItems(items, data[i].sub, level + 1, folder + data[i].id + '/');
			}
		}
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
		const collapseFolder = (folder: string) => {
			if (dataMode === 'editting') return;
			foldersExpanding[folder] = false;
			for (let i = 0; i < menuItems.length; i++) {
				if (menuItems[i].folder.indexOf(folder) === 0) {
					menuItems[i].display = false;
				}
			}
		};
		collapseFolder(selfFolder);
		item.expanded = false;
	};

	const isFolder = (item: menuItemType) => {
		return item.hasSub;
	};

	const onMouseOver = () => {
		if (dataMode === 'editting') return;
		if (menuMode === 'float-small') {
			menuMode = 'float-big';
			dispatch('sizeChanged', { from: 'float-small', to: 'float-big' });
		}
	};
	const onMouseOut = () => {
		if (dataMode === 'editting') return;
		if (menuMode === 'float-big' && !pinned) {
			if (menuStyle === 'pc' || menuStyle === 'browser') {
				menuMode = 'float-small';
				dispatch('sizeChanged', { from: 'float-big', to: 'float-small' });
			} else {
				menuMode = 'float-logo';
				dispatch('sizeChanged', { from: 'float-big', to: 'float-logo' });
			}
		}
	};
	const onClickLogo = () => {
		if (menuMode === 'float-logo') {
			menuMode = menuStyle === 'mobile' || menuStyle === 'windows' ? lastMenuMode : 'float-big';
			dispatch('sizeChanged', { from: 'float-logo', to: menuMode });
		} else {
			lastMenuMode = menuMode;
			menuMode = 'float-logo';
			dispatch('sizeChanged', { from: lastMenuMode, to: menuMode });
		}
	};
	const onBlur = () => {};
	const onFocus = () => {};
	const onTogglePin = (e: Event) => {
		e.preventDefault();
		if (pinned) {
			//menuMode =menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-logo' : 'float-small';
		} else {
			lastMenuMode = menuMode;
			menuMode = 'float-big';
			dispatch('sizeChanged', { from: lastMenuMode, to: menuMode });
		}
		pinned = !pinned;
		$menuPinned = pinned;
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
			if (menuStyle === 'mobile' || menuStyle === 'windows') {
				menuMode = 'float-logo';
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
			} else if (item.href) mygoto(item.href);
		}
		lastPath = item.path;
		menuItems = menuItems;
	};

	//TODO:
	const getLabel = (item: menuItemType): string => {
		let label = item.id;
		if (item.alias) {
			label = item.alias;
		} else {
			label = item.id;
		}
		return label;
	};

	const replaceChildren = (theID: string, children: menuDataType[]) => {
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

	export const translate = (fn: (str: string) => string) => {
		for (let i = 0; i < menuItems.length; i++) {
			let tmp = menuItems[i].alias;
			if (!tmp) continue;
			if (tmp.charAt(0) !== '$') continue;
			menuItems[i].alias = fn(tmp.slice(1));
		}
		menuItems = menuItems;
	};

	const checkVisible = (item: menuItemType) => {
		let ret = true;
		if (!item.display) {
			ret = false;
		} else if (!(item.visible ?? true)) {
			ret = false;
		} else {
			if (item.check_visible) {
				ret = item.check_visible.fn(item.check_visible.what, item.check_visible.expect);
				console.log(item.alias, 3, ret, item.check_visible);
			}
		}

		return ret;
	};

	const refreshMenu = (newMenuDef: menuDataType[] | undefined = undefined) => {
		if (newMenuDef) menuDef = newMenuDef;
		console.log('In refresh menu 2', menuDef);
		switch (dataMode) {
			case 'static':
				break;
			case 'editting':
				menuDef = $menuDataForSetting as menuDataType[];
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

	export const tickMenu = () => {
		menuItems = menuItems;
	};

	onMount(async () => {
		menuMode = menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-logo' : 'float-small';
		lastMenuMode = menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-big' : 'float-small';
		console.log('onMount: ', menuStyle, menuMode, lastMenuMode);

		refreshMenu();
		dispatch('menuMounted');
	});

	$: menuStyle &&
		(menuMode = menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-logo' : 'float-small') &&
		(lastMenuMode =
			menuStyle === 'mobile' || menuStyle === 'windows' ? 'float-big' : 'float-small');
</script>

<a href={'#'} id="___ykmenu_hidden_a" style={'display: none;'}>&nbsp;</a>
<!-- svelte-ignore missing-declaration -->
{#if menuStyle === 'pc'}
	<PcMenu {menuItems} {logo} {avatar} on:changeStyle on:changeWorklistStatus />
{:else}
	<div
		class={'kfk-menu' +
			' ' +
			'kfk-menu-style-' +
			menuStyle +
			' ' +
			(dataMode === 'editting' ? 'editting-menu' : 'kfk-menu-' + menuMode + ' tnt-navmenu')}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:blur={onBlur}
		on:focus={onFocus}
	>
		{#if dataMode !== 'editting'}
			<div class="hstack  gap-2">
				{#if menuStyle === 'pc' || menuStyle === 'browser'}
					<!-- top logo --->
					<div
						class="org-logo"
						style={logo.img ? `background-image: url(${logo.img}); ` : ''}
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
						&nbsp;
					</div>
				{/if}
				{#if menuMode !== 'float-logo' && menuMode !== 'float-small'}
					<div
						class={(menuStyle === 'mobile' || menuStyle === 'windows' ? '' : 'ms-auto') +
							' hstack w-100 gap-2'}
					>
						<slot name="me">
							<!-- 缺省 avatar 用图片 -->
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
							class={(menuStyle === 'mobile' || menuStyle === 'windows' ? 'ms-auto' : '') +
								' togglepin'}
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
				{/if}
			</div>
		{/if}
		{#if menuMode !== 'float-logo'}
			<div>
				{#each menuItems as item}
					{#if checkVisible(item)}
						<div
							class={dataMode === 'editting' ? 'menuitem-editting' : 'menuitem'}
							style={menuMode === 'float-small' && dataMode !== 'editting'
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
									{#if dataMode !== 'editting' && menuMode === 'float-small'}
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
								{#if menuMode === 'float-big' && item.hasSub}
									<div class="col-auto m-0 ms-5 p-0">
										<i class={'bi ' + (item.expanded ? 'bi-chevron-up' : 'bi-chevron-right')} />
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
				<div>
					<hr class="m-0 p-0 mt-2" />
				</div>
			</div>
		{/if}
		{#if dataMode !== 'editting'}
			{#if menuStyle === 'mobile' || menuStyle === 'windows'}
				<div class="hstack  gap-2">
					<!-- bottom logo -->
					<div
						class={(menuStyle === 'mobile' ? 'ms-auto' : ' ') + ' org-logo'}
						style={logo.img ? `background-image: url(${logo.img}); ` : ''}
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
						&nbsp;
						<!--img
						src={logo.img}
						class={logo.class ?? 'tnt-logo-img' + ' ' + (overflag['logo'] ? 'logo-over' : '')}
						alt="bizlogo"
					/-->
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}

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
	.kfk-menu-style-pc {
		left: 0px;
		top: 10px;
	}
	.kfk-menu-style-mobile {
		right: 2px;
		bottom: 2px;
	}
	.kfk-menu-style-windows {
		left: 2px;
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

	.org-logo {
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
		background-repeat: no-repeat;
		background-size: 100%;
		background-position: center;
	}
</style>
