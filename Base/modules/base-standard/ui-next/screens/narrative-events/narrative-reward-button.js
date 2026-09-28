import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show, createRenderEffect, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="w-full flex flex-1 flex-col text-center justify-center align-items min-h-16"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute w-8 h-full -left-9 flex flex-col justify-center"><div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute w-full h-2 -mb-px ml-18 bottom-0"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="justify-center align-center h-18 w-18"><div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="w-full h-full pointer-events-none"></div></div>`);
const NarrativeRewardButton = (props) => {
  const storyType = createMemo(() => props.storyType ?? "LIGHT");
  const nonQuestIcons = createMemo(() => props.icons.filter((icon) => icon.RewardIconType != "QUEST"));
  const hasQuestIcon = createMemo(() => props.icons.some((icon) => icon.RewardIconType == "QUEST"));
  const hasNegativeReward = createMemo(() => nonQuestIcons().some((icon) => icon.Negative));
  const rewardButtonFrameStyle = {
    background: "none",
    "border-image-source": 'url("blp:hud_sidepanel_list-bg")',
    "border-image-slice": "8 8 8 8 fill",
    "border-image-width": `${Layout.pixels(8)}`,
    "border-image-outset": "0"
  };
  const iconSizeClass = createMemo(() => {
    const count = nonQuestIcons().length;
    if (count <= 1) return "w-12 h-12";
    if (count == 2) return "w-9 h-9";
    return "w-7 h-7";
  });
  const iconBackground = (icon) => {
    let prefix = "NAR_REW_";
    if (icon.Negative) {
      prefix += "NEG_";
    }
    const narrativeIcon = UI.getIconCSS(`${prefix}${icon.RewardIconType}`, "DEFAULT");
    if (narrativeIcon != "") {
      return narrativeIcon;
    }
    return UI.getIconCSS(icon.RewardIconType, "DEFAULT");
  };
  return createComponent(Activatable, {
    name: "NarrativeRewardButton",
    get ["class"]() {
      return `relative flex flex-row-reverse w-full items-center group ${storyType() == "LIGHT" ? "mb-4" : "mb-5"}`;
    },
    get classList() {
      return {
        "opacity-50": !props.canAfford
      };
    },
    style: rewardButtonFrameStyle,
    get ["data-audio-group-ref"]() {
      return props.audioGroup;
    },
    "data-audio-focus-ref": "data-audio-choice-focus",
    get ["data-audio-press-ref"]() {
      return props.canAfford ? void 0 : "data-audio-error-press";
    },
    get ["data-audio-activate-ref"]() {
      return props.canAfford ? void 0 : "none";
    },
    get onActivate() {
      return props.onActivate;
    },
    get children() {
      return [_tmpl$(), (() => {
        var _el$2 = _tmpl$3();
        insert(_el$2, createComponent(L10n.Stylize, {
          get ["class"]() {
            return `w-full justify-center font-body-sm pl-2 pr-6 ${storyType() == "LIGHT" ? "py-0\\.5" : "py-2"}`;
          },
          get text() {
            return props.mainText;
          }
        }), null);
        insert(_el$2, createComponent(Show, {
          get when() {
            return props.actionText || props.rewardText;
          },
          get children() {
            var _el$3 = _tmpl$2();
            _el$3.style.setProperty("border-top", "1px solid rgba(182, 172, 157, 0.5)");
            insert(_el$3, createComponent(Show, {
              get when() {
                return props.rewardText;
              },
              get children() {
                return createComponent(L10n.Stylize, {
                  "class": "font-body-xs mt-1 mb-2 text-accent-3",
                  get text() {
                    return props.rewardText;
                  }
                });
              }
            }), null);
            insert(_el$3, createComponent(Show, {
              get when() {
                return props.actionText;
              },
              get children() {
                return createComponent(L10n.Stylize, {
                  get ["class"]() {
                    return `font-body-xs mt-2 ${hasNegativeReward() ? "text-negative" : "text-accent-3"}`;
                  },
                  get text() {
                    return props.actionText;
                  }
                });
              }
            }), null);
            createRenderEffect(() => className(_el$3, `w-full pr-4 pl-1 ${storyType() == "LIGHT" ? "py-0\\.5" : "py-2"}`));
            return _el$3;
          }
        }), null);
        insert(_el$2, createComponent(Show, {
          get when() {
            return props.leaderCiv == "LEADERCIV";
          },
          get children() {
            var _el$4 = _tmpl$2();
            _el$4.style.setProperty("background-image", 'url("blp:popup_silver_laurels")');
            _el$4.style.setProperty("background-position", "50% 50%");
            _el$4.style.setProperty("background-repeat", "no-repeat");
            _el$4.style.setProperty("background-size", "contain");
            _el$4.style.setProperty("pointer-events", "none");
            createRenderEffect(() => className(_el$4, `absolute w-full h-full opacity-15 ${storyType() == "LIGHT" ? "left-14" : "left-16"}`));
            return _el$4;
          }
        }), null);
        createRenderEffect(() => _el$2.classList.toggle("mb-2", !!hasNegativeReward()));
        return _el$2;
      })(), createComponent(Show, {
        get when() {
          return hasQuestIcon();
        },
        get children() {
          var _el$5 = _tmpl$4(), _el$6 = _el$5.firstChild;
          _el$6.style.setProperty("background-image", 'url("blp:nar_quest_indicator")');
          _el$6.style.setProperty("background-position", "50%");
          _el$6.style.setProperty("background-repeat", "no-repeat");
          _el$6.style.setProperty("background-size", "contain");
          createRenderEffect((_p$) => {
            var _v$ = Layout.pixels(30), _v$2 = Layout.pixels(30);
            _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$6.style.setProperty("width", _v$) : _el$6.style.removeProperty("width"));
            _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$6.style.setProperty("height", _v$2) : _el$6.style.removeProperty("height"));
            return _p$;
          }, {
            e: void 0,
            t: void 0
          });
          return _el$5;
        }
      }), createComponent(Show, {
        get when() {
          return hasNegativeReward();
        },
        get children() {
          var _el$7 = _tmpl$5();
          _el$7.style.setProperty("background-image", 'url("blp:nar_reg_negative")');
          _el$7.style.setProperty("background-position", "50%");
          _el$7.style.setProperty("background-repeat", "no-repeat");
          _el$7.style.setProperty("background-size", "cover");
          return _el$7;
        }
      }), createComponent(Show, {
        get when() {
          return nonQuestIcons().length > 0;
        },
        get children() {
          var _el$8 = _tmpl$6(), _el$9 = _el$8.firstChild;
          _el$8.style.setProperty("background-image", 'url("blp:hud_civics-icon_frame")');
          _el$8.style.setProperty("background-position", "50%");
          _el$8.style.setProperty("background-size", "cover");
          insert(_el$9, createComponent(For, {
            get each() {
              return nonQuestIcons();
            },
            children: (icon, index) => (() => {
              var _el$10 = _tmpl$7(), _el$11 = _el$10.firstChild;
              _el$11.style.setProperty("background-position", "50% 50%");
              _el$11.style.setProperty("background-repeat", "no-repeat");
              _el$11.style.setProperty("background-size", "100% 100%");
              createRenderEffect((_p$) => {
                var _v$3 = `self-center ${iconSizeClass()} ${nonQuestIcons().length == 2 && index() == 1 ? "-ml-3" : ""} ${nonQuestIcons().length > 2 && index() > 1 ? "-mt-2" : ""} ${nonQuestIcons().length > 2 && (index() == 1 || index() == 3) ? "-ml-2" : ""}`, _v$4 = iconBackground(icon);
                _v$3 !== _p$.e && className(_el$10, _p$.e = _v$3);
                _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$11.style.setProperty("background-image", _v$4) : _el$11.style.removeProperty("background-image"));
                return _p$;
              }, {
                e: void 0,
                t: void 0
              });
              return _el$10;
            })()
          }));
          createRenderEffect(() => className(_el$9, `w-18 h-full flex flex-row flex-wrap justify-center content-center ${nonQuestIcons().length > 2 ? "p-3" : "p-1"}`));
          return _el$8;
        }
      })];
    }
  });
};

export { NarrativeRewardButton };
//# sourceMappingURL=narrative-reward-button.js.map
