import { A as Audio } from '../audio-base/audio-support.chunk.js';
import { a as setFocusManager } from '../framework.chunk.js';

class FocusManagerSingleton {
  static Instance;
  currentFocus = document.body;
  // The focused HTML element (or body)
  pendingFocus = null;
  // An item that will take focus as soon as it's connected
  defaultFocus = document.body;
  // What to set as the focus if current focus becomes disconnected (should only be set ONCE per game state)
  activeNavCallback = null;
  updateListener = this.onFrameUpdate.bind(this);
  focusChain = [];
  // Chain of focus from an element up the body (and then the default).
  isGamepadActive = Input.getActiveDeviceType() == InputDeviceType.Controller;
  pendingFocusFrameCount = 0;
  // Track how many frames it took for a pending focus to be realized.
  whoLockedFocus = "";
  nonLockedFocus = null;
  get isFocusLocked() {
    return this.nonLockedFocus != null;
  }
  constructor() {
    engine.on("input-source-changed", (deviceType, _deviceLayout) => {
      this.onActiveDeviceTypeChanged(deviceType);
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!FocusManagerSingleton.Instance) {
      FocusManagerSingleton.Instance = new FocusManagerSingleton();
    }
    return FocusManagerSingleton.Instance;
  }
  /** Get the focused item */
  getFocus() {
    return this.currentFocus;
  }
  /**
   * Helper function to get if our current focus is active and has not been blurred
   */
  isFocusActive() {
    return !this.isWorldFocused() && document.activeElement == this.currentFocus;
  }
  /**
   * Obtain the first focusable descendant of a parent which is in the focus chain.
   * @param {HTMLElment} parent The parent in the focus chain,
   * @returns {HTMLElement|null} null if parent isn't in focus chain or if this is the current focused element, otherwise the first focusable item that is the decendant of the parent
   */
  getFocusChildOf(parent) {
    let index = -1;
    const focusChainLength = this.focusChain.length;
    for (let i = 0; i < focusChainLength; ++i) {
      if (this.focusChain[i].deref() == parent) {
        index = i;
        break;
      }
    }
    index = index - 1;
    if (index < 0) {
      return null;
    }
    while (index > 0) {
      const el = this.focusChain[index].deref();
      if (el && el.hasAttribute("tabindex")) {
        return el;
      }
      index--;
    }
    return this.focusChain.length > 0 ? this.focusChain[0].deref() ?? null : null;
  }
  /**
   * Helper for writing out information about a target Element to a log string.
   * @param {Element} target (optional) The target in question, or the current focus if not specified.
   * @returns string representation some unique identifiers of the target
   */
  toLogString(target) {
    if (target == void 0) target = this.currentFocus;
    return "name=" + +(target.nodeName ?? "") + ", tagName=" + (target.tagName ?? "") + ", className=" + (target.className ?? "");
  }
  resetFocus(target) {
    const YellowOnRedANSI = "\x1B[41m\x1B[33m";
    const ResetANSI = "\x1B[0m";
    console.warn(
      YellowOnRedANSI + "FM: DEPRECATED call to resetFocus. target: ",
      this.toLogString(target) + ResetANSI
    );
    this.setFocus(target);
  }
  /**
   * Set the focus an prevent anyone else from setting it until it's unlocked.
   **/
  lockFocus(target, who, why) {
    console.log(`FM: Focus lock requested by '${who}' on ${this.toLogString(target)}, because '${why}'.`);
    if (this.isFocusLocked) {
      console.error(`FM: Denying focus lock because already locked by ${this.whoLockedFocus}.`);
      return false;
    }
    if (target instanceof HTMLElement) {
      this.whoLockedFocus = who;
      this.nonLockedFocus = this.pendingFocus ?? this.currentFocus;
    } else {
      console.error(`FM: Denying focus lock because target ${target} is not an HTMLElement.`);
      return false;
    }
    this.pendingFocus = target;
    window.requestAnimationFrame(this.updateListener);
    return true;
  }
  unlockFocus(target, who) {
    console.log(`FM: Focus unlock by '${who}' on ${this.toLogString(target)}.`);
    if (!this.isFocusLocked) {
      console.error(`FM: Attempting to unlock focus by ${who} but it's already unlocked.`);
      return false;
    }
    if (this.whoLockedFocus != who) {
      console.error(`FM: Fail to unlock focus by ${who} as it was locked by ${this.whoLockedFocus}`);
      return false;
    }
    if (target != this.currentFocus && this.currentFocus != this.defaultFocus) {
      console.error(
        `FM: Fail to unlock focus by ${who} because the target '${this.toLogString(target)}' mismatches the currentFocus '${this.toLogString(this.currentFocus)}'.`
      );
      return false;
    }
    this.whoLockedFocus = "";
    this.pendingFocus = this.nonLockedFocus;
    this.nonLockedFocus = null;
    window.requestAnimationFrame(this.updateListener);
    return true;
  }
  /**
   * Set the focus to a particular element.
   * @param {Element} target element to focus, needs to have a "tabindex" attribute
   */
  setFocus(target) {
    if (target == null || target == void 0) {
      console.error("FM: Attempt to set focus to a null/undefined type.");
      return;
    }
    if (target == document.body) {
      console.warn(
        "FM: Explicitly setting focus to the document.body (aka: 'the world').  Use worldFocused() instead!"
      );
    } else if (target.hasAttribute("tabindex") == false) {
      if (target instanceof ComponentRoot == false || target.isInitialized) {
        console.error(
          "FM: Attempt to set focus on element without tabindex. element: ",
          this.toLogString(target)
        );
      }
    }
    if (this.isFocusLocked) {
      if (target instanceof HTMLElement) {
        if (target == this.currentFocus) {
          console.warn(
            `FM: Focus is locked. Ignoring call to set focus (pending) to the lock focus of '${this.toLogString(this.nonLockedFocus)}'.`
          );
          return;
        }
        console.warn(
          `FM: Focus is locked. Previous focus '${this.toLogString(this.nonLockedFocus)}' overriden by set focus call for '${this.toLogString(target)}'.`
        );
        this.nonLockedFocus = target;
      } else {
        console.error(
          `FM: Focus is locked and attempt to overwrite with non HTML element: '${this.toLogString(target)}'.`
        );
      }
      return;
    }
    if (target.isSameNode(this.pendingFocus)) {
      console.warn("FM: Multiple attempts to set focus, currently pending. target: ", this.toLogString(target));
    } else if (this.pendingFocus != null) {
      if (!this.pendingFocus.contains(target)) {
        console.warn(
          `FM: Setting focus to '${this.toLogString(target)}' and a pending focus '${this.pendingFocus}' will never be realized.`
        );
      }
    }
    this.pendingFocus = null;
    if (!target.isSameNode(this.currentFocus)) {
      if (target instanceof HTMLHtmlElement) {
        this.currentFocus = document.body;
      } else if (target instanceof HTMLElement) {
        if (this.readyForFocus(target)) {
          this.currentFocus = target;
        } else {
          if (this.pendingFocus) {
            console.error(
              "FM: Overriding a pending focus target with a new one. old: ",
              this.toLogString(this.pendingFocus),
              ",  new: ",
              this.toLogString(target)
            );
          }
          this.clearFocus();
          this.pendingFocus = target;
          window.requestAnimationFrame(this.updateListener);
          return;
        }
      } else {
        console.warn(
          "FM: Attempt to setFocus on non-HTML element; wasn't expecting that: " + this.toLogString(target)
        );
        return;
      }
      this.realizeFocus();
    }
  }
  /**
   * Is an element ready to receive focus from the focus manager.
   * @param element An HTMLElement
   * @returns true if it can be set focus.
   */
  readyForFocus(element) {
    if (element.isConnected) {
      if (element.hasAttribute("tabindex") || element == this.defaultFocus) {
        return true;
      }
    }
    return false;
  }
  /**
   * Create a list from the DOM branches that reach down to the node that is focused.
   */
  buildFocusChain() {
    this.focusChain = [];
    let element = this.currentFocus;
    while (element && element != document.body) {
      this.focusChain.push(new WeakRef(element));
      element = element.parentElement;
    }
    this.focusChain.push(new WeakRef(this.defaultFocus));
  }
  /**
   * Show or hide focus based on the environment.
   */
  realizeFocus() {
    if (!this.currentFocus.isConnected) {
      this.currentFocus = this.defaultFocus;
      console.warn(
        "FM: Needing to walk up focus chain to to disconnect currentFocus: ",
        this.toLogString(this.currentFocus)
      );
      this.focusChain.pop();
      while (this.focusChain.length > 0) {
        const weakElement = this.focusChain.pop();
        if (weakElement) {
          const el = weakElement.deref();
          if (el) {
            this.currentFocus = el;
            if (this.currentFocus.isConnected && this.currentFocus.hasAttribute("tabindex")) {
              break;
            }
          }
        }
      }
    }
    if (this.isGamepadActive) {
      const prevCurrentFocus = this.currentFocus;
      this.currentFocus.focus();
      if (prevCurrentFocus == this.currentFocus) {
        let audioId = this.currentFocus.getAttribute("data-audio-focus-ref");
        let audioGroup = this.currentFocus.getAttribute("data-audio-group-ref");
        if (!audioGroup || audioGroup == "") {
          audioGroup = "audio-base";
        }
        if (!audioId || audioId == "") {
          audioId = "data-audio-focus";
        }
        Audio.playSound(audioId, audioGroup);
      }
    } else {
      this.currentFocus.blur();
    }
    this.buildFocusChain();
  }
  /**
   * Returns the prior focus.
   * @param {HTMLElement} target The HTML element to be given focus if there is no connected focus.
   * @return {HTMLElement} The previous defaultFocus
   */
  setDefaultFocus(target) {
    if (!this.defaultFocus.isConnected) {
      console.warn(
        "Default focus is being set to an unconnected element, hope you know what you're doing. target:",
        this.toLogString(target)
      );
    }
    const previousDefaultFocus = this.defaultFocus;
    this.defaultFocus = target;
    return previousDefaultFocus;
  }
  /**
   * Check if a pending focus is ready to gain focus.
   */
  onFrameUpdate() {
    if (!this.pendingFocus) {
      return;
    }
    if (this.readyForFocus(this.pendingFocus)) {
      this.currentFocus = this.pendingFocus;
      this.realizeFocus();
      this.pendingFocus = null;
      this.pendingFocusFrameCount = 0;
    } else {
      this.pendingFocusFrameCount++;
      if (this.pendingFocusFrameCount == 10) {
        console.warn(
          "FM: Over 10 frames have been requested for element to receive focus: ",
          this.toLogString(this.pendingFocus)
        );
      }
      if (this.pendingFocusFrameCount == 30) {
        console.error(
          `FM: Forcing focus to body as a pending focus element has been waiting over ${this.pendingFocusFrameCount} frames for focus: ${this.toLogString(this.pendingFocus)}`
        );
        this.pendingFocus = null;
        this.pendingFocusFrameCount = 0;
        this.setFocus(document.body);
      }
      window.requestAnimationFrame(this.updateListener);
    }
  }
  /**
   * Make the 3D World the focus.
   */
  SetWorldFocused() {
    if (!this.isWorldFocused()) {
      this.clearFocus();
    }
  }
  /**
   * Check if the work is focused
   */
  isWorldFocused() {
    return this.currentFocus == document.body;
  }
  /**
   * Clears the current focused element and sets focus to the world (document.body)
   * @param {HTMLElement|null} targetElement - When set, only clear if its the current focus or the current focus is desecendent of it.
   */
  clearFocus(targetElement = null) {
    if (this.currentFocus == null) {
      console.error("FM: Clear focus but focus is null!");
      return;
    }
    if (this.isFocusLocked) {
      console.warn(
        `FM: Denying clearFocus('${targetElement ? this.toLogString(targetElement) : ""}') because focus is locked by ${this.whoLockedFocus}.`
      );
      return;
    }
    if (targetElement != null) {
      if (!this.currentFocus.isConnected) {
        console.error(
          "FM: Attempt to clear focus with an element and current focus is set to a disconnected DOM node. current: ",
          this.toLogString(this.currentFocus),
          ", target: ",
          this.toLogString(targetElement)
        );
        console.warn("FM: Will be clearing focus regardless of targetElement to prevent lock up.");
        return;
      } else {
        if (this.currentFocus != targetElement && !targetElement.contains(this.currentFocus)) {
          if (targetElement.querySelector(":focus") == null) {
            return;
          }
        }
      }
    }
    this.currentFocus.blur();
    this.currentFocus = document.body;
  }
  // DEPRECATED: Do not use, remove once screen-controller-mapping.ts is updated
  setNavCallback(callback) {
    this.activeNavCallback = callback;
  }
  // DEPRECATED: Do not use, remove once screen-controller-mapping.ts is updated
  getNavCallback() {
    return this.activeNavCallback;
  }
  onActiveDeviceTypeChanged = (deviceType) => {
    this.isGamepadActive = deviceType == InputDeviceType.Controller;
    this.realizeFocus();
  };
}
const FocusManager = FocusManagerSingleton.getInstance();
setFocusManager(FocusManager);

export { Audio as A, FocusManager as default };
//# sourceMappingURL=focus-manager.js.map
