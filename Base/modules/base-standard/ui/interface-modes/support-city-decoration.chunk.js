import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { O as OVERLAY_PRIORITY } from '../utilities/utilities-overlay.chunk.js';

var CityDecorationSupport;
((CityDecorationSupport2) => {
  let HighlightColors;
  ((HighlightColors2) => {
    HighlightColors2[HighlightColors2["citySelection"] = 4290747514] = "citySelection";
    HighlightColors2[HighlightColors2["urbanSelection"] = 4290747514] = "urbanSelection";
    HighlightColors2[HighlightColors2["ruralSelection"] = 4283282700] = "ruralSelection";
  })(HighlightColors = CityDecorationSupport2.HighlightColors || (CityDecorationSupport2.HighlightColors = {}));
  class Instance {
    cityOverlayGroup = null;
    cityOverlay = null;
    beforeUnloadListener = () => {
      this.onUnload();
    };
    initializeOverlay() {
      this.cityOverlayGroup = WorldUI.createOverlayGroup("CityOverlayGroup", OVERLAY_PRIORITY.PLOT_HIGHLIGHT);
      this.cityOverlay = this.cityOverlayGroup.addPlotOverlay();
      engine.on("BeforeUnload", this.beforeUnloadListener);
    }
    decoratePlots(cityID) {
      this.cityOverlayGroup?.clearAll();
      const city = Cities.get(cityID);
      if (!city) {
        console.error(`City Decoration support: Failed to find city (${ComponentID.toLogString(cityID)})!`);
        return;
      }
      this.cityOverlay?.addPlots(city.location, { edgeColor: 4290747514 /* citySelection */ });
      const cityDistricts = city.Districts;
      if (cityDistricts) {
        const districtIdsRural = cityDistricts.getIdsOfType(DistrictTypes.RURAL);
        if (districtIdsRural.length > 0) {
          const locations = Districts.getLocations(districtIdsRural);
          if (locations.length > 0) {
            this.cityOverlay?.addPlots(locations, { edgeColor: 4283282700 /* ruralSelection */ });
          }
        }
        const districtIdsUrban = cityDistricts.getIdsOfTypes([DistrictTypes.URBAN, DistrictTypes.CITY_CENTER]);
        if (districtIdsUrban.length > 0) {
          const locations = Districts.getLocations(districtIdsUrban);
          if (locations.length > 0) {
            this.cityOverlay?.addPlots(locations, { edgeColor: 4290747514 /* urbanSelection */ });
          }
        }
      }
    }
    onUnload() {
      this.clearDecorations();
    }
    clearDecorations() {
      this.cityOverlayGroup?.clearAll();
    }
  }
  CityDecorationSupport2.manager = new Instance();
})(CityDecorationSupport || (CityDecorationSupport = {}));

export { CityDecorationSupport as C };
//# sourceMappingURL=support-city-decoration.chunk.js.map
