/**
 * Expressive Code Fullscreen Plugin
 * Automatically adds fullscreen functionality to all Expressive Code blocks
 */
function initECFullscreen(config) {
  // Configuration options
  const {
    fullscreenButtonTooltip = "Toggle fullscreen view",
    enableEscapeKey = true,
    exitOnBrowserBack = true,
    addToFramelessBlocks = false,
    fullscreenZoomLevel = 150,
    animationDuration = 200,
    svgPathFullscreenOn = "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
    svgPathFullscreenOff = "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
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
      focusTrapHandler: null,
    };

    // Ensure animation duration is an integer between 150 and 700.
    if (
      !Number.isInteger(config.animationDuration) ||
      config.animationDuration < 150 ||
      config.animationDuration > 700
    ) {
      config.animationDuration = 200;
    }

    /**
     * Zoom management for fullscreen functionality.
     */
    const zoomManager = {
      storageKey: "expressiveCodeFullscreenZoom",

      /**
       * Get current browser zoom level as percentage.
       * @returns {number} Zoom level (100 = 100%)
       */
      getCurrentZoom() {
        return Math.round(window.devicePixelRatio * 100);
      },

      /**
       * Get stored zoom data from localStorage.
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
       * Store initial zoom level.
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
       * Get stored initial zoom level.
       * @returns {number|null} Initial zoom level or null if not stored
       */
      getStoredInitialZoom() {
        const data = this.getZoomData();
        return data.initialZoom || null;
      },

      /**
       * Set zoom level using CSS.
       * @param {number} level Zoom level (100 = 100%)
       */
      setZoom(level) {
        document.body.style.zoom = `${level}%`;
      },

      /**
       * Remove zoom styling to restore natural browser zoom.
       */
      removeZoomStyling() {
        document.body.style.zoom = "";
      },

      /**
       * Initialize zoom manager.
       */
      init() {
        const currentZoom = this.getCurrentZoom();
        const storedInitial = this.getStoredInitialZoom();

        if (!storedInitial) {
          this.storeInitialZoom(currentZoom);
        }
      },
    };

    /**
     * Set zoom to configured level for fullscreen mode.
     */
    function setFullscreenZoom() {
      const currentZoom = zoomManager.getCurrentZoom();
      fullscreenState.currentZoom = currentZoom;

      // Set to configured zoom level for fullscreen.
      zoomManager.setZoom(config.fullscreenZoomLevel);
    }

    /**
     * Restore zoom to the initial state.
     */
    function restoreInitialZoom() {
      const initialZoom = zoomManager.getStoredInitialZoom();

      if (initialZoom) {
        zoomManager.setZoom(initialZoom);
      } else {
        // Fallback: remove zoom styling.
        zoomManager.removeZoomStyling();
      }
    }

    // Create and inject styles with animation duration from config.
    function injectStyles() {
      if (document.getElementById("expressive-code-fullscreen-styles")) return;

      const styleSheet = document.createElement("style");
      styleSheet.id = "expressive-code-fullscreen-styles";

      // Set CSS custom property for animation duration
      document.documentElement.style.setProperty(
        "--ec-fullscreen-animation-duration",
        `${config.animationDuration}ms`
      );

      // Note: CSS styles are now loaded separately via the integration
      document.head.appendChild(styleSheet);
    }

    // Create fullscreen container.
    function createFullscreenContainer() {
      if (document.querySelector(".ec-fullscreen-container")) return;

      const container = document.createElement("div");
      container.className = "ec-fullscreen-container";
      container.setAttribute("role", "dialog");
      container.setAttribute("aria-modal", "true");
      container.setAttribute("aria-label", "Code block in fullscreen view");
      container.setAttribute("tabindex", "-1");
      container.style.setProperty(
        "--ec-fullscreen-animation-duration",
        `${config.animationDuration}ms`
      );
      document.body.appendChild(container);
    }

    // Create hint element for fullscreen mode.
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

    // Get appropriate text color based on background.
    function getContrastTextColor(backgroundColor) {
      // Simple heuristic: if background is light, use dark text, else light text.
      const rgb = backgroundColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness =
          (parseInt(rgb[0]) * 299 +
            parseInt(rgb[1]) * 587 +
            parseInt(rgb[2]) * 114) /
          1000;
        return brightness > 128 ? "#000000" : "#ffffff";
      }
      return "#000000"; // Default to dark text.
    }

    // Create fullscreen button HTML.
    function createFullscreenButton() {
      const button = document.createElement("button");
      button.className = "ec-fullscreen-button";
      button.type = "button";
      button.setAttribute("aria-label", config.fullscreenButtonTooltip);
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("data-tooltip", config.fullscreenButtonTooltip);
      // Remove native tooltip since we're using custom styled tooltip.
      // button.title = config.fullscreenButtonTooltip;

      button.innerHTML = `
      <svg class="fullscreen-on" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.svgPathFullscreenOn}"/>
      </svg>
      <svg class="fullscreen-off" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.svgPathFullscreenOff}"/>
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
      // Check if button already exists.
      if (codeBlock.querySelector(".ec-fullscreen-button")) return;
      // Find the figure element that contains the code block.
      const figure = codeBlock.querySelector(".frame");
      if (!figure) return; // Exit if no frame element found.

      // Check if the code block has a title/header or is a terminal so that the toggle fullscreen button can be added to the header.
      const hasHeaderArea =
        figure.classList.contains("has-title") ||
        figure.classList.contains("is-terminal");

      // If configured to only add to titled blocks, skip blocks without titles or terminal.
      if (!config.addToFramelessBlocks && !hasHeaderArea) {
        return;
      }
      if (hasHeaderArea) {
        // For code blocks with titles or terminals, add button to the figcaption header.
        const header = codeBlock.querySelector("figcaption.header");

        if (header) {
          const button = createFullscreenButton();

          // Ensure the header has relative positioning.
          const headerStyle = getComputedStyle(header);
          if (headerStyle.position === "static") {
            header.style.position = "relative";
          }

          button.style.cssText = `
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        `;

          header.appendChild(button);
        }
      } else {
        // For code blocks without titles, add button under the copy button.
        const copyButton = codeBlock.querySelector(".copy");
        if (copyButton) {
          // Create a container for the fullscreen button.
          const fullscreenContainer = document.createElement("div");
          fullscreenContainer.className = "ec-fullscreen";
          fullscreenContainer.style.cssText = `
          position: absolute;
          top: 3.125rem;
          right: 0.5rem;
          z-index: 15;
          pointer-events: auto;
        `;

          const button = createFullscreenButton();
          button.style.cssText = `
          width: 2rem;
          height: 2rem;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          opacity: 0.7;
          transition: opacity 0.2s ease, background-color 0.2s ease;
          pointer-events: auto;
          cursor: pointer;
        `;

          fullscreenContainer.appendChild(button);

          // Insert the fullscreen button container in the same parent as copy button.
          copyButton.parentNode.appendChild(fullscreenContainer);
        }
      }
    }

    // Initialize fullscreen buttons for all code blocks.
    function initializeFullscreenButtons() {
      const codeBlocks = document.querySelectorAll(".expressive-code");

      codeBlocks.forEach((block) => {
        addFullscreenButtonToBlock(block);
      });

      // Add event listeners to all fullscreen buttons.
      document.querySelectorAll(".ec-fullscreen-button").forEach((button) => {
        // Remove existing listeners to avoid duplicates.
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener("click", handleFullscreenClick);

        // Add keyboard support for Enter and Space keys.
        newButton.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleFullscreenClick.call(this, event);
          }
        });
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
      // Store reference to original code block.
      fullscreenState.originalCodeBlock = codeBlock;

      // Update aria-expanded state for accessibility.
      const originalButton = codeBlock.querySelector(".ec-fullscreen-button");
      if (originalButton) {
        originalButton.setAttribute("aria-expanded", "true");
      }

      // Clone the code block.
      const clonedBlock = codeBlock.cloneNode(true);
      clonedBlock.classList.add("ec-fullscreen-active");

      // Add event listener to exit button in fullscreen mode.
      const fullscreenButtonInClone = clonedBlock.querySelector(
        ".ec-fullscreen-button"
      );
      if (fullscreenButtonInClone) {
        fullscreenButtonInClone.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          toggleFullscreen(clonedBlock);
        });

        // Add keyboard support for cloned button.
        fullscreenButtonInClone.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleFullscreen(clonedBlock);
          }
        });
      }

      // Save current state and enter fullscreen.
      saveScrollPosition();
      setFullscreenZoom();
      setBodyOverflow(true);

      if (config.enableEscapeKey) addKeyupListener();
      if (config.exitOnBrowserBack) {
        // Push a new history state so back button can exit fullscreen
        history.pushState({ fullscreenActive: true }, "", window.location.href);
        addPopStateListener();
      }

      // Apply page background color to fullscreen container.
      const pageBackgroundColor = getPageBackgroundColor();
      const textColor = getContrastTextColor(pageBackgroundColor);
      fullscreenContainer.style.backgroundColor = pageBackgroundColor;
      fullscreenContainer.style.color = textColor;

      fullscreenContainer.appendChild(clonedBlock);

      // Add hint if escape key is enabled.
      if (config.enableEscapeKey) {
        const hint = createFullscreenHint();
        fullscreenContainer.appendChild(hint);

        // Auto-hide hint after 4 seconds.
        setTimeout(() => {
          if (hint && hint.parentNode) {
            // Use JavaScript to fade out smoothly, overriding CSS animation.
            hint.style.setProperty(
              "transition",
              "opacity 0.9s ease",
              "important"
            );
            hint.style.setProperty("opacity", "0", "important");

            // Remove the hint completely after fade out completes.
            setTimeout(() => {
              if (hint && hint.parentNode) {
                hint.remove();
              }
            }, 500); // Wait for fade transition to complete.
          }
        }, 4000);
      }

      fullscreenContainer.classList.add("is-open");
      fullscreenState.isFullscreenActive = true;

      // Focus the fullscreen container for better accessibility.
      fullscreenContainer.focus();

      // Add focus trap for modal behavior.
      addFocusTrap(fullscreenContainer);
    }

    function exitFullscreen(fullscreenContainer) {
      // Restore original state.
      setBodyOverflow(false);
      restoreInitialZoom();
      restoreScrollPosition();

      if (config.enableEscapeKey) removeKeyupListener();
      if (config.exitOnBrowserBack) {
        removePopStateListener();
        // Only go back if we're exiting due to escape key or button click (not back button)
        if (history.state && history.state.fullscreenActive) {
          history.back();
        }
      }

      // Remove focus trap.
      removeFocusTrap();

      fullscreenContainer.classList.remove("is-open");

      // Reset inline styles.
      fullscreenContainer.style.backgroundColor = "";
      fullscreenContainer.style.color = "";

      // Clear container contents.
      while (fullscreenContainer.firstChild) {
        fullscreenContainer.removeChild(fullscreenContainer.firstChild);
      }

      fullscreenState.isFullscreenActive = false;

      // Return focus to original code block or button (before clearing the reference).
      if (fullscreenState.originalCodeBlock) {
        const originalButton = fullscreenState.originalCodeBlock.querySelector(
          ".ec-fullscreen-button"
        );
        if (originalButton) {
          // Restore aria-expanded state.
          originalButton.setAttribute("aria-expanded", "false");
          // Remove focus from the button to prevent visual outline.
          originalButton.blur();
        }
      }

      // Clear the reference after using it.
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
      // Remove existing listener first to prevent duplicates.
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
    function handlePopState(event) {
      if (fullscreenState.isFullscreenActive) {
        // Prevent the history.back() call in exitFullscreen from causing a loop
        const isBackButtonPressed =
          !event.state || !event.state.fullscreenActive;
        if (isBackButtonPressed) {
          const fullscreenContainer = document.querySelector(
            ".ec-fullscreen-container"
          );
          if (fullscreenContainer) {
            // Temporarily disable back button handling to prevent recursion
            removePopStateListener();
            exitFullscreen(fullscreenContainer);
          }
        }
      }
    }

    /**
     * Add a listener for the popstate event when the back button is pressed.
     */
    function addPopStateListener() {
      // Remove existing listener first to prevent duplicates.
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
     * Add focus trap to keep focus within the fullscreen container.
     */
    function addFocusTrap(container) {
      // Get all focusable elements within the container.
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      function handleTabKey(event) {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }

      container.addEventListener("keydown", handleTabKey);
      fullscreenState.focusTrapHandler = handleTabKey;
    }

    /**
     * Remove focus trap.
     */
    function removeFocusTrap() {
      const container = document.querySelector(".ec-fullscreen-container");
      if (container && fullscreenState.focusTrapHandler) {
        container.removeEventListener(
          "keydown",
          fullscreenState.focusTrapHandler
        );
        fullscreenState.focusTrapHandler = null;
      }
    }

    /**
     * Initialize the fullscreen plugin.
     */
    function initialize() {
      // Initialize zoom manager.
      zoomManager.init();

      createFullscreenContainer();
      initializeFullscreenButtons();
    }

    // Initialize the plugin.
    initialize();
  });
}

export default initECFullscreen;
