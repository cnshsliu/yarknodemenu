cp -r static/* ~/dev/menu.demo/static
cp -r src/routes/* ~/dev/menu.demo/src/routes
rg -0 -l  '\$lib/' ~/dev/menu.demo/src/routes | xargs -0 sed -i '' 's|\$lib/|@yarknode/svelte-menu/|g'
