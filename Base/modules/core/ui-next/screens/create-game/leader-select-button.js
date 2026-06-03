import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, mergeProps, createMemo, createRenderEffect, splitProps } from '../../../vendor/solid-js/dist/solid.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Icon } from '../../components/icon.js';
import { RingMeter } from '../../components/ring-meter.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './leader-select-button.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="z-1 leader-button-ring-xp-bubble absolute bottom-0 -ml-4 left-1\\/2 flex items-center justify-center text-sm font-white"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex items-center justify-center pointer-events-none"><div class="leader-button-focus opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex items-center justify-center pointer-events-none"><div class=leader-button-selection></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="z-1 img-lock2 absolute bottom-0 size-8 -ml-4 left-1\\/2 flex items-center justify-center text-sm font-white"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex items-center justify-center pointer-events-none"></div>`);
const LeaderXpRingComponent = (props) => {
  return createComponent(Show, {
    get when() {
      return props.level > 0 && !props.isLocked;
    },
    get children() {
      return createComponent(RingMeter, {
        "class": "leader-button-ring-meter",
        get value() {
          return props.currentXp;
        },
        get min() {
          return props.prevLevelXp;
        },
        get max() {
          return props.nextLevelXp;
        },
        ringImage: 'url("blp:leaderselect_xp_fill.png")',
        get children() {
          var _el$ = _tmpl$();
          insert(_el$, () => props.level);
          return _el$;
        }
      });
    }
  });
};
const LeaderXpRing = ComponentRegistry.register("LeaderXpRing", LeaderXpRingComponent);
const LeaderPortraitComponent = (props) => {
  return createComponent(Icon, {
    get name() {
      return props.icon;
    },
    get context() {
      return props.icon == "LEADER_RANDOM" ? "CIRCLE_MASK" : "PORTRAIT_MASK";
    },
    "class": "leader-button-portrait"
  });
};
const LeaderPortrait = ComponentRegistry.register("LeaderPortrait", LeaderPortraitComponent);
const LeaderSelectButtonBaseComponent = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `leader-button-box flex items-center justify-center relative group -mx-2 ${props.class ?? ""}`;
    },
    get classList() {
      return {
        locked: props.isLocked
      };
    },
    get onFocus() {
      return props.onFocus;
    },
    name: "LeaderSelectButton",
    get children() {
      return [(() => {
        var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
        createRenderEffect(() => _el$3.classList.toggle("locked", !!props.isLocked));
        return _el$2;
      })(), (() => {
        var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild;
        createRenderEffect((_p$) => {
          var _v$ = !!props.isLocked, _v$2 = !props.isSelected;
          _v$ !== _p$.e && _el$5.classList.toggle("locked", _p$.e = _v$);
          _v$2 !== _p$.t && _el$5.classList.toggle("opacity-0", _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$4;
      })(), createMemo(() => props.children), (() => {
        var _el$6 = _tmpl$5();
        insert(_el$6, createComponent(Show, {
          get when() {
            return props.isLocked;
          },
          get children() {
            return _tmpl$4();
          }
        }));
        return _el$6;
      })()];
    }
  }));
};
const LeaderSelectButtonBase = ComponentRegistry.register({
  name: "LeaderSelectButtonBase",
  createInstance: LeaderSelectButtonBaseComponent,
  styles: [style]
});
const LeaderSelectButtonComponent = (props) => {
  const [local, other] = splitProps(props, ["isSelected", "leaderInfo", "onFocus"]);
  const leaderInfo = createMemo(() => local.leaderInfo);
  const isLocked = createMemo(() => leaderInfo().isLocked);
  const leaderNameShort = createMemo(() => {
    let leaderName = local.leaderInfo.leaderID;
    if (leaderName?.toLowerCase() == "random") {
      return "random";
    } else {
      leaderName = leaderName.split("_")[1];
      return leaderName.toLowerCase();
    }
  });
  return createComponent(AudioContextProvider, {
    segment: "LeaderSelectPortraitButton",
    get vars() {
      return {
        leaderType: leaderNameShort()
      };
    },
    get children() {
      return createComponent(LeaderSelectButtonBaseComponent, mergeProps(other, {
        get isLocked() {
          return isLocked();
        },
        get isSelected() {
          return props.isSelected;
        },
        get onFocus() {
          return props.onFocus;
        },
        get children() {
          return [(() => {
            var _el$8 = _tmpl$5();
            insert(_el$8, createComponent(LeaderPortrait, mergeProps(leaderInfo)));
            return _el$8;
          })(), (() => {
            var _el$9 = _tmpl$5();
            insert(_el$9, createComponent(LeaderXpRing, mergeProps(leaderInfo)));
            return _el$9;
          })()];
        }
      }));
    }
  });
};
const LeaderSelectButton = ComponentRegistry.register({
  name: "LeaderSelectButton",
  createInstance: LeaderSelectButtonComponent,
  styles: [style]
});

export { LeaderPortrait, LeaderSelectButton, LeaderSelectButtonBase, LeaderXpRing };
//# sourceMappingURL=leader-select-button.js.map
