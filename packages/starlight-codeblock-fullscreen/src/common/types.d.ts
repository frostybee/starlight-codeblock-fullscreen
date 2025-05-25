// Define configuration options type
export default interface CodeBlockFullscreenOptions {
  /**
   * The tooltip text for the fullscreen button.
   * @default "Toggle fullscreen view"
   */
  fullscreenButtonTooltip?: string;
  /**
   * Whether to enable the escape key to exit fullscreen.
   * @default true
   */
  enableEscapeKey?: boolean;
  /**
   * Whether to enable the back button to exit fullscreen.
   * @default true
   */
  enableBackButton?: boolean;
  /**
   * Whether to only add the fullscreen button to titled blocks.
   * @default false
   */
  addToTitledBlocksOnly?: boolean;
  /**
   * The zoom level for the fullscreen view.
   * @default 150
   */
  fullscreenZoomLevel?: number;
  /**
   * The SVG path for the fullscreen button.
   * @default "M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z"
   */
  fullscreenOnSvgPath?: string;
  /**
   * The SVG path for the fullscreen button.  
   * @default "M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z"
   */
  fullscreenOffSvgPath?: string;
  /**
   * The duration of the fullscreen animation.
   * @default 150
   */
  animationDuration?: number;
  
}
