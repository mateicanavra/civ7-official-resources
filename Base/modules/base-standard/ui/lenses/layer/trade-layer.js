import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { TradeRoutesModel } from '../../trade-route-chooser/trade-routes-model.js';
import { O as OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.chunk.js';
import '../../../../core/ui/context-manager/display-queue-manager.js';
import '../../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../../core/ui/framework.chunk.js';
import '../../../../core/ui/input/cursor.js';
import '../../../../core/ui/input/focus-manager.js';
import '../../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../../core/ui/views/view-manager.chunk.js';
import '../../../../core/ui/panel-support.chunk.js';
import '../../../../core/ui/utilities/utilities-component-id.chunk.js';

const TRADE_RANGE_OUT_OF_RANGE_COLOR = 1426063565;
const TRADE_RANGE_AVAILABLE_COLOR = 1426115840;
const MAX_FRAMES_TO_WAIT_FOR_INIT = 960;
class TradeLensLayer {
  tradeRangeOverlayGroup = WorldUI.createOverlayGroup(
    "ContinentOverlayGroup",
    OVERLAY_PRIORITY.CONTINENT_LENS
  );
  tradeRangeOverlay = this.tradeRangeOverlayGroup.addPlotOverlay();
  initLayer() {
  }
  async initCities() {
    return new Promise((resolve) => {
      TradeRoutesModel.calculateProjectedTradeRoutes().then(
        (routes) => this.processRoutesForOverlayAsync(routes, resolve)
      );
    });
  }
  processRoutesForOverlayAsync(routes, doneCallback) {
    const outOfRangePlots = [];
    const availableCities = [];
    const total = routes.length;
    let index = 0;
    const processChunk = () => {
      const start = performance.now();
      while (index < total && performance.now() - start < MAX_FRAMES_TO_WAIT_FOR_INIT) {
        const route = routes[index++];
        const cityPlots = route.city.getPurchasedPlots();
        const plots = cityPlots.length > 0 ? cityPlots : [route.cityPlotIndex];
        if (route.status === TradeRouteStatus.SUCCESS) {
          for (const plot of plots) {
            availableCities.push(plot);
          }
        } else {
          for (const plot of plots) {
            outOfRangePlots.push(plot);
          }
        }
      }
      if (index < total) {
        requestAnimationFrame(processChunk);
      } else {
        this.finishInitCities(availableCities, outOfRangePlots);
        doneCallback(index);
      }
    };
    requestAnimationFrame(processChunk);
  }
  finishInitCities(availableCities, outOfRangePlots) {
    this.tradeRangeOverlayGroup.setVisible(false);
    this.tradeRangeOverlay.clear();
    this.tradeRangeOverlay.addPlots(outOfRangePlots, {
      fillColor: TRADE_RANGE_OUT_OF_RANGE_COLOR
    });
    this.tradeRangeOverlay.addPlots(availableCities, {
      fillColor: TRADE_RANGE_AVAILABLE_COLOR
    });
    this.tradeRangeOverlayGroup.setVisible(true);
  }
  async applyLayer() {
    await this.initCities();
    this.tradeRangeOverlayGroup.setVisible(true);
    ContextManager.push("trade-route-chooser", { singleton: true });
  }
  removeLayer() {
    this.tradeRangeOverlayGroup.setVisible(false);
    ContextManager.pop("trade-route-chooser");
  }
}
LensManager.registerLensLayer("fxs-trade-layer", new TradeLensLayer());
//# sourceMappingURL=trade-layer.js.map
