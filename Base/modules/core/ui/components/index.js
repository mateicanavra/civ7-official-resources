import { A as ActionActivateEvent, F as FxsActivatable, a as ActionActivateEventName } from './fxs-activatable.chunk.js';
export { b as UpdateActivatableDisabledState, U as UpdateFromOperationResult } from './fxs-activatable.chunk.js';
export { F as FxsButtonGroup } from './fxs-button-group.chunk.js';
export { F as FxsButton } from './fxs-button.chunk.js';
export { F as FxsCheckbox, a as FxsStepper, b as FxsSwitch } from './fxs-switch.chunk.js';
export { a as ChooserItemSelectedEvent, C as ChooserItemSelectedEventName, F as FxsChooserItem } from './fxs-chooser-item.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import { a as DropdownSelectionChangeEvent } from './fxs-dropdown.chunk.js';
export { D as DropdownSelectionChangeEventName, F as FxsDropdown, b as FxsDropdownItemElement } from './fxs-dropdown.chunk.js';
import { L as Layout } from '../utilities/utilities-layout.chunk.js';
import './fxs-font-icon.chunk.js';
export { f as EditableHeaderExitEditEvent, e as EditableHeaderExitEditEventName, d as EditableHeaderTextChangedEvent, E as EditableHeaderTextChangedEventName, a as FrameCloseEvent, F as FrameCloseEventName, g as FxsEditableHeader, b as FxsFrame, c as FxsHeader } from './fxs-editable-header.chunk.js';
import { C as ComponentID } from '../utilities/utilities-component-id.chunk.js';
import { F as FxsNavHelp } from './fxs-nav-help.chunk.js';
import { Icon } from '../utilities/utilities-image.chunk.js';
export { F as FxsIcon } from './fxs-icon.chunk.js';
import { b as InputEngineEventName, a as NavigateInputEventName } from '../input/input-support.chunk.js';
export { F as FxsRingMeter } from './fxs-ring-meter.chunk.js';
import { A as Audio } from '../audio-base/audio-support.chunk.js';
import { u as utils } from '../graph-layout/utils.chunk.js';
import Cursor from '../input/cursor.js';
import FocusManager from '../input/focus-manager.js';
export { F as FxsSlider } from './fxs-slider.chunk.js';
export { b as FxsHSlot, c as FxsSidePanel, F as FxsSlot, e as FxsSlotGroup, d as FxsSpatialSlot, a as FxsVSlot, i as isSlot } from './fxs-slot.chunk.js';
import { PassThroughAttributes, MustGetElement } from '../utilities/utilities-dom.chunk.js';
import { n as number } from '../utilities/utilities-validation.chunk.js';
export { F as FxsTextboxValidateVirtualKeyboard, b as TextBoxTextChangedEvent, a as TextBoxTextChangedEventName, T as TextBoxTextEditStopEvent, c as TextBoxTextEditStopEventName } from './fxs-textbox.chunk.js';
import '../framework.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import '../input/focus-support.chunk.js';
import '../context-manager/context-manager.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../spatial/spatial-manager.js';

class FxsCloseButton extends Component {
  activateCounter = 0;
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.setVisibility(!ActionHandler.isGamepadActive);
    this.Root.classList.toggle("touch-enabled", UI.isTouchEnabled());
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.listenForWindowEvent(
      "engine-input",
      (inputEvent) => {
        if (inputEvent.detail.name == "touch-complete" && this.Root.classList.contains("pressed")) {
          this.Root.classList.remove("pressed");
        }
      },
      true
    );
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    super.onDetach();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status == InputActionStatuses.START) {
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        this.playSound("data-audio-close-press");
      }
    } else if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      if (inputEvent.detail.name == "touch-touch") {
        this.Root.classList.add("pressed");
        this.playSound("data-audio-close-press");
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return;
      }
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        if (this.activateCounter == 0) {
          this.playSound("data-audio-close-selected");
        }
        this.activateCounter = 1;
        window.dispatchEvent(new SetActivatedComponentEvent(null));
        this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  setVisibility(isVisible) {
    this.Root.classList.toggle("hidden", !isVisible);
  }
  onActiveDeviceTypeChanged(event) {
    this.setVisibility(!event.detail?.gamepadActive);
  }
  render() {
    this.Root.classList.add("size-12", "cursor-pointer", "group");
    this.Root.innerHTML = `
			<div class="close-button__bg absolute inset-0"></div>
			<div class="close-button__bg-hover absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 transition-opacity"></div>
			<div class="close-button__bg-pressed absolute inset-0 opacity-0 group-active\\:opacity-100 group-pressed\\:opacity-100"></div>
		`;
  }
}
Controls.define("fxs-close-button", {
  createInstance: FxsCloseButton,
  description: "A close button primitive",
  classNames: ["fxs-close-button"],
  images: ["fs://game/hud_closebutton.png"]
});

class FxsEditButton extends FxsActivatable {
  editButtonBG = document.createElement("div");
  editButtonHoverBG = document.createElement("div");
  playSoundListener = this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref");
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.playSoundListener);
    this.render();
    this.Root.setAttribute("data-tooltip-content", "LOC_NAME_EDIT");
  }
  onDetach() {
    this.Root.removeEventListener("mouseenter", this.playSoundListener);
    super.onDetach();
  }
  render() {
    this.Root.classList.add("cursor-pointer", "group");
    this.editButtonBG.classList.add(
      "img-icon-pencil",
      "absolute",
      "inset-0",
      "opacity-100",
      "group-hover\\:opacity-0",
      "group-focus\\:opacity-0",
      "transition-opacity"
    );
    this.editButtonHoverBG.classList.add(
      "img-icon-pencil-hover",
      "absolute",
      "inset-0",
      "opacity-0",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100",
      "transition-opacity"
    );
    this.Root.appendChild(this.editButtonBG);
    this.Root.appendChild(this.editButtonHoverBG);
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "is-confirm":
        this.editButtonBG.classList.toggle("img-icon-pencil", newValue != "true");
        this.editButtonBG.classList.toggle("img-icon-pencil-check", newValue == "true");
        this.editButtonHoverBG.classList.toggle("img-icon-pencil-hover", newValue != "true");
        this.editButtonHoverBG.classList.toggle("img-icon-pencil-check-hover", newValue == "true");
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
}
Controls.define("fxs-edit-button", {
  createInstance: FxsEditButton,
  description: "An edit button primitive",
  classNames: ["fxs-edit-button", "relative"],
  images: [
    "fs://game/icon_pencil.png",
    "fs://game/icon_pencil_hover.png",
    "fs://game/icon_pencil_check.png",
    "fs://game/icon_pencil_check_hover.png"
  ],
  attributes: [
    {
      name: "is-confirm",
      description: "If the text box should show the confirm classes or not"
    }
  ]
});

class FxsDecorativeFrame extends Component {
  onInitialize() {
    super.onInitialize();
    const border = document.createElement("div");
    border.classList.add("fxs-decorative-frame__border");
    this.Root.insertBefore(border, this.Root.firstChild);
  }
}
const FxsDecorativeFrameTagName = "fxs-decorative-frame";
Controls.define(FxsDecorativeFrameTagName, {
  createInstance: FxsDecorativeFrame
});

class FxsFlipBook extends Component {
  /** Frames per second of animation */
  fps = 15;
  /** Internal representation of each atlas and their corresponding HTML element */
  atlas = [];
  /** Total number of frames across all atlases */
  nFrames = 0;
  /** Current shown atlas. -1 means it has not yet initialized */
  atlasIndex = -1;
  /** Current frame (out of FlipBook.nFrames, not per atlas frames*/
  frame = 0;
  /** Internal update interval ID */
  intervalId;
  /** Is the flipbook animating or not */
  isRunning = false;
  /** Get current animation frame */
  get getFrame() {
    return this.frame;
  }
  onAttach() {
    const attribute = this.Root.getAttribute("data-flipbook-definition");
    if (attribute) {
      const flipbookDef = JSON.parse(attribute);
      this.createFlipbook(flipbookDef.atlas, flipbookDef.fps, flipbookDef.preload);
      this.connectedCallback();
      this.run();
    }
  }
  onDetach() {
    clearInterval(this.intervalId);
  }
  /**
   * @remarks This will not add the flipbook to DOM, only register the texture atlas data. If preload is true it will also load in the images (but not show them).
   * @param atlas Either a single texture atlas or multiple atlases
   * @param fps Frames per second of the animation
   * @param preload Whether or not the texture atlases should be preloaded
   */
  createFlipbook(atlas, fps, preload = false) {
    for (let i = 0; i < atlas.length; i++) {
      let nFrames = -1;
      if (atlas[i].nFrames) {
        nFrames = atlas[i].nFrames;
      }
      const _atlas = {
        src: atlas[i].src,
        sprite: { width: atlas[i].spriteWidth, height: atlas[i].spriteHeight },
        size: atlas[i].size,
        nFrames,
        countMax: { x: 0, y: 0 }
      };
      this.atlas.push({ element: void 0, data: _atlas });
    }
    let f = 0;
    for (let item = 0; item < this.atlas.length; item++) {
      const a = this.atlas[item];
      const nX = Math.floor(a.data.size / a.data.sprite.width);
      const nY = Math.floor(a.data.size / a.data.sprite.height);
      if (a.data.nFrames == -1) a.data.nFrames = nY * nX;
      a.data.countMax = { x: nX, y: nY };
      f += a.data.nFrames;
    }
    this.nFrames = f;
    this.fps = fps;
    if (preload) {
      this.atlas.forEach((a) => {
        const img = new Image();
        img.src = a.data.src;
      });
    }
  }
  /** Callback for when this is added to DOM. Will automatically draw the first frame. */
  connectedCallback() {
    this.Root.style.position = "relative";
    this.Root.style.width = Layout.pixels(this.atlas[0].data.sprite.width);
    this.Root.style.height = Layout.pixels(this.atlas[0].data.sprite.height);
    this.atlas.forEach((atlas) => {
      const animation = document.createElement("div");
      animation.style.position = "absolute";
      animation.style.willChange = "transform";
      animation.style.width = Layout.pixels(atlas.data.sprite.width);
      animation.style.height = Layout.pixels(atlas.data.sprite.height);
      animation.style.backgroundImage = `url(${atlas.data.src})`;
      animation.style.visibility = "hidden";
      atlas.element = animation;
      this.Root.appendChild(animation);
    });
    this.drawFrame(0);
  }
  /** Start the animation. If the animation is already running, {@link FlipBook.restart | restart}. */
  run() {
    if (this.isRunning) {
      console.warn("Trying to run an already playing flipbook. Restarting instead.");
      this.restart();
    } else {
      this.isRunning = true;
      this.spawnInterval();
    }
  }
  /** Restarts the animation. */
  restart() {
    clearInterval(this.intervalId);
    this.frame = 0;
    this.isRunning = true;
    this.spawnInterval();
  }
  /** Stops the animation. */
  end() {
    clearInterval(this.intervalId);
  }
  /**
   * Skips to a certain frame. Will not change whether or not the animation is running.
   * @param frame Frame to go to
   */
  goto(frame) {
    if (frame < 0 || frame > this.nFrames)
      console.error(`Trying to skip to frame ${frame} but it is out of bounds (0 <= f < ${this.nFrames})`);
    else {
      this.frame = frame;
      this.drawFrame(frame);
    }
  }
  /** Pauses the current animation. */
  pause() {
    if (!this.isRunning) console.warn("Trying to pause a flipbook that is not running");
    else {
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }
  /** Resumes the current animation. */
  resume() {
    if (this.isRunning) console.warn("Trying to resume a flipbook that is already running");
    else this.run();
  }
  /** Utility function to toggle between paused/unpaused. */
  toggleRunning() {
    if (this.isRunning) this.pause();
    else this.resume();
  }
  /** Shows the flipbook */
  show() {
    this.Root.style.display = "block";
  }
  /** Hides the flipbook and pauses it. */
  hide() {
    if (!this.Root) console.warn("Trying to show an uninitialized flipbook");
    else {
      this.Root.style.display = "none";
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }
  /** Creates the internal update loop. */
  spawnInterval() {
    this.intervalId = setInterval(() => {
      try {
        this.drawFrame(this.frame);
      } catch (e) {
        console.error(e);
        this.pause();
        return;
      }
      this.frame++;
      if (this.frame == this.nFrames) this.frame = 0;
    }, 1e3 / this.fps);
  }
  /**
   * Renders a frame on screen.
   * @param f Frame to render
   */
  drawFrame(f) {
    let prevFrameCount = 0;
    let correctAtlasIndex = 0;
    for (let i = 0; i < this.atlas.length; i++) {
      prevFrameCount += this.atlas[i].data.nFrames;
      if (prevFrameCount > f) {
        prevFrameCount -= this.atlas[i].data.nFrames;
        correctAtlasIndex = i;
        break;
      }
    }
    if (correctAtlasIndex != this.atlasIndex) {
      this.atlasIndex = correctAtlasIndex;
      this.atlas.forEach((atlas) => {
        if (!atlas.element)
          console.error(`Flipbook is trying to access a non-existing element for ${atlas.data.src}`);
        else atlas.element.style.visibility = "hidden";
      });
      this.atlas[this.atlasIndex].element.style.visibility = "visible";
      if (!this.Root) console.warn("This should never happen! Trying to draw frame before initialization");
      else {
        this.Root.style.width = Layout.pixels(this.atlas[this.atlasIndex].data.sprite.width);
        this.Root.style.height = Layout.pixels(this.atlas[this.atlasIndex].data.sprite.height);
      }
    }
    const internalFrame = f - prevFrameCount;
    const y = Math.floor(internalFrame / this.atlas[this.atlasIndex].data.countMax.x);
    const x = this.frame - y * this.atlas[this.atlasIndex].data.countMax.y;
    if (!this.atlas[this.atlasIndex].element)
      console.error(
        `Flipbook is trying to access a non-existing element for ${this.atlas[this.atlasIndex].data.src}`
      );
    else {
      const ele = this.atlas[this.atlasIndex].element;
      ele.style.backgroundPositionX = Layout.pixels(-x * this.atlas[this.atlasIndex].data.sprite.width);
      ele.style.backgroundPositionY = Layout.pixels(-y * this.atlas[this.atlasIndex].data.sprite.height);
      ele.style.backgroundSize = Layout.pixels(this.atlas[this.atlasIndex].data.size);
    }
  }
}
Controls.define("fxs-flipbook", {
  createInstance: FxsFlipBook,
  description: "Flipbook animation component",
  classNames: ["flipbook-container"],
  attributes: [
    {
      name: "data-flipbook-definition"
    }
  ]
});

class FxsHeroButton extends FxsActivatable {
  label = document.createElement("div");
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "caption": {
        if (newValue) {
          this.label.setAttribute("data-l10n-id", newValue);
        } else {
          this.label.removeAttribute("data-l10n-id");
        }
        break;
      }
      case "disabled": {
        super.onAttributeChanged(name, oldValue, newValue);
        const elements = this.Root.querySelectorAll(
          ".bg-herobutton-sideframe, .bg-herobutton-centerpiece"
        );
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.toggle("disabled", this.disabled);
        }
        break;
      }
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  render() {
    this.Root.classList.add(
      "fxs-hero-button",
      "relative",
      "flex",
      "min-h-11\\.5",
      "items-center",
      "justify-center",
      "min-w-80",
      "font-title",
      "uppercase",
      "font-bold",
      "text-accent-1",
      "tracking-150",
      "cursor-pointer",
      "mt-6",
      "text-shadow-subtle",
      "leading-none",
      "text-center"
    );
    this.Root.innerHTML = `
			<div class="absolute inset-0 opacity-0 bg-herobutton-gradient"></div>
			<div class="absolute inset-x-0 top-0 bottom-0 flex flex-row">
				<div class="flex-1 bg-herobutton-sideframe"></div>
				<div class="flex-1 bg-herobutton-sideframe -rotate-y-180"></div>
				<div class="absolute inset-0 flex justify-center">
					<div class="w-11 bg-herobutton-centerpiece"></div>
				</div>
			</div>
		`;
    this.label.classList.add("relative", "py-3", "px-5", "text-center");
    if (!this.Root.hasAttribute("data-audio-activate-ref")) {
      this.Root.setAttribute("data-audio-activate-ref", "data-audio-hero-activate");
    }
    if (!this.Root.hasAttribute("data-audio-press-ref")) {
      this.Root.setAttribute("data-audio-press-ref", "data-audio-hero-press");
    }
    if (!this.Root.hasAttribute("data-audio-focus-ref")) {
      this.Root.setAttribute("data-audio-focus-ref", "data-audio-hero-focus");
    }
    this.Root.appendChild(this.label);
  }
}
Controls.define("fxs-hero-button", {
  createInstance: FxsHeroButton,
  attributes: [{ name: "caption" }, { name: "icon" }, { name: "action-key" }, { name: "disabled" }],
  images: [
    "blp:hud_herobutton_centerpiece",
    "blp:hud_herobutton_centerpiece-dis",
    "blp:hud_herobutton_sideframe",
    "blp:hud_herobutton_sideframe-dis"
  ],
  tabIndex: -1
});

if (typeof Chart != "undefined") {
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.font.size = Layout.textSizeToScreenPixels("lg");
  Chart.defaults.font.family = BODY_FONTS.join(", ");
  Chart.defaults.color = "#E5E5E5";
}
class FxsHofChart extends Component {
  refreshId;
  canvas;
  chartData;
  constructor(root) {
    super(root);
    this.refreshId = 0;
    this.canvas = document.createElement("canvas");
    this.Root.appendChild(this.canvas);
  }
  onAttach() {
    super.onAttach();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.refreshChart();
      });
    });
  }
  onDetach() {
    if (this.refreshId != 0) {
      cancelAnimationFrame(this.refreshId);
      this.refreshId = 0;
    }
    if (this.chartData) {
      this.chartData.destroy();
    }
    super.onDetach();
  }
  onAttributeChanged(_name, _oldValue, _newValue) {
    if (this.refreshId == 0) {
      this.refreshId = requestAnimationFrame(() => {
        this.refreshId = 0;
        this.refreshChart();
      });
    }
  }
  getBoolAttribute(name) {
    const attrValue = this.Root.getAttribute(name);
    if (attrValue != null) {
      if (attrValue == "1" || attrValue == "true") {
        return true;
      } else {
        return false;
      }
    }
    return void 0;
  }
  getPlayerIDAttribute(name) {
    const attrValue = this.Root.getAttribute(name);
    if (attrValue) {
      if (attrValue == "local-player") {
        return GameContext.localPlayerID;
      } else {
        const id = parseInt(attrValue);
        if (!isNaN(id)) {
          return id;
        }
      }
    }
    return void 0;
  }
  getComponentIDAttribute(name) {
    const attrValue = this.Root.getAttribute(name);
    if (attrValue) {
      return ComponentID.fromString(attrValue);
    } else {
      return void 0;
    }
  }
  refreshChart() {
    if (typeof Chart != "undefined") {
      Chart.defaults.font.size = Layout.textSizeToScreenPixels("lg");
    }
    const options = {
      dataSetID: this.Root.getAttribute("data-dataset-id") ?? "",
      dataPointID: this.Root.getAttribute("data-datapoint-id") ?? "",
      title: this.Root.getAttribute("data-title") ?? "",
      subTitle: this.Root.getAttribute("data-subtitle") ?? "",
      xAxisLabel: this.Root.getAttribute("data-label-x-axis") ?? "",
      yAxisLabel: this.Root.getAttribute("data-label-y-axis") ?? "",
      ownerTypeFilter: this.Root.getAttribute("data-filter-owner-type") ?? "",
      ownerPlayerFilter: this.getPlayerIDAttribute("data-filter-owner-player"),
      componentIDFilter: this.getComponentIDAttribute("data-filter-component-ID"),
      chartHint: this.Root.getAttribute("data-chart-hint") ?? "",
      hideLegend: this.getBoolAttribute("data-hide-legend")
    };
    const config = this.createChartData(options);
    if (config) {
      if (this.chartData != null) {
        this.chartData.destroy();
        this.chartData = null;
      }
      const ctx = this.canvas.getContext("2d");
      if (ctx) {
        this.chartData = new Chart(ctx, config);
      }
    }
  }
  getObjectName(object) {
    if (object.name) {
      return Locale.compose(object.name);
    } else {
      if (object.type == "Player") {
        const player = Players.get(object.ownerPlayer);
        if (player) {
          return Locale.compose(player.leaderName);
        } else {
          return `Player ${object.ownerPlayer}`;
        }
      } else if (object.type == "City") {
        const city = Cities.get(object.componentID);
        if (city) {
          return Locale.compose(city.name);
        } else {
          return `City ${JSON.stringify(object.componentID)}`;
        }
      }
    }
    return "Unknown";
  }
  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  getObjectColors(object) {
    if (object.type == "Player") {
      return [UI.Player.getPrimaryColorValueAsString(object.ownerPlayer)];
    } else {
      return [this.getRandomColor()];
    }
  }
  determineChartType(options, datasetCount) {
    if (options.dataSetID) {
      return "line";
    } else {
      if (datasetCount == 1) {
        if (options.chartHint == "doughnut") {
          return "doughnut";
        } else {
          return "pie";
        }
      } else {
        return "bar";
      }
    }
  }
  createChartData(options) {
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      console.error("fxs-hof-chart: Unable to get local player!");
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (localPlayerDiplomacy === void 0) {
      console.error("fxs-hof-chart: Unable to get local player diplomacy!");
      return;
    }
    const chartDatasets = [];
    const objects = Game.Summary.getObjects();
    const objectMap = /* @__PURE__ */ new Map();
    objects.forEach((o) => {
      objectMap.set(o.ID, o);
    });
    const labels = [];
    if (options.dataSetID) {
      const dataSets = Game.Summary.getDataSets();
      dataSets.forEach((ds) => {
        if (ds.ID != options.dataSetID) {
          return;
        }
        const ownerObject = ds.owner ? objectMap.get(ds.owner) : null;
        if (options.ownerTypeFilter != null || options.ownerPlayerFilter != null) {
          if (!ownerObject) {
            return;
          }
          if (options.ownerTypeFilter != null && ownerObject.type != options.ownerTypeFilter) {
            return;
          }
          if (options.ownerPlayerFilter != null && ownerObject.ownerPlayer != options.ownerPlayerFilter) {
            return;
          }
        }
        if (ownerObject.ownerPlayer && (!localPlayerDiplomacy.hasMet(ownerObject.ownerPlayer) || localPlayerID == ownerObject.ownerPlayer)) {
          return;
        }
        let name = "";
        let colors = ["black", "grey"];
        if (ownerObject) {
          name = this.getObjectName(ownerObject);
          colors = this.getObjectColors(ownerObject);
        }
        chartDatasets.push({
          label: name,
          parsing: false,
          data: ds.values,
          backgroundColor: colors[0],
          borderColor: colors[0],
          pointRadius: 0
        });
      });
    } else if (options.dataPointID) {
      let dataPoints = Game.Summary.getDataPoints();
      dataPoints = dataPoints.filter((dp) => {
        if (dp.ID != options.dataPointID) {
          return false;
        }
        const ownerObject = dp.owner ? objectMap.get(dp.owner) : null;
        if (options.ownerTypeFilter != null || options.ownerPlayerFilter != null) {
          if (!ownerObject) {
            return false;
          }
          if (options.ownerTypeFilter != null && ownerObject.type != options.ownerTypeFilter) {
            return false;
          }
          if (options.ownerPlayerFilter != null && ownerObject.ownerPlayer != options.ownerPlayerFilter) {
            return false;
          }
          if (ownerObject.ownerPlayer && (!localPlayerDiplomacy.hasMet(ownerObject.ownerPlayer) || localPlayerID == ownerObject.ownerPlayer)) {
            return false;
            ``;
          }
        }
        return true;
      });
      const labelIndex = [];
      const valuesByOwner = /* @__PURE__ */ new Map();
      dataPoints.forEach((dp) => {
        if (dp.value.numeric != null) {
          if (dp.type) {
            let values = valuesByOwner.get(dp.owner ?? -1);
            if (values == null) {
              values = [];
              valuesByOwner.set(dp.owner ?? -1, values);
            }
            let index = labelIndex.findIndex((t) => t == dp.type);
            if (index == -1) {
              const unitName = GameInfo.Units.lookup(dp.type)?.Name;
              labelIndex.push(dp.type);
              labels.push(Locale.compose(unitName));
              index = labelIndex.length - 1;
            }
            values.push({ x: index, y: dp.value.numeric ?? 0 });
          } else {
          }
        }
      });
      valuesByOwner.forEach((values, ownerID) => {
        let name = "";
        let colors = ["black", "grey"];
        const ownerObject = objectMap.get(ownerID);
        if (ownerObject) {
          name = this.getObjectName(ownerObject);
          colors = this.getObjectColors(ownerObject);
        }
        if (valuesByOwner.size == 1) {
          colors = [];
          for (let i = 0; i < values.length; ++i) {
            colors.push(this.getRandomColor());
          }
        }
        chartDatasets.push({
          label: name,
          parsing: false,
          data: valuesByOwner.size == 1 ? values.map((v) => v.y) : values,
          backgroundColor: valuesByOwner.size == 1 ? colors : colors[0],
          borderColor: valuesByOwner.size == 1 ? colors : colors[0]
        });
      });
    }
    const chartType = this.determineChartType(options, chartDatasets.length);
    let scales = {};
    if (chartType == "line") {
      scales = {
        y: {
          grid: {
            color: "#85878C"
          },
          type: "linear",
          title: {
            display: options.yAxisLabel != null,
            text: options.yAxisLabel ?? ""
          }
        },
        x: {
          grid: {
            color: "#85878C"
          },
          type: "linear",
          title: {
            display: options.xAxisLabel != null,
            text: options.xAxisLabel ?? ""
          }
        }
      };
    } else if (chartType == "bar") {
      scales = {
        y: {
          type: "linear",
          title: {
            display: options.yAxisLabel != null,
            text: options.yAxisLabel ?? ""
          }
        },
        x: {
          type: "category",
          title: {
            display: options.xAxisLabel != null,
            text: options.xAxisLabel ?? ""
          }
        }
      };
    } else if (chartType == "pie" || chartType == "doughnut") {
    }
    const config = {
      type: chartType,
      data: {
        labels: labels.length > 0 ? labels : void 0,
        datasets: chartDatasets
      },
      options: {
        scales,
        plugins: {
          legend: {
            display: !options.hideLegend
          },
          title: {
            display: options.title != null,
            text: options.title
          },
          subtitle: {
            display: options.subTitle != null,
            text: options.subTitle
          }
        }
      }
    };
    return config;
  }
}
Controls.define("fxs-hof-chart", {
  createInstance: FxsHofChart,
  description: "An chart-js component for visualizing GameSummary/HoF data.",
  classNames: [],
  attributes: [
    {
      name: "data-title",
      description: "The title of the chart."
    },
    {
      name: "data-subtitle",
      description: "The title of the chart."
    },
    {
      name: "data-dataset-id",
      description: "The dataset ID to use. Results in line charts.  Mutually exclusive with 'data-datapoint-id'."
    },
    {
      name: "data-datapoint-id",
      description: "The datapoint ID to use. Results in bar or pie charts.  Mutually exclusive with 'data-dataset-id'."
    },
    {
      name: "data-label-x-axis",
      description: "The optional label for the x-axis when used in line graphs.  This is typically the game turn."
    },
    {
      name: "data-label-y-axis",
      description: "The optional label for the y-axis when used in line grahs and bar charts."
    },
    {
      name: "data-filter-owner-type",
      description: "Only grab datasets or datapoints in which the owner object is of a certain type."
    },
    {
      name: "data-filter-owner-player",
      description: "Only grab datasets or datapoints in which the owner player is set.  Use 'local-player' to denote the local player."
    },
    {
      name: "data-filter-component-ID",
      description: "Only grab datasets or datapoints in which the owner object component ID matches the one supplied."
    },
    {
      name: "data-chart-hint",
      description: "Suggest a certain type of chart.  This is primarily used to decide between pie or doughnuts. I prefer cake."
    },
    {
      name: "data-hide-legend",
      description: "Optional boolean to hide the legend."
    }
  ]
});

