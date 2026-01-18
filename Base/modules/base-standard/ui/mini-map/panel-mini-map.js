import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager, { ContextManagerEvents } from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import { CursorUpdatedEventName } from '../../../core/ui/input/cursor.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { L as LensManager, a as LensActivationEventName, b as LensLayerEnabledEventName, c as LensLayerDisabledEventName } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { SocialPanelOpenEventName } from '../../../core/ui/shell/mp-staging/mp-friends.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';

class MiniMapModel {
  static _Instance;
  static getInstance() {
    if (!MiniMapModel._Instance) {
      MiniMapModel._Instance = new MiniMapModel();
    }
    return MiniMapModel._Instance;
  }
  setLensDisplayOption(lens, value) {
    UI.setOption("user", "Interface", lens, value);
  }
  getLensDisplayOption(lens) {
    return UI.getOption("user", "Interface", lens);
  }
  setDecorationOption(decorLayer, value) {
    const convValue = value ? 1 : 0;
    UI.setOption("user", "Gameplay", LensManager.getLayerOption(decorLayer), convValue);
    Configuration.getUser().saveCheckpoint();
  }
  getDecorationOption(decorLayer) {
    const intval = UI.getOption(
      "user",
      "Gameplay",
      LensManager.getLayerOption(decorLayer)
    );
    return intval != 0;
  }
}
const MiniMapData = MiniMapModel.getInstance();
engine.whenReady.then(() => {
  engine.createJSModel("g_MiniMap", MiniMapData);
});

const styles = "fs://game/base-standard/ui/mini-map/panel-mini-map.css";

