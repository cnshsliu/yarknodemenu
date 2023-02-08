# Svelte-menu

A full-featured sveltekit menu component.

Demo site: <a href="https://menu-demo-lyart.vercel.app/">https://menu-demo-lyart.vercel.app/</a>

Try the demo first, then read on please.

# Usage

## install package

```bash
npm i @yarknode/svelte-menu
```

## prepare menu definition data

Normally, we place menu in "src/routes/+layout.svelte"

with "src/routes/+layout.svelte"

```typescript
<script lang="ts">
const menuDef: menuDataType[] = [
	{
		//id: Every menu item has id, which should be "unique".
		id: '_worklist',
		//class: optinal
		class: 'part1',
		//alias: The label of this menu item, if ommitted, id will be used as label
		alias: 'Worklist',
		//href: on click, it will goto this href and expand sub menuitems (if has)
		href: '/work',
		//target:should href be opened in a separate browser tab? for external links, normally yes
		//target: 'external-search'
		//icon: the prefix icon of menuitem,  which is an existing bootstrap icon name.
		icon: 'check-square',
		//img: If no icon, img will be used as the prefix image. If there is no icon or img defined, no prefix img displayed.
		//img: 'https://server/img.png',
		//sub: sub menuitems. sub levles are unlimited.
		sub: [
			{
				id: '_work_running',
				alias: 'Running',
				href: '/work',
				//besides pointing to href, menuitem can have callback. the callback function is defined in "+layout.svelte", the payload will be passed to it.
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
	}
	//...
];
//...
</script>
```

Then,

```xml
<Menu
    bind:this={theMenu}
    {menuDef}
    {menuStyle} // see below
    avatar={{ img: 'https://.../avatar.png' }}
    logo={{ img: 'https://.../yn.png' }}
    on:changeWorklistStatus={onChangeWorklistStatus}
    on:sizeChanged={onSizeChanged}
    on:changeStyle={onChangeStyle}
/>
```

Look, there are three custom event handlers.
The first is "on:changeWorklistStatus", the event name "changeWorklistStatus" should be the same as what we defined in menuitem previously.

"onChangeWorklistStauts" is a function defined in "+layout.svelte",

```javascript
const onChangeWorklistStatus = async (event: CustomEvent) => {
	const payload = event.detail;
	if (payload === undefined) return;

	$demoData = payload;
	goto(`/work`);
};
```

Of course, this is an example callback function, you should use your own as required.

However, normally you need to keep the second "on:sizeChanged", because svelte-menu can change it's own size on mouse enter/leave, and we should catch this event to change the position of main area.

```javascript
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
```

The third on is "on:styleChanged", If you are going to let your users to toggle among menu styles on-demand with menuitems, keep this event handler. and have menuitem definition accordinly.

Menu items definiton for changing menu styles.

```json
{
	"id": "____demostye",
	"alias": "Menu Style",
	"icon": "flower",
	"sub": [
		{
			"id": "__ds_browser",
			"alias": "Browser",
			"callback": "changeStyle",
			"payload": { "style": "browser" }
		},
		{
			"id": "__ds_browser",
			"alias": "PC",
			"callback": "changeStyle",
			"payload": { "style": "pc" }
		},
		{
			"id": "__ds_browser",
			"alias": "Mobile",
			"callback": "changeStyle",
			"payload": { "style": "mobile" }
		},
		{
			"id": "__ds_browser",
			"alias": "Windows",
			"callback": "changeStyle",
			"payload": { "style": "windows" }
		}
	]
}
```

The handler:

```javascript
	const onChangeStyle = async (event: CustomEvent) => {
		const payload = event.detail;
		if (payload === undefined) return;
		menuStyle = payload.style;
		notify.message = `Style changed to ${menuStyle}`;
		const toast = new Toast(document.getElementById('liveToast') as Element);
		toast.show();
	};
```

Of course, you may decide to use one menu style, just pass it to Menu component like:

```
<Menu
menuStyle={"browser"}
/>
```

## Menu Styles

We support four menu styles:

- browser

  - will be placed at left-top corner

  - menu items are displayed vertically

  - automatical collapse/expand on mouse enter/leave

  - can pinned to expanded mode

- pc

  - will be placed on top, just like the menus of desktop applications on Windows/Mac PC.

  - first level menu items are displayed horiontally.

  - sub items are displayed as dropdown

- mobile

  - will be placed at the bottom-right corner

  - touch icon to show/hide menus

- windows

  - will be placed at the bottom-left corner, make it looks like Windows "Start" menu

  - touch icon to show/hide menus

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

# Menu logo and personal avatar

are given to &lt;Menu&gt; as "logo" and "avatar"

```
avatar={{ img: 'https://.../avatar.png' }}
logo={{ img: 'https://.../yn.png' }}
```

# Binding Menu componet

```
let theMenu;


<Menu
    bind:this={theMenu}
/>
```

# Change menuitems on fly

```

let menuDef = [...];

theMenu.refreshMenu(menuDef);

```

# Menuitems visiblilty

Method 1: set "visible" value directly

```

menuDef[index].visible = false;
theMenu.tickMenu();

```

Method 2: control with a function

first, define a function in "+layout.svelte" where the &lt;Menu&gt; componet is placed in. This function return true/false to control whether a menu item should be visible or not. Like this example:

```
    const checkValue = (what: string, expect: any) => {
    	let ret = false;
    	switch (what) {
    		case 'inSession':
    			ret = $menuInSession === expect;
    			break;
    	}
    	return ret;
    };
```

then, have "check_visible" specidifed like below for menu items which visbility should be controlled dynamically. like:

```

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

```

The "fn: checkValue" is the function name we defined previously, the "what" and "expect" will be passed to "checkValue" function.

Finally, if $menuInSession is changed, tick the Menu.

```
    $: $menuInSession + theMenu?.tickMenu();
```

On the Menu beging ticked, svelte-menu will re-run "check_visible", thus, call "fn: checkValue" function, then show or hide correspoding menu items depend on the return value of "fn: checkValue".

In the demo, $menuInSession stores a true value on user being logged in, a false value on logging out, thus, when user is logged in, "Signin" is hdden while "Signout" is shown, and vice versa

```

```
