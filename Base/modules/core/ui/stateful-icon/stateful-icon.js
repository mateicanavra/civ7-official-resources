var IconState = /* @__PURE__ */ ((IconState2) => {
  IconState2["Default"] = "default";
  IconState2["Hover"] = "hover";
  IconState2["Focus"] = "focus";
  IconState2["Active"] = "active";
  IconState2["Disabled"] = "disabled";
  IconState2["Pressed"] = "pressed";
  return IconState2;
})(IconState || {});
const AttributeNames = Object.values(IconState).map(
  (state) => state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`
);
const stateDefaultClassNameMap = {
  ["default" /* Default */]: ["opacity-100"],
  ["hover" /* Hover */]: ["opacity-0", "group-hover\\:opacity-100"],
  ["focus" /* Focus */]: ["opacity-0", "group-focus\\:opacity-100"],
  ["active" /* Active */]: ["opacity-0", "group-active\\:opacity-100"],
  ["pressed" /* Pressed */]: ["opacity-0", "group-pressed\\:opacity-100"],
  ["disabled" /* Disabled */]: ["opacity-0"]
};
class Controller {
  constructor(elements) {
    this.elements = elements;
  }
  /** disabled is a convenience method of setting  */
  set disabled(value) {
    this.state = value ? "disabled" /* Disabled */ : "default" /* Default */;
  }
  set state(value) {
    if (!this.isValidState(value)) {
      console.error(
        `icon-group: no state exists for ${value}. Valid states are: ${Object.keys(this.elements).join(", ")}`
      );
    }
    for (const state in this.elements) {
      this.elements[state].classList.remove("opacity-100");
    }
    if (value === "default" /* Default */) {
      for (const state in this.elements) {
        const defaultClassNames = stateDefaultClassNameMap[state];
        this.elements[state].classList.add(...defaultClassNames);
      }
    } else {
      for (const state in this.elements) {
        if (state === value) {
          this.elements[state].classList.add("opacity-100");
        } else {
          const defaultClassNames = stateDefaultClassNameMap[state];
          this.elements[state].classList.remove(...defaultClassNames);
        }
      }
    }
  }
  /** isValidState validates that the icon group has an icon for this group */
  isValidState(state) {
    return typeof state === "string" && state in this.elements;
  }
}
const Init = ({
  root,
  iconStateUrlMap,
  noGroupClass
}) => {
  root ??= document.createElement("div");
  root.classList.add("relative", "pointer-events-auto");
  if (!noGroupClass) {
    root.classList.add("group");
  }
  const elements = {};
  const urlElementMap = {};
  for (const state in iconStateUrlMap) {
    const url = iconStateUrlMap[state];
    if (!url) continue;
    const element = urlElementMap[url] ??= document.createElement("img");
    element.src = iconStateUrlMap[state];
    if (state !== "default" /* Default */) {
      element.classList.add("absolute");
    }
    element.classList.add("transition-opacity");
    if (state in stateDefaultClassNameMap) {
      const defaultClassNames = stateDefaultClassNameMap[state];
      element.classList.add(...defaultClassNames);
    }
    elements[state] = element;
    root.appendChild(element);
  }
  return [root, new Controller(elements)];
};
const FromElement = (element, noGroupClass = false) => {
  const iconStateUrlMap = UrlMapFromElementAttributes(element);
  return Init({ root: element, iconStateUrlMap, noGroupClass });
};
const UrlMapFromElementAttributes = (element) => {
  return Object.values(IconState).reduce(
    (acc, state) => {
      const attributeName = state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`;
      const iconUrl = element.getAttribute(attributeName);
      if (iconUrl) {
        acc[state] = iconUrl;
      }
      return acc;
    },
    {}
  );
};
const SetAttributes = (element, stateUrlMap) => {
  if (typeof stateUrlMap === "string") {
    element.setAttribute("data-icon", stateUrlMap);
  } else {
    for (const state in stateUrlMap) {
      const attributeName = state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`;
      const url = stateUrlMap[state];
      if (url) {
        element.setAttribute(attributeName, url);
      }
    }
  }
};

export { AttributeNames, Controller, FromElement, IconState, Init, SetAttributes, UrlMapFromElementAttributes };
//# sourceMappingURL=stateful-icon.js.map
