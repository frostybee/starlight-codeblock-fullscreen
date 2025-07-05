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
    addToUntitledBlocks = false,
    fullscreenZoomLevel = 150,
    animationDuration = 200,
    svgPathFullscreenOn = "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z",
    svgPathFullscreenOff = "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z",
  } = config;

  document.addEventListener("DOMContentLoaded", () => {
   // Avoid duplicate initialization.
	if (window.expressiveCodeFullscreenInitialized) return;
	window.expressiveCodeFullscreenInitialized = true;

	// Mobile detection utility
	const isMobileDevice = () => {
		return (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			window.innerWidth <= 768
		); // Additional check for small screens
	};
	// Initialize fullscreen state.
	const fullscreenState = {
		isFullscreenActive: false,
		scrollPosition: 0,
		originalCodeBlock: null,
		fontSize: 100,
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
	 * Font size management for fullscreen functionality.
	 */
	const fontManager = {
		storageKey: 'expressiveCodeFullscreenFontSize',

		/**
		 * Load font size from localStorage.
		 * @returns {number} Font size percentage (100 = 100%)
		 */
		loadFontSize() {
			try {
				const savedSize = localStorage.getItem(this.storageKey);
				if (savedSize) {
					const parsedSize = parseInt(savedSize, 10);
					if (parsedSize >= 60 && parsedSize <= 500) {
						return parsedSize;
					}
				}
			} catch (e) {
				console.warn('Could not load font size from localStorage');
			}
			return 100;
		},

		/**
		 * Save font size to localStorage.
		 * @param {number} size Font size percentage
		 */
		saveFontSize(size) {
			try {
				localStorage.setItem(this.storageKey, size.toString());
			} catch (e) {
				console.warn('Could not save font size to localStorage');
			}
		},

		/**
		 * Adjust font size by a given amount.
		 * @param {number} change Amount to change font size by
		 * @param {HTMLElement} codeBlock The code block to apply font size to
		 */
		adjustFontSize(change, codeBlock) {
			const newSize = Math.max(60, Math.min(500, fullscreenState.fontSize + change));
			fullscreenState.fontSize = newSize;
			this.saveFontSize(newSize);
			this.applyFontSize(codeBlock);
		},

		/**
		 * Reset font size to default.
		 * @param {HTMLElement} codeBlock The code block to apply font size to
		 */
		resetFontSize(codeBlock) {
			fullscreenState.fontSize = 100;
			this.saveFontSize(100);
			this.applyFontSize(codeBlock);
		},

		/**
		 * Apply font size to the code block.
		 * @param {HTMLElement} codeBlock The code block to apply font size to
		 */
		applyFontSize(codeBlock) {
			if (codeBlock) {
				const scale = fullscreenState.fontSize / 100;
				codeBlock.style.setProperty('--ec-font-scale', scale);
			}
		},
	};


	// Create fullscreen container.
	function createFullscreenContainer() {
		if (document.querySelector('.cb-fullscreen__container')) return;

		const container = document.createElement('div');
		container.className = 'cb-fullscreen__container';
		container.setAttribute('role', 'dialog');
		container.setAttribute('aria-modal', 'true');
		container.setAttribute('aria-label', 'Code block in fullscreen view');
		container.setAttribute('tabindex', '-1');
		container.style.setProperty(
			'--ec-fullscreen-animation-duration',
			`${config.animationDuration}ms`
		);
		document.body.appendChild(container);
	}

	// Create font size controls.
	function createFontSizeControls() {
		const controls = document.createElement('div');
		controls.className = 'cb-fullscreen__font-controls';
		controls.innerHTML = `
			<button class="cb-fullscreen__font-btn cb-fullscreen__font-btn--decrease" aria-label="Decrease font size" title="Decrease font size (Double-click to reset)">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14"/>
				</svg>
			</button>
			<button class="cb-fullscreen__font-btn cb-fullscreen__font-btn--increase" aria-label="Increase font size" title="Increase font size">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 5v14m-7-7h14"/>
				</svg>
			</button>
		`;
		return controls;
	}

	// Create hint element for fullscreen mode.
	function createFullscreenHint() {
		const hint = document.createElement('div');
		hint.className = 'cb-fullscreen__hint';
		hint.innerHTML = 'Press <kbd>Esc</kbd> to exit full screen';
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
		if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
			return bodyBg;
		}

		// Fallback to html element.
		const fallbackBg = window.getComputedStyle(document.documentElement).backgroundColor;
		if (fallbackBg && fallbackBg !== 'rgba(0, 0, 0, 0)' && fallbackBg !== 'transparent') {
			return fallbackBg;
		}
		// Default fallback in case no background color is found.
		return '#ffffff';
	}

	// Get appropriate text color based on background.
	function getContrastTextColor(backgroundColor) {
		// Simple heuristic: if background is light, use dark text, else light text.
		const rgb = backgroundColor.match(/\d+/g);
		if (rgb && rgb.length >= 3) {
			const brightness =
				(parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
			return brightness > 128 ? '#000000' : '#ffffff';
		}
		return '#000000'; // Default to dark text.
	}

	function createFullscreenButton() {
		const button = document.createElement('button');
		button.className = 'cb-fullscreen__button';
		button.type = 'button';
		button.setAttribute('aria-label', config.fullscreenButtonTooltip);
		button.setAttribute('aria-expanded', 'false');
		button.setAttribute('data-tooltip', config.fullscreenButtonTooltip);
		// Remove native tooltip since we're using custom styled tooltip.
		// button.title = config.fullscreenButtonTooltip;

		button.innerHTML = `
      <svg class="fullscreen-on" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.svgPathFullscreenOn}" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="fullscreen-off" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="${config.svgPathFullscreenOff}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
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
		if (codeBlock.querySelector('.cb-fullscreen__button')) return;
		// Find the figure element that contains the code block.
		const captionFrame = codeBlock.querySelector('.frame');
		if (!captionFrame) return; // Exit if no frame element found.

		// Check if the code block has a title/header or is a terminal so that the toggle fullscreen button can be added to the header.
		const hasTitleArea =
			captionFrame.classList.contains('has-title') ||
			captionFrame.classList.contains('is-terminal');

		// If configured to only add to titled blocks, skip blocks without titles or terminal.
		if (!config.addToUntitledBlocks && !hasTitleArea) {
			return;
		}
		// For code blocks with titles or terminals, add button to the figcaption header.
		const blockHeader = codeBlock.querySelector('figcaption.header');
		if (hasTitleArea) {
			// For code blocks with titles or terminals, add button to the figcaption header.
			// const blockHeader = codeBlock.querySelector('figcaption.header');

			if (blockHeader) {
				const button = createFullscreenButton();

				// Ensure the header has relative positioning.
				const headerStyle = getComputedStyle(blockHeader);
				if (headerStyle.position === 'static') {
					blockHeader.style.position = 'relative';
				}
				// We need to position the button absolutely to the right of the header element (i.e. the code block's caption header).
				button.style.cssText = `
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        z-index: 100;
      `;
				blockHeader.appendChild(button);
			}
		} else {
			// For code blocks without titles, add button at the bottom right corner.
			const copyButton = codeBlock.querySelector('.copy');
			if (copyButton) {
				// Create a container for the fullscreen button
				const btnContainer = document.createElement('div');
				btnContainer.style.cssText = `
          position: absolute;
          bottom: 6px;
          right: 12px;
          z-index: 15;
          pointer-events: auto;
        `;
				const toggleButton = createFullscreenButton();
				btnContainer.appendChild(toggleButton);
				if (captionFrame.offsetHeight > 95) {
					// Add the toggle button only to code blocks whose height is greater than 95px.
					copyButton.parentNode.appendChild(btnContainer);
				}
			}
		}
	}

	// Initialize fullscreen buttons for all code blocks.
	function initializeFullscreenButtons() {
		const codeBlocks = document.querySelectorAll('.expressive-code');

		codeBlocks.forEach((block) => {
			addFullscreenButtonToBlock(block);
		});

		// Add event listeners to all fullscreen buttons.
		document.querySelectorAll('.cb-fullscreen__button').forEach((button) => {
			// Remove existing listeners to avoid duplicates.
			const newButton = button.cloneNode(true);
			button.parentNode.replaceChild(newButton, button);

			newButton.addEventListener('click', handleFullscreenClick);

			// Add keyboard support for Enter and Space keys.
			newButton.addEventListener('keydown', function (event) {
				if (event.key === 'Enter' || event.key === ' ') {
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
		const codeBlock = this.closest('.expressive-code');

		if (codeBlock) {
			toggleFullscreen(codeBlock);
		}
	}

	function toggleFullscreen(codeBlock) {
		const fullscreenContainer = document.querySelector('.cb-fullscreen__container');

		if (fullscreenState.isFullscreenActive) {
			exitFullscreen(fullscreenContainer);
		} else {
			enterFullscreen(codeBlock, fullscreenContainer);
		}
	}

	function enterFullscreen(codeBlock, fullscreenContainer) {
		// Store reference to original code block.
		fullscreenState.originalCodeBlock = codeBlock;

		// Load saved font size.
		fullscreenState.fontSize = fontManager.loadFontSize();

		// Update aria-expanded state for accessibility.
		const originalButton = codeBlock.querySelector('.cb-fullscreen__button');
		if (originalButton) {
			originalButton.setAttribute('aria-expanded', 'true');
		}

		// Clone the code block.
		const clonedBlock = codeBlock.cloneNode(true);
		clonedBlock.classList.add('cb-fullscreen__active');

		// Add event listener to exit button in fullscreen mode.
		const fullscreenButtonInClone = clonedBlock.querySelector('.cb-fullscreen__button');
		if (fullscreenButtonInClone) {
			fullscreenButtonInClone.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				toggleFullscreen(clonedBlock);
			});

			// Add keyboard support for cloned button.
			fullscreenButtonInClone.addEventListener('keydown', function (event) {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					toggleFullscreen(clonedBlock);
				}
			});
		}

		// Save current state and enter fullscreen.
		saveScrollPosition();
		setBodyOverflow(true);

		if (config.enableEscapeKey) addKeyupListener();
		if (config.exitOnBrowserBack) {
			// Push a new history state so back button can exit fullscreen
			history.pushState({ fullscreenActive: true }, '', window.location.href);
			addPopStateListener();
		}

		// Apply page background color to fullscreen container.
		const pageBackgroundColor = getPageBackgroundColor();
		const textColor = getContrastTextColor(pageBackgroundColor);
		fullscreenContainer.style.backgroundColor = pageBackgroundColor;
		fullscreenContainer.style.color = textColor;

		// Create main content wrapper.
		const contentWrapper = document.createElement('div');
		contentWrapper.className = 'cb-fullscreen__content';

		// Add font size controls.
		const fontControls = createFontSizeControls();
		contentWrapper.appendChild(fontControls);

		// Add the cloned code block.
		contentWrapper.appendChild(clonedBlock);

		// Add the content wrapper to the fullscreen container.
		fullscreenContainer.appendChild(contentWrapper);

		// Add event listeners to font controls.
		addFontControlListeners(fontControls, clonedBlock);

		// Apply initial font size.
		fontManager.applyFontSize(clonedBlock);

		// Add hint if escape key is enabled.
		if (config.enableEscapeKey) {
			const hint = createFullscreenHint();
			fullscreenContainer.appendChild(hint);

			// Auto-hide hint after 4 seconds.
			setTimeout(() => {
				if (hint && hint.parentNode) {
					// Use JavaScript to fade out smoothly, overriding CSS animation.
					hint.style.setProperty('transition', 'opacity 0.9s ease', 'important');
					hint.style.setProperty('opacity', '0', 'important');

					// Remove the hint completely after fade out completes.
					setTimeout(() => {
						if (hint && hint.parentNode) {
							hint.remove();
						}
					}, 500); // Wait for fade transition to complete.
				}
			}, 4000);
		}

		fullscreenContainer.classList.add('cb-fullscreen__container--open');
		fullscreenState.isFullscreenActive = true;

		// Focus the fullscreen container for better accessibility.
		fullscreenContainer.focus();

		// Add focus trap for modal behavior.
		addFocusTrap(fullscreenContainer);
	}

	function exitFullscreen(fullscreenContainer) {
		// Restore original state.
		setBodyOverflow(false);
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

		fullscreenContainer.classList.remove('cb-fullscreen__container--open');

		// Reset inline styles.
		fullscreenContainer.style.backgroundColor = '';
		fullscreenContainer.style.color = '';

		// Clear container contents.
		while (fullscreenContainer.firstChild) {
			fullscreenContainer.removeChild(fullscreenContainer.firstChild);
		}

		fullscreenState.isFullscreenActive = false;

		// Return focus to original code block or button (before clearing the reference).
		if (fullscreenState.originalCodeBlock) {
			const originalButton =
				fullscreenState.originalCodeBlock.querySelector('.cb-fullscreen__button');
			if (originalButton) {
				// Restore aria-expanded state.
				originalButton.setAttribute('aria-expanded', 'false');
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
		fullscreenState.scrollPosition = window.scrollY || document.documentElement.scrollTop;
	}

	/**
	 * Restore the scroll position of the page after exiting fullscreen mode.
	 */
	function restoreScrollPosition() {
		if (
			typeof fullscreenState.scrollPosition === 'number' &&
			!isNaN(fullscreenState.scrollPosition)
		) {
			setTimeout(() => {
				window.scrollTo({
					top: fullscreenState.scrollPosition,
					behavior: 'smooth',
				});
			}, 0);
		}
	}

	/**
	 * Set the body overflow to hidden when entering fullscreen mode.
	 */
	function setBodyOverflow(hidden) {
		if (hidden) {
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}
	}

	/**
	 * Handle the keyup event when the escape key is pressed.
	 */
	function handleKeyup(event) {
		if (event.key === 'Escape' && fullscreenState.isFullscreenActive) {
			const fullscreenContainer = document.querySelector('.cb-fullscreen__container');
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
		document.removeEventListener('keyup', handleKeyup);
		document.addEventListener('keyup', handleKeyup);
	}

	/**
	 * Remove the listener for the keyup event when the escape key is pressed.
	 */
	function removeKeyupListener() {
		document.removeEventListener('keyup', handleKeyup);
	}

	/**
	 * Handle the popstate event when the back button is pressed.
	 */
	function handlePopState(event) {
		if (fullscreenState.isFullscreenActive) {
			// Prevent the history.back() call in exitFullscreen from causing a loop
			const isBackButtonPressed = !event.state || !event.state.fullscreenActive;
			if (isBackButtonPressed) {
				const fullscreenContainer = document.querySelector('.cb-fullscreen__container');
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
		window.removeEventListener('popstate', handlePopState);
		window.addEventListener('popstate', handlePopState);
	}

	/**
	 * Remove the listener for the popstate event when the back button is pressed.
	 */
	function removePopStateListener() {
		window.removeEventListener('popstate', handlePopState);
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
			if (event.key === 'Tab') {
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

		container.addEventListener('keydown', handleTabKey);
		fullscreenState.focusTrapHandler = handleTabKey;
	}

	/**
	 * Remove focus trap.
	 */
	function removeFocusTrap() {
		const container = document.querySelector('.cb-fullscreen__container');
		if (container && fullscreenState.focusTrapHandler) {
			container.removeEventListener('keydown', fullscreenState.focusTrapHandler);
			fullscreenState.focusTrapHandler = null;
		}
	}

	// Add event listeners to font controls.
	function addFontControlListeners(fontControls, codeBlock) {
		const decreaseBtn = fontControls.querySelector('.cb-fullscreen__font-btn--decrease');
		const increaseBtn = fontControls.querySelector('.cb-fullscreen__font-btn--increase');
		let lastDecreaseClickTime = 0;
		const resetThreshold = 500;

		decreaseBtn.addEventListener('click', (event) => {
			const currentTime = new Date().getTime();
			if (currentTime - lastDecreaseClickTime < resetThreshold) {
				fontManager.resetFontSize(codeBlock);
			} else {
				fontManager.adjustFontSize(-10, codeBlock);
			}
			lastDecreaseClickTime = currentTime;
			event.target.blur();
		});

		increaseBtn.addEventListener('click', (event) => {
			fontManager.adjustFontSize(10, codeBlock);
			event.target.blur();
		});
	}

	/**
	 * Initialize the fullscreen plugin.
	 */
	function initialize() {
		createFullscreenContainer();
		initializeFullscreenButtons();
	}

	// Initialize the plugin.
	initialize();
 });
}

export default initECFullscreen;
