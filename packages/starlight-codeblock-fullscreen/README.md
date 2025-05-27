<div align="center">
  <h1>starlight-codeblock-fullscreen 🚀</h1>
  <p>A plugin for Astro Starlight that adds fullscreen functionality to code blocks with customizable options.</p>
  
  [![npm version](https://badge.fury.io/js/starlight-codeblock-fullscreen.svg)](https://badge.fury.io/js/starlight-codeblock-fullscreen)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## ✨ Features

- 🖥️ **Fullscreen Mode**: Toggle code blocks to fullscreen view for better readability,
- ⌨️ **Keyboard Navigation**: Exit fullscreen with Escape key or browser back button,
- 🎨 **Customizable Icons**: Use custom SVG paths for fullscreen buttons,
- 🔧 **Flexible Configuration**: Control zoom levels, animations, and button placement,
- 📱 **Responsive Design**: Works seamlessly across different screen sizes,
- ♿ **Accessibility**: Full keyboard navigation and focus management,
- 🎭 **Smooth Animations**: Configurable animation duration for transitions,
- 🎯 **Smart Targeting**: Choose to add buttons to all blocks or only titled ones.

## 📦 Installation

Install the plugin using your preferred package manager:

```bash
# npm
npm install starlight-codeblock-fullscreen

# pnpm
pnpm add starlight-codeblock-fullscreen

# yarn
yarn add starlight-codeblock-fullscreen
```

## 🚀 Quick Start

Add the plugin to your Astro Starlight configuration:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import starlightCodeblockFullscreen from 'starlight-codeblock-fullscreen'

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightCodeblockFullscreen({
          // Optional configuration
        }),
      ],
      title: 'My Documentation',
    }),
  ],
})
```

That's it! The plugin will automatically add fullscreen buttons to all your code blocks.

## 📝 Example Configurations

### Basic Configuration

```javascript
starlightCodeblockFullscreen({
  fullscreenButtonTooltip: 'View in fullscreen',
  enableEscapeKey: true,
  exitOnBrowserBack: true,
})
```

### Advanced Configuration

```javascript
starlightCodeblockFullscreen({
  fullscreenButtonTooltip: 'Expand code block',
  enableEscapeKey: true,
  exitOnBrowserBack: true,
  addToUntitledBlocks: true,
  fullscreenZoomLevel: 120,
  animationDuration: 300,
  svgPathFullscreenOn: "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
  svgPathFullscreenOff: "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
})
```

### User Interactions

- **Click the toggle fullscreen button** to enter/exit fullscreen mode
- **Press Escape** to exit fullscreen (if enabled)
- **Use browser back button** to exit fullscreen (if enabled)
- **Tab navigation** works within fullscreen mode

## 🔧 Requirements

- **Astro Starlight**: `>=0.34`
- **Node.js**: `^18.17.1 || ^20.3.0 || >=21.0.0`

## 🐛 Troubleshooting

### Fullscreen button not appearing

1. Ensure you're using Expressive Code blocks (the default in Starlight)
2. Check if `addToUntitledBlocks` is set correctly for your use case
3. Verify the plugin is properly added to your Starlight configuration

### Keyboard shortcuts not working

1. Verify `enableEscapeKey` and `exitOnBrowserBack` are set to `true`
2. Check if other scripts are preventing event propagation
3. Ensure the fullscreen container has proper focus

## 📚 Documentation

For comprehensive documentation and examples, visit the [plugin documentation](https://frostybee.github.io/starlight-codeblock-fullscreen/).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

Licensed under the MIT License, Copyright © frostybee.

See [LICENSE](/LICENSE) for more information.

## 🔗 Links

- [GitHub Repository](https://github.com/frostybee/starlight-codeblock-fullscreen)
- [npm Package](https://www.npmjs.com/package/starlight-codeblock-fullscreen)
- [Documentation](https://frostybee.github.io/starlight-codeblock-fullscreen/)
- [Issues](https://github.com/frostybee/starlight-codeblock-fullscreen/issues)
