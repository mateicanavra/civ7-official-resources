import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import LegendsManager from '../legends-manager/legends-manager.js';

class LegendsReportModel {
  legendsData = null;
  _showRewards = false;
  onUpdate;
  constructor() {
    this.updateGate.call("LegendsReportModel:constructor");
  }
  get showRewards() {
    return this._showRewards;
  }
  set showRewards(shouldShowRewards) {
    this._showRewards = shouldShowRewards;
    this.updateGate.call("LegendsReportModel:set showRewards");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    this.legendsData = LegendsManager.getData();
    this.onUpdate?.(this);
  });
}
const LegendsReport = new LegendsReportModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(LegendsReport);
  };
  engine.createJSModel("g_LegendsReportModel", LegendsReport);
  LegendsReport.updateCallback = updateModel;
});

export { LegendsReport as default };
//# sourceMappingURL=model-legends-report.js.map
