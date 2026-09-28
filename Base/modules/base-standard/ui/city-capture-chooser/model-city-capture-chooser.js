import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';

var DirectiveTypes = /* @__PURE__ */ ((DirectiveTypes2) => {
  DirectiveTypes2[DirectiveTypes2["LIBERATE_FOUNDER"] = 0] = "LIBERATE_FOUNDER";
  DirectiveTypes2[DirectiveTypes2["LIBERATE_PREVIOUS_OWNER"] = 1] = "LIBERATE_PREVIOUS_OWNER";
  DirectiveTypes2[DirectiveTypes2["KEEP"] = 2] = "KEEP";
  DirectiveTypes2[DirectiveTypes2["RAZE"] = 3] = "RAZE";
  return DirectiveTypes2;
})(DirectiveTypes || {});
class CityCaptureChooserModel {
  _cityID = null;
  _OnUpdate;
  _isJustConqueredFrom = false;
  _isBeingRazed = false;
  _numWonders = 0;
  constructor() {
    engine.whenReady.then(() => {
      engine.on("CitySelectionChanged", () => {
        const localPlayer = GameContext.localPlayerID;
        let selectedCityID = UI.Player.getHeadSelectedCity();
        if (selectedCityID) {
          const c = Cities.get(selectedCityID);
          if (!c || c.owner != localPlayer) {
            selectedCityID = null;
          } else if (c) {
            this._isJustConqueredFrom = c.isJustConqueredFrom;
            this._isBeingRazed = c.isBeingRazed;
            if (c.Constructibles) {
              this._numWonders = c.Constructibles.getNumWonders();
            }
          }
        }
        this.cityID = selectedCityID;
      });
      this.updateGate.call("init");
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    const player = Players.get(GameContext.localPlayerID);
    const cityID = this.cityID;
    if (player && cityID && !ComponentID.isInvalid(cityID)) {
      const city = Cities.get(cityID);
      if (!city) {
        console.error("model-city-capture: updateGate - no city found for cityID " + cityID);
        return;
      }
      this._isJustConqueredFrom = city.isJustConqueredFrom;
      this._isBeingRazed = city.isBeingRazed;
      if (!city.Constructibles) {
        console.error("model-city-capture: updateGate - no city constructibles found for cityID " + cityID);
        return;
      }
      this._numWonders = city.Constructibles.getNumWonders();
    }
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  });
  set cityID(id) {
    this._cityID = id;
    if (id != null) {
      this.updateGate.call("cityID");
    }
  }
  get cityID() {
    return this._cityID;
  }
  get canDisplayPanel() {
    return this._isJustConqueredFrom;
  }
  get isBeingRazed() {
    return this._isBeingRazed;
  }
  get isNotBeingRazed() {
    return !this._isBeingRazed;
  }
  get containsWonder() {
    return this._numWonders > 0;
  }
  get numWonders() {
    return this._numWonders;
  }
  sendLiberateFounderRequest() {
    this.sendChoiceRequest(0 /* LIBERATE_FOUNDER */);
  }
  sendKeepRequest() {
    this.sendChoiceRequest(2 /* KEEP */);
  }
  sendRazeRequest() {
    this.sendChoiceRequest(3 /* RAZE */);
  }
  sendChoiceRequest(choice) {
    const args = { Directive: choice };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      if (result.Success) {
        Game.CityCommands.sendRequest(this._cityID, CityCommandTypes.DESTROY, args);
      } else {
        console.error("model-city-capture: sendChoiceRequest() - failed to start DESTROY operation");
      }
    }
  }
  getKeepCanStartResult() {
    const args = { Directive: 2 /* KEEP */ };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      return result;
    }
    return void 0;
  }
  getRazeCanStartResult() {
    const args = { Directive: 3 /* RAZE */ };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      return result;
    }
    return void 0;
  }
}
const CityCaptureChooser = new CityCaptureChooserModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(CityCaptureChooser);
  };
  engine.createJSModel("g_CityCaptureChooser", CityCaptureChooser);
  CityCaptureChooser.updateCallback = updateModel;
});

export { CityCaptureChooser as default };
//# sourceMappingURL=model-city-capture-chooser.js.map
