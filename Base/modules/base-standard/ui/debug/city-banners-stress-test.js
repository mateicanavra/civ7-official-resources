import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { CityBannerComponent } from '../city-banners/city-banners.js';

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

export { Init };
//# sourceMappingURL=city-banners-stress-test.js.map
