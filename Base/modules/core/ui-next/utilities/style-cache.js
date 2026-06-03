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
        reject(error);
      }
      if (document.querySelector(`link[href="${url}"]`)) {
        const error = new Error(
          `style-cache - Attempted to loadStyle() before head was created. source: ${url}`
        );
        console.error(error);
        reject(error);
      }
      try {
        const stylesheetLink = document.createElement("link");
        stylesheetLink.setAttribute("rel", "stylesheet");
        stylesheetLink.setAttribute("type", "text/css");
        stylesheetLink.setAttribute("href", url);
        stylesheetLink.onload = () => {
          resolve({ url, stylesheetLink });
        };
        stylesheetLink.onerror = (error) => {
          console.error(`style-cache: Error loading style - ${url}. `, error);
          reject(error);
        };
        document.head.appendChild(stylesheetLink);
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
