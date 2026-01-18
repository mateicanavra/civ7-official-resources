import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { CityBannerComponent } from '../city-banners/city-banners.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../city-banners/city-banner-manager.chunk.js';
import '../diplomacy/diplomacy-events.js';

const BANNER_SPAWN_RADIUS = 3;
const state = {
  initialized: false,
  enabled: false,
  cityInitializedHandle: null,
  debugWidgetUpdatedHandle: null,
  fixedWorldAnchorsChangedHandle: null,
  cameraChangedHandle: null,
  container: null,
  _banners: null,
  get banners() {
    if (this._banners) {
      return this._banners;
    }
    if (!this.container) {
      return [];
    }
    const bannerElements = this.container.children;
    this._banners = new Array(bannerElements.length);
    for (let i = 0; i < bannerElements.length; i++) {
      const el = bannerElements[i];
      if (!(el instanceof ComponentRoot) || !(el.component instanceof CityBannerComponent)) {
        throw new Error("Unexcepted element in city banner stress test container.");
      }
      this._banners[i] = el.component;
    }
    return this._banners;
  },
  fixedWorldAnchorUpdateQueued: false,
  cameraChangedUpdateQueued: false,
  zoomLevel: Camera.getState().zoomLevel
};
const CityBannerDebugWidget = {
  id: "stressTestCityBanners",
  category: "Profiling",
  caption: "Stress Test City Banners",
  domainType: "bool",
  value: false
};
const Init = () => {
  if (state.initialized) {
    return;
  }
  UI.Debug.registerWidget(CityBannerDebugWidget);
  state.debugWidgetUpdatedHandle = engine.on("DebugWidgetUpdated", onDebugWidgetUpdated);
  state.initialized = true;
};
const onDebugWidgetUpdated = (id, value) => {
  if (id === CityBannerDebugWidget.id) {
    if (value) {
      console.log("Enabling city banner stress test.");
      state.enabled = true;
      start();
    } else {
      console.log("Disabling city banner stress test.");
      state.enabled = false;
      stop();
    }
  }
};
const start = () => {
  state.container = document.createElement("div");
  state.container.classList.add("city-banners-debug");
  state.cityInitializedHandle = engine.on("CityInitialized", update);
  update();
  document.body.appendChild(state.container);
};
const update = () => {
  const container = state.container;
  if (!container) {
    return;
  }
  const cities = [];
  const players = Players.getAlive();
  for (const player of players) {
    const playerCities = player.Cities?.getCities();
    if (!playerCities) {
      continue;
    }
    for (const city of playerCities) {
      cities.push(city);
    }
  }
  container.innerHTML = "";
  state._banners = null;
  const fragment = document.createDocumentFragment();
  for (const city of cities) {
    const nearbyPlots = GameplayMap.getPlotIndicesInRadius(city.location.x, city.location.y, BANNER_SPAWN_RADIUS);
    const cityID = city.id;
    const cityPlotLocation = GameplayMap.getIndexFromLocation(city.location);
    for (const plot of nearbyPlots) {
      if (plot === cityPlotLocation) {
        continue;
      }
      const banner = document.createElement("city-banner");
      banner.setAttribute("city-id", ComponentID.toString(cityID));
      banner.setAttribute("data-debug-plot-index", plot.toString());
      fragment.appendChild(banner);
    }
  }
  container.appendChild(fragment);
};
const stop = () => {
  console.log("Stopping city banner stress test.");
  state.cityInitializedHandle?.clear();
  state.cityInitializedHandle = null;
  state.fixedWorldAnchorsChangedHandle?.clear();
  state.fixedWorldAnchorsChangedHandle = null;
  state._banners = null;
  state.cameraChangedUpdateQueued = false;
  state.fixedWorldAnchorUpdateQueued = false;
  if (state.container) {
    document.body.removeChild(state.container);
    state.container = null;
  }
};

