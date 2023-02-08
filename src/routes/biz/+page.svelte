<script lang="ts">
	import { menuDataForGet, menuDataForSet, menuRefreshFlag } from '$lib/MenuData';
	import type { menuDataType } from '$lib/MenuData';
	function generateRandom(maxLimit = 100) {
		let rand = Math.random() * maxLimit;
		rand = Math.floor(rand); // 99

		return rand;
	}
	const addRandomBizId = () => {
		let tplid = 'Biz ' + generateRandom(100);
		if (tplid === null || tplid === undefined || tplid === '') return;
		if (!localStorage) return;

		let rcts = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
		let old_rcts = [...rcts];
		let tindex = rcts.indexOf(tplid);
		if (tindex === 0) return; //如果已经是第一项,则直接返回,不用处理

		if (tindex >= 0) {
			//如果找到, 就在原位置删除
			rcts.splice(tindex, 1);
		}

		rcts.unshift(tplid); //在头部加入
		if (rcts.length > 10) {
			//如多余10个,则限制在10个
			rcts.splice(10);
		}
		localStorage.setItem('recentTemplates', JSON.stringify(rcts));
		let tmpSub: menuDataType[] = [];
		for (let i = 0; i < rcts.length; i++) {
			tmpSub.push({
				id: `__recentbiz_${rcts[i]}`,
				class: 'recent_biz',
				alias: rcts[i],
				href: `/biz/${rcts[i]}`,
				icon: 'dot'
			});
		}
		let tmp = $menuDataForGet;
		console.log(tmp);
		let index = tmp.findIndex((mi) => {
			return mi.alias === 'Recents';
		});
		if (index >= 0) {
			console.log('Found recentbiz at ', index);
			tmp[index].sub = tmpSub;
			console.log(tmp[index]);
			$menuDataForSet = tmp;
			$menuRefreshFlag = true;
		} else {
			console.log('Recents not found');
		}
	};
</script>

<div class="fs-3 text-center">Business admin</div>

<div class="text-center">
	<button class="btn btn-primary" on:click={addRandomBizId}>demo:Add one biz</button>

	<div>See submenus under "Recents"</div>
</div>
