import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import type CodeBlockFullscreenOptions from '../common/types.d.ts';
// Get directory path of current file
const __dirname = dirname(fileURLToPath(import.meta.url));


export default function starlightCodeBlockFullscreenIntegration(userOptions: CodeBlockFullscreenOptions = {}): AstroIntegration {
  // Set default options
  const pluginOptions = {
    fullscreenButtonTooltip: "Toggle fullscreen view",
    enableEscapeKey: true,
    enableBackButton: true,
    addToTitledBlocksOnly: false,
    fullscreenZoomLevel: 150,
    fullscreenOnSvgPath: "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
    fullscreenOffSvgPath: "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
    ...userOptions
  };

  return {
    name: 'starlight-ec-fullscreen-plugin',
    hooks: {
      'astro:config:setup': async ({ injectScript }) => {

        // Synchronously read the file content         
        const fileContent = readFileSync(join(__dirname, 'ec-fullscreen.js'), 'utf-8');

        // Inject client-side script that will handle scroll behavior        
        // Pass the configuration as stringified JSON
        injectScript('page', `
            ${fileContent};
            initECFullscreen(${JSON.stringify(pluginOptions)});          
          `);
      },
      'astro:build:done': ({ logger }) => {
        logger.info(`Starlight EC Fullscreen plugin has been installed successfully!`);
      }
    }
  };
}
