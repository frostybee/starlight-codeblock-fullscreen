import type { StarlightPlugin } from '@astrojs/starlight/types'
import type CodeBlockFullScreenOptions from "./common/types.ts";
import starlightCodeBlockFullscreenIntegration from "./libs/integration.ts";

export default function starlightCodeBlockFullscreenPlugin(userConfig: CodeBlockFullScreenOptions = {}): StarlightPlugin {
  return {
    name: 'starlight-codeblock-fullscreen-plugin',
    hooks: {
      'config:setup'({ addIntegration, logger }) {        
        
        addIntegration(starlightCodeBlockFullscreenIntegration(userConfig));
      },
    },
  }
}
