import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightCodeBlockFullscreen from 'starlight-codeblock-fullscreen'

const siteURI = 'https://frostybee.github.io';
export default defineConfig({
  site: siteURI,
  base: "/starlight-codeblock-fullscreen",
  integrations: [
    starlight({
      editLink: {
        baseUrl: 'https://github.com/frostybee/starlight-codeblock-fullscreen/edit/main/docs/',
      },
      plugins: [
        starlightCodeBlockFullscreen({
          fullscreenButtonTooltip: 'Toggle fullscreen view',
          enableEscapeKey: true,
          enableBackButton: true,
          addToTitledBlocksOnly: false,
          fullscreenZoomLevel: 150,
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
        }       
      ],
      social: [
        { href: 'https://github.com/frostybee/starlight-codeblock-fullscreen', icon: 'github', label: 'GitHub' },
      ],
      title: 'Starlight Scroll to Top',
    }),
  ],
})
