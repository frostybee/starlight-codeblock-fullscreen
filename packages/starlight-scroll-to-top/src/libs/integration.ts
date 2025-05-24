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
