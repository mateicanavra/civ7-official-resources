import ActionHandler from '../../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../../input/input-events.js';
import MPBrowserModel from './model-mp-browser-new.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { ChooserItem } from '../../../../base-standard/ui/chooser-item/chooser-item.js';
import styles from '../../../../base-standard/ui/chooser-item/chooser-item.scss.js';

const ActionConfirmEventName = "browser-item-action-confirm";
class ActionConfirmEvent extends CustomEvent {
  constructor() {
    super("browser-item-action-confirm", { bubbles: true, cancelable: true });
  }
}
var SortOptions = /* @__PURE__ */ ((SortOptions2) => {
  SortOptions2[SortOptions2["NONE"] = 0] = "NONE";
  SortOptions2[SortOptions2["GAME_NAME"] = 1] = "GAME_NAME";
  SortOptions2[SortOptions2["RULE_SET"] = 2] = "RULE_SET";
  SortOptions2[SortOptions2["MAP_TYPE"] = 3] = "MAP_TYPE";
  SortOptions2[SortOptions2["GAME_SPEED"] = 4] = "GAME_SPEED";
  SortOptions2[SortOptions2["PLAYERS"] = 5] = "PLAYERS";
  SortOptions2[SortOptions2["CONTENT"] = 6] = "CONTENT";
  return SortOptions2;
})(SortOptions || {});
const mapSortOptionsToFlex = {
  [0 /* NONE */]: "flex-1",
  [1 /* GAME_NAME */]: "flex-4",
  [2 /* RULE_SET */]: "flex-3",
  [3 /* MAP_TYPE */]: "flex-3",
  [4 /* GAME_SPEED */]: "flex-2",
  [5 /* PLAYERS */]: "flex-2",
  [6 /* CONTENT */]: "flex-2"
};
class MPBrowserChooserItem extends ChooserItem {
  get mpBrowserChooserNode() {
    return this._chooserNode;
  }
  set mpBrowserChooserNode(value) {
    this._chooserNode = value;
  }
  gameName;
  event;
  ruleSet;
  mapType;
  gameSpeed;
  players;
  crossplay;
  background;
  handleDoubleClick = this.onDoubleClick.bind(this);
  handleFocusIn = this.onFocusIn.bind(this);
  handleActiveDeviceChange = this.onActiveDeviceChange.bind(this);
  onInitialize() {
    super.onInitialize();
  }
  onAttach() {
    super.onAttach();
    this.gameName = MustGetElement(".mp-browser-chooser__gameName", this.Root);
    this.event = MustGetElement(".mp-browser-chooser__event", this.Root);
    this.ruleSet = MustGetElement(".mp-browser-chooser__ruleSet", this.Root);
    this.mapType = MustGetElement(".mp-browser-chooser__mapType", this.Root);
    this.gameSpeed = MustGetElement(".mp-browser-chooser__gameSpeed", this.Root);
    this.players = MustGetElement(".mp-browser-chooser__players", this.Root);
    this.crossplay = MustGetElement(".mp-browser-chooser__crossplay", this.Root);
    this.background = MustGetElement(".hud_sidepanel_list-bg", this.Root);
    this.Root.ondblclick = this.handleDoubleClick;
    this.Root.addEventListener("focusin", this.handleFocusIn);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.handleActiveDeviceChange);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.handleActiveDeviceChange);
  }
  render() {
    this.Root.innerHTML = "";
    super.render();
    const {
      gameName = "",
      eventName = "",
      ruleSet = "",
      mapType = "",
      gameSpeed = "",
      players = ""
    } = this.mpBrowserChooserNode ?? {};
    const content = document.createElement("div");
    content.classList.add("flow-row", "min-h-10", "py-1", "relative");
    content.innerHTML = `
			<div class="flow-row items-center ${mapSortOptionsToFlex[1]}">
				<div class="px-3 flex-auto flow-row items-center">
					<div class="mp-browser-chooser__event w-6 h-6 img-ba-default mr-2" data-tooltip-content="${eventName}"></div>
					<div class="mp-browser-chooser__gameName text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${gameName}"></div>
				</div>
			</div>
			<div class="flow-row items-center ${mapSortOptionsToFlex[2]}">
				<div class="px-3 mp-browser-chooser__ruleSet text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${ruleSet}"></div>
			</div>
			<div class="flow-row items-center ${mapSortOptionsToFlex[3]}">
				<div class="px-3 mp-browser-chooser__mapType text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${mapType}"></div>
			</div>
			<div class="flow-row items-center ${mapSortOptionsToFlex[4]}">
				<div class="px-3 mp-browser-chooser__gameSpeed text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${gameSpeed}"></div>
			</div>
			<div class="flow-row items-center ${mapSortOptionsToFlex[5]}">
				<div class="px-3 flex-auto flow-row items-center relative">
					<div class="w-6 h-6 img-mp-lobby-crossplay mp-browser-chooser__crossplay tint-bg-accent-2 hidden" data-icon-id="PLATFORM_UNK" data-tooltip-content="LOC_SAVE_LOAD_CROSSPLAYSAVES"></div>
					<div class="px-3 mp-browser-chooser__players text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${players}"></div>
				</div>
			</div>
			<! -- This empty div exists to provide spacing for the "content" section. It is needed to provide space for the additional content buttons in mp-browser-new.ts -->
			<div class="${mapSortOptionsToFlex[6]}"/>
		`;
    this.Root.appendChild(content);
  }
  updateData() {
    const {
      gameName = "",
      ruleSet = "",
      mapType = "",
      gameSpeed = "",
      players = ""
    } = this.mpBrowserChooserNode ?? {};
    this.gameName.setAttribute("data-l10n-id", gameName);
    this.ruleSet.setAttribute("data-l10n-id", ruleSet);
    this.mapType.setAttribute("data-l10n-id", mapType);
    this.gameSpeed.setAttribute("data-l10n-id", gameSpeed);
    this.players.setAttribute("data-l10n-id", players);
    this.players.classList.toggle("mr-9", this.Root.getAttribute("show-report") == "true");
    this.updateCrossplay();
    this.updateEvent();
    this.updateBackground();
    this.updateRoot();
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "node":
        this.mpBrowserChooserNode = newValue ? JSON.parse(newValue) : null;
        this.updateData();
        break;
      case "grayed":
        this.updateRoot();
        break;
      case "show-report":
        this.updateBackground();
        this.updateData();
        break;
    }
  }
  onActiveDeviceChange(_event) {
    this.updateRoot();
  }
  isMissingMods() {
    const { mods = [] } = this.mpBrowserChooserNode ?? {};
    const missingMods = mods.filter((mod) => !MPBrowserModel.installedMods.has(mod.modID));
    return !!missingMods.length;
  }
  isDisabled() {
    const { hostFriendID_Native = "", hostFriendID_T2GP = "" } = this.mpBrowserChooserNode ?? {};
    return this.isMissingMods() || hostFriendID_Native != "" && Online.Social.isUserBlocked(hostFriendID_Native, false) || hostFriendID_T2GP != "" && Online.Social.isUserBlocked(hostFriendID_T2GP, false);
  }
  updateRoot() {
    const { savedGame = false } = this.mpBrowserChooserNode ?? {};
    const isGrayed = this.isDisabled();
    this.Root.setAttribute("grayed", isGrayed ? "true" : "false");
    this.Root.classList.toggle("bg-primary-5", isGrayed);
    this.Root.classList.toggle("opacity-80", isGrayed);
    this.Root.setAttribute("no-border", savedGame ? "true" : "false");
    this.Root.removeAttribute("data-tooltip-content");
    this.Root.removeAttribute("data-tooltip-alternative-target");
    if (!ActionHandler.isGamepadActive) {
      const tooltipContent = this.isMissingMods() ? "LOC_UI_MP_BROWSER_MISSING_MOD_TOOLTIP" : savedGame ? "LOC_UI_MP_BROWSER_LOADING_SAVE_TOOLTIP" : "";
      if (tooltipContent) {
        this.Root.setAttribute("data-tooltip-content", tooltipContent);
      }
    }
  }
  updateBackground() {
    this.background.classList.toggle("right-10", this.Root.getAttribute("show-report") == "true");
  }
  updateEvent() {
    const { eventName = "" } = this.mpBrowserChooserNode ?? {};
    this.event.classList.toggle("hidden", !eventName);
    this.event.setAttribute("data-tooltip-content", eventName);
  }
  updateCrossplay() {
    const { hostingPlatform = HostingType.HOSTING_TYPE_UNKNOWN } = this.mpBrowserChooserNode ?? {};
    this.crossplay.classList.toggle("hidden", Network.getLocalHostingPlatform() == hostingPlatform);
  }
  onFocusIn(_event) {
    this.Root.dispatchEvent(new FocusEvent("focus"));
  }
  onDoubleClick() {
    if (this.Root.getAttribute("grayed") != "true") {
      this.Root.dispatchEvent(new ActionConfirmEvent());
    }
  }
}
Controls.define("mp-browser-chooser-item", {
  createInstance: MPBrowserChooserItem,
  description: "A chooser item to be used with the save-load screen",
  classNames: ["mp-browser-chooser-item", "chooser-item_unlocked", "relative", "flex-auto", "group"],
  styles: [styles],
  attributes: [
    { name: "node" },
    { name: "enabled-content" },
    { name: "disabled-content" },
    { name: "disabled" },
    { name: "grayed" },
    { name: "index" },
    { name: "selected" },
    { name: "no-border" },
    { name: "select-highlight" },
    { name: "show-report" }
  ]
});

export { ActionConfirmEvent, ActionConfirmEventName, MPBrowserChooserItem, SortOptions, mapSortOptionsToFlex };
//# sourceMappingURL=mp-browser-chooser-item.js.map
