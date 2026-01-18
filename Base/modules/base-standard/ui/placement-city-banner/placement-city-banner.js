import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/framework.chunk.js';

const styles = "fs://game/base-standard/ui/placement-city-banner/placement-city-banner.css";

const UpdatePlacementCityBannerEventName = "update-placement-city-banner";
class UpdatePlacementCityBannerEvent extends CustomEvent {
  constructor(cityName) {
    super(UpdatePlacementCityBannerEventName, { bubbles: false, cancelable: true, detail: { cityName } });
  }
}
class PlacementCityBanner extends Panel {
  cityNameDiv = document.createElement("div");
  onUpdatePlacementCityBannerListener = this.onUpdatePlacementCityBanner.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    const cityID = UI.Player.getHeadSelectedCity();
    if (ComponentID.isValid(cityID)) {
      this.updateCityName(cityID);
    }
    this.Root.listenForWindowEvent(UpdatePlacementCityBannerEventName, this.onUpdatePlacementCityBannerListener);
  }
  onDetach() {
    super.onDetach();
  }
  render() {
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    this.Root.classList.add("flex", "self-center", "mt-7");
    const leftFiligree = document.createElement("div");
    leftFiligree.className = "img-hud-chal-bk w-10 -scale-100";
    leftFiligree.classList.toggle("h-14", !isMobile);
    leftFiligree.classList.toggle("h-16", isMobile);
    this.Root.appendChild(leftFiligree);
    const innerContainer = document.createElement("div");
    innerContainer.className = "flex -mx-2\\.5 my-1 items-center";
    this.Root.appendChild(innerContainer);
    this.cityNameDiv.className = "pt-2 px-8 text-lg tracking-100 font-title font-bold uppercase placement-city-banner__name placement-city-banner__name-bg";
    this.cityNameDiv.classList.toggle("pb-3", !isMobile);
    this.cityNameDiv.classList.toggle("pb-2", isMobile);
    innerContainer.appendChild(this.cityNameDiv);
    const rightFiligree = document.createElement("div");
    rightFiligree.className = "img-hud-chal-bk w-10";
    rightFiligree.classList.toggle("h-14", !isMobile);
    rightFiligree.classList.toggle("h-16", isMobile);
    this.Root.appendChild(rightFiligree);
  }
  updateCityName(cityID) {
    const city = Cities.get(cityID);
    if (!city) {
      return;
    }
    this.cityNameDiv.textContent = city.name;
  }
  onUpdatePlacementCityBanner(event) {
    this.cityNameDiv.textContent = event.detail.cityName;
  }
}
Controls.define("placement-city-banner", {
  createInstance: PlacementCityBanner,
  description: "",
  classNames: ["placement-city-banner"],
  styles: [styles]
});

export { UpdatePlacementCityBannerEvent, UpdatePlacementCityBannerEventName };
//# sourceMappingURL=placement-city-banner.js.map
