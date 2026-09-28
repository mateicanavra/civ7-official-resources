let contextManager = null;
let dialogManager = null;
const Framework = {
  get ContextManager() {
    throw new Error("ContextManager must be set prior to using.");
  },
  get DialogManager() {
    throw new Error("DialogManager must be set prior to using.");
  }
};
function setContextManager(value) {
  contextManager = value;
  Object.defineProperty(Framework, "ContextManager", {
    get: () => contextManager
  });
}
function setDialogManager(value) {
  dialogManager = value;
  Object.defineProperty(Framework, "DialogManager", {
    get: () => dialogManager
  });
}

export { Framework, setContextManager, setDialogManager };
//# sourceMappingURL=framework.js.map
