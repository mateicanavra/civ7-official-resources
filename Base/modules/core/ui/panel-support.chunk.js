import { F as Framework } from './framework.chunk.js';

var AnchorType = /* @__PURE__ */ ((AnchorType2) => {
  AnchorType2[AnchorType2["None"] = 0] = "None";
  AnchorType2[AnchorType2["Absolute"] = 1] = "Absolute";
  AnchorType2[AnchorType2["RelativeToTopLeft"] = 2] = "RelativeToTopLeft";
  AnchorType2[AnchorType2["RelativeToTop"] = 3] = "RelativeToTop";
  AnchorType2[AnchorType2["RelativeToTopRight"] = 4] = "RelativeToTopRight";
  AnchorType2[AnchorType2["RelativeToLeft"] = 5] = "RelativeToLeft";
  AnchorType2[AnchorType2["RelativeToCenter"] = 6] = "RelativeToCenter";
  AnchorType2[AnchorType2["RelativeToRight"] = 7] = "RelativeToRight";
  AnchorType2[AnchorType2["RelativeToBottomLeft"] = 8] = "RelativeToBottomLeft";
  AnchorType2[AnchorType2["RelativeToBottom"] = 9] = "RelativeToBottom";
  AnchorType2[AnchorType2["RelativeToBottomRight"] = 10] = "RelativeToBottomRight";
  AnchorType2[AnchorType2["SidePanelLeft"] = 11] = "SidePanelLeft";
  AnchorType2[AnchorType2["SidePanelRight"] = 12] = "SidePanelRight";
  AnchorType2[AnchorType2["Auto"] = 15] = "Auto";
  AnchorType2[AnchorType2["Fade"] = 16] = "Fade";
  return AnchorType2;
})(AnchorType || {});
class Panel extends Component {
  animateInType = 0 /* None */;
  animateOutType = 0 /* None */;
  enableOpenSound = false;
  enableCloseSound = false;
  documentClosePanelListener = this.close.bind(this, UIViewChangeMethod.PlayerInteraction);
  static animInStyleMap = /* @__PURE__ */ new Map();
  static animOutStyleMap = /* @__PURE__ */ new Map();
  isClosingRecursionGuard = false;
  inAttach = false;
  inputContext = InputContext.Shell;
  /** CTOR */
  constructor(root) {
    super(root);
    if (Panel.animInStyleMap.size == 0) {
      Panel.animInStyleMap.set(0 /* None */, []);
      Panel.animInStyleMap.set(15 /* Auto */, []);
      Panel.animInStyleMap.set(2 /* RelativeToTopLeft */, ["animate-in-left"]);
      Panel.animInStyleMap.set(3 /* RelativeToTop */, ["animate-in-top"]);
      Panel.animInStyleMap.set(4 /* RelativeToTopRight */, ["animate-in-right"]);
      Panel.animInStyleMap.set(5 /* RelativeToLeft */, ["animate-in-left"]);
      Panel.animInStyleMap.set(6 /* RelativeToCenter */, []);
      Panel.animInStyleMap.set(7 /* RelativeToRight */, ["animate-in-right"]);
      Panel.animInStyleMap.set(8 /* RelativeToBottomLeft */, ["animate-in-left"]);
      Panel.animInStyleMap.set(9 /* RelativeToBottom */, ["animate-in-bottom"]);
      Panel.animInStyleMap.set(10 /* RelativeToBottomRight */, ["animate-in-right"]);
      Panel.animInStyleMap.set(16 /* Fade */, ["animate-in-fade"]);
    }
    if (Panel.animOutStyleMap.size == 0) {
      Panel.animOutStyleMap.set(0 /* None */, []);
      Panel.animOutStyleMap.set(15 /* Auto */, []);
      Panel.animOutStyleMap.set(2 /* RelativeToTopLeft */, ["animate-out-left"]);
      Panel.animOutStyleMap.set(3 /* RelativeToTop */, ["animate-out-top"]);
      Panel.animOutStyleMap.set(4 /* RelativeToTopRight */, ["animate-out-right"]);
      Panel.animOutStyleMap.set(5 /* RelativeToLeft */, ["animate-out-left"]);
      Panel.animOutStyleMap.set(6 /* RelativeToCenter */, []);
      Panel.animOutStyleMap.set(7 /* RelativeToRight */, ["animate-out-right"]);
      Panel.animOutStyleMap.set(8 /* RelativeToBottomLeft */, ["animate-out-left"]);
      Panel.animOutStyleMap.set(9 /* RelativeToBottom */, ["animate-out-bottom"]);
      Panel.animOutStyleMap.set(10 /* RelativeToBottomRight */, ["animate-out-right"]);
      Panel.animOutStyleMap.set(16 /* Fade */, ["animate-out-fade"]);
    }
  }
  static onDefined(name) {
    super.onDefined(name);
    UI.Control.register(name);
  }
  /** Called once per creation, and immediately before the first time the component is initialized. */
  onInitialize() {
    super.onInitialize();
    const anchor = this.getAnimationByInspectingClasses();
    if (this.animateInType == 15 /* Auto */) {
      this.animateInType = anchor;
    }
    if (this.animateOutType == 15 /* Auto */) {
      this.animateOutType = anchor;
    }
  }
  /** Called each time the component is re-attached to the DOM */
  onAttach() {
    this.inAttach = true;
    super.onAttach();
    UI.Control.notifyAttached(this.Root.typeName, true);
    engine.on(`close-${this.Root.typeName}`, this.requestClose, this);
    document.addEventListener("close-panel", this.documentClosePanelListener);
    if (this.animateInType != 0 /* None */) {
      this.applyDefaultAnimateIn();
    }
    this.playAnimateInSound();
  }
  postOnAttach() {
    super.postOnAttach();
    this.inAttach = false;
  }
  onDetach() {
    document.removeEventListener("close-panel", this.documentClosePanelListener);
    engine.off(`close-${this.Root.typeName}`, this.requestClose, this);
    UI.Control.notifyAttached(this.Root.typeName, false);
    super.onDetach();
  }
  generateOpenCallbacks(_callbacks) {
  }
  requestClose(inputEvent) {
    inputEvent?.stopPropagation();
    inputEvent?.preventDefault();
    this.close();
  }
  close(uiViewChangeMethod = UIViewChangeMethod.Unknown) {
    if (!this.isClosingRecursionGuard) {
      this.isClosingRecursionGuard = true;
      this.playAnimateOutSound();
    }
    if (this.animateOutType != 0 /* None */) {
      this.applyDefaultAnimateOut();
      setTimeout(() => {
        Framework.ContextManager.pop(this.Root.tagName, { viewChangeMethod: uiViewChangeMethod });
      }, 200);
    } else {
      Framework.ContextManager.pop(this.Root.tagName, { viewChangeMethod: uiViewChangeMethod });
    }
    this.isClosingRecursionGuard = false;
  }
  /** Called if the panel was pushed in the Context Manager with a panelOptions object */
  setPanelOptions(_panelOptions) {
    console.warn("panel-support: panel was passed panelOptions but doesn't have a handler");
  }
  getPanelContent() {
    return "";
  }
  /**
   * Plays the animate in sound assigned to this object.
   */
  playAnimateInSound() {
    if (this.enableOpenSound) {
      this.playSound("data-audio-showing");
      if (UI.isAudioCursorEnabled()) {
        UI.lockCursor(true);
        UI.setCursorByType(UIHTMLCursorTypes.Text);
        setTimeout(() => {
          UI.lockCursor(false);
        }, 3e3);
      }
    }
  }
  /**
   * Plays the animate out sound assigned to this object.
   */
  playAnimateOutSound() {
    if (this.enableCloseSound && !this.inAttach) {
      this.playSound("data-audio-hiding");
      if (UI.isAudioCursorEnabled()) {
        UI.lockCursor(true);
        UI.setCursorByType(UIHTMLCursorTypes.Text);
        setTimeout(() => {
          UI.lockCursor(false);
        }, 3e3);
      }
    }
  }
  // --------------------------------------------------------------------------
  //                          ANIMATION
  // --------------------------------------------------------------------------
  /** Apply CSS classes to animate this panel in. */
  applyDefaultAnimateIn() {
    const animOutStyles = Panel.animOutStyleMap.get(this.animateOutType);
    if (animOutStyles) {
      for (const style of animOutStyles) {
        this.Root.classList.remove(style);
      }
    }
    const animInStyles = Panel.animInStyleMap.get(this.animateInType);
    if (animInStyles) {
      for (const style of animInStyles) {
        this.Root.classList.add(style);
      }
    }
  }
  /** Apply CSS classes to animate this panel out. */
  applyDefaultAnimateOut() {
    const animInStyles = Panel.animInStyleMap.get(this.animateInType);
    if (animInStyles) {
      for (const style of animInStyles) {
        this.Root.classList.remove(style);
      }
    }
    const animOutStyles = Panel.animOutStyleMap.get(this.animateOutType);
    if (animOutStyles) {
      for (const style of animOutStyles) {
        this.Root.classList.add(style);
      }
    }
  }
  /**
   * Determine an animation type to assicate with this panel based on
   * how it is decorated by style classes.
   * @returns {AnchorType} Type of animation enum based on classes.
   */
  getAnimationByInspectingClasses() {
    const isRight = this.Root.parentElement?.classList.contains("right_panel") || this.Root.parentElement?.classList.contains("right") || this.Root.parentElement?.parentElement?.classList.contains("right");
    const isLeft = this.Root.parentElement?.classList.contains("left_panel") || this.Root.parentElement?.classList.contains("left") || this.Root.parentElement?.parentElement?.classList.contains("left");
    const isCenter = isLeft == isRight;
    const isTop = this.Root.parentElement?.classList.contains("top") || this.Root.parentElement?.parentElement?.classList.contains("top");
    const isBottom = this.Root.parentElement?.classList.contains("bottom") || this.Root.parentElement?.parentElement?.classList.contains("bottom");
    const isMiddle = isTop == isBottom;
    if (isCenter) {
      if (isMiddle) return 6 /* RelativeToCenter */;
      if (isBottom) return 9 /* RelativeToBottom */;
      return 3 /* RelativeToTop */;
    }
    if (isRight) {
      if (isMiddle) return 7 /* RelativeToRight */;
      if (isBottom) return 10 /* RelativeToBottomRight */;
      return 4 /* RelativeToTopRight */;
    }
    if (isMiddle) return 5 /* RelativeToLeft */;
    if (isBottom) return 9 /* RelativeToBottom */;
    if (isTop) return 3 /* RelativeToTop */;
    return 0 /* None */;
  }
  /** Return debugging human-friendly string of info. */
  toString() {
    let msg = "Panel:";
    msg += this.Root.tagName;
    return msg;
  }
}

export { AnchorType as A, Panel as P };
//# sourceMappingURL=panel-support.chunk.js.map
