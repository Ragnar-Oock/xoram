import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zoram Documentation",
  description: "Zoram - A lightweight plugin framework",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/examples/markdown-examples' },
      { text: 'Guide', link: '/guide' },
      { text: 'Docs', link: '/docs' }
    ],

    sidebar: {
      examples: [
        {
          text: 'Examples',
          items: [
            { text: 'Markdown Examples', link: '/examples/markdown-examples' },
            { text: 'Runtime API Examples', link: '/examples/api-examples' }
          ]
        },
      ],
      guide: [
        {
          text: 'Getting started', link: '/guide/quick-start',
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Application', link: '/guide/essentials/application' },
            { text: 'Plugins', link: '/guide/essentials/plugins' },
            { text: 'Services', link: '/guide/essentials/services' },
          ]
        },
        {
          text: 'Plugins in-depth',
          items: [
            { text: 'Life Cycle', link: '/guide/plugins-in-depth/life-cycle'},
            { text: 'Registering services', link: '/guide/plugins-in-depth/adding-services' },
            { text: 'Application events', link: '/guide/plugins-in-depth/application-events' },
          ]
        },
        {
          text: 'tooling',
          items: [
            {text: 'Hot Module Reload', link: '/guide/tooling/hot-module-reload'},
            {text: 'Linting', link: '/guide/tooling/linting'},
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ragnar-Oock/zoram' }
    ]
  },
  srcDir: 'src',
	outDir: 'dist'
})
