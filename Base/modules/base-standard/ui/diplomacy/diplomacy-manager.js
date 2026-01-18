import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase, D as DialogBoxAction, a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayHideReason, DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { RaiseDiplomacyEventName } from './diplomacy-events.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import WorldInput from '../world-input/world-input.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

const DEBUG_LOG_TRIGGER = false;
class LeaderSequenceGate {
  waitingForForegroundCameraId = 0;
  waitingForLeftAnimation = false;
  waitingForRightAnimation = false;
  voQueued = false;
  // Signal that one of the animations had VO (maybe allow for knowing which one, though there is usually no overlap)
  clear() {
    this.waitingForForegroundCameraId = 0;
    this.waitingForLeftAnimation = false;
    this.waitingForRightAnimation = false;
    this.voQueued = false;
  }
  setWaitForJustLeft() {
    this.waitingForLeftAnimation = true;
    this.waitingForRightAnimation = false;
    this.voQueued = false;
  }
  setWaitForJustRight() {
    this.waitingForLeftAnimation = false;
    this.waitingForRightAnimation = true;
    this.voQueued = false;
  }
  setWaitForLeftAndRight() {
    this.waitingForLeftAnimation = true;
    this.waitingForRightAnimation = true;
    this.voQueued = false;
  }
  setVOQueued() {
    this.voQueued = true;
  }
  isWaiting() {
    return this.waitingForForegroundCameraId != 0 || this.waitingForLeftAnimation || this.waitingForRightAnimation;
  }
}
var ModelPositionScreenType = /* @__PURE__ */ ((ModelPositionScreenType2) => {
  ModelPositionScreenType2[ModelPositionScreenType2["Regular"] = 0] = "Regular";
  ModelPositionScreenType2[ModelPositionScreenType2["SmallAspectRatio"] = 1] = "SmallAspectRatio";
  ModelPositionScreenType2[ModelPositionScreenType2["SmallMobileScreen"] = 2] = "SmallMobileScreen";
  return ModelPositionScreenType2;
})(ModelPositionScreenType || {});
var ModelPositionObjectType = /* @__PURE__ */ ((ModelPositionObjectType2) => {
  ModelPositionObjectType2[ModelPositionObjectType2["LeftModel"] = 0] = "LeftModel";
  ModelPositionObjectType2[ModelPositionObjectType2["LeftBanner"] = 1] = "LeftBanner";
  ModelPositionObjectType2[ModelPositionObjectType2["RightModel"] = 2] = "RightModel";
  ModelPositionObjectType2[ModelPositionObjectType2["RightBanner"] = 3] = "RightBanner";
  ModelPositionObjectType2[ModelPositionObjectType2["RightModelAtWar"] = 4] = "RightModelAtWar";
  return ModelPositionObjectType2;
})(ModelPositionObjectType || {});
class LeaderModelManagerClass {
  static instance = null;
  leaderModelGroup;
  closeStartTime = 0;
  sequenceStartTime = 0;
  leftAnimationStartTime = 0;
  rightAnimationStartTime = 0;
  SEQUENCE_DEBOUNCE_DURATION = 100;
  // 0.1 seconds
  isClosing = false;
  fallbackCloseStartTime = 0;
  isClosingFallback = false;
  isLeaderShowing = false;
  worldCamera = null;
  leaderCameraOffset = { x: 0, y: 0, z: 0 };
  cameraDollyRequestStartTime = 0;
  cameraDollyQueued = false;
  FIRST_MEET_DELAY = 0.3;
  // This is the delay in seconds before we slide the leaders into view
  cameraDollyDelayed = false;
  cameraAnimationDelayDuration = 0;
  leader3DModelLeft = null;
  leader3DBannerLeft = null;
  leader3DModelRight = null;
  leader3DBannerRight = null;
  leader3DMarkerLeft = null;
  leader3DMarkerRight = null;
  leader3DRevealFlagMarker = null;
  leader3DMarkerCenter = null;
  leftAnimState = "";
  rightAnimState = "";
  declareWarCameraActive = false;
  isRightHostile = false;
  // Record previous animation state for the diplomacy action panel to delay calling the next step animation 
  previousAnimID = null;
  previousAnimHash = null;
  // SL: for animation deadzone locks
  inTransitionDeadZone = false;
  animationPaused = false;
  // These flags are used when an animation is started so that we know to ignore that animation change trigger
  leaderLeftAnimationJustStarted = false;
  leaderRightAnimationJustStarted = false;
  static OFF_CAMERA_DISTANCE = 130;
  // In World units
  static CAMERA_SUBJECT_DISTANCE = 255;
  static CAMERA_DOLLY_ANIMATION_IN_DURATION = 1;
  static CAMERA_DOLLY_ANIMATION_OUT_DURATION = 0.55;
  static DECLARE_WAR_DOLLY_DISTANCE = 20;
  LEADER_EXIT_DURATION = LeaderModelManagerClass.CAMERA_DOLLY_ANIMATION_OUT_DURATION;
  // 0.6 seconds
  static DARKENING_VFX_POSITION = { x: 0, y: 110, z: 0 };
  static LEFT_MODEL_POSITION = { x: -11.5, y: 72, z: -13 };
  static LEFT_BANNER_POSITION = { x: -16, y: 85, z: 0 };
  static LEFT_BANNER_ANGLE = 45;
  static RIGHT_MODEL_POSITION = { x: 11.5, y: 72, z: -13 };
  static RIGHT_INDEPENDENT_MODEL_POSITION = { x: 7.7, y: 71.9, z: -23 };
  static RIGHT_INDEPENDENT_MODEL_SCALE = 0.7;
  static RIGHT_INDEPENDENT_MODEL_ANGLE = -32;
  static RIGHT_INDEPENDENT_BANNER_POSITION = { x: 15, y: 78, z: -15.5 };
  static RIGHT_INDEPENDENT_VIGNETTE_OFFSET = { x: 0, y: -4.25, z: -25 };
  static RIGHT_INDEPENDENT_CAMERA_OFFSET = { x: 0, y: 0, z: -30 };
  static RIGHT_MODEL_AT_WAR_POSITION = { x: 16.5, y: 72, z: -13 };
  static RIGHT_BANNER_POSITION = { x: 16, y: 85, z: 0 };
  static RIGHT_BANNER_ANGLE = -45;
  static BANNER_SCALE = 1.8;
  MAX_LENGTH_OF_ANIMATION_EXIT = 550;
  // 0.6 seconds
  static FOREGROUND_CAMERA_IN_ID = Database.makeHash("leader-camera-in");
  static FOREGROUND_CAMERA_OUT_ID = Database.makeHash("leader-camera-out");
  static SCREEN_DARKENING_ASSET_NAME = "VFX_Diplomacy_Screen_Darkening";
  static TRIGGER_HASH_ANIMATION_STATE_END = WorldUI.hash("AnimationStateChange");
  static TRIGGER_HASH_SEQUENCE_TRIGGER = WorldUI.hash("SEQUENCE");
  // SL: determine break point of an animation no-transition period. Has to be hard-coded in leader animation file's action trigger.
  static TRIGGER_NO_TRANSITION_START = WorldUI.hash("NO_TRANSITION_START");
  static TRIGGER_NO_TRANSITION_END = WorldUI.hash("NO_TRANSITION_END");
  static LEFT_MODEL_POSITION_SMALL_ASPECT_RATIO = { x: -9.5, y: 72, z: -13 };
  static LEFT_BANNER_POSITION_SMALL_ASPECT_RATIO = { x: -13, y: 85, z: 0 };
  static RIGHT_MODEL_POSITION_SMALL_ASPECT_RATIO = { x: 9.5, y: 72, z: -13 };
  static RIGHT_BANNER_POSITION_SMALL_ASPECT_RATIO = { x: 13, y: 85, z: 0 };
  static RIGHT_MODEL_AT_WAR_POSITION_SMALL_ASPECT_RATIO = { x: 14.5, y: 72, z: -13 };
  static LEFT_MODEL_POSITION_SMALL_SCREEN_MOBILE = { x: -14, y: 72, z: -13 };
  static LEFT_BANNER_POSITION_SMALL_SCREEN_MOBILE = { x: -18, y: 85, z: 0 };
  static RIGHT_MODEL_POSITION_SMALL_SCREEN_MOBILE = { x: 14, y: 72, z: -13 };
  static RIGHT_BANNER_POSITION_SMALL_SCREEN_MOBILE = { x: 18, y: 85, z: 0 };
  static RIGHT_MODEL_AT_WAR_POSITION_SMALL_SCREEN_MOBILE = { x: 19, y: 72, z: -13 };
  static POSITIONS = {
    [0 /* Regular */]: {
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION,
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION,
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION,
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION,
      [4 /* RightModelAtWar */]: LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION
    },
    [1 /* SmallAspectRatio */]: {
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION_SMALL_ASPECT_RATIO,
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION_SMALL_ASPECT_RATIO,
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION_SMALL_ASPECT_RATIO,
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION_SMALL_ASPECT_RATIO,
      [4 /* RightModelAtWar */]: LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION_SMALL_ASPECT_RATIO
    },
    [2 /* SmallMobileScreen */]: {
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION_SMALL_SCREEN_MOBILE,
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION_SMALL_SCREEN_MOBILE,
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION_SMALL_SCREEN_MOBILE,
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION_SMALL_SCREEN_MOBILE,
      [4 /* RightModelAtWar */]: LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION_SMALL_SCREEN_MOBILE
    }
  };
  currentSequenceType = "";
  isLocalPlayerInitiator = false;
  leaderSequenceStepID = 0;
  leaderSequenceGate = new LeaderSequenceGate();
  isMobileSmallScreen = UI.getViewExperience() == UIViewExperience.Mobile && this.isSmallScreen();
  constructor() {
    if (LeaderModelManagerClass.instance) {
      console.error(
        "Only one instance of the leader model manager class exist at a time, second attempt to create one."
      );
    }
    LeaderModelManagerClass.instance = this;
    this.leaderModelGroup = WorldUI.createModelGroup("leaderModelGroup");
    engine.on("ModelTrigger", (id, hash) => {
      this.handleTriggerCallback(id, hash);
    });
    engine.on("ForegroundCameraAnimationComplete", (id) => {
      this.handleForegroundCameraAnimationComplete(id);
    });
    this.leader3DMarkerCenter = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
  }
  getIndLeaderAssetName(IndPlayer) {
    let indCivType = "DEFAULT";
    GameInfo.Independents.forEach((indDef) => {
      if (IndPlayer.civilizationAdjective == indDef.Name || IndPlayer.civilizationAdjective == indDef.CityStateName) {
        indCivType = indDef.CityStateType;
      }
    });
    return "LEADER_INDEPENDENT_" + indCivType;
  }
  getIndLeaderBGAssetName(IndPlayer) {
    let indCivType = "DEFAULT";
    GameInfo.Independents.forEach((indDef) => {
      if (IndPlayer.civilizationAdjective == indDef.Name || IndPlayer.civilizationAdjective == indDef.CityStateName) {
        indCivType = indDef.CityStateType;
      }
    });
    return "LEADER_INDEPENDENT_BG_" + indCivType;
  }
  // Independent Colors are hard coded for now to match city-banners.js but they should be made data driven at some point
  getIndPrimaryColor(IndPlayer) {
    let indColor = 0;
    if (IndPlayer.isMinor) {
      indColor = 16777215;
    }
    return indColor;
  }
  getIndSecondaryColor(IndPlayer) {
    let indCivType = "DEFAULT";
    GameInfo.Independents.forEach((indDef) => {
      if (IndPlayer.civilizationAdjective == indDef.Name || IndPlayer.civilizationAdjective == indDef.CityStateName) {
        indCivType = indDef.CityStateType;
      }
    });
    switch (indCivType) {
      case "MILITARISTIC":
        return 4280032175;
      case "SCIENTIFIC":
        return 4288052301;
      case "ECONOMIC":
        return 4283684351;
      case "CULTURAL":
        return 4289932169;
      case "DIPLOMATIC":
        return 4293155621;
      case "EXPANSIONIST":
        return 4279740160;
    }
    return 4294967295;
  }
  getIndBannerAssetName(IndPlayer) {
    let indCivType = "DEFAULT";
    GameInfo.Independents.forEach((indDef) => {
      if (IndPlayer.civilizationAdjective == indDef.Name || IndPlayer.civilizationAdjective == indDef.CityStateName) {
        indCivType = indDef.CityStateType;
      }
    });
    return "CIVILIZATION_" + indCivType + "_BANNER_GAME_ASSET";
  }
  getLeftLightingAssetName() {
    return "LEADER_LIGHTING_SCENE_DEFAULT_LEFT";
  }
  getRightLightingAssetName() {
    return "LEADER_LIGHTING_SCENE_DEFAULT_RIGHT";
  }
  getIndependentLightingAssetName() {
    return "LEADER_LIGHTING_SCENE_DEFAULT_INDEPENDENT";
  }
  getLeaderAssetName(leaderName) {
    return leaderName + "_GAME_ASSET";
  }
  getFallbackAssetName() {
    return "LEADER_FALLBACK_GAME_ASSET";
  }
  getCivBannerName(civilizationName) {
    return civilizationName + "_BANNER_GAME_ASSET";
  }
  getFallbackBannerAssetName() {
    return "CIVILIZATION_DEFAULT_BANNER_GAME_ASSET";
  }
  isAtWarWithPlayer(playerID) {
    if (playerID == 0) {
      return false;
    }
    const playerDiplomacy = Players.get(playerID)?.Diplomacy;
    if (playerDiplomacy?.isAtWarWith(GameContext.localPlayerID)) {
      return true;
    }
    return false;
  }
  isSmallAspectRatio() {
    return window.innerWidth / window.innerHeight < 16 / 10;
  }
  isSmallScreen() {
    return window.innerHeight < Layout.pixelsToScreenPixels(1080);
  }
  getScreenType() {
    if (this.isSmallAspectRatio()) {
      return 1 /* SmallAspectRatio */;
    }
    if (this.isMobileSmallScreen) {
      return 2 /* SmallMobileScreen */;
    }
    return 0 /* Regular */;
  }
  // ------------------------------------------------------------------------
  // Show a specific type of leader sequence.  The panel-diplomacy-hub calls this.
  showLeaderSequence(params) {
    if (performance.now() - this.sequenceStartTime < this.SEQUENCE_DEBOUNCE_DURATION) {
      return true;
    }
    this.sequenceStartTime = performance.now();
    this.isLocalPlayerInitiator = params.player1 == params.initiatingPlayer;
    switch (params.sequenceType) {
      case "MEET":
        this.showLeadersFirstMeet(params);
        return true;
      case "WAR":
        this.showLeadersDeclareWar(params);
        return true;
      case "ACCEPT_PEACE":
        this.showLeadersAcceptPeace(params);
        return true;
      case "REJECT_PEACE":
        this.showLeadersRejectPeace(params);
        return true;
      case "DEFEAT":
        this.showLeadersDefeat(params);
        return true;
    }
    return false;
  }
  // ------------------------------------------------------------------------
  // show some of the boilerplate assets that's required for any leader scene
  showDiplomaticSceneEnvironment(offset = { x: 0, y: 0, z: 0 }) {
    if (this.leader3DMarkerCenter != null) {
      if (this.isMobileSmallScreen) {
        offset.y -= 2.5;
      }
      const vignetteOffset = {
        x: LeaderModelManagerClass.DARKENING_VFX_POSITION.x + offset.x,
        y: LeaderModelManagerClass.DARKENING_VFX_POSITION.y + offset.y,
        z: LeaderModelManagerClass.DARKENING_VFX_POSITION.z + offset.z
      };
      this.leaderModelGroup.addModel(
        LeaderModelManagerClass.SCREEN_DARKENING_ASSET_NAME,
        { marker: this.leader3DMarkerCenter, offset: vignetteOffset },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leaderModelGroup.addModel(
        "Diplomatic_Scene_Bounds_Marker",
        { marker: this.leader3DMarkerCenter, offset: { x: 0, y: 20, z: 0 } },
        { angle: 0, scale: 1, foreground: true }
      );
    }
  }
  // ------------------------------------------------------------------------
  // Show the pair of leader models.
  // Their idle animations will be playing
  showLeaderModels(playerID1, playerID2) {
    this.clear();
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: "IDLE_WaitingOther",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: "IDLE_WaitingOther",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.isLeaderShowing = true;
    const animationToPlay = "IDLE_WaitingOther";
    this.playLeaderAnimation(animationToPlay, "right");
    const animationToPlayLeft = "IDLE_ListeningPlayer";
    this.playLeaderAnimation(animationToPlayLeft, "left");
  }
  // ------------------------------------------------------------------------
  // Show a leader on the left side of the screen
  // Their idle animations will be playing
  showLeftLeaderModel(playerID) {
    this.clear();
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID);
    const player1 = Players.get(playerID);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  // Show a leader on the right side of the screen
  // Their idle animations will be playing
  showRightLeaderModel(playerID) {
    this.clear();
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID);
    const player2 = Players.get(playerID);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    let animationToPlay = "IDLE_WaitingOther";
    let modelPosition = rightModelPosition;
    const isHostile = player2.Diplomacy?.getRelationshipEnum(GameContext.localPlayerID) == DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE;
    if (this.isAtWarWithPlayer(playerID) || isHostile) {
      animationToPlay = "IDLE_DwCenterOther";
      this.rightAnimState = "IDLE_DwCenterOther";
      modelPosition = LeaderModelManagerClass.POSITIONS[screenType][4 /* RightModelAtWar */];
      this.isRightHostile = true;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: modelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: modelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: animationToPlay,
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: modelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: animationToPlay,
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.isLeaderShowing = true;
    this.playLeaderAnimation(animationToPlay, "right");
  }
  /**
   *  ------------------------------------------------------------------------
   * Show an  independent 'leader' on the right side of the screen, which may not be a true leader model.
   * @param playerID
   * @returns
   */
  showRightIndLeaderModel(playerID) {
    this.clear();
    const player2 = Players.get(playerID);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID.toString()
      );
      return;
    }
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[this.getScreenType()][2 /* RightModel */];
    const p2ColorPrimary = this.getIndPrimaryColor(player2);
    const p2ColorSecondary = this.getIndSecondaryColor(player2);
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getIndependentLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_POSITION },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getIndLeaderAssetName(player2),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_POSITION },
        {
          angle: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_ANGLE,
          scale: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_SCALE,
          initialState: "IDLE",
          foreground: true,
          triggerCallbacks: true,
          seed: Database.makeHash(player2.civilizationFullName),
          selectionScriptParams: { player: playerID }
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          { angle: 0, scale: 1, initialState: "IDLE", foreground: true, triggerCallbacks: true }
        );
      }
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getIndLeaderBGAssetName(player2),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_POSITION },
        {
          angle: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_ANGLE,
          scale: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_SCALE,
          initialState: "IDLE",
          foreground: true,
          triggerCallbacks: true,
          seed: Database.makeHash(player2.civilizationFullName),
          selectionScriptParams: { player: playerID }
        }
      );
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getIndBannerAssetName(player2),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_BANNER_POSITION },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          {
            marker: this.leader3DMarkerRight,
            offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_BANNER_POSITION
          },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment(LeaderModelManagerClass.RIGHT_INDEPENDENT_VIGNETTE_OFFSET);
    this.simpleLeaderPopUpCameraAnimation(false, 0, LeaderModelManagerClass.RIGHT_INDEPENDENT_CAMERA_OFFSET);
    this.beginLeadersIndependentSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  // This function does all the interpreting of any animation triggers that come in and uses them to advance whatever sequences are relying on them
  handleTriggerCallback(id, hash) {
    if (id == this.leader3DModelLeft?.id || id == this.leader3DModelRight?.id) {
      if (DEBUG_LOG_TRIGGER) console.log("A Leader animation trigger was hit: " + id + " " + hash);
      if (hash === LeaderModelManagerClass.TRIGGER_NO_TRANSITION_START) {
        this.inTransitionDeadZone = true;
      }
      if (hash === LeaderModelManagerClass.TRIGGER_NO_TRANSITION_END) {
        this.inTransitionDeadZone = false;
        if (this.animationPaused) {
          this.animationPaused = false;
          this.playAcknowledgeAnimation();
        }
      }
      if (hash != LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER && hash != LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END) {
        return;
      }
      if (id == this.leader3DModelLeft?.id && this.leaderLeftAnimationJustStarted) {
        this.leftAnimationStartTime = performance.now();
        this.leaderLeftAnimationJustStarted = false;
        return;
      }
      if (id == this.leader3DModelRight?.id && this.leaderRightAnimationJustStarted) {
        this.rightAnimationStartTime = performance.now();
        this.leaderRightAnimationJustStarted = false;
        return;
      }
      if (id == this.leader3DModelLeft?.id && performance.now() - this.leftAnimationStartTime < this.SEQUENCE_DEBOUNCE_DURATION) {
        return;
      }
      if (id == this.leader3DModelRight?.id && performance.now() - this.rightAnimationStartTime < this.SEQUENCE_DEBOUNCE_DURATION) {
        return;
      }
      switch (this.currentSequenceType) {
        case "MEET":
          if (DEBUG_LOG_TRIGGER) {
            console.log(" - the trigger was used to advance the first meet sequence: " + id + " " + hash);
          }
          this.advanceFirstMeetSequence(id, hash);
          break;
        case "WAR":
          if (DEBUG_LOG_TRIGGER) {
            console.log(" - the trigger was used to advance the declare war sequence: " + id + " " + hash);
          }
          this.advanceDeclareWarPlayerSequence(id, hash);
          break;
        case "ACCEPT_PEACE":
          if (DEBUG_LOG_TRIGGER) {
            console.log(" - the trigger was used to advance the accept peace sequence: " + id + " " + hash);
          }
          this.advanceAcceptPeaceSequence(id, hash);
          break;
        case "REJECT_PEACE":
          if (DEBUG_LOG_TRIGGER) {
            console.log(" - the trigger was used to advance the reject peace sequence: " + id + " " + hash);
          }
          this.advanceRejectPeaceSequence(id, hash);
          break;
        case "DEFEAT":
          if (DEBUG_LOG_TRIGGER) {
            console.log(" - the trigger was used to advance the defeat sequence: " + id + " " + hash);
          }
          this.advanceDefeatSequence(id, hash);
          break;
        case "ACKNOWLEDGE_OTHER_POSITIVE":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the acknowledge other positive sequence: " + id + " " + hash
            );
          }
          this.advanceAcknowledgePositiveOtherSequence(id, hash);
          break;
        case "ACKNOWLEDGE_OTHER":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the acknowledge other sequence: " + id + " " + hash
            );
          }
          this.advanceAcknowledgeOtherSequence(id, hash);
          break;
        case "ACKNOWLEDGE_OTHER_NEGATIVE":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the acknowledge other negative sequence: " + id + " " + hash
            );
          }
          this.advanceAcknowledgeNegativeOtherSequence(id, hash);
          break;
        case "ACKNOWLEDGE_PLAYER":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the acknowledge player sequence: " + id + " " + hash
            );
          }
          this.advanceAcknowledgePlayerSequence(id, hash);
          break;
        case "ACKNOWLEDGE_HOSTILE_PLAYER":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the acknowledge player sequence hostile: " + id + " " + hash
            );
          }
          this.advanceHostileAcknowledgePlayerSequence(id, hash);
          break;
        case "PLAYER_PROPOSAL":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the player proposal sequence: " + id + " " + hash
            );
          }
          this.advancePlayerProposeSequence(id, hash);
          break;
        case "SHOW_INDEPENDENT":
          if (DEBUG_LOG_TRIGGER) {
            console.log(
              " - the trigger was used to advance the show independent sequence: " + id + " " + hash
            );
          }
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END)
            this.advanceLeadersIndependentSequence(id, hash);
          break;
        default:
          break;
      }
    }
  }
  // ------------------------------------------------------------------------
  // Handle when a foreground camera animation completes
  handleForegroundCameraAnimationComplete(id) {
    if (this.leaderSequenceGate.waitingForForegroundCameraId != 0 && this.leaderSequenceGate.waitingForForegroundCameraId == id) {
      this.leaderSequenceGate.waitingForForegroundCameraId = 0;
      if (DEBUG_LOG_TRIGGER) {
        console.log("Foreground camera animation complete");
      }
      if (this.currentSequenceType == "WAR") {
        this.advanceDeclareWarPlayerSequence(0, 0);
      }
    }
  }
  // ------------------------------------------------------------------------
  // Use this function to play a leader's animation instead of setting the state directly
  playLeaderAnimation(stateName, leaderSide) {
    if (leaderSide.toLowerCase() == "left") {
      if (this.leader3DModelLeft == null) {
        return;
      }
      this.leader3DModelLeft.setState(stateName);
      this.leaderLeftAnimationJustStarted = true;
      this.leftAnimState = stateName;
      this.leftAnimationStartTime = performance.now();
    } else if (leaderSide.toLowerCase() == "right") {
      if (this.leader3DModelRight == null) {
        return;
      }
      this.leader3DModelRight.setState(stateName);
      this.leaderRightAnimationJustStarted = true;
      this.rightAnimState = stateName;
      this.rightAnimationStartTime = performance.now();
    }
  }
  // ------------------------------------------------------------------------
  // This is what the UI system calls to exit from the leader scene so this function handles what sort of camera
  // animation we should do as we exit
  exitLeaderScene() {
    window.requestAnimationFrame((timeStamp) => {
      this.onUpdate(timeStamp);
    });
    this.isClosingFallback = true;
    this.fallbackCloseStartTime = performance.now();
    if (!this.isLeaderShowing) {
      return;
    }
    this.exitSimpleDiplomacyScene();
  }
  // KWG: Overall, a fix needs to go in to get it so that the diplomacy-manager
  // is not trying to directly call this.  It should not be communicating directly with
  // this manager, as it doesn't need to know about the visualization.
  // ------------------------------------------------------------------------
  // ------------------------------------------------------------------------
  exitSimpleDiplomacyScene() {
    this.simpleLeaderPopUpCameraAnimation(true, 0);
    this.clearLeaderModels();
  }
  // ------------------------------------------------------------------------
  clearLeaderModels() {
    this.isClosing = true;
    this.closeStartTime = performance.now();
    window.requestAnimationFrame((timeStamp) => {
      this.onUpdate(timeStamp);
    });
    this.leader3DModelLeft = null;
    this.leader3DModelRight = null;
    this.leader3DBannerLeft = null;
    this.leader3DBannerRight = null;
  }
  // ------------------------------------------------------------------------
  clear() {
    this.leaderModelGroup.clear();
    WorldUI.releaseMarker(this.leader3DMarkerLeft);
    WorldUI.releaseMarker(this.leader3DMarkerRight);
    WorldUI.releaseMarker(this.leader3DRevealFlagMarker);
    WorldUI.ForegroundCamera.reset();
    if (this.worldCamera) {
      Camera.popCamera();
    }
    Camera.clearAnimation();
    this.worldCamera = null;
    this.isClosing = false;
    this.isClosingFallback = false;
    this.leader3DModelLeft = null;
    this.leader3DModelRight = null;
    this.leader3DBannerLeft = null;
    this.leader3DBannerRight = null;
    this.leader3DMarkerLeft = null;
    this.leader3DMarkerRight = null;
    this.leader3DRevealFlagMarker = null;
    this.currentSequenceType == "";
    this.leaderSequenceStepID = 0;
    this.cameraDollyQueued = false;
    this.cameraDollyDelayed = false;
    this.cameraAnimationDelayDuration = 0;
    this.leaderSequenceGate.clear();
    this.isLeaderShowing = false;
    this.isRightHostile = false;
    this.declareWarCameraActive = false;
  }
  // ------------------------------------------------------------------------
  onUpdate(timeStamp) {
    if (this.isClosingFallback || this.isClosing || this.cameraDollyQueued || this.cameraDollyDelayed) {
      window.requestAnimationFrame((timeStamp2) => {
        this.onUpdate(timeStamp2);
      });
      if (timeStamp - this.fallbackCloseStartTime > this.MAX_LENGTH_OF_ANIMATION_EXIT && this.isClosingFallback) {
        this.clear();
      }
      if (timeStamp - this.closeStartTime > this.MAX_LENGTH_OF_ANIMATION_EXIT && this.isClosing) {
        this.clear();
      }
      if (timeStamp - this.cameraDollyRequestStartTime > this.cameraAnimationDelayDuration * 1e3 && this.cameraDollyDelayed) {
        this.cameraDollyDelayed = false;
        this.doForegroundCameraDolly(false);
      }
      if (this.leaderModelGroup.isLoaded() && this.cameraDollyQueued) {
        this.cameraDollyQueued = false;
        if (this.cameraAnimationDelayDuration > 0) {
          this.cameraDollyDelayed = true;
          this.cameraDollyRequestStartTime = performance.now();
        } else {
          this.doForegroundCameraDolly(false);
        }
      }
    }
  }
  // ------------------------------------------------------------------------
  // Do some shared operations, when a sequence advances to the next step.
  doSequenceSharedAdvance() {
    if (this.leaderSequenceGate.voQueued) {
      window.dispatchEvent(new CustomEvent("diplomacy-animation-finished", { detail: { isVO: true } }));
      this.leaderSequenceGate.voQueued = false;
    }
  }
  // ========================================================================
  // Code specific to a canned sequence.  i.e. MEET, WAR, etc.
  //
  // We should look into making these more data driven.
  //
  // Please keep all sequence specific code below here.  If we intend on
  // having specific code for sequecing, the code should be in separate
  // controller classes, as this will get quite cluttered with them as we
  // add more.
  // ------------------------------------------------------------------------
  updateSequenceWaitFromAnimationTrigger(id, _hash) {
    if (id != 0) {
      if (id == this.leader3DModelLeft?.id) {
        this.leaderSequenceGate.waitingForLeftAnimation = false;
      }
      if (id == this.leader3DModelRight?.id) {
        this.leaderSequenceGate.waitingForRightAnimation = false;
      }
    }
  }
  // ------------------------------------------------------------------------
  // FIRST MEET SEQUENCE
  // This starts the sequencing for the First meet interaction
  showLeadersFirstMeet(params) {
    this.clear();
    const playerID1 = params.player1;
    const playerID2 = params.player2;
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, this.FIRST_MEET_DELAY);
    this.beginFirstMeetSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  beginFirstMeetSequence() {
    this.playLeaderAnimation("IDLE_ListeningPlayerBreath", "left");
    this.playLeaderAnimation("VO_FirstMeet", "right");
    this.leaderSequenceGate.clear();
    this.leaderSequenceGate.setWaitForJustRight();
    this.leaderSequenceGate.setVOQueued();
    this.currentSequenceType = "MEET";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceFirstMeetSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) {
            this.rightAnimState = "IDLE_WaitingOther";
            this.leaderSequenceStepID = 2;
          }
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END) {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
            this.playLeaderAnimation("IDLE_ListeningPlayer", "left");
            this.leaderSequenceStepID = 0;
            this.leaderSequenceGate.clear();
          }
        }
        break;
      }
      case 2: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END && id == this.leader3DModelRight?.id) {
          this.playLeaderAnimation("IDLE_WaitingOther", "right");
          this.leaderSequenceStepID = 3;
        }
        break;
      }
      case 3: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (id == this.leader3DModelRight?.id) this.playLeaderAnimation("IDLE_WaitingOther", "right");
          if (id == this.leader3DModelLeft?.id) this.playLeaderAnimation("IDLE_ListeningPlayer", "left");
          if (this.leftAnimState == "IDLE_ListeningPlayer" && this.rightAnimState == "IDLE_WaitingOther")
            this.leaderSequenceStepID = 0;
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // Declare War from Player Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for a declare war statement.
  // This will work for either direction.
  showLeadersDeclareWar(params) {
    this.clear();
    const playerID1 = params.player1;
    const playerID2 = params.player2;
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.beginDeclareWarPlayerSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  beginDeclareWarPlayerSequence() {
    if (DEBUG_LOG_TRIGGER) {
      console.log("DW sequence step 0");
      console.log("Player on the left is ID: " + this.leader3DModelLeft?.id);
      console.log("Player on the right is ID: " + this.leader3DModelRight?.id);
    }
    if (this.isLocalPlayerInitiator) {
      this.playLeaderAnimation("ACTION_DwDecisionPlayer", "left");
      this.playLeaderAnimation("IDLE_WaitingOtherBreath", "right");
      this.leaderSequenceGate.setWaitForJustLeft();
      this.leaderSequenceStepID = 1;
    } else {
      this.playLeaderAnimation("IDLE_DwPlayer", "left");
      this.playLeaderAnimation("VO_DwAttacker", "right");
      this.leaderSequenceGate.setWaitForJustRight();
      this.leaderSequenceGate.setVOQueued();
      this.leaderSequenceStepID = 2;
    }
    this.currentSequenceType = "WAR";
  }
  // ------------------------------------------------------------------------
  advanceDeclareWarPlayerSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.playLeaderAnimation("VO_DwDefender", "right");
          this.leaderSequenceGate.setVOQueued();
          this.leaderSequenceStepID = 2;
        }
        break;
      }
      case 2: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (id == this.leader3DModelLeft?.id) this.playLeaderAnimation("IDLE_DwPlayer", "left");
          if (id == this.leader3DModelRight?.id) {
            this.playLeaderAnimation("TRANS_DwtoDwCenterPlayer", "left");
            this.startDWCameraAnimations();
            this.leaderSequenceStepID = 3;
          }
        }
        break;
      }
      case 3: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          if (id == this.leader3DModelLeft?.id && hash != LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER)
            this.playLeaderAnimation("IDLE_DwCenterPlayer", "left");
          if (id == this.leader3DModelRight?.id && hash != LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER)
            this.playLeaderAnimation("IDLE_DwCenterOther", "right");
          if (this.leftAnimState == "IDLE_DwCenterPlayer" && this.rightAnimState == "IDLE_DwCenterOther") {
            this.leaderSequenceStepID = 0;
          }
        }
        break;
      }
    }
  }
  // ------------------------------------------------------------------------
  // ACCEPT PEACE SEQUENCE
  // This starts the sequencing for the Accept Peace interaction. This sequence can
  // also be used for other instances of a leader accepting a big proposal, like an alliance
  showLeadersAcceptPeace(params) {
    this.clear();
    const playerID1 = params.player1;
    const playerID2 = params.player2;
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: "IDLE_HappyPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: "IDLE_HappyPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.beginAcceptPeaceSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  beginAcceptPeaceSequence() {
    this.playLeaderAnimation("VO_Accept", "right");
    this.playLeaderAnimation("IDLE_HappyPlayer", "left");
    this.currentSequenceType = "ACCEPT_PEACE";
    this.leaderSequenceGate.setWaitForJustRight();
    this.leaderSequenceGate.setVOQueued();
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceAcceptPeaceSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER)
            this.leaderSequenceStepID = 2;
        }
        break;
      }
      case 2: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (id == this.leader3DModelRight?.id) this.playLeaderAnimation("IDLE_HappyOther", "right");
          if (id == this.leader3DModelLeft?.id) this.playLeaderAnimation("IDLE_HappyPlayer", "left");
          if (this.leftAnimState == "IDLE_HappyPlayer" && this.rightAnimState == "IDLE_HappyOther")
            this.leaderSequenceStepID = 0;
        }
        break;
      }
    }
  }
  // ------------------------------------------------------------------------
  // REJECT PEACE SEQUENCE
  // This starts the sequencing for the Reject Peace interaction. This sequence can
  // also be used for other instances of a leader rejecting a big proposal, like an alliance
  showLeadersRejectPeace(params) {
    this.clear();
    const playerID1 = params.player1;
    const playerID2 = params.player2;
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          initialState: "IDLE_HappyPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            initialState: "IDLE_HappyPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          initialState: "IDLE_ListeningPlayer",
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            initialState: "IDLE_ListeningPlayer",
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.beginRejectPeaceSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  beginRejectPeaceSequence() {
    this.playLeaderAnimation("VO_Reject", "right");
    this.playLeaderAnimation("IDLE_UnhappyPlayer", "left");
    this.currentSequenceType = "REJECT_PEACE";
    this.leaderSequenceGate.setWaitForJustRight();
    this.leaderSequenceGate.setVOQueued();
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceRejectPeaceSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER)
            this.leaderSequenceStepID = 2;
        }
        break;
      }
      case 2: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (id == this.leader3DModelRight?.id) this.playLeaderAnimation("IDLE_WaitingOther", "right");
          if (id == this.leader3DModelLeft?.id) this.playLeaderAnimation("IDLE_UnhappyPlayer", "left");
          if (this.leftAnimState == "IDLE_UnhappyPlayer" && this.rightAnimState == "IDLE_WaitingOther")
            this.leaderSequenceStepID = 0;
        }
        break;
      }
    }
  }
  // ------------------------------------------------------------------------
  // DEFEAT SEQUENCE
  // This starts the sequencing for the Leader Defeated Sequence.
  showLeadersDefeat(params) {
    this.clear();
    const playerID1 = params.player1;
    const playerID2 = params.player2;
    const p1ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID1);
    const p1ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID1);
    const player1 = Players.get(playerID1);
    if (!player1) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID1.toString()
      );
      return;
    }
    const leader1 = GameInfo.Leaders.lookup(player1.leaderType);
    if (!leader1) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const civ1 = GameInfo.Civilizations.lookup(player1.civilizationType);
    if (!civ1) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID1.toString()
      );
      return;
    }
    const screenType = this.getScreenType();
    const leftModelPosition = LeaderModelManagerClass.POSITIONS[screenType][0 /* LeftModel */];
    const leftBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][1 /* LeftBanner */];
    const rightModelPosition = LeaderModelManagerClass.POSITIONS[screenType][2 /* RightModel */];
    const rightBannerPosition = LeaderModelManagerClass.POSITIONS[screenType][3 /* RightBanner */];
    this.leader3DMarkerLeft = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerLeft != null) {
      this.leaderModelGroup.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader1.LeaderType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelLeft == null) {
        this.leader3DModelLeft = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerLeft = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    const p2ColorPrimary = UI.Player.getPrimaryColorValueAsHex(playerID2);
    const p2ColorSecondary = UI.Player.getSecondaryColorValueAsHex(playerID2);
    const player2 = Players.get(playerID2);
    if (!player2) {
      console.error(
        "leader-model-manager: Unable to get valid player library for player with id: " + playerID2.toString()
      );
      return;
    }
    const leader2 = GameInfo.Leaders.lookup(player2.leaderType);
    if (!leader2) {
      console.error(
        "leader-model-manager: Unable to get valid leader definition for player with id: " + playerID2.toString()
      );
      return;
    }
    const civ2 = GameInfo.Civilizations.lookup(player2.civilizationType);
    if (!civ2) {
      console.error(
        "leader-model-manager: Unable to get valid civilization definition for player with id: " + playerID2.toString()
      );
      return;
    }
    this.leader3DMarkerRight = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (this.leader3DMarkerRight != null) {
      this.leaderModelGroup.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroup.addModel(
        this.getLeaderAssetName(leader2.LeaderType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        {
          angle: 0,
          scale: 1,
          foreground: true,
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DModelRight == null) {
        this.leader3DModelRight = this.leaderModelGroup.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          {
            angle: 0,
            scale: 1,
            foreground: true,
            tintColor1: p1ColorPrimary,
            tintColor2: p1ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
      this.leader3DBannerRight = this.leaderModelGroup.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroup.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            tintColor1: p2ColorPrimary,
            tintColor2: p2ColorSecondary,
            triggerCallbacks: true
          }
        );
      }
    }
    this.showDiplomaticSceneEnvironment();
    this.simpleLeaderPopUpCameraAnimation(false, 0);
    this.beginDefeatSequence();
    this.isLeaderShowing = true;
  }
  // ------------------------------------------------------------------------
  beginDefeatSequence() {
    this.playLeaderAnimation("VO_Defeat", "right");
    this.playLeaderAnimation("IDLE_SmugPlayer", "left");
    this.currentSequenceType = "DEFEAT";
    this.leaderSequenceGate.setWaitForJustRight();
    this.leaderSequenceGate.setVOQueued();
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceDefeatSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("REACT_SmugTauntPlayer", "left");
          this.leaderSequenceStepID = 2;
        }
        break;
      }
      case 2: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (id == this.leader3DModelLeft?.id) this.playLeaderAnimation("IDLE_SmugPlayer", "left");
          if (id == this.leader3DModelRight?.id) this.playLeaderAnimation("IDLE_DefeatOther", "right");
          if (this.leftAnimState == "IDLE_SmugPlayer" && this.rightAnimState == "IDLE_DefeatOther")
            this.leaderSequenceStepID = 0;
        }
        break;
      }
    }
  }
  // Player Acknowledge Positive Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for the player leader to play their
  // positive acknowledge animation and then continue to their idle.
  // ------------------------------------------------------------------------
  beginAcknowledgePlayerSequence() {
    if (this.leftAnimState != "IDLE_ListeningPlayer" && this.leftAnimState != "IDLE_ListeningPlayerBreath") return;
    if (DEBUG_LOG_TRIGGER) {
      console.log("Acknowledge Positive Player sequence step 0");
      console.log("Player on the left is ID: " + this.leader3DModelLeft?.id);
      console.log("Player on the right is ID: " + this.leader3DModelRight?.id);
    }
    if (this.inTransitionDeadZone) {
      this.animationPaused = true;
    } else {
      this.playAcknowledgeAnimation();
    }
  }
  playAcknowledgeAnimation() {
    this.playLeaderAnimation("REACT_ListeningAckldgePlayer", "left");
    this.leaderSequenceGate.setWaitForJustLeft();
    this.currentSequenceType = "ACKNOWLEDGE_PLAYER";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceAcknowledgePlayerSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("IDLE_ListeningPlayer", "left");
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // Player Acknowledge Negative Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for the player leader to play their
  // hostile acknowledge animation and then continue to their idle.
  // ------------------------------------------------------------------------
  beginHostileAcknowledgePlayerSequence() {
    if (this.leftAnimState != "IDLE_ListeningPlayer" && this.leftAnimState != "IDLE_ListeningPlayerBreath") return;
    if (DEBUG_LOG_TRIGGER) {
      console.log("Acknowledge Hostile Player sequence step 0");
      console.log("Player on the left is ID: " + this.leader3DModelLeft?.id);
      console.log("Player on the right is ID: " + this.leader3DModelRight?.id);
    }
    this.playLeaderAnimation("ACTION_DwDecisionPlayer", "left");
    this.leaderSequenceGate.setWaitForJustLeft();
    this.currentSequenceType = "ACKNOWLEDGE_HOSTILE_PLAYER";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceHostileAcknowledgePlayerSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("IDLE_DwPlayer", "left");
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // Player Propose Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for the player leader to play their
  // positive acknowledge animation and then continue to their idle.
  // ------------------------------------------------------------------------
  beginPlayerProposeSequence() {
    if (DEBUG_LOG_TRIGGER) console.log("Acknowledge Player Propose sequence step 0");
    this.playLeaderAnimation("REACT_ListeningAckldgePlayer", "left");
    this.leaderSequenceGate.setWaitForJustLeft();
    this.currentSequenceType = "PLAYER_PROPOSAL";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advancePlayerProposeSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("REACT_PositiveOther", "right");
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  beginAcknowledgeOtherSequence() {
    if (this.rightAnimState != "IDLE_WaitingOther") return;
    if (DEBUG_LOG_TRIGGER) console.log("Acknowledge Positive Other sequence step 0");
    if (this.isRightHostile) {
      this.playLeaderAnimation("REACT_DwPositiveOther", "right");
    } else {
      this.playLeaderAnimation("REACT_PositiveOther", "right");
    }
    this.leaderSequenceGate.setWaitForJustRight();
    this.currentSequenceType = "ACKNOWLEDGE_OTHER";
    this.leaderSequenceStepID = 1;
  }
  advanceAcknowledgeOtherSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (id == this.leader3DModelLeft?.id && this.leftAnimState == "REACT_ListeningAckldgePlayer") {
          this.playLeaderAnimation("IDLE_ListeningPlayerBreath", "left");
          break;
        }
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (this.isRightHostile) {
            this.playLeaderAnimation("IDLE_DwCenterOther", "right");
          } else {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
          }
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // Other Acknowledge Positive Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for the other leader to play their
  // positive acknowledge animation and then continue to their idle.
  // ------------------------------------------------------------------------
  beginAcknowledgePositiveOtherSequence(forced) {
    if (this.rightAnimState != "IDLE_WaitingOther" && this.rightAnimState != "IDLE_DwCenterOther" && forced != true)
      return;
    if (DEBUG_LOG_TRIGGER) {
      console.log("Acknowledge Positive Other sequence step 0");
    }
    if (this.isRightHostile) {
      this.playLeaderAnimation("REACT_DwPositiveOther", "right");
    } else {
      this.playLeaderAnimation("REACT_PositiveOther", "right");
    }
    this.leaderSequenceGate.setWaitForJustRight();
    this.currentSequenceType = "ACKNOWLEDGE_OTHER_POSITIVE";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceAcknowledgePositiveOtherSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (id == this.leader3DModelLeft?.id && this.leftAnimState == "REACT_ListeningAckldgePlayer") {
          this.playLeaderAnimation("IDLE_ListeningPlayerBreath", "left");
          break;
        }
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (this.isRightHostile) {
            this.playLeaderAnimation("IDLE_DwCenterOther", "right");
          } else {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
          }
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // Other Acknowledge Negative Sequence
  // ------------------------------------------------------------------------
  // This starts the sequencing for the other leader to play their
  // positive acknowledge animation and then continue to their idle.
  // ------------------------------------------------------------------------
  beginAcknowledgeNegativeOtherSequence(forced) {
    if (this.rightAnimState != "IDLE_WaitingOther" && this.rightAnimState != "IDLE_DwCenterOther" && forced != true)
      return;
    if (DEBUG_LOG_TRIGGER) console.log("Acknowledge Negative Other sequence step 0");
    if (this.isRightHostile) {
      this.playLeaderAnimation("REACT_DwNegativeOther", "right");
    } else {
      this.playLeaderAnimation("REACT_NegativeOther", "right");
    }
    this.leaderSequenceGate.setWaitForJustRight();
    this.currentSequenceType = "ACKNOWLEDGE_OTHER_NEGATIVE";
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceAcknowledgeNegativeOtherSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
        if (id == this.leader3DModelLeft?.id && this.leftAnimState == "REACT_ListeningAckldgePlayer") {
          this.playLeaderAnimation("IDLE_ListeningPlayerBreath", "left");
          break;
        }
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          if (this.isRightHostile) {
            this.playLeaderAnimation("IDLE_DwCenterOther", "right");
          } else {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
          }
          this.leaderSequenceStepID = 0;
          this.currentSequenceType = "";
          this.leaderSequenceGate.clear();
        }
        break;
      }
    }
  }
  // ------------------------------------------------------------------------
  beginLeadersIndependentSequence() {
    this.playLeaderAnimation("SPAWN", "right");
    this.currentSequenceType = "SHOW_INDEPENDENT";
    this.leaderSequenceGate.setWaitForJustRight();
    this.leaderSequenceStepID = 1;
  }
  // ------------------------------------------------------------------------
  advanceLeadersIndependentSequence(id, hash) {
    this.updateSequenceWaitFromAnimationTrigger(id, hash);
    switch (this.leaderSequenceStepID) {
      case 1: {
        if (this.leaderSequenceGate.isWaiting() == false) {
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("IDLE", "right");
          this.leaderSequenceStepID = 0;
        }
        break;
      }
    }
  }
  // Camera sequences
  // ------------------------------------------------------------------------
  doForegroundCameraDolly(reverse) {
    const yOffset = reverse ? this.declareWarCameraActive ? LeaderModelManagerClass.DECLARE_WAR_DOLLY_DISTANCE : 0 : LeaderModelManagerClass.OFF_CAMERA_DISTANCE;
    const zOffset = reverse ? this.declareWarCameraActive ? 1 : 0 : 0;
    const cameraStartPosition = { x: 0, y: yOffset, z: zOffset };
    const subjectOffset = reverse ? LeaderModelManagerClass.CAMERA_SUBJECT_DISTANCE - LeaderModelManagerClass.OFF_CAMERA_DISTANCE : LeaderModelManagerClass.CAMERA_SUBJECT_DISTANCE;
    const subjectStartPosition = {
      x: this.leaderCameraOffset.x,
      y: this.leaderCameraOffset.y + subjectOffset,
      z: this.leaderCameraOffset.z + zOffset
    };
    const moveDistance = reverse ? LeaderModelManagerClass.OFF_CAMERA_DISTANCE : -LeaderModelManagerClass.OFF_CAMERA_DISTANCE;
    const movementDelta = { x: 0, y: moveDistance, z: 0 };
    const cameraStartFOV = 15;
    const cameraFinalFOV = reverse ? 35 : 15;
    const cameraId = reverse ? LeaderModelManagerClass.FOREGROUND_CAMERA_OUT_ID : LeaderModelManagerClass.FOREGROUND_CAMERA_IN_ID;
    const moveDuration = reverse ? LeaderModelManagerClass.CAMERA_DOLLY_ANIMATION_OUT_DURATION : LeaderModelManagerClass.CAMERA_DOLLY_ANIMATION_IN_DURATION;
    WorldUI.ForegroundCamera.beginAnimation(
      { cameraPos: cameraStartPosition, subjectPos: subjectStartPosition, fov: cameraStartFOV },
      0
    );
    WorldUI.ForegroundCamera.addDeltaKeyframe(
      { cameraPos: movementDelta, subjectPos: movementDelta, fov: 0 },
      moveDuration,
      0
    );
    WorldUI.ForegroundCamera.addDeltaKeyframe(
      { cameraPos: { x: 0, y: 0, z: 0 }, subjectPos: { x: 0, y: 0, z: 0 }, fov: cameraStartFOV - cameraFinalFOV },
      0,
      0
    );
    WorldUI.ForegroundCamera.setId(cameraId);
    WorldUI.ForegroundCamera.endAnimation();
    this.leaderSequenceGate.waitingForForegroundCameraId = cameraId;
  }
  // ------------------------------------------------------------------------
  // This is the camera animation to use for any leader diplomacy screen that doesn't require a more cinematic camera
  simpleLeaderPopUpCameraAnimation(reverse, delay, cameraOffset) {
    if (reverse) {
      this.doForegroundCameraDolly(reverse);
    } else {
      const startOffset = LeaderModelManagerClass.OFF_CAMERA_DISTANCE;
      const cameraStart = { x: 0, y: 0 + startOffset, z: 0 };
      const subjectStart = { x: 0, y: LeaderModelManagerClass.CAMERA_SUBJECT_DISTANCE, z: 0 };
      WorldUI.ForegroundCamera.beginAnimation({ cameraPos: cameraStart, subjectPos: subjectStart }, 0);
      WorldUI.ForegroundCamera.addKeyframe_Translate({ x: 0, y: 0, z: 0 }, 0.1, 0);
      WorldUI.ForegroundCamera.setId(LeaderModelManagerClass.FOREGROUND_CAMERA_IN_ID);
      WorldUI.ForegroundCamera.endAnimation();
      this.leaderCameraOffset = cameraOffset ? cameraOffset : { x: 0, y: 0, z: 0 };
      this.cameraAnimationDelayDuration = delay;
      this.cameraDollyQueued = true;
      window.requestAnimationFrame((timeStamp) => {
        this.onUpdate(timeStamp);
      });
    }
  }
  // ------------------------------------------------------------------------
  startDWCameraAnimations() {
    {
      const startOffset = 0;
      const moveDistance = LeaderModelManagerClass.DECLARE_WAR_DOLLY_DISTANCE;
      const cameraStart = { x: 0, y: 0 + startOffset, z: 0 };
      const subjectStart = { x: 0, y: LeaderModelManagerClass.CAMERA_SUBJECT_DISTANCE, z: 0 };
      WorldUI.ForegroundCamera.beginAnimation({ cameraPos: cameraStart, subjectPos: subjectStart, fov: 15 }, 0);
      WorldUI.ForegroundCamera.addKeyframe_Translate({ x: 0, y: moveDistance, z: 1 }, 1.1, 0);
      WorldUI.ForegroundCamera.setId(LeaderModelManagerClass.FOREGROUND_CAMERA_IN_ID);
      WorldUI.ForegroundCamera.endAnimation();
      this.declareWarCameraActive = true;
    }
  }
}
const LeaderModelManager = new LeaderModelManagerClass();

