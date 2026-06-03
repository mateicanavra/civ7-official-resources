import { createSignal, onMount, onCleanup, createMemo } from '../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../ui/utilities/utilities-layout.js';
import { ModelRegistry, ModelLifecycle } from '../services/model-registry.js';

function useWindowSize() {
  const [height, setHeight] = createSignal(window.innerHeight);
  const updateHeight = () => setHeight(window.innerHeight);
  onMount(() => {
    window.addEventListener("resize", updateHeight);
  });
  onCleanup(() => {
    window.removeEventListener("resize", updateHeight);
  });
  return height;
}
function useIsSmallScreen() {
  const height = LayoutModel.get().screenHeightDownScaled;
  const isSmallScreen = createMemo(() => {
    return height() < 1e3;
  });
  return isSmallScreen;
}
function useAspectRatio() {
  const [aspectRatio, setAspectRatio] = createSignal(window.innerWidth / window.innerHeight);
  function handleResize() {
    setAspectRatio(window.innerWidth / window.innerHeight);
  }
  onMount(() => {
    window.addEventListener("resize", handleResize);
  });
  onCleanup(() => {
    window.removeEventListener("resize", handleResize);
  });
  return aspectRatio;
}
function createLayoutModel() {
  const [screenWidth, setScreenWidth] = createSignal(window.innerWidth);
  const [screenHeight, setScreenHeight] = createSignal(window.innerHeight);
  const [currentScalePx, setCurrentScalePx] = createSignal(Layout.currentScalePx());
  const [currentScale, setCurrentScale] = createSignal(Layout.currentScalePx() / BASE_FONT_SIZE);
  function handleResize() {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
    setCurrentScalePx(Layout.currentScalePx());
    setCurrentScale(Layout.currentScalePx() / BASE_FONT_SIZE);
  }
  onMount(() => {
    window.addEventListener("resize", handleResize);
  });
  onCleanup(() => {
    window.removeEventListener("resize", handleResize);
  });
  function toScaledPixels(px) {
    const scaledPx = createMemo(() => px / BASE_FONT_SIZE * currentScalePx());
    return scaledPx;
  }
  const screenWidthScaled = createMemo(() => screenWidth() / BASE_FONT_SIZE * currentScalePx());
  const screenHeightScaled = createMemo(() => screenHeight() / BASE_FONT_SIZE * currentScalePx());
  const screenWidthDownScaled = createMemo(() => screenWidth() * (1 / currentScale()));
  const screenHeightDownScaled = createMemo(() => screenHeight() * (1 / currentScale()));
  const layoutUtilities = {
    screenWidth,
    screenHeight,
    screenWidthScaled,
    screenHeightScaled,
    screenWidthDownScaled,
    screenHeightDownScaled,
    toScaledPixels
  };
  return layoutUtilities;
}
const LayoutModel = ModelRegistry.register("LayoutModel", ModelLifecycle.Singleton, createLayoutModel);

export { LayoutModel, createLayoutModel, useAspectRatio, useIsSmallScreen, useWindowSize };
//# sourceMappingURL=layout-utilities.js.map