class FxsHoldToConfirm extends Component {
  DEFAULT_HOLD_SECS = 3;
  ringElement;
  iconElement;
  labelElement;
  engineInputEventListener = this.onEngineInput.bind(this);
  updateIconEventListener = this.updateIcon.bind(this);
  get disabled() {
    return this.Root.classList.contains("disabled");
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value.toString());
  }
  get actionKey() {
    return this.Root.getAttribute("action-key");
  }
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputEventListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.updateIconEventListener, true);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.updateIconEventListener, true);
    this.Root.removeEventListener("engine-input", this.engineInputEventListener);
    super.onDetach();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "caption": {
        if (this.labelElement) {
          if (newValue) {
            this.labelElement.setAttribute("data-l10n-id", newValue);
          } else {
            this.labelElement.removeAttribute("data-l10n-id");
          }
        }
        break;
      }
      case "action-key": {
        this.updateIcon();
        break;
      }
      case "disabled": {
        this.ringElement?.classList.remove("active");
        break;
      }
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  onEngineInput(inputEvent) {
    if (this.disabled) {
      return;
    }
    if (inputEvent.detail.name == this.actionKey) {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      if (inputEvent.detail.status == InputActionStatuses.START) {
        if (this.ringElement) {
          this.ringElement.component.value = 100;
        }
      } else if (inputEvent.detail.status == InputActionStatuses.HOLD) {
        window.dispatchEvent(new ActivatedComponentChangeEvent(null));
        this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
      } else if (inputEvent.detail.status == InputActionStatuses.FINISH) {
        if (this.ringElement) {
          this.ringElement.component.value = 0;
        }
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  updateIcon() {
    if (this.iconElement) {
      const actionName = FxsNavHelp.getGamepadActionName(this.actionKey ?? "") || this.actionKey || "";
      const imagePath = Icon.getIconFromActionName(actionName) ?? "";
      this.iconElement.style.backgroundImage = `url(${imagePath})`;
    }
  }
  render() {
    const holdTimeSeconds = UI.getApplicationOption("Input", "InputActionHoldTime") || this.DEFAULT_HOLD_SECS;
    this.iconElement = document.createElement("div");
    this.iconElement.classList.add("fxs-hold-to-confirm__icon");
    this.ringElement = document.createElement("fxs-ring-meter");
    this.ringElement.classList.add("fxs-hold-to-confirm__ring");
    this.ringElement.setAttribute("animation-duration", `${holdTimeSeconds * 1e3}`);
    this.ringElement.setAttribute("value", "0");
    this.ringElement.appendChild(this.iconElement);
    this.labelElement = document.createElement("div");
    this.labelElement.classList.add("fxs-hold-to-confirm__label", "font-title", "text-gap-0");
    const content = document.createElement("div");
    content.classList.add("fxs-button__content");
    content.appendChild(this.labelElement);
    this.Root.appendChild(this.ringElement);
    this.Root.appendChild(content);
  }
}
Controls.define("fxs-hold-to-confirm", {
  createInstance: FxsHoldToConfirm,
  description: "A hold to confirm primitive",
  classNames: ["fxs-hold-to-confirm"],
  attributes: [
    {
      name: "action-key",
      description: "The action that causes the ring to fill when pressed."
    },
    {
      name: "caption",
      description: "The text label to display."
    }
  ],
  images: [],
  tabIndex: -1
});

var IconState = /* @__PURE__ */ ((IconState2) => {
  IconState2["Default"] = "default";
  IconState2["Hover"] = "hover";
  IconState2["Focus"] = "focus";
  IconState2["Active"] = "active";
  IconState2["Disabled"] = "disabled";
  IconState2["Pressed"] = "pressed";
  return IconState2;
})(IconState || {});
const AttributeNames = Object.values(IconState).map(
  (state) => state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`
);
const stateDefaultClassNameMap = {
  ["default" /* Default */]: ["opacity-100"],
  ["hover" /* Hover */]: ["opacity-0", "group-hover\\:opacity-100"],
  ["focus" /* Focus */]: ["opacity-0", "group-focus\\:opacity-100"],
  ["active" /* Active */]: ["opacity-0", "group-active\\:opacity-100"],
  ["pressed" /* Pressed */]: ["opacity-0", "group-pressed\\:opacity-100"],
  ["disabled" /* Disabled */]: ["opacity-0"]
};
class Controller {
  constructor(elements) {
    this.elements = elements;
  }
  /** disabled is a convenience method of setting  */
  set disabled(value) {
    this.state = value ? "disabled" /* Disabled */ : "default" /* Default */;
  }
  set state(value) {
    if (!this.isValidState(value)) {
      console.error(
        `icon-group: no state exists for ${value}. Valid states are: ${Object.keys(this.elements).join(", ")}`
      );
    }
    for (const state in this.elements) {
      this.elements[state].classList.remove("opacity-100");
    }
    if (value === "default" /* Default */) {
      for (const state in this.elements) {
        const defaultClassNames = stateDefaultClassNameMap[state];
        this.elements[state].classList.add(...defaultClassNames);
      }
    } else {
      for (const state in this.elements) {
        if (state === value) {
          this.elements[state].classList.add("opacity-100");
        } else {
          const defaultClassNames = stateDefaultClassNameMap[state];
          this.elements[state].classList.remove(...defaultClassNames);
        }
      }
    }
  }
  /** isValidState validates that the icon group has an icon for this group */
  isValidState(state) {
    return typeof state === "string" && state in this.elements;
  }
}
const Init = ({
  root,
  iconStateUrlMap,
  noGroupClass
}) => {
  root ??= document.createElement("div");
  root.classList.add("relative", "pointer-events-auto");
  if (!noGroupClass) {
    root.classList.add("group");
  }
  const elements = {};
  const urlElementMap = {};
  for (const state in iconStateUrlMap) {
    const url = iconStateUrlMap[state];
    if (!url) continue;
    const element = urlElementMap[url] ??= document.createElement("img");
    element.src = iconStateUrlMap[state];
    if (state !== "default" /* Default */) {
      element.classList.add("absolute");
    }
    element.classList.add("transition-opacity");
    if (state in stateDefaultClassNameMap) {
      const defaultClassNames = stateDefaultClassNameMap[state];
      element.classList.add(...defaultClassNames);
    }
    elements[state] = element;
    root.appendChild(element);
  }
  return [root, new Controller(elements)];
};
const FromElement = (element, noGroupClass = false) => {
  const iconStateUrlMap = UrlMapFromElementAttributes(element);
  return Init({ root: element, iconStateUrlMap, noGroupClass });
};
const UrlMapFromElementAttributes = (element) => {
  return Object.values(IconState).reduce(
    (acc, state) => {
      const attributeName = state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`;
      const iconUrl = element.getAttribute(attributeName);
      if (iconUrl) {
        acc[state] = iconUrl;
      }
      return acc;
    },
    {}
  );
};
const SetAttributes = (element, stateUrlMap) => {
  if (typeof stateUrlMap === "string") {
    element.setAttribute("data-icon", stateUrlMap);
  } else {
    for (const state in stateUrlMap) {
      const attributeName = state === "default" /* Default */ ? "data-icon" : `data-icon-${state}`;
      const url = stateUrlMap[state];
      if (url) {
        element.setAttribute(attributeName, url);
      }
    }
  }
};

const statefulIcon = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	AttributeNames,
	Controller,
	FromElement,
	IconState,
	Init,
	SetAttributes,
	UrlMapFromElementAttributes
}, Symbol.toStringTag, { value: 'Module' }));

