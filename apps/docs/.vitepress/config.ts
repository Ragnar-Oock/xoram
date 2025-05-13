import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Zoram',
	description: 'Zoram - A lightweight plugin framework',
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
					text: 'Plugins in-depth',
					items: [
						{ text: 'Handling dependencies', link: '/guide/plugins-in-depth/handling-dependencies' },
						{ text: 'Life Cycle', link: '/guide/plugins-in-depth/life-cycle' },
						{ text: 'Registering services', link: '/guide/plugins-in-depth/adding-services' },
						{ text: 'Listening to events', link: '/guide/plugins-in-depth/listening-to-events' },
						{ text: 'Application events', link: '/guide/plugins-in-depth/application-events' },
						{ text: 'Handling errors', link: '/guide/plugins-in-depth/handling-errors' },
						{ text: 'Typing service events', link: '/guide/plugins-in-depth/typing-events' },
						{ text: 'Asynchronous plugin', link: '/guide/plugins-in-depth/asynchronous-plugins.md' },
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
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Ragnar-Oock/zoram', ariaLabel: 'View the sources on github' },
		],
		outline: 'deep',
		footer: {
			message: 'Made with a 🖥️ by a 🥔.',
			copyright: 'Copyright ©️ 2025 <a href="https://github.com/Ragnar-Oock">Rägnar O\'ock</a>',
		},
		search: {
			provider: 'local',
		},
	},
	srcDir: 'src',
	outDir: 'dist',
	base: '/',
});