class MinimapSubpanel extends Panel {
  constructor(root) {
    super(root);
  }
  close() {
    super.close();
  }
}
class Subpanel {
  button;
  panel;
  container = document.createElement("div");
  tag;
  constructor(tag) {
    this.container.classList.add("mini-map__lens-panel-container", "scale-0");
    this.tag = tag;
  }
}
class PanelMiniMap extends Panel {
  SMALL_SCREEN_MODE_MAX_HEIGHT = 768;
  SMALL_SCREEN_MODE_MAX_WIDTH = 1800;
  chatPanelState = false;
  lensPanelState = false;
  subpanels = [];
  activeSubpanel = null;
  subpanelContainer = document.createElement("div");
  miniMapChatButton = this.createMinimapChatButton();
  miniMapLensButton = this.createButton("LOC_UI_TOGGLE_LENS_PANEL", "blp:action_lookout.png", () => {
    return this.toggleLensPanel();
  });
  miniMapRadialButton = this.createMinimapRadialButton();
  miniMapButtonRow;
  chatPanelNavHelp = document.createElement("div");
  radialNavHelpContainer = document.createElement("div");
  lensActionNavHelpContainer = document.createElement("div");
  toggleLensActionNavHelp = document.createElement("fxs-nav-help");
  chatPanel = document.createElement("div");
  lensPanel = document.createElement("div");
  lensPanelComponent;
  chatScreen;
  multiplayerChatHandle = null;
  miniMapTopContainer = document.createElement("fxs-vslot");
  mapHighlight = document.createElement("div");
  mapImage = null;
  mapLastCursor = null;
  lastCursorPos = { x: 0, y: 0 };
  lastMinimapPos = { x: 0, y: 0 };
  mapHeight = 0;
  mapWidth = 0;
  mapTopBorderTiles = 2;
  mapBottomBorderTiles = 2;
  showHighlightListener = this.onShowHighlight.bind(this);
  hideHighlightListener = this.onHideHighlight.bind(this);
  resizeListener = this.onResize.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  toggleMiniMapListener = this.onToggleMiniMap.bind(this);
  hideMiniMapListener = this.onHideMiniMap.bind(this);
  minimapImageEngineInputListener = this.onMinimapImageEngineInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  engineInputCaptureListener = this.onEngineInputCapture.bind(this);
  activeLensChangedListener = this.onActiveLensChanged.bind(this);
  cursorUpdatedListener = this.onCursorUpdated.bind(this);
  socialPanelOpenedListener = this.onSocialPanelOpened.bind(this);
  choosersVisible = 0;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.Auto;
    this.mapHeight = GameplayMap.getGridHeight();
    this.mapWidth = GameplayMap.getGridWidth();
  }
  onInitialize() {
    const container = document.createElement("fxs-vslot");
    container.setAttribute("reverse-navigation", "");
    container.setAttribute("focus-rule", "last");
    container.classList.add("mini-map-container");
    this.Root.appendChild(container);
    this.miniMapTopContainer.classList.add("mini-map__main");
    this.miniMapTopContainer.setAttribute("ignore-prior-focus", "");
    this.miniMapTopContainer.setAttribute("id", "mm-top-container");
    this.mapImage = document.createElement("div");
    this.mapImage.role = "tooltip";
    this.mapImage.classList.add("mini-map__image");
    this.mapImage.setAttribute("data-tooltip-content", Locale.compose("LOC_UI_MINI_MAP_CLICK_TO_NAVIGATE"));
    this.mapImage.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    this.mapImage.setAttribute("data-audio-activate-ref", "data-audio-minimap-clicked-map");
    this.miniMapTopContainer.appendChild(this.mapImage);
    this.mapImage.addEventListener(InputEngineEventName, this.minimapImageEngineInputListener);
    window.addEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
    this.miniMapButtonRow = document.createElement("div");
    this.miniMapButtonRow.classList.add("mini-map__button-row");
    this.toggleLensActionNavHelp.setAttribute("action-key", "inline-open-lens-panel");
    this.toggleLensActionNavHelp.classList.add("absolute", "top-1");
    this.lensActionNavHelpContainer.appendChild(this.toggleLensActionNavHelp);
    Databind.classToggle(this.lensActionNavHelpContainer, "hidden", `!{{g_NavTray.isInputWorld}}`);
    this.miniMapLensButton.appendChild(this.lensActionNavHelpContainer);
    this.miniMapButtonRow.appendChild(this.miniMapLensButton);
    this.miniMapTopContainer.appendChild(this.miniMapButtonRow);
    this.lensPanel.classList.add("mini-map__lens-panel-container", "scale-0");
    container.appendChild(this.lensPanel);
    container.appendChild(this.subpanelContainer);
    container.appendChild(this.miniMapTopContainer);
    const miniMapRightContainer = document.createElement("div");
    miniMapRightContainer.classList.add("absolute", "left-full", "bottom-4");
    const saveIndicator = document.createElement("save-indicator");
    miniMapRightContainer.appendChild(saveIndicator);
    if (Configuration.getGame().isAnyMultiplayer && Network.hasCommunicationsPrivilege(false)) {
      this.miniMapChatButton.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
      this.miniMapChatButton.setAttribute("data-audio-press-ref", "data-audio-minimap-panel-open-press");
      this.miniMapButtonRow.appendChild(this.miniMapChatButton);
      const closeChatNavHelp = document.createElement("fxs-nav-help");
      closeChatNavHelp.setAttribute("action-key", "inline-cancel");
      closeChatNavHelp.classList.add("absolute", "-right-4", "-top-3", "z-1");
      this.chatPanel.appendChild(closeChatNavHelp);
      this.chatPanel.classList.add(
        "mini-map__chat-panel",
        "scale-0",
        "absolute",
        "pl-3",
        "pb-2",
        "bottom-56",
        "pointer-events-none",
        "z-0"
      );
      const openChatNavHelp = document.createElement("fxs-nav-help");
      openChatNavHelp.setAttribute("action-key", "inline-toggle-chat");
      openChatNavHelp.setAttribute("decoration-mode", "border");
      openChatNavHelp.setAttribute("caption", "LOC_UI_CHAT_PANEL");
      this.chatPanelNavHelp.appendChild(openChatNavHelp);
      this.chatPanelNavHelp.classList.add("flow-row", "fxs-nav-help", "text-shadow", "mt-2");
      miniMapRightContainer.appendChild(this.chatPanelNavHelp);
      container.appendChild(this.chatPanel);
    }
    this.miniMapTopContainer.appendChild(miniMapRightContainer);
    this.miniMapButtonRow.appendChild(this.miniMapRadialButton);
    this.radialNavHelpContainer.classList.add("absolute", "left-14", "top-1");
    const radialActionNavHelp = document.createElement("fxs-nav-help");
    radialActionNavHelp.setAttribute("action-key", "inline-toggle-radial-menu");
    this.radialNavHelpContainer.appendChild(radialActionNavHelp);
    Databind.classToggle(this.radialNavHelpContainer, "hidden", `!{{g_NavTray.isInputWorld}}`);
    this.miniMapRadialButton.appendChild(this.radialNavHelpContainer);
    this.updateRadialButton();
    this.updateLensButton();
    this.updateRadialNavHelpContainer();
    this.updateLensActionNavHelp();
    engine.trigger("minimap-panel-initialized");
  }
  onAttach() {
    super.onAttach();
    engine.on(ContextManagerEvents.OnChanged, this.onContextChange, this);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener(ToggleMiniMapEventName, this.toggleMiniMapListener);
    window.addEventListener(HideMiniMapEventName, this.hideMiniMapListener);
    window.addEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
    window.addEventListener(SocialPanelOpenEventName, this.socialPanelOpenedListener);
    window.addEventListener("resize", this.resizeListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.Root.listenForWindowEvent(LensActivationEventName, this.activeLensChangedListener);
    window.addEventListener("minimap-show-highlight", this.showHighlightListener);
    window.addEventListener("minimap-hide-highlight", this.hideHighlightListener);
    const useCapture = true;
    window.addEventListener(InputEngineEventName, this.engineInputCaptureListener, useCapture);
    engine.whenReady.then(() => this.createChatPanel());
  }
  onDetach() {
    engine.off(ContextManagerEvents.OnChanged, this.onContextChange, this);
    if (this.multiplayerChatHandle != null) {
      this.multiplayerChatHandle.clear();
      this.multiplayerChatHandle = null;
    }
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener(ToggleMiniMapEventName, this.toggleMiniMapListener);
    window.removeEventListener(HideMiniMapEventName, this.hideMiniMapListener);
    window.removeEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
    window.removeEventListener(SocialPanelOpenEventName, this.socialPanelOpenedListener);
    window.removeEventListener("resize", this.resizeListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.removeEventListener("minimap-show-highlight", this.showHighlightListener);
    window.removeEventListener("minimap-hide-highlight", this.hideHighlightListener);
    const useCapture = true;
    window.removeEventListener(InputEngineEventName, this.engineInputCaptureListener, useCapture);
    super.onDetach();
  }
  addSubpanel(targetClassName, tooltipKey, iconPath) {
    const subpanel = new Subpanel(targetClassName);
    subpanel.button = this.createButton(tooltipKey, iconPath, () => {
      return this.toggleSubpanel(subpanel);
    });
    this.miniMapButtonRow.appendChild(subpanel.button);
    this.subpanelContainer.appendChild(subpanel.container);
    this.subpanels.push(subpanel);
  }
  onContextChange(_event) {
    this.updateChatNavHelp();
  }
  onActiveLensChanged(event) {
    const hasLegend = event.detail.hasLegend;
    if (hasLegend && this.lensPanelState) {
      this.toggleLensPanel(false);
    }
  }
  panInProgress = false;
  onMinimapImageEngineInput(inputEvent) {
    if (inputEvent.detail.name == "touch-touch") {
      this.panInProgress = true;
      Audio.playSound("data-audio-minimap-clicked-map", "audio-panel-mini-map");
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "touch-pan") {
      if (inputEvent.detail.status == InputActionStatuses.START) {
        UI.sendAudioEvent(Audio.getSoundTag("data-audio-minimap-clicked-map", "audio-panel-mini-map"));
      }
      if (inputEvent.detail.status == InputActionStatuses.DRAG) {
        UI.sendAudioEvent(Audio.getSoundTag("data-audio-minimap-scrubbed-map", "audio-panel-mini-map"));
      }
      if (inputEvent.detail.name == "mousebutton-left" && inputEvent.detail.status == InputActionStatuses.START) {
        this.panInProgress = true;
      }
      if (this.panInProgress) {
        const quickPan = inputEvent.detail.status == InputActionStatuses.DRAG || inputEvent.detail.status == InputActionStatuses.UPDATE;
        if (inputEvent.detail.name == "mousebutton-left") {
          this.updateMinimapCamera(quickPan, this.lastCursorPos.x, this.lastCursorPos.y);
        } else {
          this.updateMinimapCamera(quickPan, inputEvent.detail.x, inputEvent.detail.y);
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  onSocialPanelOpened() {
    if (this.lensPanelState) {
      this.toggleLensPanel();
    }
  }
  onCursorUpdated(event) {
    if (event.detail.target instanceof HTMLElement) {
      if (event.detail.target != this.mapLastCursor) {
        if (event.detail.target == this.mapImage) {
          this.playSound("data-audio-minimap-focus");
        }
      }
      this.mapLastCursor = event.detail.target;
      this.lastCursorPos.x = event.detail.x;
      this.lastCursorPos.y = event.detail.y;
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "sys-menu":
        if (this.chatPanelState) {
          this.toggleChatPanel();
        }
        if (this.lensPanelState) {
          this.toggleLensPanel();
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onEngineInputCapture(inputEvent) {
    if (inputEvent.detail.name == "touch-complete" || inputEvent.detail.name == "mousebutton-left" && inputEvent.detail.status == InputActionStatuses.FINISH) {
      this.panInProgress = false;
    }
  }
  updateChatNavHelp() {
    this.chatPanel.classList.toggle(
      "trigger-nav-help",
      this.chatPanelState && ContextManager.getCurrentTarget()?.tagName != "SEND-TO-PANEL" && ContextManager.getCurrentTarget()?.tagName != "EMOTICON-PANEL"
    );
  }
  updateMinimapCamera(quickPan, x, y) {
    const minimapRect = this.mapImage?.getBoundingClientRect();
    if (minimapRect) {
      const minimapU = (x - minimapRect.left) / minimapRect.width;
      const minimapV = 1 - (y - minimapRect.top) / minimapRect.height;
      const worldPos = WorldUI.minimapToWorld({ x: minimapU, y: minimapV });
      if (worldPos && (this.lastMinimapPos.x != worldPos.x || this.lastMinimapPos.y != worldPos.y)) {
        if (quickPan) {
          Camera.panFocus(
            { x: worldPos.x - this.lastMinimapPos.x, y: worldPos.y - this.lastMinimapPos.y },
            false
          );
        } else {
          Camera.lookAt(worldPos.x, worldPos.y);
        }
        this.lastMinimapPos = worldPos;
      }
    }
  }
  isOpenRadialButtonVisible() {
    return (this.isScreenSmallMode() || UI.getViewExperience() == UIViewExperience.Mobile) && ActionHandler.isGamepadActive;
  }
  updateRadialButton() {
    this.miniMapRadialButton.classList.toggle("hidden", !this.isOpenRadialButtonVisible());
  }
  updateLensButton() {
    const isRadialButton = this.isOpenRadialButtonVisible();
    this.miniMapLensButton.classList.toggle("mx-3", isRadialButton);
    this.miniMapLensButton.classList.toggle("mx-1", !isRadialButton);
  }
  updateRadialNavHelpContainer() {
    this.radialNavHelpContainer.classList.toggle("hidden", !this.isOpenRadialButtonVisible());
  }
  updateLensActionNavHelp() {
    const isRadialButton = this.isOpenRadialButtonVisible();
    if (isRadialButton) {
      const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
      this.toggleLensActionNavHelp.classList.toggle("right-14", isMobileViewExperience);
      this.toggleLensActionNavHelp.classList.toggle("right-12", !isMobileViewExperience);
    } else {
      this.toggleLensActionNavHelp.classList.remove("right-14", "right-12");
    }
    this.toggleLensActionNavHelp.classList.toggle("right-22", !isRadialButton);
  }
  onResize() {
    this.updateRadialButton();
    this.updateLensButton();
    this.updateRadialNavHelpContainer();
    this.updateLensActionNavHelp();
  }
  onActiveDeviceTypeChanged() {
    this.updateRadialButton();
    this.updateLensButton();
    this.updateRadialNavHelpContainer();
    this.updateLensActionNavHelp();
  }
  isScreenSmallMode() {
    return window.innerHeight <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_HEIGHT) || window.innerWidth <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_WIDTH);
  }
  /**
   * Create the button to toggle the lens panel
   * @returns the button element
   */
  createButton(tooltipKey, iconPath, callback) {
    const miniMapButton = document.createElement("fxs-activatable");
    miniMapButton.classList.add("mini-map__lens-button", "mx-1");
    miniMapButton.setAttribute("data-tooltip-content", Locale.compose(tooltipKey));
    miniMapButton.addEventListener("action-activate", () => {
      const toggle = callback();
      miniMapButton.classList.toggle("mini-map__button--selected", toggle);
    });
    const miniMapBG = document.createElement("div");
    miniMapBG.classList.add("mini-map__lens-button__bg", "pointer-events-none");
    miniMapButton.appendChild(miniMapBG);
    const miniMapButtonIcon = document.createElement("div");
    miniMapButtonIcon.classList.add("mini-map__lens-button__icon", "pointer-events-none");
    miniMapButtonIcon.style.backgroundImage = `url(${iconPath})`;
    miniMapButton.appendChild(miniMapButtonIcon);
    miniMapButton.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    miniMapButton.setAttribute("data-audio-press-ref", "data-audio-minimap-panel-open-press");
    return miniMapButton;
  }
  /**
   * Create the button to toggle the chat panel
   * @returns the button element
   */
  createMinimapChatButton() {
    const miniMapButton = document.createElement("fxs-activatable");
    miniMapButton.classList.add("mini-map__chat-button", "relative", "w-12", "h-12", "mx-1");
    Databind.classToggle(miniMapButton, "hidden", "g_NavTray.isTrayRequired");
    miniMapButton.setAttribute("data-tooltip-content", Locale.compose("LOC_UI_TOGGLE_CHAT_PANEL"));
    miniMapButton.addEventListener("action-activate", () => {
      const toggle = this.toggleChatPanel();
      miniMapButton.classList.toggle("mini-map__button--selected", toggle);
    });
    const miniMapBG = document.createElement("div");
    miniMapBG.classList.add("mini-map__chat-button__bg", "pointer-events-none");
    miniMapButton.appendChild(miniMapBG);
    const miniMapButtonIcon = document.createElement("div");
    miniMapButtonIcon.classList.add("mini-map__chat-button__icon", "pointer-events-none");
    miniMapButton.appendChild(miniMapButtonIcon);
    miniMapButton.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    miniMapButton.setAttribute("data-audio-activate-ref", "data-audio-minimap-panel-toggle");
    return miniMapButton;
  }
  /**
   * Create the button to open the radial menu
   * @returns the button element
   */
  createMinimapRadialButton() {
    const miniMapButton = document.createElement("div");
    miniMapButton.classList.add("mini-map__radial-button", "relative", "w-12", "h-12", "mx-3");
    const miniMapBG = document.createElement("div");
    miniMapBG.classList.add("mini-map__radial-button__bg", "pointer-events-none");
    miniMapButton.appendChild(miniMapBG);
    const miniMapButtonIcon = document.createElement("div");
    miniMapButtonIcon.classList.add("mini-map__radial-button__icon", "pointer-events-none");
    miniMapButton.appendChild(miniMapButtonIcon);
    miniMapButton.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    miniMapButton.setAttribute("data-audio-activate-ref", "data-audio-minimap-panel-toggle");
    return miniMapButton;
  }
  closeSubpanels() {
    if (this.activeSubpanel) {
      this.toggleSubpanel(this.activeSubpanel);
    }
    if (this.lensPanelState) {
      this.toggleLensPanel();
    }
    if (this.chatPanelState) {
      this.toggleChatPanel();
    }
  }
  toggleSubpanel(subpanel, force) {
    const prevState = this.activeSubpanel == subpanel;
    const nextState = force ?? !prevState;
    if (prevState == nextState) {
      return nextState;
    }
    subpanel.container.classList.toggle("scale-0", !nextState);
    this.updateChatNavHelp();
    const activateId = nextState ? "data-audio-minimap-panel-open-release" : "data-audio-minimap-panel-close-release";
    Audio.playSound(activateId, "audio-panel-mini-map");
    subpanel.button?.setAttribute(
      "data-audio-press-ref",
      nextState ? "data-audio-minimap-panel-close-press" : "data-audio-minimap-panel-open-press"
    );
    if (ContextManager.hasInstanceOf(subpanel.tag)) {
      subpanel.panel?.close();
      this.activeSubpanel = null;
    } else {
      this.closeSubpanels();
      const component = ContextManager.push(subpanel.tag, {
        singleton: true,
        createMouseGuard: false,
        targetParent: subpanel.container
      });
      if (component instanceof ComponentRoot && component.component instanceof MinimapSubpanel) {
        subpanel.panel = component.component;
      } else {
        subpanel.panel = void 0;
      }
      this.activeSubpanel = subpanel;
    }
    return nextState;
  }
  createChatPanel() {
    if (!Configuration.getGame().isAnyMultiplayer || !Network.hasCommunicationsPrivilege(false)) {
      return false;
    }
    this.chatScreen = ContextManager.push("screen-mp-chat", {
      singleton: true,
      createMouseGuard: false,
      targetParent: this.chatPanel
    });
    this.chatScreen.classList.add("w-full", "h-full");
    if (this.multiplayerChatHandle == null && this.chatScreen?.component != null) {
      this.multiplayerChatHandle = engine.on(
        "MultiplayerChat",
        this.chatScreen.component.onMultiplayerChat,
        this
      );
    }
    this.chatScreen?.component.close();
  }
  /**
   * Expand or collapse the chat panel
   * @returns true if panel should be expanded
   */
  toggleChatPanel = () => {
    if (!Configuration.getGame().isAnyMultiplayer || !Network.hasCommunicationsPrivilege(false)) {
      return false;
    }
    this.chatPanelState = !this.chatPanelState;
    this.miniMapChatButton.setAttribute(
      "data-audio-press-ref",
      this.chatPanelState ? "data-audio-minimap-panel-close-press" : "data-audio-minimap-panel-open-press"
    );
    this.chatPanel.classList.toggle("scale-0", !this.chatPanelState);
    this.updateChatNavHelp();
    if (ContextManager.hasInstanceOf("screen-mp-chat")) {
      this.chatScreen?.component.close();
    } else {
      if (this.lensPanelState) {
        this.toggleLensPanel();
      }
      if (this.activeSubpanel) {
        this.toggleSubpanel(this.activeSubpanel);
      }
      this.chatScreen = ContextManager.push("screen-mp-chat", {
        singleton: true,
        createMouseGuard: false,
        targetParent: this.chatPanel
      });
      this.chatScreen.classList.add("w-full", "h-full");
      if (this.multiplayerChatHandle != null) {
        this.multiplayerChatHandle.clear();
        this.multiplayerChatHandle = null;
      }
      if (this.chatScreen?.component != null) {
        this.multiplayerChatHandle = engine.on(
          "MultiplayerChat",
          this.chatScreen.component.onMultiplayerChat,
          this
        );
      }
    }
    return this.chatPanelState;
  };
  /**
   * Expand or collapse the lens panel
   * @returns true if panel should be expanded
   */
  toggleLensPanel = (force) => {
    this.lensPanelState = force ?? !this.lensPanelState;
    this.lensPanel.classList.toggle("scale-0", !this.lensPanelState);
    this.updateChatNavHelp();
    const activateId = this.lensPanelState ? "data-audio-minimap-panel-open-release" : "data-audio-minimap-panel-close-release";
    Audio.playSound(activateId, "audio-panel-mini-map");
    this.miniMapLensButton.setAttribute(
      "data-audio-press-ref",
      this.lensPanelState ? "data-audio-minimap-panel-close-press" : "data-audio-minimap-panel-open-press"
    );
    if (ContextManager.hasInstanceOf("lens-panel")) {
      this.lensPanelComponent?.component.close();
    } else {
      if (this.chatPanelState) {
        this.toggleChatPanel();
      }
      if (this.activeSubpanel) {
        this.toggleSubpanel(this.activeSubpanel);
      }
      this.lensPanelComponent = ContextManager.push("lens-panel", {
        singleton: true,
        createMouseGuard: false,
        targetParent: this.lensPanel
      });
    }
    return this.lensPanelState;
  };
  onHideMiniMap({ detail: { value } }) {
    if (value == true) {
      if (this.choosersVisible == 0) {
        this.Root.classList.add("transition-opacity", "opacity-0");
      }
      this.choosersVisible++;
    } else {
      if (this.choosersVisible == 1) {
        this.Root.classList.remove("transition-opacity", "opacity-0");
      }
      this.choosersVisible--;
    }
    if (this.choosersVisible < 0) {
      console.error("panel-mini-map: choosersVisible counter has gone below zero, the mini-map may not display");
    }
  }
  onShowHighlight(event) {
    if (!this.mapHighlight) {
      console.warn(
        "PanelMiniMap: received a minimap-show-highlight event but the mapHighLight element is not set. Is the minimap attached yet?"
      );
      return;
    }
    const x = parseInt(event.detail.x);
    const y = parseInt(event.detail.y);
    const oddLineOffset = y % 2 ? 0.5 : 0;
    const inverseY = this.mapHeight - 1 - y;
    const coordPercentX = (x + oddLineOffset + 0.5) / (this.mapWidth + 0.5) * 100;
    const coordPercentY = (inverseY + this.mapTopBorderTiles + 0.5) / (this.mapHeight + this.mapTopBorderTiles + this.mapBottomBorderTiles + 0.5) * 100;
    this.mapHighlight.style.transform = `translate(${coordPercentX}%, ${coordPercentY}%)`;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (this.mapHighlight) {
          this.mapHighlight.classList.add("displayed");
        }
      });
    });
  }
  onHideHighlight() {
    if (this.mapHighlight) {
      this.mapHighlight.classList.remove("displayed");
    } else {
      console.warn(
        "PanelMiniMap: received a minimap-hide-highlight event but the mapHighLight element is not set. Is the minimap attached yet?"
      );
    }
  }
  onToggleMiniMap({ detail: { value } }) {
    this.miniMapTopContainer.classList.toggle("mini-map__main-minimized", !value);
    if (value) {
      Audio.playSound("data-audio-showing", "audio-panel-mini-map");
    } else {
      Audio.playSound("data-audio-hiding", "audio-panel-mini-map");
    }
  }
}
Controls.define("panel-mini-map", {
  createInstance: PanelMiniMap,
  description: "Minimap and lens/pennant display.",
  classNames: ["mini-map"],
  styles: [styles],
  images: ["fs://game/hud_mini_box.png", "fs://game/action_lookout.png", "fs://game/hud_mini_lens_btn.png"]
});
const ToggleMiniMapEventName = "toggle-mini-map-event";
class ToggleMiniMapEvent extends CustomEvent {
  constructor(value) {
    super(ToggleMiniMapEventName, { bubbles: true, detail: { value } });
  }
}
const HideMiniMapEventName = "hide-mini-map-event";
class HideMiniMapEvent extends CustomEvent {
  constructor(value) {
    super(HideMiniMapEventName, { bubbles: true, detail: { value } });
  }
}
class LensPanel extends MinimapSubpanel {
  lensPanel = document.createElement("fxs-vslot");
  lensRadioButtonContainer = document.createElement("fxs-spatial-slot");
  layerCheckboxContainer = document.createElement("fxs-spatial-slot");
  miniMapLensDisplayOptionName = "minimap_set_lens";
  lensRadioButtons = [];
  lensElementMap = {};
  layerElementMap = {};
  onActiveLensChangedListener = this.onActiveLensChanged.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.Fade;
    this.animateOutType = this.animateOutType = AnchorType.Fade;
  }
  onInitialize() {
    super.onInitialize();
    this.lensPanel.setAttribute("data-navrule-up", "stop");
    this.lensPanel.setAttribute("data-navrule-down", "stop");
    this.lensPanel.setAttribute("data-navrule-right", "stop");
    this.lensPanel.setAttribute("data-navrule-left", "stop");
    this.lensPanel.classList.add("mini-map__lens-panel", "left-3", "px-2", "py-8");
    const closeLensPanelNavHelp = document.createElement("fxs-nav-help");
    closeLensPanelNavHelp.setAttribute("action-key", "inline-cancel");
    closeLensPanelNavHelp.classList.add("absolute", "-right-4", "-top-3", "z-1");
    this.lensPanel.appendChild(closeLensPanelNavHelp);
    const lensPanelContent = document.createElement("div");
    lensPanelContent.classList.add("mb-5");
    this.lensPanel.appendChild(lensPanelContent);
    const lensPanelHeader = document.createElement("fxs-header");
    lensPanelHeader.classList.add("mb-3", "font-title-base", "text-secondary");
    lensPanelHeader.setAttribute("title", "LOC_UI_MINI_MAP_LENSES");
    lensPanelHeader.setAttribute("filigree-style", "h4");
    lensPanelContent.appendChild(lensPanelHeader);
    this.lensRadioButtonContainer.className = "relative flex flex-wrap row items-start justify-start";
    lensPanelContent.appendChild(this.lensRadioButtonContainer);
    const decorPanelContent = document.createElement("div");
    decorPanelContent.classList.add("mini-map__decor-panel-content");
    this.lensPanel.appendChild(decorPanelContent);
    const decorPanelHeader = document.createElement("fxs-header");
    decorPanelHeader.classList.add("mb-3", "font-title-base", "text-secondary");
    decorPanelHeader.setAttribute("title", "LOC_UI_MINI_MAP_DECORATION");
    decorPanelHeader.setAttribute("filigree-style", "h4");
    decorPanelContent.appendChild(decorPanelHeader);
    this.layerCheckboxContainer.className = "relative flex flex-wrap row items-start justify-start";
    decorPanelContent.appendChild(this.layerCheckboxContainer);
    const visibilityPanelContent = document.createElement("div");
    visibilityPanelContent.classList.add("fxs-vslot");
    this.lensPanel.appendChild(visibilityPanelContent);
    const visibilityDivider = document.createElement("div");
    visibilityDivider.classList.add("filigree-divider-inner-frame");
    visibilityPanelContent.appendChild(visibilityDivider);
    visibilityPanelContent.appendChild(this.createShowMinimapCheckbox());
    this.createLensButton("LOC_UI_MINI_MAP_NONE", "fxs-default-lens", "lens-group");
    this.createLensButton("LOC_UI_MINI_MAP_SETTLER", "fxs-settler-lens", "lens-group");
    this.createLensButton("LOC_UI_MINI_MAP_CONTINENT", "fxs-continent-lens", "lens-group");
    this.createLensButton("LOC_UI_MINI_MAP_TRADE", "fxs-trade-lens", "lens-group");
    this.createLayerCheckbox("LOC_UI_MINI_MAP_HEX_GRID", "fxs-hexgrid-layer");
    this.createLayerCheckbox("LOC_UI_MINI_MAP_RESOURCE", "fxs-resource-layer");
    this.createLayerCheckbox("LOC_UI_MINI_MAP_YIELDS", "fxs-yields-layer");
    this.Root.appendChild(this.lensPanel);
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(LensActivationEventName, this.onActiveLensChangedListener);
    window.addEventListener(LensLayerEnabledEventName, this.onLensLayerEnabled);
    window.addEventListener(LensLayerDisabledEventName, this.onLensLayerDisabled);
  }
  onDetach() {
    super.onDetach();
    window.removeEventListener(LensActivationEventName, this.onActiveLensChangedListener);
    window.removeEventListener(LensLayerEnabledEventName, this.onLensLayerEnabled);
    window.removeEventListener(LensLayerDisabledEventName, this.onLensLayerDisabled);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    Focus.setContextAwareFocus(this.lensPanel, this.Root);
  }
  createShowMinimapCheckbox() {
    const checkboxLabelContainer = document.createElement("div");
    checkboxLabelContainer.className = "w-1\\/2 flex flex-row items-center";
    const checkbox = document.createElement("fxs-checkbox");
    checkbox.classList.add("mr-2");
    checkbox.setAttribute("selected", "true");
    checkbox.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    checkbox.setAttribute("data-audio-focus-ref", "data-audio-checkbox-focus");
    checkboxLabelContainer.appendChild(checkbox);
    const label = document.createElement("div");
    label.role = "paragraph";
    label.className = "text-accent-2 text-base font-body pointer-events-auto";
    label.dataset.l10nId = "LOC_UI_SHOW_MINIMAP";
    checkboxLabelContainer.appendChild(label);
    checkbox.addEventListener(ComponentValueChangeEventName, (event) => {
      this.Root.dispatchEvent(new ToggleMiniMapEvent(event.detail.value));
    });
    return checkboxLabelContainer;
  }
  createLayerCheckbox(caption, layer) {
    const isLayerEnabled = LensManager.isLayerEnabled(layer);
    const checkbox = document.createElement("fxs-checkbox");
    this.layerElementMap[layer] = checkbox;
    checkbox.classList.add("mr-2");
    checkbox.setAttribute("selected", isLayerEnabled.toString());
    checkbox.setAttribute("data-audio-group-ref", "audio-panel-mini-map");
    checkbox.setAttribute("data-audio-focus-ref", "data-audio-checkbox-focus");
    const checkboxLabelContainer = document.createElement("div");
    checkboxLabelContainer.className = "w-1\\/2 flex flex-row items-center";
    checkboxLabelContainer.appendChild(checkbox);
    const label = document.createElement("div");
    label.role = "paragraph";
    label.className = "text-accent-2 text-base font-body pointer-events-auto";
    label.dataset.l10nId = caption;
    checkboxLabelContainer.appendChild(label);
    this.layerCheckboxContainer.appendChild(checkboxLabelContainer);
    checkbox.addEventListener(ComponentValueChangeEventName, (event) => {
      const isLayerEnabled2 = LensManager.isLayerEnabled(layer);
      if (isLayerEnabled2 != event.detail.value) {
        LensManager.toggleLayer(layer, event.detail.value);
        MiniMapData.setDecorationOption(layer, event.detail.value);
      }
    });
  }
  createLensButton(caption, lens, group) {
    const isLensEnabled = LensManager.getActiveLens() === lens;
    const radioButtonLabelContainer = document.createElement("div");
    radioButtonLabelContainer.className = "w-1\\/2 flex flex-row items-center";
    const radioButton = document.createElement("fxs-radio-button");
    this.lensElementMap[lens] = radioButton;
    radioButton.classList.add("mr-2");
    radioButton.setAttribute("group-tag", group);
    radioButton.setAttribute("value", lens);
    radioButton.setAttribute("caption", caption);
    radioButton.setAttribute("selected", isLensEnabled.toString());
    radioButton.setAttribute("tabindex", "-1");
    radioButton.setAttribute("data-audio-group-ref", "minimap-radio-button");
    radioButtonLabelContainer.appendChild(radioButton);
    this.lensRadioButtons.push(radioButton);
    const label = document.createElement("div");
    label.role = "paragraph";
    label.className = "text-accent-2 text-base font-body pointer-events-auto";
    label.dataset.l10nId = caption;
    radioButtonLabelContainer.appendChild(label);
    this.lensRadioButtonContainer.appendChild(radioButtonLabelContainer);
    radioButton.addEventListener(ComponentValueChangeEventName, this.onLensChange);
  }
  close() {
    super.close();
  }
  onLensChange = (event) => {
    const { isChecked, value: lens } = event.detail;
    if (isChecked) {
      LensManager.setActiveLens(lens);
      MiniMapData.setLensDisplayOption(this.miniMapLensDisplayOptionName, lens);
    }
  };
  onActiveLensChanged() {
    for (const lensButton of this.lensRadioButtons) {
      const isLensEnabled = LensManager.getActiveLens() === lensButton.getAttribute("value");
      lensButton.setAttribute("selected", isLensEnabled.toString());
    }
  }
  onLensLayerEnabled = (event) => {
    const checkbox = this.layerElementMap[event.detail.layer];
    checkbox?.setAttribute("selected", "true");
  };
  onLensLayerDisabled = (event) => {
    const checkbox = this.layerElementMap[event.detail.layer];
    checkbox?.setAttribute("selected", "false");
  };
}
Controls.define("lens-panel", {
  createInstance: LensPanel,
  description: "Lens Panel",
  classNames: ["lens-panel"],
  tabIndex: -1
});

export { HideMiniMapEvent, HideMiniMapEventName, LensPanel, MinimapSubpanel, PanelMiniMap, ToggleMiniMapEvent, ToggleMiniMapEventName };
//# sourceMappingURL=panel-mini-map.js.map
