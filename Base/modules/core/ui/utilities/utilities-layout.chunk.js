const COMPACT_HEIGHT_THRESHOLD = 1e3;
var Layout;
((Layout2) => {
  function pixels(pxValue) {
    return `${(0, Layout2.pixelsValue)(pxValue)}rem`;
  }
  Layout2.pixels = pixels;
  function isCompact() {
    return window.innerHeight < pixelsToScreenPixels(COMPACT_HEIGHT_THRESHOLD);
  }
  Layout2.isCompact = isCompact;
  Layout2.pixelsValue = (px) => GlobalScaling.pixelsToRem(px);
  Layout2.pixelsText = (px) => GlobalScaling.createPixelsTextClass(px);
  function textSizeToScreenPixels(fontSizeName) {
    return pixelsToScreenPixels(GlobalScaling.getFontSizePx(fontSizeName));
  }
  Layout2.textSizeToScreenPixels = textSizeToScreenPixels;
  function pixelsToScreenPixels(pxValue) {
    return GlobalScaling.remToScreenPixels(GlobalScaling.pixelsToRem(pxValue));
  }
  Layout2.pixelsToScreenPixels = pixelsToScreenPixels;
})(Layout || (Layout = {}));

export { Layout as L };
//# sourceMappingURL=utilities-layout.chunk.js.map
