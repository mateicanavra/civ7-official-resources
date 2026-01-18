import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../input/action-handler.js';
import FocusManager from '../../input/focus-manager.js';
import { b as InputEngineEventName } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<div\r\n\tid=\"scroller\"\r\n\tclass=\"credits-scroller\"\r\n>\r\n\t<div\r\n\t\tid=\"adiv\"\r\n\t\tclass=\"scroll-div\"\r\n\t></div>\r\n\t<div\r\n\t\tid=\"bdiv\"\r\n\t\tclass=\"scroll-div\"\r\n\t></div>\r\n\t<div\r\n\t\tid=\"cdiv\"\r\n\t\tclass=\"scroll-div\"\r\n\t></div>\r\n</div>\r\n<div class=\"credits-buttons\"></div>\r\n";

const styles = "fs://game/core/ui/shell/credits/screen-credits.css";

const creditsUrl = "fs://game/core/ui/shell/credits/credits-base.xml";

const ScreenCreditsOpenedEventName = "screen-credits-opened";
class ScreenCreditsOpenedEvent extends CustomEvent {
  constructor() {
    super(ScreenCreditsOpenedEventName, { bubbles: false, cancelable: true });
  }
}
const ScreenCreditsClosedEventName = "screen-credits-closed";
class ScreenCreditsClosedEvent extends CustomEvent {
  constructor() {
    super(ScreenCreditsClosedEventName, { bubbles: false, cancelable: true });
  }
}
const LOADING_MAX_MS = 9e3;
var Speeds = /* @__PURE__ */ ((Speeds2) => {
  Speeds2[Speeds2["NORMAL"] = 24] = "NORMAL";
  Speeds2[Speeds2["FAST"] = 64] = "FAST";
  Speeds2[Speeds2["VERY_FAST"] = 128] = "VERY_FAST";
  Speeds2[Speeds2["PLAID"] = 256] = "PLAID";
  return Speeds2;
})(Speeds || {});
var Position = /* @__PURE__ */ ((Position2) => {
  Position2[Position2["LEFT"] = 0] = "LEFT";
  Position2[Position2["CENTER"] = 1] = "CENTER";
  Position2[Position2["RIGHT"] = 2] = "RIGHT";
  return Position2;
})(Position || {});
const PositionLookup = {
  [0 /* LEFT */]: { x: 15, y: -36.7115, z: 10 },
  [2 /* RIGHT */]: { x: -15, y: -36.7115, z: 10 },
  [1 /* CENTER */]: { x: 0, y: -36.7115, z: 10 }
};
const SmallAspectRatioPositionLookup = {
  [0 /* LEFT */]: { x: 12, y: -36.7115, z: 10 },
  [2 /* RIGHT */]: { x: -12, y: -36.7115, z: 10 },
  [1 /* CENTER */]: { x: 0, y: -36.7115, z: 10 }
};
var State = /* @__PURE__ */ ((State2) => {
  State2[State2["LOADING"] = 0] = "LOADING";
  State2[State2["READY"] = 1] = "READY";
  State2[State2["PLAY"] = 2] = "PLAY";
  State2[State2["PAUSE"] = 3] = "PAUSE";
  State2[State2["CLOSING"] = 4] = "CLOSING";
  State2[State2["ERROR"] = 5] = "ERROR";
  return State2;
})(State || {});
var Op = /* @__PURE__ */ ((Op2) => {
  Op2[Op2["no_style"] = 0] = "no_style";
  Op2[Op2["title_style"] = 1] = "title_style";
  Op2[Op2["subtitle_style"] = 2] = "subtitle_style";
  Op2[Op2["role_style"] = 3] = "role_style";
  Op2[Op2["name_style"] = 4] = "name_style";
  Op2[Op2["left_align"] = 5] = "left_align";
  Op2[Op2["center_align"] = 6] = "center_align";
  Op2[Op2["right_align"] = 7] = "right_align";
  Op2[Op2["image"] = 8] = "image";
  Op2[Op2["model"] = 9] = "model";
  Op2[Op2["remove_model"] = 10] = "remove_model";
  return Op2;
})(Op || {});
class Command {
  constructor(op, value) {
    this.op = op;
    this.value = value;
  }
}
class ScreenCredits extends Panel {
  // Events
  engineInputListener = this.onEngineInput.bind(this);
  fastForwardListener = this.onFastForward.bind(this);
  pauseListener = this.onPause.bind(this);
  updateListener = this.onUpdate.bind(this);
  rafUpdateHandle = null;
  // requestAnimationFrame(this.updateListener) handle.
  UIElements = [];
  // Non-screen elements to "turn off" during display.
  pool = document.createElement("div");
  // Element to pool non-active elements off of.
  state = 0 /* LOADING */;
  // State of this object.
  lines = [];
  // Actual credits
  commands = /* @__PURE__ */ new Map();
  // Formatting commands (line #, command)
  index = 0;
  speed = 24 /* NORMAL */;
  lastTime = 0;
  scroller;
  // holds scrolling content
  pauseButton;
  fastForwardButton;
  // 3D Model related
  model3D = null;
  creditsModelGroup = null;
  darkCardsModelGroup = null;
  cameraPushes = 0;
  // Load credits
  constructor(root) {
    super(root);
    this.lastTime = Date.now();
    this.fetchCredits(creditsUrl).then((creditLines) => {
      if (!(typeof creditLines === "string")) {
        this.error("Unable to fetch credits.");
        return;
      }
      if (this.parse(creditLines)) {
        this.state = 1 /* READY */;
      } else {
        this.error("Error parsing the credits file.");
      }
    });
  }
  error(message) {
    console.error(message);
    this.state = 5 /* ERROR */;
  }
  requestClose() {
    this.playSound("data-audio-activate", "data-audio-activate-ref");
    this.state = 4 /* CLOSING */;
  }
  onInitialize() {
    super.onInitialize();
    this.scroller = MustGetElement(".credits-scroller", this.Root);
    this.Root.classList.add("size-full", "relative");
    const closeButton = document.createElement("fxs-close-button");
    closeButton.addEventListener("action-activate", () => {
      this.requestClose();
    });
    this.Root.appendChild(closeButton);
    const holder = MustGetElement(".credits-buttons", this.Root);
    this.pauseButton = document.createElement("fxs-button");
    this.pauseButton.setAttribute("caption", Locale.compose("LOC_CREDITS_PAUSE"));
    this.pauseButton.addEventListener("action-activate", this.pauseListener);
    holder.appendChild(this.pauseButton);
    this.fastForwardButton = document.createElement("fxs-button");
    this.fastForwardButton.setAttribute("caption", Locale.compose("LOC_CREDITS_FAST_FORWARD"));
    this.fastForwardButton.addEventListener("action-activate", this.fastForwardListener);
    holder.appendChild(this.fastForwardButton);
    this.realizeInputType(ActionHandler.isGamepadActive);
  }
  onAttach() {
    super.onAttach();
    this.hideUI();
    this.creditsModelGroup = WorldUI.createModelGroup("creditsModelGroup");
    this.Root.listenForWindowEvent(
      ActiveDeviceTypeChangedEventName,
      this.onActiveDeviceTypeChanged.bind(this),
      true
    );
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.rafUpdateHandle = window.requestAnimationFrame(this.updateListener);
    window.dispatchEvent(new ScreenCreditsOpenedEvent());
    this.Root.listenForEngineEvent("InviteAccepted", this.onInviteAccepted.bind(this));
  }
  onDetach() {
    if (this.rafUpdateHandle != null) {
      cancelAnimationFrame(this.rafUpdateHandle);
    }
    if (this.state != 4 /* CLOSING */) {
      console.warn(`Detatching credits when state isn't closing('${4 /* CLOSING */}') but is '${this.state}'`);
      this.state = 4 /* CLOSING */;
    }
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.creditsModelGroup?.destroy();
    this.darkCardsModelGroup?.destroy();
    this.creditsModelGroup = null;
    this.darkCardsModelGroup = null;
    this.restoreUI();
    super.onDetach();
  }
  onInviteAccepted() {
    this.state = 4 /* CLOSING */;
  }
  /**
   * Received focus from the context manager (not focus manager!)
   */
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction1("LOC_CREDITS_PAUSE");
    NavTray.addOrUpdateShellAction2("LOC_CREDITS_FAST_FORWARD");
    FocusManager.setFocus(this.Root);
  }
  /**
   * Loses focus from the context manager.
   */
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  /**
   * Main loop driving the credits.
   */
  onUpdate(_delta) {
    this.rafUpdateHandle = null;
    switch (this.state) {
      case 5 /* ERROR */:
        console.log("Leaving credits update() due to error.");
        this.state = 4 /* CLOSING */;
        break;
      case 1 /* READY */:
        if (this.Root.isConnected) {
          this.initScrolling();
          this.state = 2 /* PLAY */;
        }
        break;
      case 0 /* LOADING */:
        if (Date.now() - this.lastTime > LOADING_MAX_MS) {
          this.error("Credits exceeded max time to load the credits; erroring out.");
        }
        break;
      case 2 /* PLAY */:
        this.scroll();
        break;
      case 3 /* PAUSE */:
        break;
      case 4 /* CLOSING */:
        if (this.pool) {
          while (this.pool.children.length > 0) {
            this.pool.removeChild(this.pool.children[0]);
          }
          this.Root.removeChild(this.pool);
        }
        while (this.cameraPushes > 0) {
          this.clear3DScene();
        }
        window.dispatchEvent(new ScreenCreditsClosedEvent());
        this.close();
        return;
      // Leave so as to not re-up the update loop.
      default:
        this.error(`Unknown state ${this.state} in credits update.`);
        break;
    }
    this.rafUpdateHandle = window.requestAnimationFrame(this.updateListener);
  }
  onPause() {
    const caption = this.state == 3 /* PAUSE */ ? Locale.compose("LOC_CREDITS_PAUSE") : Locale.compose("LOC_CREDITS_PLAY");
    this.pauseButton.setAttribute("caption", caption);
    NavTray.addOrUpdateShellAction1(caption);
    switch (this.state) {
      case 3 /* PAUSE */:
        this.state = 2 /* PLAY */;
        break;
      case 2 /* PLAY */:
        this.state = 3 /* PAUSE */;
        break;
      default:
        console.warn(`Unable to pause credit when state is ('${this.state}'`);
        break;
    }
  }
  onFastForward() {
    const caption = this.speed != 24 /* NORMAL */ ? Locale.compose("LOC_CREDITS_FAST_FORWARD") : Locale.compose("LOC_CREDITS_SLOW_DOWN");
    this.fastForwardButton.setAttribute("caption", caption);
    NavTray.addOrUpdateShellAction2(caption);
    switch (this.speed) {
      case 24 /* NORMAL */:
        this.speed = 64 /* FAST */;
        break;
      case 64 /* FAST */:
        this.speed = 24 /* NORMAL */;
        break;
      case 128 /* VERY_FAST */:
        this.speed = 24 /* NORMAL */;
        break;
      // TODO: Fix spacing, Speeds.VERY_FAST; break;
      case 256 /* PLAID */:
        this.speed = 24 /* NORMAL */;
        break;
      // TODO: Fix spacing, Speeds.PLAID; break;
      default:
        this.speed = 24 /* NORMAL */;
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.state = 4 /* CLOSING */;
    }
    if (inputEvent.detail.name == "shell-action-1") {
      this.onPause();
    }
    if (inputEvent.detail.name == "shell-action-2") {
      this.onFastForward();
    }
    inputEvent.stopPropagation();
    inputEvent.preventDefault();
  }
  onActiveDeviceTypeChanged(event) {
    this.realizeInputType(event.detail?.gamepadActive);
  }
  realizeInputType(isGamepad) {
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.classList.toggle("hidden", isGamepad);
    this.pauseButton.classList.toggle("hidden", isGamepad);
    this.fastForwardButton.classList.toggle("hidden", isGamepad);
  }
  initScrolling() {
    this.index = 0;
    this.pool.classList.add("invisible");
    this.Root.appendChild(this.pool);
    while (this.scroller.children.length > 0) {
      this.scroller.removeChild(this.scroller.children[0]);
    }
    if (!this.addNextLine()) {
      this.error("Immediately failed to add a line to the credits scroller.");
    }
  }
  /**
   * Add the next line of content to the credits.
   * @returns true if line is added, false otherwise
   */
  addNextLine() {
    if (this.index >= this.lines.length) {
      return false;
    }
    const fontClasses = [];
    const content2 = this.lines[this.index];
    const commands = this.commands.get(this.index);
    let imageName = "";
    let modelName = "";
    let position = 0 /* LEFT */;
    let removing = false;
    if (commands) {
      commands.forEach((command) => {
        switch (command.op) {
          case 7 /* right_align */:
            position = 2 /* RIGHT */;
            break;
          case 5 /* left_align */:
            position = 0 /* LEFT */;
            break;
          case 6 /* center_align */:
            position = 1 /* CENTER */;
            break;
          case 0 /* no_style */:
            break;
          case 1 /* title_style */:
            fontClasses.push("credits-section__title", "font-title");
            break;
          case 2 /* subtitle_style */:
            fontClasses.push("credits-section__subtitle", "font-body");
            break;
          case 3 /* role_style */:
            fontClasses.push("credits-section__role", "font-body");
            break;
          case 4 /* name_style */:
            fontClasses.push("credits-section__name", "font-title");
            break;
          case 8 /* image */:
            imageName = command.value;
            break;
          case 9 /* model */:
            modelName = command.value;
            break;
          case 10 /* remove_model */:
            modelName = command.value;
            removing = true;
            break;
        }
      });
    }
    this.index++;
    const screenHeight = window.innerHeight;
    if (imageName.length > 1) {
      const el = this.getRow();
      el.classList.add("credits-image-row");
      el.style.transition = "transform 0.1s linear";
      el.style.transform = `translateY(${screenHeight}px)`;
      const holder = document.createElement("div");
      holder.classList.add("credits-image-holder");
      const imageElement = document.createElement("img");
      imageElement.classList.add("credits-image");
      imageElement.setAttribute("src", `fs://game/${imageName}`);
      holder.appendChild(imageElement);
      el.appendChild(holder);
      this.scroller.appendChild(el);
    } else if (removing) {
      this.clear3DScene();
    } else if (modelName.length > 1) {
      this.build3DScene(modelName, position);
    } else {
      if (!commands) {
        fontClasses.push("credits-section__name");
      }
      const el = this.getRow();
      el.classList.add("credits-text-row", ...fontClasses);
      el.style.transition = "transform 0.1s linear";
      el.style.transform = `translateY(${screenHeight}px)`;
      el.innerHTML = content2;
      this.scroller.appendChild(el);
    }
    return true;
  }
  // Return to the pool for future use.
  removeRow(row) {
    this.pool.appendChild(this.scroller.removeChild(row));
    row.style.transition = "";
  }
  // Obtain row for credits scrolling
  getRow() {
    if (this.pool && this.pool.children.length > 1) {
      const el = this.pool.children[this.pool.children.length - 1];
      if (el instanceof HTMLElement) {
        el.innerHTML = "";
        el.className = "";
        return el;
      }
    }
    return document.createElement("p");
  }
  scroll() {
    const screenHeight = window.innerHeight;
    let add = true;
    for (let i = 0; i < this.scroller.children.length; i++) {
      const child = this.scroller.children[i];
      if (child instanceof HTMLImageElement) {
        continue;
      }
      const rect = child.getBoundingClientRect();
      child.style.transform = `translateY(${rect.top - this.speed}px)`;
      if (rect.bottom < 0) {
        this.removeRow(child);
      } else if (rect.bottom > screenHeight) {
        add = false;
      }
    }
    if (add) {
      if (!this.addNextLine()) {
        if (this.scroller.children.length < 1) {
          this.close();
        }
      }
    }
  }
  hideUI() {
    if (this.UIElements.length > 0) {
      console.error("Credits hiding UI elements but has existing elements already (left over) in it.");
    }
    this.UIElements.push(MustGetElement("main-menu", document));
    if (Network.supportsSSO()) {
      this.UIElements.push(MustGetElement(".carousel", document));
      this.UIElements.push(MustGetElement("profile-header", document));
      this.UIElements.push(MustGetElement(".connection-icon-img", document));
      this.UIElements.push(MustGetElement(".connection-status", document));
      this.UIElements.push(MustGetElement(".account-status", document));
    }
    this.UIElements.forEach((element) => {
      element.classList.add("invisible");
    });
  }
  restoreUI() {
    this.UIElements.forEach((element) => {
      element.classList.remove("invisible");
    });
    this.UIElements = [];
  }
  build3DScene(assetId, position) {
    const positionLookup = window.innerWidth / window.innerHeight < 3 / 2 ? SmallAspectRatioPositionLookup : PositionLookup;
    const eye = positionLookup[position];
    const at = { ...positionLookup[position], y: 0 };
    Camera.pushCamera(eye, at);
    this.cameraPushes++;
    const model3dMarker = WorldUI.createFixedMarker({ x: -1.5, y: 0, z: 0 });
    const centerGradientMarker = WorldUI.createFixedMarker({ x: eye.x, y: -10, z: 0 });
    this.creditsModelGroup?.clear();
    if (this.creditsModelGroup && model3dMarker != null && centerGradientMarker != null) {
      this.creditsModelGroup.addVFX(
        "VFX_Credits_Fade_Whole_Screen",
        { marker: model3dMarker, offset: { x: 0, y: -10, z: 0 } },
        { angle: 0, scale: 1 }
      );
      this.creditsModelGroup.addModel(
        "VFX_Credits_Fade_Card",
        { marker: centerGradientMarker, offset: { x: 0, y: 0, z: 0 } },
        { angle: 0, scale: 0.6, foreground: true, needsShadows: false }
      );
      this.model3D = this.creditsModelGroup.addModel(
        assetId,
        { marker: model3dMarker, offset: { x: 0, y: 0, z: 0 } },
        { angle: 0, scale: 0.9, initialState: "IDLE_CharSelect", triggerCallbacks: true }
      );
      if (this.model3D == null) {
        this.model3D = this.creditsModelGroup.addModel(
          "LEADER_FALLBACK_GAME_ASSET",
          { marker: model3dMarker, offset: { x: 0, y: 0, z: 0 } },
          { angle: 0, scale: 0.9, initialState: "IDLE_CharSelect", triggerCallbacks: true }
        );
      }
    }
  }
  clear3DScene() {
    if (this.model3D) {
      this.creditsModelGroup?.clear();
      this.model3D = null;
    }
    if (this.cameraPushes > 0) {
      Camera.popCamera();
      this.cameraPushes--;
    }
  }
  async fetchCredits(url) {
    try {
      const content2 = await asyncLoad(url);
      const creditsStartTag = "<credits>";
      const creditsEndTag = "</credits>";
      const startIdx = content2.indexOf(creditsStartTag);
      const endIdx = content2.indexOf(creditsEndTag, startIdx + creditsStartTag.length);
      if (startIdx === -1 || endIdx === -1) {
        console.error("Invalid XML: <credits> tag not found.");
        return [];
      }
      let creditsContent = content2.substring(startIdx + creditsStartTag.length, endIdx).trim();
      const cdataStartTag = "<![CDATA[";
      const cdataEndTag = "]]>";
      if (creditsContent.startsWith(cdataStartTag) && creditsContent.endsWith(cdataEndTag)) {
        creditsContent = creditsContent.substring(cdataStartTag.length, creditsContent.length - cdataEndTag.length).trim();
      }
      if (UI.shouldIncludeAppleCredit()) {
        const appleCredit = `[2,c]Produced by Apple${"\n".repeat(8)}`;
        creditsContent = appleCredit + creditsContent;
      }
      return creditsContent;
    } catch (error) {
      console.error("Error fetching credits:", error);
      return;
    }
  }
  parse(blob) {
    this.lines = blob.replace(/^[ \t]+/gm, "").split(/\r?\n/);
    this.lines.forEach((line, index) => {
      const matches = line.match(/\[(.*?)\]/g);
      if (!matches) {
        return;
      }
      const commands = [];
      let processedLine = line;
      matches.forEach((match) => {
        const values = match.replace(/[\[\]]/g, "").split(",");
        values.forEach((value) => {
          let command = null;
          switch (value.trim()) {
            case "0":
              command = new Command(0 /* no_style */, "");
              break;
            case "1":
              command = new Command(1 /* title_style */, "");
              break;
            case "2":
              command = new Command(2 /* subtitle_style */, "");
              break;
            case "3":
              command = new Command(3 /* role_style */, "");
              break;
            case "4":
              command = new Command(4 /* name_style */, "");
              break;
            case "l":
              command = new Command(5 /* left_align */, "");
              break;
            case "c":
              command = new Command(6 /* center_align */, "");
              break;
            case "r":
              command = new Command(7 /* right_align */, "");
              break;
            case "i":
            case "m":
            case "rm":
            case "x":
              command = new Command(
                value.trim() === "i" ? 8 /* image */ : value.trim() === "m" ? 9 /* model */ : 10 /* remove_model */,
                processedLine.replace(/\[.*?\]/g, "").trim()
                // Get the value outside of brackets
              );
              processedLine = "";
              break;
          }
          if (command) {
            commands.push(command);
          }
        });
      });
      this.lines[index] = processedLine.replace(/\[.*?\]/g, "").trim();
      if (commands.length > 0) {
        this.commands.set(index, commands);
      }
    });
    return true;
  }
}
Controls.define("screen-credits", {
  createInstance: ScreenCredits,
  description: "Civ Credits Screen",
  classNames: ["screen-credits"],
  styles: [styles],
  innerHTML: [content],
  tabIndex: -1
});

export { ScreenCreditsClosedEventName, ScreenCreditsOpenedEventName };
//# sourceMappingURL=screen-credits.js.map