class FxsIconButton extends FxsActivatable {
  controller;
  constructor(root) {
    super(root);
    const [, controller] = FromElement(root);
    this.controller = controller;
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        super.onAttributeChanged(name, oldValue, newValue);
        this.controller.disabled = this.disabled;
        break;
      case "data-state":
        if (newValue && this.controller.isValidState(newValue)) {
          this.controller.state = newValue;
          if (newValue === IconState.Disabled) {
            super.onAttributeChanged("disabled", this.Root.getAttribute("disabled"), "true");
          }
        }
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
}
Controls.define("fxs-icon-button", {
  createInstance: FxsIconButton,
  attributes: [
    {
      name: "caption"
    },
    {
      name: "action-key"
    },
    {
      name: "disabled"
    },
    {
      name: "data-state"
    }
  ]
});

class FxsStatefulIcon extends Component {
  controller;
  constructor(root) {
    super(root);
    const [, controller] = FromElement(root, true);
    this.controller = controller;
  }
  onInitialize() {
    this.Root.classList.add("flex", "items-center");
    for (const iconElement of Object.values(this.controller.elements)) {
      iconElement.classList.add("flex-initial", "max-h-full", "max-w-full", "size-full");
    }
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-state":
        if (this.controller.isValidState(newValue)) {
          this.controller.state = newValue;
        }
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
}
Controls.define("fxs-stateful-icon", {
  createInstance: FxsStatefulIcon,
  attributes: [
    {
      name: "data-state"
    }
  ]
});

class FxsInnerFrame extends Component {
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  render() {
    this.Root.insertAdjacentHTML(
      "afterbegin",
      `
			<div class="absolute inset-0 pointer-events-none">
				<div class="absolute top-0 inset-x-0 filigree-inner-frame-top"></div>
				<div class="absolute bottom-0 inset-x-0 filigree-inner-frame-bottom"></div>
			</div>
		`
    );
  }
}
Controls.define("fxs-inner-frame", {
  createInstance: FxsInnerFrame,
  description: "A frame designed to be used inside other frames",
  classNames: ["fxs-inner-frame", "inner-frame", "relative", "flex", "flex-col", "items-center"]
});

class FxsMinusPlusButton extends FxsActivatable {
  plusContainer = document.createElement("div");
  plusBg = document.createElement("div");
  plusBgHighlight = document.createElement("div");
  minusContainer = document.createElement("div");
  minusBg = document.createElement("div");
  minusBgHighlight = document.createElement("div");
  mobileHitbox = document.createElement("div");
  set type(value) {
    this.Root.dataset.type = value;
  }
  get type() {
    return this.Root.dataset.type === "plus" ? "plus" : "minus";
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
  }
  onDetach() {
    super.onDetach();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "type":
        if (newValue === "plus" || newValue === "minus") {
          this.update(newValue);
        }
        break;
      case "data-disabled": {
        super.onAttributeChanged("disabled", oldValue, newValue);
        this.Root.classList.toggle("opacity-50", this.disabled);
        break;
      }
    }
  }
  update(type = null) {
    type = type ?? this.type;
    this.plusContainer.classList.toggle("opacity-0", type === "minus");
    this.minusContainer.classList.toggle("opacity-0", type === "plus");
  }
  render() {
    this.Root.classList.add("relative", "p-1", "cursor-pointer", "pointer-events-auto", "group");
    this.Root.classList.toggle("w-5", UI.getViewExperience() != UIViewExperience.Mobile);
    this.Root.classList.toggle("h-5", UI.getViewExperience() != UIViewExperience.Mobile);
    this.Root.classList.toggle("w-6", UI.getViewExperience() == UIViewExperience.Mobile);
    this.Root.classList.toggle("h-6", UI.getViewExperience() == UIViewExperience.Mobile);
    this.plusContainer.classList.add("absolute", "inset-0");
    this.minusContainer.classList.add("absolute", "inset-0");
    this.plusBg.classList.add(
      "absolute",
      "-inset-1\\.5",
      "img-questopen",
      "bg-no-repeat",
      "bg-center",
      "bg-contain"
    );
    this.plusBgHighlight.classList.add(
      "absolute",
      "-inset-1\\.5",
      "bg-no-repeat",
      "bg-center",
      "bg-contain",
      "img-questopen-highlight",
      "transition-opacity",
      "opacity-0",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100",
      "group-pressed\\:opacity-100"
    );
    this.minusBg.classList.add(
      "absolute",
      "-inset-1\\.5",
      "img-questclose",
      "bg-no-repeat",
      "bg-center",
      "bg-contain"
    );
    this.minusBgHighlight.classList.add(
      "absolute",
      "-inset-1\\.5",
      "bg-no-repeat",
      "bg-center",
      "bg-contain",
      "img-questclose-highlight",
      "transition-opacity",
      "opacity-0",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100",
      "group-pressed\\:opacity-100"
    );
    this.mobileHitbox.classList.add("absolute", "-inset-3");
    this.mobileHitbox.classList.toggle("hidden", UI.getViewExperience() != UIViewExperience.Mobile);
    this.plusContainer.appendChild(this.plusBg);
    this.plusContainer.appendChild(this.plusBgHighlight);
    this.minusContainer.appendChild(this.minusBg);
    this.minusContainer.appendChild(this.minusBgHighlight);
    this.Root.appendChild(this.plusContainer);
    this.Root.appendChild(this.minusContainer);
    this.Root.appendChild(this.mobileHitbox);
  }
}
Controls.define("fxs-minus-plus", {
  createInstance: FxsMinusPlusButton,
  attributes: [{ name: "type" }, { name: "data-disabled" }],
  images: ["blp:hud_quest_open", "blp:hud_quest_open_hov", "blp:hud_quest_close", "blp:hud_quest_close_hov"]
});

class FxsMinimizeButton extends FxsMinusPlusButton {
  engineInputListener = this.onEngineInputMinimize.bind(this);
  minimized = false;
  constructor(root) {
    super(root);
  }
  onAttach() {
    this.Root.setAttribute("type", "minus");
    this.Root.classList.add("fxs-minimize-button", "minusplus-button");
    this.Root.setAttribute("data-tooltip-content", Locale.compose("LOC_PANEL_X_MINIMIZE"));
    this.Root.addEventListener("engine-input", this.engineInputListener);
    if (this.Root.parentElement) {
      const frame = this.Root.parentElement.querySelector(".outerfill.main-window.fxs-frame");
      frame?.classList.add("maximized-frame");
    }
    this.updateImage();
    super.onAttach();
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onEngineInputMinimize(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left") {
      this.playActivateSound();
      if (this.Root.parentElement) {
        const content = this.Root.parentElement.querySelector(".content");
        const frame = this.Root.parentElement.querySelector(".outerfill.main-window.fxs-frame");
        this.minimized = !this.minimized;
        if (this.minimized) {
          this.Root.setAttribute("type", "plus");
        } else {
          this.Root.setAttribute("type", "minus");
        }
        content?.classList.toggle("minimized-content", this.minimized);
        content?.classList.toggle("maximized-content", !this.minimized);
        frame?.classList.toggle("minimized-frame", this.minimized);
        frame?.classList.toggle("maximized-frame", !this.minimized);
        this.updateImage();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  updateImage() {
    this.Root.classList.toggle("minusplus-button--minus", !this.minimized);
  }
}
Controls.define("fxs-minimize-button", {
  createInstance: FxsMinimizeButton,
  description: "A minimize button primitive",
  classNames: [],
  images: []
});

class FxsMinMaxButton extends FxsActivatable {
  arrowIsUp = true;
  mouseEnterEventListener = this.onMouseEnter.bind(this);
  mouseLeaveEventListener = this.onMouseLeave.bind(this);
  actionActivateEventListener = this.onActionActivate.bind(this);
  get disabled() {
    return this.Root.classList.contains("disabled");
  }
  constructor(root) {
    super(root);
    this.toggle(this.Root.classList.contains("minmax-button--up"));
  }
  onMouseEnter() {
    if (this.disabled) {
      UI.setCursorByType(UIHTMLCursorTypes.NotAllowed);
    }
  }
  onMouseLeave() {
    if (this.disabled) {
      UI.setCursorByType(UIHTMLCursorTypes.Default);
    }
  }
  onActionActivate() {
    if (this.disabled) {
      return;
    }
    this.toggle();
  }
  toggle(force = void 0) {
    this.arrowIsUp = force ?? !this.arrowIsUp;
    this.Root.classList.toggle("minmax-button--up", this.arrowIsUp);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.mouseEnterEventListener);
    this.Root.addEventListener("mouseleave", this.mouseLeaveEventListener);
    this.Root.addEventListener("action-activate", this.actionActivateEventListener);
  }
  onDetach() {
    this.Root.removeEventListener("mouseenter", this.mouseEnterEventListener);
    this.Root.removeEventListener("mouseleave", this.mouseLeaveEventListener);
    this.Root.removeEventListener("action-activate", this.actionActivateEventListener);
    super.onDetach();
  }
  render() {
    this.Root.innerHTML = `
			<div class="minmax-button__shadow"></div>
			<div class="minmax-button__bg absolute inset-0"></div>
			<div class="minmax-button__highlight absolute inset-0"></div>
			<div class="minmax-button__arrow"></div>
			<div class="minmax-button__arrow minmax-button__arrow--highlight"></div>
			<div class="minmax-button__overlay absolute inset-0"></div>
		`;
  }
}
Controls.define("fxs-minmax-button", {
  createInstance: FxsMinMaxButton,
  description: "",
  classNames: ["fxs-minmax-button"],
  tabIndex: -1
});

class FxsModalFrame extends Component {
  _content = null;
  get content() {
    if (!this._content) {
      this._content = document.createElement(this.contentAs);
      this._content.className = this.contentClass;
      this.Root.appendChild(this._content);
    }
    return this._content;
  }
  contentAs = "div";
  contentClass = "";
  get modalStyle() {
    const modalStyle = this.Root.dataset.modalStyle;
    if (modalStyle === "generic" || modalStyle === "special" || modalStyle === "narrative" || modalStyle === "on-map") {
      return modalStyle;
    }
    return "generic";
  }
  onInitialize() {
    super.onInitialize();
    this.contentAs = this.Root.dataset.contentAs || this.contentAs;
    this.contentClass = this.Root.dataset.contentClass || this.contentClass;
    const originalfragment = document.createDocumentFragment();
    if (this.modalStyle == "on-map") {
      this.Root.classList.add("img-small-narrative-frame", "absolute", "w-full");
    }
    while (this.Root.hasChildNodes()) {
      const c = this.Root.firstChild;
      if (c) {
        originalfragment.appendChild(c);
      }
    }
    this.content.appendChild(originalfragment);
    this.render();
    this.content.classList.value = "flex flex-col flex-auto" + (this.contentClass ? " " + this.contentClass : "");
    this.Root.appendChild(this.content);
  }
  render() {
    this.Root.classList.add("relative", "flex", "flex-col", "max-w-full", "max-h-full", "pointer-events-auto");
    const modalStyle = this.modalStyle;
    if (modalStyle === "generic") {
      const backgroundStyle = this.Root.getAttribute("bg-style");
      this.Root.classList.add("p-8", backgroundStyle == "none" ? "" : "img-modal-frame");
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="absolute top-2 left-2 bottom-0 w-1\\/2 img-frame-filigree pointer-events-none"></div>
				<div class="absolute top-2 right-2 bottom-0 w-1\\/2 rotate-y-180 img-frame-filigree pointer-events-none"></div>
			`
      );
    } else if (modalStyle === "narrative") {
      const backDropAttribute = this.Root.getAttribute("data-bg-image");
      const backgroundImageContainer = document.createElement("div");
      backgroundImageContainer.classList.value = "absolute size-full pointer-events-none";
      const bgImage = document.createElement("div");
      bgImage.classList.value = "img-narrative-frame-bg relative bg-no-repeat bg-cover grow";
      if (backDropAttribute) {
        bgImage.style.backgroundImage = backDropAttribute;
      }
      backgroundImageContainer.appendChild(bgImage);
      const overlay = document.createElement("div");
      overlay.classList.add("img-narrative-frame-overlay", "absolute", "inset-0");
      backgroundImageContainer.appendChild(overlay);
      this.Root.appendChild(backgroundImageContainer);
      const narrativeHeader = document.createElement("div");
      narrativeHeader.innerHTML = `
				<div class="narrative-header-container w-full">
					<div class="absolute flex -top-24 w-full justify-center">
						<div class="absolute top-2 left-0 bottom-0 w-1\\/2 min-h-28 img-narrative-reg-header"></div>
						<div class="absolute top-2 right-0 bottom-0 w-1\\/2 rotate-y-180 min-h-28 img-narrative-reg-header"></div>
						<div class="img-narrative-top-icon absolute mt-4"></div>
					</div>
				</div>
				<div class="narrative-header-container-sys width-full hidden top-0">
					<div class="absolute -top-2\\.5 -mt-px -right-3 -left-3 h-4 filigree-panel-top-simplified pointer-events-none">
				</div>
			`;
      this.Root.appendChild(narrativeHeader);
    } else if (modalStyle === "on-map") {
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="w-full">
					<div class="flex absolute w-full -top-14 justify-center">
					<div class="absolute top-2 left-1 bottom-0 w-1\\/2 min-h-14 img-small-narrative-header"></div>
					<div class="absolute top-2 -right-0\\.5 bottom-0 w-1\\/2 rotate-y-180 min-h-14 img-small-narrative-header"></div>
					<div class="img-small-narrative-top-icon w-8 h-8 mt-3 ml-1 absolute"></div>
					</div>
				</div>`
      );
    } else {
      this.Root.classList.add("p-0\\.5", "img-unit-panelbox");
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="flex items-center justify-center h-16 -mt-8 pb-1 w-full">
					<div class="grow img-top-filigree-left"></div>
					<div class="img-top-filigree-center"></div>
					<div class="grow img-top-filigree-right"></div>
				</div>
			`
      );
    }
  }
}
Controls.define("fxs-modal-frame", {
  createInstance: FxsModalFrame,
  attributes: [
    {
      name: "data-bg-image",
      description: "Set background image from narrative story info"
    }
  ],
  images: [
    "fs://game/base_frame-filigree.png",
    "fs://game/modal_bg.png",
    "fs://game/nar_reg_bg_overlay",
    "fs://game/nar_small_frame"
  ]
});

function parseVTT(content) {
  function convertToMS(h, m, s, f) {
    return h * 36e5 + m * 6e4 + s * 1e3 + f / 1e3;
  }
  function parseTimeStamp(m1, m2, m3, m4) {
    const n1 = Number(m1);
    const n2 = Number(m2);
    const n4 = Number(m4);
    if (m3) {
      return convertToMS(n1, n2, Number(m3.replace(":", "")), n4);
    } else {
      return n1 > 59 ? convertToMS(n1, n2, 0, n4) : convertToMS(0, n1, n2, n4);
    }
  }
  let offset = 0;
  if (content[0] == "\uFEFF") {
    offset = 1;
  }
  if (!content.startsWith("WEBVTT", offset)) {
    throw new Error("Missing 'WEBVTT' signature.");
  }
  content = content.replaceAll("\0", "�");
  content = content.replaceAll("\r\n", "\n");
  content = content.replaceAll("\r", "\n");
  const lines = content.split("\n");
  const lineCount = lines.length;
  const results = [];
  if (lines.length == 1) {
    return [];
  } else {
    const CUETIMINGS = /\s*(\d+):(\d{2})(:\d{2})?\.(\d{3})\s*-->\s*(\d+):(\d{2})(:\d{2})?\.(\d{3})\s*(.+)?/;
    let line = 1;
    while (line < lineCount) {
      const text = lines[line];
      if (text == "") {
        line++;
        continue;
      }
      const ch = text.charAt(0);
      switch (ch) {
        case "N":
          if (text.startsWith("NOTE")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
        case "R":
          if (text.startsWith("REGION")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
        case "S":
          if (text.startsWith("STYLE")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
      }
      let id = "";
      if (text.indexOf("-->") == -1) {
        id = text;
        line++;
        if (line >= lineCount) {
          break;
        }
      }
      const m = lines[line].match(CUETIMINGS);
      if (m == null) {
        throw new Error(`Cannot parse cue timings. ${lines[line]}`);
      } else {
        const start = parseTimeStamp(m[1], m[2], m[3], m[4]);
        const stop = parseTimeStamp(m[5], m[6], m[7], m[8]);
        if (isNaN(start) || isNaN(stop)) {
          throw new Error(`Could not parse timestamps for cue. ${lines[line]}.`);
        } else {
          const cueTextLines = [];
          line++;
          let cueText = lines[line];
          while (line < lineCount && cueText.length > 0) {
            cueTextLines.push(cueText);
            line++;
            cueText = lines[line];
          }
          let text2 = cueTextLines.join("[N]");
          text2 = text2.replaceAll(/<(\/)?([bBiI])>/g, "[$1$2]");
          text2 = text2.replaceAll(/(<.*>)/g, "");
          const cue = {
            id,
            start,
            stop,
            text: text2
          };
          results.push(cue);
        }
      }
    }
  }
  return results;
}
const STOP_MOVIE_AUDIO_EVENT = "stop_webm";
class Subtitle {
  addSubtitleElementCallback = null;
  htmlElement = null;
  cue = null;
  constructor(addSubtitleElementCallback) {
    this.addSubtitleElementCallback = addSubtitleElementCallback;
  }
  set(cue) {
    if (!this.addSubtitleElementCallback) {
      return;
    }
    this.htmlElement = this.addSubtitleElementCallback(cue.text);
    this.cue = cue;
  }
  isSet() {
    return this.cue != null && this.htmlElement != null;
  }
  clear() {
    this.htmlElement?.remove();
    this.htmlElement = null;
    this.cue = null;
  }
  didExpire(currentTimeMS) {
    if (!this.cue) {
      return false;
    }
    return currentTimeMS > this.cue.stop;
  }
}
class FxsMovie extends FxsActivatable {
  readyStateListener = this.onCheckReadyState.bind(this);
  movieSkipListener = this.onActivated.bind(this);
  moviePlayingListener = this.onMoviePlaying.bind(this);
  movieEndedListener = this.onMovieEnded.bind(this);
  playbackStalledListener = this.onPlaybackStalled.bind(this);
  playbackResumedListener = this.onPlaybackResumed.bind(this);
  movieTimeUpdateListener = this.onMovieTimeUpdate.bind(this);
  movieErrorListener = this.onMovieError.bind(this);
  rafCheckReadyState = 0;
  // Toggle to enable some debug features
  currentMovie = null;
  currentMovieSubtitles = null;
  currentMovieType = null;
  currentDisplayedSubtitle = new Subtitle(this.addSubtitleElement.bind(this));
  displayLocale;
  displayResolution;
  videoElement = null;
  subtitleElement = null;
  movieVariants = null;
  showSubtitles = true;
  constructor(root) {
    super(root);
    this.updateBackdrop();
    if (UI.favorSpeedOverQuality()) {
      this.displayResolution = 720;
    } else {
      this.displayResolution = window.innerHeight;
    }
    const attrShowSubtitles = this.Root.getAttribute("data-force-subtitles");
    if (attrShowSubtitles != null) {
      this.showSubtitles = attrShowSubtitles[0] == "t" || attrShowSubtitles[0] == "T" || attrShowSubtitles[0] == "1";
    } else {
      const subtitleOption = UI.getOption("audio", "Sound", "Subtitles");
      this.showSubtitles = subtitleOption == 1;
    }
    this.displayLocale = "en_US";
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("action-activate", this.movieSkipListener);
    if (!this.Root.classList.contains("absolute")) {
      this.Root.classList.add("relative");
    }
    const movieId = this.Root.getAttribute("data-movie-id");
    if (movieId) {
      this.onSkipMovie(true);
      this.playMovie(movieId);
    }
  }
  onDetach() {
    if (this.rafCheckReadyState) {
      cancelAnimationFrame(this.rafCheckReadyState);
      this.rafCheckReadyState = 0;
    }
    this.clearMovie();
    this.Root.removeEventListener("action-activate", this.movieSkipListener);
    super.onDetach();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (name == "data-movie-id") {
      if (newValue) {
        if (newValue != this.currentMovieType) {
          this.onSkipMovie(true);
          this.playMovie(newValue);
        }
      } else {
        this.onSkipMovie(true);
      }
    } else if (name == "data-hide-backdrop") {
      this.updateBackdrop();
    }
  }
  onActivated() {
    if (UI.canSkipMovies()) {
      this.onSkipMovie();
    }
  }
  onSkipMovie(force = false) {
    let preventSkipping = false;
    const attrPreventSkipping = this.Root.getAttribute("data-prevent-skipping");
    if (attrPreventSkipping != null) {
      preventSkipping = attrPreventSkipping[0] == "t" || attrPreventSkipping[0] == "1";
    }
    if ((force || !preventSkipping) && this.currentMovie) {
      this.onMovieEnded();
    }
  }
  onCheckReadyState() {
    this.rafCheckReadyState = 0;
    if (this.videoElement) {
      if (this.videoElement.readyState > 2) {
        this.onMovieReadyToPlay();
      } else {
        this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
      }
    }
  }
  onMovieReadyToPlay() {
    if (this.videoElement) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const videoWidth = this.videoElement.videoWidth;
      const videoHeight = this.videoElement.videoHeight;
      console.debug(
        `Video loaded, adjusting size to fit video. Window ${width}x${height} Video: ${videoWidth}x${videoHeight}`
      );
      const movieRatio = videoWidth / videoHeight;
      const movieRatioInverse = videoHeight / videoWidth;
      const displayRatio = width / height;
      let cover = false;
      if (this.currentMovie?.UseCoverFitMode) {
        cover = true;
      }
      const attrFitMode = this.Root.getAttribute("data-movie-fit-mode");
      if (attrFitMode) {
        if (attrFitMode == "cover") {
          cover = true;
        } else {
          cover = false;
        }
      }
      if (movieRatio < displayRatio || cover) {
        this.videoElement.style.height = "100%";
        const newWidth = height * movieRatio;
        const newWidthPct = newWidth / width;
        this.videoElement.style.width = `${newWidthPct * 100}%`;
      } else {
        this.videoElement.style.width = "100%";
        const newHeight = width * movieRatioInverse;
        const newHeightPct = newHeight / height;
        this.videoElement.style.height = `${newHeightPct * 100}%`;
      }
      delayByFrame(() => {
        const videoElement = this.videoElement;
        if (videoElement) {
          console.debug("Adjustments made, begin playback.");
          const movie = this.currentMovie;
          if (movie) {
            if (movie.Audio) {
              UI.sendAudioEvent(movie.Audio);
            }
          }
          videoElement.play();
        }
      }, 2);
    }
  }
  onMoviePlaying() {
    const movie = this.currentMovie;
    if (movie) {
      console.debug(`Movie '${this.currentMovie?.MovieType}' - '${this.currentMovie?.Url}' playing!`);
      delayByFrame(() => {
        const event = new CustomEvent("movie-playing");
        this.Root.dispatchEvent(event);
      }, 6);
    }
  }
  onMovieTimeUpdate() {
    if (!this.videoElement) {
      return;
    }
    if (!this.currentMovieSubtitles) {
      return;
    }
    const currentTimeMS = this.videoElement.currentTime * 1e3;
    if (this.currentDisplayedSubtitle.isSet() && this.currentDisplayedSubtitle.didExpire(currentTimeMS)) {
      this.currentDisplayedSubtitle.clear();
      this.currentMovieSubtitles.shift();
    }
    this.currentMovieSubtitles = this.currentMovieSubtitles.filter((subtitle) => subtitle.stop > currentTimeMS);
    if (this.currentMovieSubtitles.length == 0) {
      return;
    }
    const cue = this.currentMovieSubtitles[0];
    if (currentTimeMS >= cue.start) {
      if (!this.currentDisplayedSubtitle.isSet()) {
        this.currentDisplayedSubtitle.set(cue);
      }
    }
  }
  onMovieEnded() {
    if (this.currentMovie) {
      this.clearMovie();
      const event = new CustomEvent("movie-ended");
      this.Root.dispatchEvent(event);
    }
  }
  onPlaybackStalled() {
    console.warn(`Movie '${this.currentMovie?.Url}' stalled.`);
  }
  onPlaybackResumed() {
    console.warn(`Movie '${this.currentMovie?.Url}' resuming after a stall.`);
  }
  onMovieError() {
    console.error(`Movie '${this.currentMovie?.Url}' failed to play. Trying the next variant.`);
    this.playNextVariant();
  }
  addVideoElement(url) {
    this.videoElement = document.createElement("video");
    this.videoElement.autoplay = false;
    this.videoElement.style.pointerEvents = "none";
    this.videoElement.addEventListener("ended", this.movieEndedListener);
    this.videoElement.addEventListener("playing", this.moviePlayingListener);
    this.videoElement.addEventListener("cohplaybackstalled", this.playbackStalledListener);
    this.videoElement.addEventListener("cohplaybackresumed", this.playbackResumedListener);
    this.videoElement.addEventListener("error", this.movieErrorListener);
    this.videoElement.addEventListener("timeupdate", this.movieTimeUpdateListener);
    this.videoElement.src = url;
    this.Root.appendChild(this.videoElement);
  }
  removeVideoElement() {
    if (this.videoElement) {
      this.videoElement.removeEventListener("ended", this.movieEndedListener);
      this.videoElement.removeEventListener("playing", this.moviePlayingListener);
      this.videoElement.removeEventListener("cohplaybackstalled", this.playbackStalledListener);
      this.videoElement.removeEventListener("cohplaybackresumed", this.playbackResumedListener);
      this.videoElement.removeEventListener("error", this.movieErrorListener);
      this.videoElement.removeEventListener("timeupdate", this.movieTimeUpdateListener);
      this.videoElement.pause();
      this.videoElement.src = "";
      this.videoElement = null;
    }
    this.subtitleElement = null;
    this.Root.innerHTML = "";
  }
  addSubtitleElement(text) {
    if (this.subtitleElement == null) {
      const subbyRoot = document.createElement("div");
      subbyRoot.classList.add(
        "absolute",
        "inset-6",
        "flex",
        "flex-col-reverse",
        "justify-flex-start",
        "items-center",
        "fullscreen"
      );
      this.subtitleElement = subbyRoot;
      this.Root.appendChild(subbyRoot);
    }
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.classList.add("fxs-movie-subtitle", "relative", "text-2xl");
    el.style.cssText = "text-stroke: 4px black; color:white;";
    el.innerHTML = Locale.stylize(text);
    this.subtitleElement.appendChild(el);
    return el;
  }
  clearMovie() {
    if (this.currentMovie) {
      const stopAudioEvent = this.currentMovie.StopAudio ?? STOP_MOVIE_AUDIO_EVENT;
      UI.sendAudioEvent(stopAudioEvent);
    }
    this.removeVideoElement();
    this.currentMovie = null;
    this.currentMovieType = null;
    this.currentMovieSubtitles = null;
    this.movieVariants = null;
  }
  movieSort(a, b) {
    if (a.Locale == b.Locale) {
      const resolution = this.displayResolution;
      if (a.Resolution == b.Resolution) {
        return 0;
      } else if (a.Resolution <= resolution) {
        if (b.Resolution <= resolution) {
          return a.Resolution > b.Resolution ? -1 : 1;
        } else {
          return -1;
        }
      } else if (a.Resolution > resolution) {
        if (b.Resolution > resolution) {
          return a.Resolution > b.Resolution ? 1 : -1;
        } else {
          return 1;
        }
      } else {
        return -1;
      }
    } else {
      const locale = this.displayLocale;
      if (a.Locale == locale) {
        return -1;
      } else if (b.Locale == locale) {
        return 1;
      } else if (a.Locale == "en_US") {
        return -1;
      } else if (b.Locale == "en_US") {
        return 1;
      } else {
        return 0;
      }
    }
  }
  getMovieVariants(movieType, movieResolution, movieLocale) {
    const movieVariants = [];
    const configMovies = Database.query("config", "select * from Movies");
    if (configMovies) {
      for (const m of configMovies) {
        if (m.MovieType == movieType && (movieResolution == null || m.Resolution == movieResolution) && (movieLocale == null || m.Locale == movieLocale)) {
          movieVariants.push(m);
        }
      }
    }
    if (UI.isInGame()) {
      const inGameMovies = Database.query("gameplay", "select * from Movies");
      if (inGameMovies) {
        for (const m of inGameMovies) {
          if (m.MovieType == movieType && (movieResolution == null || m.Resolution == movieResolution) && (movieLocale == null || m.Locale == movieLocale)) {
            movieVariants.push(m);
          }
        }
      }
    }
    movieVariants.sort(this.movieSort.bind(this));
    return movieVariants;
  }
  playNextVariant() {
    const movie = this.movieVariants ? this.movieVariants[0] : null;
    if (movie) {
      this.removeVideoElement();
      this.movieVariants?.splice(0, 1);
      this.currentMovie = movie;
      this.currentMovieSubtitles = null;
      this.addVideoElement(this.currentMovie.Url);
      if (this.showSubtitles && movie.Subtitles) {
        this.fetchSubtitles(movie.Subtitles).then((cues) => {
          this.currentMovieSubtitles = cues;
        }).catch((e) => void e).finally(() => {
          this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
        });
      } else {
        this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
      }
    } else {
      console.error(`No valid movie found for ${this.currentMovieType}`);
      this.onMovieEnded();
    }
  }
  playMovie(movieType) {
    const attrSelectResolution = this.Root.getAttribute("data-movie-select-resolution");
    const attrSelectLocale = this.Root.getAttribute("data-movie-select-locale");
    let movieResolution;
    if (attrSelectResolution) {
      movieResolution = Number.parseInt(attrSelectResolution);
    }
    let movieLocale;
    if (attrSelectLocale) {
      movieLocale = attrSelectLocale;
    }
    this.movieVariants = this.getMovieVariants(movieType, movieResolution, movieLocale);
    if (!this.movieVariants || this.movieVariants.length == 0) {
      console.error(`No movie definitions found for ${movieType}`);
      this.onMovieEnded();
    }
    this.currentMovieType = movieType;
    this.playNextVariant();
  }
  updateBackdrop() {
    const attrNoBackdrop = this.Root.getAttribute("data-hide-backdrop");
    const useBackdrop = attrNoBackdrop == null || attrNoBackdrop[0] != "t" && attrNoBackdrop[0] != "1";
    if (useBackdrop) {
      this.Root.style.backgroundColor = "black";
    } else {
      this.Root.style.backgroundColor = "";
    }
  }
  async fetchSubtitles(url) {
    const content = await asyncLoad(url);
    return parseVTT(content);
  }
}
Controls.define("fxs-movie", {
  createInstance: FxsMovie,
  description: "Full-screen movie player",
  classNames: ["flex", "justify-center", "items-center", "pointer-events-auto"],
  attributes: [
    {
      name: "data-movie-id",
      description: "The ID of the movie to play.  This component will pick the URL based on display resolution and locale.",
      required: true
    },
    {
      name: "data-movie-select-resolution",
      description: "The component will use only this resolution to select movies from.",
      required: false
    },
    {
      name: "data-movie-select-locale",
      description: "The component will use only this locale to select movies from.",
      required: false
    },
    {
      name: "data-movie-fit-mode",
      description: "Supported values are either contain (default) or cover.  Behaves similar to object-fit."
    },
    {
      name: "data-force-subtitles",
      description: "Force subtitles to be shown or hidden, regardless of user options."
    },
    {
      name: "data-hide-backdrop",
      description: "Do not use a solid black backdrop for the movie.  NOTE: A backdrop may still exist in order to support skipping."
    },
    {
      name: "data-prevent-skipping",
      description: "The movie cannot be skipped.  By default it is skippable"
    }
  ]
});

class FxsOrnament1 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<div class='ornamentcontainer'>
		<div class='left'></div>
		<div class='right'></div>
		</div>`;
  }
}
Controls.define("fxs-ornament1", {
  createInstance: FxsOrnament1,
  description: "Ornament style 1, centered with curls and hex.",
  classNames: ["fxs-ornament1"],
  attributes: []
});
class FxsOrnament2 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<img src='fs://game/core/ui/themes/default/img/Ornament_centerDivider_withHex.png'>`;
  }
}
Controls.define("fxs-ornament2", {
  createInstance: FxsOrnament2,
  description: "Ornament style 2, centered hex with flat wings fading to transparent.",
  classNames: ["fxs-ornament2"],
  attributes: []
});
class FxsOrnament3 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<div class='ornamentcontainer'>
		<div class='left'></div>
		<div class='right'></div>
		</div>`;
  }
}
Controls.define("fxs-ornament3", {
  createInstance: FxsOrnament3,
  description: "Ornament style 3, simple centered line fading wings to transparent.",
  classNames: ["fxs-ornament3"],
  attributes: []
});

class FxsProgressBar extends Component {
  bar = null;
  caption = null;
  stepIconContainer = null;
  _stepData = [];
  constructor(root) {
    super(root);
    this.buildProgressBar();
  }
  onAttach() {
    super.onAttach();
    if (this.Root.getAttribute("value") == null) {
      this.Root.setAttribute("value", "0");
    }
  }
  /** @description Override to establish a custom look for the progress bar.  */
  buildProgressBar() {
    const frag = document.createDocumentFragment();
    const bg = document.createElement("div");
    bg.classList.value = "progress-bar-background w-full";
    frag.appendChild(bg);
    const border = document.createElement("div");
    border.classList.value = "progress-bar-border w-fullp-px";
    bg.appendChild(border);
    this.bar = document.createElement("div");
    this.bar.classList.value = "progress-bar-tracker flex items-center h-full";
    border.appendChild(this.bar);
    const trackerBorder = document.createElement("div");
    trackerBorder.classList.value = "progress-bar-border w-full h-full";
    this.bar.appendChild(trackerBorder);
    this.stepIconContainer = document.createElement("div");
    this.stepIconContainer.classList.add("step-icon-container");
    border.appendChild(this.stepIconContainer);
    this.caption = document.createElement("div");
    this.caption.classList.add("bar-caption");
    border.appendChild(this.caption);
    this.Root.appendChild(frag);
  }
  set stepData(stepData) {
    this._stepData = stepData;
    this.realizeStepIcons();
  }
  realizeStepIcons() {
    if (this._stepData.length <= 0) {
      return;
    }
    if (!this.stepIconContainer) {
      console.error("fxs-progress-bar: Attempting to realizeStepIcons with no valid stepIconContainer!");
      return;
    }
    while (this.stepIconContainer.hasChildNodes()) {
      this.stepIconContainer.removeChild(this.stepIconContainer.lastChild);
    }
    const currentProgressString = this.Root.getAttribute("value");
    const currentProgress = currentProgressString ? Math.min(Math.max(0, parseFloat(currentProgressString)), 1) : 0;
    this._stepData.forEach((stepData) => {
      const stepIconBg = document.createElement("div");
      stepIconBg.setAttribute("tabindex", "-1");
      stepIconBg.classList.value = "step-icon-bg -top-1 size-11";
      stepData.classes?.forEach((className) => {
        stepIconBg.classList.add(className);
      });
      stepIconBg.style.setProperty("--step-offset", (stepData.progressAmount * 100 - 5).toString() + "%");
      const stepIcon = document.createElement("div");
      stepIcon.classList.value = "step-icon size-11 absolute top-0 left-0 bg-center bg-contain bg-no-repeat pointer-events-auto";
      if (stepData == this._stepData[this._stepData.length - 1]) {
        stepIcon.classList.add("final-stage");
      } else {
        stepIcon.style.backgroundImage = stepData.icon;
      }
      if (stepData.description) {
        stepIcon.setAttribute("data-tooltip-content", stepData.description);
      }
      stepIconBg.appendChild(stepIcon);
      if (stepData.progressAmount < currentProgress) {
        const checkMark = document.createElement("div");
        checkMark.classList.value = "absolute self-center size-6 progress-bar-check-icon bg-contain bg-center -bottom-7";
        stepIconBg.appendChild(checkMark);
      } else {
        const stepTurnContainer = document.createElement("div");
        stepTurnContainer.classList.value = "absolute flex flex-row self-center justify-center -bottom-7";
        const stepTurnNumber = document.createElement("div");
        stepTurnNumber.classList.value = "font-body text-sm";
        const turnString = stepData.progressUntilThisStep && stepData.progressUntilThisStep < 0 ? "--" : `${stepData.progressUntilThisStep}`;
        stepTurnNumber.innerHTML = turnString;
        stepTurnContainer.appendChild(stepTurnNumber);
        const stepTurnIcon = document.createElement("div");
        stepTurnIcon.classList.value = "ml-2 size-5 bg-contain bg-center step-turn-icon";
        stepTurnContainer.appendChild(stepTurnIcon);
        stepIconBg.appendChild(stepTurnContainer);
      }
      this.stepIconContainer?.appendChild(stepIconBg);
    });
  }
  onAttributeChanged(name, _oldValue, newValue) {
    super.onAttributeChanged(name, _oldValue, newValue);
    switch (name) {
      case "value":
        if (!this.bar) {
          console.error("fxs-progress-bar: Invalid bar element!");
          break;
        }
        const parsedValue = parseFloat(newValue);
        if (Number.isNaN(parsedValue)) {
          console.error("fxs-progress-bar: Can't parse value attribute!");
          break;
        }
        const normalizedValue = Math.min(Math.max(0, parsedValue), 1);
        this.bar.style.width = (normalizedValue * 100).toString() + "%";
        this.realizeStepIcons();
        break;
      case "caption":
        if (this.caption) {
          this.caption.style.visibility = "visible";
          this.caption.innerHTML = newValue;
        }
        break;
      case "caption-color":
        if (this.caption) {
          this.caption.style.color = newValue;
        }
    }
  }
}
Controls.define("fxs-progress-bar", {
  createInstance: FxsProgressBar,
  description: "A basic progress bar",
  classNames: ["fxs-progress-bar"],
  attributes: [
    {
      name: "value",
      description: "The normalized value of the progress bar."
    },
    {
      name: "caption",
      description: "The text to display over the progress bar."
    },
    {
      name: "caption-color",
      description: "The color of the caption text."
    }
  ]
});

class RadioButtonGroupChangeEvent extends CustomEvent {
  constructor(detail) {
    super("radio-button-change", {
      bubbles: false,
      cancelable: false,
      detail
    });
  }
}
class FxsRadioButton extends ChangeNotificationComponent {
  ballElement = document.createElement("div");
  highlightElement = document.createElement("div");
  engineInputEventListener = this.onEngineInput.bind(this);
  radioButtonChangeEventListener = this.onRadioButtonGroupChange.bind(this);
  mouseEnterEventListener = this.playFocusSound.bind(this);
  /**
   * If set to a value, other radio buttons with the same groupTag will be deselected when this radio button is selected.
   * If set to null, or not set, no other radio buttons will be deselected automatically.
   */
  get groupTag() {
    return this.Root.getAttribute("group-tag");
  }
  /**
   * value is the string value represented by this radio button, not it's checked state.
   */
  get value() {
    const value = this.Root.getAttribute("value");
    if (!value) {
      throw new Error("fxs-radio-button: value attribute was null");
    }
    return value;
  }
  _isChecked = false;
  get isChecked() {
    return this._isChecked;
  }
  set isChecked(value) {
    this._isChecked = value;
    const selectedAttribute = this.Root.getAttribute("selected");
    if (selectedAttribute === "true" && !this.isChecked) {
      this.Root.setAttribute("selected", "false");
    } else if (selectedAttribute === "false" && this.isChecked) {
      this.Root.setAttribute("selected", "true");
    }
  }
  get disabled() {
    return this.Root.getAttribute("disabled") === "true";
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value.toString());
  }
  get isTiny() {
    return this.Root.getAttribute("is-tiny") === "true";
  }
  get isSoundDisabled() {
    return this.Root.getAttribute("sound-disabled") === "true";
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputEventListener);
    window.addEventListener("radio-button-change", this.radioButtonChangeEventListener);
    this.Root.addEventListener("mouseenter", this.mouseEnterEventListener);
    if (!this.Root.hasAttribute("data-audio-group-ref")) {
      this.Root.setAttribute("data-audio-group-ref", "radio-button");
    }
    this.Root.listenForWindowEvent(
      InputEngineEventName,
      (inputEvent) => {
        if (inputEvent.detail.name == "touch-complete") {
          this.Root.classList.remove("pressed");
        }
      },
      true
    );
  }
  onDetach() {
    window.removeEventListener("radio-button-change", this.radioButtonChangeEventListener);
    this.Root.removeEventListener("engine-input", this.engineInputEventListener);
    this.Root.removeEventListener("mouseenter", this.mouseEnterEventListener);
    super.onDetach();
  }
  playPressSound() {
    this.playSound("data-audio-press", "data-audio-press-ref");
  }
  playFocusSound() {
    this.playSound("data-audio-focus", "data-audio-focus-ref");
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "touch-touch") {
      this.Root.classList.add("pressed");
      if (!this.disabled && !this.isChecked) {
        this.playPressSound();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.status != InputActionStatuses.START && inputEvent.detail.status != InputActionStatuses.FINISH || this.disabled || this.isChecked) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
      if (inputEvent.detail.status == InputActionStatuses.START) {
        this.playPressSound();
        return;
      }
      if (inputEvent.detail.status == InputActionStatuses.FINISH) {
        if (!this.isSoundDisabled) {
          this.playSound("data-audio-activate", "data-audio-activate-ref");
        }
        this.toggle();
        window.dispatchEvent(new ActivatedComponentChangeEvent(null));
        this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  onRadioButtonGroupChange(event) {
    const { groupTag, value } = event.detail;
    if (groupTag === this.groupTag && value !== this.value && this.isChecked) {
      this.toggle(false);
    }
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "disabled":
        this.updateRadioButtonElements();
        break;
      case "selected":
        this.toggle(newValue === "true");
        break;
      default:
        break;
    }
  }
  toggle(force = void 0) {
    const wasChecked = this.isChecked;
    this.isChecked = force ?? !this.isChecked;
    if (wasChecked === this.isChecked) {
      return;
    }
    const value = this.value;
    const valueChangeEvent = new ComponentValueChangeEvent({
      isChecked: this.isChecked,
      value
    });
    const cancelled = !this.Root.dispatchEvent(valueChangeEvent);
    if (cancelled) {
      this.isChecked = wasChecked;
      return;
    }
    const groupTag = this.groupTag;
    if (this.isChecked && groupTag) {
      window.dispatchEvent(new RadioButtonGroupChangeEvent({ value, groupTag }));
    }
    this.updateRadioButtonElements();
  }
  updateRadioButtonElements() {
    this.ballElement.classList.toggle("opacity-0", !this.isChecked);
    this.highlightElement.classList.toggle("img-radio-button-focus", !this.isChecked);
    this.highlightElement.classList.toggle("img-radio-button-on-focus", this.isChecked);
    const disabled = this.disabled;
    this.Root.classList.toggle("cursor-not-allowed", disabled);
    this.Root.classList.toggle("cursor-pointer", !disabled);
    this.highlightElement.classList.toggle("hidden", disabled);
  }
  render() {
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    this.Root.classList.add(
      "group",
      "relative",
      "flex",
      "justify-center",
      "items-center",
      "img-radio-button",
      "cursor-pointer",
      "pointer-events-auto"
    );
    if (this.isTiny) {
      this.Root.classList.add("size-4");
    } else if (isMobileViewExperience) {
      this.Root.classList.add("size-10");
    } else {
      this.Root.classList.add("size-8");
    }
    this.Root.classList.add(this.isTiny ? "size-4" : "size-8");
    this.ballElement.classList.value = !this.isTiny && isMobileViewExperience ? "img-radio-button-ball-lg" : "img-radio-button-ball";
    this.highlightElement.classList.value = "absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity";
    this.Root.appendChild(this.ballElement);
    this.Root.appendChild(this.highlightElement);
    this.updateRadioButtonElements();
  }
}
Controls.define("fxs-radio-button", {
  createInstance: FxsRadioButton,
  description: "A radio-button primitive",
  classNames: ["fxs-radio-button"],
  attributes: [
    {
      name: "disabled"
    },
    {
      name: "selected",
      description: "Whether or not the radio button is 'ticked'."
    }
  ],
  images: [
    "fs://game/base_radio-bg.png",
    "fs://game/base_radio-ball.png",
    "fs://game/base_radio-bg-focus.png",
    "fs://game/base_radio-bg-on-focus.png"
  ]
});

