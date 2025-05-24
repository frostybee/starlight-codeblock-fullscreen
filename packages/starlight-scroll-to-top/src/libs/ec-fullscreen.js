/**
 * Expressive Code Fullscreen Plugin
 * Automatically adds fullscreen functionality to all Expressive Code blocks
 */
function initECFullscreen(config) {
  // Configuration options
  const {
    fullscreenButtonTooltip = "Toggle fullscreen view",
    enableEscapeKey = true,
    enableBackButton = true,
    addToTitledBlocksOnly = false,
    fullscreenZoomLevel = 150,
    fullscreenOnSvgPath = "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
    fullscreenOffSvgPath = "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
  } = config;

  document.addEventListener("DOMContentLoaded", () => {
    // Avoid duplicate initialization
    if (window.expressiveCodeFullscreenInitialized) return;
    window.expressiveCodeFullscreenInitialized = true;

    // Initialize fullscreen state.
    const fullscreenState = {
      isFullscreenActive: false,
      scrollPosition: 0,
      originalCodeBlock: null,
      currentZoom: 100,
    };

    // CSS styles for fullscreen functionality
    const styles = `
  .ec-fullscreen-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    z-index: 9999;
    overflow: auto;
    padding: 20px;
    box-sizing: border-box;
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .ec-fullscreen-container.is-open {
    visibility: visible;
    opacity: 1;
  }

  .expressive-code.ec-fullscreen-active {
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    margin: 0 !important;
    background-color: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ec-fullscreen-container.is-open .expressive-code.ec-fullscreen-active {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .ec-fullscreen-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s, background-color 0.2s, border-color 0.2s;
    border-radius: 4px;
    color: inherit;
    position: relative;
  }

  .ec-fullscreen-button:hover {
    opacity: 1;
    background-color: var(--sl-color-gray-5, rgba(255, 255, 255, 0.1));
    border-color: var(--sl-color-gray-7, rgba(255, 255, 255, 0.5));
  }

  .ec-fullscreen-button:focus {
    outline: 2px solid var(--sl-color-gray-7, rgba(255, 255, 255, 0.5));
    outline-offset: 2px;
  }

  .ec-fullscreen-button .fullscreen-on {
    display: inline;
  }

  .ec-fullscreen-button .fullscreen-off {
    display: none;
  }

  .expressive-code.ec-fullscreen-active .ec-fullscreen-button .fullscreen-on {
    display: none;
  }

  .expressive-code.ec-fullscreen-active .ec-fullscreen-button .fullscreen-off {
    display: inline;
  }

  /* Floating button specific styles */
  .ec-fullscreen-button-floating {
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .ec-fullscreen-button-floating:hover {
    background-color: var(--sl-color-gray-5, rgba(255, 255, 255, 0.2)) !important;
  }

  .ec-fullscreen-button-floating:focus {
    outline: 2px solid var(--sl-color-gray-7, rgba(255, 255, 255, 0.8));
    outline-offset: 2px;
  }

  /* Show floating button on focus-within for accessibility */
  .expressive-code:focus-within .ec-fullscreen-button-floating {
    opacity: 0.8 !important;
  }

  /* Fullscreen button container for frameless code blocks */
  .ec-fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 15;
  }

  .ec-fullscreen .ec-fullscreen-button {
    color: var(--ec-txt-clr, currentColor);
    pointer-events: auto !important;
    cursor: pointer !important;
  }

  .ec-fullscreen .ec-fullscreen-button:hover {
    background-color: var(--sl-color-gray-5, rgba(255, 255, 255, 0.2));
    opacity: 1;
  }

  /* Ensure fullscreen container has proper text color */
  .ec-fullscreen-container {
    color: var(--ec-txt-clr, var(--sl-color-white, #ffffff));
  }

  /* Hint message below code block in fullscreen */
  .ec-fullscreen-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    opacity: 0;
    animation: simpleShow 0.3s ease 1s forwards;
    pointer-events: none;
    z-index: 10000;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  @keyframes simpleShow {
    to {
      opacity: 0.85;
    }
  }

  .ec-fullscreen-hint kbd {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin: 0 2px;
  }

  /* Custom tooltip for fullscreen button */
  .ec-fullscreen-button[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 8px;
    background-color: var(--sl-color-black, #000000);
    color: var(--sl-color-white, #ffffff);
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    white-space: nowrap;
    z-index: 1900;
    opacity: 0;
    animation: tooltipFadeIn 0.2s ease 0.5s forwards;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--sl-color-gray-6, rgba(255, 255, 255, 0.1));
  }

  /* Tooltip arrow */
  .ec-fullscreen-button[data-tooltip]:hover::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(1px);
    margin-right: 4px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    font-size: 1rem;
    border-left: 4px solid var(--sl-color-black, #000000);
    z-index: 1901;
    opacity: 0;
    animation: tooltipFadeIn 0.2s ease 0.5s forwards;
    pointer-events: none;
  }

  @keyframes tooltipFadeIn {
    to {
      opacity: 1;
    }
  }

  /* Ensure tooltip positioning works correctly for header buttons */
  .ec-fullscreen-button {
    position: relative;
  }

  /* Tooltip positioning adjustments for floating buttons */
  .ec-fullscreen .ec-fullscreen-button[data-tooltip]:hover::after {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 12px;
  }

  .ec-fullscreen .ec-fullscreen-button[data-tooltip]:hover::before {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(1px);
    margin-right: 8px;
  }
`;

    /**
     * Zoom management for fullscreen functionality
     */
    const zoomManager = {
      storageKey: "expressiveCodeFullscreenZoom",

      /**
       * Get current browser zoom level as percentage
       * @returns {number} Zoom level (100 = 100%)
       */
      getCurrentZoom() {
        return Math.round(window.devicePixelRatio * 100);
      },

      /**
       * Get stored zoom data from localStorage
       * @returns {object} Zoom data object
       */
      getZoomData() {
        try {
          const data = localStorage.getItem(this.storageKey);
          return data ? JSON.parse(data) : {};
        } catch (e) {
          return {};
        }
      },

      /**
       * Store initial zoom level
       * @param {number} zoom Zoom level to store
       */
      storeInitialZoom(zoom) {
        const data = this.getZoomData();
        data.initialZoom = zoom;
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
          console.warn("Could not store zoom level in localStorage");
        }
      },

      /**
       * Get stored initial zoom level
       * @returns {number|null} Initial zoom level or null if not stored
       */
      getStoredInitialZoom() {
        const data = this.getZoomData();
        return data.initialZoom || null;
      },

      /**
       * Set zoom level using CSS
       * @param {number} level Zoom level (100 = 100%)
       */
      setZoom(level) {
        document.body.style.zoom = `${level}%`;
        console.log(`Zoom set to ${level}%`);
      },

      /**
       * Remove zoom styling to restore natural browser zoom
       */
      removeZoomStyling() {
        document.body.style.zoom = "";
        console.log("Zoom styling removed - browser controls zoom");
      },

      /**
       * Initialize zoom manager
       */
      init() {
        const currentZoom = this.getCurrentZoom();
        const storedInitial = this.getStoredInitialZoom();

        if (!storedInitial) {
          this.storeInitialZoom(currentZoom);
          console.log(`Initial zoom level stored: ${currentZoom}%`);
        } else {
          console.log(`Using stored initial zoom level: ${storedInitial}%`);
        }
      },
    };

    /**
     * Set zoom to configured level for fullscreen mode.
     */
    function setFullscreenZoom() {
      const currentZoom = zoomManager.getCurrentZoom();
      fullscreenState.currentZoom = currentZoom;

      // Set to configured zoom level for fullscreen
      zoomManager.setZoom(config.fullscreenZoomLevel);
      console.log(
        `Fullscreen activated - zoom set to ${config.fullscreenZoomLevel}% (was ${currentZoom}%)`
      );
    }

    /**
     * Restore zoom to the initial state.
     */
    function restoreInitialZoom() {
      const initialZoom = zoomManager.getStoredInitialZoom();

      if (initialZoom) {
        zoomManager.setZoom(initialZoom);
        console.log(`Zoom restored to initial level: ${initialZoom}%`);
      } else {
        // Fallback: remove zoom styling
        zoomManager.removeZoomStyling();
        console.log("No stored initial zoom - removing zoom styling");
      }
    }

    // Create and inject styles
    function injectStyles() {
      if (document.getElementById("expressive-code-fullscreen-styles")) return;

      const styleSheet = document.createElement("style");
      styleSheet.id = "expressive-code-fullscreen-styles";
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    // Create fullscreen container
    function createFullscreenContainer() {
      if (document.querySelector(".ec-fullscreen-container")) return;

      const container = document.createElement("div");
      container.className = "ec-fullscreen-container";
      document.body.appendChild(container);
    }

    // Create hint element for fullscreen mode
    function createFullscreenHint() {
      const hint = document.createElement("div");
      hint.className = "ec-fullscreen-hint";
      hint.innerHTML = "Press <kbd>Esc</kbd> to exit full screen";
      return hint;
    }

    /**
     * Get the current page background color.
     * This is used to set the background color of the fullscreen container in order to match the page background color and make the fullscreen container blend in with the page.
     *
     * @returns {string} The background color of the page
     */
    function getPageBackgroundColor() {
      // Check body background first.
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent") {
        return bodyBg;
      }

      // Fallback to html element.
      const fallbackBg = window.getComputedStyle(
        document.documentElement
      ).backgroundColor;
      if (
        fallbackBg &&
        fallbackBg !== "rgba(0, 0, 0, 0)" &&
        fallbackBg !== "transparent"
      ) {
        return fallbackBg;
      }
      // Default fallback in case no background color is found.
      return "#ffffff";
    }

    // Get appropriate text color based on background
    function getContrastTextColor(backgroundColor) {
      // Simple heuristic: if background is light, use dark text, else light text
      const rgb = backgroundColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness =
          (parseInt(rgb[0]) * 299 +
            parseInt(rgb[1]) * 587 +
            parseInt(rgb[2]) * 114) /
          1000;
        return brightness > 128 ? "#000000" : "#ffffff";
      }
      return "#000000"; // Default to dark text
    }

    // Create fullscreen button HTML
    function createFullscreenButton() {
      const button = document.createElement("button");
      button.className = "ec-fullscreen-button";
      button.type = "button";
      button.setAttribute("aria-label", config.fullscreenButtonTooltip);
      button.setAttribute("data-tooltip", config.fullscreenButtonTooltip);
      // Remove native tooltip since we're using custom styled tooltip
      // button.title = config.fullscreenButtonTooltip;

      button.innerHTML = `
      <svg class="fullscreen-on" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.fullscreenOnSvgPath}"/>
      </svg>
      <svg class="fullscreen-off" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.fullscreenOffSvgPath}"/>
      </svg>
    `;

      return button;
    }

    /**
     * Adds a fullscreen button to a code block.
     * @param {HTMLElement} codeBlock The code block to add the fullscreen button to.
     * @returns {void}
     * @description
     * 1. Checks if a fullscreen button already exists in the code block.
     * 2. Finds the figure element that contains the code block.
     * 3. Checks if the code block has a title/header or is a terminal so that the toggle fullscreen button can be added to the header.
     * 4. If configured to only add to titled blocks, skips blocks without titles or terminal styling.
     * 5. For code blocks with titles or terminals, adds the button to the figcaption header.
     * 6. For code blocks without titles or terminal styling, adds the button under the copy button.
     * 7. Inserts the fullscreen button container in the same parent as copy button.
     */
    function addFullscreenButtonToBlock(codeBlock) {
      // Check if button already exists
      if (codeBlock.querySelector(".ec-fullscreen-button")) return;
      // Find the figure element that contains the code block
      const figure = codeBlock.querySelector(".frame");
      if (!figure) return; // Exit if no frame element found

      // Check if the code block has a title/header or is a terminal so that the toggle fullscreen button can be added to the header.
      const hasHeaderArea =
        figure.classList.contains("has-title") ||
        figure.classList.contains("is-terminal");

      // If configured to only add to titled blocks, skip blocks without titles or terminal
      if (config.addToTitledBlocksOnly && !hasHeaderArea) {
        return;
      }
      if (hasHeaderArea) {
        // For code blocks with titles or terminals, add button to the figcaption header
        const header = codeBlock.querySelector("figcaption.header");

        if (header) {
          const button = createFullscreenButton();

          // Ensure the header has relative positioning
          const headerStyle = getComputedStyle(header);
          if (headerStyle.position === "static") {
            header.style.position = "relative";
          }

          button.style.cssText = `
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        `;

          header.appendChild(button);
        }
      } else {
        // For code blocks without titles, add button under the copy button
        const copyButton = codeBlock.querySelector(".copy");
        if (copyButton) {
          // Create a container for the fullscreen button
          const fullscreenContainer = document.createElement("div");
          fullscreenContainer.className = "ec-fullscreen";
          fullscreenContainer.style.cssText = `
          position: absolute;
          top: 50px;
          right: 8px;
          z-index: 15;
          pointer-events: auto;
        `;

          const button = createFullscreenButton();
          button.style.cssText = `
          width: 32px;
          height: 32px;
          padding: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          opacity: 0.7;
          transition: opacity 0.2s ease, background-color 0.2s ease;
          pointer-events: auto;
          cursor: pointer;
        `;

          fullscreenContainer.appendChild(button);

          // Insert the fullscreen button container in the same parent as copy button
          copyButton.parentNode.appendChild(fullscreenContainer);
        }
      }
    }

    // Initialize fullscreen buttons for all code blocks
    function initializeFullscreenButtons() {
      const codeBlocks = document.querySelectorAll(".expressive-code");

      codeBlocks.forEach((block) => {
        addFullscreenButtonToBlock(block);
      });

      // Add event listeners to all fullscreen buttons
      document.querySelectorAll(".ec-fullscreen-button").forEach((button) => {
        // Remove existing listeners to avoid duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener("click", handleFullscreenClick);
      });
    }

    function handleFullscreenClick(event) {
      event.preventDefault();
      event.stopPropagation();
      // Attempts to locate the code block that contains the toggle fullscreen button that was clicked.
      const codeBlock = this.closest(".expressive-code");

      if (codeBlock) {
        toggleFullscreen(codeBlock);
      }
    }

    function toggleFullscreen(codeBlock) {
      const fullscreenContainer = document.querySelector(
        ".ec-fullscreen-container"
      );

      if (fullscreenState.isFullscreenActive) {
        exitFullscreen(fullscreenContainer);
      } else {
        enterFullscreen(codeBlock, fullscreenContainer);
      }
    }

    function enterFullscreen(codeBlock, fullscreenContainer) {
      // Store reference to original code block
      fullscreenState.originalCodeBlock = codeBlock;

      // Clone the code block
      const clonedBlock = codeBlock.cloneNode(true);
      clonedBlock.classList.add("ec-fullscreen-active");

      // Add event listener to exit button in fullscreen mode
      const fullscreenButtonInClone = clonedBlock.querySelector(
        ".ec-fullscreen-button"
      );
      if (fullscreenButtonInClone) {
        fullscreenButtonInClone.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          toggleFullscreen(clonedBlock);
        });
      }

      // Save current state and enter fullscreen
      saveScrollPosition();
      setFullscreenZoom();
      setBodyOverflow(true);

      if (config.enableEscapeKey) addKeyupListener();
      if (config.enableBackButton) addPopStateListener();

      // Apply page background color to fullscreen container
      const pageBackgroundColor = getPageBackgroundColor();
      const textColor = getContrastTextColor(pageBackgroundColor);
      fullscreenContainer.style.backgroundColor = pageBackgroundColor;
      fullscreenContainer.style.color = textColor;

      fullscreenContainer.appendChild(clonedBlock);

      // Add hint if escape key is enabled
      if (config.enableEscapeKey) {
        const hint = createFullscreenHint();
        fullscreenContainer.appendChild(hint);
      }

      fullscreenContainer.classList.add("is-open");
      fullscreenState.isFullscreenActive = true;

      // Focus the fullscreen container for better accessibility
      fullscreenContainer.focus();
    }

    function exitFullscreen(fullscreenContainer) {
      // Restore original state
      setBodyOverflow(false);
      restoreInitialZoom();
      restoreScrollPosition();

      if (config.enableEscapeKey) removeKeyupListener();
      if (config.enableBackButton) removePopStateListener();

      fullscreenContainer.classList.remove("is-open");

      // Reset inline styles
      fullscreenContainer.style.backgroundColor = "";
      fullscreenContainer.style.color = "";

      // Clear container contents
      while (fullscreenContainer.firstChild) {
        fullscreenContainer.removeChild(fullscreenContainer.firstChild);
      }

      fullscreenState.isFullscreenActive = false;

      // Return focus to original code block or button (before clearing the reference)
      if (fullscreenState.originalCodeBlock) {
        const originalButton = fullscreenState.originalCodeBlock.querySelector(
          ".ec-fullscreen-button"
        );
        if (originalButton) {
          originalButton.focus();
        } else {
          // Fallback: focus the original code block
          fullscreenState.originalCodeBlock.focus();
        }
      }

      // Clear the reference after using it
      fullscreenState.originalCodeBlock = null;
    }

    /**
     * Save the current scroll position of the page before entering fullscreen mode.
     */
    function saveScrollPosition() {
      fullscreenState.scrollPosition =
        window.scrollY || document.documentElement.scrollTop;
    }

    /**
     * Restore the scroll position of the page after exiting fullscreen mode.
     */
    function restoreScrollPosition() {
      if (
        typeof fullscreenState.scrollPosition === "number" &&
        !isNaN(fullscreenState.scrollPosition)
      ) {
        setTimeout(() => {
          window.scrollTo({
            top: fullscreenState.scrollPosition,
            behavior: "smooth",
          });
        }, 0);
      }
    }

    /**
     * Set the body overflow to hidden when entering fullscreen mode.
     */
    function setBodyOverflow(hidden) {
      if (hidden) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    }

    /**
     * Handle the keyup event when the escape key is pressed.
     */
    function handleKeyup(event) {
      if (event.key === "Escape" && fullscreenState.isFullscreenActive) {
        const fullscreenContainer = document.querySelector(
          ".ec-fullscreen-container"
        );
        if (fullscreenContainer) {
          exitFullscreen(fullscreenContainer);
        }
      }
    }

    /**
     * Add a listener for the keyup event when the escape key is pressed.
     */
    function addKeyupListener() {
      // Remove existing listener first to prevent duplicates
      document.removeEventListener("keyup", handleKeyup);
      document.addEventListener("keyup", handleKeyup);
    }

    /**
     * Remove the listener for the keyup event when the escape key is pressed.
     */
    function removeKeyupListener() {
      document.removeEventListener("keyup", handleKeyup);
    }

    /**
     * Handle the popstate event when the back button is pressed.
     */
    function handlePopState() {
      if (fullscreenState.isFullscreenActive) {
        const fullscreenContainer = document.querySelector(
          ".ec-fullscreen-container"
        );
        if (fullscreenContainer) {
          exitFullscreen(fullscreenContainer);
        }
      }
    }

    /**
     * Add a listener for the popstate event when the back button is pressed.
     */
    function addPopStateListener() {
      // Remove existing listener first to prevent duplicates
      window.removeEventListener("popstate", handlePopState);
      window.addEventListener("popstate", handlePopState);
    }

    /**
     * Remove the listener for the popstate event when the back button is pressed.
     */
    function removePopStateListener() {
      window.removeEventListener("popstate", handlePopState);
    }

    /**
     * Initialize the fullscreen plugin.
     */
    function initialize() {
      // Initialize zoom manager
      zoomManager.init();

      injectStyles();
      createFullscreenContainer();
      initializeFullscreenButtons();
    }

    // Initialize the plugin
    initialize();

    // Expose public API
    window.ExpressiveCodeFullscreen = {
      initialize: initialize,
      config: config,
      state: fullscreenState,
    };
  });
}

export default initECFullscreen;
