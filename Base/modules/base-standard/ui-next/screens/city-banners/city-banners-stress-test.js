import '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { createSignalFromDebugWidget } from '../../../../core/ui-next/utilities/debug-widgets.js';
import { CityBanner } from './city-banner.js';

const BANNER_SPAWN_RADIUS = 5;
const STRESS_TEST_WIDGET = {
  id: "stressTestCityBanners",
  category: "Profiling",
  caption: "Stress Test City Banners",
  domainType: "bool",
  value: false
};
function getDebugBanners(cityIds) {
  const debugBanners = [];
  const spawnedPlotIndices = /* @__PURE__ */ new Set();
  for (const cityID of cityIds) {
    const city = Cities.get(cityID);
    if (!city || !city.isValid) {
      continue;
    }
    const cityPlotIndex = GameplayMap.getIndexFromLocation(city.location);
    const nearbyPlots = GameplayMap.getPlotIndicesInRadius(city.location.x, city.location.y, BANNER_SPAWN_RADIUS);
    for (const plotIndex of nearbyPlots) {
      if (plotIndex === cityPlotIndex || spawnedPlotIndices.has(plotIndex)) {
        continue;
      }
      const location = GameplayMap.getLocationFromIndex(plotIndex);
      const owningCity = GameplayMap.getOwningCityFromXY(location.x, location.y);
      if (owningCity && !ComponentID.isInvalid(owningCity) && !ComponentID.isMatch(owningCity, cityID)) {
        continue;
      }
      debugBanners.push({
        cityID,
        location
      });
      spawnedPlotIndices.add(plotIndex);
    }
  }
  return debugBanners;
}
const CityBannersStressTest = (props) => {
  const isEnabled = createSignalFromDebugWidget(STRESS_TEST_WIDGET);
  const debugBanners = createMemo(() => isEnabled() === true ? getDebugBanners(props.cityIds) : []);
  return createComponent(For, {
    get each() {
      return debugBanners();
    },
    children: (debugBanner) => {
      const data = props.getBannerData(debugBanner.cityID);
      return data ? createComponent(CityBanner, {
        get cityID() {
          return debugBanner.cityID;
        },
        data,
        get location() {
          return debugBanner.location;
        }
      }) : null;
    }
  });
};

export { CityBannersStressTest };
//# sourceMappingURL=city-banners-stress-test.js.map
