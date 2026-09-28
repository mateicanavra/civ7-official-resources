class ImageCache {
  cachedImages = /* @__PURE__ */ new Map();
  /**
   * Loads a series of images
   * @param urls A list of urls to load
   * @returns A promise containing an array of loaded image caches
   */
  loadImages(...urls) {
    return Promise.allSettled(urls.map((u) => this.loadImage(u)));
  }
  /**
   * Load an image.
   * @param url The url of the image to be loaded.
   * @returns A promise which resolves the image cache or rejects it .
   */
  loadImage(url) {
    const foundCache = this.cachedImages.get(url);
    if (foundCache) {
      return foundCache;
    }
    const image = new Image();
    image.src = url;
    image.style.display = "none";
    image.style.position = "absolute";
    const cache = new Promise((resolve, reject) => {
      if (image.src != url) {
        console.error(`Invalid URL used to preload image - ${url}`);
        reject(new Error(`Invalid URL used to preload image - ${url}`));
      } else {
        image.addEventListener("load", () => resolve({ url, image }));
        image.addEventListener("error", (e) => {
          console.error(`Error loading image - ${url}. `, e);
          reject(e);
        });
      }
    });
    this.cachedImages.set(url, cache);
    return cache;
  }
  /**
   * Unloads all images registered with the cache
   */
  unloadAllImages() {
    this.cachedImages.clear();
  }
}

export { ImageCache };
//# sourceMappingURL=image-cache.js.map
