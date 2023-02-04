import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch, parent }) => {
	return {
		tpl_action: params.slug
	};
};
