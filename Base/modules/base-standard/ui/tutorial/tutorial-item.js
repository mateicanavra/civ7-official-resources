class HighlightManager {
  highlighters = /* @__PURE__ */ new Map();
  registerHighlighter(name, addFunc, removeFunc) {
    this.highlighters.set(name, { add: addFunc, remove: removeFunc });
  }
  add(element) {
    const name = element.getAttribute("data-tut-highlight") ?? "default";
    const func = this.highlighters.get(name)?.add;
    if (func) {
      func(element);
    } else {
      console.error(
        `Tutorial cannot add highlight to an element because specified highlighter '${name}' doesn't exist. element: ${element.className}`
      );
    }
  }
  remove(element) {
    const name = element.getAttribute("data-tut-highlight") ?? "default";
    const func = this.highlighters.get(name)?.remove;
    if (func) {
      func(element);
    } else {
      console.error(
        `Tutorial cannot remove a highlight from an element because specified highlighter '${name}' doesn't exist. element: ${element.className}`
      );
    }
  }
}
const highlighter = new HighlightManager();
function downArrowAdd(element) {
  const highlightRoot = document.createElement("div");
  highlightRoot.classList.add("tut-arrow-vert");
  element.appendChild(highlightRoot);
}
function downArrowDelete(element) {
  const highlightRoot = element.querySelector(".tut-arrow-vert");
  if (!highlightRoot) {
    console.warn("Unable to remove down arrow highlight from element, cannot find root highlight node.");
    return;
  }
  highlightRoot.classList.remove("tut-arrow-vert");
  highlightRoot.parentElement?.removeChild(highlightRoot);
}
highlighter.registerHighlighter("downArrowHighlighter", downArrowAdd, downArrowDelete);
function defaultHighlightAdd(element) {
  element.classList.add("tut-default-highlight");
}
function defaultHighlightRemove(element) {
  element.classList.remove("tut-default-highlight");
}
highlighter.registerHighlighter("default", defaultHighlightAdd, defaultHighlightRemove);
function founderHighlightAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.value = "tut-circle-highlight absolute min-w-36 min-h-36 pointer-events-none";
  element.classList.add("flex", "justify-center", "items-center");
  element.appendChild(pingAnim);
}
function founderHighlightRemove(element) {
  const highlightLeftover = element.querySelector(".tut-circle-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.classList.remove("flex", "justify-center", "items-center");
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("founderHighlight", founderHighlightAdd, founderHighlightRemove);
function productionHighlightAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-container-highlight");
  pingAnim.classList.add("production-highlight");
  element.appendChild(pingAnim);
}
function productionHighlightRemove() {
  const highlightLeftover = document.querySelector(".tut-container-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("productionHighlights", productionHighlightAdd, productionHighlightRemove);
function techHighlightAdd(element) {
  const borderAnim = document.createElement("div");
  borderAnim.classList.add("tut-chooser-item-highlight");
  element.appendChild(borderAnim);
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-ping-pos-highlight", "tut-ping-pos-highlight-top");
  borderAnim.appendChild(pingAnim);
  const arrowAnim = document.createElement("div");
  arrowAnim.classList.add("tut-ping-arrow", "tut-ping-arrow-top");
  element.appendChild(arrowAnim);
}
function techHighlightRemove() {
  const borderHighlightLeftover = document.querySelector(".tut-chooser-item-highlight");
  borderHighlightLeftover?.remove();
  const arrowHighlightLeftover = document.querySelector(".tut-ping-arrow");
  arrowHighlightLeftover?.remove();
}
highlighter.registerHighlighter("techChooserHighlights", techHighlightAdd, techHighlightRemove);
function techHighlightOffAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-blank-highlight");
  element.appendChild(pingAnim);
}
function techHighlightOffRemove() {
  const highlightLeftover = document.querySelector(".tut-blank-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("techChooserHighlightsOff", techHighlightOffAdd, techHighlightOffRemove);
var Tutorial;
((Tutorial2) => {
  function highlightElement(element) {
    highlighter.add(element);
  }
  Tutorial2.highlightElement = highlightElement;
  function unhighlightElement(element) {
    highlighter.remove(element);
  }
  Tutorial2.unhighlightElement = unhighlightElement;
})(Tutorial || (Tutorial = {}));

var TutorialItemState = /* @__PURE__ */ ((TutorialItemState2) => {
  TutorialItemState2[TutorialItemState2["Unseen"] = 0] = "Unseen";
  TutorialItemState2[TutorialItemState2["Active"] = 1] = "Active";
  TutorialItemState2[TutorialItemState2["Completed"] = 2] = "Completed";
  TutorialItemState2[TutorialItemState2["Persistent"] = 3] = "Persistent";
  return TutorialItemState2;
})(TutorialItemState || {});
var TutorialLevel = /* @__PURE__ */ ((TutorialLevel2) => {
  TutorialLevel2[TutorialLevel2["None"] = 0] = "None";
  TutorialLevel2[TutorialLevel2["WarningsOnly"] = 2] = "WarningsOnly";
  TutorialLevel2[TutorialLevel2["TutorialOn"] = 4] = "TutorialOn";
  return TutorialLevel2;
})(TutorialLevel || {});
var ItemType = /* @__PURE__ */ ((ItemType2) => {
  ItemType2[ItemType2["PerTurn"] = 0] = "PerTurn";
  ItemType2[ItemType2["Persistent"] = 1] = "Persistent";
  ItemType2[ItemType2["Tracked"] = 2] = "Tracked";
  ItemType2[ItemType2["Legacy"] = 3] = "Legacy";
  return ItemType2;
})(ItemType || {});
var TutorialAnchorPosition = /* @__PURE__ */ ((TutorialAnchorPosition2) => {
  TutorialAnchorPosition2["TopLeft"] = "top-left";
  TutorialAnchorPosition2["TopCenter"] = "top-center";
  TutorialAnchorPosition2["TopRight"] = "top-right";
  TutorialAnchorPosition2["MiddleLeft"] = "middle-left";
  TutorialAnchorPosition2["MiddleCenter"] = "middle-center";
  TutorialAnchorPosition2["MiddleRight"] = "middle-right";
  TutorialAnchorPosition2["BottomLeft"] = "bottom-left";
  TutorialAnchorPosition2["BottomCenter"] = "bottom-center";
  TutorialAnchorPosition2["BottomRight"] = "bottom-right";
  return TutorialAnchorPosition2;
})(TutorialAnchorPosition || {});
var NextItemStatus = /* @__PURE__ */ ((NextItemStatus2) => {
  NextItemStatus2["Canceled"] = "NextItemCanceled";
  return NextItemStatus2;
})(NextItemStatus || {});
var TutorialAdvisorType = /* @__PURE__ */ ((TutorialAdvisorType2) => {
  TutorialAdvisorType2["Default"] = "advisor-default";
  TutorialAdvisorType2["Military"] = "advisor-military";
  TutorialAdvisorType2["Culture"] = "advisor-culture";
  TutorialAdvisorType2["Science"] = "advisor-science";
  TutorialAdvisorType2["Economic"] = "advisor-economic";
  return TutorialAdvisorType2;
})(TutorialAdvisorType || {});
var TutorialCalloutType = /* @__PURE__ */ ((TutorialCalloutType2) => {
  TutorialCalloutType2[TutorialCalloutType2["BASE"] = 0] = "BASE";
  TutorialCalloutType2[TutorialCalloutType2["NOTIFICATION"] = 1] = "NOTIFICATION";
  return TutorialCalloutType2;
})(TutorialCalloutType || {});
const UnsetProperties = {
  eventName: "!",
  event: "@",
  playerId: -2,
  altPlayerId: -3,
  isLocalPlayerTurn: false
};
class TutorialItem {
  ID = "DEFAULT_TUTORIAL_NODE";
  group = -1;
  // hash of processed label
  version = 0;
  // higher versions overwrite same ID with lower ones
  nextID;
  alsoActivateID;
  properties = UnsetProperties;
  // The tutorial environment properties that were used to activate this item (written out)
  level = 4 /* TutorialOn */;
  type = 0 /* PerTurn */;
  addToFront;
  category = "TutorialManager";
  priority;
  subpriority;
  /** If defined will attempt to override the default IDisplayQueue category for this tutorial item  */
  queueToOverride;
  activationCustomEvents = [];
  activationEngineEvents = [];
  completionEngineEvents = [];
  completionCustomEvents = [];
  filterPlayers = [GameContext.localPlayerID];
  runAllTurns = false;
  // default: only evalute the tutorial item during the player's turn
  _skip = false;
  dialog;
  callout;
  questPanel;
  highlights;
  dynamicHighlights;
  enabled2d;
  disable;
  hiders;
  inputContext;
  quest;
  highlightPlots;
  inputFilters;
  canMinimize = true;
  disablesPausing;
  // the reference to the tutorial-callout pop up element
  calloutElement = null;
  onActivate;
  onCleanUp;
  onActivateCheck;
  // If function set, must resolve to true to active.
  onCompleteCheck;
  // Condition that is run when tutorial item is up, if ever true it completes and closes the tutorial item
  onObsoleteCheck;
  // Condition that is run on unseen items to determine if item should be "obsoleted" which immediately completes without side-effects (does not chain activate, etc...)
  eState = 0 /* Unseen */;
  get isUnseen() {
    return this.eState == 0 /* Unseen */;
  }
  get isActive() {
    return this.eState == 1 /* Active */;
  }
  get isResident() {
    return this.eState == 3 /* Persistent */;
  }
  get isCompleted() {
    return this.eState == 2 /* Completed */;
  }
  get skip() {
    return this._skip;
  }
  get isPersistent() {
    return this.type == 1 /* Persistent */ || this.type == 2 /* Tracked */ || this.type == 3 /* Legacy */;
  }
  get isTracked() {
    return this.type == 2 /* Tracked */ || this.type == 3 /* Legacy */;
  }
  get isLegacy() {
    return this.type == 3 /* Legacy */;
  }
  constructor(def) {
    this.ID = def.ID ? def.ID : TutorialItem.prototype.ID;
    this.group = -1;
    this.nextID = def.nextID;
    this.alsoActivateID = def.alsoActivateID;
    this.onActivate = def.onActivate;
    this.onCleanUp = def.onCleanUp;
    this.onActivateCheck = def.onActivateCheck;
    this.onCompleteCheck = def.onCompleteCheck;
    this.onObsoleteCheck = def.onObsoleteCheck;
    if (def.level != void 0) {
      this.level = def.level;
    }
    if (def.runAllTurns != void 0) {
      this.runAllTurns = def.runAllTurns;
    }
    if (def.filterPlayers != void 0) {
      this.filterPlayers = def.filterPlayers;
    }
    if (def.activationCustomEvents != void 0) {
      this.activationCustomEvents = def.activationCustomEvents;
    }
    if (def.activationEngineEvents != void 0) {
      this.activationEngineEvents = def.activationEngineEvents;
    }
    if (def.completionEngineEvents != void 0) {
      this.completionEngineEvents = def.completionEngineEvents;
    }
    if (def.completionCustomEvents != void 0) {
      this.completionCustomEvents = def.completionCustomEvents;
    }
    if (def.skip != void 0) {
      this._skip = def.skip;
    }
    if (def.dialog != void 0) {
      this.dialog = def.dialog;
      this.disablesPausing = true;
    }
    if (def.callout != void 0) {
      this.callout = def.callout;
    }
    if (def.questPanel != void 0) {
      this.questPanel = def.questPanel;
    }
    if (def.highlights != void 0) {
      this.highlights = def.highlights;
    }
    if (def.dynamicHighlights != void 0) {
      this.dynamicHighlights = def.dynamicHighlights;
    }
    if (def.enabled2d != void 0) {
      this.enabled2d = def.enabled2d;
    }
    if (def.disable != void 0) {
      this.disable = def.disable;
    }
    if (def.hiders != void 0) {
      this.hiders = def.hiders;
    }
    if (def.inputContext != void 0) {
      this.inputContext = def.inputContext;
    }
    if (def.quest != void 0) {
      if (def.quest.victory != void 0) {
        this.type = 3 /* Legacy */;
      } else {
        this.type = 2 /* Tracked */;
      }
      this.quest = {
        id: this.ID,
        system: "tutorial",
        title: def.quest.title,
        description: def.quest.description,
        getDescriptionLocParams: def.quest.getDescriptionLocParams,
        getCurrentProgress: def.quest.getCurrentProgress,
        progressType: def.quest.progressType ? def.quest.progressType : "",
        goal: def.quest.goal,
        cancelable: def.quest.cancelable,
        victory: def.quest.victory
      };
    } else {
      this.type = def.isPersistent ? 1 /* Persistent */ : 0 /* PerTurn */;
    }
    if (def.highlightPlots != void 0) {
      this.highlightPlots = def.highlightPlots;
    }
    if (def.inputFilters != void 0) {
      this.inputFilters = def.inputFilters;
    }
    if (def.canMinimize != void 0) {
      this.canMinimize = def.canMinimize;
    }
    this.warnRepeatedActionKeys();
  }
  warnRepeatedActionKeys() {
    const optionsActionKeys = [];
    if (this.callout) {
      if (this.callout.option1) {
        optionsActionKeys.push(this.callout.option1.actionKey);
      }
      if (this.callout.option2) {
        optionsActionKeys.push(this.callout.option2.actionKey);
      }
      if (this.callout.option3) {
        optionsActionKeys.push(this.callout.option3.actionKey);
      }
    }
    if (new Set(optionsActionKeys).size !== optionsActionKeys.length) {
      console.warn(
        `tutorial-item: Tutorial item with ID: ${this.ID} has duplicated "actionKeys". Current actionKeys: ${optionsActionKeys}`
      );
    }
  }
  // Once the item has been added and "processed" for delivery by the tutorial manager.
  _processed = false;
  get processed() {
    return this._processed;
  }
  set processed(value) {
    this._processed = true;
    if (value == false) {
      console.error("Attempt to unprocess a tutorial item: ", this.ID);
    }
  }
  /**
   * Helper to turn on/off any associate highlights with the tutorial item.
   * @param {Tutorial.HighlightFunc} The function to call which highlights or unhighlights all nodes in the selector.
   */
  doHighlights(highlightFunc) {
    this.highlights?.forEach((selector) => {
      waitUntilValue(() => {
        const nodes = document.querySelectorAll(selector);
        return nodes.length > 0 ? true : null;
      }).then(() => {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach((node) => {
          highlightFunc(node);
        });
      }).catch((exception) => {
        if (this.isCompleted) {
          return;
        }
        if (exception) {
          console.error(
            `Badly formatted selector when setting tutorial item to be (un)highlighed. item: ${this.ID}, selector: '${selector}'.`
          );
          return;
        }
        console.warn(
          `Promise rejected for tutorial (un)highlights. No selector ${selector} found for tutorial item: ${this.ID} in the DOM`
        );
      });
    });
    this.dynamicHighlights?.forEach((highlight) => {
      const getQueryString = (item) => {
        const baseSelector = item.baseSelector;
        const attributeSelector = item.attributeSelector;
        const attributeQueryString = `${baseSelector}[${attributeSelector?.attributeName}="${attributeSelector?.attributeValue}"]`;
        const queryString = attributeSelector ? attributeQueryString : baseSelector;
        return queryString;
      };
      try {
        const containerQueryString = getQueryString(highlight.containerSelector);
        const container = document.querySelector(containerQueryString);
        if (!container) {
          console.error(
            `Container not found, cannot set the highlight. item: ${this.ID}, selector: '${highlight.containerSelector}'.`
          );
          return;
        }
        const itemQueryString = getQueryString(highlight.itemSelector);
        const node = container.querySelector(itemQueryString);
        if (!node) {
          console.error(
            `Item not found, cannot set the highlight. item: ${this.ID} ,attribute name: ${highlight.itemSelector.attributeSelector?.attributeName}, atribute value: '${highlight.itemSelector.attributeSelector?.attributeValue}'.`
          );
          return;
        }
        highlightFunc(node);
      } catch (exception) {
        if (exception) {
          console.error(
            `Invalid selector on dynamic highlight. item: ${this.ID}, selector: '${highlight.containerSelector}'.`
          );
          return;
        }
        console.error(
          `Unhandled non-DOMException occurred when setting tutorial item to be (un)highlighed. item: ${this.ID}, exception: ${exception.name}.`
        );
      }
    });
  }
  activateHighlights = () => {
    this.doHighlights(Tutorial.highlightElement);
  };
  deactivateHighlights = () => {
    this.doHighlights(Tutorial.unhighlightElement);
  };
  markActive() {
    if (this.isActive) {
      return false;
    }
    this.eState = this.isPersistent ? 3 /* Persistent */ : 1 /* Active */;
    if (this.onActivate) {
      this.onActivate(this);
    }
    return true;
  }
  markComplete() {
    if (this.isCompleted) {
      return false;
    }
    this.eState = 2 /* Completed */;
    this.deactivateHighlights();
    if (this.onCleanUp) {
      this.onCleanUp(this);
    }
    return true;
  }
  markUnseen() {
    if (this.isUnseen) {
      return false;
    }
    this.eState = 0 /* Unseen */;
    this.deactivateHighlights();
    if (this.onCleanUp) {
      this.onCleanUp(this);
    }
    return true;
  }
  /**
   * Is the environment compatible with the item's expected environment?
   * @param {TutorialEnvironmentProperties} properties that describe the environment the item is running in.
   * @returns {boolean} true if properties are a match.
   */
  runsInEnvironment(properties) {
    if (!properties.isLocalPlayerTurn && !this.runAllTurns) {
      return false;
    }
    if (this.activationEngineEvents && this.activationEngineEvents.length > 0) {
      if (this.activationEngineEvents?.find((name) => name == properties.eventName)) {
        this.properties = properties;
        return true;
      }
    }
    if (this.activationCustomEvents && this.activationCustomEvents.length > 0) {
      if (this.activationCustomEvents?.find((name) => name == properties.eventName)) {
        this.properties = properties;
        return true;
      }
    }
    if (this.activationEngineEvents == void 0 && this.activationCustomEvents == void 0) {
      this.properties = properties;
      return true;
    }
    return false;
  }
  /**
   * Writes a value for the current tutorial item to the current save files.
   */
  writeMem(value) {
    const hash = Database.makeHash("__MEM-" + this.ID);
    GameTutorial.setProperty(hash, value);
  }
  /**
   * Reads a value for a given tutorial item from the current save files.
   * @param {string} ID Optional ID for a different tutorial item that we want to check the storage of.
   */
  readMem(ID) {
    const key = ID ? ID : this.ID;
    const hash = Database.makeHash("__MEM-" + key);
    const value = GameTutorial.getProperty(hash);
    if (value === void 0) {
      console.error("tutorial-item: Could not get hashed value for tutorial item with ID: " + key);
    }
    return value;
  }
}

export { ItemType, NextItemStatus, TutorialAdvisorType, TutorialAnchorPosition, TutorialCalloutType, TutorialItemState, TutorialLevel, TutorialItem as default };
//# sourceMappingURL=tutorial-item.js.map
