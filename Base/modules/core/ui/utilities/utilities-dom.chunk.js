const MAX_UI_SCALE = 200;
const MIN_UI_SCALE = 50;
var FontScale = /* @__PURE__ */ ((FontScale2) => {
  FontScale2[FontScale2["XSmall"] = 0] = "XSmall";
  FontScale2[FontScale2["Small"] = 1] = "Small";
  FontScale2[FontScale2["Medium"] = 2] = "Medium";
  FontScale2[FontScale2["Large"] = 3] = "Large";
  FontScale2[FontScale2["XLarge"] = 4] = "XLarge";
  return FontScale2;
})(FontScale || {});
const CreateElementTable = (root, init) => {
  const table = {};
  for (const key in init) {
    const _key = `_${key}`;
    Object.defineProperty(table, _key, { value: void 0, writable: true, enumerable: false, configurable: true });
    Object.defineProperty(table, key, {
      get: function() {
        if (this[_key] === void 0) {
          if (!root.isConnected) {
            console.error(
              `CreateElementTable: attempted to access element ${key} on a root that is not yet connected to the DOM.`
            );
          }
          this[_key] = root.querySelector(init[key]);
        }
        if (this[_key] === null) {
          throw new Error(`CreateElementTable: element ${key} not found in root element.`);
        }
        return this[_key];
      },
      set: function(value) {
        this[`_${key}`] = value;
      },
      enumerable: true,
      configurable: true
    });
  }
  return table;
};
const ElementToDebugString = (element) => {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join(".")}` : "";
  return `${tag}${id}${classes}`;
};
const MustGetElement = (selector, element) => {
  const result = element.querySelector(selector);
  if (!result) {
    const parent = element instanceof HTMLElement ? ElementToDebugString(element) : "document";
    throw new Error(`MustGetElement: element ${selector} not found in ${parent}.`);
  }
  return result;
};
const MustGetElements = (selector, element) => {
  const result = element.querySelectorAll(selector);
  if (!result.length) {
    const parent = element instanceof HTMLElement ? ElementToDebugString(element) : "document";
    throw new Error(`MustGetElements: elements ${selector} not found in ${parent}.`);
  }
  return result;
};
const RecursiveGetAttribute = (target, attr) => {
  if (target == null || target == document.body) {
    return null;
  }
  return target.getAttribute(attr) ?? RecursiveGetAttribute(target.parentElement, attr);
};
const IsElement = (element, tagName) => element instanceof HTMLElement && element.tagName.toLowerCase() === tagName;
const PassThroughAttributes = (a, b, ...attributes) => {
  attributes.forEach((attr) => {
    const value = a.getAttribute(attr);
    if (value) {
      b.setAttribute(attr, value);
    }
  });
};

export { CreateElementTable, ElementToDebugString, FontScale, IsElement, MAX_UI_SCALE, MIN_UI_SCALE, MustGetElement, MustGetElements, PassThroughAttributes, RecursiveGetAttribute };
//# sourceMappingURL=utilities-dom.chunk.js.map
