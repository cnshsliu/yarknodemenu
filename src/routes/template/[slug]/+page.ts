import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		tpl_action: params.slug
	};
};
