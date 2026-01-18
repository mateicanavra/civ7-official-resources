import { d as displayRequestUniqueId, a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { M as MainMenuReturnEvent } from '../../events/shell-events.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { Q as QueryDoneEventName, R as ResolveConflictDoneEventName, S as SaveLoadData } from '../../save-load/model-save-load.chunk.js';
import { f as fixupNNBSP } from '../../utilities/utilities-core-textprovider.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-modal-frame>\r\n\t<fxs-header\r\n\t\ttitle=\"LOC_LOAD_GAME_ERROR_SYNC\"\r\n\t\tclass=\"font-title text-xl text-center uppercase tracking-100\"\r\n\t\tfiligree-style=\"h2\"\r\n\t></fxs-header>\r\n\t<div\r\n\t\tclass=\"sync-conflict__description font-fit-shrink shrink font-body-base text-accent-2 my-4 self-center text-center\"\r\n\t\tdata-l10n-id=\"LOC_LOAD_GAME_ERROR_SYNC_DESCRIPTION\"\r\n\t></div>\r\n\t<div class=\"pt-2 px-12 relative\">\r\n\t\t<div\r\n\t\t\tclass=\"sync-conflict__loading absolute inset-0 flow-column justify-center items-center transition-opacity opacity-0 pointer-events-none\"\r\n\t\t>\r\n\t\t\t<div class=\"loading-animation-container relative inset-0 flow-row justify-center items-center\"></div>\r\n\t\t</div>\r\n\t\t<fxs-hslot\r\n\t\t\tclass=\"sync-conflict__slot justify-center opacity-0\"\r\n\t\t\tdisable-focus-allowed=\"true\"\r\n\t\t>\r\n\t\t\t<fxs-chooser-item\r\n\t\t\t\tclass=\"sync-conflict__local-button w-84 mx-3 pointer-events-none\"\r\n\t\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\t\tdata-audio-activate=\"mp-landing-internet-selected\"\r\n\t\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"flow-column p-3 w-full\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\ttitle=\"Local\"\r\n\t\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100 font-fit-shrink whitespace-nowrap pointer-events-none\"\r\n\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"flex-auto mx-2 my-6 flow-column justify-between\">\r\n\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\tclass=\"sync-conflict__local__title uppercase text-center font-title-lg text-accent-2 flex flex-shrink pointer-events-none\"\r\n\t\t\t\t\t\t\ttext-class=\"max-h-18\"\r\n\t\t\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t\t\t\ttruncate=\"true\"\r\n\t\t\t\t\t\t\ttitle=\"Testsupersavetitle\"\r\n\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t<div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__local__age font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"Exploration\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__local__turn font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"Turn 32 - 750AD\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__local__date font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"11/29/2025\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__local__time font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"9:25 PM\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<fxs-button\r\n\t\t\t\t\t\tclass=\"sync-conflict__local-button-2 my-1 mx-2\"\r\n\t\t\t\t\t\tcaption=\"Keep\"\r\n\t\t\t\t\t></fxs-button>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-chooser-item>\r\n\t\t\t<fxs-chooser-item\r\n\t\t\t\tclass=\"sync-conflict__icloud-button w-84 mx-3\"\r\n\t\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\t\tdata-audio-activate=\"mp-landing-lan-selected\"\r\n\t\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"flow-column p-3 w-full\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\ttitle=\"ICloud\"\r\n\t\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100 font-fit-shrink whitespace-nowrap pointer-events-none\"\r\n\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"flex-auto mx-2 my-6 flow-column justify-between\">\r\n\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\tclass=\"sync-conflict__icloud__title uppercase text-center font-title-lg text-accent-2 flex flex-shrink pointer-events-none\"\r\n\t\t\t\t\t\t\ttext-class=\"max-h-18\"\r\n\t\t\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t\t\t\ttruncate=\"true\"\r\n\t\t\t\t\t\t\ttitle=\"Testsupersavetitle\"\r\n\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t<div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__icloud__age font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"Exploration\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__icloud__turn font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"Turn 32 - 750AD\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__icloud__date font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"11/29/2025\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"sync-conflict__icloud__time font-body text-accent-2 text-center font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"9:25 PM\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<fxs-button\r\n\t\t\t\t\t\tclass=\"sync-conflict__icloud-button-2 my-1 mx-2\"\r\n\t\t\t\t\t\tcaption=\"Keep\"\r\n\t\t\t\t\t></fxs-button>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-chooser-item>\r\n\t\t</fxs-hslot>\r\n\t</div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/core/ui/shell/sync-conflict/sync-conflict.css";

var PanelOperation = /* @__PURE__ */ ((PanelOperation2) => {
  PanelOperation2[PanelOperation2["None"] = 0] = "None";
  PanelOperation2[PanelOperation2["Query"] = 1] = "Query";
  PanelOperation2[PanelOperation2["Resolving"] = 2] = "Resolving";
  return PanelOperation2;
})(PanelOperation || {});
const SYNC_QUERY_ERROR_ID = displayRequestUniqueId();
const SYNC_RESOLVE_ERROR_ID = displayRequestUniqueId();
const TriggerQuerySavesEventName = "trigger-query-saves";
class TriggerQuerySavesEvent extends CustomEvent {
  constructor() {
    super(TriggerQuerySavesEventName, { bubbles: true, cancelable: false });
  }
}
class PanelSyncConflict extends Panel {
  SAVE_CONFLICT_FILE_NAME = Network.getSaveConflictFileName();
  PANEL_OPERATION_TIMEOUT_MS = 1e4;
  panelOperationTimeout = 0;
  localButton;
  localButton2;
  localTitle;
  localAge;
  localTurn;
  localDate;
  localTime;
  icloudButton;
  icloudButton2;
  icloudTitle;
  icloudAge;
  icloudTurn;
  icloudDate;
  icloudTime;
  slotDiv;
  loadingContainer;
  loadingAnimationContainer;
  localSave;
  icloudSave;
  fileName = "";
  saveType = SaveTypes.SINGLE_PLAYER;
  serverType = ServerType.SERVER_TYPE_NONE;
  isSaving = false;
  currentPanelOperation = 0 /* None */;
  localButtonListener = this.onLocal.bind(this);
  localButtonFocusListener = this.onLocalButtonFocus.bind(this);
  localButtonBlurListener = this.onLocalButtonBlur.bind(this);
  icloudButtonListener = this.onIcloud.bind(this);
  icloudButtonFocusListener = this.onIcouldButtonFocus.bind(this);
  icloudButtonBlurListener = this.onIcouldButtonBlur.bind(this);
  queryDoneListener = this.onQueryDone.bind(this);
  resolveConflictDoneListener = this.onresolveConflictDone.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    this.localButton = MustGetElement(".sync-conflict__local-button", this.Root);
    this.localButton2 = MustGetElement(".sync-conflict__local-button-2", this.Root);
    this.localTitle = MustGetElement(".sync-conflict__local__title", this.Root);
    this.localAge = MustGetElement(".sync-conflict__local__age", this.Root);
    this.localTurn = MustGetElement(".sync-conflict__local__turn", this.Root);
    this.localDate = MustGetElement(".sync-conflict__local__date", this.Root);
    this.localTime = MustGetElement(".sync-conflict__local__time", this.Root);
    this.icloudButton = MustGetElement(".sync-conflict__icloud-button", this.Root);
    this.icloudButton2 = MustGetElement(".sync-conflict__icloud-button-2", this.Root);
    this.icloudTitle = MustGetElement(".sync-conflict__icloud__title", this.Root);
    this.icloudAge = MustGetElement(".sync-conflict__icloud__age", this.Root);
    this.icloudTurn = MustGetElement(".sync-conflict__icloud__turn", this.Root);
    this.icloudDate = MustGetElement(".sync-conflict__icloud__date", this.Root);
    this.icloudTime = MustGetElement(".sync-conflict__icloud__time", this.Root);
    this.slotDiv = MustGetElement(".sync-conflict__slot", this.Root);
    this.loadingAnimationContainer = MustGetElement(".loading-animation-container", this.Root);
    this.loadingContainer = MustGetElement(".sync-conflict__loading", this.Root);
    this.showLoadingAnimation();
  }
  onAttach() {
    super.onAttach();
    this.Root.listenForWindowEvent(QueryDoneEventName, this.queryDoneListener);
    this.Root.listenForWindowEvent(ResolveConflictDoneEventName, this.resolveConflictDoneListener);
    this.localButton.addEventListener("action-activate", this.localButtonListener);
    this.localButton.addEventListener("focusin", this.localButtonFocusListener);
    this.localButton.addEventListener("focusout", this.localButtonBlurListener);
    this.localButton2.addEventListener("action-activate", this.localButtonListener);
    this.icloudButton.addEventListener("action-activate", this.icloudButtonListener);
    this.icloudButton.addEventListener("focusin", this.icloudButtonFocusListener);
    this.icloudButton.addEventListener("focusout", this.icloudButtonBlurListener);
    this.icloudButton2.addEventListener("action-activate", this.icloudButtonListener);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    FocusManager.setFocus(this.slotDiv);
  }
  onClose() {
    this.close();
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "file-name":
        this.fileName = newValue ?? "";
        this.startQuery();
        break;
      case "save-type":
        this.saveType = Number.parseInt(newValue ?? "0");
        break;
      case "server-type":
        this.serverType = Number.parseInt(newValue ?? "0");
        break;
      case "is-saving":
        this.isSaving = newValue == "true";
        break;
    }
  }
  startOperation(operation) {
    if (![0 /* None */, 1 /* Query */].includes(this.currentPanelOperation)) {
      return false;
    }
    this.currentPanelOperation = operation;
    this.updateControls();
    return true;
  }
  startQuery() {
    if (!this.startOperation(1 /* Query */)) {
      return;
    }
    SaveLoadData.querySaveGameList(
      SaveLocations.LOCAL_STORAGE,
      this.saveType,
      SaveLocationCategories.NORMAL | SaveLocationCategories.QUICKSAVE | SaveLocationCategories.AUTOSAVE,
      SaveFileTypes.GAME_STATE,
      { isOverwriteQueryIds: true }
    );
    this.panelOperationTimeout = setTimeout(() => {
      this.triggerQueryErrorDialog();
    }, this.PANEL_OPERATION_TIMEOUT_MS);
  }
  triggerQueryErrorDialog() {
    this.close();
    DialogBoxManager.createDialog_Confirm({
      body: "LOC_LOAD_GAME_ERROR_SYNC_DESCRIPTION_QUERY_ERROR",
      title: "LOC_LOAD_GAME_ERROR_SYNC",
      callback: () => this.close(),
      shouldDarken: true,
      dialogId: SYNC_QUERY_ERROR_ID
    });
  }
  triggerResolveErrorDialog() {
    this.close();
    DialogBoxManager.createDialog_Confirm({
      body: "LOC_LOAD_GAME_ERROR_SYNC_DESCRIPTION_RESOLVE_ERROR",
      title: "LOC_LOAD_GAME_ERROR_SYNC",
      callback: () => this.close(),
      shouldDarken: true,
      dialogId: SYNC_RESOLVE_ERROR_ID
    });
  }
  updateControls() {
    this.updateSlotDiv();
    this.updateLoadingContainer();
    this.updateLocalButton();
    this.updateLocal2Button();
    this.updateIcloudButton();
    this.updateIcloud2Button();
  }
  resetPanelOperation() {
    clearTimeout(this.panelOperationTimeout);
    this.currentPanelOperation = 0 /* None */;
    this.updateControls();
  }
  onQueryDone(_event) {
    this.resetPanelOperation();
    this.localSave = SaveLoadData.saves.find(({ fileName }) => fileName == this.fileName);
    this.icloudSave = SaveLoadData.saves.find(({ fileName }) => fileName == this.SAVE_CONFLICT_FILE_NAME);
    if (!this.localSave || !this.icloudSave) {
      this.triggerQueryErrorDialog();
    }
    this.updateLocalTitle();
    this.updateIcloudTitle();
  }
  onresolveConflictDone({ detail: { data } }) {
    this.close();
    if (data == SerializerResult.RESULT_FAILED_TO_RESOLVE_CONFLICT) {
      this.triggerResolveErrorDialog();
    }
    if (this.isSaving) {
      window.dispatchEvent(new TriggerQuerySavesEvent());
    } else if (this.localSave) {
      SaveLoadData.handleLoadSave(this.localSave, this.serverType);
    }
    this.resetPanelOperation();
  }
  onIcloud() {
    if (!this.startOperation(2 /* Resolving */)) {
      return;
    }
    const {
      location: Location,
      locationCategories: LocationCategories,
      type: Type,
      contentType: ContentType,
      fileName: FileName
    } = this.localSave ?? {};
    Network.resolveConflict({
      Location,
      LocationCategories,
      Type,
      ContentType,
      FileName,
      ResolveConflictMode: ResolveConflictMode.CLOUD
    });
  }
  onLocal() {
    if (!this.startOperation(2 /* Resolving */)) {
      return;
    }
    const {
      location: Location,
      locationCategories: LocationCategories,
      type: Type,
      contentType: ContentType,
      fileName: FileName
    } = this.localSave ?? {};
    Network.resolveConflict({
      Location,
      LocationCategories,
      Type,
      ContentType,
      FileName,
      ResolveConflictMode: ResolveConflictMode.LOCAL
    });
  }
  onLocalButtonFocus() {
    this.localButton2.setAttribute("action-key", "inline-accept");
  }
  onLocalButtonBlur() {
    this.localButton2.removeAttribute("action-key");
  }
  onIcouldButtonFocus() {
    this.icloudButton2.setAttribute("action-key", "inline-accept");
  }
  onIcouldButtonBlur() {
    this.icloudButton2.removeAttribute("action-key");
  }
  updateLocalTitle() {
    this.localTitle.setAttribute("title", this.localSave?.gameName ?? "");
    this.localAge.setAttribute("data-l10n-id", Locale.unpack(this.localSave?.hostAgeName ?? ""));
    this.localTurn.setAttribute(
      "data-l10n-id",
      `${Locale.compose("LOC_SAVE_LOAD_TURN", this.localSave?.currentTurn ?? "")} - ${this.localSave?.currentTurnDate}`
    );
    this.localDate.setAttribute("data-l10n-id", this.localSave?.saveTimeDayName ?? "");
    this.localTime.setAttribute("data-l10n-id", this.localSave?.saveTimeHourName ?? "");
  }
  updateIcloudTitle() {
    this.icloudTitle.setAttribute("title", this.localSave?.gameName ?? "");
    this.icloudAge.setAttribute("data-l10n-id", Locale.unpack(this.icloudSave?.hostAgeName ?? ""));
    this.icloudTurn.setAttribute(
      "data-l10n-id",
      `${Locale.compose("LOC_SAVE_LOAD_TURN", this.icloudSave?.currentTurn ?? "")} - ${this.icloudSave?.currentTurnDate}`
    );
    this.icloudDate.setAttribute("data-l10n-id", this.icloudSave?.saveTimeDayName ?? "");
    this.icloudTime.setAttribute("data-l10n-id", fixupNNBSP(this.icloudSave?.saveTimeHourName ?? ""));
  }
  updateLocalButton() {
    this.localButton.setAttribute(
      "disabled",
      [2 /* Resolving */, 1 /* Query */].includes(this.currentPanelOperation) ? "true" : "false"
    );
  }
  updateLocal2Button() {
    this.localButton2.setAttribute(
      "disabled",
      [2 /* Resolving */, 1 /* Query */].includes(this.currentPanelOperation) ? "true" : "false"
    );
  }
  updateIcloudButton() {
    this.icloudButton.setAttribute(
      "disabled",
      [2 /* Resolving */, 1 /* Query */].includes(this.currentPanelOperation) ? "true" : "false"
    );
  }
  updateIcloud2Button() {
    this.icloudButton2.setAttribute(
      "disabled",
      [2 /* Resolving */, 1 /* Query */].includes(this.currentPanelOperation) ? "true" : "false"
    );
  }
  updateSlotDiv() {
    this.slotDiv?.classList.toggle(
      "opacity-100",
      [0 /* None */, 2 /* Resolving */].includes(this.currentPanelOperation)
    );
    this.slotDiv?.classList.toggle("opacity-0", [1 /* Query */].includes(this.currentPanelOperation));
  }
  updateLoadingContainer() {
    this.loadingContainer?.classList.toggle(
      "opacity-100",
      [1 /* Query */].includes(this.currentPanelOperation)
    );
    this.loadingContainer?.classList.toggle(
      "opacity-0",
      [0 /* None */, 2 /* Resolving */].includes(this.currentPanelOperation)
    );
  }
  showLoadingAnimation() {
    const flipbook = document.createElement("fxs-flipbook");
    const atlas = [
      {
        src: "fs://game/hourglasses01.png",
        spriteWidth: 128,
        spriteHeight: 128,
        size: 512
      },
      {
        src: "fs://game/hourglasses02.png",
        spriteWidth: 128,
        spriteHeight: 128,
        size: 512
      },
      {
        src: "fs://game/hourglasses03.png",
        spriteWidth: 128,
        spriteHeight: 128,
        size: 1024,
        nFrames: 13
      }
    ];
    const flipbookDefinition = {
      fps: 30,
      preload: true,
      atlas
    };
    flipbook.setAttribute("data-flipbook-definition", JSON.stringify(flipbookDefinition));
    this.loadingAnimationContainer.appendChild(flipbook);
  }
}
Controls.define("sync-conflict", {
  createInstance: PanelSyncConflict,
  description: "Save sync conflict resolution screen for gamecenter",
  classNames: ["sync-conflict", "fullscreen", "justify-center", "items-center", "flex"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "file-name",
      description: "file name of the save in conflict"
    },
    {
      name: "save-type"
    },
    {
      name: "server-type"
    },
    {
      name: "is-saving"
    }
  ]
});

export { TriggerQuerySavesEvent, TriggerQuerySavesEventName };
//# sourceMappingURL=sync-conflict.js.map
