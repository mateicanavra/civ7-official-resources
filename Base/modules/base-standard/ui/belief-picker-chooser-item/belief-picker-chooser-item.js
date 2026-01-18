import { ChooserItem } from '../chooser-item/chooser-item.js';
import { c as chooserItemStyles } from '../chooser-item/chooser-item.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';

const beliefPickerChooserItemStyles = "fs://game/base-standard/ui/belief-picker-chooser-item/belief-picker-chooser-item.css";

class BeliefPickerChooserItem extends ChooserItem {
  get beliefPickerChooserNode() {
    return this._chooserNode;
  }
  set beliefPickerChooserNode(value) {
    this._chooserNode = value;
  }
  render() {
    super.render();
    const chooserItem = document.createDocumentFragment();
    const node = this.beliefPickerChooserNode;
    if (!node) {
      console.error("belief-picker-chooser-item: render() - beliefPickerChooserNode was null!");
      return;
    }
    this.Root.classList.add("flex", "my-1", "ml-3", "min-h-20", "p-1", "w-full");
    if (!node.isLocked && node.name == "") {
      this.Root.classList.add("belief-picker_slot", "items-center", "justify-center");
      const borderContainer = document.createElement("div");
      borderContainer.classList.value = "absolute size-full flex relative";
      chooserItem.appendChild(borderContainer);
      const leftBorder = document.createElement("div");
      leftBorder.classList.value = "belief-picker-chooser-item_border belief-border-left bg-no-repeat bg-cover h-full w-1\\/2";
      borderContainer.appendChild(leftBorder);
      const rightBorder = document.createElement("div");
      rightBorder.classList.value = "belief-picker-chooser-item_border -scale-x-100 bg-no-repeat bg-cover h-full w-1\\/2";
      borderContainer.appendChild(rightBorder);
      const textContainer = document.createElement("div");
      textContainer.classList.value = "flex absolute items-center relative";
      chooserItem.appendChild(textContainer);
      const plusIcon = document.createElement("div");
      plusIcon.classList.value = "belief-picker-chooser-item_plus size-8 bg-contain bg-no-repeat";
      textContainer.appendChild(plusIcon);
      const descriptionText = document.createElement("div");
      descriptionText.classList.value = "font-title-lg text-accent-1 tracking-150";
      descriptionText.setAttribute("data-l10n-id", node.description);
      textContainer.appendChild(descriptionText);
    } else if (node.name.length > 0) {
      this.Root.classList.add("items-center", "items-start");
      this.Root.classList.toggle("cursor-not-allowed", !node.isSwappable);
      this.Root.classList.toggle("cursor-pointer", node.isSwappable);
      if (node.isSwappable) {
        this.Root.classList.add("chooser-item_unlocked", "grow");
      } else {
        this.Root.classList.add("belief-picker_slot");
        this.Root.removeAttribute("tabindex");
      }
      const primaryIcon = this.createChooserIcon(node.primaryIcon);
      chooserItem.appendChild(primaryIcon);
      const textContainer = document.createElement("div");
      textContainer.classList.value = "flex flex-col justify-center h-full flex-auto p-1 relative";
      chooserItem.appendChild(textContainer);
      const title = document.createElement("div");
      title.classList.value = "font-title-xs uppercase tracking-100";
      title.setAttribute("data-l10n-id", node.name);
      textContainer.appendChild(title);
      const description = document.createElement("div");
      description.classList.value = "belief-picker_desc font-body-xs";
      description.setAttribute("data-l10n-id", node.description);
      textContainer.appendChild(description);
    } else {
      this.Root.classList.add("belief-picker_slot", "items-center", "cursor-not-allowed", "grow");
      this.Root.classList.remove("cursor-pointer");
      this.Root.setAttribute("disabled", "true");
      const primaryIcon = this.createChooserIcon(node.primaryIcon);
      chooserItem.appendChild(primaryIcon);
      const description = document.createElement("div");
      description.classList.value = "belief-picker_desc font-body-sm text-accent-5 px-1 relative";
      description.setAttribute("data-l10n-id", node.description);
      chooserItem.appendChild(description);
      this.Root.removeAttribute("tabindex");
    }
    this.Root.appendChild(chooserItem);
  }
}
Controls.define("belief-picker-chooser-item", {
  createInstance: BeliefPickerChooserItem,
  description: "A chooser item to be used with the belief picker",
  classNames: ["belief-picker-chooser-item", "relative", "group"],
  styles: [chooserItemStyles, beliefPickerChooserItemStyles],
  images: [
    "fs://game/hud_sidepanel_list-bg.png",
    "fs://game/hud_list-focus_frame.png",
    "fs://game/hud_turn-timer.png",
    "fs://game/hud_civics-icon_frame.png"
  ],
  attributes: [{ name: "reveal" }, { name: "selected" }, { name: "disabled" }]
});

export { BeliefPickerChooserItem };
//# sourceMappingURL=belief-picker-chooser-item.js.map
