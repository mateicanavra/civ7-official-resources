import { template, addEventListener, insert, classList, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, getOwner, createComponent, createRenderEffect, Show, For, createSignal, onMount, onCleanup, createEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { RingMeter } from '../../../core/ui-next/components/ring-meter.js';
import { TooltipHorizontalPosition, TooltipVerticalPosition } from '../../../core/ui-next/components/tooltip.js';
import { TreeCardHoveredEventName, TreeCardDehoveredEventName, TreeCardActivatedEventName } from './tree-card.js';
import { TreeClassSelector, ScaleTreeCardEventName } from './tree-support.js';
import { getNodeNameFromType } from '../utilities/utilities-textprovider.js';
import { convertLegacyDepthInfo } from '../../ui-next/screens/choosers/helpers.js';
import { TechCivicTooltip } from '../../ui-next/tooltips/tech-civic-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="tree-node-icon bg-cover bg-center self-center"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="tree-card-queue-order font-body text-xs text-accent-2 mr-1 hidden"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="check-icon flex absolute size-6 bg-no-repeat bg-center bg-contain right-4 top-3 justify-center items-center"><div class="size-4 bg-center bg-contain bg-no-repeat"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<fxs-activatable class="pointer-events-auto relative tree-card-hitbox"tabindex=-1 name=TreeCard-Hitbox><div></div><div><div class="tree-card-progress flex flex-col items-center justify-center pointer-events-none relative"><div class="flex relative justify-center items-center"></div></div><div class="tree-card-name-unlocks flex flex-col flex-initial w-full justify-between"><div class="tree-card-name-container relative flex flex-row justify-between items-center"><div class="tree-card-name font-title text-base flex-initial tracking-150 truncate font-fit-shrink"></div><div class="turn-text font-body text-xs shrink-0 ml-2 mr-1"></div></div><div class="tree-card-unlocks flex items-center mt-1 pointer-events-none relative"></div></div></div></fxs-activatable>`, true, false, false), _tmpl$5 = /* @__PURE__ */ template(`<div class="unlock-item bg-no-repeat bg-contain bg-center mr-1"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<fxs-vslot class="main-container flex flex-col flex-auto pointer-events-none items-center"disablefocus></fxs-vslot>`, true, false, false);
const MASTERY_ICON_PATH = "blp:techtree_icon-II.png";
function parseNumber(v, fallback = 0) {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function parseJSON(v, fallback) {
  if (!v) return fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}
const NodeCard = (props) => {
  const iconURL = createMemo(() => props.isMastery ? MASTERY_ICON_PATH : props.depth?.iconURL ?? "");
  const isLocked = createMemo(() => props.depth?.isLocked ?? false);
  const isCompleted = createMemo(() => props.depth?.isCompleted ?? false);
  const isCurrent = createMemo(() => props.depth?.isCurrent ?? false);
  const getDisplayedProgress = (depth) => {
    if (!depth) return 0;
    if (depth.isCompleted) return 100;
    if (depth.isLocked) return 0;
    return props.progress;
  };
  const value = createMemo(() => getDisplayedProgress(props.depth));
  function dispatch(name, detail) {
    props.el.dispatchEvent(new CustomEvent(name, {
      bubbles: false,
      cancelable: true,
      detail
    }));
  }
  const onHover = () => dispatch(TreeCardHoveredEventName, {
    type: props.type,
    level: String(props.level)
  });
  const onDehover = () => dispatch(TreeCardDehoveredEventName, {
    type: props.type,
    level: String(props.level)
  });
  const onActivate = () => {
    dispatch(TreeCardActivatedEventName, {
      type: props.type,
      level: String(props.level)
    });
  };
  const showTurns = createMemo(() => !(isLocked() || isCompleted()));
  const treeTypeClass = createMemo(() => props.treeType === "culture" ? "tree-type-culture" : "tree-type-tech");
  const convertedUnlocksByDepth = createMemo(() => convertLegacyDepthInfo(props.unlocksByDepth));
  const displayName = createMemo(() => {
    const nodeType = GameInfo.ProgressionTreeNodes.lookup(Number(props.type))?.ProgressionTreeNodeType ?? "";
    const player = Players.get(GameContext.localPlayerID);
    return getNodeNameFromType(nodeType, props.level, player);
  });
  const renderContent = () => (() => {
    var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$7 = _el$4.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild, _el$11 = _el$9.nextSibling, _el$12 = _el$8.nextSibling;
    addEventListener(_el$, "action-activate", onActivate);
    _el$.addEventListener("focus", onHover);
    _el$.addEventListener("mouseleave", onDehover);
    _el$.addEventListener("mouseenter", onHover);
    _el$._$owner = getOwner();
    insert(_el$5, createComponent(RingMeter, {
      "class": "ring-size card-ring flex justify-center bg-contain bg-center flex-auto items-center absolute",
      max: 100,
      min: 0,
      get value() {
        return value();
      },
      get ringImage() {
        return props.treeType == "culture" ? 'url("blp:hud_civic_circle_rad.png")' : 'url("blp:hud_tech_circle_rad.png")';
      },
      get children() {
        var _el$6 = _tmpl$();
        createRenderEffect((_$p) => (_$p = `url(${iconURL()})`) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
        return _el$6;
      }
    }));
    insert(_el$9, createComponent(L10n.Compose, {
      get text() {
        return displayName();
      }
    }));
    insert(_el$8, createComponent(Show, {
      get when() {
        return props.level === 0;
      },
      get children() {
        var _el$10 = _tmpl$2();
        insert(_el$10, createComponent(L10n.Compose, {
          get text() {
            return props.queueOrder;
          }
        }));
        return _el$10;
      }
    }), _el$11);
    insert(_el$11, createComponent(L10n.Compose, {
      text: "LOC_NARRATIVE_TURN_TIMER",
      get args() {
        return [props.turns];
      }
    }));
    insert(_el$12, createComponent(For, {
      get each() {
        return props.depth?.unlocks ?? [];
      },
      children: (unlock) => {
        const icon = unlock.icon ? unlock.icon : UI.getIconURL("MOD_GENERIC_BONUS");
        return (() => {
          var _el$15 = _tmpl$5();
          `url(${icon})` != null ? _el$15.style.setProperty("background-image", `url(${icon})`) : _el$15.style.removeProperty("background-image");
          return _el$15;
        })();
      }
    }));
    insert(_el$3, createComponent(Show, {
      get when() {
        return isCompleted();
      },
      get children() {
        var _el$13 = _tmpl$3(), _el$14 = _el$13.firstChild;
        _el$13.style.setProperty("background-image", 'url("blp:techtree-icon-empty")');
        _el$14.style.setProperty("background-image", 'url("blp:techtree_icon-checkmark")');
        return _el$13;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = {
        [treeTypeClass()]: true,
        "current-research": isCurrent(),
        completed: isCompleted(),
        hidden: props.dummy,
        relative: !!props.isMastery,
        "-top-3": !!props.isMastery,
        "tree-card--mastery": !!props.isMastery,
        "parent-node": !props.isMastery
      }, _v$2 = `tree-card-type-${props.type}`, _v$3 = props.audio, _v$4 = isLocked(), _v$5 = String(props.level), _v$6 = props.type, _v$7 = `absolute bg-center bg-no-repeat pointer-events-none ${props.isMastery ? "tree-card__child-bg--base tree-card-child-background" : "tree-card__bg--base tree-card-background pt-px"}`, _v$8 = `card-background bg-center bg-no-repeat relative flex flex-row pointer-events-none ${props.isMastery ? "tree-card-child-bg" : "tree-card-bg pt-px"}`, _v$9 = !!isCompleted(), _v$10 = !showTurns();
      _p$.e = classList(_el$, _v$, _p$.e);
      _v$2 !== _p$.t && (_el$.id = _p$.t = _v$2);
      _v$3 !== _p$.a && (_el$.audio = _p$.a = _v$3);
      _v$4 !== _p$.o && (_el$.disablefocus = _p$.o = _v$4);
      _v$5 !== _p$.i && (_el$.dataLevel = _p$.i = _v$5);
      _v$6 !== _p$.n && (_el$.dataType = _p$.n = _v$6);
      _v$7 !== _p$.s && className(_el$2, _p$.s = _v$7);
      _v$8 !== _p$.h && className(_el$3, _p$.h = _v$8);
      _v$9 !== _p$.r && _el$9.classList.toggle("pr-6", _p$.r = _v$9);
      _v$10 !== _p$.d && _el$11.classList.toggle("hidden", _p$.d = _v$10);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0,
      h: void 0,
      r: void 0,
      d: void 0
    });
    return _el$;
  })();
  return createComponent(Show, {
    get when() {
      return !props.disableTooltip;
    },
    get fallback() {
      return renderContent();
    },
    get children() {
      return createComponent(TechCivicTooltip, {
        get node() {
          return {
            name: displayName(),
            unlocksByDepth: convertedUnlocksByDepth(),
            cost: props.cost,
            currentDepthIndex: props.level
          };
        },
        get isCulture() {
          return props.treeType === "culture";
        },
        get initialVPosition() {
          return TooltipVerticalPosition.CENTER;
        },
        get initialHPosition() {
          return TooltipHorizontalPosition.RIGHT;
        },
        allowFlip: true,
        offset: 10,
        get children() {
          return renderContent();
        }
      });
    }
  });
};
const TreeCard = (props) => {
  const type = createMemo(() => props.attrs["type"] ?? "");
  const name = createMemo(() => props.attrs["name"] ?? "");
  const queueOrder = createMemo(() => props.attrs["queue-order"] ?? "");
  const progress = createMemo(() => parseNumber(props.attrs["progress"], 0));
  const turns = createMemo(() => parseNumber(props.attrs["turns"], 0));
  const cost = createMemo(() => parseNumber(props.attrs["cost"], -1));
  const unlocksByDepth = createMemo(() => parseJSON(props.attrs["unlocks-by-depth"], []));
  const dummy = createMemo(() => (props.attrs["dummy"] ?? "false") === "true");
  const disableTooltip = createMemo(() => (props.attrs["disable-tooltip"] ?? "false") === "true");
  const treeType = createMemo(() => props.el.getAttribute("tree-type") ?? "");
  const audioGroup = createMemo(() => props.el.getAttribute("data-audio-group-ref") ?? void 0);
  const audioActivate = createMemo(() => props.el.getAttribute("data-audio-activate-ref") ?? void 0);
  const audioFocus = createMemo(() => props.el.getAttribute("data-audio-focus") ?? void 0);
  const [scale, setScale] = createSignal(1);
  const onCardScale = (ev) => {
    setScale(ev.detail?.scale ?? 1);
  };
  onMount(() => {
    props.el.classList.add("min-h-10", "w-96", TreeClassSelector.CARD);
    window.addEventListener(ScaleTreeCardEventName, onCardScale);
  });
  onCleanup(() => {
    window.removeEventListener(ScaleTreeCardEventName, onCardScale);
  });
  createEffect(() => {
    props.el.style.fontSize = `${scale()}rem`;
    props.el.classList.toggle("dummy", dummy());
  });
  const mainDepth = createMemo(() => unlocksByDepth()[0]);
  const tiers = createMemo(() => unlocksByDepth().slice(1));
  return (() => {
    var _el$16 = _tmpl$6();
    _el$16._$owner = getOwner();
    insert(_el$16, createComponent(NodeCard, {
      get depth() {
        return mainDepth();
      },
      level: 0,
      get el() {
        return props.el;
      },
      get treeType() {
        return treeType();
      },
      get dummy() {
        return dummy();
      },
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onFocus: audioFocus()
        };
      },
      get type() {
        return type();
      },
      get name() {
        return name();
      },
      get queueOrder() {
        return queueOrder();
      },
      get turns() {
        return turns();
      },
      get cost() {
        return cost();
      },
      get unlocksByDepth() {
        return unlocksByDepth();
      },
      get progress() {
        return progress();
      },
      get disableTooltip() {
        return disableTooltip();
      }
    }), null);
    insert(_el$16, createComponent(For, {
      get each() {
        return tiers();
      },
      children: (depth, i) => createComponent(NodeCard, {
        depth,
        get level() {
          return i() + 1;
        },
        isMastery: true,
        get el() {
          return props.el;
        },
        get treeType() {
          return treeType();
        },
        get dummy() {
          return dummy();
        },
        get audio() {
          return {
            group: audioGroup(),
            onActivate: audioActivate(),
            onFocus: audioFocus()
          };
        },
        get type() {
          return type();
        },
        get name() {
          return name();
        },
        get queueOrder() {
          return queueOrder();
        },
        get turns() {
          return turns();
        },
        get cost() {
          return cost();
        },
        get unlocksByDepth() {
          return unlocksByDepth();
        },
        get progress() {
          return progress();
        },
        get disableTooltip() {
          return disableTooltip();
        }
      })
    }), null);
    createRenderEffect((_$p) => (_$p = `${scale()}rem`) != null ? _el$16.style.setProperty("font-size", _$p) : _el$16.style.removeProperty("font-size"));
    return _el$16;
  })();
};
defineLegacyComponent("tree-card-v2", {
  classNames: ["tree-card"],
  tabIndex: -1,
  attrs: {
    dummy: "false",
    type: "",
    name: "",
    progress: "0",
    turns: "0",
    cost: "",
    "tooltip-type": "",
    "unlocks-by-depth": "[]",
    "queue-order": "",
    "disable-tooltip": "false"
  }
}, (attrs, el) => createComponent(TreeCard, {
  attrs,
  el
}));
//# sourceMappingURL=tree-card-v2.js.map