const subsystemDock = {
  id: "panel-sub-system-dock",
  category: "Systems",
  caption: "Disable Subsystem Dock",
  domainType: "bool",
  value: false
};
const panelMinimap = {
  id: "panel-mini-map",
  category: "Systems",
  caption: "Disable Minimap",
  domainType: "bool",
  value: false
};
const panelSystemBar = {
  id: "panel-system-bar",
  category: "Systems",
  caption: "Disable System Bar",
  domainType: "bool",
  value: false
};
const panelDiploRibbon = {
  id: "panel-diplo-ribbon",
  category: "Systems",
  caption: "Disable Diplomacy Ribbon",
  domainType: "bool",
  value: false
};
const panelAction = {
  id: "panel-action",
  category: "Systems",
  caption: "Disable Action Panel",
  domainType: "bool",
  value: false
};
const panelNotificationTrain = {
  id: "panel-notification-train",
  category: "Systems",
  caption: "Disable Notification Train",
  domainType: "bool",
  value: false
};
const disableHUD = {
  id: "disableHUD",
  category: "Systems",
  caption: "Disable HUD",
  domainType: "bool",
  value: false
};
UI.Debug.registerWidget(disableHUD);
const disableCityBanners = {
  id: "disableCityBanners",
  category: "Systems",
  caption: "Disable City Banners",
  domainType: "bool",
  value: false
};
UI.Debug.registerWidget(disableCityBanners);
const widgetMap = {
  [subsystemDock.id]: subsystemDock,
  [panelMinimap.id]: panelMinimap,
  [panelSystemBar.id]: panelSystemBar,
  [panelDiploRibbon.id]: panelDiploRibbon,
  [panelAction.id]: panelAction,
  [panelNotificationTrain.id]: panelNotificationTrain
};
const widgetRestoreMap = {};
const RestoreDebugWidget = (name, { parent, nextSibling }) => {
  const element = document.createElement(name);
  if (!parent) {
    console.error(`ui-disabler: No parent to restore to!`);
    return;
  }
  if (nextSibling) {
    parent.insertBefore(element, nextSibling);
  } else {
    parent.appendChild(element);
  }
};
const InitDebugWidgets = () => {
  for (const id in widgetMap) {
    const widget = widgetMap[id];
    UI.Debug.registerWidget(widget);
  }
  Init();
  engine.on("DebugWidgetUpdated", (id, value) => {
    if (id == disableHUD.id) {
      if (value) {
        ViewManager.setCurrentByName("Unset");
        ViewManager.switchToEmptyView();
      } else {
        ViewManager.setCurrentByName("World");
      }
    } else if (id == disableCityBanners.id) {
      let banners = document.querySelector("city-banners");
      let placeholder = document.querySelector('[data-placeholder-for="city-banners"]');
      if (value) {
        if (banners) {
          placeholder?.remove();
          placeholder = document.createElement("div");
          placeholder.setAttribute("data-placeholder-for", "city-banners");
          placeholder.style.display = "none";
          banners.insertAdjacentElement("afterend", placeholder);
          banners.parentElement?.removeChild(banners);
        }
      } else {
        if (placeholder) {
          banners?.remove();
          banners = document.createElement("city-banners");
          banners.classList.add("fullscreen");
          placeholder.insertAdjacentElement("beforebegin", banners);
          placeholder.parentElement?.removeChild(placeholder);
        }
      }
    } else {
      const widget = widgetMap[id];
      if (!widget) {
        return;
      }
      if (value) {
        const elements = document.getElementsByTagName(widget.id);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          widgetRestoreMap[id] ??= [];
          widgetRestoreMap[id].push({
            parent: element.parentElement,
            nextSibling: element.nextElementSibling
          });
          element.parentElement?.removeChild(element);
        }
      } else {
        const restoreStates = widgetRestoreMap[id];
        if (restoreStates) {
          for (const restoreState of restoreStates) {
            RestoreDebugWidget(widget.id, restoreState);
          }
          widgetRestoreMap[id] = [];
        }
      }
    }
  });
};

export { InitDebugWidgets };
//# sourceMappingURL=hud-debug-widgets.chunk.js.map
