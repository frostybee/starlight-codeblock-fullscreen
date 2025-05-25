import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightCodeBlockFullscreen from 'starlight-codeblock-fullscreen'

const siteURI = 'https://frostybee.github.io';
export default defineConfig({
  site: siteURI,
  base: "/starlight-codeblock-fullscreen",
  integrations: [
    starlight({
      title: 'Starlight Code Block Fullscreen',
      favicon: '/images/full-screen.svg',
      editLink: {
        baseUrl: 'https://github.com/frostybee/starlight-codeblock-fullscreen/edit/main/docs/',
      },
      plugins: [
        starlightCodeBlockFullscreen({
          fullscreenButtonTooltip: 'Toggle fullscreen view',
          enableEscapeKey: true,
          exitOnBrowserBack: true,
          addToFramelessBlocks: false,
          fullscreenZoomLevel: 150,
          animationDuration: 150,
          svgPathFullscreenOn: "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
          svgPathFullscreenOff: "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
        }
        )],
      sidebar: [
        {
          label: 'Start Here',
          collapsed: false,
          items: [
            { slug: 'getting-started' },
            { slug: 'configuration' },
          ],
        },
        {
          label: 'Features',
          collapsed: false,
          items: [
            { slug: 'features' },
          ],
        }
      ],
      social: [
        { href: 'https://github.com/frostybee/starlight-codeblock-fullscreen', icon: 'github', label: 'GitHub' },
      ],
    }),
  ],
})
