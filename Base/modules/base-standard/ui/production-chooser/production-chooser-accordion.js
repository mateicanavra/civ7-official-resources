const ProductionChooserAccordionSectionToggleEventName = "production-chooser-accordion-section-toggle";
class ProductionChooserAccordionSectionToggleEvent extends CustomEvent {
  constructor(detail) {
    super(ProductionChooserAccordionSectionToggleEventName, { detail, bubbles: true });
  }
}
class ProductionChooserAccordionSection {
  constructor(id, title, isOpen) {
    this.id = id;
    this.title = title;
    this.root = document.createElement("div");
    this.root.id = id;
    this.root.classList.add("production-category", "mb-2", "ml-4");
    this.header = document.createElement("fxs-activatable");
    this.header.classList.value = "relative flex items-center group h-10 mb-2 hud_sidepanel_list-bg cursor-pointer";
    this.header.setAttribute("tabindex", "-1");
    this.sectionHeaderFocus = document.createElement("div");
    this.sectionHeaderFocus.classList.value = "absolute inset-0 img-list-focus-frame opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity";
    this.header.appendChild(this.sectionHeaderFocus);
    const sectionTitleWrapper = document.createElement("div");
    sectionTitleWrapper.classList.value = "relative flex-auto flex items-center justify-center";
    const sectionTitle = document.createElement("div");
    sectionTitle.classList.value = "font-title uppercase text-xs text-accent-2 tracking-100";
    sectionTitle.setAttribute("data-l10n-id", title);
    sectionTitleWrapper.appendChild(sectionTitle);
    this.header.appendChild(sectionTitleWrapper);
    this.arrowIcon = document.createElement("div");
    this.arrowIcon.classList.value = "w-12 h-8 img-arrow bg-center bg-no-repeat bg-contain transition-transform";
    this.header.appendChild(this.arrowIcon);
    this.root.appendChild(this.header);
    this.slot = document.createElement("div");
    this.slot.classList.add("flex", "flex-col", "shrink-0");
    this.slotWrapper = document.createElement("div");
    this.slotWrapper.classList.add("flex", "flex-col", "overflow-hidden", "transition-height", "ease-out");
    this.slotWrapper.append(this.slot);
    this.root.appendChild(this.slotWrapper);
    this.resizeObserver = new ResizeObserver((_entries) => {
      this.updateHeight(this.slot.scrollHeight);
    });
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        for (const node of mutation.addedNodes) {
          this.applyTabIndexPolicyForNode(node);
        }
      }
    });
    this.mutationObserver.observe(this.slot, {
      childList: true,
      subtree: false
    });
    this.header.addEventListener("action-activate", () => {
      this.toggle();
      this.root.dispatchEvent(new ProductionChooserAccordionSectionToggleEvent({ isOpen: this.isOpen }));
    });
    this.isOpen = isOpen;
    this.toggle(isOpen);
  }
  root;
  slot;
  slotWrapper;
  header;
  arrowIcon;
  sectionHeaderFocus;
  resizeObserver;
  mutationObserver;
  #isOpen;
  get isOpen() {
    return this.#isOpen;
  }
  set isOpen(_) {
    this.#isOpen = _;
  }
  /** Track changes to the size while open */
  observe() {
    this.resizeObserver.observe(this.slot, { box: "border-box" });
  }
  /**
   * Stop tracking size changes
   *
   * We do this because Gameface needs to check all elements that changed size to see if a particular resize observer matches,
   * so even if the element is not changing size, there is a performance cost
   *
   * NOTE: The mutation observer is not here because we need to always watch for new items to apply focus policy
   */
  unobserve() {
    this.resizeObserver.unobserve(this.slot);
  }
  /**
   * Completely stop observing changes for cleanup
   */
  disconnect() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
  }
  updateHeight(height) {
    const currentHeight = this.slotWrapper.clientHeight;
    const heightDiffAbs = Math.abs(height - currentHeight);
    const shouldAnimate = this.slotWrapper.attributeStyleMap.has("height");
    if (shouldAnimate) {
      const transitionDurationSeconds = Math.max(0.15, Math.min(1, heightDiffAbs / (2 * screen.height)));
      this.slotWrapper.style.transitionDuration = `${transitionDurationSeconds}s`;
    } else {
      this.slotWrapper.style.transitionDuration = "";
    }
    this.slotWrapper.attributeStyleMap.set("height", CSS.px(height));
  }
  // Ensure any newly added elements respect the current open/closed focus policy
  applyTabIndexPolicyForNode(node) {
    if (!(node instanceof Element)) return;
    const affected = [];
    if (node instanceof HTMLElement && node.matches(".production-chooser-item")) {
      affected.push(node);
    } else {
      node.querySelectorAll(".production-chooser-item").forEach((el) => affected.push(el));
    }
    if (affected.length === 0) return;
    if (!this.isOpen) {
      for (const el of affected) {
        el.removeAttribute("tabindex");
        el.setAttribute("data-disable-focus", "true");
      }
    } else {
      for (const el of affected) {
        el.setAttribute("tabindex", "-1");
        el.setAttribute("data-disable-focus", "false");
      }
    }
  }
  toggle(force = void 0) {
    const shouldOpen = force ?? !this.isOpen;
    if (shouldOpen) {
      this.open();
      this.header.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
    } else {
      this.close();
      this.header.setAttribute("data-audio-activate-ref", "data-audio-dropdown-open");
    }
  }
  open() {
    this.arrowIcon.classList.add("-rotate-90");
    this.isOpen = true;
    this.slot.classList.remove("disabled");
    const selectableChildren = this.slot.querySelectorAll(".production-chooser-item");
    for (const child of selectableChildren) {
      child.setAttribute("tabindex", "-1");
      child.setAttribute("data-disable-focus", "false");
    }
    this.observe();
  }
  close() {
    this.arrowIcon.classList.remove("-rotate-90");
    this.isOpen = false;
    this.slot.classList.add("disabled");
    const selectableChildren = this.slot.querySelectorAll(".production-chooser-item");
    for (const child of selectableChildren) {
      child.removeAttribute("tabindex");
      child.setAttribute("data-disable-focus", "true");
    }
    this.updateHeight(0);
    this.unobserve();
  }
}

export { ProductionChooserAccordionSection, ProductionChooserAccordionSectionToggleEvent, ProductionChooserAccordionSectionToggleEventName };
//# sourceMappingURL=production-chooser-accordion.js.map
