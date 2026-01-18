var FontScale = /* @__PURE__ */ ((FontScale2) => {
  FontScale2[FontScale2["XSmall"] = 0] = "XSmall";
  FontScale2[FontScale2["Small"] = 1] = "Small";
  FontScale2[FontScale2["Medium"] = 2] = "Medium";
  FontScale2[FontScale2["Large"] = 3] = "Large";
  FontScale2[FontScale2["XLarge"] = 4] = "XLarge";
  return FontScale2;
})(FontScale || {});
const BASE_FONT_SIZE = 18;
const DEFAULT_W = 1920;
const DEFAULT_H = 1080;
const DEFAULT_ASPECT_W = 16;
const DEFAULT_ASPECT_H = 9;
const SCALING_RES_W = [3840, 2560];
const SCALING_RES_H = [2160, 1440];
const BASE_CURSOR_SIZE = 32;
const MEDIA_RES_H = 1e3;
const MEDIA_RES_W = MEDIA_RES_H * DEFAULT_ASPECT_W / DEFAULT_ASPECT_H;
const getOrderedFontFamily = (fonts) => {
  const locale = Locale.getCurrentDisplayLocale();
  let index = 0;
  switch (locale) {
    case "zh_Hans_CN":
      index = 1;
      break;
    case "zh_Hant_HK":
      index = 2;
      break;
    case "ja_JP":
      index = 3;
      break;
    case "ko_KR":
      index = 4;
      break;
  }
  const reorderedFonts = [...fonts];
  const swap = reorderedFonts[index];
  reorderedFonts[index] = reorderedFonts[0];
  reorderedFonts[0] = swap;
  return reorderedFonts;
};
const TITLE_FONTS = getOrderedFontFamily(["TitleFont", "TitleFont-SC", "TitleFont-TC", "TitleFont-JP", "TitleFont-KR"]);
const BODY_FONTS = getOrderedFontFamily(["BodyFont", "BodyFont-SC", "BodyFont-TC", "BodyFont-JP", "BodyFont-KR"]);
class GlobalScalingImpl {
  globalScale = Configuration.getUser().uiGlobalScale;
  globalScaleStyleNode = document.createElement("style");
  fontSizesStyleNode = document.createElement("style");
  mediaFontSizesStyleNode = document.createElement("style");
  globalCssRulesList;
  fontSizesCssRulesList;
  mediaFontSizesCssRulesList;
  fontScale = Configuration.getUser().uiFontScale;
  autoScale = Configuration.getUser().uiAutoScale;
  currentScalePx = BASE_FONT_SIZE;
  currentBasis = 0;
  readyResolve = null;
  readyPromise = new Promise((resolve, _reject) => {
    this.readyResolve = resolve;
  });
  fontScales = /* @__PURE__ */ new Map([
    [0 /* XSmall */, 16],
    [1 /* Small */, 18],
    [2 /* Medium */, 20],
    [3 /* Large */, 22],
    [4 /* XLarge */, 24]
  ]);
  // The different font size classes that will be generated
  // The px unit is the desired pixel size that will be generated at "Small" font scale
  fontSizes = [
    { name: "2xs", px: 12 },
    { name: "xs", px: 14 },
    { name: "sm", px: 16 },
    { name: "base", px: 18 },
    { name: "lg", px: 22 },
    { name: "xl", px: 26 },
    { name: "2xl", px: 32 }
  ];
  mediaQueryFontSizes = [
    { prefix: "sm:", mediaQuery: `max-height: ${this.pixelsToRem(1e3)}rem`, fontSizes: [] }
  ];
  constructor() {
    engine.whenReady.then(this.createStylesheets.bind(this));
  }
  get whenReady() {
    return this.readyPromise;
  }
  getNearestPixelsFontSize(pixelsAtSmallScale) {
    return this.fontSizes.reduce(
      (p, c) => Math.abs(c.px - pixelsAtSmallScale) < Math.abs(p.px - pixelsAtSmallScale) ? c : p
    );
  }
  createPixelsTextClass(sizeInPxAtSmallScale) {
    const found = this.fontSizes.find((f) => f.px == sizeInPxAtSmallScale);
    if (found) {
      return `text-${found.name}`;
    }
    const name = `custom${sizeInPxAtSmallScale}`;
    this.fontSizes.push({ name, px: sizeInPxAtSmallScale });
    this.updateFontSizes();
    return `text-${name}`;
  }
  getNearestMediaPixelsFontSize(pixelsAtSmallScale, mediaQuery = `max-height: ${this.pixelsToRem(1e3)}rem`) {
    const mediaQueryEntry = this.mediaQueryFontSizes.find((m) => m.mediaQuery == mediaQuery);
    return mediaQueryEntry?.fontSizes.reduce(
      (p, c) => Math.abs(c.px - pixelsAtSmallScale) < Math.abs(p.px - pixelsAtSmallScale) ? c : p
    );
  }
  createMediaTextClass(sizeInPxAtSmallScale, prefix, mediaQuery = `max-height: ${this.pixelsToRem(1e3)}rem`) {
    let mediaQueryIndex = this.mediaQueryFontSizes.findIndex(
      (m) => m.mediaQuery == mediaQuery && m.prefix == prefix
    );
    if (mediaQueryIndex === -1) {
      const mediaQueryEntry = { prefix, mediaQuery, fontSizes: [] };
      mediaQueryIndex = this.mediaQueryFontSizes.push(mediaQueryEntry);
    }
    const foundMediaQuery = this.mediaQueryFontSizes[mediaQueryIndex];
    const foundFontSize = foundMediaQuery.fontSizes.find((f) => f.px == sizeInPxAtSmallScale);
    if (foundFontSize) {
      return `text-${foundFontSize.name}`;
    }
    const name = `custom${sizeInPxAtSmallScale}`;
    foundMediaQuery.fontSizes.push({ name, px: sizeInPxAtSmallScale });
    this.updateMediaQueryFontSizes();
    return `text-${name}`;
  }
  createStylesheets() {
    console.log("Loading - Generating dynamic stylesheets");
    this.globalScaleStyleNode.setAttribute("id", "style-global");
    this.fontSizesStyleNode.setAttribute("id", "style-font-sizes");
    this.mediaFontSizesStyleNode.setAttribute("id", "style-media-font-sizes");
    document.head.appendChild(this.globalScaleStyleNode);
    document.head.appendChild(this.fontSizesStyleNode);
    document.head.appendChild(this.mediaFontSizesStyleNode);
    for (const sheet of document.styleSheets) {
      const sheetId = sheet.ownerNode?.id;
      switch (sheetId) {
        case "style-global":
          this.globalCssRulesList = sheet;
          break;
        case "style-font-sizes":
          this.fontSizesCssRulesList = sheet;
          break;
        case "style-media-font-sizes":
          this.mediaFontSizesCssRulesList = sheet;
          break;
      }
    }
    this.updateScales();
    engine.on("UIFontScaleChanged", this.onFontScaleChange.bind(this));
    engine.on("UIGlobalScaleChanged", this.onGlobalScaleChange.bind(this));
    window.addEventListener("resize", this.onResolutionChange.bind(this));
    if (this.readyResolve != null) {
      this.readyResolve();
      this.readyResolve = null;
    }
    window.dispatchEvent(new CustomEvent("global-scaling-ready"));
  }
  onResolutionChange() {
    this.updateScales();
  }
  onFontScaleChange() {
    const newScale = Configuration.getUser().uiFontScale;
    if (newScale != this.fontScale) {
      this.fontScale = newScale;
      this.updateFontSizes();
      this.updateMediaQueryFontSizes();
    }
  }
  onGlobalScaleChange() {
    let requiresUpdate = false;
    const newAutoScale = Configuration.getUser().uiAutoScale;
    if (newAutoScale != this.autoScale) {
      this.autoScale = newAutoScale;
      requiresUpdate = true;
    }
    const newScale = Configuration.getUser().uiGlobalScale;
    if (newScale != this.globalScale) {
      this.globalScale = newScale;
      requiresUpdate = true;
    }
    if (requiresUpdate) {
      this.updateScales(true);
    }
  }
  pixelsToRem(value) {
    return value / BASE_FONT_SIZE;
  }
  remToScreenPixels(value) {
    return value * this.currentScalePx;
  }
  getFontSizePx(fontSizeName) {
    const fontSize = this.fontSizes.find((f) => f.name === fontSizeName);
    const fontScalePx = this.fontScales.get(this.fontScale) ?? this.fontScales.get(1 /* Small */);
    return fontScalePx + (fontSize.px - BASE_FONT_SIZE);
  }
  generateFontSizeRule(fontScalePx, fontSize) {
    const fontSizeOffset = fontSize.px - BASE_FONT_SIZE;
    const fontSizeRem = this.pixelsToRem(fontScalePx + fontSizeOffset);
    return `font-size: ${fontSizeRem}rem;`;
  }
  getFontSizeInScreenPixels(fontScalePx, fontSizePx) {
    const fontSizeOffset = fontSizePx - BASE_FONT_SIZE;
    const fontSizeRem = this.pixelsToRem(fontScalePx + fontSizeOffset);
    return `${this.remToScreenPixels(fontSizeRem)}px`;
  }
  generateFontSizeRules(fontSizes, prefix = "", indent = "") {
    const rules = [];
    const fontScalePx = this.fontScales.get(this.fontScale) ?? this.fontScales.get(1 /* Small */);
    const titleFontValue = TITLE_FONTS.join(", ");
    const bodyFontValue = BODY_FONTS.join(", ");
    for (const fontSize of fontSizes) {
      const fontSizeRule = this.generateFontSizeRule(fontScalePx, fontSize);
      rules.push(`${indent}.${prefix}text-${fontSize.name} { ${fontSizeRule} }`);
      rules.push(`${indent}.${prefix}font-title-${fontSize.name} {
				font-family: ${titleFontValue};
				${fontSizeRule} 
			}`);
      rules.push(`${indent}.${prefix}font-body-${fontSize.name} {
				font-family: ${bodyFontValue};
				${fontSizeRule} 
			}`);
    }
    rules.push(`${indent}.font-title { font-family: ${titleFontValue}; }`);
    rules.push(`${indent}.font-body { font-family: ${bodyFontValue}; }`);
    const minFontSize = Math.min(...fontSizes.map((f) => f.px));
    const minFontSizePx = this.getFontSizeInScreenPixels(fontScalePx, minFontSize);
    for (const fontFit of ["fill", "shrink"]) {
      rules.push(`${indent}.font-fit-${fontFit} { coh-font-fit-min-size: ${minFontSizePx}; }`);
    }
    return rules;
  }
  updateScales(sendResizeEvent) {
    this.updateGlobalScale();
    UI.setGlobalScale(this.getCurrentScale());
    this.updateMediaQueryFontSizes();
    this.updateFontSizes();
    if (sendResizeEvent) {
      waitForLayout(() => {
        window.dispatchEvent(new CustomEvent("resize"));
      });
    }
  }
  getCurrentScale() {
    return this.autoScale ? this.currentBasis * 100 : this.globalScale;
  }
  clearCssRuleList(ruleList) {
    while (ruleList.cssRules.length > 0) {
      ruleList.deleteRule(0);
    }
  }
  addCssRules(ruleList, rules) {
    for (const rule of rules) {
      ruleList.insertRule(rule);
    }
  }
  replaceCssRules(ruleList, rules) {
    this.clearCssRuleList(ruleList);
    this.addCssRules(ruleList, rules);
  }
  calculateBasis(dimension, dimensionDefault, media, breakpoints) {
    for (const breakpoint of breakpoints) {
      if (dimension > media * breakpoint / dimensionDefault) {
        return breakpoint / dimensionDefault;
      }
    }
    return 1;
  }
  updateGlobalScale() {
    let newScalePx;
    let newCursorScalePx;
    if (this.autoScale) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const wRatio = width / DEFAULT_ASPECT_W;
      const hRatio = height / DEFAULT_ASPECT_H;
      this.currentBasis = hRatio <= wRatio ? this.calculateBasis(height, DEFAULT_H, MEDIA_RES_H, SCALING_RES_H) : this.calculateBasis(width, DEFAULT_W, MEDIA_RES_W, SCALING_RES_W);
      newScalePx = this.currentBasis * BASE_FONT_SIZE;
      newCursorScalePx = this.currentBasis * BASE_CURSOR_SIZE;
    } else {
      newScalePx = this.globalScale / 100 * BASE_FONT_SIZE;
      newCursorScalePx = this.globalScale / 100 * BASE_CURSOR_SIZE;
    }
    console.log(`Updating global UI scale styles to ${(newScalePx / BASE_FONT_SIZE * 100).toFixed(2)}%`);
    this.currentScalePx = newScalePx;
    const rules = [`html { font-size: ${newScalePx}px; }`];
    this.replaceCssRules(this.globalCssRulesList, rules);
    UI.setCursorSize({ i: newCursorScalePx, j: newCursorScalePx });
  }
  updateFontSizes() {
    console.log("Updating UI font scale styles");
    const rules = this.generateFontSizeRules(this.fontSizes);
    this.replaceCssRules(this.fontSizesCssRulesList, rules);
  }
  updateMediaQueryFontSizes() {
    console.log("Updating UI media font scale styles");
    const rules = [];
    for (const mediaQuery of this.mediaQueryFontSizes) {
      const rules2 = this.generateFontSizeRules(mediaQuery.fontSizes, mediaQuery.prefix, "  ");
      rules2.push(`@media (${mediaQuery}){
${rules2.join("\n")}
}`);
    }
    this.replaceCssRules(this.mediaFontSizesCssRulesList, rules);
  }
}
const GlobalScaling = new GlobalScalingImpl();
//# sourceMappingURL=global-scaling.js.map