class FxsRewardButton extends FxsActivatable {
  mainText = document.createElement("div");
  actionText = document.createElement("div");
  navContainer = null;
  storyType = "";
  leaderCivChoice = "";
  rewardText = "";
  //tooltip text
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.storyType = this.Root.getAttribute("story-type") ?? "DEFAULT";
    this.leaderCivChoice = this.Root.getAttribute("leader-civ") ?? "NONE";
    this.rewardText = this.Root.getAttribute("reward") ?? "";
    this.Root.classList.add(
      "relative",
      "flex",
      "flex-row-reverse",
      "w-full",
      "items-center",
      this.storyType == "LIGHT" ? "mb-4" : "mb-8"
    );
    const iconsStored = this.Root.getAttribute("icons");
    let icons = [];
    if (iconsStored) {
      icons = JSON.parse(iconsStored);
    } else {
      icons = [];
    }
    this.render({ icons });
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "action-key": {
        if (this.navContainer) {
          this.addOrRemoveNavHelpElement(this.navContainer, newValue);
        }
        break;
      }
      case "main-text": {
        if (newValue) {
          this.mainText.setAttribute("data-l10n-id", newValue);
        } else {
          this.mainText.removeAttribute("data-l10n-id");
        }
        break;
      }
      case "action-text": {
        if (newValue) {
          this.actionText.setAttribute("data-l10n-id", newValue);
        } else {
          this.actionText.removeAttribute("data-l10n-id");
        }
        break;
      }
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  render({ icons }) {
    const frag = document.createDocumentFragment();
    const allTextContainer = document.createElement("div");
    allTextContainer.classList.add(
      "fxs-reward-button__text-container",
      "w-full",
      "flex",
      "flex-1",
      "flex-col",
      "text-center",
      "justify-center",
      "align-items",
      "min-h-16"
    );
    this.mainText.classList.add(
      "fxs-reward-button__main-text",
      "w-full",
      "justify-center",
      "font-body-sm",
      "pl-2",
      "pr-6",
      this.storyType == "LIGHT" ? "py-0.5" : "py-2"
    );
    allTextContainer.appendChild(this.mainText);
    if (this.Root.getAttribute("action-text") !== "") {
      const subtextContainer = document.createElement("div");
      subtextContainer.classList.add(
        "fxs-reward-button__action",
        "w-full",
        "pr-4",
        "pl-1",
        this.storyType == "LIGHT" ? "py-0.5" : "py-2"
      );
      this.actionText.classList.add("fxs-reward-button__action-text", "font-body-xs", "mt-1", "text-accent-3");
      subtextContainer.appendChild(this.actionText);
      allTextContainer.appendChild(subtextContainer);
    }
    if (this.leaderCivChoice == "LEADERCIV") {
      const civLeaderChoiceIndicator = document.createElement("div");
      civLeaderChoiceIndicator.classList.add(
        "fxs-reward__civ-leader-option",
        "absolute",
        "w-full",
        "h-full",
        "opacity-15",
        this.storyType == "LIGHT" ? "left-14" : "left-16"
      );
      allTextContainer.appendChild(civLeaderChoiceIndicator);
      this.rewardText = this.rewardText + Locale.stylize("LOC_UI_NARRATIVE_LEADER_CIV_CHOICE");
    }
    frag.appendChild(allTextContainer);
    this.Root.appendChild(frag);
    if (icons.length == 0) {
      this.Root.setAttribute("data-tooltip-content", this.rewardText);
      return;
    }
    this.navContainer = this.Root.querySelector(".fxs-button__nav");
    this.addOrRemoveNavHelpElement(this.navContainer, this.Root.getAttribute("action-key"));
    const rewardHolder = document.createElement("div");
    rewardHolder.classList.add("fxs-reward-button__reward-holder", "justify-center", "align-center");
    rewardHolder.classList.add("h-18", "w-18");
    let warningBarAdded = false;
    let iconCounter = 0;
    let iconsLength = icons.length;
    const rewardIconArrange = document.createElement("div");
    rewardIconArrange.classList.add(
      "reward-icons-arrange",
      "w-18",
      "h-full",
      "flex",
      "flex-row",
      "flex-wrap",
      "justify-center",
      "content-center"
    );
    if (icons && iconsLength > 0) {
      icons.forEach((icon) => {
        if (icon.RewardIconType == "QUEST") {
          const quest = document.createElement("div");
          quest.classList.value = "absolute w-8 h-full -left-9 flex flex-col justify-center";
          const questIcon = document.createElement("div");
          questIcon.classList.add("fxs-reward__quest-icon");
          quest.appendChild(questIcon);
          this.Root.appendChild(quest);
          this.rewardText = this.rewardText + Locale.stylize("LOC_UI_NARRATIVE_QUEST_INDICATOR");
          iconsLength = iconsLength - 1;
          if (iconsLength == 0) {
            rewardHolder.classList.add("hidden");
          }
          return;
        }
        iconCounter++;
        const rewardIconContainer = document.createElement("div");
        rewardIconContainer.classList.add("reward-icon-individual", "self-center");
        const rewardIcon = document.createElement("div");
        rewardIcon.classList.add("fxs-reward-button__icon", "w-full", "h-full", "pointer-events-none");
        let targetIconPrefix = "NAR_REW_";
        if (icon.Negative) {
          const warning = document.createElement("div");
          if (!warningBarAdded) {
            warning.classList.add(
              "reward-warning",
              "absolute",
              "w-full",
              "h-2",
              "-mb-px",
              "ml-18",
              "bottom-0"
            );
            this.Root.appendChild(warning);
            allTextContainer.classList.add("mb-2");
            warningBarAdded = true;
          }
          targetIconPrefix = targetIconPrefix + "NEG_";
        }
        const iconPath = UI.getIconCSS(targetIconPrefix + icon.RewardIconType, "DEFAULT");
        if (iconPath != "") {
          rewardIcon.style.backgroundImage = iconPath;
        } else {
          const iconCSS = UI.getIconCSS(icon.RewardIconType, "DEFAULT");
          rewardIcon.style.backgroundImage = iconCSS;
        }
        rewardIconContainer.appendChild(rewardIcon);
        if (iconsLength == 1) {
          rewardIconContainer.classList.add("w-12", "h-12");
        }
        if (iconsLength == 2) {
          rewardIconContainer.classList.add("w-9", "h-9");
          if (iconCounter == 2) {
            rewardIconContainer.classList.add("-ml-3");
          }
        }
        if (iconsLength > 2) {
          rewardIconContainer.classList.add("w-7", "h-7");
          if (iconCounter > 2) {
            rewardIconContainer.classList.add("-mt-2");
          }
          if (iconCounter == 2 || iconCounter == 4) {
            rewardIconContainer.classList.add("-ml-2");
          }
        }
        rewardIconArrange.appendChild(rewardIconContainer);
        rewardHolder.appendChild(rewardIconArrange);
      });
      rewardIconArrange.classList.add(iconsLength > 2 ? "p-3" : "p-1");
    }
    this.Root.setAttribute("data-tooltip-content", this.rewardText);
    this.Root.appendChild(rewardHolder);
  }
}
Controls.define("fxs-reward-button", {
  createInstance: FxsRewardButton,
  description: "A button to display narrative multiple reward icons and various indicators of story status",
  classNames: ["fxs-reward-button"],
  attributes: [
    {
      name: "main-text",
      description: "The main text / description on the button. StoryTextTypes.OPTION"
    },
    {
      name: "action-text",
      description: "Optional additional text that is more instructive than descriptive. StoryTextTypes.IMPERATIVE"
    },
    {
      name: "reward",
      description: "The text label of the button. StoryTextTypes.REWARD"
    },
    {
      name: "icon",
      description: "Reward button can display up to 4 icons + a quest icon"
    },
    {
      name: "leaderCiv",
      description: "Indicates if option is available because of Leader or Civilization choice"
    },
    {
      name: "action-key",
      description: "The action key for inline nav help, usually translated to a button icon."
    }
  ],
  images: [
    "fs://game/hud_sidepanel_list-bg.png",
    "fs://game/hud_list-focus_frame.png",
    "fs://game/nar_reg_negative.png",
    "fs://game/hud_civics-icon_frame",
    "fs://game/popup_silver_laurels",
    "fs://game/nar_quest_indicator.png"
  ],
  tabIndex: -1
});

var resizeThumb = /* @__PURE__ */ ((resizeThumb2) => {
  resizeThumb2["NONE"] = "0";
  resizeThumb2["RESIZE"] = "1";
  return resizeThumb2;
})(resizeThumb || {});
class ScrollIntoViewEvent extends CustomEvent {
  constructor() {
    super("scroll-into-view", { bubbles: true, cancelable: false });
  }
}
class ScrollAtBottomEvent extends CustomEvent {
  constructor() {
    super("scroll-at-bottom", { bubbles: true, cancelable: false });
  }
}
class ScrollExitBottomEvent extends CustomEvent {
  constructor() {
    super("scroll-exit-bottom", { bubbles: true, cancelable: false });
  }
}
class FxsScrollable extends Component {
  static MIN_SIZE_PIXELS = 24;
  static MIN_SIZE_OVERFLOW = 2;
  static DECORATION_SIZE = 24;
  /** scrollArea is the container that grows unbounded (important for ResizeObserver) */
  scrollArea;
  /** scrollAreaContainer is the container that scrolls and is the max height of its parent. */
  scrollAreaContainer;
  scrollbarTrack;
  scrollbarThumb;
  thumbHighlight;
  thumbActive;
  navHelp = null;
  isDraggingScroll = false;
  isMouseOver = false;
  allowScroll = true;
  scrollbarPrevVisibility = false;
  isHandleGamepadPan = false;
  isHandleNavPan = false;
  allowMousePan = false;
  allowScrollOnResizeWhenBottom = false;
  // #region Gamepad Pan Data
  isPanning = false;
  gamepadPanAnimationId = -1;
  gamepadPanY = 0;
  isStillPanningCheck = 0;
  lastPanTimestamp = 0;
  panRate = 0.75;
  // #endregion
  mouseMoveListener = this.onMouseMove.bind(this);
  mouseUpListener = this.onMouseUp.bind(this);
  mouseEnterListener = this.onMouseEnter.bind(this);
  mouseLeaveListener = this.onMouseLeave.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  navigationInputListener = this.onNavigationInput.bind(this);
  scrollBarEngineInputListener = this.onScrollBarEngineInput.bind(this);
  gamepadPanAnimationCallback = this.onGamepadPanUpdate.bind(this);
  resizeObserver = new ResizeObserver(this.onResize.bind(this));
  windowEngineInputListener = this.onWindowEngineInput.bind(this);
  engineInputProxy;
  navigationInputProxy;
  scrollableAreaSize = 0;
  scrollableContentSize = 0;
  thumbRect;
  thumbSize = 0;
  thumbDelta = {
    x: 0,
    y: 0
  };
  maxScroll = 0;
  scrollPosition = 0;
  maxThumbPosition = 0;
  thumbScrollPosition = 0;
  dragInProgress = false;
  touchDragY = 0;
  isScrollAtBottom = true;
  get proxyMouse() {
    return this.Root.getAttribute("proxy-mouse") == "true";
  }
  constructor(root) {
    super(root);
    const flexAttribute = this.Root.getAttribute("flex");
    const flexClass = flexAttribute && flexAttribute == "initial" ? "flex-initial" : "flex-auto";
    this.Root.setAttribute("resize-thumb", "0" /* NONE */);
    this.scrollPosition = 0;
    this.thumbScrollPosition = 0;
    this.scrollbarThumb = document.createElement("div");
    this.scrollbarThumb.classList.add("fxs-scrollbar__thumb--vertical");
    this.scrollbarThumb.style.transform = "none";
    const thumbInner = document.createElement("div");
    thumbInner.classList.add("fxs-scrollbar__thumb-bg--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbInner);
    this.thumbHighlight = document.createElement("div");
    this.thumbHighlight.classList.add("fxs-scrollbar__thumb-bg-highlight--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbHighlight);
    this.thumbActive = document.createElement("div");
    this.thumbActive.classList.add("fxs-scrollbar__thumb-bg-active--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbActive);
    this.scrollbarTrack = document.createElement("div");
    this.scrollbarTrack.className = "fxs-scrollbar__track--vertical w-4 my-6";
    this.scrollbarTrack.appendChild(this.scrollbarThumb);
    const contentClass = this.Root.getAttribute("content-class") ?? "";
    this.scrollArea = document.createElement("div");
    this.scrollArea.classList.add(
      "flex",
      "flex-col",
      "justify-start",
      "pointer-events-auto",
      "fxs-scrollable-content",
      "pointer-events-auto"
    );
    this.scrollArea.style.flexShrink = "0";
    if (contentClass) {
      this.scrollArea.classList.add(...contentClass.split(" "));
    }
    this.scrollAreaContainer = document.createElement("div");
    this.scrollAreaContainer.classList.add(
      "flex",
      "flex-col",
      flexClass,
      "fxs-scrollable-content-container",
      "max-w-full",
      "max-h-full",
      "overflow-y-scroll"
    );
    this.scrollAreaContainer.appendChild(this.scrollArea);
    this.attachChildEventListeners();
  }
  onInitialize() {
    while (this.Root.hasChildNodes()) {
      const node = this.Root.firstChild;
      if (node) {
        this.scrollArea.appendChild(node);
      } else {
        break;
      }
    }
    this.Root.classList.add("relative", "max-h-full", "max-w-full", "pointer-events-auto");
    if (this.scrollArea.lastElementChild) {
      this.scrollArea.lastElementChild.classList.add("fxs-scrollable-content--last");
    }
    this.Root.append(this.scrollAreaContainer, this.scrollbarTrack);
    if (!this.Root.hasAttribute("handle-gamepad-pan")) {
      this.Root.setAttribute("handle-gamepad-pan", "true");
    }
    if (!this.Root.hasAttribute("attached-scrollbar")) {
      this.Root.setAttribute("attached-scrollbar", "false");
    }
  }
  onAttach() {
    super.onAttach();
    this.hide();
    delayByFrame(this.resizeScrollThumb.bind(this), 2);
    this.resizeObserver.observe(this.scrollArea, { box: "border-box" });
    this.Root.listenForWindowEvent(InputEngineEventName, this.windowEngineInputListener);
  }
  onAttributeChanged(name, oldValue, newValue) {
    if (name == "scrollpercent") {
      const value = newValue ? parseFloat(newValue) : 0;
      this.scrollToPercentage(value * this.maxScroll);
    } else if (name == "handle-gamepad-pan") {
      this.isHandleGamepadPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "handle-nav-pan") {
      this.isHandleNavPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "attached-scrollbar" && oldValue != newValue) {
      this.setIsAttachedLayout(newValue == "true");
    } else if (name == "allow-mouse-panning" && oldValue != newValue) {
      this.allowMousePan = newValue == "true";
    } else if (name == "scroll-on-resize-when-bottom") {
      this.allowScrollOnResizeWhenBottom = newValue == "true";
    }
  }
  onDetach() {
    this.resizeObserver.disconnect();
    if (this.engineInputProxy) {
      this.engineInputProxy.removeEventListener("engine-input", this.engineInputListener);
    }
    if (this.navigationInputProxy) {
      this.navigationInputProxy.removeEventListener(NavigateInputEventName, this.navigationInputListener);
    }
    super.onDetach();
  }
  /**
   * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setEngineInputProxy(proxy) {
    if (this.engineInputProxy) {
      this.engineInputProxy.removeEventListener("engine-input", this.engineInputListener);
    }
    if (proxy) {
      this.engineInputProxy = proxy;
      this.engineInputProxy.addEventListener("engine-input", this.engineInputListener);
    }
  }
  /**
   * Sets a proxy for navigation input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setNavigationInputProxy(proxy) {
    if (this.navigationInputProxy) {
      this.navigationInputProxy.removeEventListener(NavigateInputEventName, this.navigationInputListener);
    }
    if (proxy) {
      this.navigationInputProxy = proxy;
      this.navigationInputProxy.addEventListener(NavigateInputEventName, this.navigationInputListener);
    }
  }
  get currentScrollOnScrollAreaInPixels() {
    return this.scrollAreaContainer.scrollTop;
  }
  set currentScrollOnScrollAreaInPixels(value) {
    this.scrollAreaContainer.scrollTop = value;
  }
  get maxScrollOnScrollAreaInPixels() {
    return this.scrollArea.scrollHeight;
  }
  get maxScrollTop() {
    return this.scrollAreaContainer.scrollHeight - this.scrollAreaContainer.clientHeight;
  }
  getActiveDimension(rect) {
    return rect.height;
  }
  onResize(_entries, _observer) {
    const scrollWasAtbottom = this.isScrollAtBottom;
    this.isScrollAtBottom = false;
    delayByFrame(() => {
      this.resizeScrollThumb();
      if (this.allowScrollOnResizeWhenBottom && scrollWasAtbottom) {
        delayByFrame(() => {
          this.scrollToPercentage(1);
        }, 4);
      }
    }, 2);
  }
  /**
   * Converts the mouse coordinates to a scroll percentage.
   * @param event
   */
  mouseCoordinatesToScroll(event) {
    const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
    return (event.clientY - mouseAreaRect.y + this.thumbDelta.y) / mouseAreaRect.height;
  }
  onWindowEngineInput(inputEvent) {
    let handled = false;
    switch (inputEvent.detail.name) {
      case "touch-complete":
        this.thumbActive.classList.remove("opacity-100");
        this.isDraggingScroll = false;
        this.dragInProgress = false;
        handled = true;
        break;
      case "mousebutton-left":
      case "touch-pan":
        if (inputEvent.detail.status == InputActionStatuses.DRAG) {
          if (inputEvent.detail.name == "mousebutton-left" && !this.allowMousePan) {
            return;
          }
          if (inputEvent.detail.isMouse && Cursor.target instanceof HTMLElement && Cursor.target.closest(".no-pan")) {
            return;
          }
          const scrollAreaRect = this.scrollArea.getBoundingClientRect();
          const x = inputEvent.detail.x;
          const y = inputEvent.detail.y;
          if (x < scrollAreaRect.left || x > scrollAreaRect.right) {
            this.dragInProgress = false;
          }
          if (this.isDraggingScroll) {
            handled = true;
            if (inputEvent.detail.name == "touch-pan") {
              if (this.thumbSize == 0) {
                this.setScrollBoundaries();
              }
              const trackRect = this.scrollbarTrack.getBoundingClientRect();
              const scrollPercentage = (inputEvent.detail.y - trackRect.y + this.thumbDelta.y) / trackRect.height;
              this.scrollToPercentage(scrollPercentage);
            }
          } else if (this.dragInProgress) {
            this.currentScrollOnScrollAreaInPixels += this.touchDragY - y;
            this.setScrollThumbPosition();
            this.touchDragY = y;
            handled = true;
          }
        } else if (this.allowMousePan && (this.isDraggingScroll || this.dragInProgress) && inputEvent.detail.name == "mousebutton-left" && inputEvent.detail.status == InputActionStatuses.FINISH) {
          this.thumbActive.classList.remove("opacity-100");
          this.isDraggingScroll = false;
          this.dragInProgress = false;
          handled = true;
        }
        break;
    }
    if (handled) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan" && this.isHandleGamepadPan && !this.isHandleNavPan) {
      if (this.allowScroll) {
        this.onGamepadPan(inputEvent);
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.detail.name == "touch-pan" || this.allowMousePan && inputEvent.detail.name == "mousebutton-left") {
      this.onTouchOrMousePan(inputEvent);
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const isProxy = inputEvent.target == this.engineInputProxy;
    const shouldHandleMouseWheel = this.isMouseOver || this.proxyMouse && isProxy;
    const isMouseWheelEvent = inputEvent.detail.name == "mousewheel-up" || inputEvent.detail.name == "mousewheel-down";
    if (shouldHandleMouseWheel && isMouseWheelEvent) {
      if (this.allowScroll) {
        if (isProxy) {
          const oldScroll = this.currentScrollOnScrollAreaInPixels;
          const newScroll = utils.clamp(oldScroll - inputEvent.detail.x, 0, this.maxScrollTop);
          this.currentScrollOnScrollAreaInPixels = newScroll;
        }
        this.setScrollThumbPosition();
        inputEvent.stopPropagation();
      }
      inputEvent.preventDefault();
    }
    if (isProxy) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left") {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigationInput(inputEvent) {
    if (!this.isHandleNavPan) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "nav-move":
        if (this.allowScroll) {
          this.onGamepadPan(inputEvent);
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onScrollBarEngineInput(inputEvent) {
    if (inputEvent.detail.name != "touch-pan") {
      return;
    }
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.thumbActive.classList.add("opacity-100");
        const thumbRect = this.scrollbarThumb.getBoundingClientRect();
        this.thumbDelta.x = thumbRect.x - inputEvent.detail.x;
        this.thumbDelta.y = thumbRect.y - inputEvent.detail.y;
        this.isDraggingScroll = true;
        inputEvent.preventDefault();
        inputEvent.stopPropagation();
        break;
      default:
        break;
    }
  }
  /**
   * Attaches all event listeners for the component.
   */
  attachChildEventListeners() {
    this.scrollbarTrack.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
    });
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("mouseenter", this.mouseEnterListener);
    this.Root.addEventListener("mouseleave", this.mouseLeaveListener);
    this.scrollbarTrack.addEventListener("mousedown", (event) => {
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    });
    this.scrollbarTrack.addEventListener(InputEngineEventName, this.scrollBarEngineInputListener);
    this.scrollbarThumb.addEventListener("mousedown", (event) => {
      Audio.playSound("data-audio-scroll-thumb-down");
      this.scrollbarThumb.classList.add("fxs-scrollable-thumb--active");
      this.isDraggingScroll = true;
      const thumbRect = this.scrollbarThumb.getBoundingClientRect();
      this.thumbDelta.x = thumbRect.x - event.clientX;
      this.thumbDelta.y = thumbRect.y - event.clientY;
      window.addEventListener("mousemove", this.mouseMoveListener);
      window.addEventListener("mouseup", this.mouseUpListener, true);
    });
    this.scrollbarThumb.addEventListener("mouseleave", () => {
      if (!this.isDraggingScroll) {
        this.scrollbarThumb.classList.add("fxs-scrollable-thumb--hover-off");
      }
    });
    this.scrollArea.addEventListener(
      "focus",
      (event) => {
        const target = event.target;
        if (target) {
          if (!target.hasAttribute("slot")) {
            this.scrollIntoView(target);
          }
        }
      },
      true
    );
  }
  /**
   * Shows the scrollbar
   */
  show() {
    this.allowScroll = true;
    this.scrollbarTrack.classList.remove("hidden");
    this.scrollbarPrevVisibility = true;
  }
  /**
   * Hides the scrollbar
   */
  hide() {
    this.allowScroll = false;
    this.scrollbarTrack.classList.add("hidden");
    this.scrollbarPrevVisibility = false;
  }
  /**
   * On key down we scroll by the needed amount.
   * @param {KeyboardEvent} event
   */
  /** //TODO: When we update action-handler input cascade, we need to actually flow in to the
  	  scrollables, to be able to scroll when not dependent on focus.  */
  /*onKeydown(event: KeyboardEvent) {
  		if (event.target instanceof HTMLTextAreaElement) {
  			this.setScrollThumbPosition();
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.Home) {
  			this.scrollToPercentage(0);
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.End) {
  			this.scrollToPercentage(1);
  			return;
  		}
  
  		const verticalScroll = Number(event.keyCode === KeyboardKeys.DownArrow) - Number(event.keyCode === KeyboardKeys.UpArrow);
  		const horizontalScroll = Number(event.keyCode === KeyboardKeys.RightArrow) - Number(event.keyCode === KeyboardKeys.LeftArrow);
  
  		const scrollChange = this.isVertical ? verticalScroll : horizontalScroll;
  
  		if (scrollChange == 0) {
  			return;
  		}
  
  		this.scrollToPercentage(this.scrollPosition + scrollChange / 100);
  	}*/
  onMouseMove(event) {
    if (this.isDraggingScroll) {
      if (this.thumbSize == 0) {
        this.setScrollBoundaries();
      }
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    }
  }
  onMouseUp(event) {
    Audio.playSound("data-audio-scroll-thumb-up");
    window.removeEventListener("mousemove", this.mouseMoveListener);
    window.removeEventListener("mouseup", this.mouseUpListener);
    event.stopPropagation();
    this.reset();
  }
  onMouseEnter() {
    this.isMouseOver = true;
  }
  onMouseLeave() {
    this.isMouseOver = false;
  }
  setIsAttachedLayout(isAttached) {
    this.Root.classList.toggle("flex", isAttached);
    this.Root.classList.toggle("flex-row", isAttached);
    this.scrollbarTrack.classList.toggle("absolute", !isAttached);
    this.scrollbarTrack.classList.toggle("inset-y-0", !isAttached);
    this.scrollbarTrack.classList.toggle("-right-1\\.5", !isAttached);
    this.scrollbarTrack.classList.toggle("relative", isAttached);
    this.scrollAreaContainer.classList.toggle("flex-auto", isAttached);
  }
  /**
   * Scrolls to a given percentage.
   * @param {number} position - Position in percentage - from 0 to 1.
   */
  scrollToPercentage(position) {
    this.scrollPosition = utils.clamp(position, 0, isNaN(this.maxScroll) ? 0 : this.maxScroll);
    this.thumbScrollPosition = utils.clamp(position, 0, isNaN(this.maxThumbPosition) ? 0 : this.maxThumbPosition);
    const calcScrollPosition = this.scrollPosition / this.maxScroll;
    if (!isNaN(calcScrollPosition)) {
      this.scrollArea.setAttribute("current-scroll-position", calcScrollPosition.toString());
    }
    const scrollPositionInPixels = ~~(this.maxScrollOnScrollAreaInPixels * this.scrollPosition);
    this.currentScrollOnScrollAreaInPixels = scrollPositionInPixels;
    requestAnimationFrame(() => {
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.height ?? 0);
      this.scrollbarThumb.style.transform = `translateY(${offset}px)`;
    });
    this.resolveIsScrollAtBottom();
  }
  setScrollThumbPosition() {
    if (this.maxScrollOnScrollAreaInPixels > 0 && !isNaN(this.maxThumbPosition)) {
      this.scrollPosition = this.currentScrollOnScrollAreaInPixels / this.maxScrollOnScrollAreaInPixels;
      this.thumbScrollPosition = utils.clamp(this.scrollPosition, 0, this.maxThumbPosition);
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.height ?? 0);
      this.scrollbarThumb.style.transform = `translateY(${offset}px)`;
      this.scrollbarThumb.classList.remove("hidden");
    } else {
      this.scrollbarThumb.classList.add("hidden");
    }
    this.resolveIsScrollAtBottom();
  }
  scrollIntoView(target) {
    const areaRect = this.Root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (this.scrollableContentSize === 0) {
      this.resizeScrollThumb();
    }
    if (targetRect.top < areaRect.top || targetRect.bottom > areaRect.bottom) {
      let distToMove = 0;
      if (targetRect.top < areaRect.top) {
        distToMove = targetRect.top - areaRect.top;
      }
      if (targetRect.bottom > areaRect.bottom) {
        distToMove = targetRect.bottom - areaRect.bottom;
      }
      const anchorAsPercent = distToMove / this.scrollableContentSize;
      this.scrollToPercentage(this.scrollPosition + anchorAsPercent);
      target.dispatchEvent(new ScrollIntoViewEvent());
    }
  }
  /**
   * Resets the styles and thumb delta.
   */
  reset() {
    if (this.isDraggingScroll) {
      this.scrollbarThumb.classList.remove("fxs-scrollable-thumb--active");
      this.isDraggingScroll = false;
    }
    this.thumbDelta.x = 0;
    this.thumbDelta.y = 0;
  }
  setScrollBoundaries() {
    this.thumbRect = this.scrollbarThumb.getBoundingClientRect();
    this.thumbSize = this.getActiveDimension(this.thumbRect);
    this.maxScroll = (this.scrollableContentSize - this.thumbSize) / this.scrollableContentSize;
    const scrollTrackAreaSize = this.getActiveDimension(this.scrollbarTrack.getBoundingClientRect());
    this.maxThumbPosition = (scrollTrackAreaSize - this.thumbSize) / scrollTrackAreaSize;
    this.Root.dispatchEvent(new CustomEvent("scroll-is-ready", { bubbles: true }));
  }
  setScrollData() {
    this.setScrollBoundaries();
    this.setScrollThumbPosition();
  }
  /**
   * Resizes the scrollbar thumb
   * @param shouldSetScrollPositionFromLayout
   *
   */
  resizeScrollThumb() {
    const newScrollSize = this.scrollAreaContainer.clientHeight;
    if (this.scrollableAreaSize != newScrollSize) {
      this.scrollableAreaSize = newScrollSize;
    }
    this.scrollableContentSize = this.getActiveDimension({
      width: this.scrollAreaContainer.scrollWidth,
      height: this.scrollAreaContainer.scrollHeight
    });
    const scrollTrackAreaSize = newScrollSize - Layout.pixelsToScreenPixels(FxsScrollable.DECORATION_SIZE) * 2;
    const scrollbarRatio = this.scrollableAreaSize / this.maxScrollOnScrollAreaInPixels;
    const scrollbarSize = Math.max(
      scrollTrackAreaSize * scrollbarRatio,
      Layout.pixelsToScreenPixels(FxsScrollable.MIN_SIZE_PIXELS)
    );
    const showScrollbar = scrollTrackAreaSize - scrollbarSize >= FxsScrollable.MIN_SIZE_OVERFLOW;
    if (showScrollbar != this.scrollbarPrevVisibility) {
      if (showScrollbar) {
        this.show();
      } else {
        this.hide();
      }
    }
    if (showScrollbar) {
      this.scrollbarThumb.style.heightPERCENT = scrollbarRatio * 100;
    }
    delayByFrame(() => {
      if (this.Root.isConnected) {
        this.setScrollData();
      }
    }, 3);
  }
  onTouchOrMousePan(inputEvent) {
    const x = inputEvent.detail.x;
    const y = inputEvent.detail.y;
    const status = inputEvent.detail.status;
    switch (status) {
      case InputActionStatuses.START:
        const scrollAreaRect = this.scrollArea.getBoundingClientRect();
        if (x >= scrollAreaRect.left && x <= scrollAreaRect.right && y >= scrollAreaRect.top && y <= scrollAreaRect.bottom) {
          this.touchDragY = y;
          this.dragInProgress = true;
          inputEvent.preventDefault();
          inputEvent.stopPropagation();
        }
        break;
      default:
        break;
    }
  }
  onGamepadPan(inputEvent) {
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.lastPanTimestamp = performance.now();
        this.isPanning = true;
        this.gamepadPanY = inputEvent.detail.y;
        if (this.gamepadPanAnimationId == -1) {
          this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
        }
        break;
      case InputActionStatuses.UPDATE:
        this.gamepadPanY = inputEvent.detail.y;
        break;
      case InputActionStatuses.FINISH:
        this.isPanning = false;
        this.gamepadPanY = 0;
        this.isStillPanningCheck = 0;
        break;
    }
    return false;
  }
  stopPanning() {
    this.isPanning = false;
  }
  /**
   * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
   *
   * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
   */
  onGamepadPanUpdate(timestamp) {
    if (this.isStillPanningCheck >= 10) {
      this.isPanning = this.Root == document.activeElement || this.Root.contains(document.activeElement);
      this.isStillPanningCheck = 0;
    }
    if (this.isPanning) {
      if (this.engineInputProxy == void 0 && this.navigationInputProxy == void 0) {
        this.isStillPanningCheck += 1;
      }
      this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
      const diff = timestamp - this.lastPanTimestamp;
      this.lastPanTimestamp = timestamp;
      this.currentScrollOnScrollAreaInPixels -= this.gamepadPanY * diff * this.panRate;
      this.setScrollThumbPosition();
    } else {
      this.isStillPanningCheck = 0;
      this.gamepadPanY = 0;
      this.gamepadPanAnimationId = -1;
    }
  }
  getIsScrollAtBottom() {
    return this.isScrollAtBottom;
  }
  resolveIsScrollAtBottom() {
    if (this.isScrollAtBottom && this.currentScrollOnScrollAreaInPixels < this.maxScrollTop) {
      this.isScrollAtBottom = false;
      this.Root.dispatchEvent(new ScrollExitBottomEvent());
    } else if (!this.isScrollAtBottom && this.currentScrollOnScrollAreaInPixels >= this.maxScrollTop) {
      this.isScrollAtBottom = true;
      this.Root.dispatchEvent(new ScrollAtBottomEvent());
    }
  }
  showScrollNavHelpElement(enabled) {
    if (enabled) {
      if (!this.navHelp) {
        this.navHelp = document.createElement("fxs-nav-help");
        this.navHelp.setAttribute("hide-if-not-allowed", "true");
        this.navHelp.classList.add("absolute", "top-1\\/2", "-left-1\\.5", "-translate-y-1\\/2");
      }
      this.scrollbarThumb.append(this.navHelp);
      this.navHelp.setAttribute("action-key", this.isHandleNavPan ? "inline-nav-move" : "inline-scroll-pan");
    } else {
      this.navHelp?.remove();
    }
  }
}
Controls.define("fxs-scrollable", {
  createInstance: FxsScrollable,
  description: "A scrollable container that shows a scrollbar",
  classNames: ["fxs-scrollable", "fxs-scrollable-container"],
  attributes: [
    {
      name: "scrollpercent"
    },
    {
      name: "handle-gamepad-pan"
    },
    {
      name: "handle-nav-pan",
      description: "If set to 'true', this will enable scrolling by the move navigation event"
    },
    {
      name: "allow-mouse-panning",
      description: "If set to 'true', this will enable scrolling by dragging with the mosue on the background"
    },
    {
      name: "attached-scrollbar",
      description: "if set to 'true', the scrollbar will be attached to the container and take up space, instead of floating a set distance away"
    },
    {
      name: "scroll-on-resize-when-bottom",
      description: "if the scroll is at bottom, we auto scroll at bottom on resize mutation observer"
    },
    {
      name: "scroll-on-child-change-when-bottom",
      description: "if the scroll is at bottom, we auto scroll at bottom on child change mutation observer"
    }
  ],
  images: [
    "fs://game/base_scrollbar-track.png",
    "fs://game/base_scrollbar-handle-focus.png",
    "fs://game/base_scrollbar-handle.png"
  ]
});

