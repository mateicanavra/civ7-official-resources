import { ChooserItem } from '../chooser-item/chooser-item.js';
import { c as chooserItemStyles } from '../chooser-item/chooser-item.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';

const styles = "fs://game/base-standard/ui/policies/screen-policies.css";

var PolicyChooserItemIcon = /* @__PURE__ */ ((PolicyChooserItemIcon2) => {
  PolicyChooserItemIcon2[PolicyChooserItemIcon2["NONE"] = 0] = "NONE";
  PolicyChooserItemIcon2[PolicyChooserItemIcon2["COMMUNISM"] = 1] = "COMMUNISM";
  PolicyChooserItemIcon2[PolicyChooserItemIcon2["DEMOCRACY"] = 2] = "DEMOCRACY";
  PolicyChooserItemIcon2[PolicyChooserItemIcon2["FASCISM"] = 3] = "FASCISM";
  PolicyChooserItemIcon2[PolicyChooserItemIcon2["TRADITION"] = 4] = "TRADITION";
  return PolicyChooserItemIcon2;
})(PolicyChooserItemIcon || {});
class PolicyChooserItem extends ChooserItem {
  get policyChooserNode() {
    return this._chooserNode;
  }
  set policyChooserNode(value) {
    this._chooserNode = value;
  }
  render() {
    const chooserItem = document.createDocumentFragment();
    const node = this.policyChooserNode;
    if (!node) {
      console.error("policy-chooser-item: render() - policyChooserNode was null!");
      return;
    }
    this.Root.setAttribute("hover-only-trigger", "true");
    this.Root.classList.add("policy-chooser-element", "flex", "flex-col", "items-center", "justify-center", "m-2");
    if (!node.isSelectable) {
      this.Root.classList.remove("pointer-events-auto");
      this.Root.classList.add("pointer-events-none");
    } else {
      this.Root.setAttribute("tabindex", "-1");
    }
    const normalState = document.createElement("div");
    const glowState = document.createElement("div");
    if (node.isPlaceable) {
      const normalClassToAdd = node.isCrisis ? "policy-chooser-element__crisis-placeable" : "policy-chooser-element__normal-placeable";
      normalState.classList.add(
        normalClassToAdd,
        "card-bg",
        "normal-bg",
        "absolute",
        "size-full",
        "pointer-events-none",
        "bg-center",
        "bg-no-repeat",
        "bg-cover"
      );
      const glowClassToAdd = node.isCrisis ? "policy-chooser-element__crisis-placeable-glow" : "policy-chooser-element__normal-placeable-glow";
      glowState.classList.add(
        glowClassToAdd,
        "card-bg",
        "glow-bg",
        "absolute",
        "size-full",
        "pointer-events-none",
        "bg-center",
        "bg-no-repeat",
        "bg-cover"
      );
    } else {
      const normalClassToAdd = node.isCrisis ? "policy-chooser-element__crisis" : "policy-chooser-element__normal";
      normalState.classList.add(
        normalClassToAdd,
        "card-bg",
        "normal-bg",
        "absolute",
        "size-full",
        "pointer-events-none",
        "bg-center",
        "bg-no-repeat",
        "bg-cover"
      );
      const glowClassToAdd = node.isCrisis ? "policy-chooser-element__crisis-glow" : "policy-chooser-element__normal-glow";
      glowState.classList.add(
        glowClassToAdd,
        "card-bg",
        "glow-bg",
        "absolute",
        "size-full",
        "pointer-events-none",
        "bg-center",
        "bg-no-repeat",
        "bg-cover"
      );
    }
    this.Root.appendChild(normalState);
    this.Root.appendChild(glowState);
    if (node.isCrisis) {
      const crisisImage = document.createElement("div");
      crisisImage.classList.value = "crisis-image absolute -top-2 -left-3 bg-no-repeat bg-center bg-contain size-9";
      this.Root.appendChild(crisisImage);
    } else {
      switch (node.iconType) {
        case 4 /* TRADITION */:
          const traditionImage = document.createElement("div");
          traditionImage.classList.value = "tradition-image absolute -top-4 -left-4 bg-no-repeat bg-center bg-cover h-24 w-12 flex items-center justify-center";
          this.Root.appendChild(traditionImage);
          if (!node.traitType) {
            console.error("policy-chooser-item: render() - no trait type specified for tradition icon!");
            break;
          }
          const civSymbolStr = node.traitType.replace("TRAIT_", "civ_sym_").toLowerCase();
          const traditionSymbol = document.createElement("div");
          traditionSymbol.classList.value = "mt-3 bg-no-repeat bg-center bg-contain size-7";
          traditionSymbol.style.backgroundImage = `url(${civSymbolStr})`;
          traditionImage.appendChild(traditionSymbol);
          break;
        case 1 /* COMMUNISM */:
          const communismImage = document.createElement("div");
          communismImage.classList.value = "communism-image absolute -top-2 -left-3 bg-no-repeat bg-center bg-contain size-9 flex items-center justify-center";
          this.Root.appendChild(communismImage);
          break;
        case 2 /* DEMOCRACY */:
          const democracyImage = document.createElement("div");
          democracyImage.classList.value = "democracy-image absolute -top-2 -left-3 bg-no-repeat bg-center bg-contain size-9 flex items-center justify-center";
          this.Root.appendChild(democracyImage);
          break;
        case 3 /* FASCISM */:
          const fascismImage = document.createElement("div");
          fascismImage.classList.value = "fascism-image absolute -top-2 -left-3 bg-no-repeat bg-center bg-contain size-9 flex items-center justify-center";
          this.Root.appendChild(fascismImage);
          break;
      }
    }
    const cardTextContainer = document.createElement("div");
    cardTextContainer.classList.value = "w-full flex flex-col items-center justify-center";
    const cardTitle = document.createElement("div");
    cardTitle.classList.add(
      "w-full",
      node.iconType ? "pl-3" : "pl-2",
      "pr-2",
      "pt-2",
      "text-center",
      "pb-1",
      "font-title-base",
      "tracking-100",
      "z-1"
    );
    cardTitle.setAttribute("data-l10n-id", node.name);
    cardTextContainer.appendChild(cardTitle);
    const cardDesc = document.createElement("div");
    cardDesc.classList.add(
      "policy-card-body-text",
      node.iconType ? "pl-6" : "pl-3",
      "pr-2",
      "pb-2",
      "text-accent-4",
      "font-body-sm",
      "z-1"
    );
    cardDesc.setAttribute("data-l10n-id", node.description);
    cardTextContainer.appendChild(cardDesc);
    chooserItem.appendChild(cardTextContainer);
    this.Root.appendChild(chooserItem);
  }
}
Controls.define("policy-chooser-item", {
  createInstance: PolicyChooserItem,
  description: "A chooser item to be used with the policy screen",
  classNames: ["policy-chooser-item", "relative"],
  styles: [chooserItemStyles, styles],
  images: [
    "fs://game/hud_sidepanel_list-bg.png",
    "fs://game/hud_list-focus_frame.png",
    "fs://game/hud_turn-timer.png",
    "fs://game/hud_civics-icon_frame.png",
    "rect_card_idle",
    "rect_card_idle_hover",
    "rect_crisis_idle",
    "rect_crisis_hover",
    "rect_card_placeable",
    "rect_card_placeable_hover",
    "rect_crisis_placeable",
    "rect_crisis_hover_placeable"
  ],
  attributes: [{ name: "reveal" }, { name: "play-error-sound" }]
});

export { PolicyChooserItem, PolicyChooserItemIcon, styles as s };
//# sourceMappingURL=policy-chooser-item.js.map
