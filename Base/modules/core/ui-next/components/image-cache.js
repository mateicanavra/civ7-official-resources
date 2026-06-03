import '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createSignal, createEffect, createMemo, onCleanup, createResource, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { createSignalFromExistingDebugWidget } from '../utilities/debug-widgets.js';
import { ImageCache } from '../utilities/image-cache.js';

UI.Debug.registerWidget({
  caption: "Disable caching from '<ImageCacheProvider>'",
  category: "Debug",
  domainType: "bool",
  id: "disableImageCacheProvider",
  value: false
});
const ImageCacheContext = createContext({
  registerImages: () => {
  },
  updateImages: () => {
  }
});
const useImageCache = () => useContext(ImageCacheContext);
function stripCSS(url) {
  if (url.startsWith("url(")) {
    url = url.slice(4, -1).replace(/["']/g, "");
  }
  return url;
}
function arraysEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((v, i) => v == b[i]);
}
const ImageCacheProvider = (props) => {
  const cache = new ImageCache();
  const imageMap = /* @__PURE__ */ new Map();
  const imageSet = /* @__PURE__ */ new Set();
  const [urls, setUrls] = createSignal([]);
  const disableImageCache = createSignalFromExistingDebugWidget("disableImageCacheProvider");
  let updateImageTaskQueued = false;
  let updateImageTaskWork = [];
  createEffect(() => {
    if (disableImageCache()) {
      cache.unloadAllImages();
      imageMap.clear();
    }
  });
  const activeUrls = createMemo(() => {
    if (!disableImageCache()) {
      return urls();
    } else {
      return [];
    }
  });
  onCleanup(() => {
    updateImageTaskWork = [];
    cache.unloadAllImages();
    imageMap.clear();
  });
  function updateImagesTask() {
    updateImageTaskQueued = false;
    let needsUpdate = false;
    for (const work of updateImageTaskWork) {
      const allImages = [];
      for (const imageOrFunction of work.images) {
        if (typeof imageOrFunction == "function") {
          allImages.push(...imageOrFunction());
        } else {
          allImages.push(imageOrFunction);
        }
      }
      imageMap.set(work.id, allImages.map((url) => stripCSS(url)));
      for (const image of allImages) {
        if (!imageSet.has(image)) {
          needsUpdate = true;
          break;
        }
      }
    }
    updateImageTaskWork = [];
    if (needsUpdate) {
      imageSet.clear();
      imageMap.forEach((images2) => {
        for (const image of images2) {
          imageSet.add(image);
        }
      });
      const values = [...imageSet].sort();
      if (!arraysEquals(values, urls())) {
        setUrls(values);
      }
    }
  }
  function updateImages(id, images2) {
    updateImageTaskWork.push({
      id,
      images: images2
    });
    if (updateImageTaskQueued == false) {
      updateImageTaskQueued = true;
      queueMicrotask(updateImagesTask);
    }
  }
  function registerImages(id, images2) {
    if (imageMap.has(id)) {
      return;
    }
    updateImages(id, images2);
  }
  const [images] = createResource(activeUrls, async (urls2) => {
    UI.Debug.markImagesAsPreloaded(urls2);
    await cache.loadImages(...urls2);
  });
  return createComponent(ImageCacheContext.Provider, {
    value: {
      registerImages,
      updateImages,
      images
    },
    get children() {
      return props.children;
    }
  });
};
const ImageCacheTrigger = () => {
  const {
    images
  } = useImageCache();
  return createMemo(() => images?.() && null);
};

export { ImageCacheContext, ImageCacheProvider, ImageCacheTrigger, useImageCache };
//# sourceMappingURL=image-cache.js.map
