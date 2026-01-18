import ContextManager from '../../../core/ui/context-manager/context-manager.js';

var PolicyTabPlacement = /* @__PURE__ */ ((PolicyTabPlacement2) => {
  PolicyTabPlacement2[PolicyTabPlacement2["NONE"] = 0] = "NONE";
  PolicyTabPlacement2[PolicyTabPlacement2["OVERVIEW"] = 1] = "OVERVIEW";
  PolicyTabPlacement2[PolicyTabPlacement2["POLICIES"] = 2] = "POLICIES";
  PolicyTabPlacement2[PolicyTabPlacement2["CRISIS"] = 3] = "CRISIS";
  return PolicyTabPlacement2;
})(PolicyTabPlacement || {});
class PoliciesModel {
  _myGovernment = null;
  _activePolicies = [];
  _availablePolicies = [];
  _activeNormalPolicies = [];
  _availableNormalPolicies = [];
  _activeCrisisPolicies = [];
  _availableCrisisPolicies = [];
  _numSlots = 0;
  _numNormalSlots = 0;
  _numCrisisSlots = 0;
  _activeTab = 0 /* NONE */;
  onUpdate;
  policyHotkeyListener = this.onPolicyHotkey.bind(this);
  get activePolicies() {
    return this._activePolicies ?? [];
  }
  get availablePolicies() {
    return this._availablePolicies ?? [];
  }
  get activeNormalPolicies() {
    return this._activeNormalPolicies ?? [];
  }
  get availableNormalPolicies() {
    return this._availableNormalPolicies ?? [];
  }
  get activeCrisisPolicies() {
    return this._activeCrisisPolicies ?? [];
  }
  get availableCrisisPolicies() {
    return this._availableCrisisPolicies ?? [];
  }
  get myGovernment() {
    return this._myGovernment;
  }
  get numSlots() {
    return this._numSlots;
  }
  get numNormalSlots() {
    return this._numNormalSlots;
  }
  get numCrisisSlots() {
    return this._numCrisisSlots;
  }
  get activeTab() {
    return this._activeTab;
  }
  set activeTab(activeTab) {
    this._activeTab = activeTab;
  }
  constructor() {
    window.addEventListener("hotkey-open-traditions", this.policyHotkeyListener);
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  update() {
    this._activePolicies = [];
    this._availablePolicies = [];
    this._activeNormalPolicies = [];
    this._availableNormalPolicies = [];
    this._activeCrisisPolicies = [];
    this._availableCrisisPolicies = [];
    this._myGovernment = null;
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      return;
    }
    const localPlayerCulture = localPlayer.Culture;
    if (!localPlayerCulture) {
      console.error("model-policies: Local player culture is null!");
      return;
    }
    const localPlayerGovernmentType = localPlayerCulture.getGovernmentType();
    const localPlayerGovernment = GameInfo.Governments.lookup(localPlayerGovernmentType);
    if (localPlayerGovernment) {
      this._myGovernment = localPlayerGovernment;
    }
    const unlockedPolicies = localPlayerCulture.getUnlockedTraditions();
    for (const policyTypeHash of unlockedPolicies) {
      const policyInfo = GameInfo.Traditions.lookup(policyTypeHash);
      if (policyInfo && !localPlayerCulture.isTraditionActive(policyTypeHash)) {
        if (policyInfo.IsCrisis) {
          this._availableCrisisPolicies.push(policyInfo);
        } else {
          this._availableNormalPolicies.push(policyInfo);
        }
        this._availablePolicies.push(policyInfo);
      }
    }
    const activePolicies = localPlayerCulture.getActiveTraditions();
    for (const policy of activePolicies) {
      const policyDef = GameInfo.Traditions.lookup(policy);
      if (policyDef) {
        this._activePolicies.push(policyDef);
        if (policyDef.IsCrisis) {
          this._activeCrisisPolicies.push(policyDef);
        } else {
          this._activeNormalPolicies.push(policyDef);
        }
      }
    }
    this._numSlots = localPlayerCulture.numTraditionSlots;
    this._numNormalSlots = localPlayerCulture.numNormalTraditionSlots;
    this._numCrisisSlots = localPlayerCulture.numCrisisTraditionSlots;
    this.onUpdate?.(this);
  }
  onPolicyHotkey() {
    if (ContextManager.isCurrentClass("screen-policies")) {
      ContextManager.pop("screen-policies");
    } else {
      ContextManager.push("screen-policies", { singleton: true, createMouseGuard: true });
    }
  }
}
const PoliciesData = new PoliciesModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(PoliciesData);
  };
  engine.createJSModel("g_Policies", PoliciesData);
  PoliciesData.updateCallback = updateModel;
});

export { PolicyTabPlacement as P, PoliciesData as a };
//# sourceMappingURL=model-policies.chunk.js.map
