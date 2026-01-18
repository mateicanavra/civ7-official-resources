import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../input/action-handler.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { U as UpdateGate } from '../../utilities/utilities-update-gate.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { ChooserItem } from '../../../../base-standard/ui/chooser-item/chooser-item.js';
import { c as chooserItemStyles } from '../../../../base-standard/ui/chooser-item/chooser-item.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../input/focus-manager.js';
import '../../audio-base/audio-support.chunk.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../navigation-tray/model-navigation-tray.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';
import '../../utilities/utilities-network-constants.chunk.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';

const MultiplayerGameListQueryCompleteEventName = "mp-game-list-query-complete";
class MultiplayerGameListQueryCompleteEvent extends CustomEvent {
  constructor(detail) {
    super("mp-game-list-query-complete", { bubbles: false, cancelable: true, detail });
  }
}
const MultiplayerGameListQueryDoneEventName = "mp-game-list-query-done";
class MultiplayerGameListQueryDoneEvent extends CustomEvent {
  constructor(detail) {
    super("mp-game-list-query-done", { bubbles: false, cancelable: true, detail });
  }
}
const MultiplayerGameListQueryErrorEventName = "mp-game-list-query-error";
class MultiplayerGameListQueryErrorEvent extends CustomEvent {
  constructor(detail) {
    super("mp-game-list-query-error", { bubbles: false, cancelable: true, detail });
  }
}
class MPBrowserDataModel {
  static instance;
  GameList = [];
  installedMods = /* @__PURE__ */ new Map();
  modulesToExclude = /* @__PURE__ */ new Set();
  constructor() {
    engine.on("MultiplayerGameListClear", this.onMultiplayerGameListClear, this);
    engine.on("MultiplayerGameListUpdated", this.onMultiplayerGameListUpdated, this);
    engine.on("MultiplayerGameListComplete", this.onMultiplayerGameListComplete, this);
    engine.on("MultiplayerGameListError", this.onMultiplayerGameListError, this);
    const excludedModIds = Modding.getModulesToExclude();
    for (const mod of excludedModIds) {
      this.modulesToExclude.add(mod);
    }
  }
  /**
   * Using an update gate for the model so it isn't set to be updated on the same
   * frame as when a possible update just occurred, as this can cause lock up from
   * an infinitiely dirty model.
   */
  updateGate = new UpdateGate(() => {
    engine.updateWholeModel(this);
  });
  update(props) {
    let tagForUpdateGate = "nothing_set";
    let isSet = false;
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
      if (!isSet) {
        tagForUpdateGate = key;
        isSet = true;
      }
    });
    this.updateGate.call(tagForUpdateGate);
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!MPBrowserDataModel.instance) {
      MPBrowserDataModel.instance = new MPBrowserDataModel();
    }
    return MPBrowserDataModel.instance;
  }
  pushDummyGameList() {
    this.GameList = [];
    for (let i = 0; i < 10; i++) {
      this.GameList.push({
        roomID: i + 100,
        serverNameOriginal: "Bradley's Game " + i,
        serverNameDisplay: "Bradley's Game " + i,
        numPlayers: 3,
        maxPlayers: 6,
        gameSpeedName: "Online",
        gameSpeed: 0,
        mapDisplayName: "SomeMapScript",
        mapSizeName: "TeenyTiny",
        mapSizeType: 0,
        ruleSetName: "BaseGameDawg",
        savedGame: false,
        liveEvent: "",
        disabledContent: [],
        mods: [],
        hostingPlatform: HostingType.HOSTING_TYPE_UNKNOWN,
        hostFriendID_Native: "",
        hostFriendID_T2GP: "",
        hostName_1P: "",
        hostName_2K: ""
      });
    }
  }
  initGameList(serverType) {
    return Network.initGameList(serverType);
  }
  refreshGameList() {
    const mods = Modding.getInstalledMods();
    this.installedMods.clear();
    for (const mod of mods) {
      this.installedMods.set(mod.id, mod);
    }
    return Network.refreshGameList();
  }
  onMultiplayerGameListClear(_data) {
    this.GameList = [];
    if (MultiplayerShellManager.unitTestMP) {
      this.pushDummyGameList();
    }
  }
  onMultiplayerGameListUpdated(data) {
    const {
      roomID = 0,
      serverNameOriginal = "",
      serverNameDisplay = "",
      numPlayers = 0,
      maxPlayers = 0,
      gameSpeedName = "",
      gameSpeed = 0,
      mapDisplayName = "",
      mapSizeName = "",
      mapSizeType = 0,
      ruleSetName = "",
      savedGame = false,
      liveEvent = "",
      enabledMods = [],
      hostingPlatform = HostingType.HOSTING_TYPE_UNKNOWN,
      hostFriendID_Native = "",
      hostFriendID_T2GP = "",
      hostName_1P = "",
      hostName_2K = ""
    } = Network.getGameListEntry(data.idLobby) ?? {};
    const filteredMods = enabledMods.filter((mod) => !this.modulesToExclude.has(mod.modID));
    const filteredInstalledMods = new Map(
      [...this.installedMods].filter(
        (mod) => !this.modulesToExclude.has(mod[1].id) && Modding.getModProperty(mod[1].handle, "ShowInBrowser") != "0"
      )
    );
    const disabledContent = [];
    const mods = [];
    for (const mod of filteredMods) {
      const installedMod = filteredInstalledMods.get(mod.modID);
      if (!installedMod || !installedMod.official) {
        mods.push(mod);
      }
    }
    filteredInstalledMods.forEach((installedMod) => {
      if (installedMod.official && !filteredMods.find((enabledMod) => enabledMod.modID == installedMod.id)) {
        disabledContent.push(installedMod);
      }
    });
    disabledContent.sort((a, b) => Locale.compare(a.name, b.name));
    mods.sort((a, b) => Locale.compare(a.name, b.name));
    this.GameList.push({
      roomID,
      serverNameOriginal,
      serverNameDisplay,
      numPlayers,
      maxPlayers,
      gameSpeedName,
      gameSpeed,
      mapDisplayName,
      mapSizeName,
      mapSizeType,
      ruleSetName,
      savedGame,
      liveEvent,
      disabledContent,
      mods,
      hostingPlatform,
      hostFriendID_Native,
      hostFriendID_T2GP,
      hostName_1P,
      hostName_2K
    });
    window.dispatchEvent(new MultiplayerGameListQueryDoneEvent(data));
  }
  onMultiplayerGameListComplete(data) {
    window.dispatchEvent(new MultiplayerGameListQueryCompleteEvent(data));
  }
  onMultiplayerGameListError(data) {
    window.dispatchEvent(new MultiplayerGameListQueryErrorEvent(data));
  }
}
const MPBrowserModel = MPBrowserDataModel.getInstance();
engine.whenReady.then(() => {
  engine.createJSModel("g_MPBrowserModel", MPBrowserModel);
});

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
  SortOptions2[SortOptions2["CONTENT"] = 5] = "CONTENT";
  SortOptions2[SortOptions2["PLAYERS"] = 6] = "PLAYERS";
  return SortOptions2;
})(SortOptions || {});
const mapSortOptionsToFlex = {
  [0 /* NONE */]: "flex-1",
  [1 /* GAME_NAME */]: "flex-4",
  [2 /* RULE_SET */]: "flex-4",
  [3 /* MAP_TYPE */]: "flex-3",
  [4 /* GAME_SPEED */]: "flex-3",
  [5 /* CONTENT */]: "flex-2",
  [6 /* PLAYERS */]: "flex-2"
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
  gamepadTooltip;
  dlcs;
  mods;
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
    this.gamepadTooltip = MustGetElement(".mp-browser-chooser__gamepad-toolip", this.Root);
    this.dlcs = MustGetElement(".mp-browser-chooser__dlcs", this.Root);
    this.mods = MustGetElement(".mp-browser-chooser__mods", this.Root);
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
      disabledContent = [],
      mods = [],
      players = ""
    } = this.mpBrowserChooserNode ?? {};
    const content = document.createElement("div");
    const index = this.Root.getAttribute("index");
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
					<div class="absolute mp-browser-chooser__gamepad-toolip mp-browser-chooser__gamepad-toolip-${index}"></div>
					<div class="${mods.length ? "" : "hidden"} pointer-events-auto mp-browser-chooser__dlcs img-dlc-icon w-8 h-8 mr-2"></div>
					<div class="${disabledContent.length ? "" : "hidden"} pointer-events-auto mp-browser-chooser__mods img-action-upgrade w-8 h-8 -scale-100"></div>
				</div>
			</div>
			<div class="flow-row items-center justify-end ${mapSortOptionsToFlex[6]}">
				<div class="w-6 h-6 img-mp-lobby-crossplay mp-browser-chooser__crossplay tint-bg-accent-2 hidden" data-icon-id="PLATFORM_UNK" data-tooltip-content="LOC_SAVE_LOAD_CROSSPLAYSAVES"></div>
				<div class="px-3 mp-browser-chooser__players text-base font-body-base text-accent-2 max-w-full truncate" data-l10n-id="${players}"></div>
			</div>
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
    this.updateDlcs();
    this.updateMods();
    this.updateGamepadTooltip();
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
  getModName(mod, treatAsUGC) {
    if (treatAsUGC) {
      const safeModName = "LOC_UI_TOOLTIP_MODS";
      return Locale.fromUGC(safeModName, Locale.compose(mod.name));
    } else {
      return Locale.compose(mod.name);
    }
  }
  getStylizedModsTooltipContent(mods, treatAsUGC) {
    return `${mods.length ? `[STYLE:text-gradient-secondary][STYLE:tracking-100][STYLE:uppercase][STYLE:font-title-sm]${Locale.compose("LOC_UI_TOOLTIP_MODS")}[/S][/S][/S][/S][N]
			${mods.map(
      (dlc) => `
				${MPBrowserModel.installedMods.has(dlc.modID) ? "[STYLE:text-accent-3]" : "[STYLE:text-negative]"}[STYLE:font-body-sm]${this.getModName(dlc, treatAsUGC)}[/S][N]
			`
    ).join("")}` : ""}`;
  }
  getStylizedDisabledContentTooltipContent(disableContent, treatAsUGC) {
    return `${disableContent.length ? `[STYLE:text-gradient-secondary][STYLE:tracking-100][STYLE:uppercase][STYLE:font-title-sm]${Locale.compose("LOC_UI_TOOLTIP_DISABLED_CONTENT")}[/S][/S][/S][/S][N]
			${disableContent.map((dlc) => `[STYLE:text-accent-3][STYLE:font-body-sm]${this.getModName(dlc, treatAsUGC)}[/S][/S][N]`).join("")}` : ""}`;
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
    } else {
      const index = this.Root.getAttribute("index");
      this.Root.setAttribute("data-tooltip-alternative-target", `mp-browser-chooser__gamepad-toolip-${index}`);
    }
  }
  updateGamepadTooltip() {
    const {
      disabledContent = [],
      mods = [],
      savedGame = false,
      eventName = "",
      hostingPlatform = HostingType.HOSTING_TYPE_UNKNOWN,
      hostDisplayName = ""
    } = this.mpBrowserChooserNode ?? {};
    const tooltipContent = `
			${hostDisplayName ? `[STYLE:text-gradient-secondary][STYLE:font-title-sm][STYLE:tracking-100][STYLE:font-body-base]${hostDisplayName}[/S][/S][/S][/S][N]` : ""}
			${Network.getLocalHostingPlatform() != hostingPlatform ? `[STYLE:accent-2][STYLE:font-body-sm]${Locale.compose("LOC_SAVE_LOAD_CROSSPLAYSAVES")}[/S][/S][N]` : ""}
			${eventName ? `[STYLE:accent-2][STYLE:font-body-sm]${Locale.compose(eventName)}[/S][/S][N]` : ""}
			${savedGame ? `[STYLE:accent-2][STYLE:font-body-sm]${Locale.compose("LOC_UI_MP_BROWSER_LOADING_SAVE_TOOLTIP")}[/S][/S][N]` : ""}
			${this.getStylizedDisabledContentTooltipContent(disabledContent, false)}
			${this.getStylizedModsTooltipContent(mods, true)}
		`;
    this.gamepadTooltip.setAttribute("data-tooltip-content", tooltipContent);
  }
  updateBackground() {
    this.background.classList.toggle("right-9", this.Root.getAttribute("show-report") == "true");
  }
  updateDlcs() {
    const { disabledContent = [] } = this.mpBrowserChooserNode ?? {};
    this.dlcs.setAttribute("data-tooltip-anchor", "bottom");
    const tooltipContent = this.getStylizedDisabledContentTooltipContent(disabledContent, false);
    if (tooltipContent) {
      this.dlcs.setAttribute("data-tooltip-content", tooltipContent);
    } else {
      this.dlcs.removeAttribute("data-tooltip-content");
    }
    this.dlcs.classList.toggle("hidden", !disabledContent.length);
  }
  updateMods() {
    const { mods = [] } = this.mpBrowserChooserNode ?? {};
    this.mods.setAttribute("data-tooltip-anchor", "bottom");
    const tooltipContent = this.getStylizedModsTooltipContent(mods, true);
    if (tooltipContent) {
      this.mods.setAttribute("data-tooltip-content", tooltipContent);
    } else {
      this.mods.removeAttribute("data-tooltip-content");
    }
    this.mods.classList.toggle("hidden", !mods.length);
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
  styles: [chooserItemStyles],
  attributes: [
    { name: "node" },
    { name: "disabled" },
    { name: "grayed" },
    { name: "index" },
    { name: "selected" },
    { name: "no-border" },
    { name: "select-highlight" },
    { name: "show-report" }
  ]
});

export { ActionConfirmEvent, ActionConfirmEventName, MultiplayerGameListQueryCompleteEventName as M, MPBrowserChooserItem, SortOptions, MultiplayerGameListQueryDoneEventName as a, MultiplayerGameListQueryErrorEventName as b, MPBrowserModel as c, mapSortOptionsToFlex };
//# sourceMappingURL=mp-browser-chooser-item.js.map