class FxsScrollableHorizontal extends Component {
  static MIN_SIZE_PIXELS = 24;
  static MIN_SIZE_OVERFLOW = 2;
  static DECORATION_SIZE = 24;
  scrollArea;
  scrollAreaContainer;
  scrollbarTrack;
  scrollbarThumb;
  scrollBarContainer;
  thumbActive;
  navHelp = null;
  isDraggingScroll = false;
  isMouseOver = false;
  isPanning = false;
  gamepadPanX = 0;
  gamepadPanAnimationId = -1;
  allowScroll = true;
  scrollbarPrevVisibility = false;
  isHandleGamepadPan = false;
  allowMousePan = false;
  lastPanTimestamp = 0;
  panRate = 0.75;
  mouseMoveListener = this.onMouseMove.bind(this);
  mouseUpListener = this.onMouseUp.bind(this);
  mouseEnterListener = this.onMouseEnter.bind(this);
  mouseLeaveListener = this.onMouseLeave.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  gamepadPanAnimationCallback = this.onGamepadPanUpdate.bind(this);
  scrollBarEngineInputListener = this.onScrollBarEngineInput.bind(this);
  resizeObserver = new ResizeObserver(this.onResize.bind(this));
  windowEngineInputListener = this.onWindowEngineInput.bind(this);
  engineInputProxy;
  scrollableAreaSize = 0;
  scrollableContentSize = 0;
  thumbRect;
  thumbSize = 0;
  thumbDelta = {
    x: 0,
    y: 0
  };
  maxScroll = 0;
  scrollPosition = 0;
  maxThumbPosition = 0;
  thumbScrollPosition = 0;
  dragInProgress = false;
  touchDragX = 0;
  isScrollAtEnd = true;
  get maxScrollLeft() {
    return this.scrollAreaContainer.scrollWidth - this.scrollAreaContainer.clientWidth;
  }
  constructor(root) {
    super(root);
    const flexAttribute = this.Root.getAttribute("flex");
    const flexClass = flexAttribute && flexAttribute == "initial" ? "flex-initial" : "flex-auto";
    this.Root.setAttribute("resize-thumb", resizeThumb.NONE);
    this.scrollPosition = 0;
    this.thumbScrollPosition = 0;
    this.scrollBarContainer = document.createElement("div");
    this.scrollBarContainer.classList.add(
      "absolute",
      "-bottom-3",
      "inset-x-6",
      "h-4",
      "flex",
      "text-2xs",
      "justify-center",
      "pointer-events-auto"
    );
    this.scrollbarThumb = document.createElement("div");
    this.scrollbarThumb.classList.add("fxs-scrollbar__thumb--horizontal");
    this.scrollbarThumb.style.transform = "none";
    const thumbInner = document.createElement("div");
    thumbInner.classList.add("fxs-scrollbar__thumb-bg--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbInner);
    const thumbHighlight = document.createElement("div");
    thumbHighlight.classList.add("fxs-scrollbar__thumb-bg-highlight--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbHighlight);
    this.thumbActive = document.createElement("div");
    this.thumbActive.classList.add("fxs-scrollbar__thumb-bg-active--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbActive);
    this.scrollbarTrack = document.createElement("div");
    this.scrollbarTrack.classList.add("fxs-scrollbar__track--horizontal", "absolute", "inset-0", "mx-6");
    this.scrollbarTrack.appendChild(this.scrollbarThumb);
    const contentClass = this.Root.getAttribute("content-class") ?? "";
    this.scrollArea = document.createElement("div");
    this.scrollArea.classList.add(
      "flex",
      "flex-row",
      "justify-start",
      "pl-6",
      "pr-9",
      "fxs-scrollable-content",
      "pointer-events-auto"
    );
    this.scrollArea.style.flexShrink = "0";
    if (contentClass) {
      this.scrollArea.classList.add(...contentClass.split(" "));
    }
    this.scrollAreaContainer = document.createElement("div");
    this.scrollAreaContainer.classList.add(
      "flex",
      flexClass,
      "max-w-full",
      "max-h-full",
      "overflow-x-scroll",
      "pointer-events-auto"
    );
    this.scrollAreaContainer.appendChild(this.scrollArea);
    this.scrollBarContainer.appendChild(this.scrollbarTrack);
    this.attachChildEventListeners();
  }
  onInitialize() {
    while (this.Root.hasChildNodes()) {
      const node = this.Root.firstChild;
      if (node) {
        this.scrollArea.appendChild(node);
      } else {
        break;
      }
    }
    this.Root.classList.add("relative", "max-h-full", "max-w-full", "pointer-events-auto");
    if (this.scrollArea.lastElementChild) {
      this.scrollArea.lastElementChild.classList.add("mr-6");
    }
    this.Root.append(this.scrollAreaContainer, this.scrollBarContainer);
    if (!this.Root.hasAttribute("handle-gamepad-pan")) {
      this.Root.setAttribute("handle-gamepad-pan", "true");
    }
    if (!this.Root.hasAttribute("attached-scrollbar")) {
      this.Root.setAttribute("attached-scrollbar", "false");
    }
  }
  onAttach() {
    super.onAttach();
    this.hide();
    delayByFrame(this.resizeScrollThumb.bind(this), 2);
    this.resizeObserver.observe(this.scrollArea, { box: "border-box" });
    this.Root.listenForWindowEvent(InputEngineEventName, this.windowEngineInputListener);
  }
  onAttributeChanged(name, oldValue, newValue) {
    if (name == "scrollpercent") {
      const value = newValue ? parseFloat(newValue) : 0;
      this.scrollToPercentage(value * this.maxScroll);
    } else if (name == "handle-gamepad-pan" && oldValue != newValue) {
      this.isHandleGamepadPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "attached-scrollbar" && oldValue != newValue) {
      this.setIsAttachedLayout(newValue == "true");
    } else if (name == "allow-mouse-panning") {
      this.allowMousePan = newValue == "true";
    }
  }
  onDetach() {
    this.resizeObserver.disconnect();
    super.onDetach();
  }
  /**
   * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setEngineInputProxy(proxy) {
    if (this.engineInputProxy) {
      this.engineInputProxy.removeEventListener("engine-input", this.engineInputListener);
    }
    this.engineInputProxy = proxy;
    this.engineInputProxy.addEventListener("engine-input", this.engineInputListener);
  }
  get currentScrollOnScrollAreaInPixels() {
    return this.scrollAreaContainer.scrollLeft;
  }
  set currentScrollOnScrollAreaInPixels(value) {
    this.scrollAreaContainer.scrollLeft = value;
  }
  get maxScrollOnScrollAreaInPixels() {
    return this.scrollArea.scrollWidth;
  }
  getActiveDimension(rect) {
    return rect.width;
  }
  onResize(_entries, _observer) {
    this.isScrollAtEnd = false;
    delayByFrame(this.resizeScrollThumb.bind(this), 2);
  }
  /**
   * Converts the mouse coordinates to a scroll percentage.
   * @param event
   */
  mouseCoordinatesToScroll(event) {
    const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
    return (event.clientX - mouseAreaRect.x + this.thumbDelta.x) / mouseAreaRect.width;
  }
  onWindowEngineInput(inputEvent) {
    let handled = false;
    switch (inputEvent.detail.name) {
      case "touch-complete":
        this.thumbActive.classList.remove("opacity-100");
        this.isDraggingScroll = false;
        this.dragInProgress = false;
        handled = true;
        break;
      case "mousebutton-left":
      case "touch-pan":
        if (inputEvent.detail.status == InputActionStatuses.DRAG) {
          if (inputEvent.detail.name == "mousebutton-left" && !this.allowMousePan) {
            return;
          }
          const scrollAreaRect = this.scrollArea.getBoundingClientRect();
          const x = inputEvent.detail.x;
          const y = inputEvent.detail.y;
          if (y < scrollAreaRect.top || y > scrollAreaRect.bottom) {
            this.dragInProgress = false;
          }
          if (this.thumbSize == 0) {
            this.setScrollBoundaries();
          }
          if (this.isDraggingScroll) {
            const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
            const scrollPercentage = (x - mouseAreaRect.x + this.thumbDelta.x) / mouseAreaRect.width;
            this.scrollToPercentage(scrollPercentage);
            handled = true;
          } else if (this.dragInProgress) {
            this.currentScrollOnScrollAreaInPixels += this.touchDragX - x;
            this.setScrollThumbPosition();
            this.resolveIsScrollAtEnd();
            this.touchDragX = x;
            handled = true;
          }
        } else if (this.allowMousePan && (this.isDraggingScroll || this.dragInProgress) && inputEvent.detail.name == "mousebutton-left" && inputEvent.detail.status == InputActionStatuses.FINISH) {
          this.thumbActive.classList.remove("opacity-100");
          this.isDraggingScroll = false;
          this.dragInProgress = false;
          handled = true;
        }
        break;
    }
    if (handled) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan" && this.isHandleGamepadPan) {
      if (this.allowScroll) {
        this.onGamepadPan(inputEvent);
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.target == this.engineInputProxy) {
      return;
    }
    if (inputEvent.detail.name == "touch-pan" || this.allowMousePan && inputEvent.detail.name == "mousebutton-left") {
      this.onTouchOrMousePan(inputEvent);
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.isMouseOver) {
      if (inputEvent.detail.name == "mousewheel-up" || inputEvent.detail.name == "mousewheel-down") {
        if (this.allowScroll) {
          const newScrollPos = (this.currentScrollOnScrollAreaInPixels - inputEvent.detail.x) / this.maxScrollOnScrollAreaInPixels;
          this.scrollToPercentage(newScrollPos);
          inputEvent.stopPropagation();
        }
        inputEvent.preventDefault();
      }
      if (inputEvent.detail.name == "mousewheel-left" || inputEvent.detail.name == "mousewheel-right") {
        if (this.allowScroll) {
          this.setScrollThumbPosition();
          inputEvent.stopPropagation();
        }
        inputEvent.preventDefault();
      }
    }
  }
  /**
   * Attaches all event listeners for the component.
   */
  attachChildEventListeners() {
    this.scrollbarTrack.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
    });
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("mouseenter", this.mouseEnterListener);
    this.Root.addEventListener("mouseleave", this.mouseLeaveListener);
    this.scrollbarTrack.addEventListener("mousedown", (event) => {
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    });
    this.scrollbarTrack.addEventListener(InputEngineEventName, this.scrollBarEngineInputListener);
    this.scrollbarThumb.addEventListener("mousedown", (event) => {
      Audio.playSound("data-audio-scroll-thumb-down");
      this.scrollbarThumb.classList.add("fxs-scrollable-thumb--active");
      this.isDraggingScroll = true;
      const thumbRect = this.scrollbarThumb.getBoundingClientRect();
      this.thumbDelta.x = thumbRect.x - event.clientX;
      this.thumbDelta.y = thumbRect.y - event.clientY;
      window.addEventListener("mousemove", this.mouseMoveListener);
      window.addEventListener("mouseup", this.mouseUpListener, true);
    });
    this.scrollbarThumb.addEventListener("mouseleave", () => {
      if (!this.isDraggingScroll) {
        this.scrollbarThumb.classList.add("fxs-scrollable-thumb--hover-off");
      }
    });
    this.scrollArea.addEventListener(
      "focus",
      (event) => {
        const target = event.target;
        if (target) {
          if (!target.hasAttribute("slot")) {
            this.scrollIntoView(target);
          }
        }
      },
      true
    );
  }
  /**
   * Shows the scrollbar
   */
  show() {
    this.allowScroll = true;
    this.scrollBarContainer.classList.remove("hidden");
  }
  /**
   * Hides the scrollbar
   */
  hide() {
    this.allowScroll = false;
    this.scrollBarContainer.classList.add("hidden");
  }
  /**
   * On key down we scroll by the needed amount.
   * @param {KeyboardEvent} event
   */
  /** //TODO: When we update action-handler input cascade, we need to actually flow in to the
  	  scrollables, to be able to scroll when not dependent on focus.  */
  /*onKeydown(event: KeyboardEvent) {
  		if (event.target instanceof HTMLTextAreaElement) {
  			this.setScrollThumbPosition();
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.Home) {
  			this.scrollToPercentage(0);
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.End) {
  			this.scrollToPercentage(1);
  			return;
  		}
  
  		const verticalScroll = Number(event.keyCode === KeyboardKeys.DownArrow) - Number(event.keyCode === KeyboardKeys.UpArrow);
  		const horizontalScroll = Number(event.keyCode === KeyboardKeys.RightArrow) - Number(event.keyCode === KeyboardKeys.LeftArrow);
  
  		const scrollChange = this.isVertical ? verticalScroll : horizontalScroll;
  
  		if (scrollChange == 0) {
  			return;
  		}
  
  		this.scrollToPercentage(this.scrollPosition + scrollChange / 100);
  	}*/
  onMouseMove(event) {
    if (this.isDraggingScroll) {
      if (this.thumbSize == 0) {
        this.setScrollBoundaries();
      }
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    }
  }
  onMouseUp(event) {
    Audio.playSound("data-audio-scroll-thumb-up");
    window.removeEventListener("mousemove", this.mouseMoveListener);
    window.removeEventListener("mouseup", this.mouseUpListener);
    event.stopPropagation();
    this.reset();
  }
  onMouseEnter() {
    this.isMouseOver = true;
  }
  onMouseLeave() {
    this.isMouseOver = false;
  }
  setIsAttachedLayout(isAttached) {
    if (isAttached) {
      this.Root.classList.add("flex", "flex-row");
      this.scrollbarTrack.classList.replace("absolute", "relative");
      this.scrollbarTrack.classList.add("flex-auto");
      this.scrollBarContainer.classList.add("relative", "bottom-0", "inset-x-auto");
      this.scrollAreaContainer.classList.add("flex-auto");
    } else {
      this.Root.classList.remove("flex", "flex-row");
      this.scrollbarTrack.classList.replace("relative", "absolute");
      this.scrollbarTrack.classList.remove("flex-auto");
      this.scrollBarContainer.classList.remove("relative", "bottom-0", "inset-x-auto");
      this.scrollAreaContainer.classList.remove("flex-auto");
    }
  }
  /**
   * Scrolls to a given percentage.
   * @param {number} position - Position in percentage - from 0 to 1.
   */
  scrollToPercentage(position) {
    this.scrollPosition = utils.clamp(position, 0, isNaN(this.maxScroll) ? 0 : this.maxScroll);
    this.thumbScrollPosition = utils.clamp(position, 0, isNaN(this.maxThumbPosition) ? 0 : this.maxThumbPosition);
    const calcScrollPosition = this.scrollPosition / this.maxScroll;
    if (!isNaN(calcScrollPosition)) {
      this.scrollArea.setAttribute("current-scroll-position", calcScrollPosition.toString());
    }
    const scrollPositionInPixels = ~~(this.maxScrollOnScrollAreaInPixels * this.scrollPosition);
    this.currentScrollOnScrollAreaInPixels = scrollPositionInPixels;
    requestAnimationFrame(() => {
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.width ?? 0);
      this.scrollbarThumb.style.transform = `translateX(${offset}px)`;
    });
    this.resolveIsScrollAtEnd();
  }
  setScrollThumbPosition() {
    if (this.maxScrollOnScrollAreaInPixels > 0 && !isNaN(this.maxThumbPosition)) {
      this.scrollPosition = this.currentScrollOnScrollAreaInPixels / this.maxScrollOnScrollAreaInPixels;
      this.thumbScrollPosition = utils.clamp(
        this.scrollPosition,
        0,
        isNaN(this.maxThumbPosition) ? 0 : this.maxThumbPosition
      );
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.width ?? 0);
      this.scrollbarThumb.style.transform = `translateX(${offset}px)`;
      this.scrollbarThumb.classList.remove("hidden");
    } else {
      this.scrollbarThumb.classList.add("hidden");
    }
    this.resolveIsScrollAtEnd();
  }
  scrollIntoView(target) {
    const areaRect = this.Root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (this.scrollableContentSize === 0) {
      this.resizeScrollThumb();
    }
    if (targetRect.left < areaRect.left || targetRect.right > areaRect.right) {
      let distToMove = 0;
      if (targetRect.left < areaRect.left) {
        distToMove = targetRect.left - areaRect.left;
      }
      if (targetRect.right > areaRect.right) {
        distToMove = targetRect.right - areaRect.right;
      }
      const anchorAsPercent = distToMove / this.scrollableContentSize;
      this.scrollToPercentage(this.scrollPosition + anchorAsPercent);
    }
  }
  /**
   * Resets the styles and thumb delta.
   */
  reset() {
    if (this.isDraggingScroll) {
      this.scrollbarThumb.classList.remove("fxs-scrollable-thumb--active");
      this.isDraggingScroll = false;
    }
    this.thumbDelta.x = 0;
    this.thumbDelta.y = 0;
  }
  setScrollBoundaries() {
    this.thumbRect = this.scrollbarThumb.getBoundingClientRect();
    this.thumbSize = this.getActiveDimension(this.thumbRect);
    this.maxScroll = (this.scrollableContentSize - this.thumbSize) / this.scrollableContentSize;
    const scrollTrackAreaSize = this.getActiveDimension(this.scrollbarTrack.getBoundingClientRect());
    this.maxThumbPosition = (scrollTrackAreaSize - this.thumbSize) / scrollTrackAreaSize;
    this.Root.dispatchEvent(new CustomEvent("scroll-is-ready", { bubbles: true }));
  }
  setScrollData() {
    this.setScrollBoundaries();
    this.setScrollThumbPosition();
  }
  /**
   * Resizes the scrollbar thumb
   * @param shouldSetScrollPositionFromLayout
   */
  resizeScrollThumb() {
    const newScrollSize = this.scrollAreaContainer.clientWidth;
    if (this.scrollableAreaSize != newScrollSize) {
      this.scrollableAreaSize = newScrollSize;
    }
    this.scrollableContentSize = this.getActiveDimension({
      width: this.scrollAreaContainer.scrollWidth,
      height: this.scrollAreaContainer.scrollHeight
    });
    const scrollTrackAreaSize = newScrollSize - Layout.pixelsToScreenPixels(FxsScrollableHorizontal.DECORATION_SIZE) * 2;
    const scrollbarRatio = this.scrollableAreaSize / this.maxScrollOnScrollAreaInPixels;
    const scrollbarSize = Math.max(scrollTrackAreaSize * scrollbarRatio, FxsScrollableHorizontal.MIN_SIZE_PIXELS);
    const showScrollbar = scrollTrackAreaSize - scrollbarSize >= FxsScrollableHorizontal.MIN_SIZE_OVERFLOW;
    if (showScrollbar != this.scrollbarPrevVisibility) {
      if (showScrollbar) {
        this.show();
      } else {
        this.hide();
      }
    }
    if (showScrollbar) {
      this.scrollbarThumb.style.widthPERCENT = scrollbarRatio * 100;
    }
    delayByFrame(() => {
      if (this.Root.isConnected) {
        this.setScrollData();
      }
    }, 3);
  }
  onTouchOrMousePan(inputEvent) {
    const x = inputEvent.detail.x;
    const y = inputEvent.detail.y;
    const status = inputEvent.detail.status;
    switch (status) {
      case InputActionStatuses.START:
        const scrollAreaRect = this.scrollArea.getBoundingClientRect();
        if (x >= scrollAreaRect.left && x <= scrollAreaRect.right && y >= scrollAreaRect.top && y <= scrollAreaRect.bottom) {
          this.touchDragX = x;
          this.dragInProgress = true;
          inputEvent.preventDefault();
          inputEvent.stopPropagation();
        }
        break;
      default:
        break;
    }
  }
  onGamepadPan(inputEvent) {
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.lastPanTimestamp = performance.now();
        this.isPanning = true;
        this.gamepadPanX = inputEvent.detail.x;
        if (this.gamepadPanAnimationId == -1) {
          this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
        }
        break;
      case InputActionStatuses.UPDATE:
        this.gamepadPanX = inputEvent.detail.x;
        break;
      case InputActionStatuses.FINISH:
        this.isPanning = false;
        this.gamepadPanX = 0;
        break;
    }
    return false;
  }
  /**
   * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
   *
   * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
   */
  onGamepadPanUpdate(timestamp) {
    const diff = timestamp - this.lastPanTimestamp;
    this.lastPanTimestamp = timestamp;
    this.currentScrollOnScrollAreaInPixels += this.gamepadPanX * diff * this.panRate;
    this.setScrollThumbPosition();
    if (this.isPanning) {
      this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
    } else {
      this.gamepadPanAnimationId = -1;
    }
  }
  onScrollBarEngineInput(inputEvent) {
    if (inputEvent.detail.name != "touch-pan") {
      return;
    }
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.thumbActive.classList.add("opacity-100");
        const thumbRect = this.scrollbarThumb.getBoundingClientRect();
        this.thumbDelta.x = thumbRect.x - inputEvent.detail.x;
        this.thumbDelta.y = thumbRect.y - inputEvent.detail.y;
        this.isDraggingScroll = true;
        inputEvent.preventDefault();
        inputEvent.stopPropagation();
        break;
      default:
        break;
    }
  }
  getIsScrollAtEnd() {
    return this.isScrollAtEnd;
  }
  stopPanning() {
    this.isPanning = false;
  }
  resolveIsScrollAtEnd() {
    if (this.isScrollAtEnd && (this.currentScrollOnScrollAreaInPixels < this.maxScrollLeft || this.scrollArea.lastChild != FocusManager.getFocus())) {
      this.isScrollAtEnd = false;
      this.Root.dispatchEvent(new ScrollExitBottomEvent());
    } else if (!this.isScrollAtEnd && (this.currentScrollOnScrollAreaInPixels >= this.maxScrollLeft || this.scrollArea.lastChild == FocusManager.getFocus())) {
      this.isScrollAtEnd = true;
      this.Root.dispatchEvent(new ScrollAtBottomEvent());
    }
  }
  showScrollNavHelpElement(enabled) {
    if (enabled) {
      if (!this.navHelp) {
        this.navHelp = document.createElement("fxs-nav-help");
        this.navHelp.setAttribute("hide-if-not-allowed", "true");
        this.navHelp.classList.add("absolute", "left-1\\/2", "-top-1\\.5", "-translate-x-1\\/2");
      }
      this.scrollbarThumb.append(this.navHelp);
      this.navHelp.setAttribute("action-key", "inline-scroll-pan");
    } else {
      this.navHelp?.remove();
    }
  }
}
Controls.define("fxs-scrollable-horizontal", {
  createInstance: FxsScrollableHorizontal,
  description: "A scrollable container that shows a scrollbar",
  classNames: ["fxs-scrollable", "relative", "pointer-events-auto"],
  attributes: [
    {
      name: "scrollpercent"
    },
    {
      name: "handle-gamepad-pan"
    },
    {
      name: "allow-mouse-panning",
      description: "If set to 'true', this will enable scrolling by dragging with the mosue on the background"
    },
    {
      name: "attached-scrollbar",
      description: "if set to 'true', the scrollbar will be attached to the container and take up space, instead of floating a set distance away"
    }
  ],
  images: [
    "fs://game/base_scrollbar-track_h.png",
    "fs://game/base_scrollbar-handle-focus_h.png",
    "fs://game/base_scrollbar-handle_h.png"
  ]
});

