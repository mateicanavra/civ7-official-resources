var LeaderSelectAnimation = /* @__PURE__ */ ((LeaderSelectAnimation2) => {
  LeaderSelectAnimation2["vo"] = "VO_CharSelect";
  LeaderSelectAnimation2["idle"] = "IDLE_CharSelect";
  return LeaderSelectAnimation2;
})(LeaderSelectAnimation || {});
const LeaderAnimationStateEventName = "leader-animation-state";
class LeaderAnimationStateEvent extends CustomEvent {
  constructor(detail) {
    super(LeaderAnimationStateEventName, { bubbles: false, cancelable: true, detail });
  }
}
class LeaderSelectModelManagerClass {
  static instance = null;
  leaderSelectModelGroup = null;
  leader3DModel = null;
  leaderPedestalModelGroup = null;
  pedestal3DModel = null;
  currentLeaderAssetName = "";
  _currentLeaderAnimationState = "";
  isLeaderCameraActive = false;
  leader3dMarker = null;
  sequenceStartTime = 0;
  isVoPlaying = false;
  isLeaderPicked = false;
  SEQUENCE_DEBOUNCE_DURATION = 100;
  // 0.1 seconds
  static DEFAULT_CAMERA_POSITION = { x: 0, y: -40, z: 11 };
  static DEFAULT_CAMERA_TARGET = { x: -15, y: 5, z: 10.5 };
  static VO_CAMERA_CHOOSER_POSITION = { x: -1.834, y: -23.0713, z: 15.2 };
  static VO_CAMERA_CHOOSER_TARGET = { x: -2.7588, y: -17.4867, z: 14.8042 };
  static TRIGGER_HASH_ANIMATION_STATE_END = WorldUI.hash("AnimationStateChange");
  static TRIGGER_HASH_SEQUENCE_TRIGGER = WorldUI.hash("SEQUENCE");
  static PEDESTAL_CHOOSER_POSITION = { x: 0, y: 0, z: 0 };
  static PEDESTAL_CHOOSER_POSITION_SMALL_ASPECT_RATIO = { x: -1.5, y: 0, z: 0 };
  static PEDESTAL_POSITION = { x: 0, y: 0, z: 0 };
  static PEDESTAL_POSITION_SMALL_ASPECT_RATIO = { x: -1.5, y: 0, z: 0 };
  static PEDESTAL_SCALE = { angle: 0, scale: 0.01 };
  static PEDESTAL_SCALE_SMALL_ASPECT_RATIO = {
    angle: 120,
    scale: 0.9
  };
  static LEADER_CHOOSER_POSITION = { x: 0, y: 0, z: 0 };
  static LEADER_CHOOSER_POSITION_SMALL_ASPECT_RATIO = { x: -1.5, y: 0, z: 0 };
  static LEADER_POSITION = { x: 0, y: 0, z: 0 };
  static LEADER_POSITION_SMALL_ASPECT_RATIO = { x: -1.5, y: 0, z: 0 };
  // This flag is used when an animation is started so that we know to ignore that animation change trigger
  leaderAnimationJustStarted = false;
  // This flag is used to indicate that the Charatcer selection sequence is active for the selected leader
  selectedLeaderActive = false;
  leaderSequenceStepID = 0;
  _isRandomLeader = true;
  get isRandomLeader() {
    return this._isRandomLeader;
  }
  get currentLeaderAnimationState() {
    return this._currentLeaderAnimationState;
  }
  constructor() {
    if (LeaderSelectModelManagerClass.instance) {
      console.error(
        "Only one instance of the leader select model manager class exist at a time, second attempt to create one."
      );
    }
    LeaderSelectModelManagerClass.instance = this;
    this.leaderSelectModelGroup = WorldUI.createModelGroup("leaderModelGroup");
    this.leaderPedestalModelGroup = WorldUI.createModelGroup("leaderPedestalGroup");
    engine.on("ModelTrigger", (id, hash) => {
      this.handleTriggerCallback(id, hash);
    });
  }
  setGrayscaleFilter() {
    WorldUI.popFilter();
    WorldUI.pushGlobalColorFilter({ saturation: 0 });
  }
  clearFilter() {
    WorldUI.popFilter();
  }
  getLeaderAssetName(leader_id) {
    return leader_id + "_GAME_ASSET";
  }
  getFallbackAssetName() {
    return "LEADER_FALLBACK_GAME_ASSET";
  }
  activateLeaderSelectCamera() {
    if (this.isLeaderCameraActive) {
      Camera.popCamera();
    }
    Camera.pushCamera(LeaderSelectModelManagerClass.DEFAULT_CAMERA_POSITION, {
      x: LeaderSelectModelManagerClass.DEFAULT_CAMERA_TARGET.x,
      y: LeaderSelectModelManagerClass.DEFAULT_CAMERA_TARGET.y,
      z: LeaderSelectModelManagerClass.DEFAULT_CAMERA_TARGET.z
    });
    if (this._currentLeaderAnimationState != "IDLE_CharSelect" /* idle */) {
      this.playLeaderAnimation("IDLE_CharSelect" /* idle */);
    }
    if (this.leaderPedestalModelGroup && this.pedestal3DModel == null) {
      this.pedestal3DModel = this.leaderPedestalModelGroup.addModelAtPos(
        "LEADER_SELECTION_PEDESTAL",
        { x: 0, y: 0, z: -0.05 },
        { angle: 120, scale: 0.9 }
      );
    }
    this.isLeaderCameraActive = true;
  }
  deactivateLeaderSelectCamera() {
    if (this.isLeaderCameraActive) {
      Camera.popCamera();
      this.isLeaderCameraActive = false;
    }
  }
  isSmallAspectRatio() {
    return window.innerWidth / window.innerHeight >= 2 / 3;
  }
  showLeaderModels(leaderId) {
    this.isVoPlaying = false;
    this.activateLeaderSelectCamera();
    if (!this.isLeaderPicked && (leaderId == "" || this.currentLeaderAssetName == leaderId)) {
      return;
    }
    this.isLeaderPicked = false;
    this.leader3dMarker = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    this.currentLeaderAssetName = leaderId;
    this.leaderSelectModelGroup?.clear();
    this.leaderPedestalModelGroup?.clear();
    this.leader3DModel = null;
    this._isRandomLeader = leaderId == "RANDOM";
    const pedestalPosition = this.isSmallAspectRatio() ? LeaderSelectModelManagerClass.PEDESTAL_CHOOSER_POSITION_SMALL_ASPECT_RATIO : LeaderSelectModelManagerClass.PEDESTAL_CHOOSER_POSITION;
    const leaderPosition = this.isSmallAspectRatio() ? LeaderSelectModelManagerClass.LEADER_CHOOSER_POSITION_SMALL_ASPECT_RATIO : LeaderSelectModelManagerClass.LEADER_CHOOSER_POSITION;
    if (this.leaderSelectModelGroup) {
      this.leaderSelectModelGroup.addModelAtPos(
        "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
        { x: 0, y: 0, z: 0 },
        { angle: 0 }
      );
    }
    if (this.leaderPedestalModelGroup) {
      this.pedestal3DModel = this.leaderPedestalModelGroup.addModelAtPos(
        "LEADER_SELECTION_PEDESTAL",
        pedestalPosition,
        { angle: 120, scale: 0.9 }
      );
    }
    if (this.leaderSelectModelGroup && this.leader3dMarker != null) {
      if (this._isRandomLeader) {
        this.leader3DModel = this.leaderSelectModelGroup.addModel(
          "LEADER_RANDOM_GAME_ASSET",
          { marker: this.leader3dMarker, offset: leaderPosition },
          { angle: 0, triggerCallbacks: true }
        );
      } else {
        this.leader3DModel = this.leaderSelectModelGroup.addModel(
          this.getLeaderAssetName(this.currentLeaderAssetName),
          { marker: this.leader3dMarker, offset: leaderPosition },
          { angle: 0, triggerCallbacks: true }
        );
        if (this.leader3DModel == null) {
          this.leader3DModel = this.leaderSelectModelGroup.addModel(
            this.getFallbackAssetName(),
            { marker: this.leader3dMarker, offset: leaderPosition },
            { angle: 0, triggerCallbacks: true }
          );
        }
      }
    }
    this.playLeaderAnimation("IDLE_CharSelect" /* idle */);
  }
  zoomInLeader() {
    this.deactivateLeaderSelectCamera();
    Camera.pushCamera(
      LeaderSelectModelManagerClass.VO_CAMERA_CHOOSER_POSITION,
      LeaderSelectModelManagerClass.VO_CAMERA_CHOOSER_TARGET
    );
  }
  zoomOutLeader() {
    this.activateLeaderSelectCamera();
  }
  pickLeader() {
    this.isLeaderPicked = true;
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    if (this.isVoPlaying && performance.now() - this.sequenceStartTime < this.SEQUENCE_DEBOUNCE_DURATION) {
      console.warn(
        "Leader Model Manager: The leader picked sequence was triggered immediately after it was already triggered. requests to trigger it within the debounce duration will be ignored"
      );
      return;
    }
    this.sequenceStartTime = performance.now();
    this.leaderSelectModelGroup?.clear();
    this.leaderPedestalModelGroup?.clear();
    this.leader3DModel = null;
    const pedestalPosition = this.isSmallAspectRatio() ? LeaderSelectModelManagerClass.PEDESTAL_POSITION_SMALL_ASPECT_RATIO : LeaderSelectModelManagerClass.PEDESTAL_POSITION;
    const pedestalScale = this.isSmallAspectRatio() ? LeaderSelectModelManagerClass.PEDESTAL_SCALE_SMALL_ASPECT_RATIO : LeaderSelectModelManagerClass.PEDESTAL_SCALE;
    const leaderPosition = this.isSmallAspectRatio() ? LeaderSelectModelManagerClass.LEADER_POSITION_SMALL_ASPECT_RATIO : LeaderSelectModelManagerClass.LEADER_POSITION;
    if (this.leaderSelectModelGroup) {
      this.leaderSelectModelGroup.addModelAtPos(
        "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
        { x: 0, y: 0, z: 0 },
        { angle: 0 }
      );
    }
    if (this.leaderPedestalModelGroup) {
      this.pedestal3DModel = this.leaderPedestalModelGroup.addModelAtPos(
        "LEADER_SELECTION_PEDESTAL",
        pedestalPosition,
        pedestalScale
      );
    }
    if (!isMobileViewExperience) {
      this.zoomInLeader();
    }
    if (this._isRandomLeader || this.currentLeaderAssetName == "") {
      if (this.leaderSelectModelGroup) {
        this.leader3DModel = this.leaderSelectModelGroup.addModelAtPos(
          "LEADER_RANDOM_GAME_ASSET",
          leaderPosition,
          { angle: 0, triggerCallbacks: true }
        );
        return;
      }
    }
    if (this.leaderSelectModelGroup) {
      this.leader3DModel = this.leaderSelectModelGroup.addModelAtPos(
        this.getLeaderAssetName(this.currentLeaderAssetName),
        leaderPosition,
        { angle: 0, triggerCallbacks: true }
      );
      if (this.leader3DModel == null) {
        this.leader3DModel = this.leaderSelectModelGroup.addModelAtPos(
          this.getFallbackAssetName(),
          leaderPosition,
          { angle: 0, triggerCallbacks: true }
        );
      }
    }
    this.leaderAnimationJustStarted = true;
    this.beginLeaderSelectedSequence();
  }
  clearLeaderModels() {
    this.leaderSelectModelGroup?.clear();
    this.leaderPedestalModelGroup?.clear();
    this.pedestal3DModel = null;
    this.leader3DModel = null;
    this.leaderAnimationJustStarted = false;
    this.leaderSequenceStepID = 0;
    this.currentLeaderAssetName = "";
    this.isVoPlaying = false;
    this.deactivateLeaderSelectCamera();
  }
  // This function does all the interpreting of any animation triggers that come in and uses them to advance whatever sequences are relying on them
  handleTriggerCallback(id, hash) {
    if (hash != LeaderSelectModelManagerClass.TRIGGER_HASH_SEQUENCE_TRIGGER && hash != LeaderSelectModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END) {
      return;
    }
    if (this.leaderAnimationJustStarted) {
      this.sequenceStartTime = performance.now();
      this.leaderAnimationJustStarted = false;
      return;
    }
    if (performance.now() - this.sequenceStartTime < this.SEQUENCE_DEBOUNCE_DURATION) {
      return;
    }
    if (this.selectedLeaderActive) {
      this.advanceLeaderSelectedSequence(id, hash);
    }
  }
  // Use this function to play a leader's animation instead of setting the state directly
  playLeaderAnimation(stateName) {
    if (this.leader3DModel == null) {
      return;
    }
    window.dispatchEvent(
      new LeaderAnimationStateEvent({ lastState: this._currentLeaderAnimationState, newState: stateName })
    );
    this.leader3DModel.setState(stateName);
    this._currentLeaderAnimationState = stateName;
    this.leaderAnimationJustStarted = true;
  }
  // First meet sequence
  beginLeaderSelectedSequence() {
    this.playLeaderAnimation("VO_CharSelect" /* vo */);
    this.isVoPlaying = true;
    this.selectedLeaderActive = true;
    this.leaderSequenceStepID = 1;
  }
  advanceLeaderSelectedSequence(id, hash) {
    if (hash == LeaderSelectModelManagerClass.TRIGGER_HASH_ANIMATION_STATE_END && id == this.leader3DModel?.id && this.leaderSequenceStepID == 1) {
      this.playLeaderAnimation("IDLE_CharSelect" /* idle */);
      this.leaderSequenceStepID = 0;
      this.isVoPlaying = false;
    }
  }
}
const LeaderSelectModelManager = new LeaderSelectModelManagerClass();

export { LeaderSelectModelManager as L, LeaderAnimationStateEventName as a, LeaderSelectAnimation as b };
//# sourceMappingURL=leader-select-model-manager.chunk.js.map
