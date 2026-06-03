import Panel from '../../../core/ui/panel-support.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import styles from './placement-city-banner.scss.js';

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
    this.Root.classList.add("flex", "self-center", "mt-7");
    const leftFiligree = document.createElement("div");
    leftFiligree.className = "img-hud-chal-bk w-10 h-16 -scale-100";
    this.Root.appendChild(leftFiligree);
    const innerContainer = document.createElement("div");
    innerContainer.className = "flex -mx-2\\.5 my-1 items-center";
    this.Root.appendChild(innerContainer);
    this.cityNameDiv.className = "pt-2 pb-2 px-8 text-lg tracking-100 font-title font-bold uppercase placement-city-banner__name placement-city-banner__name-bg";
    innerContainer.appendChild(this.cityNameDiv);
    const rightFiligree = document.createElement("div");
    rightFiligree.className = "img-hud-chal-bk w-10 h-16";
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