class FxsSelector extends FxsActivatable {
  noSelectionCaption = "LOC_UI_DROPDOWN_NO_SELECTION";
  isEditing = false;
  selectorItems = [];
  selectedItemContainer;
  selectorElements = [];
  noSelectionElement;
  leftArrow;
  rightArrow;
  leftNavHelp;
  rightNavHelp;
  activateListener = this.onActivate.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  updatingItemSelection = false;
  get isDisabled() {
    return this.Root.getAttribute("disabled");
  }
  get selectedIndex() {
    return parseInt(this.Root.getAttribute("selected-item-index") ?? "-1");
  }
  set selectedIndex(index) {
    this.Root.setAttribute("selected-item-index", index.toString());
  }
  get isNoSelection() {
    return this.selectedIndex == -1;
  }
  get directEdit() {
    return (this.Root.getAttribute("direct-edit") ?? "true") === "true";
  }
  set directEdit(value) {
    this.Root.setAttribute("direct-edit", value.toString());
  }
  get enableShellNavControls() {
    return this.Root.getAttribute("enable-shell-nav") == "true";
  }
  constructor(root) {
    super(root);
    this.render();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "selected-item-index": {
        if (!this.updatingItemSelection) {
          const index = parseInt(newValue);
          this.onItemSelected(index, true);
        }
        return;
      }
      case "no-selection-caption": {
        this.noSelectionCaption = newValue;
        this.updateNoSelectionElement();
        return;
      }
      case "dropdown-items": {
        if (newValue && newValue !== oldValue) {
          let selectorItems;
          try {
            selectorItems = JSON.parse(newValue);
          } catch (e) {
            console.error(`fxs-selector: invalid dropdown-items attribute value: ${newValue} `, e);
            return;
          }
          this.updateSelectorItems(selectorItems);
        } else if (!newValue) {
          this.updateSelectorItems([]);
        }
        return;
      }
      case "direct-edit": {
        this.toggleEdit(this.directEdit);
        return;
      }
      case "disabled": {
        this.updateDisabled(newValue == "true");
        break;
      }
      case "enable-shell-nav": {
        const shellNavDisabled = newValue != "true";
        this.leftNavHelp?.classList.toggle("invisible", shellNavDisabled);
        this.rightNavHelp?.classList.toggle("invisible", shellNavDisabled);
        break;
      }
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.role = "select";
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("action-activate", this.activateListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.Root.removeEventListener("action-activate", this.activateListener);
    super.onDetach();
  }
  onActivatableEngineInput(inputEvent) {
    if (this.directEdit) {
      if (this.disabled) {
        if (inputEvent.detail.name == "touch-touch" || inputEvent.detail.status == InputActionStatuses.START) {
          Audio.playSound("data-audio-error-press");
        }
      }
      return;
    } else {
      super.onActivatableEngineInput(inputEvent);
    }
  }
  updateDisabled(value) {
    if (this.isEditing) {
      this.toggleEdit(false);
    }
    this.Root.classList.toggle("disabled", value);
    this.leftArrow.classList.toggle("invisible", value);
    this.rightArrow.classList.toggle("invisible", value);
  }
  /**
   * ToggleOpen edit mode on the selector.
   *
   * @param force If set, forces the selector to edit mode or not. If not set, toggles the selector based on its current state.
   */
  toggleEdit = (force) => {
    const isEditing = (force ?? !this.isEditing) || this.directEdit;
    if (this.isEditing === isEditing) {
      return;
    }
    this.isEditing = isEditing;
  };
  /**
   * UpdateSelectorItems updates the list of items in the selector.
   *
   * @param items The list of items to display in the selector.
   */
  updateSelectorItems(items) {
    this.selectorItems = items;
    this.createListItems();
  }
  selectNext() {
    if (!this.isDisabled) {
      this.onItemSelected(this.selectedIndex + 1);
    }
  }
  selectPrevious() {
    if (!this.isDisabled) {
      this.onItemSelected(this.selectedIndex - 1);
    }
  }
  /**
   * createListItem is called when a new item is added to the selector.
   *
   * Override this method to customize the appearance of selector items.
   */
  createListItemElement({ disabled, label, tooltip }) {
    const newListItem = document.createElement("div");
    newListItem.role = "option";
    newListItem.classList.add("flex", "flex-col", "items-center", "justify-center");
    if (disabled || this.isDisabled) {
      newListItem.setAttribute("disabled", "true");
    }
    if (tooltip) {
      newListItem.setAttribute("data-tooltip-content", tooltip);
    }
    const title = document.createElement("div");
    title.setAttribute("data-l10n-id", label);
    newListItem.appendChild(title);
    return newListItem;
  }
  /**
   * onItemSelected is called when an item is selected from the selector.
   *
   * Override this method to customize item selection.
   *
   * @param index The index of the selected item.
   */
  onItemSelected(index, force) {
    if (!force && index === this.selectedIndex) {
      return;
    }
    this.updatingItemSelection = true;
    const numItems = this.selectorItems.length;
    if (numItems <= 0) {
      index = -1;
    }
    if (index < 0) {
      index = numItems - 1;
    } else if (index >= numItems) {
      index = 0;
    }
    const detail = this.isNoSelection ? { selectedIndex: -1, selectedItem: null } : { selectedIndex: index, selectedItem: this.selectorItems[index] };
    const canceled = !this.Root.dispatchEvent(new DropdownSelectionChangeEvent(detail));
    if (canceled) {
      return;
    }
    this.selectedIndex = index;
    this.updateElementSelections();
    this.updatingItemSelection = false;
  }
  onActivate(_event) {
    this.toggleEdit();
  }
  onEngineInput(event) {
    if (!this.isEditing || this.directEdit) {
      return;
    }
    if (event.detail.name === "cancel") {
      if (event.detail.status === InputActionStatuses.FINISH) {
        this.toggleEdit(false);
        FocusManager.setFocus(this.Root);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onNavigateInput(event) {
    if (!this.isEditing && !this.directEdit) {
      return;
    }
    const isFinished = event.detail.status === InputActionStatuses.FINISH;
    const direction = event.getDirection();
    switch (direction) {
      case InputNavigationAction.UP:
      case InputNavigationAction.DOWN: {
        if (!this.directEdit) {
          event.stopPropagation();
        }
        break;
      }
      // Disable left and right navigation when a selector is active
      case InputNavigationAction.LEFT:
        if (isFinished) {
          this.selectPrevious();
          Audio.playSound("data-audio-activate", "audio-pager");
        }
        event.stopPropagation();
        break;
      case InputNavigationAction.SHELL_PREVIOUS:
        if (this.enableShellNavControls) {
          if (isFinished) {
            this.selectPrevious();
          }
          event.stopPropagation();
        }
        break;
      case InputNavigationAction.RIGHT:
        if (isFinished) {
          this.selectNext();
          Audio.playSound("data-audio-activate", "audio-pager");
        }
        event.stopPropagation();
        break;
      case InputNavigationAction.SHELL_NEXT:
        if (this.enableShellNavControls) {
          if (isFinished) {
            this.selectNext();
          }
          event.stopPropagation();
        }
        break;
    }
  }
  createListItems() {
    for (const element of this.selectorElements) {
      element.remove();
    }
    this.selectorElements.length = 0;
    for (let i = 0; i < this.selectorItems.length; i++) {
      const item = this.selectorItems[i];
      const newElement = this.createListItemElement(item);
      this.selectorElements.push(newElement);
    }
    this.updateElementSelections();
  }
  updateElementSelections() {
    const index = this.selectedIndex;
    if (index === -1) {
      this.selectedItemContainer.appendChild(this.noSelectionElement);
      this.Root.ariaValueText = this.noSelectionCaption;
    } else {
      this.noSelectionElement.remove();
    }
    for (let i = 0; i < this.selectorItems.length; i++) {
      const selectedElement = this.selectorElements[i];
      if (i === index) {
        this.selectedItemContainer.appendChild(selectedElement);
        this.Root.ariaValueText = selectedElement.textContent;
      } else {
        selectedElement.remove();
      }
    }
  }
  updateNoSelectionElement() {
    const newNoSelectionElement = this.createListItemElement({
      disabled: this.disabled,
      label: this.noSelectionCaption,
      tooltip: this.noSelectionCaption
    });
    if (this.noSelectionElement && this.isNoSelection) {
      this.noSelectionElement.remove();
      this.selectedItemContainer.appendChild(newNoSelectionElement);
    }
    this.noSelectionElement = newNoSelectionElement;
  }
  render() {
    const fragment = document.createDocumentFragment();
    this.leftArrow = document.createElement("fxs-activatable");
    this.leftArrow.classList.add("img-arrow-hover", "ml-2");
    this.leftArrow.addEventListener("action-activate", this.selectPrevious.bind(this));
    let arrowGrp = this.Root.getAttribute("data-audio-group-ref");
    if (!arrowGrp || arrowGrp == "") {
      arrowGrp = "audio-pager";
    }
    this.leftArrow.setAttribute("data-audio-group-ref", arrowGrp);
    fragment.appendChild(this.leftArrow);
    this.leftNavHelp = document.createElement("fxs-nav-help");
    this.leftNavHelp.setAttribute("action-key", "inline-nav-shell-previous");
    this.leftNavHelp.classList.add("hidden", "invisible");
    fragment.appendChild(this.leftNavHelp);
    this.selectedItemContainer = document.createElement("div");
    this.selectedItemContainer.classList.add("flex-auto");
    fragment.appendChild(this.selectedItemContainer);
    this.rightNavHelp = document.createElement("fxs-nav-help");
    this.rightNavHelp.setAttribute("action-key", "inline-nav-shell-next");
    this.rightNavHelp.classList.add("hidden", "invisible");
    fragment.appendChild(this.rightNavHelp);
    this.rightArrow = document.createElement("fxs-activatable");
    this.rightArrow.classList.add("img-arrow-hover", "-scale-x-100", "mr-2");
    this.rightArrow.setAttribute("data-audio-group-ref", arrowGrp);
    this.rightArrow.addEventListener("action-activate", this.selectNext.bind(this));
    fragment.appendChild(this.rightArrow);
    this.updateNoSelectionElement();
    this.Root.appendChild(fragment);
  }
}
const SelectorElementTagName = "fxs-selector";
Controls.define(SelectorElementTagName, {
  createInstance: FxsSelector,
  description: "A UI selector control for selecting an option from a list of options.",
  classNames: ["fxs-selector", "flex", "flex-row", "justify-center", "items-center"],
  tabIndex: -1,
  attributes: [
    {
      name: "dropdown-items",
      description: "The list of items to display in the selector."
    },
    {
      name: "selected-item-index",
      description: "The index of the selected item."
    },
    {
      name: "no-selection-caption",
      description: "The text label of the button when there is no valid selection."
    },
    {
      name: "disabled",
      description: "Whether the selector is disabled."
    },
    {
      name: "direct-edit",
      description: "Whether the selector is always in edit mode, or if it has to be toggled."
    },
    {
      name: "enable-shell-nav",
      description: "Should shell nav controls and navigation helpers be used?"
    }
  ]
});

class FxsSelectorOrnate extends FxsActivatable {
  noSelectionCaption = "LOC_UI_DROPDOWN_NO_SELECTION";
  isEditing = false;
  selectorItems = [];
  selectedItemContainer;
  selectorElements = [];
  noSelectionElement;
  labelElement;
  leftArrow;
  rightArrow;
  leftNavHelp;
  rightNavHelp;
  pipsContainer;
  pipElements = [];
  activateListener = this.onActivate.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  get selectedIndex() {
    return parseInt(this.Root.getAttribute("selected-item-index") ?? "-1");
  }
  set selectedIndex(index) {
    this.Root.setAttribute("selected-item-index", index.toString());
  }
  get isNoSelection() {
    return this.selectedIndex == -1;
  }
  get directEdit() {
    return (this.Root.getAttribute("direct-edit") ?? "true") === "true";
  }
  set directEdit(value) {
    this.Root.setAttribute("direct-edit", value.toString());
  }
  get defaultImage() {
    return this.Root.getAttribute("default-image");
  }
  get label() {
    return this.Root.getAttribute("label") ?? "";
  }
  get enableShellNavControls() {
    return this.Root.getAttribute("enable-shell-nav") == "true";
  }
  get showPips() {
    return (this.Root.getAttribute("show-pips") ?? "true") == "true";
  }
  get wrapSelections() {
    return this.Root.getAttribute("wrap-selections") == "true";
  }
  constructor(root) {
    super(root);
    this.render();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "selected-item-index": {
        const index = parseInt(newValue);
        this.onItemSelected(index);
        return;
      }
      case "no-selection-caption": {
        this.noSelectionCaption = newValue;
        this.updateNoSelectionElement();
        return;
      }
      case "label":
        this.updateLabel();
        return;
      case "dropdown-items": {
        if (newValue && newValue !== oldValue) {
          let selectorItems;
          try {
            selectorItems = JSON.parse(newValue);
          } catch (e) {
            console.error(`fxs-selector: invalid dropdown-items attribute value: ${newValue} `, e);
            return;
          }
          this.updateSelectorItems(selectorItems);
        } else if (!newValue) {
          this.updateSelectorItems([]);
        }
        return;
      }
      case "direct-edit": {
        this.toggleEdit(this.directEdit);
        return;
      }
      case "disabled": {
        this.updateDisabled(newValue == "true");
        break;
      }
      case "enable-shell-nav": {
        this.updateNavVisiblity();
        break;
      }
      case "show-pips": {
        this.pipsContainer.classList.toggle("hidden", newValue != "true");
        break;
      }
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.role = "select";
  }
  onAttach() {
    super.onAttach();
    this.leftArrow.setAttribute("data-audio-group-ref", "audio-pager");
    this.leftArrow.setAttribute("data-audio-focus-ref", "data-audio-arrow-focus");
    this.leftArrow.setAttribute("data-audio-activate-ref", "none");
    this.rightArrow.setAttribute("data-audio-group-ref", "audio-pager");
    this.rightArrow.setAttribute("data-audio-focus-ref", "data-audio-arrow-focus");
    this.rightArrow.setAttribute("data-audio-activate-ref", "none");
    this.Root.addEventListener("action-activate", this.activateListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.setAttribute("data-audio-group-ref", "audio-pager");
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.Root.removeEventListener("action-activate", this.activateListener);
    super.onDetach();
  }
  onActivatableEngineInput(inputEvent) {
    if (this.directEdit) {
      return;
    } else {
      super.onActivatableEngineInput(inputEvent);
    }
  }
  updateDisabled(value) {
    if (this.isEditing) {
      this.toggleEdit(false);
    }
    this.Root.classList.toggle("disabled", value);
    this.leftArrow.classList.toggle("hidden", value);
    this.rightArrow.classList.toggle("hidden", value);
    this.updateNavVisiblity();
    for (const pip of this.pipElements) {
      if (value) {
        pip.setAttribute("disabled", "true");
      } else {
        pip.removeAttribute("disabled");
      }
    }
  }
  /**
   * ToggleOpen edit mode on the selector.
   *
   * @param force If set, forces the selector to edit mode or not. If not set, toggles the selector based on its current state.
   */
  toggleEdit = (force) => {
    const isEditing = (force ?? !this.isEditing) || this.directEdit;
    if (this.isEditing === isEditing) {
      return;
    }
    this.isEditing = isEditing;
  };
  /**
   * UpdateSelectorItems updates the list of items in the selector.
   *
   * @param items The list of items to display in the selector.
   */
  updateSelectorItems(items) {
    this.selectorItems = items;
    this.createListItems();
  }
  selectNext() {
    if (!this.disabled) {
      this.onItemSelected(this.selectedIndex + 1);
    }
  }
  selectPrevious() {
    if (!this.disabled) {
      this.onItemSelected(this.selectedIndex - 1);
    }
  }
  /**
   * Called when a new item is added to the selector.
   *
   * Override this method to customize the appearance of selector items.
   */
  createListItemElement(item) {
    const newListItem = document.createElement("div");
    newListItem.classList.add("flex", "flex-col", "items-center", "justify-center", "leading-none", "my-9");
    if (item.disabled || this.disabled) {
      newListItem.setAttribute("disabled", "true");
    }
    let tooltip = "";
    if (item.label) {
      Locale.compose(item.label) + "[N]";
    }
    if (item.tooltip) {
      tooltip = tooltip + Locale.compose(item.tooltip);
    }
    newListItem.setAttribute("data-tooltip-content", tooltip);
    const title = document.createElement("div");
    title.classList.add(
      "text-center",
      "font-title-lg",
      "font-bold",
      "text-accent-2",
      "uppercase",
      "text-shadow-br"
    );
    title.setAttribute("data-l10n-id", item.label);
    newListItem.appendChild(title);
    if (item.description) {
      const description = document.createElement("div");
      description.classList.add("text-center", "font-body-base", "text-accent-2", "text-shadow-br");
      description.setAttribute("data-l10n-id", item.description);
      newListItem.appendChild(description);
    }
    return newListItem;
  }
  /**
   * Called when a new item is added to the selector to create a pip for it.
   *
   * Override this method to customize the appearance of pip items.
   */
  createPipElement(item) {
    const pipElement = document.createElement("fxs-radio-button");
    pipElement.role = "option";
    pipElement.classList.add("m-1");
    pipElement.setAttribute("is-tiny", "true");
    if (item.tooltip) {
      let tooltip = "";
      if (item.label) {
        tooltip = Locale.compose(item.label) + "[N]";
      }
      tooltip = tooltip + item.tooltip;
      pipElement.setAttribute("data-tooltip-content", tooltip);
    } else {
      pipElement.setAttribute("data-tooltip-content", item.label);
    }
    pipElement.setAttribute("value", item.label);
    if (this.disabled) {
      pipElement.setAttribute("disabled", "true");
    }
    return pipElement;
  }
  /**
   * Called when an item is selected from the selector.
   *
   * Override this method to customize item selection.
   *
   * @param index The index of the selected item.
   */
  onItemSelected(index) {
    if (this.disabled) {
      return;
    }
    const numItems = this.selectorItems.length;
    if (numItems <= 0) {
      index = -1;
    }
    if (index < 0) {
      index = this.wrapSelections ? numItems - 1 : 0;
    } else if (index >= numItems) {
      index = this.wrapSelections ? 0 : numItems - 1;
    }
    if (index === this.selectedIndex) {
      return;
    }
    const detail = this.isNoSelection ? { selectedIndex: -1, selectedItem: null } : { selectedIndex: index, selectedItem: this.selectorItems[index] };
    const canceled = !this.Root.dispatchEvent(new DropdownSelectionChangeEvent(detail));
    if (canceled) {
      return;
    }
    this.selectedIndex = index;
    Audio.playSound("data-audio-activate", "audio-pager");
    this.updateElementSelections();
  }
  onActivate(_event) {
    this.toggleEdit();
  }
  onEngineInput(event) {
    if (!this.isEditing || !this.directEdit) {
      return;
    }
    if (event.detail.name === "cancel") {
      if (event.detail.status === InputActionStatuses.FINISH) {
        this.toggleEdit(false);
        FocusManager.setFocus(this.Root);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onNavigateInput(event) {
    if (!this.isEditing && !this.directEdit) {
      return;
    }
    const isFinished = event.detail.status === InputActionStatuses.FINISH;
    const direction = event.getDirection();
    switch (direction) {
      case InputNavigationAction.UP:
      case InputNavigationAction.DOWN: {
        if (!this.directEdit) {
          event.stopPropagation();
        }
        break;
      }
      // Disable left and right navigation when a selector is active
      case InputNavigationAction.LEFT:
        if (isFinished) {
          this.selectPrevious();
        }
        event.stopPropagation();
        break;
      case InputNavigationAction.SHELL_PREVIOUS:
        if (this.enableShellNavControls) {
          if (isFinished) {
            this.selectPrevious();
          }
          event.stopPropagation();
        }
        break;
      case InputNavigationAction.RIGHT:
        if (isFinished) {
          this.selectNext();
        }
        event.stopPropagation();
        break;
      case InputNavigationAction.SHELL_NEXT:
        if (this.enableShellNavControls) {
          if (isFinished) {
            this.selectNext();
          }
          event.stopPropagation();
        }
        break;
    }
  }
  updateNavVisiblity() {
    const isInvisible = !this.enableShellNavControls || this.disabled;
    this.leftNavHelp?.classList.toggle("invisible", isInvisible);
    this.rightNavHelp?.classList.toggle("invisible", isInvisible);
  }
  createListItems() {
    for (const element of this.selectorElements) {
      element.remove();
    }
    for (const pip of this.pipElements) {
      pip.remove();
    }
    this.selectorElements.length = 0;
    this.pipElements.length = 0;
    for (let i = 0; i < this.selectorItems.length; i++) {
      const item = this.selectorItems[i];
      const newElement = this.createListItemElement(item);
      this.selectorElements.push(newElement);
      const pip = this.createPipElement(item);
      if (UI.getViewExperience() == UIViewExperience.Mobile) {
        pip.setAttribute("disabled", "true");
      }
      pip.addEventListener("action-activate", () => this.onItemSelected(i));
      this.pipsContainer.appendChild(pip);
      this.pipElements.push(pip);
    }
    this.updateElementSelections();
  }
  updateLabel() {
    this.labelElement.setAttribute("data-l10n-id", this.label);
  }
  updateElementSelections() {
    const index = this.selectedIndex;
    if (index === -1) {
      this.selectedItemContainer.appendChild(this.noSelectionElement);
      this.Root.ariaValueText = this.noSelectionCaption;
      const image = this.defaultImage ?? "";
      this.Root.style.backgroundImage = image;
    } else {
      this.noSelectionElement.remove();
    }
    if (!this.wrapSelections) {
      if (index === 0) {
        this.leftArrow.classList.remove("img-arrow-hover");
        this.leftArrow.classList.add("img-arrow-disabled");
      } else {
        this.leftArrow.classList.add("img-arrow-hover");
        this.leftArrow.classList.remove("img-arrow-disabled");
      }
      if (index === this.selectorItems.length - 1) {
        this.rightArrow.classList.remove("img-arrow-hover");
        this.rightArrow.classList.add("img-arrow-disabled");
      } else {
        this.rightArrow.classList.add("img-arrow-hover");
        this.rightArrow.classList.remove("img-arrow-disabled");
      }
      this.leftArrow.setAttribute("disabled", (index == 0).toString());
      this.rightArrow.setAttribute("disabled", (index == this.selectorItems.length - 1).toString());
    }
    for (let i = 0; i < this.selectorItems.length; i++) {
      const selectedElement = this.selectorElements[i];
      const selectedPip = this.pipElements[i];
      selectedPip.setAttribute("selected", (i === index).toString());
      if (i === index) {
        this.selectedItemContainer.appendChild(selectedElement);
        const selectedInfo = this.selectorItems[i];
        this.Root.ariaValueText = selectedInfo.label;
        const image = selectedInfo.image ?? this.defaultImage ?? "";
        this.Root.style.backgroundImage = image;
      } else {
        selectedElement.remove();
      }
    }
  }
  updateNoSelectionElement() {
    const newNoSelectionElement = this.createListItemElement({
      disabled: this.disabled,
      label: this.noSelectionCaption,
      tooltip: this.noSelectionCaption
    });
    if (this.noSelectionElement && this.isNoSelection) {
      this.noSelectionElement.remove();
      this.selectedItemContainer.appendChild(newNoSelectionElement);
    }
    this.noSelectionElement = newNoSelectionElement;
  }
  render() {
    const fragment = document.createDocumentFragment();
    const darkener = document.createElement("div");
    darkener.classList.add(
      "fxs-selector-ornate-darkener",
      "size-full",
      "flex",
      "flex-row",
      "justify-center",
      "items-center"
    );
    fragment.appendChild(darkener);
    this.labelElement = document.createElement("div");
    this.labelElement.classList.add(
      "font-body-base",
      "text-accent-2",
      "uppercase",
      "absolute",
      "text-shadow-br",
      "top-2",
      "left-0",
      "pl-3",
      "w-full",
      "whitespace-nowrap",
      "font-fit-shrink"
    );
    darkener.appendChild(this.labelElement);
    this.updateLabel();
    this.leftArrow = document.createElement("fxs-activatable");
    this.leftArrow.classList.add("image-arrow-hover", "ml-2");
    this.leftArrow.addEventListener("action-activate", this.selectPrevious.bind(this));
    darkener.appendChild(this.leftArrow);
    this.leftNavHelp = document.createElement("fxs-nav-help");
    this.leftNavHelp.setAttribute("action-key", "inline-nav-shell-previous");
    darkener.appendChild(this.leftNavHelp);
    this.selectedItemContainer = document.createElement("div");
    this.selectedItemContainer.classList.add("flex-auto");
    darkener.appendChild(this.selectedItemContainer);
    this.rightNavHelp = document.createElement("fxs-nav-help");
    this.rightNavHelp.setAttribute("action-key", "inline-nav-shell-next");
    darkener.appendChild(this.rightNavHelp);
    this.rightArrow = document.createElement("fxs-activatable");
    this.rightArrow.classList.add("img-arrow-hover", "-scale-x-100", "mr-2");
    this.rightArrow.addEventListener("action-activate", this.selectNext.bind(this));
    darkener.appendChild(this.rightArrow);
    this.pipsContainer = document.createElement("div");
    this.pipsContainer.classList.add(
      "absolute",
      "bottom-0",
      "flex",
      "flex-row",
      "w-full",
      "items-center",
      "justify-center"
    );
    this.pipsContainer.classList.toggle("hidden", !this.showPips);
    darkener.appendChild(this.pipsContainer);
    this.updateNoSelectionElement();
    this.updateNavVisiblity();
    this.Root.appendChild(fragment);
  }
}
Controls.define("fxs-selector-ornate", {
  createInstance: FxsSelectorOrnate,
  description: "A UI selector control for selecting an option from a list of options.",
  classNames: ["fxs-selector-ornate", "relative", "flex"],
  tabIndex: -1,
  attributes: [
    {
      name: "dropdown-items",
      description: "The list of items to display in the selector."
    },
    {
      name: "selected-item-index",
      description: "The index of the selected item."
    },
    {
      name: "no-selection-caption",
      description: "The text label of the button when there is no valid selection."
    },
    {
      name: "label",
      description: "The label of the selector."
    },
    {
      name: "disabled",
      description: "Whether the selector is disabled."
    },
    {
      name: "direct-edit",
      description: "Whether the selector is always in edit mode, or if it has to be toggled."
    },
    {
      name: "default-image",
      description: "The image to use if none is defined for a given dropdown item."
    },
    {
      name: "enable-shell-nav",
      description: "Should shell nav controls and navigation helpers be used?"
    },
    {
      name: "show-pips",
      description: "Should pips representing the options be shown at the bottom of the control?"
    },
    {
      name: "wrap-selections",
      description: "If set to 'true' selections will wrap when they go out of bounds, otherwise they will clamp."
    }
  ]
});

class SubsystemFrameCloseEvent extends CustomEvent {
  constructor() {
    super("subsystem-frame-close", { bubbles: false });
  }
}
class FxsSubsystemFrame extends Component {
  topBar;
  frameBg;
  content;
  closeButton;
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  handleClose() {
    this.Root.dispatchEvent(new SubsystemFrameCloseEvent());
  }
  render() {
    this.Root.classList.add("pointer-events-auto");
    const childNodes = Array.from(this.Root.children);
    const fragment = document.createDocumentFragment();
    this.topBar = document.createElement("div");
    this.topBar.classList.add("fxs-subsystem-frame__topbar");
    fragment.appendChild(this.topBar);
    const backDropAttribute = this.Root.getAttribute("backDrop");
    if (backDropAttribute) {
      const backgroundImageContainer = document.createElement("div");
      backgroundImageContainer.classList.value = "absolute size-full pointer-events-none";
      fragment.appendChild(backgroundImageContainer);
      const style = this.Root.getAttribute("box-style") ?? "b1";
      const backgroundImage = document.createElement("div");
      backgroundImage.style.backgroundImage = `url(${backDropAttribute})`;
      backgroundImage.classList.value = "relative bg-no-repeat bg-cover -mb-4 grow";
      backgroundImage.classList.add(style == "b1" ? "mx-3\\.5" : "");
      backgroundImageContainer.appendChild(backgroundImage);
    }
    const interior = document.createElement("fxs-vslot");
    interior.classList.add("flex-auto", "max-w-full");
    fragment.appendChild(interior);
    const header = document.createElement("div");
    const headerClass = this.Root.getAttribute("data-header-class");
    if (headerClass) {
      header.classList.add(...headerClass.split(" "));
    }
    header.classList.add("subsystem-frame__header");
    interior.appendChild(header);
    const noScrollContent = this.Root.hasAttribute("no-scroll");
    this.content = document.createElement(noScrollContent ? "div" : "fxs-scrollable");
    this.content.setAttribute("attached-scrollbar", "true");
    this.content.setAttribute("handle-gamepad-pan", "true");
    this.content.classList.add("subsystem-frame__content", "flex-auto");
    interior.appendChild(this.content);
    const footer = document.createElement("div");
    const footerClass = this.Root.getAttribute("data-footer-class");
    if (footerClass) {
      footer.classList.add(...footerClass.split(" "));
    }
    footer.classList.add("subsystem-frame__footer");
    interior.appendChild(footer);
    this.Root.appendChild(fragment);
    for (const childNode of childNodes) {
      const slotName = childNode.getAttribute("data-slot");
      if (slotName === "header") {
        header.appendChild(childNode);
      } else if (slotName === "footer") {
        footer.appendChild(childNode);
      } else {
        this.content.appendChild(childNode);
      }
    }
    this.frameBg = document.createElement("div");
    this.frameBg.classList.add("inset-0", "absolute");
    this.updateSubFrameDecorators();
    this.updateContentSpacing();
    this.updateTopBar();
    this.updateFrameBg();
    this.updateRootFrameClass();
    this.Root.insertAdjacentElement("afterbegin", this.frameBg);
    if (!this.Root.hasAttribute("no-close")) {
      this.closeButton = document.createElement("fxs-close-button");
      this.closeButton.addEventListener("action-activate", this.handleClose.bind(this));
      this.closeButton.classList.add("absolute");
      const closeGroup = this.Root.getAttribute("data-audio-close-group-ref");
      if (closeGroup) {
        this.closeButton.setAttribute("data-audio-group-ref", closeGroup);
      }
      this.Root.appendChild(this.closeButton);
    }
    this.updateCloseButton();
  }
  updateFrameBg() {
    const outsideSafezoneMode = this.Root.getAttribute("outside-safezone-mode") ?? "none";
    this.frameBg.classList.remove(
      "fullscreen-outside-safezone-y",
      "fullscreen-outside-safezone-x",
      "fullscreen-outside-safezone"
    );
    switch (outsideSafezoneMode) {
      case "vertical":
        this.frameBg.classList.add("fullscreen-outside-safezone-y");
        break;
      case "horizontal":
        this.frameBg.classList.add("fullscreen-outside-safezone-x");
        break;
      case "full":
        this.frameBg.classList.add("fullscreen-outside-safezone");
        break;
    }
  }
  updateTopBar() {
    const style = this.Root.getAttribute("box-style") ?? "b1";
    this.topBar.innerHTML = "";
    this.topBar.classList.remove("h-px", "overflow-visible");
    switch (style) {
      case "b1":
        const filigree = document.createElement("div");
        filigree.classList.add("fxs-subsystem-frame__filigree");
        this.topBar.appendChild(filigree);
        const filigreeLeft = document.createElement("div");
        filigreeLeft.classList.add("filigree-panel-top-left");
        filigree.appendChild(filigreeLeft);
        const filigreeRight = document.createElement("div");
        filigreeRight.classList.add("filigree-panel-top-right");
        filigree.appendChild(filigreeRight);
        break;
      case "b2":
        const simpleFiligree = document.createElement("div");
        simpleFiligree.classList.value = "fxs-subsystem-frame__filigree w-full";
        this.topBar.appendChild(simpleFiligree);
        const simpleFiligreeImage = document.createElement("div");
        simpleFiligreeImage.classList.value = "filigree-panel-top-simplified grow mt-1 -ml-4 -mr-4";
        simpleFiligree.appendChild(simpleFiligreeImage);
        break;
      case "b3":
        this.topBar.classList.add("h-px", "overflow-visible");
        const diploFiligree = document.createElement("div");
        diploFiligree.classList.value = "subsystem-frame__filigree-dip relative -mt-1 bg-cover w-full";
        this.topBar.appendChild(diploFiligree);
        break;
      case "b4":
        const noFrillFiligree = document.createElement("div");
        noFrillFiligree.classList.value = "fxs-subsystem-frame__filigree w-full";
        this.topBar.appendChild(noFrillFiligree);
        break;
    }
  }
  updateContentSpacing() {
    const style = this.Root.getAttribute("box-style") ?? "b1";
    this.content.classList.remove("mx-3\\.5", "mx-8");
    switch (style) {
      case "b1":
        this.content.classList.add("mx-3\\.5");
        break;
      case "b2":
        this.content.classList.add("mx-3\\.5");
        break;
      case "b3":
        this.content.classList.add("mx-8");
        break;
      case "b4":
        this.content.classList.add("mx-3\\.5");
        break;
    }
  }
  updateRootFrameClass() {
    const style = this.Root.getAttribute("box-style") ?? "b1";
    this.Root.classList.remove("pt-4", "m-0", "pt-14", "px-10", "pb-10");
    this.frameBg.classList.remove("frame-top-curve", "frame-box", "frame-diplo", "img-frame-f1");
    switch (style) {
      case "b1":
        this.Root.classList.add("pt-4");
        this.frameBg.classList.add("frame-top-curve");
        break;
      case "b2":
        this.Root.classList.add("frame-box", "pt-4");
        this.frameBg.classList.add("frame-box");
        break;
      case "b3":
        this.Root.classList.add("frame-diplo");
        this.frameBg.classList.add("frame-diplo");
        break;
      case "b4":
        this.Root.classList.add("pt-4");
        this.frameBg.classList.add("frame-box");
        break;
      case "fullscreen":
        this.Root.classList.add("m-0", "pt-14", "px-10", "pb-10");
        this.frameBg.classList.add("img-frame-f1");
    }
  }
  updateCloseButton() {
    this.closeButton?.classList.remove("top-1", "right-1", "top-10", "right-10");
    const style = this.Root.getAttribute("box-style") ?? "b1";
    switch (style) {
      case "b1":
        this.closeButton?.classList.add("top-1", "right-1");
        break;
      case "b2":
        this.closeButton?.classList.add("top-1", "right-1");
        break;
      case "b3":
        this.closeButton?.classList.add("top-1", "right-1");
        break;
      case "b4":
        this.closeButton?.classList.add("top-1", "right-1");
        break;
      case "fullscreen":
        this.closeButton?.classList.add("top-10", "right-10");
    }
  }
  updateSubFrameDecorators() {
    const style = this.Root.getAttribute("box-style") ?? "b1";
    const filigrees = this.Root.querySelectorAll(".img-frame-filigree");
    filigrees.forEach((elem) => this.Root.removeChild(elem));
    const diploTint = this.Root.querySelector(".subsystem-frame__diplo-tint");
    if (diploTint) {
      this.Root.removeChild(diploTint);
    }
    switch (style) {
      case "b3":
        this.Root.insertAdjacentHTML(
          "afterbegin",
          '<div class="subsystem-frame__diplo-tint absolute inset-0 bg-top bg-no-repeat"></div>'
        );
        break;
      case "fullscreen":
        this.Root.insertAdjacentHTML(
          "afterbegin",
          `
					<div class="absolute top-0 left-4 bottom-0 h-1\\/2 w-64 mt-4 img-frame-filigree pointer-events-none"></div>
					<div class="absolute top-0 right-4 bottom-0 h-1\\/2 w-64 mt-4 rotate-y-180 img-frame-filigree pointer-events-none"></div>
				`
        );
    }
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "box-style":
        this.updateSubFrameDecorators();
        this.updateRootFrameClass();
        this.updateFrameBg();
        this.updateContentSpacing();
        this.updateTopBar();
        this.updateCloseButton();
        this.Root.insertAdjacentElement("afterbegin", this.frameBg);
        break;
      case "outside-safezone-mode":
        this.updateFrameBg();
    }
  }
}
Controls.define("fxs-subsystem-frame", {
  createInstance: FxsSubsystemFrame,
  description: "A subsystem frame",
  classNames: ["fxs-subsystem-frame"],
  attributes: [
    {
      name: "box-style"
    },
    {
      name: "outside-safezone-mode"
    }
  ],
  images: ["fs://game/hud_sidepanel_bg.png", "fs://game/hud_squarepanel-bg.png"]
});

class FxsTabItem extends FxsActivatable {
  _labelElement;
  get labelElement() {
    if (!this._labelElement) {
      const labelElement = document.createElement("span");
      this._labelElement = labelElement;
    }
    return this._labelElement;
  }
  iconGroupElement;
  onInitialize() {
    super.onInitialize();
    this.disabledCursorAllowed = false;
    this.render();
  }
  updateLabelText() {
    const disabled = this.disabled;
    const selected = this.Root.getAttribute("selected") === "true";
    this.Root.classList.toggle("text-secondary", selected && !disabled);
    this.Root.classList.toggle("text-accent-1", !selected && !disabled);
    this.Root.classList.toggle("text-accent-5", disabled);
  }
  updateIconState() {
    const disabled = this.disabled;
    const selected = this.Root.getAttribute("selected") === "true";
    this.iconGroupElement?.setAttribute(
      "data-state",
      disabled ? IconState.Disabled : selected ? IconState.Focus : IconState.Default
    );
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "selected": {
        this.updateLabelText();
        this.updateIconState();
        break;
      }
      case "disabled": {
        super.onAttributeChanged("disabled", oldValue, newValue);
        this.updateLabelText();
        this.updateIconState();
        break;
      }
      case "nowrap": {
        this.labelElement.classList.toggle("whitespace-nowrap", newValue == "true");
        break;
      }
      case "label": {
        if (newValue === null) {
          this.labelElement.remove();
        } else {
          this.labelElement.setAttribute("data-l10n-id", newValue);
          this.labelElement.classList.add("font-fit-shrink", "shrink");
          this.Root.appendChild(this.labelElement);
        }
        break;
      }
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  render() {
    this.Root.classList.add(
      "relative",
      "flex",
      "items-center",
      "justify-center",
      "cursor-pointer",
      "font-fit-shrink",
      "text-center",
      "flex-1"
    );
    this.Root.setAttribute("data-audio-press-ref", "none");
    if (this.Root.hasAttribute("data-icon")) {
      this.Root.classList.add("group");
      this.iconGroupElement = document.createElement("fxs-stateful-icon");
      const iconClass = this.Root.getAttribute("icon-class");
      this.iconGroupElement.classList.value = "min-w-8 flex";
      if (iconClass) {
        this.iconGroupElement.classList.add(...iconClass.split(" "));
      }
      PassThroughAttributes(this.Root, this.iconGroupElement, ...AttributeNames);
      this.Root.insertBefore(this.iconGroupElement, this.Root.firstChild);
      this.updateIconState();
      const iconTextAttr = this.Root.getAttribute("icon-text");
      if (iconTextAttr) {
        const iconTextContainer = document.createElement("div");
        iconTextContainer.classList.value = "absolute size-full flex items-center justify-center";
        this.iconGroupElement.appendChild(iconTextContainer);
        const iconText = document.createElement("div");
        iconText.setAttribute("data-l10n-id", iconTextAttr);
        iconText.classList.value = "mb-2";
        iconTextContainer.appendChild(iconText);
      }
    }
  }
}
Controls.define("fxs-tab-item", {
  createInstance: FxsTabItem,
  attributes: [
    {
      name: "selected"
    },
    {
      name: "disabled"
    },
    {
      name: "disabled-cursor-allowed"
    },
    {
      name: "label"
    },
    {
      name: "nowrap"
    },
    {
      name: "sound-disabled",
      description: "Set to prevent the default activate sound from being played"
    }
  ]
});

class TabSelectedEvent extends CustomEvent {
  constructor(detail) {
    super("tab-selected", {
      bubbles: true,
      cancelable: true,
      detail
    });
  }
}
class FxsTabBar extends Component {
  selectedTabIndex = -1;
  containerElement;
  selectionIndicatorElement;
  selectionIndicatorPositionValue = CSS.percent(0);
  navHelpLeftElement = document.createElement("fxs-nav-help");
  navHelpRightElement = document.createElement("fxs-nav-help");
  tabItems = [];
  tabElements = [];
  useAltControls = false;
  /**
   * navHandler is the element to attach the navigation handler to.
   * Higher up the tree enables tabbing from anywhere in the screen.
   */
  navHandler = this.Root;
  resizeObserver = new ResizeObserver(this.doSelectorPositionUpdate.bind(this));
  handleResizeEventListener = this.doSelectorPositionUpdate.bind(this);
  navigateInputEventListener = this.onNavigateInput.bind(this);
  get disabled() {
    return this.Root.getAttribute("disabled") === "true";
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value ? "true" : "false");
  }
  onNavigateInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || this.disabled) {
      return;
    }
    const direction = event.getDirection();
    switch (direction) {
      case InputNavigationAction.PREVIOUS:
      case InputNavigationAction.NEXT: {
        if (!this.useAltControls) {
          let selectedIndex = this.selectedTabIndex;
          selectedIndex = direction === InputNavigationAction.PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          selectedIndex = Math.max(0, Math.min(selectedIndex, this.tabItems.length - 1));
          if (selectedIndex !== this.selectedTabIndex) {
            if (this.tabElements[selectedIndex].getAttribute("disabled") == "true") {
              if (direction === InputNavigationAction.PREVIOUS) {
                selectedIndex = this.findPreviousTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              } else {
                selectedIndex = this.findNextTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              }
            }
            this.tabSelected(selectedIndex);
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          const audioId = this.Root.getAttribute("data-audio-activate-ref");
          if (audioId && audioId != "") {
            this.playSound(audioId);
          }
        }
        break;
      }
      case InputNavigationAction.SHELL_PREVIOUS:
      case InputNavigationAction.SHELL_NEXT: {
        if (this.useAltControls) {
          let selectedIndex = this.selectedTabIndex;
          selectedIndex = direction === InputNavigationAction.SHELL_PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          selectedIndex = Math.max(0, Math.min(selectedIndex, this.tabItems.length - 1));
          if (selectedIndex !== this.selectedTabIndex) {
            if (this.tabElements[selectedIndex].getAttribute("disabled") == "true") {
              if (direction === InputNavigationAction.SHELL_PREVIOUS) {
                selectedIndex = this.findPreviousTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              } else {
                selectedIndex = this.findNextTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              }
            }
            this.tabSelected(selectedIndex);
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          const audioId = this.Root.getAttribute("data-audio-activate-ref");
          if (audioId && audioId != "") {
            this.playSound(audioId);
          }
        }
        break;
      }
    }
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    this.updateNavHelp();
  }
  onAttach() {
    super.onAttach();
    const tabForSelector = this.Root.getAttribute("tab-for") ?? "fxs-frame";
    if (tabForSelector !== "") {
      const navHandler = this.Root.closest(tabForSelector);
      if (!navHandler) {
        console.error(
          `fxs-tab-bar: could not find nav handler for selector ${tabForSelector}. Attaching to root element instead, navigation will not work unless the tab bar is focused.`
        );
      } else {
        this.navHandler = navHandler;
      }
    } else {
      this.navHelpLeftElement.classList.add("hidden");
      this.navHelpRightElement.classList.add("hidden");
    }
    this.navHandler.addEventListener("navigate-input", this.navigateInputEventListener);
    this.Root.addEventListener("resize", this.handleResizeEventListener);
    this.Root.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
  }
  onDetach() {
    this.navHandler.removeEventListener("navigate-input", this.navigateInputEventListener);
    this.Root.removeEventListener("resize", this.handleResizeEventListener);
    super.onDetach();
    this.navHandler = this.Root;
    this.resizeObserver.disconnect();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "tab-items": {
        if (newValue) {
          this.updateTabItems(JSON.parse(newValue));
          this.updateNavHelp();
        } else {
          this.updateTabItems([]);
        }
        break;
      }
      case "selected-tab-index": {
        if (newValue) {
          const index = number({ value: newValue, min: 0, max: this.tabItems.length - 1 });
          this.tabSelected(index);
        }
        break;
      }
      case "alt-controls": {
        if (newValue) {
          if (newValue == "true") {
            this.useAltControls = true;
          } else {
            this.useAltControls = false;
          }
          this.updateNavHelp();
        }
        break;
      }
      case "disabled": {
        const disabled = newValue === "true";
        const attributeValue = disabled ? "true" : "false";
        this.tabElements.forEach((tab) => {
          tab.setAttribute("disabled", attributeValue);
        });
        break;
      }
    }
  }
  tabSelected(index) {
    if (index < 0 || index >= this.tabItems.length) {
      console.error(`fxs-tab-bar: invalid tab index ${index}`);
      return;
    }
    if (this.selectedTabIndex === index || this.disabled) {
      return;
    }
    this.Root.setAttribute("selected-tab-index", index.toString());
    const selectedItem = this.tabItems[index];
    const selectedElement = this.tabElements[index];
    const prevIndex = this.selectedTabIndex;
    const cancelled = !this.Root.dispatchEvent(new TabSelectedEvent({ index, selectedItem }));
    if (cancelled) {
      return;
    }
    this.selectedTabIndex = index;
    if (prevIndex >= 0) {
      this.tabElements[prevIndex].setAttribute("selected", "false");
    }
    selectedElement.setAttribute("selected", "true");
    this.resizeObserver.observe(selectedElement);
    this.doSelectorPositionUpdate();
  }
  findPreviousTab(selectedIndex) {
    while (selectedIndex >= 0) {
      if (this.tabElements[selectedIndex].getAttribute("disabled") != "true") {
        break;
      }
      if (selectedIndex > 0) {
        selectedIndex--;
      } else {
        return -1;
      }
    }
    return selectedIndex;
  }
  findNextTab(selectedIndex) {
    while (selectedIndex <= this.tabItems.length - 1) {
      if (this.tabElements[selectedIndex].getAttribute("disabled") != "true") {
        break;
      }
      if (selectedIndex < this.tabItems.length - 1) {
        selectedIndex++;
      } else {
        return -1;
      }
    }
    return selectedIndex;
  }
  /**
   * Read in the tab data attribute and update the tab bar state
   */
  updateTabItems(tabItems) {
    this.tabItems = tabItems;
    this.clearTabItems();
    const tabItemClassName = this.Root.getAttribute("tab-item-class") ?? "";
    const fragment = document.createDocumentFragment();
    const ourAudioGroup = this.Root.getAttribute("data-audio-group-ref");
    const ourFocusGroup = this.Root.getAttribute("data-audio-focus-ref");
    for (let index = 0; index < this.tabItems.length; index++) {
      const tab = this.tabItems[index];
      const tabElement = document.createElement("fxs-tab-item");
      if (ourAudioGroup) {
        tabElement.setAttribute("data-audio-group-ref", ourAudioGroup);
      }
      if (ourFocusGroup) {
        tabElement.setAttribute("data-audio-focus-ref", ourFocusGroup);
      }
      tabElement.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
      if (tab.label) {
        tabElement.setAttribute("label", tab.label);
        if (tab.nowrap) {
          tabElement.setAttribute("nowrap", tab.nowrap ? "true" : "false");
        }
      }
      if (tab.id) {
        tabElement.setAttribute("id", tab.id + "-tab-item");
      }
      if (tab.highlight) {
        tabElement.setAttribute("data-tut-highlight", "techChooserHighlights");
      }
      if (tab.icon) {
        SetAttributes(tabElement, tab.icon);
        if (tab.iconClass) {
          tabElement.setAttribute("icon-class", tab.iconClass);
        }
        if (tab.iconText) {
          tabElement.setAttribute("icon-text", tab.iconText);
        }
      }
      tabElement.classList.add(...tabItemClassName.split(" "));
      if (tab.className) {
        tabElement.classList.add(...tab.className.split(" "));
      }
      tabElement.setAttribute("disabled", tab.disabled ? "true" : "false");
      tabElement.setAttribute("selected", "false");
      tabElement.addEventListener("action-activate", () => {
        this.tabSelected(index);
      });
      const tooltip = tabItems[index].tooltip;
      if (tooltip) {
        tabElement.setAttribute("data-tooltip-content", tooltip);
      }
      fragment.appendChild(tabElement);
      this.tabElements.push(tabElement);
    }
    this.containerElement.appendChild(fragment);
    if (this.tabItems.length > 0) {
      if (this.Root.hasAttribute("selected-tab-index")) {
        const index = number({
          value: this.Root.getAttribute("selected-tab-index"),
          min: 0,
          max: this.tabItems.length - 1
        });
        this.tabSelected(index);
      } else {
        this.tabSelected(0);
      }
    }
  }
  clearTabItems() {
    const elements = this.containerElement.childNodes;
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
    this.tabElements = [];
    this.selectedTabIndex = -1;
  }
  updateNavHelp() {
    if (this.tabItems.length < 2) {
      return;
    }
    if (this.useAltControls) {
      this.navHelpLeftElement.setAttribute("action-key", "inline-nav-shell-previous");
      this.navHelpRightElement.setAttribute("action-key", "inline-nav-shell-next");
    } else {
      this.navHelpLeftElement.setAttribute("action-key", "inline-cycle-prev");
      this.navHelpRightElement.setAttribute("action-key", "inline-cycle-next");
    }
    this.navHelpLeftElement.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
  }
  /**
   * Called after a tab is selected to update highlight element positions.
   *
   * Override this method to customize how highlight elements are positioned. If you override this method, you must also override `renderSelectionIndicators`.
   */
  onSelectorPositionUpdate() {
    const selectedTab = this.tabElements[this.selectedTabIndex];
    const rootRect = this.containerElement.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const lineStart = tabRect.x;
    const lineTarget = lineStart - rootRect.x;
    this.selectionIndicatorPositionValue.value = lineTarget / rootRect.width * 100;
    this.selectionIndicatorElement.attributeStyleMap.set("left", this.selectionIndicatorPositionValue);
    const tabWidth = tabRect.width;
    this.selectionIndicatorElement.style.width = `${tabWidth}px`;
  }
  /**
   * Calls the `onUpdateSelectorPosition` method after the next layout update.
   */
  doSelectorPositionUpdate() {
    waitForLayout(this.onSelectorPositionUpdate.bind(this));
  }
  /**
   * Render the whole tab bar, but don't worry about the state yet.
   */
  render() {
    this.Root.classList.add(
      "relative",
      "flex",
      "justify-center",
      "h-16",
      "uppercase",
      "font-title",
      "text-base",
      "text-accent-2",
      "tracking-150"
    );
    if (this.Root.getAttribute("rect-render") == "true") {
      this.Root.innerHTML = `
				<div class="absolute inset-0 border-t-primary-3 border-t border-b-primary border-b pointer-events-none"></div>
				<div class="absolute inset-0 bg-primary opacity-10 pointer-events-none"></div>
			`;
    } else if (this.Root.getAttribute("tab-style") == "flat") {
      this.Root.innerHTML = `
				<div class="absolute inset-0 img-tab-bar-flat pointer-events-none"></div>
				<div class="absolute -left-1 img-tab-flat-end-cap pointer-events-none left-border"></div>
				<div class="absolute -right-1 rotate-y-180 img-tab-flat-end-cap pointer-events-none right-border"></div>
			`;
    } else {
      this.Root.classList.add("px-12");
      this.Root.innerHTML = `
				<div class="absolute inset-0 img-tab-bar pointer-events-none"></div>
				<div class="absolute -left-1\\.5 img-tab-end-cap pointer-events-none left-border"></div>
				<div class="absolute -right-1\\.5 rotate-y-180 img-tab-end-cap pointer-events-none right-border"></div>
			`;
    }
    const navHelpLeftClassName = this.Root.getAttribute("nav-help-left-class") ?? "absolute -left-9";
    this.navHelpLeftElement.classList.add(...navHelpLeftClassName.split(" "));
    this.Root.insertAdjacentElement("beforeend", this.navHelpLeftElement);
    this.Root.insertAdjacentHTML(
      "beforeend",
      `
			<div class="relative flex flex-auto">
				<div class="flex flex-auto tab-bar__items justify-center"></div>
				<div class="absolute bottom-0 left-0 img-tab-selection-indicator bg-no-repeat bg-center min-h-6 bg-contain tab-bar__selection-indicator transition-left duration-150"></div>
			</div>
		`
    );
    const navHelpRightClassName = this.Root.getAttribute("nav-help-right-class") ?? "absolute -right-9";
    this.navHelpRightElement.classList.add(...navHelpRightClassName.split(" "));
    this.Root.insertAdjacentElement("beforeend", this.navHelpRightElement);
    this.containerElement = MustGetElement(".tab-bar__items", this.Root);
    this.selectionIndicatorElement = MustGetElement(".tab-bar__selection-indicator", this.Root);
  }
}
Controls.define("fxs-tab-bar", {
  createInstance: FxsTabBar,
  attributes: [
    {
      name: "tab-items"
    },
    {
      name: "selected-tab-index"
    },
    {
      name: "alt-controls"
    },
    {
      name: "disabled"
    },
    {
      name: "tab-style",
      description: "flat, default is with img-tab-bar and img-tab-end-cap"
    }
  ]
});

class FxsTabControl extends ChangeNotificationComponent {
  numTabs;
  tabBar;
  tabButtons;
  tabPanels;
  rootSlot;
  isVertical = false;
  selectedTab = -1;
  iconWidth = "3rem";
  iconHeight = "3rem";
  navigateInputListener = this.onNavigateInput.bind(this);
  focusListener = this.onFocus.bind(this);
  constructor(root) {
    super(root);
    let isFlipped = false;
    this.tabButtons = [];
    this.tabPanels = [];
    this.numTabs = 0;
    const container = document.createElement("fxs-vslot");
    this.tabBar = document.createElement("fxs-hslot");
    this.tabBar.classList.add("tab-container");
    this.tabBar.classList.add("fxs-tab-control__tab-bar");
    this.rootSlot = document.createElement("fxs-slot");
    this.rootSlot.classList.add("tab-slot");
    const value = this.Root.getAttribute("tab-style");
    if (value) {
      if (value == "bottom" || value == "right") {
        isFlipped = true;
      }
      if (value == "top" || value == "bottom") {
        container.classList.add("fxs-tab-control-h");
        this.isVertical = false;
      } else {
        container.classList.add("fxs-tab-control-v");
        this.isVertical = true;
      }
    }
    if (isFlipped) {
      container.appendChild(this.rootSlot);
      container.appendChild(this.tabBar);
    } else {
      container.appendChild(this.tabBar);
      container.appendChild(this.rootSlot);
    }
    const iconHeight = this.Root.getAttribute("tab-icon-height");
    if (iconHeight) {
      this.iconHeight = iconHeight;
    }
    const iconWidth = this.Root.getAttribute("tab-icon-width");
    if (iconWidth) {
      this.iconWidth = iconWidth;
    }
    this.Root.appendChild(container);
  }
  /**
   *  Crack a list of tabs in the form 'name;class:name;class:name;class'.
   *  If "name" starts with "//game/" it is assumed to be an image URL rather
   *  than text and shown accordingly.  The control's "tab-icon-width" and
   *  "tab-icon-height" attributes then control the image size shown.
   *
   *  All controls with a class matching "class" will be reparented to the
   *  appropriate tab's slot.
   */
  realizeTabs() {
    const tabClass = this.Root.getAttribute("tab-list");
    if (tabClass) {
      const navHelpLeft = document.createElement("fxs-nav-help");
      navHelpLeft.setAttribute("action-key", "inline-cycle-prev");
      navHelpLeft.classList.add("tab-nav-help-left");
      this.tabBar.appendChild(navHelpLeft);
      let endOfTabs = false;
      let tabIndex = 0;
      let lastIndex = 0;
      let subString = "";
      do {
        tabIndex = tabClass.indexOf(":", lastIndex);
        if (tabIndex == -1) {
          subString = tabClass.slice(lastIndex);
          endOfTabs = true;
        } else {
          subString = tabClass.slice(lastIndex, tabIndex);
          lastIndex = tabIndex + 1;
        }
        const classIdx = subString.indexOf(";");
        if (classIdx != -1) {
          const title = subString.slice(0, classIdx);
          const className = subString.slice(classIdx + 1);
          const newTabPanel = this.addTab(title, className);
          if (newTabPanel) {
            this.numTabs++;
            this.Root.setAttribute("num-tabs", this.numTabs.toString());
            const tabElements = this.Root.querySelectorAll("." + className);
            tabElements.forEach((tabElement) => {
              newTabPanel?.appendChild(tabElement);
            });
          }
        }
      } while (!endOfTabs);
      const navHelpRight = document.createElement("fxs-nav-help");
      navHelpRight.setAttribute("action-key", "inline-cycle-next");
      navHelpRight.classList.add("tab-nav-help-right");
      this.tabBar.appendChild(navHelpRight);
    }
    this.Root.setAttribute("selected-tab", "0");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("focus", this.focusListener);
    this.realizeTabs();
  }
  onDetach() {
    this.Root.removeEventListener("focus", this.focusListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    super.onDetach();
  }
  onAttributeChanged(name, oldValue, newValue) {
    if (name == "selected-tab" && oldValue != newValue) {
      const newSelectedTabIndex = parseInt(newValue || "0");
      this.selectTab(newSelectedTabIndex);
      if (FocusManager.getFocusChildOf(this.Root)) {
        this.onFocus();
      }
    }
  }
  selectTab(newSelectedTabIndex) {
    if (newSelectedTabIndex == this.selectedTab) {
      return;
    }
    if (newSelectedTabIndex < 0 || newSelectedTabIndex >= this.numTabs) {
      console.error("fxs-tabcontrol: selectTab(): Invalid tab index to select!");
      return;
    }
    if (this.numTabs != this.tabPanels.length) {
      console.error("fxs-tabcontrol: selectTab(): Incoherence! There is not the same number of tabs and panels!");
      return;
    }
    if (this.numTabs != this.tabButtons.length) {
      console.error(
        "fxs-tabcontrol: selectTab(): Incoherence! There is not the same number of tabs and buttons!"
      );
      return;
    }
    this.selectedTab = newSelectedTabIndex;
    for (let i = 0; i < this.tabPanels.length; i++) {
      if (i == this.selectedTab) {
        this.tabButtons[i].classList.add("selected");
        this.tabPanels[i].style.display = "flex";
      } else {
        this.tabButtons[i].classList.remove("selected");
        this.tabPanels[i].style.display = "none";
      }
    }
    this.sendValueChange(
      new CustomEvent("component-value-changed", {
        bubbles: false,
        cancelable: false,
        detail: {
          value: this.selectedTab
        }
      })
    );
  }
  /** Add a new tab item and creates the tab (and container if necessary). */
  addTab(title, tabID) {
    let tabButton;
    let tabButtonAlreadyExists = false;
    if (this.tabButtons.length > 0) {
      tabButton = this.tabButtons.find((t) => t.getAttribute("tabID") == tabID);
      if (tabButton != void 0) {
        tabButtonAlreadyExists = true;
      }
    }
    if (!tabButtonAlreadyExists) {
      tabButton = document.createElement("fxs-activatable");
      tabButton.classList.add("fxs-tab-button");
      tabButton.classList.add(`category-tab-${tabID}`);
      const contents = document.createElement("div");
      contents.classList.add("contents");
      tabButton.appendChild(contents);
      if (title.search("//game/") != 0) {
        contents.innerHTML = Locale.compose(title);
      } else {
        contents.style.height = this.iconHeight;
        contents.style.width = this.iconWidth;
        contents.style.backgroundImage = "url('fs:" + title + "')";
      }
      tabButton.setAttribute("tabID", tabID);
      const tabNum = this.tabButtons.length;
      this.tabButtons.push(tabButton);
      this.tabBar.appendChild(tabButton);
      tabButton.addEventListener("action-activate", () => {
        this.Root.setAttribute("selected-tab", tabNum.toString());
      });
    }
    let tabPanel;
    if (!tabButtonAlreadyExists) {
      if (this.isVertical) {
        tabPanel = document.createElement("fxs-hslot");
      } else {
        tabPanel = document.createElement("fxs-vslot");
      }
      tabPanel.classList.add(`category-panel-${tabID}`);
      tabPanel.setAttribute("tabID", tabID);
      this.tabPanels.push(tabPanel);
      this.rootSlot.appendChild(tabPanel);
    }
    return tabPanel;
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.PREVIOUS:
      case InputNavigationAction.NEXT: {
        const selectedTabIndexAttribute = this.Root.getAttribute("selected-tab");
        if (selectedTabIndexAttribute) {
          let selectedTabIndex = parseInt(selectedTabIndexAttribute);
          selectedTabIndex = direction == InputNavigationAction.PREVIOUS ? selectedTabIndex - 1 : selectedTabIndex + 1;
          if (selectedTabIndex >= 0 && selectedTabIndex < this.numTabs) {
            this.Root.setAttribute("selected-tab", selectedTabIndex.toString());
          }
        }
        live = false;
        break;
      }
    }
    return live;
  }
  /**
   * Respond to being directly set to focus.
   */
  onFocus() {
    FocusManager.setFocus(this.tabPanels[this.selectedTab]);
  }
}
Controls.define("fxs-tab-control", {
  createInstance: FxsTabControl,
  description: "Tab control",
  classNames: ["fxs-tab-control"],
  attributes: [
    {
      name: "selected-tab"
    },
    {
      name: "tab-style"
    },
    {
      name: "tab-list"
    },
    {
      name: "tab-icon-width"
    },
    {
      name: "tab-icon-height"
    }
  ],
  tabIndex: -1
});

class FxsTextButton extends FxsActivatable {
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "caption": {
        const labels = this.Root.querySelectorAll(".text-button__label");
        if (newValue) {
          for (let i = 0; i < labels.length; i++) {
            labels[i].setAttribute("data-l10n-id", newValue);
          }
        } else {
          for (let i = 0; i < labels.length; i++) {
            labels[i].removeAttribute("data-l10n-id");
          }
        }
        break;
      }
      default:
        super.onAttributeChanged(name, _oldValue, newValue);
        break;
    }
  }
  render() {
    const sizeClass = this.Root.getAttribute("type") === "big" ? "text-xl" : "text-base";
    this.Root.classList.add("relative", "font-title", "leading-normal", sizeClass);
    const caption = this.Root.getAttribute("caption") ?? "";
    if (this.Root.getAttribute("highlight-style") === "decorative") {
      this.Root.innerHTML = `
				<div class="text-button__highlight-decorative size-full flex justify-center">
					<div class="text-button__highlight-decorative-rays -top-2"></div>
					<div class="text-button__highlight-decorative-rays rotate-180 -bottom-2"></div>
					<div class="text-button__highlight-decorative-glow size-full"></div>
					<div class="text-button__highlight-decorative-bg size-full"></div>
				</div>
				<div class="text-button__label text-accent-1 text-center min-w-72 relative" data-l10n-id="${caption}"></div>
			`;
    } else {
      this.Root.innerHTML = `
					<div class="text-button__highlight"></div>
					<div class="text-button__label text-accent-1 text-center min-w-72 relative" data-l10n-id="${caption}"></div>
				`;
    }
    this.Root.setAttribute("data-audio-press-ref", "data-audio-select-press");
  }
}
Controls.define("fxs-text-button", {
  createInstance: FxsTextButton,
  description: "just text, but also a button.",
  classNames: ["fxs-text-button"],
  attributes: [
    {
      name: "caption",
      description: "The text label of the button."
    },
    {
      name: "disabled",
      description: "Whether the button is disabled or not."
    }
  ],
  tabIndex: -1
});

class FxsLink extends FxsActivatable {
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(ActionActivateEventName, () => {
      const key = this.Root.getAttribute("url");
      if (key) {
        Network.openURLFromType(URLType[key]);
      }
    });
  }
}
Controls.define("fxs-link", {
  createInstance: FxsLink,
  description: "An hyperlink",
  attributes: [
    {
      name: "url",
      description: "the predefined possible url"
    }
  ]
});

export { ActionActivateEvent, ActionActivateEventName, DropdownSelectionChangeEvent, FxsActivatable, FxsCloseButton, FxsDecorativeFrame, FxsEditButton, FxsFlipBook, FxsHeroButton, FxsHoldToConfirm, FxsIconButton, FxsInnerFrame, FxsLink, FxsMinMaxButton, FxsMinusPlusButton, FxsModalFrame, FxsNavHelp, FxsOrnament1, FxsOrnament2, FxsOrnament3, FxsRewardButton, FxsScrollable, FxsScrollableHorizontal, FxsSelector, FxsSelectorOrnate, FxsStatefulIcon, FxsSubsystemFrame, FxsTabBar, FxsTabControl, RadioButtonGroupChangeEvent, ScrollAtBottomEvent, ScrollExitBottomEvent, ScrollIntoViewEvent, SubsystemFrameCloseEvent, TabSelectedEvent, resizeThumb };
//# sourceMappingURL=index.js.map
