import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import { inlineDecorator } from './shiki-inline-decorator';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'xoram',
	description: 'xoram - A lightweight plugin framework',
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			// { text: 'Examples', link: '/examples/markdown-examples' },
			{
				text: 'Documentation', items: [
					{ text: 'Guide', link: '/guide/introduction' },
					{ text: 'Tutorial', link: '/tutorial/index' },
				],
			},
			{ text: 'Plugins', link: '/plugins/', activeMatch: '/plugins(/.*)*/' },
			{ text: 'API', link: '/api-reference' },
		],

		sidebar: {
			examples: [
				{
					text: 'Examples',
					items: [
						{ text: 'Markdown Examples', link: '/examples/markdown-examples' },
						{ text: 'Runtime API Examples', link: '/examples/api-examples' },
					],
				},
			],
			guide: [
				{ text: 'Introduction', link: '/guide/introduction' },
				{ text: 'Getting started', link: '/guide/quick-start' },
				{
					text: 'Essentials',
					items: [
						{ text: 'Application', link: '/guide/essentials/application' },
						{ text: 'Plugins', link: '/guide/essentials/plugins' },
						{ text: 'Services', link: '/guide/essentials/services' },
					],
				},
				{
					text: 'Concepts in-depth',
					items: [
						{ text: 'Handling dependencies', link: '/guide/concepts-in-depth/handling-dependencies' },
						{ text: 'Plugin life cycle', link: '/guide/concepts-in-depth/life-cycle' },
						{ text: 'Registering services', link: '/guide/concepts-in-depth/adding-services' },
						{ text: 'Listening to events', link: '/guide/concepts-in-depth/listening-to-events' },
						{ text: 'Application events', link: '/guide/concepts-in-depth/application-events' },
						{ text: 'Handling errors', link: '/guide/concepts-in-depth/handling-errors' },
						{ text: 'Typing service events', link: '/guide/concepts-in-depth/typing-events' },
						{ text: 'Grouping plugins', link: '/guide/concepts-in-depth/grouping-plugins.md' },
					],
				},
				{
					text: 'tooling',
					items: [
						{ text: 'Hot Module Reload', link: '/guide/tooling/hot-module-reload' },
						{ text: 'Linting', link: '/guide/tooling/linting' },
					],
				},
			],
			plugins: [
				{
					text: 'Collection',
					link: 'plugins/index',
					items: [
						{
							text: 'Panoramique',
							link: '/plugins/panoramique',
							collapsed: true,
							items: [
								{ text: 'Describing components', link: '/plugins/panoramique/describing-components' },
								{ text: 'Registering components', link: '/plugins/panoramique/registering-components' },
								{ text: 'Parent-Child relationships', link: '/plugins/panoramique/parent-child-relationships' },
								{ text: 'Updating a prop', link: '/plugins/panoramique/updating-a-prop' },
								{ text: 'Configuring Vue', link: '/plugins/panoramique/configuring-vue' },
								{ text: 'Using Pinia', link: '/plugins/panoramique/using-pinia' },
							],
						},
					],
				},
			],
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Ragnar-Oock/xoram', ariaLabel: 'View the sources on github' },
		],
		outline: 'deep',
		footer: {
			message: 'Made with a 🖥️ by a 🥔.',
			copyright: 'Copyright ©️ 2025 <a href="https://github.com/Ragnar-Oock">Rägnar O\'ock</a>',
		},
		search: {
			provider: 'local',
		},
		externalLinkIcon: true,
	},
	head: [
		[
			'link',
			{
				rel: 'icon',
				href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥔</text></svg>',
			},
		],
	],
	srcDir: 'src',
	outDir: 'dist',
	base: '/',
	markdown: {
		lineNumbers: true,
		config(md) {
			md.use(groupIconMdPlugin);
		},
		codeTransformers: [
			inlineDecorator,
		],
	},
	vite: {
		plugins: [
			groupIconVitePlugin(),
		],

		resolve: {
			alias: [
				{
					find: /^\.\/VPNavBarExtra\.vue$/,
					replacement: fileURLToPath(new URL('./theme/components/VPNavBarExtra.vue', import.meta.url)),
				},
				{
					find: /^\.\/VPNavBarAppearance\.vue$/,
					replacement: fileURLToPath(new URL('./theme/components/VPNavBarAppearance.vue', import.meta.url)),
				},
			],
		},
		server: {
			fs: {
				cachedChecks: false,
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern',
				},
			},
		},
	},
	cleanUrls: true,
	transformPageData(pageData) {
		const canonicalUrl = `https://xoram.dev/${ pageData.relativePath }`
			.replace(/index\.md$/, '')
			.replace(/\.md$/, '');

		pageData.frontmatter.head ??= [];
		pageData.frontmatter.head.push([ 'link', { rel: 'canonical', href: canonicalUrl } ]);
	},
});