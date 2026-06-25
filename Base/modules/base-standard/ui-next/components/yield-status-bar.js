import { template, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, createRenderEffect, onMount, For, Show, mergeProps } from '../../../core/vendor/solid-js/dist/solid.js';
import { createStore } from '../../../core/vendor/solid-js/store/dist/store.js';
import { number } from '../../../core/ui/utilities/utilities-validation.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { createEngineEvent } from '../../../core/ui-next/utilities/game-core-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div data-audio-group-ref=audio-yield-panel><span class=whitespace-nowrap></span></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute h-8 fullscreen-top-outside-safezone"><div class="relative flex flex-row"></div></div>`);
const yieldBarEntryClassMap = {
  YIELD_GOLD: "text-yield-gold",
  YIELD_CULTURE: "text-yield-culture",
  YIELD_SCIENCE: "text-yield-science",
  YIELD_DIPLOMACY: "text-yield-influence",
  YIELD_HAPPINESS: "text-yield-happiness",
  YIELD_CITIES: "text-secondary",
  YIELD_CITY_CAP: "fxs-header"
};
const YieldBarEntryComponent = (props) => {
  const [isMobileViewExperience, setIsMobileViewExperience] = createSignal(false);
  const [valueText, setValueText] = createSignal("");
  const [iconUrl, setIconUrl] = createSignal("");
  createEffect(() => {
    setIsMobileViewExperience(UI.getViewExperience() === UIViewExperience.Mobile);
  });
  createEffect(() => {
    if (props.max !== void 0) {
      setValueText(`${props.yield}/${props.max}`);
      return;
    }
    const prefix = props.yield >= 0 ? "+" : "";
    if (props.stored !== void 0) {
      setValueText(`${props.stored} (${prefix}${props.yield})`);
      return;
    }
    setValueText(`${prefix}${props.yield}`);
  });
  createEffect(() => {
    setIconUrl(`url("blp:${UI.getIconBLP(props.type)}")`);
  });
  return createComponent(Tooltip.Text, {
    get text() {
      return props.tooltip;
    },
    showFiligrees: false,
    get children() {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
      insert(_el$, createComponent(Icon, {
        "class": "mr-0\\.5",
        get classList() {
          return {
            "size-8 font-title": !isMobileViewExperience(),
            "size-10 font-body-lg": isMobileViewExperience()
          };
        },
        get name() {
          return iconUrl();
        },
        isUrl: true
      }), _el$2);
      insert(_el$2, valueText);
      createRenderEffect(() => className(_el$, `flex items-center text-base font-title ${yieldBarEntryClassMap[props.type]}`));
      return _el$;
    }
  });
};
const YieldStatusBarComponent = () => {
  const [yieldBarEntries, setYieldBarEntries] = createStore({
    YIELD_GOLD: {
      type: "YIELD_GOLD",
      yield: 0,
      tooltip: "LOC_YIELD_GOLD_TREASURY"
    },
    YIELD_SCIENCE: {
      type: "YIELD_SCIENCE",
      yield: 0,
      tooltip: "LOC_YIELD_SCIENCE"
    },
    YIELD_CULTURE: {
      type: "YIELD_CULTURE",
      yield: 0,
      tooltip: "LOC_YIELD_CULTURE"
    },
    YIELD_HAPPINESS: {
      type: "YIELD_HAPPINESS",
      yield: 0,
      tooltip: "LOC_YIELD_HAPPINESS"
    },
    YIELD_DIPLOMACY: {
      type: "YIELD_DIPLOMACY",
      yield: 0,
      tooltip: "LOC_YIELD_DIPLOMACY"
    },
    YIELD_CITIES: {
      type: "YIELD_CITIES",
      yield: 0,
      tooltip: "LOC_YIELD_MAX_CITIES"
    },
    YIELD_CITY_CAP: {
      type: "YIELD_CITY_CAP",
      yield: 0,
      tooltip: "LOC_YIELD_CITY_CAP"
    }
  });
  const ResourceAssignedEvent = createEngineEvent("ResourceAssigned");
  const ResourceUnassignedEvent = createEngineEvent("ResourceUnassigned");
  const player = Players.get(GameContext.localObserverID);
  const updateYield = (type) => {
    if (!player?.Stats || !player?.Treasury || !player?.DiplomacyTreasury) {
      console.error("yield-bar.tsx::updateYield: Required player libraries were missing");
      return;
    }
    const yieldEntry = yieldBarEntries[type];
    if (!yieldEntry) {
      return;
    }
    const yieldObject = {
      type: yieldEntry.type,
      yield: yieldEntry.yield,
      tooltip: yieldEntry.tooltip
    };
    switch (type) {
      case "YIELD_GOLD": {
        yieldObject.yield = number({
          value: player.Stats.getNetYield(YieldTypes.YIELD_GOLD).toString(),
          defaultValue: 0
        });
        yieldObject.stored = number({
          value: player.Treasury.goldBalance.toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_SCIENCE": {
        yieldObject.yield = number({
          value: player.Stats.getNetYield(YieldTypes.YIELD_SCIENCE).toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_CULTURE": {
        yieldObject.yield = number({
          value: player.Stats.getNetYield(YieldTypes.YIELD_CULTURE).toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_HAPPINESS": {
        yieldObject.yield = number({
          value: player.Stats.getNetYield(YieldTypes.YIELD_HAPPINESS).toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_DIPLOMACY": {
        yieldObject.yield = number({
          value: player.Stats.getNetYield(YieldTypes.YIELD_DIPLOMACY).toString(),
          defaultValue: 0
        });
        yieldObject.stored = number({
          value: player.DiplomacyTreasury.diplomacyBalance.toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_CITIES": {
        yieldObject.yield = number({
          value: player.Stats.numSettlements.toString(),
          defaultValue: 0
        });
        yieldObject.max = number({
          value: player.Stats.settlementCap.toString(),
          defaultValue: 0
        });
        break;
      }
      case "YIELD_CITY_CAP": {
        yieldObject.yield = number({
          value: player?.Stats?.numCities.toString(),
          defaultValue: 0
        });
        yieldObject.max = number({
          value: player.Cities?.getCityLimit().toString(),
          defaultValue: 0
        });
        break;
      }
    }
    setYieldBarEntries(type, yieldObject);
  };
  const updateAllYields = () => {
    Object.keys(yieldBarEntries).forEach((key) => {
      const yieldType = key;
      updateYield(yieldType);
    });
  };
  createEffect(() => {
    const resourceAssignedEventData = ResourceAssignedEvent();
    if (!resourceAssignedEventData) {
      return;
    }
    if (resourceAssignedEventData.player != GameContext.localPlayerID) {
      return;
    }
    updateAllYields();
  });
  createEffect(() => {
    const resourceUnassignedEventData = ResourceUnassignedEvent();
    if (!resourceUnassignedEventData) {
      return;
    }
    if (resourceUnassignedEventData.player != GameContext.localPlayerID) {
      return;
    }
    updateAllYields();
  });
  onMount(() => {
    updateAllYields();
  });
  return (() => {
    var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild;
    insert(_el$4, createComponent(For, {
      get each() {
        return Object.entries(yieldBarEntries);
      },
      children: ([key, value]) => {
        if (key == "YIELD_CITY_CAP" && player?.Cities?.getCityLimit() == 0) {
          return null;
        }
        return createComponent(Show, {
          when: value,
          children: (entry) => createComponent(YieldBarEntryComponent, mergeProps(entry))
        });
      }
    }));
    return _el$3;
  })();
};
const YieldStatusBar = ComponentRegistry.register({
  name: "YieldStatusBar",
  createInstance: YieldStatusBarComponent
});

export { YieldStatusBar };
//# sourceMappingURL=yield-status-bar.js.map