var TempDiplomacyActionType = /* @__PURE__ */ ((TempDiplomacyActionType2) => {
  TempDiplomacyActionType2[TempDiplomacyActionType2["DECLARE_WAR"] = 0] = "DECLARE_WAR";
  TempDiplomacyActionType2[TempDiplomacyActionType2["DECLARE_PEACE"] = 1] = "DECLARE_PEACE";
  TempDiplomacyActionType2[TempDiplomacyActionType2["FORM_ALLIANCE"] = 2] = "FORM_ALLIANCE";
  return TempDiplomacyActionType2;
})(TempDiplomacyActionType || {});
class DiplomacyInputPanel extends Panel {
  // These will be overridden in diplomacy panels that need to handle input and return if the input is still live or not.
  handleInput(_inputEvent) {
    return true;
  }
  handleNavigation(_navigationEvent) {
    return true;
  }
}
class DiplomacyDialogManagerImpl extends DisplayHandlerBase {
  constructor() {
    super("DiplomacyDialog", 6e3);
  }
  show(request) {
    const isAlreadyInDialog = InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_DIALOG");
    DiplomacyManager.currentDiplomacyDialogData = request;
    if (isAlreadyInDialog) {
      window.dispatchEvent(new CustomEvent("diplomacy-dialog-next"));
    } else {
      InterfaceMode.switchTo("INTERFACEMODE_DIPLOMACY_DIALOG");
    }
  }
  hide(_request, options) {
    DiplomacyManager.hide(options.reason === DisplayHideReason.Suspend);
  }
  isEmpty() {
    return DisplayQueueManager.findAll(this.getCategory()).length == 0;
  }
}
class DiplomacyDealManagerImpl extends DisplayHandlerBase {
  constructor() {
    super("DiplomacyDeal", 5e3);
  }
  show(request) {
    if (!request.blockClose) {
      DiplomacyManager.currentDiplomacyDialogData = null;
      DiplomacyManager.currentDiplomacyDealData = request;
      InterfaceMode.switchTo("INTERFACEMODE_PEACE_DEAL");
    }
  }
  hide(request, options) {
    if (!request.blockClose) {
      DiplomacyManager.hide(options.reason === DisplayHideReason.Suspend);
    }
  }
  isEmpty() {
    return DisplayQueueManager.findAll(this.getCategory()).length == 0;
  }
}
class DiplomacyProjectManagerImpl extends DisplayHandlerBase {
  constructor() {
    super("DiplomaticResponseUIData", 8e3);
  }
  show(request) {
    DiplomacyManager.currentProjectReactionRequest = request;
    InterfaceMode.switchTo("INTERFACEMODE_DIPLOMACY_PROJECT_REACTION");
  }
  hide(_request, options) {
    DiplomacyManager.hide(options.reason === DisplayHideReason.Suspend);
  }
  isEmpty() {
    return DisplayQueueManager.findAll(this.getCategory()).length == 0;
  }
}
const DiplomacyDealProposalResponseEventName = "diplomacy-deal-proposal-response";
class DiplomacyDealProposalResponseEvent extends CustomEvent {
  constructor(detail) {
    super(DiplomacyDealProposalResponseEventName, { bubbles: false, detail });
  }
}
class DiplomacyManagerImpl {
  beforeUnloadListener = this.onUnload.bind(this);
  diplomacyStatementListener = this.onDiplomacyStatement.bind(this);
  diplomacySessionClosedListener = this.onDiplomacySessionClosed.bind(this);
  actionDetailsClosedListener = this.onActionDetailsClosed.bind(this);
  firstMeetReactionClosedListener = this.onFirstMeetReactionClosed.bind(this);
  onRaiseDiplomacyHubListener = this.onRaiseDiplomacyHub.bind(this);
  _selectedPlayerID = PlayerIds.NO_PLAYER;
  _diplomacyActions = [];
  _availableProjects = [];
  _availableEndeavors = [];
  _availableSanctions = [];
  _availableEsionage = [];
  _availableTreaties = [];
  _selectedProjectData = null;
  isClosingActionsPanel = false;
  _isFirstMeetDiplomacyOpen = false;
  _isDeclareWarDiplomacyOpen = false;
  currentDiplomacyDialogData = null;
  selectedActionID = -1;
  currentDiplomacyDealData = null;
  currentAllyWarData = null;
  currentProjectReactionData = null;
  currentProjectReactionRequest = null;
  showDiplomacyAfterFirstMeet = false;
  firstMeetPlayerID = PlayerIds.NO_PLAYER;
  currentEspionageData = null;
  selectedAttributeType = "";
  //Should we close out of entire diplomacy view or just step back to the diplomacy action panels when closing details
  //True when coming from notifications or clicking on actions on the map
  shouldQuickClose = false;
  constructor() {
    this.initializeListeners();
    WorldInput.addWarHandler(this.startWarFromMap.bind(this));
  }
  isShowing() {
    return InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_DIALOG") || InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB") || InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL") || InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_PROJECT_REACTION");
  }
  isEmpty() {
    return DiplomacyDealManager.isEmpty() && DiplomacyDialogManager.isEmpty();
  }
  addDealCloseBlocker() {
    return DiplomacyDealManager.addDisplayRequest({
      category: DiplomacyDealManager.getCategory(),
      blockClose: true,
      addToFront: true
    });
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(isSuspended) {
    this.selectedActionID = -1;
    if (isSuspended) {
      LeaderModelManager.exitLeaderScene();
    }
    if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL")) {
      InterfaceMode.switchToDefault();
      return;
    } else if (this.firstMeetPlayerID != PlayerIds.NO_PLAYER && DiplomacyProjectManager.isEmpty()) {
      InterfaceMode.switchToDefault();
      setTimeout(
        //Wait 2ms so the context manager can finish advancing and closing down
        () => {
          this.raiseDiplomacyHub(this.firstMeetPlayerID);
          this.firstMeetPlayerID = PlayerIds.NO_PLAYER;
          return;
        },
        2
      );
      return;
    }
    const blocker = this.addDealCloseBlocker();
    LeaderModelManager.exitLeaderScene();
    if (!isSuspended) {
      setTimeout(() => {
        DisplayQueueManager.close(blocker);
        if (DiplomacyManager.currentDiplomacyDealData == null) {
          InterfaceMode.switchToDefault();
        }
      }, LeaderModelManager.MAX_LENGTH_OF_ANIMATION_EXIT);
    } else {
      DisplayQueueManager.close(blocker);
      if (DiplomacyManager.currentDiplomacyDealData == null) {
        InterfaceMode.switchToDefault();
      }
    }
  }
  /// Listeners for system events.
  initializeListeners() {
    engine.on("BeforeUnload", this.beforeUnloadListener);
    engine.on("DiplomacyStatement", this.diplomacyStatementListener);
    engine.on("DiplomacySessionClosed", this.diplomacySessionClosedListener);
    window.addEventListener("first-meet-reaction-closed", this.firstMeetReactionClosedListener);
    window.addEventListener(RaiseDiplomacyEventName, this.onRaiseDiplomacyHubListener);
  }
  cleanup() {
    engine.off("BeforeUnload", this.beforeUnloadListener);
    engine.off("DiplomacyStatement", this.diplomacyStatementListener);
    engine.off("DiplomacySessionClosed", this.diplomacySessionClosedListener);
    window.removeEventListener("first-meet-reaction-closed", this.firstMeetReactionClosedListener);
    window.removeEventListener(RaiseDiplomacyEventName, this.onRaiseDiplomacyHubListener);
  }
  onUnload() {
    this.cleanup();
  }
  get selectedPlayerID() {
    return this._selectedPlayerID;
  }
  get diplomacyActions() {
    return this._diplomacyActions;
  }
  get allAvailableActions() {
    return this._availableProjects.concat(
      this._availableEndeavors,
      this._availableSanctions,
      this._availableEsionage,
      this._availableTreaties
    );
  }
  get availableProjects() {
    return this._availableProjects;
  }
  get availableEndeavors() {
    return this._availableEndeavors;
  }
  get availableSanctions() {
    return this._availableSanctions;
  }
  get availableEspionage() {
    return this._availableEsionage;
  }
  get availableTreaties() {
    return this._availableTreaties;
  }
  get selectedProjectData() {
    return this._selectedProjectData;
  }
  get isFirstMeetDiplomacyOpen() {
    return this._isFirstMeetDiplomacyOpen;
  }
  get isDeclareWarDiplomacyOpen() {
    return this._isDeclareWarDiplomacyOpen;
  }
  queryAvailableProjectData(targetPlayer) {
    const availableProjectData = Game.Diplomacy.getProjectDataForUI(
      GameContext.localPlayerID,
      targetPlayer != null && targetPlayer != GameContext.localPlayerID ? targetPlayer : -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
      DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
    );
    if (!Players.get(this._selectedPlayerID)?.isMajor) {
      this._availableProjects = availableProjectData.filter(
        (project) => project.projectStatus == DiplomacyProjectStatus.PROJECT_AVAILABLE || project.projectStatus == DiplomacyProjectStatus.PROJECT_NO_VIABLE_TARGETS
      );
      this._availableEndeavors = [];
      this._availableSanctions = [];
      this._availableEsionage = [];
      this._availableTreaties = [];
      return;
    }
    this._availableProjects = availableProjectData.filter(
      (project) => project.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_PROJECT && project.projectStatus != DiplomacyProjectStatus.PROJECT_NOT_UNLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_BLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_ACTIVE
    );
    this._availableEndeavors = availableProjectData.filter(
      (project) => project.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ENDEAVOR && project.projectStatus != DiplomacyProjectStatus.PROJECT_NOT_UNLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_BLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_ACTIVE
    );
    this._availableSanctions = availableProjectData.filter(
      (project) => project.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_SANCTION && project.projectStatus != DiplomacyProjectStatus.PROJECT_NOT_UNLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_BLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_ACTIVE
    );
    this._availableEsionage = availableProjectData.filter(
      (project) => project.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE && project.projectStatus != DiplomacyProjectStatus.PROJECT_NOT_UNLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_BLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_ACTIVE
    );
    this._availableTreaties = availableProjectData.filter(
      (project) => project.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_TREATY && project.projectStatus != DiplomacyProjectStatus.PROJECT_NOT_UNLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_BLOCKED && project.projectStatus != DiplomacyProjectStatus.PROJECT_ACTIVE
    );
  }
  /**
   * Another system is requesting for the diplomacy system to be raised.
   * @param event
   */
  onRaiseDiplomacyHub(event) {
    const playerID = event.detail.playerID;
    this.raiseDiplomacyHub(playerID);
  }
  raiseDiplomacyHub(playerID) {
    if (this.isClosingActionsPanel) {
      return;
    }
    this._selectedPlayerID = playerID;
    if (playerID != GameContext.localPlayerID) {
      this.populateDiplomacyActions();
    }
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB")) {
      InterfaceMode.switchTo("INTERFACEMODE_DIPLOMACY_HUB");
    } else {
      const callback = () => {
        window.dispatchEvent(new CustomEvent("diplomacy-selected-player-changed"));
      };
      callback();
    }
  }
  lowerDiplomacyHub() {
    const closeCallback = () => {
      this.isClosingActionsPanel = true;
      LeaderModelManager.exitLeaderScene();
      this._selectedPlayerID = PlayerIds.NO_PLAYER;
      setTimeout(() => {
        InterfaceMode.switchToDefault();
        this.isClosingActionsPanel = false;
      }, LeaderModelManager.MAX_LENGTH_OF_ANIMATION_EXIT);
    };
    closeCallback();
  }
  closeCurrentDiplomacyDeal(closeSession, ourDiplomacySession) {
    if (this.currentDiplomacyDealData) {
      const request = this.currentDiplomacyDealData;
      this.currentDiplomacyDealData = null;
      DisplayQueueManager.close(request);
      if (closeSession) {
        Game.DiplomacySessions.closeSession(request.SessionID);
      }
    } else if (ourDiplomacySession && closeSession) {
      Game.DiplomacySessions.closeSession(ourDiplomacySession);
    }
  }
  closeCurrentDiplomacyProject(closeToDiploHub) {
    if (this.currentProjectReactionRequest && closeToDiploHub == false) {
      const request = this.currentProjectReactionRequest;
      this.currentProjectReactionRequest = null;
      DisplayQueueManager.close(request);
    } else if (this.currentProjectReactionRequest) {
      InterfaceMode.switchTo("INTERFACEMODE_DIPLOMACY_HUB");
    }
  }
  addCurrentDiplomacyProject(request) {
    if (request) {
      DiplomacyProjectManager.addDisplayRequest(request);
    }
  }
  // Handle deal a related statement
  // Returns true if the statement was handled and no further processing is needed
  handleDealStatement(data) {
    if (data.values.DealAction && data.values.DealAction != -1) {
      if (data.values.RespondingToDealAction && data.values.RespondingToDealAction == DiplomacyDealProposalActions.INSPECT) {
        window.dispatchEvent(new DiplomacyDealProposalResponseEvent(data));
        return true;
      }
      if (data.values.DealAction == DiplomacyDealProposalActions.ACCEPTED || data.values.DealAction == DiplomacyDealProposalActions.REJECTED) {
        return false;
      }
      const newDealData = {
        SessionID: data.sessionId,
        OtherPlayer: data.values.FromPlayer,
        //Incoming deal has already been switched to an outgoing deal for player response
        WorkingDealID: {
          direction: DiplomacyDealDirection.OUTGOING,
          player1: GameContext.localPlayerID,
          player2: data.values.FromPlayer
        },
        DealAction: data.values.DealAction
      };
      DiplomacyDealManager.addDisplayRequest(newDealData);
      return true;
    }
    return false;
  }
  // ------------------------------------------------------------------------
  // Handle the diplomacy statement
  onDiplomacyStatement(data) {
    if (data.values && data.values.ToPlayer == GameContext.localPlayerID) {
      if (this.handleDealStatement(data)) {
        return;
      }
      const player = Players.get(data.values.FromPlayer);
      if (player != null) {
        if (player.isIndependent) {
          return;
        }
      }
      const diplomacyDialogData = this.buildDialogData(data);
      const foundDialogRequests = DisplayQueueManager.findAll(
        (p) => p.SessionID === data.sessionId
      );
      if (foundDialogRequests.length > 0) {
        for (const foundRequest of foundDialogRequests) {
          Object.assign(foundRequest, data);
          if (foundRequest == this.currentDiplomacyDialogData) {
            window.dispatchEvent(new CustomEvent("diplomacy-dialog-update-response"));
          }
        }
      } else {
        DiplomacyDialogManager.addDisplayRequest(diplomacyDialogData);
      }
    }
  }
  // ------------------------------------------------------------------------
  // Handle a close event from a session
  onDiplomacySessionClosed(data) {
    if (data.sessionId) {
      const foundDialogRequests = DisplayQueueManager.findAll(
        (p) => p.SessionID === data.sessionId
      );
      if (foundDialogRequests.length > 0) {
        for (const foundRequest of foundDialogRequests) {
          if (foundRequest == this.currentDiplomacyDialogData || foundRequest.category == "DiplomacyDeal" && InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL")) {
            window.dispatchEvent(new CustomEvent("diplomacy-dialog-request-close"));
          }
        }
      }
    }
  }
  // ------------------------------------------------------------------------
  closeCurrentDiplomacyDialog() {
    if (this.currentDiplomacyDialogData) {
      if (Configuration.getXR()) {
        console.warn("Calling Game.DiplomacySessions.closeSession()");
      }
      Game.DiplomacySessions.closeSession(this.currentDiplomacyDialogData.SessionID);
      DisplayQueueManager.close(this.currentDiplomacyDialogData);
      if (this.currentProjectReactionRequest) {
        DisplayQueueManager.close(this.currentProjectReactionRequest);
      }
      this.currentDiplomacyDialogData = null;
    }
  }
  // ------------------------------------------------------------------------
  // Take a diplomacy statement event, and pull out some information into
  // a DiplomacyDialogData structure that we can use to drive the dialog.
  buildDialogData(data) {
    const statementFrame = this.getStatementFrame(data);
    const messageString = this.buildMessageString(data, statementFrame);
    const diplomacyMessageChoices = this.getChoices(statementFrame, data.actingPlayer);
    const otherPlayer = data.values.FromPlayer == GameContext.localPlayerID ? data.values.ToPlayer : data.values.FromPlayer;
    const diplomacyDialogData = {
      Message: messageString,
      Choices: diplomacyMessageChoices,
      SessionID: data.sessionId,
      OtherPlayerID: otherPlayer,
      InitiatingPlayerID: data.values.Initiator,
      StatementTypeDef: GameInfo.DiplomacyStatements.lookup(data.values.StatementType),
      StatementFrameDef: statementFrame,
      FocusID: data.values.FocusID
    };
    if (data.values.DealAction) {
      diplomacyDialogData.DealAction = data.values.DealAction;
    }
    const sStatementTypeName = Game.DiplomacySessions.getKeyNameOrNumber(data.values.StatementType);
    if (sStatementTypeName) {
      if (sStatementTypeName == "DECLARE_SURPRISE_WAR") {
        UI.sendAudioEvent(Audio.getSoundTag("data-audio-leader-war-declared", "leader-panel"));
      } else if (sStatementTypeName == "MAKE_DEAL") {
        UI.sendAudioEvent(Audio.getSoundTag("data-audio-leader-peace-proposed", "leader-panel"));
      }
    }
    return diplomacyDialogData;
  }
  // ------------------------------------------------------------------------
  buildMessageString(data, statementFrame) {
    const statementDef = GameInfo.DiplomacyStatements.lookup(data.values.StatementType);
    if (!statementDef) {
      console.error(
        "diplomacy-manager: Unable to get diplomacy statement definition during buildMessageString()"
      );
      this.closeCurrentDiplomacyDialog();
      return "";
    }
    const otherPlayer = Players.get(data.values.FromPlayer);
    if (!otherPlayer) {
      console.error(
        "diplomacy-manager: Unable to get playerLibrary for from player ( player ID: " + data.values.FromPlayer + ") during buildMessageString()"
      );
      this.closeCurrentDiplomacyDialog();
      return "";
    }
    const otherLeader = GameInfo.Leaders.lookup(otherPlayer.leaderType);
    if (!otherLeader) {
      console.error(
        "diplomacy-manager: Unable to get leader leaderDefinition for from player ( player ID: " + data.values.FromPlayer + ") during buildMessageString()"
      );
      this.closeCurrentDiplomacyDialog();
      return "";
    }
    const statementType = Game.DiplomacySessions.getKeyNameOrNumber(data.values.StatementType);
    const messageType = this.getResponseTypeName(data.values.ResponseType);
    const otherLeaderName = otherLeader.LeaderType;
    const baseDiplomacyMessageString = statementFrame && statementFrame.Text ? statementFrame.Text : "LOC_DIPLO_" + statementType;
    if (data.values.DealAction == DiplomacyDealProposalActions.ACCEPTED) {
      if (Locale.keyExists(baseDiplomacyMessageString + "_ACCEPTED_" + otherLeaderName)) {
        return Locale.compose(baseDiplomacyMessageString + "_ACCEPTED_" + otherLeaderName);
      } else {
        return Locale.compose(baseDiplomacyMessageString + "_ACCEPTED_GENERIC");
      }
    } else if (data.values.DealAction == DiplomacyDealProposalActions.REJECTED) {
      if (Locale.keyExists(baseDiplomacyMessageString + "_REJECTED_" + otherLeaderName)) {
        return Locale.compose(baseDiplomacyMessageString + "_REJECTED_" + otherLeaderName);
      } else {
        return Locale.compose(baseDiplomacyMessageString + "_REJECTED_GENERIC");
      }
    }
    let diplomacyMessageString = baseDiplomacyMessageString + "_" + otherLeaderName + "_" + messageType;
    if (Locale.keyExists(diplomacyMessageString)) {
      return Locale.compose(diplomacyMessageString);
    }
    diplomacyMessageString = baseDiplomacyMessageString + "_ANY_" + messageType;
    if (Locale.keyExists(diplomacyMessageString)) {
      return Locale.compose(diplomacyMessageString);
    }
    diplomacyMessageString = baseDiplomacyMessageString + "_" + otherLeaderName + "_ANY";
    if (Locale.keyExists(diplomacyMessageString)) {
      return Locale.compose(diplomacyMessageString);
    }
    diplomacyMessageString = baseDiplomacyMessageString + "_GENERIC";
    return Locale.compose(diplomacyMessageString);
  }
  getResponseTypeName(responseTypeHash) {
    const str = Game.DiplomacySessions.getKeyName(responseTypeHash);
    if (str) {
      return str;
    }
    return "ANY";
  }
  getStatementFrame(data) {
    const sStatementTypeName = Game.DiplomacySessions.getKeyNameOrNumber(data.values.StatementType);
    const sResponseTypeName = Game.DiplomacySessions.getKeyNameOrNumber(data.values.ResponseType);
    const statementFrame = GameInfo.DiplomacyStatementFrames.find(
      (v) => v.Type == sStatementTypeName && v.Frame == sResponseTypeName
    );
    return statementFrame;
  }
  getChoices(statementFrame, actingPlayer) {
    const choices = [];
    if (statementFrame) {
      if (statementFrame.Selections) {
        const selections = GameInfo.DiplomacyStatementSelections.filter(
          (v) => v.Type == statementFrame.Selections
        );
        selections.sort((a, b) => a.Sort - b.Sort);
        selections.forEach((selection) => {
          const choiceCallback = () => {
            if (this.isFirstMeetDiplomacyOpen) {
              window.dispatchEvent(new CustomEvent("diplomacy-first-meet-continue"));
            }
            if (this.isDeclareWarDiplomacyOpen) {
              this._isDeclareWarDiplomacyOpen = false;
              this.closeCurrentDiplomacyDialog();
            } else {
              setTimeout(() => {
                this.closeCurrentDiplomacyDialog();
              }, 2e3);
              LeaderModelManager.beginAcknowledgePlayerSequence();
            }
          };
          const choice = {
            ChoiceString: selection.Text,
            ChoiceType: selection.Key,
            Callback: choiceCallback
          };
          choices.push(choice);
        });
      }
      if (statementFrame.Selections?.includes("FIRST_MEET")) {
        const choiceCallback = () => {
          if (!this._isFirstMeetDiplomacyOpen) {
            this._selectedPlayerID = actingPlayer;
            this._isFirstMeetDiplomacyOpen = true;
          }
        };
        const choice = {
          ChoiceString: Locale.compose("LOC_DIPLOMACY_OPEN_DIPLOMACY"),
          ChoiceType: "CHOICE_ACKNOWLEDGE",
          Callback: choiceCallback
        };
        choices.push(choice);
      } else if (statementFrame.Selections == "CHOICES_DECLARE_WAR") {
        const choiceCallback = () => {
          let warID = -1;
          const jointEvents = Game.Diplomacy.getJointEvents(
            GameContext.localPlayerID,
            actingPlayer,
            false
          );
          if (jointEvents.length > 0) {
            jointEvents.forEach((jointEvent) => {
              if (jointEvent.actionTypeName == "DIPLOMACY_ACTION_DECLARE_WAR") {
                warID = jointEvent.uniqueID;
              }
            });
          }
          this.selectedActionID = warID;
          ContextManager.push("screen-diplomacy-action-details", { singleton: true, createMouseGuard: true });
          window.addEventListener("diplomacy-action-details-closed", this.actionDetailsClosedListener);
        };
        const choice = {
          ChoiceString: Locale.compose("LOC_DIPLOMACY_OPEN_WAR_DETAILS"),
          ChoiceType: "CHOICE_ACKNOWLEDGE",
          Callback: choiceCallback
        };
        choices.push(choice);
      }
    }
    if (choices.length <= 0) {
      const defaultChoiceCallback = () => {
        LeaderModelManager.beginAcknowledgePlayerSequence();
        setTimeout(() => {
          this.closeCurrentDiplomacyDialog();
        }, 2e3);
      };
      const defaultChoice = {
        ChoiceString: Locale.compose("LOC_DIPLO_GENERIC_EXIT"),
        ChoiceType: "CHOICE_EXIT",
        Callback: defaultChoiceCallback
      };
      choices.push(defaultChoice);
    }
    return choices;
  }
  onActionDetailsClosed() {
    window.removeEventListener("diplomacy-action-details-closed", this.actionDetailsClosedListener);
    this.closeCurrentDiplomacyDialog();
  }
  //Get the localized string corresponding to a specific dialog choice
  // private buildChoiceString(choiceTypeName: string, statementFrame: DiplomacyStatementFrameDefinition | undefined): string {
  // 	if (!statementFrame) {
  // 		console.error("diplomacy-manager: Unable to get diplomacy statement frame definition during buildChoiceString()");
  // 		this.closeCurrentDiplomacyDialog();
  // 		return "";
  // 	}
  // 	const baseChoiceString: string = "LOC_DIPLO_" + statementFrame.Type + "_CHOICE_";
  // 	let choiceString: string = baseChoiceString + choiceTypeName;
  // 	if (Locale.keyExists(choiceString)) {
  // 		return Locale.compose(choiceString);
  // 	}
  // 	choiceString = baseChoiceString + "GENERIC";
  // 	return Locale.compose(choiceString);
  // }
  populateDiplomacyActions() {
    this._diplomacyActions = [];
    const player = Players.get(GameContext.localPlayerID);
    if (player === null) {
      console.error(
        "diplomacy-manager: Attempting to populate available diplomatic actions, but no valid player library!"
      );
      return;
    }
    const playerDiplomacy = player.Diplomacy;
    if (playerDiplomacy == void 0) {
      console.error(
        "diplomacy-manager: Attempting to populate available diplomatic actions, but no valid player diplomacy library!"
      );
      return;
    }
    if (Players.isValid(this._selectedPlayerID) == false) {
      return;
    }
    const thisPlayerID = GameContext.localPlayerID;
    const allianceArgs = {
      Player1: thisPlayerID,
      Player2: this._selectedPlayerID,
      Type: DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE
    };
    let allianceCaption = Locale.compose("LOC_DIPLOMACY_ACTION_FORM_ALLIANCE_NAME");
    let allianceOperationType = PlayerOperationTypes.FORM_ALLIANCE;
    let allianceResults = Game.PlayerOperations.canStart(
      thisPlayerID,
      allianceOperationType,
      allianceArgs,
      false
    );
    if (!allianceResults.Success) {
      const localPlayerDiplomacy = Players.get(thisPlayerID)?.Diplomacy;
      if (localPlayerDiplomacy === void 0) {
        console.error(
          "diplomacy-manager: Unable to get local player diplomacy library while updating available actions!"
        );
        return;
      }
      if (localPlayerDiplomacy.hasAllied(this._selectedPlayerID)) {
        allianceCaption = Locale.compose("LOC_DIPLOMACY_ACTION_CANCEL_ALLIANCE_NAME");
        allianceOperationType = PlayerOperationTypes.CANCEL_ALLIANCE;
        allianceResults = Game.PlayerOperations.canStart(
          thisPlayerID,
          allianceOperationType,
          allianceArgs,
          false
        );
      }
    }
    const peaceQueryResults = playerDiplomacy.canMakePeaceWith(this._selectedPlayerID);
    let peaceFailureTooltip = "";
    peaceQueryResults.FailureReasons?.forEach((failureReason) => {
      peaceFailureTooltip += failureReason;
    });
    if (peaceQueryResults.Success == true) {
      if (Game.DiplomacyDeals.hasPendingDeal(thisPlayerID, this._selectedPlayerID) == true) {
        peaceQueryResults.Success = false;
        peaceFailureTooltip += Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_IS_PENDING");
      }
    }
    const warQueryResults = playerDiplomacy.canDeclareWarOn(this._selectedPlayerID);
    let warFailureTooltip = "";
    warQueryResults.FailureReasons?.forEach((failureReason) => {
      warFailureTooltip += failureReason;
    });
    if (warFailureTooltip == "" && !player.isTurnActive) {
      warFailureTooltip = Locale.compose("LOC_DIPLOMACY_WAR_NOT_YOUR_TURN");
    }
    if (peaceFailureTooltip == "" && !player.isTurnActive) {
      peaceFailureTooltip = Locale.compose("LOC_DIPLOMACY_PEACE_NOT_YOUR_TURN");
    }
    const isIndependent = Players.get(this._selectedPlayerID)?.isIndependent;
    const isMajor = Players.get(this._selectedPlayerID)?.isMajor;
    const declareWarCallback = () => {
      if (isIndependent) {
        const dbCallback = (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.confirmDeclareWar(
              this._selectedPlayerID,
              DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR
            );
          }
        };
        const otherLeaderName = Locale.compose(Players.get(this._selectedPlayerID)?.name);
        DialogBoxManager.createDialog_ConfirmCancel({
          body: Locale.compose("LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_BODY", otherLeaderName),
          title: "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_TITLE",
          displayQueue: "DiplomacyDialog",
          callback: dbCallback
        });
      } else {
        this.raiseWarTypePopup(this._selectedPlayerID);
      }
    };
    const tempDeclareWarAction = {
      actionString: Locale.compose("LOC_DIPLOMACY_ACTION_DECLARE_WAR_NAME"),
      available: warQueryResults.Success && player.isTurnActive && player.Diplomacy != void 0 && player.Diplomacy.hasMet(this._selectedPlayerID),
      Callback: declareWarCallback,
      disabledTooltip: warFailureTooltip,
      bigButton: true,
      action: 0 /* DECLARE_WAR */
    };
    const makePeaceCallback = () => {
      if (!peaceQueryResults.Success) {
        return;
      }
      InterfaceMode.switchTo("INTERFACEMODE_PEACE_DEAL");
    };
    const tempMakePeaceAction = {
      actionString: Locale.compose("LOC_DIPLOMACY_ACTION_PROPOSE_PEACE_NAME"),
      available: peaceQueryResults.Success && isMajor != void 0 && isMajor && player.isTurnActive,
      Callback: makePeaceCallback,
      disabledTooltip: peaceFailureTooltip,
      audioString: "data-audio-propose-peace-release",
      action: 1 /* DECLARE_PEACE */
    };
    if (playerDiplomacy.isAtWarWith(this._selectedPlayerID)) {
      this._diplomacyActions.push(tempMakePeaceAction);
    } else if (!isIndependent) {
      const formAllianceAction = {
        actionString: allianceCaption,
        available: allianceResults.Success && player.isTurnActive,
        Callback: () => {
          this.raiseAlliancePopup(thisPlayerID, this._selectedPlayerID, allianceOperationType, allianceArgs);
        },
        disabledTooltip: allianceResults.FailureReasons != void 0 && allianceResults.FailureReasons.length > 0 ? allianceResults.FailureReasons[0] : Locale.compose("LOC_DIPLOMACY_ACTION_FORM_ALLIANCE_DISABLED"),
        action: 2 /* FORM_ALLIANCE */
      };
      if (allianceOperationType == PlayerOperationTypes.FORM_ALLIANCE) {
        formAllianceAction.audioString = "data-audio-leader-form-alliance";
      } else if (allianceOperationType == PlayerOperationTypes.CANCEL_ALLIANCE) {
        formAllianceAction.audioString = "data-audio-leader-cancel-alliance";
      }
      this._diplomacyActions.push(formAllianceAction);
    }
    this._diplomacyActions.push(tempDeclareWarAction);
  }
  confirmDeclareWar(playerID, warType) {
    const args = {
      Player1: GameContext.localPlayerID,
      Player2: playerID,
      Type: warType
    };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.DECLARE_WAR,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.DECLARE_WAR, args);
    }
    this._isDeclareWarDiplomacyOpen = true;
    this.closeCurrentDiplomacyDialog();
  }
  /**
   * Starts the process of a war between to Civilizations (or a Civivilization and IP) from the world.
   * @param warDeclarationTarget target for declaring war
   * @param postDeclareWarAction callback for when war is declared.
   * @returns true if handled, false otherwise
   */
  startWarFromMap(warDeclarationTarget, postDeclareWarAction) {
    const args = {
      Player1: GameContext.localPlayerID,
      Player2: warDeclarationTarget.player,
      Type: DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR
    };
    const playerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    if (playerDiplomacy == void 0) {
      console.error(
        "diplomacy-manager: Attempting to raise war type popup, but no valid player diplomacy library!"
      );
      return false;
    }
    const surpriseWarResults = playerDiplomacy.canDeclareWarOn(warDeclarationTarget.player);
    if (!surpriseWarResults.Success) {
      return false;
    }
    const targetPlayer = Players.get(warDeclarationTarget.player);
    if (targetPlayer == null) {
      console.error(`diplomacy-manager: The target player was null for player '${warDeclarationTarget.player}'`);
      return false;
    }
    if (targetPlayer.isIndependent) {
      const independentName = targetPlayer.civilizationFullName;
      if (!independentName) {
        console.error(
          "diplomacy-manager: No name for independent at index: " + warDeclarationTarget.independentIndex
        );
        return false;
      }
      const dbCallback = (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          this._selectedPlayerID = warDeclarationTarget.player;
          Game.PlayerOperations.sendRequest(
            GameContext.localPlayerID,
            PlayerOperationTypes.DECLARE_WAR,
            args
          );
          postDeclareWarAction();
        }
      };
      DialogBoxManager.createDialog_ConfirmCancel({
        body: Locale.compose(
          "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_ON_INDEPENDENT_BODY",
          Locale.compose(independentName)
        ),
        title: Locale.compose("LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_ON_INDEPENDENT_TITLE"),
        displayQueue: "DiplomacyDialog",
        callback: dbCallback
      });
    } else {
      if (Players.get(warDeclarationTarget.player)?.isMinor) {
        const cityStatePlayer = Players.get(warDeclarationTarget.player);
        if (!cityStatePlayer) {
          console.error(
            "diplomacy-manager: Unable to get PlayerLibrary for suzerain of city-state with id " + warDeclarationTarget.player
          );
          return false;
        }
        if (!cityStatePlayer.Influence) {
          console.error(
            "diplomacy-manager: Unable to get PlayerInfluence object for city-state with id " + warDeclarationTarget.player
          );
          return false;
        }
        if (cityStatePlayer.Influence.getSuzerain() == GameContext.localPlayerID) {
          return false;
        } else {
          const suzerainPlayer = Players.get(cityStatePlayer.Influence.getSuzerain());
          if (!suzerainPlayer) {
            console.error(
              "diplomacy-manager: Unable to get PlayerLibrary for suzerain of city-state with id " + warDeclarationTarget.player
            );
            return false;
          }
          return this.raiseWarTypePopup(
            suzerainPlayer.id,
            Locale.compose(
              "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_FROM_MAP_SUZERAIN_BODY",
              Locale.compose(cityStatePlayer.civilizationFullName),
              Locale.compose(suzerainPlayer.name)
            ),
            postDeclareWarAction
          );
        }
      }
      const otherLeaderName = Players.get(warDeclarationTarget.player)?.name;
      if (otherLeaderName == void 0) {
        console.error(
          "diplomacy-manager: No name for player with id: " + warDeclarationTarget.player.toString()
        );
        return false;
      }
      return this.raiseWarTypePopup(
        warDeclarationTarget.player,
        Locale.compose("LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_FROM_MAP_BODY", otherLeaderName),
        postDeclareWarAction
      );
    }
    return true;
  }
  raiseAlliancePopup(currPlayerId, selectedPlayerId, allianceOperationType, allianceOperationArgs) {
    if (allianceOperationType === PlayerOperationTypes.CANCEL_ALLIANCE) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, allianceOperationType, allianceOperationArgs);
      return;
    }
    const allyPlayer = Players.get(selectedPlayerId);
    if (!allyPlayer) {
      console.error("diplomacy-manager: Failed to get ally player library");
      return;
    }
    const potentialEnemies = Players.getAliveMajorIds().filter(
      (playerId) => allyPlayer.Diplomacy && allyPlayer.Diplomacy.isAtWarWith(playerId)
    );
    if (potentialEnemies.length === 0) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, allianceOperationType, allianceOperationArgs);
      return;
    }
    const currPlayer = Players.get(currPlayerId);
    if (!currPlayer) {
      console.error("diplomacy-manager: Failed to get current player library");
      return;
    }
    const playerDiplomacy = currPlayer.Diplomacy;
    if (!playerDiplomacy) {
      console.error(
        "diplomacy-manager: Attempting to raise alliance popup, but no valid player diplomacy library!"
      );
      return;
    }
    const acceptCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          allianceOperationType,
          allianceOperationArgs
        );
      }
    };
    const alliancePopupWrapper = document.createElement("fxs-vslot");
    const customContent = document.createElement("fxs-vslot");
    const customTitle = document.createElement("fxs-header");
    customTitle.setAttribute("filigree-style", "small");
    customTitle.setAttribute("title", Locale.compose("LOC_DIPLOMACY_ACTION_FORM_ALLIANCE_NAME").toUpperCase());
    customTitle.classList.add("uppercase", "-mt-4", "panel-diplomacy-declare-war__custom-header");
    customTitle.classList.add("font-title", "text-lg", "tracking-100");
    const customText = document.createElement("fxs-inner-frame");
    customText.classList.add("mt-4", "p-4", "items-start", "max-w-128");
    customText.innerHTML = `
			<span class="mb-2">${Locale.stylize("LOC_DIPLOMACY_PICK_ALLIANCE_BODY_1", allyPlayer.name)}</span>
			<span>${Locale.stylize("LOC_DIPLOMACY_PICK_ALLIANCE_BODY_2")}</span>
		`;
    customContent.appendChild(customTitle);
    customContent.appendChild(customText);
    const portraitContainer = document.createElement("div");
    portraitContainer.classList.add("flex", "flex-row", "justify-center", "w-full", "mt-2");
    potentialEnemies.forEach((playerId) => {
      const newEnemy = Players.get(playerId);
      const localPlayerDiplomacy = currPlayer.Diplomacy;
      if (newEnemy) {
        const iconURL = Icon.getLeaderPortraitIcon(newEnemy.leaderType);
        const portrait = document.createElement("div");
        portrait.classList.add("panel-diplomacy-actions__ongoing-action-portrait", "pointer-events-auto");
        const portraitBG = document.createElement("div");
        portraitBG.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-bg");
        portrait.appendChild(portraitBG);
        const portraitBGInner = document.createElement("div");
        portraitBGInner.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-bg-inner");
        portrait.appendChild(portraitBGInner);
        if (localPlayerDiplomacy) {
          const portraitIcon = document.createElement("div");
          portraitIcon.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-image");
          if (localPlayerDiplomacy.hasMet(playerId)) {
            portraitIcon.style.backgroundImage = `url(${iconURL})`;
          } else {
            portraitIcon.style.backgroundImage = `url("blp:leader_portrait_unknown.png")`;
          }
          portrait.appendChild(portraitIcon);
          portraitContainer.appendChild(portrait);
        } else {
          console.error(`diplomacy-manager: raiseAlliancePopup - no local player diplomacy library found!`);
          return;
        }
      }
    });
    customContent.appendChild(portraitContainer);
    alliancePopupWrapper.appendChild(customContent);
    alliancePopupWrapper.classList.add("h-3\\/4", "pl-40", "relative");
    const alliancePopupImageWrapper = document.createElement("fxs-vslot");
    alliancePopupImageWrapper.classList.add("w-1\\/3", "-top-26", "-left-22", "absolute");
    const shieldImage = document.createElement("div");
    shieldImage.classList.add("screen-dialog-box__declare-war-shield-bg", "size-72", "bg-cover", "bg-no-repeat");
    alliancePopupImageWrapper.appendChild(shieldImage);
    const formAllianceTitle = Locale.compose("LOC_DIPLOMACY_ACTION_FORM_ALLIANCE_NAME").toUpperCase();
    DialogBoxManager.createDialog_CustomOptions({
      title: formAllianceTitle,
      canClose: true,
      displayQueue: "DiplomacyDialog",
      custom: true,
      styles: true,
      options: [
        {
          actions: ["accept"],
          label: formAllianceTitle,
          callback: acceptCallback
        },
        {
          actions: ["cancel", "keyboard-escape"],
          label: Locale.compose("LOC_DIPLOMACY_DEAL_CANCEL").toUpperCase()
        }
      ],
      customOptions: [
        {
          layoutBodyWrapper: alliancePopupWrapper,
          layoutImageWrapper: alliancePopupImageWrapper
        }
      ]
    });
  }
  raiseWarTypePopup(targetPlayerID, bodyString, postDeclareWarAction) {
    const playerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    if (playerDiplomacy == void 0) {
      console.error(
        "diplomacy-manager: Attempting to raise war type popup, but no valid player diplomacy library!"
      );
      return false;
    }
    const surpriseWarCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        this.confirmDeclareWar(targetPlayerID, DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR);
        if (postDeclareWarAction) {
          postDeclareWarAction();
        }
      }
    };
    const formalWarCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        this.confirmDeclareWar(targetPlayerID, DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_FORMAL_WAR);
        if (postDeclareWarAction) {
          postDeclareWarAction();
        }
      }
    };
    const surpriseWarResults = playerDiplomacy.canDeclareWarOn(targetPlayerID);
    const formalWarResults = playerDiplomacy.canDeclareWarOn(
      targetPlayerID,
      WarTypes.FORMAL_WAR
    );
    const ourWarSupport = playerDiplomacy.getTotalWarSupportBonusForPlayer(
      targetPlayerID,
      formalWarResults.Success
    );
    const theirWarSupport = playerDiplomacy.getTotalWarSupportBonusForTarget(
      targetPlayerID,
      formalWarResults.Success
    );
    const theirInfluenceBonus = playerDiplomacy.getWarInfluenceBonusTarget(
      targetPlayerID,
      formalWarResults.Success
    );
    const declareWarWrapper = document.createElement("fxs-vslot");
    const customContent = document.createElement("fxs-vslot");
    const customTitle = document.createElement("fxs-header");
    customTitle.setAttribute("filigree-style", "small");
    customTitle.setAttribute("title", "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_TITLE");
    customTitle.classList.add("uppercase", "-mt-4", "panel-diplomacy-declare-war__custom-header");
    customTitle.classList.add("font-title", "text-lg", "tracking-100");
    const customTextFormal = document.createElement("fxs-inner-frame");
    customTextFormal.classList.add("mt-4", "p-4", "items-start");
    customTextFormal.innerHTML = Locale.stylize(
      "LOC_DIPLOMACY_PICK_WAR_TYPE_FORMAL_BODY",
      ourWarSupport,
      theirWarSupport,
      theirInfluenceBonus
    );
    const customTextSurprise = document.createElement("fxs-inner-frame");
    customTextSurprise.classList.add("mt-4", "p-4", "items-start");
    customTextSurprise.innerHTML = Locale.stylize(
      "LOC_DIPLOMACY_PICK_WAR_TYPE_SURPRISE_BODY",
      ourWarSupport,
      theirWarSupport,
      theirInfluenceBonus
    );
    customContent.appendChild(customTitle);
    if (formalWarResults.Success == true) {
      customContent.appendChild(customTextFormal);
    } else {
      customContent.appendChild(customTextSurprise);
    }
    declareWarWrapper.appendChild(customContent);
    declareWarWrapper.classList.add("h-3\\/4", "pl-40", "relative");
    const declareWarImageWrapper = document.createElement("fxs-vslot");
    declareWarImageWrapper.classList.add("w-1\\/3", "-top-26", "-left-22", "absolute");
    const shieldImage = document.createElement("div");
    shieldImage.classList.add("screen-dialog-box__declare-war-shield-bg", "size-72", "bg-cover", "bg-no-repeat");
    declareWarImageWrapper.appendChild(shieldImage);
    const chooserButton = document.createElement("chooser-item");
    chooserButton.classList.add(
      "panel-diplomacy-declare-war__button-declare-war",
      "chooser-item_unlocked",
      "w-1\\/2",
      "min-h-16",
      "flow-row",
      "items-center"
    );
    chooserButton.classList.add("mr-4");
    chooserButton.setAttribute("disabled", "false");
    if (formalWarResults.FailureReasons) {
      if (formalWarResults.FailureReasons[0] != "") {
        chooserButton.setAttribute("data-tooltip-content", formalWarResults.FailureReasons[0]);
      } else {
        chooserButton.setAttribute(
          "data-tooltip-content",
          Locale.stylize(
            "LOC_DIPLOMACY_BONUS_WAR_SUPPORT",
            ourWarSupport,
            theirWarSupport,
            theirInfluenceBonus
          )
        );
      }
    } else {
      chooserButton.setAttribute(
        "data-tooltip-content",
        Locale.stylize("LOC_DIPLOMACY_BONUS_WAR_SUPPORT", ourWarSupport, theirWarSupport, theirInfluenceBonus)
      );
    }
    waitForLayout(() => chooserButton.removeAttribute("tabindex"));
    const radialBG = document.createElement("div");
    radialBG.classList.add(
      "panel-diplomacy-declare-war__radial-bg",
      "absolute",
      "bg-cover",
      "size-16",
      "group-focus\\:opacity-0",
      "group-hover\\:opacity-0",
      "group-active\\:opacity-0",
      "opacity-1"
    );
    const radialBGHover = document.createElement("div");
    radialBGHover.classList.add(
      "panel-diplomacy-declare-war__radial-bg-hover",
      "absolute",
      "opacity-0",
      "bg-cover",
      "size-16",
      "group-focus\\:opacity-100",
      "group-hover\\:opacity-100",
      "group-active\\:opacity-100"
    );
    chooserButton.appendChild(radialBG);
    chooserButton.appendChild(radialBGHover);
    const declareWarIconWrapper = document.createElement("div");
    declareWarIconWrapper.classList.add(
      "flex",
      "size-16",
      "justify-center",
      "items-center",
      "panel-diplomacy-declare-war__war-icon-wrapper"
    );
    const declareWarIcon = document.createElement("img");
    declareWarIcon.classList.add("flex", "relative", "size-12");
    if (formalWarResults.Success == true) {
      declareWarIcon.setAttribute("src", UI.getIconURL("DIPLOMACY_DECLARE_FORMAL_WAR_ICON"));
    } else {
      declareWarIcon.setAttribute("src", UI.getIconURL("DIPLOMACY_DECLARE_SURPRISE_WAR_ICON"));
    }
    declareWarIconWrapper.appendChild(declareWarIcon);
    chooserButton.appendChild(declareWarIconWrapper);
    const declareWarDescription = document.createElement("div");
    declareWarDescription.classList.add(
      "relative",
      "ml-2",
      "flex",
      "flex-auto",
      "flex-col",
      "self-center",
      "font-title",
      "uppercase",
      "font-normal",
      "tracking-100"
    );
    if (formalWarResults.Success == true) {
      declareWarDescription.setAttribute("data-l10n-id", "LOC_DIPLOMACY_FORMAL_WAR");
    } else {
      declareWarDescription.setAttribute("data-l10n-id", "LOC_DIPLOMACY_SURPRISE_WAR");
    }
    const warCostWrapper = document.createElement("div");
    warCostWrapper.classList.add(
      "panel-diplomacy-declare-war__cost-wrapper",
      "text-xs",
      "font-body",
      "text-center",
      "flow-row"
    );
    const warCost = document.createElement("div");
    warCost.classList.value = "font-body self-center";
    warCost.setAttribute("data-l10n-id", "LOC_DIPLOMACY_WAR_COST");
    chooserButton.appendChild(declareWarDescription);
    if (formalWarResults.Success == true) {
      DialogBoxManager.createDialog_CustomOptions({
        body: bodyString ? bodyString : Locale.compose(
          "LOC_DIPLOMACY_PICK_WAR_TYPE_FORMAL_BODY",
          ourWarSupport,
          theirWarSupport,
          theirInfluenceBonus
        ),
        title: "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_TITLE",
        canClose: true,
        displayQueue: "DiplomacyDialog",
        custom: true,
        styles: true,
        name: "declare-war",
        options: [
          {
            actions: [],
            label: Locale.stylize("LOC_DIPLOMACY_FORMAL_WAR"),
            callback: formalWarCallback,
            disabled: !formalWarResults.Success,
            tooltip: formalWarResults.FailureReasons != void 0 && formalWarResults.FailureReasons.length > 0 ? formalWarResults.FailureReasons[0] : void 0
          }
        ],
        customOptions: [
          {
            layoutBodyWrapper: declareWarWrapper,
            layoutImageWrapper: declareWarImageWrapper,
            useChooserItem: true,
            chooserInfo: chooserButton,
            cancelChooser: true
          }
        ]
      });
    } else {
      DialogBoxManager.createDialog_CustomOptions({
        body: bodyString ? bodyString : Locale.compose(
          "LOC_DIPLOMACY_PICK_WAR_TYPE_SURPRISE_BODY",
          ourWarSupport,
          theirWarSupport,
          theirInfluenceBonus
        ),
        title: "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_TITLE",
        canClose: true,
        displayQueue: "DiplomacyDialog",
        custom: true,
        styles: true,
        name: "declare-war",
        options: [
          {
            actions: [],
            label: Locale.stylize("LOC_DIPLOMACY_SURPRISE_WAR"),
            callback: surpriseWarCallback,
            disabled: !surpriseWarResults.Success,
            tooltip: surpriseWarResults.FailureReasons != void 0 && surpriseWarResults.FailureReasons.length > 0 ? surpriseWarResults.FailureReasons[0] : void 0
          }
        ],
        customOptions: [
          {
            layoutBodyWrapper: declareWarWrapper,
            layoutImageWrapper: declareWarImageWrapper,
            useChooserItem: true,
            chooserInfo: chooserButton,
            cancelChooser: true
          }
        ]
      });
    }
    return true;
  }
  clickStartProject(projectData) {
    this._selectedProjectData = projectData;
    ContextManager.push("screen-diplomacy-target-select", { createMouseGuard: true, singleton: true });
  }
  getRelationshipTypeString(relationship) {
    switch (relationship) {
      case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_FRIENDLY:
        return "PLAYER_RELATIONSHIP_FRIENDLY";
      case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HELPFUL:
        return "PLAYER_RELATIONSHIP_HELPFUL";
      case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNFRIENDLY:
        return "PLAYER_RELATIONSHIP_UNFRIENDLY";
      case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE:
        return "PLAYER_RELATIONSHIP_HOSTILE";
      case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_NEUTRAL:
        return "PLAYER_RELATIONSHIP_NEUTRAL";
      default:
        return "";
    }
  }
  onFirstMeetReactionClosed() {
    setTimeout(() => {
      this.closeCurrentDiplomacyDialog();
    }, 2e3);
    LeaderModelManager.beginAcknowledgePlayerSequence();
  }
  getAudioIdForDiploAction(projectData) {
    switch (projectData.actionGroup) {
      case DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_TREATY:
        return ["data-audio-activate-ref", "data-audio-leader-treaty-select"];
      case DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_PROJECT:
        switch (projectData.actionType) {
          case DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN:
            return ["data-audio-activate-ref", "data-audio-befriend"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_INCITE_RAID:
            return ["data-audio-activate-ref", "data-audio-incite-raid"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_BECOME_SUZERAIN:
            return ["data-audio-activate-ref", "data-audio-suzerain"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_CS_PROMOTE_GROWTH:
            return ["data-audio-activate-ref", "data-audio-independent-promote-growth"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_CS_BOLSTER_MILITARY:
            return ["data-audio-activate-ref", "data-audio-bolster-military"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_CS_LEVY_UNIT:
            return ["data-audio-activate-ref", "data-audio-levy-unit"];
          case DiplomacyActionTypes.DIPLOMACY_ACTION_CS_INCORPORATE:
            return ["data-audio-activate-ref", "data-audio-citystate-incorporate"];
          default:
            return ["data-audio-activate-ref", "data-audio-leader-project-select"];
        }
      case DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ENDEAVOR:
        return ["data-audio-activate-ref", "data-audio-leader-endeavor-select"];
      case DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_SANCTION:
        return ["data-audio-activate-ref", "data-audio-leader-sanction-select"];
      case DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE:
        return ["data-audio-activate-ref", "data-audio-leader-espionage-select"];
      default:
        return ["data-audio-activate-ref", "data-audio-leader-project-select"];
    }
  }
}
const DiplomacyDialogManager = new DiplomacyDialogManagerImpl();
const DiplomacyDealManager = new DiplomacyDealManagerImpl();
const DiplomacyProjectManager = new DiplomacyProjectManagerImpl();
const DiplomacyManager = new DiplomacyManagerImpl();
DisplayQueueManager.registerHandler(DiplomacyProjectManager);
DisplayQueueManager.registerHandler(DiplomacyDialogManager);
DisplayQueueManager.registerHandler(DiplomacyDealManager);

export { DiplomacyDealManagerImpl, DiplomacyDealProposalResponseEvent, DiplomacyDealProposalResponseEventName, DiplomacyDialogManagerImpl, DiplomacyInputPanel, LeaderModelManager as L, TempDiplomacyActionType, DiplomacyManager as default };
//# sourceMappingURL=diplomacy-manager.js.map
