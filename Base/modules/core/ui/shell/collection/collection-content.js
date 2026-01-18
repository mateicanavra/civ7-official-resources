import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const styles = "fs://game/core/ui/shell/collection/collection-content.css";

const bForceShowPromoLoadingSpinner = false;
class CollectionContent extends Panel {
  promosRetrievalCompleteListener = (data) => {
    this.createCards(data);
  };
  focusListener = this.onFocus.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  mainSlot;
  selectedCard = null;
  pendingContentSelection = null;
  // Leader or civilizaiton type -> card + item
  contentToCardLookup = /* @__PURE__ */ new Map();
  constructor(root) {
    super(root);
  }
  onInitialize() {
    this.Root.innerHTML = this.getContent();
  }
  setPendingContentSelection(contentType) {
    this.pendingContentSelection = contentType;
    this.updatePendingSelection();
  }
  getContent() {
    return `
			<fxs-scrollable-horizontal class="scrollable-frame store-launcher-scrollable flex-auto" flex="auto" attached-scrollbar="true">
				<fxs-hslot class="store-launcher-content flex-auto p-6">
				</fxs-hslot>
			</fxs-scrollable-horizontal>
		`;
  }
  onAttach() {
    super.onAttach();
    this.mainSlot = MustGetElement(".store-launcher-content", this.Root);
    this.Root.addEventListener("focus", this.focusListener);
    engine.on("PromosRetrievalCompleted", this.promosRetrievalCompleteListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    Online.Promo.getPromosForPlacement("2kstore");
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("focus", this.focusListener);
    engine.off("PromosRetrievalCompleted", this.promosRetrievalCompleteListener);
    super.onDetach();
  }
  updateNavTray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction1("LOC_GENERIC_REDEEMCODE");
  }
  onFocus() {
    this.realizeFocus();
    this.updateNavTray();
  }
  realizeFocus() {
    FocusManager.setFocus(this.selectedCard ? this.selectedCard : this.mainSlot);
  }
  onActivate(selectedCard, promo) {
    const isFullyLinked = Network.isFullAccountLinked() && Network.isAccountLinked();
    const isChild = Network.isChildAccount();
    if (isFullyLinked && (!isChild || isChild && Network.isChildPermittedPurchasing())) {
      const attributes = {
        contentID: promo.contentID,
        imageUrl: promo.imageUrl,
        contentTitle: promo.contentTitle,
        contentDescription: promo.contentDescription,
        owned: Online.Promo.shouldPromoDisplayOwnership() ? promo.owned : false
      };
      this.selectedCard = selectedCard;
      ContextManager.push("screen-dlc-viewer", { singleton: true, createMouseGuard: true, attributes });
    } else {
      if (!isFullyLinked) {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_JOIN_GAME_LINK_ACCOUNT"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE")
        });
      } else {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_PARENT_PERMISSION_REQUIRED"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE")
        });
      }
    }
  }
  // PROMO_TODO: We will want to make this animated like the one in loading screen. Waiting on UI/UX design and implementation: https://2kfxs.atlassian.net/browse/IGP-103673
  showPromoLoadingSpinner() {
  }
  // PROMO_TODO: We will want to make this animated like the one in loading screen. Waiting on UI/UX design and implementation: https://2kfxs.atlassian.net/browse/IGP-103673
  hidePromoLoadingSpinner() {
  }
  createItemCard(item, targetElement) {
    const storeCardActivatable = document.createElement("fxs-activatable");
    storeCardActivatable.classList.add(
      "store-launcher__card-activatable",
      "group",
      "relative",
      "w-128",
      "mr-6",
      "mt-7"
    );
    storeCardActivatable.setAttribute("tabindex", "-1");
    storeCardActivatable.setAttribute("data-content-id", item.contentID);
    storeCardActivatable.setAttribute("data-audio-group-ref", "store-launcher");
    storeCardActivatable.setAttribute("data-audio-activate-ref", "data-audio-clicked-addcontent");
    storeCardActivatable.setAttribute("data-audio-focus-ref", "data-audio-focus-addcontent");
    storeCardActivatable.setAttribute("data-audio-press-ref", "data-audio-press-addcontent");
    storeCardActivatable.addEventListener("action-activate", () => {
      this.onActivate(storeCardActivatable, item);
    });
    storeCardActivatable.addEventListener("mouseenter", () => {
      Telemetry.sendUIMenuAction({
        Menu: TelemetryMenuType.Extras,
        MenuAction: TelemetryMenuActionType.Hover,
        Item: item.contentID
      });
    });
    if (item.imageUrl && !bForceShowPromoLoadingSpinner) {
      this.hidePromoLoadingSpinner();
      storeCardActivatable.style.backgroundImage = `url('${item.imageUrl}')`;
    } else {
      this.showPromoLoadingSpinner();
    }
    targetElement.appendChild(storeCardActivatable);
    const contentContainer = document.createElement("div");
    contentContainer.classList.add(
      "store-launcher__card-content",
      "w-full",
      "h-full",
      "absolute",
      "flex",
      "flex-col",
      "items-center",
      "pointer-events-none",
      "p-6",
      "opacity-0",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100"
    );
    const storeCardLabelContainer = document.createElement("div");
    storeCardLabelContainer.classList.add("store-launcher__card-label-container", "relative");
    const storeCardLabelText = document.createElement("div");
    storeCardLabelText.classList.add(
      "store-launcher__card-label-text",
      "text-shadow-br",
      "relative",
      "font-title",
      "text-xl",
      "text-center",
      "text-secondary",
      "uppercase"
    );
    storeCardLabelText.textContent = item.contentTitle;
    storeCardLabelContainer.appendChild(storeCardLabelText);
    const storeCardPriceContainer = document.createElement("div");
    storeCardPriceContainer.classList.add("store-launcher__card-price-container", "relative");
    const storeCardPriceText = document.createElement("div");
    storeCardPriceText.classList.add("store-launcher__card-price-text", "relative");
    storeCardPriceText.innerHTML = Locale.compose(item.contentPrice);
    storeCardPriceContainer.appendChild(storeCardPriceText);
    const storeCardDescriptionContainer = document.createElement("div");
    storeCardDescriptionContainer.classList.add("store-launcher__card-description-container");
    contentContainer.appendChild(storeCardLabelContainer);
    if (Online.Promo.shouldPromoDisplayOwnership()) {
      const storeCardLockIconContainer = document.createElement("div");
      storeCardLockIconContainer.classList.add("store-launcher__card-ownership-icon-wrapper", "relative");
      const storeCardLockIcon = document.createElement("div");
      storeCardLockIcon.classList.add("relative", "size-9", "bg-contain");
      storeCardLockIcon.classList.add(item.owned ? "img-checkbox-on" : "img-checkbox-off");
      storeCardLockIconContainer.appendChild(storeCardLockIcon);
      contentContainer.appendChild(storeCardLockIconContainer);
    }
    contentContainer.appendChild(storeCardDescriptionContainer);
    if (Online.Promo.shouldPromoDisplayOwnership()) {
      const cardOwnershipTextContainer = document.createElement("div");
      cardOwnershipTextContainer.classList.add(
        "store-launcher__card-ownership-text-wrapper",
        "relative",
        "grow",
        "flex",
        "flex-col",
        "justify-end"
      );
      const cardOwnershipText = document.createElement("div");
      cardOwnershipText.classList.add(
        "store-launcher__card-ownership-text",
        "relative",
        "font-title",
        "text-xl",
        "text-center",
        "text-secondary",
        "uppercase"
      );
      cardOwnershipText.setAttribute("data-l10n-id", Locale.compose(item.owned ? "LOC_UI_STORE_PURCHASED" : ""));
      cardOwnershipTextContainer.appendChild(cardOwnershipText);
      contentContainer.appendChild(cardOwnershipTextContainer);
    }
    const decoratorContainer = document.createElement("div");
    decoratorContainer.classList.add("store-launcher__card-decorator", "absolute", "w-full", "h-full");
    const idleOverlay = document.createElement("div");
    idleOverlay.classList.add("border-2", "border-secondary-1", "absolute", "w-full", "h-full");
    decoratorContainer.appendChild(idleOverlay);
    const hoverOverlay = document.createElement("div");
    hoverOverlay.classList.add(
      "img-list-focus-frame_highlight",
      "w-full",
      "h-full",
      "absolute",
      "pointer-events-auto",
      "opacity-0",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100"
    );
    const decoratorTopFiligree = document.createElement("div");
    decoratorTopFiligree.classList.add("filigree-panel-top-special", "relative", "bottom-10", "w-full");
    hoverOverlay.appendChild(decoratorTopFiligree);
    decoratorContainer.appendChild(hoverOverlay);
    storeCardActivatable.appendChild(decoratorContainer);
    storeCardActivatable.appendChild(contentContainer);
    return storeCardActivatable;
  }
  createCards(data) {
    if (data.placement != "2kstore") {
      return;
    }
    if (!data.fullRefresh) {
      return;
    }
    while (this.mainSlot.children.length > 0) {
      this.mainSlot.removeChild(this.mainSlot.children[0]);
    }
    const selectedCardId = this.selectedCard?.getAttribute("data-content-id");
    this.selectedCard = null;
    for (const promo of data.promos) {
      const item = {
        imageUrl: promo.primaryImageUrl,
        contentID: promo.contentID,
        contentTitle: promo.localizedTitle,
        contentPrice: promo.contentPrice,
        contentDescription: promo.localizedContent,
        owned: Online.Promo.shouldPromoDisplayOwnership() ? promo.owned : false
      };
      const card = this.createItemCard(item, this.mainSlot);
      if (selectedCardId === promo.contentID) {
        this.selectedCard = card;
      }
      try {
        const metadata = JSON.parse(promo.metadata);
        const content = metadata.content;
        for (const contentId of content) {
          this.contentToCardLookup.set(contentId, { card, item });
        }
      } catch (ex) {
        console.error("collection-content: Unable to parse promo metadata - ", ex);
      }
    }
    this.updatePendingSelection();
  }
  onEngineInput(inputEvent) {
    if (this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    if (inputEvent.detail.name == "shell-action-1") {
      this.onRedeemButtonActivate();
      return true;
    }
    return false;
  }
  updatePendingSelection() {
    if (this.pendingContentSelection && this.contentToCardLookup.size > 0) {
      const foundCard = this.contentToCardLookup.get(this.pendingContentSelection);
      if (foundCard) {
        this.selectedCard = foundCard.card;
        this.onActivate(foundCard.card, foundCard.item);
      } else {
        console.warn(
          `collection-content: Unable to find matching promo for ${this.pendingContentSelection}, showing full collection screen.`
        );
      }
      this.pendingContentSelection = null;
    }
  }
  onRedeemButtonActivate() {
    ContextManager.push("screen-twok-code-redemption", { singleton: true, createMouseGuard: true });
  }
}
Controls.define("collection-content", {
  createInstance: CollectionContent,
  description: "Store Launcher screen.",
  classNames: ["collection-content", "relative", "flex-auto"],
  styles: [styles],
  attributes: [],
  tabIndex: -1
});

export { CollectionContent };
//# sourceMappingURL=collection-content.js.map
