import { template, className, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { Activatable } from '../../components/activatable.js';
import { RadioButtonSize } from '../../components/radio-button.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { Tab } from '../../components/tab.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './create-game-components.scss.js';
import { createRenderEffect, createComponent } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="create-game-back-button size-11"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="create-game-nav-button-inner border-2 h-11 w-40 relative flex items-center justify-center"><div class=" fxs-header uppercase text-lg font-title"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col"><div class="create-game-tab-pips-hrule mb-1"></div><div class=create-game-tab-pips-bg></div><div class="create-game-tab-pips-hrule mt-1"></div></div>`);
const CreateGameHRule2 = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    createRenderEffect((_p$) => {
      var _v$ = props.class, _v$2 = `1px solid ${props.color ?? "#4545454D"}`;
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$.style.setProperty("border-bottom", _v$2) : _el$.style.removeProperty("border-bottom"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const CreateGameHRuleComponent = (props) => {
  return (() => {
    var _el$2 = _tmpl$();
    createRenderEffect(() => className(_el$2, `create-game-hrule ${props.class ?? ""}`));
    return _el$2;
  })();
};
const CreateGameHRule = ComponentRegistry.register({
  name: "CreateGameHRule",
  createInstance: CreateGameHRuleComponent,
  styles: [style]
});
const CreateGameBackButtonComponent = (props) => {
  const context = useScreenFlowContext();
  return createComponent(Activatable, {
    onActivate: () => props.onBack ? props.onBack() : context.activatePrev(),
    "class": "relative",
    name: "CreateGameBackButton",
    disableFocus: true,
    hotkeyAction: "cancel",
    navTrayText: "LOC_GENERIC_BACK",
    audio: {
      onPress: "data-audio-back-press",
      onActivate: "data-audio-back-activate"
    },
    get children() {
      var _el$3 = _tmpl$2();
      createRenderEffect(() => className(_el$3, `p-1 border-2 border-secondary-3 bg-accent-6 ${props.class ?? ""}`));
      return _el$3;
    }
  });
};
const CreateGameBackButtton = ComponentRegistry.register({
  name: "CreateGameBackButton",
  createInstance: CreateGameBackButtonComponent,
  styles: [style]
});
const CreateGameNavButtonComponent = (props) => {
  return createComponent(Activatable, {
    get ["class"]() {
      return `create-game-nav-button-outer p-1 border-2 border-secondary-3 bg-accent-6 ${props.class ?? ""}`;
    },
    name: "CreateGameNavButton",
    get disableFocus() {
      return props.disableFocus;
    },
    get hotkeyAction() {
      return props.hotkeyAction;
    },
    get onActivate() {
      return props.onActivate;
    },
    get disabled() {
      return props.disabled;
    },
    get navTrayText() {
      return props.navTrayText;
    },
    get children() {
      var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild;
      insert(_el$5, () => props.children);
      return _el$4;
    }
  });
};
const CreateGameNavButton = ComponentRegistry.register({
  name: "CreateGameNavButton",
  createInstance: CreateGameNavButtonComponent,
  styles: [style]
});
const CreateGameTabPipsComponent = () => {
  return (() => {
    var _el$6 = _tmpl$4(), _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling;
    insert(_el$8, createComponent(Tab.TabListPips, {
      get size() {
        return RadioButtonSize.SMALL;
      }
    }));
    return _el$6;
  })();
};
const CreateGameTabPips = ComponentRegistry.register({
  name: "CreateGameTabPips",
  createInstance: CreateGameTabPipsComponent
});

export { CreateGameBackButtton, CreateGameHRule, CreateGameHRule2, CreateGameNavButton, CreateGameTabPips };
//# sourceMappingURL=create-game-components.js.map
