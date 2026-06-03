import { ImageCache } from './image-cache.js';
import { StyleCache } from './style-cache.js';

class ComponentUtilitiesImpl {
  imageCache = new ImageCache();
  styleCache = new StyleCache();
  /**
   * Loads stylesheets associated with a component
   * @param urls A list of stylesheet urls to load
   */
  loadStyles(...urls) {
    return this.styleCache.loadStyles(...urls);
  }
  /**
   * Preloads a list of images used by a component
   * @param urls A list of image URLs to load
   */
  preloadImages(...urls) {
    return this.imageCache.loadImages(...urls);
  }
}
const ComponentUtilities = new ComponentUtilitiesImpl();

export { ComponentUtilities };
//# sourceMappingURL=component-utilities.js.map
