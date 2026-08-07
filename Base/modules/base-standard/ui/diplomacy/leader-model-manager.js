import { Layout } from '../../../core/ui/utilities/utilities-layout.js';

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
  leaderModelGroupLeft;
  leaderModelGroupRight;
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
  // SL: for animation deadzone locks
  inTransitionDeadZone = false;
  animationPaused = false;
  // These flags are used when an animation is started so that we know to ignore that animation change trigger
  leaderLeftAnimationJustStarted = false;
  leaderRightAnimationJustStarted = false;
  // Tracks the first meet player ID to avoid reloading the same leader
  lastFirstMeetPlayerId = -1;
  /************************************************************************************************************************/
  /**                        IF YOU CHANGE THIS, COORDINATE WITH GRAPHICS DEPARTMENT TO MOVE IT TO JSON                  **/
  /**                                          IF YOU DO NOT YOU WILL BREAK BENCHMARKING                                 **/
  /**                                         WHICH MAY CAUSE INGAME ASSETS TO BE BLURRY!                                **/
  /**                                                                                                                    **/
  /**/
  static OFF_CAMERA_DISTANCE = 130;
  // In World units                                             /**/ 
  /**/
  static CAMERA_SUBJECT_DISTANCE = 255;
  /**/
  /**/
  static CAMERA_DOLLY_ANIMATION_IN_DURATION = 1;
  /**/
  /**/
  static CAMERA_DOLLY_ANIMATION_OUT_DURATION = 0.55;
  /**/
  /**/
  static DECLARE_WAR_DOLLY_DISTANCE = 20;
  /**/
  /**/
  LEADER_EXIT_DURATION = LeaderModelManagerClass.CAMERA_DOLLY_ANIMATION_OUT_DURATION;
  // 0.6s     /**/ 
  /**/
  static DARKENING_VFX_POSITION = { x: 0, y: 110, z: 0 };
  /**/
  /**/
  static LEFT_MODEL_POSITION = { x: -11.5, y: 72, z: -13 };
  /**/
  /**/
  static LEFT_BANNER_POSITION = { x: -16, y: 85, z: 0 };
  /**/
  /**/
  static LEFT_BANNER_ANGLE = 45;
  /**/
  /**/
  static RIGHT_MODEL_POSITION = { x: 11.5, y: 72, z: -13 };
  /**/
  /**/
  static RIGHT_INDEPENDENT_MODEL_POSITION = { x: 7.7, y: 71.9, z: -23 };
  /**/
  /**/
  static RIGHT_INDEPENDENT_MODEL_SCALE = 0.7;
  /**/
  /**/
  static RIGHT_INDEPENDENT_MODEL_ANGLE = -32;
  /**/
  /**/
  static RIGHT_INDEPENDENT_BANNER_POSITION = { x: 15, y: 82, z: -15.5 };
  /**/
  /**/
  static RIGHT_INDEPENDENT_VIGNETTE_OFFSET = { x: 0, y: -4.25, z: -25 };
  /**/
  /**/
  static RIGHT_INDEPENDENT_CAMERA_OFFSET = { x: 0, y: 0, z: -30 };
  /**/
  /**/
  static RIGHT_MODEL_AT_WAR_POSITION = { x: 16.5, y: 72, z: -13 };
  /**/
  /**/
  static RIGHT_BANNER_POSITION = { x: 16, y: 85, z: 0 };
  /**/
  /**/
  static RIGHT_BANNER_ANGLE = -45;
  /**/
  /**/
  static BANNER_SCALE = 1.8;
  /**/
  /**/
  MAX_LENGTH_OF_ANIMATION_EXIT = 550;
  // 0.6 seconds                                              /**/ 
  /**/
  static FOREGROUND_CAMERA_IN_ID = Database.makeHash("leader-camera-in");
  /**/
  /**/
  static FOREGROUND_CAMERA_OUT_ID = Database.makeHash("leader-camera-out");
  /**/
  /**/
  static SCREEN_DARKENING_ASSET_NAME = "VFX_Diplomacy_Screen_Darkening";
  /**/
  /**/
  static TRIGGER_HASH_ANIMATION_STATE_END = WorldUI.hash("AnimationStateChange");
  /**/
  /**/
  static TRIGGER_HASH_SEQUENCE_TRIGGER = WorldUI.hash("SEQUENCE");
  /**/
  /**/
  // SL: determine break point of an animation no-transition period.                                               /**/ 
  /**/
  // Has to be hard-coded in leader animation file's action trigger.                                               /**/ 
  /**/
  static TRIGGER_NO_TRANSITION_START = WorldUI.hash("NO_TRANSITION_START");
  /**/
  /**/
  static TRIGGER_NO_TRANSITION_END = WorldUI.hash("NO_TRANSITION_END");
  /**/
  /**/
  /**/
  /**/
  static LEFT_MODEL_POSITION_SMALL_ASPECT_RATIO = { x: -9.5, y: 72, z: -13 };
  /**/
  /**/
  static LEFT_BANNER_POSITION_SMALL_ASPECT_RATIO = { x: -13, y: 85, z: 0 };
  /**/
  /**/
  static RIGHT_MODEL_POSITION_SMALL_ASPECT_RATIO = { x: 9.5, y: 72, z: -13 };
  /**/
  /**/
  static RIGHT_BANNER_POSITION_SMALL_ASPECT_RATIO = { x: 13, y: 85, z: 0 };
  /**/
  /**/
  static RIGHT_MODEL_AT_WAR_POSITION_SMALL_ASPECT_RATIO = { x: 14.5, y: 72, z: -13 };
  /**/
  /**/
  /**/
  /**/
  static LEFT_MODEL_POSITION_SMALL_SCREEN_MOBILE = { x: -14, y: 72, z: -13 };
  /**/
  /**/
  static LEFT_BANNER_POSITION_SMALL_SCREEN_MOBILE = { x: -18, y: 85, z: 0 };
  /**/
  /**/
  static RIGHT_MODEL_POSITION_SMALL_SCREEN_MOBILE = { x: 14, y: 72, z: -13 };
  /**/
  /**/
  static RIGHT_BANNER_POSITION_SMALL_SCREEN_MOBILE = { x: 18, y: 85, z: 0 };
  /**/
  /**/
  static RIGHT_MODEL_AT_WAR_POSITION_SMALL_SCREEN_MOBILE = { x: 19, y: 72, z: -13 };
  /**/
  /**/
  /**/
  /**/
  static POSITIONS = {
    /**/
    /**/
    [0 /* Regular */]: {
      /**/
      /**/
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION,
      /**/
      /**/
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION,
      /**/
      /**/
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION,
      /**/
      /**/
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION,
      /**/
      /**/
      [4 /* RightModelAtWar */]: LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION
      /**/
      /**/
    },
    /**/
    /**/
    [1 /* SmallAspectRatio */]: {
      /**/
      /**/
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION_SMALL_ASPECT_RATIO,
      /**/
      /**/
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION_SMALL_ASPECT_RATIO,
      /**/
      /**/
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION_SMALL_ASPECT_RATIO,
      /**/
      /**/
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION_SMALL_ASPECT_RATIO,
      /**/
      /**/
      [4 /* RightModelAtWar */]: (
        /**/
        /**/
        LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION_SMALL_ASPECT_RATIO
      )
      /**/
      /**/
    },
    /**/
    /**/
    [2 /* SmallMobileScreen */]: {
      /**/
      /**/
      [1 /* LeftBanner */]: LeaderModelManagerClass.LEFT_BANNER_POSITION_SMALL_SCREEN_MOBILE,
      /**/
      /**/
      [0 /* LeftModel */]: LeaderModelManagerClass.LEFT_MODEL_POSITION_SMALL_SCREEN_MOBILE,
      /**/
      /**/
      [3 /* RightBanner */]: LeaderModelManagerClass.RIGHT_BANNER_POSITION_SMALL_SCREEN_MOBILE,
      /**/
      /**/
      [2 /* RightModel */]: LeaderModelManagerClass.RIGHT_MODEL_POSITION_SMALL_SCREEN_MOBILE,
      /**/
      /**/
      [4 /* RightModelAtWar */]: (
        /**/
        /**/
        LeaderModelManagerClass.RIGHT_MODEL_AT_WAR_POSITION_SMALL_SCREEN_MOBILE
      )
      /**/
      /**/
    }
    /**/
    /**/
  };
  /**/
  /**                                                                                                                    **/
  /**                       IF YOU CHANGE THE ABOVE, COORDINATE WITH GRAPHICS DEPARTMENT TO MOVE IT TO JSON              **/
  /**                                          IF YOU DO NOT YOU WILL BREAK BENCHMARKING                                 **/
  /**                                         WHICH MAY CAUSE INGAME ASSETS TO BE BLURRY!                                **/
  /************************************************************************************************************************/
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
    this.leaderModelGroupLeft = WorldUI.createModelGroup("leaderModelGroupLeft");
    this.leaderModelGroupRight = WorldUI.createModelGroup("leaderModelGroupRight");
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
      WorldUI.moveFixedMarkerImmediate(this.leader3DMarkerCenter, { x: 0, y: 0, z: 0 });
      if (this.isMobileSmallScreen) {
        offset.y -= 2.5;
      }
      const vignetteOffset = {
        x: LeaderModelManagerClass.DARKENING_VFX_POSITION.x + offset.x,
        y: LeaderModelManagerClass.DARKENING_VFX_POSITION.y + offset.y,
        z: LeaderModelManagerClass.DARKENING_VFX_POSITION.z + offset.z
      };
      this.leaderModelGroupRight.addModel(
        LeaderModelManagerClass.SCREEN_DARKENING_ASSET_NAME,
        { marker: this.leader3DMarkerCenter, offset: vignetteOffset },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leaderModelGroupRight.addModel(
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
    if (this.lastFirstMeetPlayerId == playerID) {
      return;
    }
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: modelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
      this.leaderModelGroupRight.addModel(
        this.getIndependentLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_MODEL_POSITION },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
          this.getFallbackAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightModelPosition },
          { angle: 0, scale: 1, initialState: "IDLE", foreground: true, triggerCallbacks: true }
        );
      }
      this.leader3DModelLeft = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getIndBannerAssetName(player2),
        { marker: this.leader3DMarkerRight, offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_BANNER_POSITION },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          {
            marker: this.leader3DMarkerRight,
            offset: LeaderModelManagerClass.RIGHT_INDEPENDENT_BANNER_POSITION
          },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
    if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) {
      if (id == this.leader3DBannerRight?.id && this.leader3DBannerRight.state.includes("SPAWN")) {
        this.leader3DBannerRight.setState("IDLE");
      }
      if (id == this.leader3DBannerLeft?.id && this.leader3DBannerLeft.state.includes("SPAWN")) {
        this.leader3DBannerLeft.setState("IDLE");
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
    this.leaderModelGroupLeft.clear();
    this.leaderModelGroupRight.clear();
    if (this.leader3DMarkerLeft) {
      WorldUI.releaseMarker(this.leader3DMarkerLeft);
    }
    WorldUI.releaseMarker(this.leader3DMarkerRight);
    WorldUI.releaseMarker(this.leader3DRevealFlagMarker);
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
    this.lastFirstMeetPlayerId = -1;
  }
  clearLeftLeaderModel() {
    this.leaderModelGroupLeft.clear();
    if (this.leader3DMarkerLeft) {
      WorldUI.releaseMarker(this.leader3DMarkerLeft);
    }
    this.leader3DMarkerLeft = null;
    this.leader3DModelLeft = null;
    this.leader3DBannerLeft = null;
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
      if (this.leaderModelGroupLeft.isLoaded() && this.leaderModelGroupRight.isLoaded() && this.cameraDollyQueued) {
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
    this.lastFirstMeetPlayerId = playerID2;
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay16",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay16",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay16",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay16",
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Delay12",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Delay12",
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
      this.leaderModelGroupLeft.addModel(
        this.getLeftLightingAssetName(),
        { marker: this.leader3DMarkerLeft, offset: leftModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
        this.leader3DModelLeft = this.leaderModelGroupLeft.addModel(
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
      this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
        this.getCivBannerName(civ1.CivilizationType.toString()),
        { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
        {
          angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p1ColorPrimary,
          tintColor2: p1ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerLeft == null) {
        this.leader3DBannerLeft = this.leaderModelGroupLeft.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerLeft, offset: leftBannerPosition },
          {
            angle: LeaderModelManagerClass.LEFT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
      this.leaderModelGroupRight.addModel(
        this.getRightLightingAssetName(),
        { marker: this.leader3DMarkerRight, offset: rightModelPosition },
        { angle: 0, scale: 1, foreground: true }
      );
      this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
        this.leader3DModelRight = this.leaderModelGroupRight.addModel(
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
      this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
        this.getCivBannerName(civ2.CivilizationType.toString()),
        { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
        {
          angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
          scale: LeaderModelManagerClass.BANNER_SCALE,
          foreground: true,
          initialState: "SPAWN_Trim10",
          tintColor1: p2ColorPrimary,
          tintColor2: p2ColorSecondary,
          triggerCallbacks: true
        }
      );
      if (this.leader3DBannerRight == null) {
        this.leader3DBannerRight = this.leaderModelGroupRight.addModel(
          this.getFallbackBannerAssetName(),
          { marker: this.leader3DMarkerRight, offset: rightBannerPosition },
          {
            angle: LeaderModelManagerClass.RIGHT_BANNER_ANGLE,
            scale: LeaderModelManagerClass.BANNER_SCALE,
            foreground: true,
            initialState: "SPAWN_Trim10",
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
        if (this.leaderSequenceGate.isWaiting() == false && id == this.leader3DModelLeft?.id) {
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("IDLE_ListeningPlayer", "left");
          this.leaderSequenceGate.clear();
          break;
        }
        if (id == this.leader3DModelRight?.id) {
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) {
            this.rightAnimState = "IDLE_WaitingOther";
          }
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END) {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
          }
        }
        if (this.leftAnimState == "IDLE_ListeningPlayer" && this.rightAnimState == "IDLE_WaitingOther") {
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
        if (this.leaderSequenceGate.isWaiting() == false && id == this.leader3DModelLeft?.id) {
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) break;
          this.doSequenceSharedAdvance();
          this.playLeaderAnimation("IDLE_DwPlayer", "left");
          this.leaderSequenceGate.clear();
          break;
        }
        if (id == this.leader3DModelRight?.id) {
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER) {
            this.rightAnimState = "IDLE_WaitingOther";
          }
          if (hash == LeaderModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END) {
            this.playLeaderAnimation("IDLE_WaitingOther", "right");
          }
        }
        if (this.leftAnimState == "IDLE_DwPlayer" && this.rightAnimState == "IDLE_WaitingOther") {
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
  // negative acknowledge animation and then continue to their idle.
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
      WorldUI.ForegroundCamera.reset(35, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
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

export { LeaderModelManager as default };
//# sourceMappingURL=leader-model-manager.js.map
