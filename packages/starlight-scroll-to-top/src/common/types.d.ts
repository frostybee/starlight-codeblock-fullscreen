// Define configuration options type
export default interface CodeBlockFullscreenOptions {
  /**
   * The tooltip text for the fullscreen button
   * @default "Toggle fullscreen view"
   */
  fullscreenButtonTooltip?: string;
  /**
   *  Whether to enable the escape key to exit fullscreen
   * @default true
   */
  enableEscapeKey?: boolean;
  /**
   * Whether to enable the back button to exit fullscreen
   * @default true
   */
  enableBackButton?: boolean;
  /**
   * Whether to only add the fullscreen button to titled blocks
   * @default false
   */
  addToTitledBlocksOnly?: boolean;
  /**
   * The zoom level for the fullscreen view
   * @default 150
   */
  fullscreenZoomLevel?: number;
}
