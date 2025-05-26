<div align="center">
  <h1>starlight-codeblock-fullscreen 🚀</h1>
  <p>A plugin for Astro Starlight that adds fullscreen functionality to code blocks with smooth animations and customizable options.</p>
  
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

## ⚙️ Configuration

The plugin accepts the following configuration options:

### `fullscreenButtonTooltip`

- **Type**: `string`
- **Default**: `"Toggle fullscreen view"`
- **Description**: Text displayed in the tooltip when hovering over the fullscreen button.

### `enableEscapeKey`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Allow users to exit fullscreen mode by pressing the Escape key.

### `exitOnBrowserBack`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Allow users to exit fullscreen mode using the browser's back button.

### `addToFramelessBlocks`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Add fullscreen buttons to code blocks without titles (frameless blocks).

### `fullscreenZoomLevel`

- **Type**: `number`
- **Default**: `150`
- **Description**: Zoom level (as percentage) applied in fullscreen mode for better readability.

### `svgPathFullscreenOn`

- **Type**: `string`
- **Default**: `"M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z"`
- **Description**: SVG path for the "enter fullscreen" icon.

### `svgPathFullscreenOff`

- **Type**: `string`
- **Default**: `"M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z"`
- **Description**: SVG path for the "exit fullscreen" icon.

### `animationDuration`

- **Type**: `number`
- **Default**: `200`
- **Range**: `150` to `700` milliseconds
- **Description**: Duration of fullscreen animations in milliseconds. Values outside the range will be automatically adjusted to `200`.

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
  addToFramelessBlocks: true,
  fullscreenZoomLevel: 120,
  animationDuration: 300,
  svgPathFullscreenOn: "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
  svgPathFullscreenOff: "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
})
```

### Minimal Configuration

```javascript
starlightCodeblockFullscreen({
  fullscreenZoomLevel: 110,
  animationDuration: 150,
})
```

## 🎯 Usage

Once installed and configured, the plugin automatically:

1. **Detects Code Blocks**: Finds all Expressive Code blocks on your pages
2. **Adds Fullscreen Buttons**: Inserts toggle buttons based on your configuration
3. **Handles Interactions**: Manages fullscreen mode, animations, and user input
4. **Maintains Accessibility**: Provides keyboard navigation and focus management
5. **Manages Zoom State**: Intelligently detects, stores, and restores browser zoom levels

### User Interactions

- **Click the fullscreen button** to enter/exit fullscreen mode
- **Press Escape** to exit fullscreen (if enabled)
- **Use browser back button** to exit fullscreen (if enabled)
- **Tab navigation** works within fullscreen mode

## 🎨 Customization

### Custom Icons

You can provide your own SVG paths for the fullscreen icons:

```javascript
starlightCodeblockFullscreen({
  svgPathFullscreenOn: "your-custom-expand-icon-path",
  svgPathFullscreenOff: "your-custom-collapse-icon-path",
})
```

### Animation Timing

Adjust the animation speed to match your site's design:

```javascript
starlightCodeblockFullscreen({
  animationDuration: 300, // Slower animations
})
```

### Zoom Levels

Optimize readability with custom zoom levels:

```javascript
starlightCodeblockFullscreen({
  fullscreenZoomLevel: 125, // 125% zoom in fullscreen
})
```

## 🔧 Requirements

- **Astro Starlight**: `>=0.34`
- **Node.js**: `^18.17.1 || ^20.3.0 || >=21.0.0`

## 🐛 Troubleshooting

### Fullscreen button not appearing

1. Ensure you're using Expressive Code blocks (the default in Starlight)
2. Check if `addToFramelessBlocks` is set correctly for your use case
3. Verify the plugin is properly added to your Starlight configuration

### Animations not working

1. Check if your browser supports CSS transitions
2. Verify `animationDuration` is set to a positive number
3. Ensure no conflicting CSS is overriding the animations

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
