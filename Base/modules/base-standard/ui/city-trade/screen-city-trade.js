import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { T as TradeRoute } from '../../../core/ui/utilities/utilities-data.chunk.js';
import { C as CityTradeData } from './model-city-trade.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame id=\"screen-city-trade-frame\">\r\n\t<div\r\n\t\tclass=\"main-container\"\r\n\t\tid=\"city-trade-main-container\"\r\n\t></div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/city-trade/screen-city-trade.css";

class ScreenCityTrade extends Panel {
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  onAttach() {
    super.onAttach();
    engine.on("TradeRouteAddedToMap", this.refresh, this);
    engine.on("TradeRouteRemovedFromMap", this.refresh, this);
    engine.on("TradeRouteChanged", this.refresh, this);
    const closeButton = document.createElement("fxs-close-button");
    closeButton.addEventListener("action-activate", () => {
      this.onClose();
    });
    this.Root.appendChild(closeButton);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const mainContainer = document.getElementById("city-trade-main-container");
    const c = mainContainer.firstElementChild;
    if (c) {
      FocusManager.setFocus(c);
    }
  }
  onDetach() {
    engine.off("TradeRouteAddedToMap", this.refresh, this);
    engine.off("TradeRouteRemovedFromMap", this.refresh, this);
    engine.off("TradeRouteChanged", this.refresh, this);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateGenericAccept();
    this.refresh();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "cancel") {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  //--------------------
  refresh() {
    CityTradeData.update();
    if (CityTradeData.cityID) {
      const city = Cities.get(CityTradeData.cityID);
      if (city) {
        const frame = document.getElementById("screen-city-trade-frame");
        frame.setAttribute("subtitle", Locale.compose(city.name));
        const mainContainer = document.getElementById(
          "city-trade-main-container"
        );
        while (mainContainer.firstChild) {
          mainContainer.removeChild(mainContainer.firstChild);
        }
        if (city.Resources == null) {
          return;
        }
        {
          const yieldsContainer = document.createElement("div");
          yieldsContainer.classList.add("market-item-container");
          for (let i = 0; i < CityTradeData.yields.length; i++) {
            const yieldData = CityTradeData.yields[i];
            if (yieldData.value > 0) {
              const yieldInfo = GameInfo.Yields.lookup(i);
              if (yieldInfo) {
                const yieldItemContainer = document.createElement("div");
                yieldItemContainer.classList.add("market-yield-container");
                const yieldValueElem = document.createElement("div");
                yieldValueElem.classList.add("value");
                yieldValueElem.innerHTML = "+" + yieldData.value.toFixed(1) + " " + Locale.compose(yieldInfo.Name);
                yieldItemContainer.appendChild(yieldValueElem);
                yieldsContainer.appendChild(yieldItemContainer);
              }
            }
          }
          mainContainer.appendChild(yieldsContainer);
        }
        {
          const cityResourcesLabel = document.createElement("div");
          cityResourcesLabel.classList.add("section-header");
          cityResourcesLabel.textContent = Locale.compose("LOC_UI_CITY_TRADE_LOCAL_RESOURCES");
          mainContainer.appendChild(cityResourcesLabel);
          const producedResourcesContainer = document.createElement("div");
          producedResourcesContainer.classList.add("resource-container");
          const noLocalResources = document.createElement("div");
          noLocalResources.textContent = Locale.compose("LOC_UI_CITY_TRADE_LOCAL_PRODUCTION");
          producedResourcesContainer.appendChild(noLocalResources);
          mainContainer.appendChild(producedResourcesContainer);
        }
        const tradePartnersContainer = document.createElement("div");
        tradePartnersContainer.classList.add("resource-container");
        const partnersSubheader = document.createElement("div");
        partnersSubheader.classList.add("section-subheader");
        partnersSubheader.textContent = Locale.compose("LOC_UI_CITY_TRADE_PARTNERS_SUBHEADER");
        tradePartnersContainer.appendChild(partnersSubheader);
        let bHasActiveTrade = false;
        const routes = city.Trade.routes;
        if (routes.length > 0) {
          for (const route of routes) {
            const myRoutePayload = TradeRoute.getCityPayload(route, city.id);
            if (myRoutePayload && myRoutePayload.resourceValues.length > 0) {
              bHasActiveTrade = true;
              const partnerCity = TradeRoute.getOppositeCity(route, city.id);
              if (partnerCity) {
                const partnerName = document.createElement("div");
                partnerName.classList.add("resource-name");
                partnerName.textContent = Locale.compose(partnerCity.name);
                tradePartnersContainer.appendChild(partnerName);
              }
              for (const resourceValue of myRoutePayload.resourceValues) {
                const resourceElem = this.buildResourceElement(resourceValue);
                tradePartnersContainer.appendChild(resourceElem);
              }
            }
          }
        }
        if (!bHasActiveTrade) {
          const noPartners = document.createElement("div");
          noPartners.textContent = Locale.compose("LOC_UI_CITY_TRADE_NO_PARTNERS");
          tradePartnersContainer.appendChild(noPartners);
        }
        mainContainer.appendChild(tradePartnersContainer);
      }
    }
  }
  //--------------------
  buildResourceElement(resource) {
    const resourceContainer = document.createElement("div");
    resourceContainer.classList.add("resource");
    const resourceNameElem = document.createElement("div");
    resourceNameElem.classList.add("resource-name");
    resourceNameElem.textContent = resource.value + " " + Game.Resources.getUniqueResourceName(resource.uniqueResource);
    resourceContainer.appendChild(resourceNameElem);
    GameInfo.Resource_YieldChanges.forEach((v) => {
      const resourceHash = Database.makeHash(v.ResourceType);
      if (resourceHash == resource.uniqueResource.resource) {
        const yieldInfo = GameInfo.Yields.lookup(v.YieldType);
        if (yieldInfo) {
          const yieldElem = document.createElement("div");
          yieldElem.classList.add("resource-yield");
          yieldElem.textContent = (v.YieldChange * resource.value).toFixed(1) + " " + Locale.compose(yieldInfo.Name);
          resourceContainer.appendChild(yieldElem);
        }
      }
    });
    return resourceContainer;
  }
  onClose() {
    ContextManager.popIncluding(this.Root.tagName);
  }
}
Controls.define("screen-city-trade", {
  createInstance: ScreenCityTrade,
  description: "View City resources and trade routes",
  classNames: ["screen-city-trade"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-city-trade.js.map
