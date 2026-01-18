import ActionHandler from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { q as quickFormatProgressionTreeNodeUnlocks } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { A as AttributeTrees } from './model-attribute-trees.chunk.js';
import { TreeCardHoveredEvent } from '../tree-grid/tree-card.js';
import { b as TreeCardBase, T as TreeSupport } from '../tree-grid/tree-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../tree-grid/tree-grid.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/graph-layout/layout.chunk.js';
import '../utilities/utilities-textprovider.chunk.js';
import '../utilities/utilities-tags.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../tree-grid/tree-components.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';

const styles = "fs://game/base-standard/ui/attribute-trees/attribute-card.css";

class AttributeCard extends TreeCardBase {
  onCardHoverListener = this.onCardHover.bind(this);
  onCardActivateListener = this.onCardActivate.bind(this);
  mouseEnterListener = this.onMouseenter.bind(this);
  focusListener = this.onFocus.bind(this);
  resizeListener = this.onResize.bind(this);
  currentHitbox;
  cardName = document.createElement("div");
  cardDescription = document.createElement("div");
  repeatedCount = document.createElement("div");
  lockedOverlay = document.createElement("div");
  lockedOverlayText = document.createElement("div");
  get isSmallCard() {
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    return isMobileViewExperience || window.innerWidth < Layout.pixelsToScreenPixels(1600);
  }
  get name() {
    return this.Root.getAttribute("name") ?? "";
  }
  get type() {
    const type = this.Root.getAttribute("type");
    return type != null ? +type : 0;
  }
  get icon() {
    return this.Root.getAttribute("icon") ?? "";
  }
  get lockedReason() {
    return this.Root.getAttribute("locked-reason") ?? "";
  }
  get hasLockedReason() {
    return this.lockedReason.length > 0;
  }
  get disabled() {
    return this.Root.getAttribute("disabled") == "true";
  }
  get completed() {
    return this.Root.getAttribute("completed") == "true";
  }
  get repeatable() {
    return this.Root.getAttribute("repeatable") == "true";
  }
  get repeated() {
    const repeatedTimes = this.Root.getAttribute("repeated");
    return repeatedTimes != null ? +repeatedTimes : 0;
  }
  get locked() {
    return this.Root.getAttribute("locked") == "true";
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
    this.Root.addEventListener("mouseenter", this.mouseEnterListener);
    this.Root.addEventListener("focus", this.focusListener);
    window.addEventListener("resize", this.resizeListener);
  }
  onDetach() {
    super.onDetach();
    this.Root.removeEventListener("mouseenter", this.mouseEnterListener);
    this.Root.removeEventListener("focus", this.focusListener);
    window.removeEventListener("resize", this.resizeListener);
  }
  onMouseenter(_event) {
    if (this.Root.classList.contains("has-data")) {
      this.playSound("data-audio-focus", "data-audio-focus-ref");
    }
  }
  onFocus(event) {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const hitBoxes = target.querySelector(".hitbox");
      if (hitBoxes) {
        FocusManager.setFocus(hitBoxes);
      }
    }
  }
  onCardHover(event) {
    const target = event.target;
    const type = target.getAttribute("type");
    const level = "0";
    if (!type) {
      console.warn("attribute: onCardHover(): Failed to find matching card for hover");
      return;
    }
    this.Root.dispatchEvent(new TreeCardHoveredEvent({ type, level }));
  }
  onCardActivate(event) {
    const target = event.target;
    const type = target.getAttribute("type");
    if (!type) {
      console.warn("tree-card: onCardActivate(): Failed to find matching card for hover");
      return;
    }
    if (ActionHandler.isTouchActive && TreeSupport.isSmallScreen()) {
      this.Root.dispatchEvent(new TreeCardHoveredEvent({ type: `${this.type}`, level: "0" }));
    } else if (!this.locked) {
      AttributeTrees.buyAttributeTreeNode(type);
    }
  }
  checkLockedReasonVisibility() {
    this.lockedOverlay.classList.toggle("hidden", !this.hasLockedReason || this.isSmallCard);
  }
  // TODO: (heading towards a component standard) component attributes should be the only source of truth, no need to re-render
  render() {
    while (this.Root.hasChildNodes()) {
      this.Root.removeChild(this.Root.children[0]);
    }
    if (this.isSmallCard) {
      const hitbox = document.createElement("attribute-small-card");
      hitbox.setAttribute("tabindex", "-1");
      hitbox.classList.add("hitbox", "size-26");
      hitbox.id = "attribute-card-type-" + this.type;
      hitbox.setAttribute("type", `${this.type}`);
      hitbox.addEventListener("action-activate", this.onCardActivateListener);
      hitbox.addEventListener("mouseenter", this.onCardHoverListener);
      hitbox.addEventListener("focus", this.onCardHoverListener);
      hitbox.setAttribute("disabled", `${this.disabled}`);
      hitbox.setAttribute("completed", `${this.completed}`);
      hitbox.setAttribute("repeatable", `${this.repeatable}`);
      hitbox.setAttribute("image-path", `${this.icon}`);
      hitbox.setAttribute("disable-focus-allowed", "true");
      hitbox.setAttribute("disabled-cursor-allowed", "false");
      const audioGroup = this.Root.getAttribute("data-audio-group-ref");
      if (audioGroup) {
        hitbox.setAttribute("data-audio-group-ref", audioGroup);
      }
      this.currentHitbox = hitbox;
      this.Root.appendChild(hitbox);
    } else {
      const hitbox = document.createElement("chooser-item");
      hitbox.classList.add("hitbox");
      hitbox.classList.add(
        "chooser-item_unlocked",
        "pointer-events-auto",
        "flex",
        "flex-auto",
        "flex-row",
        "pr-px",
        "relative",
        "max-w-76"
      );
      hitbox.addEventListener("mouseenter", this.onCardHoverListener);
      hitbox.addEventListener("focus", this.onCardHoverListener);
      hitbox.setAttribute("tabindex", "-1");
      hitbox.setAttribute("disabled-cursor-allowed", "false");
      hitbox.setAttribute("type", `${this.type}`);
      hitbox.id = "attribute-card-type-" + this.type;
      hitbox.addEventListener("action-activate", this.onCardActivateListener);
      const cardContent = document.createElement("div");
      cardContent.classList.add("flex", "flex-col", "items-center", "p-4");
      this.cardName.classList.add("font-title-base", "text-accent-2", "relative", "uppercase", "break-words");
      this.cardName.innerHTML = Locale.stylize(this.name || "");
      this.cardDescription.classList.add("font-body", "text-base", "text-accent-2", "relative", "break-words");
      const checkMarkContainer = document.createElement("div");
      checkMarkContainer.classList.add("checkmark-container", "attribute-card__checkmark", "z-1");
      const checkMark = document.createElement("div");
      checkMark.classList.add("absolute", "inset-3", "bg-accent-1", "mask-center-contain", "checkmark-icon");
      checkMarkContainer.appendChild(checkMark);
      const repeatedContainer = document.createElement("div");
      repeatedContainer.classList.add("checkmark-container", "attribute-card__repeated", "z-1");
      const repeatedIcon = document.createElement("div");
      repeatedIcon.classList.add("absolute", "inset-3", "bg-accent-1", "mask-center-contain", "repeated-icon");
      repeatedContainer.appendChild(repeatedIcon);
      cardContent.appendChild(this.cardName);
      cardContent.appendChild(this.cardDescription);
      hitbox.appendChild(cardContent);
      hitbox.appendChild(checkMarkContainer);
      hitbox.appendChild(repeatedContainer);
      hitbox.setAttribute("disabled", `${this.disabled}`);
      hitbox.setAttribute("focus-disabled", "true");
      hitbox.setAttribute("disable-focus-allowed", "true");
      this.currentHitbox = hitbox;
      this.repeatedCount.classList.add("relative", "mt-3", "text-base", "font-body", "flex", "justify-center");
      this.Root.appendChild(hitbox);
      this.Root.appendChild(this.repeatedCount);
      if (this.repeated > 0) {
        this.repeatedCount.innerHTML = Locale.compose("LOC_UI_ATTRIBUTE_TREES_BOUGHT_TIMES", this.repeated);
      }
      this.lockedOverlay.classList.add("absolute", "inset-0", "flex", "items-center", "justify-center");
      const lockedOverlayBackground = document.createElement("div");
      lockedOverlayBackground.classList.add("absolute", "inset-0", "bg-primary-5", "opacity-95");
      this.lockedOverlayText.classList.add(
        "absolute",
        "inset-0",
        "flex",
        "items-center",
        "justify-center",
        "p-6",
        "text-center"
      );
      this.lockedOverlayText.innerHTML = Locale.stylize(this.lockedReason || "");
      this.lockedOverlay.appendChild(lockedOverlayBackground);
      this.lockedOverlay.appendChild(this.lockedOverlayText);
      this.checkLockedReasonVisibility();
      const audioGroup = this.Root.getAttribute("data-audio-group-ref");
      if (audioGroup) {
        hitbox.setAttribute("data-audio-group-ref", audioGroup);
      }
      hitbox.appendChild(this.lockedOverlay);
    }
  }
  onResize() {
    this.render();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "type":
        const nodeDef = GameInfo.ProgressionTreeNodes.lookup(this.type);
        if (!nodeDef) {
          console.warn("attribute-card: onAttach(): Node definition not found, using attribute 'type'");
          return;
        }
        this.currentHitbox.setAttribute("type", newValue);
        const progressionTreeDescription = quickFormatProgressionTreeNodeUnlocks(nodeDef);
        this.cardDescription.innerHTML = Locale.stylize(progressionTreeDescription);
        break;
      case "icon":
        this.currentHitbox.setAttribute("image-path", newValue);
        break;
      case "name":
        this.cardName.innerHTML = Locale.stylize(newValue ? newValue : "");
        break;
      case "locked-reason":
        this.checkLockedReasonVisibility();
        this.lockedOverlayText.innerHTML = Locale.stylize(this.lockedReason || "");
        break;
      case "disabled":
        this.currentHitbox.setAttribute("disabled", `${newValue == "true"}`);
        super.onAttributeChanged(name, oldValue, newValue);
        break;
      case "completed":
        this.currentHitbox.setAttribute("completed", `${newValue == "true"}`);
        break;
      case "repeatable":
        this.currentHitbox.setAttribute("repeatable", `${newValue == "true"}`);
        break;
      case "repeated":
        this.repeatedCount.classList.toggle("hidden", this.repeated <= 0);
        if (this.repeated > 0) {
          this.repeatedCount.innerHTML = Locale.compose("LOC_UI_ATTRIBUTE_TREES_BOUGHT_TIMES", this.repeated);
          if (TreeSupport.isSmallScreen()) {
            this.Root.dispatchEvent(new TreeCardHoveredEvent({ type: `${this.type}`, level: "0" }));
          }
        }
        break;
      case "play-error-sound":
        this.currentHitbox.setAttribute("play-error-sound", newValue);
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
    if (this.locked || this.completed || this.disabled) {
      this.currentHitbox.setAttribute("play-error-sound", "true");
    } else {
      this.currentHitbox.setAttribute("play-error-sound", "false");
    }
  }
}
Controls.define("attribute-card", {
  createInstance: AttributeCard,
  description: "Single attribute card element",
  classNames: ["attribute-card", "flex", "flex-col"],
  styles: [styles],
  attributes: [
    {
      name: "type"
    },
    {
      name: "icon"
    },
    {
      name: "name"
    },
    {
      name: "locked-reason"
    },
    {
      name: "disabled"
    },
    {
      name: "completed"
    },
    {
      name: "repeatable"
    },
    {
      name: "repeated"
    },
    {
      name: "play-error-sound"
    },
    {
      name: "locked"
    }
  ],
  tabIndex: -1
  // even disabled cards can be focused
});
//# sourceMappingURL=attribute-card.js.map
