import { __vitePreload } from '../../vendor/vite/preload-helper.js';

class StyleCache {
  cachedStylesheetLinks = /* @__PURE__ */ new Map();
  /**
   * Loads a series of stylesheets
   * @param urls A list of urls to load
   * @returns A promise containing an array of loaded stylesheet caches
   */
  loadStyles(...urls) {
    return Promise.all(urls.map((u) => this.loadStyle(u)));
  }
  /**
   * Load a css stylesheet.
   * @param url The url of the stylesheet to be loaded.
   * @returns A promise which resolves the stylesheet cache or rejects it .
   */
  loadStyle(url) {
    const foundCache = this.cachedStylesheetLinks.get(url);
    if (foundCache) {
      return foundCache;
    }
    const cache = new Promise((resolve, reject) => {
      if (!document.head) {
        const error = new Error(
          `style-cache - Attempted to loadStyle() before head was created. source: ${url}`
        );
        console.error(error);
        return reject(error);
      }
      if (document.querySelector(`link[href="${url}"], style[data-source="${url}"]`)) {
        const error = new Error(
          `style-cache - Attempted to loadStyle() but it is already added to the DOM. source: ${url}`
        );
        console.error(error);
        return reject(error);
      }
      try {
        if (false) {
          __vitePreload(() => import(
            /* @vite-ignore */
            `${url}?inline`
          ),true              ?[]:void 0).then((module) => {
            const styleElement = document.createElement("style");
            styleElement.textContent = module.default;
            styleElement.setAttribute("data-source", url);
            document.head.appendChild(styleElement);
            resolve({ url, element: styleElement });
          }).catch((e) => {
            console.error(`Failed to hot-load stylesheet: ${url}`, e);
            reject(e);
          });
        } else {
          const stylesheetLink = document.createElement("link");
          stylesheetLink.setAttribute("rel", "stylesheet");
          stylesheetLink.setAttribute("type", "text/css");
          stylesheetLink.setAttribute("href", url);
          stylesheetLink.onload = () => {
            resolve({ url, element: stylesheetLink });
          };
          stylesheetLink.onerror = (error) => {
            console.error(`style-cache: Error loading style - ${url}. `, error);
            reject(error);
          };
          document.head.appendChild(stylesheetLink);
        }
      } catch (error) {
        console.error(`style-cache: Error loading style - ${url}. `, error);
        reject(error);
      }
    });
    this.cachedStylesheetLinks.set(url, cache);
    return cache;
  }
}

export { StyleCache };
//# sourceMappingURL=style-cache.js.map
