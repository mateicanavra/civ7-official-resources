import { DialogBoxAction, DialogBoxModel } from './model-dialog-box.js';
export { DialogSource } from './model-dialog-box.js';
import { setDialogManager } from '../framework.js';

class DialogBoxManagerImpl {
  /**
   * Helper function for creating simple boolean choice dialog, where the payload is constructed for you.
   * The Cancel option has no callback
   */
  createDialog_ConfirmCancel(params) {
    const confirmOption = {
      actions: ["accept"],
      label: "LOC_GENERIC_OK",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const cancelCallback = () => {
      if (params.callback) {
        params.callback(DialogBoxAction.Cancel);
      }
    };
    const cancelOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_GENERIC_CANCEL",
      callback: cancelCallback
    };
    const options = [confirmOption, cancelOption];
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose: params.canClose,
      extensions: params.extensions,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating simple confirmation dialog, where the payload is constructed for you.
   */
  createDialog_Confirm(params) {
    const confirmOption = {
      actions: ["accept"],
      label: "LOC_GENERIC_OK",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const options = [confirmOption];
    const canClose = params.canClose != void 0 ? params.canClose : false;
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose,
      extensions: params.extensions,
      displayHourGlass: params.displayHourGlass,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating simple cancel dialog, where the payload is constructed for you.
   */
  createDialog_Cancel(params) {
    const cancelOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_GENERIC_CANCEL",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const options = [cancelOption];
    const canClose = params.canClose != void 0 ? params.canClose : false;
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose,
      extensions: params.extensions,
      displayHourGlass: params.displayHourGlass,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating a multi-option dialog with user-defined payloads for each option.
   */
  createDialog_MultiOption(params) {
    const data = {
      id: params.dialogId,
      title: params.title ?? "",
      body: params.body ?? "",
      canClose: params.canClose ?? false,
      shouldDarken: params.shouldDarken ?? true,
      extensions: void 0,
      displayHourGlass: params.displayHourGlass,
      source: params.dialogSource,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      layout: params.layout
    };
    if (params.extensions) {
      data.extensions = JSON.stringify(params.extensions);
    }
    return DialogBoxModel.showDialogBox(data, params.options).id;
  }
  /**
   * Helper function for creation a custom option dialog with user-defined payloads for each option
   */
  createDialog_CustomOptions(params) {
    const data = {
      title: params.title ?? "",
      body: params.body ?? "",
      canClose: params.canClose ?? false,
      shouldDarken: params.shouldDarken ?? true,
      extensions: void 0,
      displayHourGlass: params.displayHourGlass,
      source: params.dialogSource,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      custom: params.custom ?? false,
      styles: params.styles ?? false,
      name: params.name
    };
    if (params.extensions) {
      data.extensions = JSON.stringify(params.extensions);
    }
    return DialogBoxModel.showDialogBox(data, params.options, params.customOptions).id;
  }
  /**
   * Clear all dialog box in the queue
   */
  clear() {
    DialogBoxModel.clear();
  }
  get isDialogBoxOpen() {
    return DialogBoxModel.isDialogBoxOpen;
  }
  closeDialogBox(dialogBoxID) {
    DialogBoxModel.closeDialogBox(dialogBoxID);
  }
  setSource(source) {
    DialogBoxModel.setSource(source);
  }
}
const DialogBoxManager = new DialogBoxManagerImpl();
setDialogManager(DialogBoxManager);

export { DialogBoxAction, DialogBoxManager, DialogBoxManager as default };
//# sourceMappingURL=manager-dialog-box.js.map
