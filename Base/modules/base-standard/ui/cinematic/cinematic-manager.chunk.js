import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { EndGameScreenCategory } from '../endgame/screen-endgame.js';

var CinematicTypes = /* @__PURE__ */ ((CinematicTypes2) => {
  CinematicTypes2[CinematicTypes2["WONDER_COMPLETE"] = 0] = "WONDER_COMPLETE";
  CinematicTypes2[CinematicTypes2["NATURAL_WONDER_DISCOVERED"] = 1] = "NATURAL_WONDER_DISCOVERED";
  CinematicTypes2[CinematicTypes2["NATURAL_DISASTER"] = 2] = "NATURAL_DISASTER";
  CinematicTypes2[CinematicTypes2["GAME_VICTORY"] = 3] = "GAME_VICTORY";
  return CinematicTypes2;
})(CinematicTypes || {});
const CINEMATIC_SETTINGS = {
  [0 /* WONDER_COMPLETE */]: {
    defaultFog: "WONDER_COMPLETE_CINEMATIC_FOG_SETTINGS",
    defaultCamera: "WONDER_DEFAULT_CAMERA_SETTINGS"
    // omitting '_COMPLETE'
  },
  [1 /* NATURAL_WONDER_DISCOVERED */]: {
    defaultFog: "NATURAL_WONDER_DISCOVERED_CINEMATIC_FOG_SETTINGS",
    defaultCamera: "NATURAL_WONDER_DEFAULT_CAMERA_SETTINGS"
    // omitting '_DISCOVERED'
  },
  [2 /* NATURAL_DISASTER */]: {
    defaultFog: "NATURAL_DISASTER_CINEMATIC_FOG_SETTINGS",
    defaultCamera: "NATURAL_DISASTER_DEFAULT_CAMERA_SETTINGS"
  },
  [3 /* GAME_VICTORY */]: {
    defaultFog: "GAME_VICTORY_CINEMATIC_FOG_SETTINGS",
    defaultCamera: "GAME_VICTORY_DEFAULT_CAMERA_SETTINGS"
  }
};
class CinematicManagerImpl extends DisplayHandlerBase {
  wonderCompletedListener = this.onWonderCompleted.bind(this);
  naturalWonderRevealedListener = this.onNaturalWonderRevealed.bind(this);
  randomEventOccurredListener = this.onRandomEventOccurred.bind(this);
  projectCompletedListener = this.onCityProjectCompleted.bind(this);
  awaitCinematicListener = this.awaitCinematic.bind(this);
  readyListener = this.onReady.bind(this);
  previousMode = null;
  previousModeContext = null;
  movieInProgress = false;
  eventReference = 0;
  currentCinematicData = null;
  CinematicVFXModelGroup = null;
  CinematicScreenVfx3DMarker = null;
  currentCinematic = null;
  isCameraDynamic = false;
  isFogChanged = false;
  musicIndex = -1;
  static FOCUS_HEIGHT = 10;
  static CAMERA_HEIGHT = 30;
  static FALLBACK_DYNAMIC_CAMERA_PARAMS = {
    focusHeight: CinematicManagerImpl.FOCUS_HEIGHT,
    cameraHeight: CinematicManagerImpl.CAMERA_HEIGHT,
    duration: 22,
    easeInFactor: 1.25,
    easeOutFactor: 2
  };
  constructor() {
    super("Cinematic", 7e3);
    engine.whenReady.then(this.readyListener);
    this.CinematicVFXModelGroup = WorldUI.createModelGroup("CinematicVFXModelGroup");
  }
  onReady() {
    if (!Configuration.getGame().isAnyMultiplayer) {
      engine.on("WonderCompleted", this.wonderCompletedListener, this);
      engine.on("NaturalWonderRevealed", this.naturalWonderRevealedListener, this);
      engine.on("RandomEventOccurred", this.randomEventOccurredListener, this);
      engine.on("CityProjectCompleted", this.projectCompletedListener, this);
    }
  }
  getCinematicLocation() {
    if (!this.currentCinematicData) {
      console.error("cinematic-manager: Invalid currentCinematicData!");
      return { x: -1, y: -1 };
    }
    return this.currentCinematicData.plot;
  }
  getCinematicAudio() {
    if (!this.currentCinematicData) {
      console.error("cinematic-manager: Invalid currentCinematicData!");
      return null;
    }
    if (this.currentCinematicData.quoteAudio) {
      return this.currentCinematicData.quoteAudio;
    }
    return null;
  }
  getCinematicDynamicCameraParams() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cameraSettingName) {
        const asset2 = this.currentCinematicData.cameraSettingName + "_CAMERA_SETTINGS";
        const params2 = Camera.findDynamicCameraSettings(asset2);
        if (params2) {
          return params2;
        }
      }
      const asset = CINEMATIC_SETTINGS[this.currentCinematicData.cinematicType].defaultCamera;
      if (asset) {
        const params2 = Camera.findDynamicCameraSettings(asset);
        if (params2) {
          return params2;
        }
      }
    }
    const params = Camera.findDynamicCameraSettings("DEFAULT_CAMERA_SETTINGS");
    return params ? params : CinematicManagerImpl.FALLBACK_DYNAMIC_CAMERA_PARAMS;
  }
  getCinematicHeightFogParams() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cameraSettingName) {
        const asset2 = this.currentCinematicData.cameraSettingName + "_CINEMATIC_FOG_SETTINGS";
        const params = Environment.findFogSettings(asset2);
        if (params) {
          return params;
        }
      }
      const asset = CINEMATIC_SETTINGS[this.currentCinematicData.cinematicType].defaultFog;
      if (asset) {
        const params = Environment.findFogSettings(asset);
        if (params) {
          return params;
        }
      }
    }
    return Environment.findFogSettings("DEFAULT_CINEMATIC_FOG_SETTINGS");
  }
  //Placeholder cinematic triggers for victories
  startEndOfGameCinematic(victoryCinematicType, victoryName, location) {
    let vfxStr = void 0;
    let cameraSetting = victoryName;
    if (victoryCinematicType == "VICTORY_CINEMATIC_TYPE_NUKE") {
      vfxStr = "VFX_Nuke_01";
      cameraSetting = "NUCLEAR_STRIKE_DEFAULT";
      UI.sendAudioEvent("operation-ivy-cinematic-begin");
    }
    const cinematicData = {
      plot: location,
      cinematicType: 3 /* GAME_VICTORY */,
      cameraSettingName: cameraSetting,
      // TODO name for specialized dynamic camera settings
      victoryType: victoryName,
      endGame: true,
      vfxAsset: vfxStr
    };
    this.addDisplayRequest(cinematicData);
  }
  getVictoryCinematicAssetName() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.victoryType) {
        return this.currentCinematicData.victoryType + "_CINEMATIC_ASSET";
      }
    }
    return "";
  }
  getCinematicPlotVFXAssetName() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cameraSettingName) {
        return this.currentCinematicData.cameraSettingName + "_CINEMATIC_PLOT_VFX";
      }
    }
    return this.getFallbackCinematicPlotVFXAssetName();
  }
  getFallbackCinematicPlotVFXAssetName() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cinematicType == 1 /* NATURAL_WONDER_DISCOVERED */) {
        return "NATURAL_WONDER_DEFAULT_CINEMATIC_PLOT_VFX";
      }
    }
    return "DEFAULT_CINEMATIC_PLOT_VFX";
  }
  getCinematicScreenVFXAssetName() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cameraSettingName) {
        return this.currentCinematicData.cameraSettingName + "_CINEMATIC_SCREEN_VFX";
      }
    }
    return this.getFallbackCinematicScreenVFXAssetName();
  }
  getFallbackCinematicScreenVFXAssetName() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.cinematicType == 1 /* NATURAL_WONDER_DISCOVERED */) {
        return "NATURAL_WONDER_DEFAULT_CINEMATIC_SCREEN_VFX";
      }
    }
    return "DEFAULT_CINEMATIC_SCREEN_VFX";
  }
  isMovieInProgress() {
    return this.movieInProgress;
  }
  stop() {
    if (this.currentCinematicData) {
      if (this.currentCinematicData.endGame && !Game.AgeProgressManager.isExtendedGame) {
        DisplayQueueManager.add({ category: EndGameScreenCategory });
      }
      DisplayQueueManager.close(this.currentCinematicData);
    }
  }
  releaseCinematic() {
    if (this.currentCinematic) {
      this.currentCinematic.destroy();
      this.currentCinematic = null;
    }
    this.movieInProgress = false;
    UI.releaseEventID(this.eventReference);
    this.eventReference = 0;
    if (this.isCameraDynamic) {
      this.isCameraDynamic = false;
      Camera.popCamera();
    }
    if (this.isFogChanged) {
      this.isFogChanged = false;
      Environment.popFogOverride();
    }
    if (this.CinematicVFXModelGroup) {
      this.CinematicVFXModelGroup.clear();
    }
    UI.sendAudioEvent("stop-cinematic");
  }
  // NOTE: this relies on all of the placard screens being pushed as singletons.  That way the Context Manager
  // does the right thing when startCinematic() attempts to re-push the screen and no issues occur.
  replayCinematic() {
    if (this.currentCinematic) {
      if (this.isCameraDynamic) {
        this.isCameraDynamic = false;
        Camera.popCamera();
      }
      this.awaitCinematic();
    } else {
      this.startCinematic();
    }
  }
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    this.currentCinematicData = request;
    this.startCinematic();
    this.previousMode = InterfaceMode.getCurrent();
    this.previousModeContext = InterfaceMode.getParameters();
    this.movieInProgress = true;
    InterfaceMode.switchTo("INTERFACEMODE_CINEMATIC");
  }
  isShowing() {
    return InterfaceMode.isInInterfaceMode("INTERFACEMODE_CINEMATIC");
  }
  startCinematic() {
    this.releaseCinematic();
    if (!this.currentCinematicData) {
      console.error("cinematic-manager: invalid cinematic data, this shouldn't happen, skipping!");
      return;
    }
    const curtain = document.getElementById("loading-curtain");
    if (curtain) {
      if (!curtain.classList.contains("curtain-opened")) {
        console.log("cinematic-manager: don't play cinematics with the loading curtain up");
        return;
      }
    }
    const overrideCinematicFogSettings = this.getCinematicHeightFogParams();
    if (overrideCinematicFogSettings != null) {
      Environment.pushFogOverride(overrideCinematicFogSettings);
      this.isFogChanged = true;
    }
    if (this.currentCinematicData.cinematicType == 0 /* WONDER_COMPLETE */) {
      ContextManager.push("screen-wonder-complete-placard", {
        singleton: true,
        createMouseGuard: true,
        attributes: { shouldDarken: false }
      });
      this.currentCinematic = WorldUI.requestCinematic(this.currentCinematicData.plot);
      this.awaitCinematic();
      this.eventReference = UI.referenceCurrentEvent();
    } else if (this.currentCinematicData.cinematicType == 1 /* NATURAL_WONDER_DISCOVERED */) {
      ContextManager.push("screen-natural-wonder-revealed-placard", {
        singleton: true,
        createMouseGuard: true,
        attributes: { shouldDarken: false }
      });
      const plotIndex = GameplayMap.getIndexFromLocation(this.currentCinematicData.plot);
      const featureInfo = MapFeatures.getFeatureInfoAt(plotIndex);
      let plotSet = featureInfo.plots;
      if (featureInfo.plots.length == 0) {
        plotSet = this.currentCinematicData.plot;
      }
      if (this.CinematicVFXModelGroup) {
        this.CinematicVFXModelGroup.clear();
        this.CinematicScreenVfx3DMarker = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
        if (this.CinematicVFXModelGroup && this.CinematicScreenVfx3DMarker) {
          const screenVfxAsset = this.CinematicVFXModelGroup.addModel(
            this.getCinematicScreenVFXAssetName(),
            { marker: this.CinematicScreenVfx3DMarker, offset: { x: 0, y: 30, z: 0 } },
            { angle: 0, scale: 0.25, foreground: true, needsShadows: false }
          );
          if (screenVfxAsset == void 0) {
            this.CinematicVFXModelGroup.addModel(
              this.getFallbackCinematicScreenVFXAssetName(),
              { marker: this.CinematicScreenVfx3DMarker, offset: { x: 0, y: 30, z: 0 } },
              { angle: 0, scale: 0.25, foreground: true, needsShadows: false }
            );
          }
          for (const eachPlot of featureInfo.plots) {
            const plotVfxAsset = this.CinematicVFXModelGroup.addModelAtPlot(
              this.getCinematicPlotVFXAssetName(),
              eachPlot,
              { x: 0, y: 0, z: 0 }
            );
            if (plotVfxAsset == void 0) {
              this.CinematicVFXModelGroup.addModelAtPlot(
                this.getFallbackCinematicPlotVFXAssetName(),
                eachPlot,
                { x: 0, y: 0, z: 0 }
              );
            }
          }
        }
      }
      this.currentCinematic = null;
      Camera.pushDynamicCamera(plotSet, this.getCinematicDynamicCameraParams());
      Camera.lookAtPlot(this.currentCinematicData.plot, { instantaneous: true });
      this.isCameraDynamic = true;
      this.eventReference = UI.referenceCurrentEvent();
      this.musicIndex = Sound.play("Play_NaturalWonder_Music");
    } else if (this.currentCinematicData.cinematicType == 2 /* NATURAL_DISASTER */) {
      ContextManager.push("screen-natural-disaster-placard", {
        singleton: true,
        createMouseGuard: true,
        attributes: { shouldDarken: false }
      });
      this.currentCinematic = null;
      Camera.pushDynamicCamera(this.currentCinematicData.plot, this.getCinematicDynamicCameraParams());
      Camera.lookAtPlot(this.currentCinematicData.plot, { instantaneous: true });
      this.isCameraDynamic = true;
      this.eventReference = UI.referenceCurrentEvent();
    } else if (this.currentCinematicData.cinematicType == 3 /* GAME_VICTORY */) {
      const cameraParams = this.getCinematicDynamicCameraParams();
      ContextManager.push("screen-victory-cinematic", {
        singleton: true,
        createMouseGuard: true,
        attributes: {
          shouldDarken: false,
          victoryType: this.currentCinematicData.victoryType,
          autoCompleteDuration: cameraParams.duration
        }
      });
      this.currentCinematic = WorldUI.requestCinematic(this.currentCinematicData.plot);
      this.awaitCinematic();
      this.eventReference = UI.referenceCurrentEvent();
    }
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(request, _options) {
    this.releaseCinematic();
    if (request.cinematicType == 0 /* WONDER_COMPLETE */) {
      ContextManager.pop("screen-wonder-complete-placard");
    } else if (request.cinematicType == 1 /* NATURAL_WONDER_DISCOVERED */) {
      if (this.musicIndex != -1) {
        Sound.playOnIndex("Stop_NaturalWonder_Music", this.musicIndex);
        this.musicIndex = -1;
      }
      ContextManager.pop("screen-natural-wonder-revealed-placard");
    } else if (request.cinematicType == 2 /* NATURAL_DISASTER */) {
      ContextManager.pop("screen-natural-disaster-placard");
    } else if (request.cinematicType == 3 /* GAME_VICTORY */) {
      ContextManager.pop("screen-victory-cinematic");
      if (request.victoryType == "VICTORY_MODERN_MILITARY") {
        UI.sendAudioEvent("operation-ivy-cinematic-end");
      }
    } else {
      console.warn("cinematic-manager: unhandled cinematicType " + request.cinematicType);
    }
    if (this.currentCinematicData == request) {
      this.currentCinematicData = null;
    }
    if (!this.previousMode || this.previousMode && !InterfaceMode.switchTo(this.previousMode, this.previousModeContext)) {
      InterfaceMode.switchToDefault();
    }
  }
  awaitCinematic() {
    if (this.currentCinematicData == null || this.currentCinematic == null) {
      return;
    }
    if (this.isCameraDynamic) {
      return;
    }
    if (this.currentCinematic.isReady()) {
      this.currentCinematic.start();
      Camera.pushDynamicCamera(this.currentCinematicData.plot, this.getCinematicDynamicCameraParams());
      Camera.lookAtPlot(this.currentCinematicData.plot, { instantaneous: true });
      this.isCameraDynamic = true;
      if (this.currentCinematicData.cinematicType == 0 /* WONDER_COMPLETE */) {
        if (this.CinematicVFXModelGroup) {
          this.CinematicVFXModelGroup.clear();
          this.CinematicVFXModelGroup.addVFXAtPlot("VFX_TEST_Cinematic_Sky", this.currentCinematicData.plot, {
            x: 0,
            y: 0,
            z: 0
          });
        }
      } else if (this.currentCinematicData.cinematicType == 3 /* GAME_VICTORY */) {
        if (this.currentCinematicData.vfxAsset) {
          WorldUI.triggerVFXAtPlot(this.currentCinematicData.vfxAsset, this.currentCinematicData.plot, {
            x: 0,
            y: 0,
            z: 0
          });
        }
        if (this.CinematicVFXModelGroup) {
          this.CinematicVFXModelGroup.clear();
          this.CinematicVFXModelGroup.addModelAtPlot(
            this.getVictoryCinematicAssetName(),
            this.currentCinematicData.plot,
            { x: 0, y: 0, z: 0 },
            { initialState: "REVEAL" }
          );
        }
      }
    } else {
      window.requestAnimationFrame(this.awaitCinematicListener);
    }
  }
  onWonderCompleted(data) {
    if (ContextManager.shouldShowPopup(data.constructible.owner)) {
      const wonder = GameInfo.Wonders.lookup(data.constructibleType);
      const wonderCompletedCinematicData = {
        plot: data.location,
        cinematicType: 0 /* WONDER_COMPLETE */,
        cameraSettingName: wonder ? wonder.ConstructibleType : null,
        quoteAudio: GameInfo.TypeQuotes.lookup(data.constructibleType)?.QuoteAudio
      };
      this.addDisplayRequest(wonderCompletedCinematicData);
    }
  }
  onNaturalWonderRevealed(data) {
    if (!Players.isParticipant(GameContext.localPlayerID)) {
      return;
    }
    if (GameplayMap.getRevealedState(GameContext.localPlayerID, data.location.x, data.location.y) != RevealedStates.VISIBLE) {
      return;
    }
    if (ContextManager.shouldShowPopup(data.player)) {
      const feature = GameInfo.Features.lookup(data.featureType);
      const wonderRevealedCinematicData = {
        plot: data.location,
        cinematicType: 1 /* NATURAL_WONDER_DISCOVERED */,
        cameraSettingName: feature ? feature.FeatureType : null,
        quoteAudio: GameInfo.TypeQuotes.lookup(data.featureType)?.QuoteAudio
      };
      this.addDisplayRequest(wonderRevealedCinematicData);
    }
  }
  onRandomEventOccurred(data) {
    if (ContextManager.shouldShowModalEvent(GameContext.localPlayerID) && GameplayMap.getRevealedState(GameContext.localPlayerID, data.location.x, data.location.y) == RevealedStates.VISIBLE) {
      const randomEvent = GameInfo.RandomEvents.lookup(data.eventType);
      const naturalDisasterCinematicData = {
        plot: data.location,
        cinematicType: 2 /* NATURAL_DISASTER */,
        cameraSettingName: randomEvent ? randomEvent.RandomEventType : null
      };
      const plotIndex = GameplayMap.getIndexFromXY(data.location.x, data.location.y);
      for (let storm = 0; storm < MapStorms.numActiveStorms; storm++) {
        const stormID = MapStorms.getActiveStormIDByIndex(storm);
        if (stormID) {
          const stormInfo = MapStorms.getStorm(stormID);
          if (stormInfo?.startPlot == plotIndex) {
            naturalDisasterCinematicData.plot = GameplayMap.getLocationFromIndex(stormInfo.currentPlot);
            break;
          }
        }
      }
      if (GameContext.localPlayerID != GameplayMap.getOwner(naturalDisasterCinematicData.plot.x, naturalDisasterCinematicData.plot.y)) {
        return;
      }
      this.addDisplayRequest(naturalDisasterCinematicData);
    }
  }
  onCityProjectCompleted(data) {
    const completedProject = GameInfo.Projects.lookup(data.projectType);
    if (completedProject == null) return;
    if (completedProject.ProjectType == "PROJECT_OPERATION_IVY") return;
    if (completedProject.ProjectType == "PROJECT_PRODUCE_WMD") return;
    if (ContextManager.shouldShowModalEvent(GameContext.localPlayerID) && GameplayMap.getRevealedState(GameContext.localPlayerID, data.location.x, data.location.y) == RevealedStates.VISIBLE) {
      WorldUI.triggerCinematic(data.location);
    }
  }
}
const CinematicManager = new CinematicManagerImpl();
DisplayQueueManager.registerHandler(CinematicManager);

export { CinematicManager as C };
//# sourceMappingURL=cinematic-manager.chunk.js.map
