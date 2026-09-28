import { template } from '../../vendor/solid-js/web/dist/web.js';
import { Activatable } from './activatable.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { FocusManager } from '../services/focus-manager.js';
import { createComponent, mergeProps, createMemo, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="ssb__button-iconbg"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="ssb__button-iconbg ssb__button-iconbg--hover"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="ssb__button-iconbg ssb__button-iconbg--active"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="ssb__button-iconbg ssb__button-iconbg--disabled"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="ssb__button-icon"></div>`);
const SubSystemButtonComponent = (props) => {
  const onActivate = () => {
    props.onActivate?.();
    const focusedElement = document.activeElement;
    if (focusedElement instanceof HTMLElement) {
      FocusManager.get().clearFocus(focusedElement);
    }
  };
  return createComponent(Activatable, mergeProps(props, {
    get disableFocus() {
      return props.disableFocus ?? true;
    },
    onActivate,
    get ["class"]() {
      return `ssb__button ssb__element ${props.class ?? ""}`;
    },
    get ["data-tut-highlight"]() {
      return props.tutorialHighlight ?? "founderHighlight";
    },
    get ["data-tooltip-content"]() {
      return Locale.compose(props.tooltip);
    },
    get audio() {
      return {
        group: "audio-panel-sub-system-dock",
        onFocus: "data-audio-focus",
        onPress: "data-audio-press-small",
        onActivate: "none",
        ...props.audio
      };
    },
    get name() {
      return "SubSystemButton-" + props.name;
    },
    get children() {
      return [createMemo(() => props.children), _tmpl$(), _tmpl$2(), _tmpl$3(), _tmpl$4(), (() => {
        var _el$5 = _tmpl$5();
        createRenderEffect((_$p) => (_$p = props.bgImg) != null ? _el$5.style.setProperty("background-image", _$p) : _el$5.style.removeProperty("background-image"));
        return _el$5;
      })()];
    }
  }));
};
const SubSystemButton = ComponentRegistry.register({
  name: "SubSystemButton",
  createInstance: SubSystemButtonComponent,
  images: ["blp:hud_sub_circle_bk", "blp:hud_sub_circle_hov", "blp:hud_sub_circle_prs", "blp:hud_sub_circle_dis"]
});

export { SubSystemButton };
//# sourceMappingURL=sub-system-button.js.map
