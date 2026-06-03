import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show, createSignal } from '../../../vendor/solid-js/dist/solid.js';
import { Scene3d, Background3d, BackgroundLayer3d, Camera3d, ModelGroup3d, Model3d } from '../../components/scene-3d.js';
import { useCivSelectModelContext } from './civ-select-model.js';
import { useLeaderSelectModelContext } from './leader-select-model.js';
import { LayoutModel, useIsSmallScreen } from '../../utilities/layout-utilities.js';

const TRIGGER_HASH_SEQUENCE_TRIGGER = WorldUI.hash("SEQUENCE");
const LeaderBanner3d = (props) => {
  const leaderModel = useLeaderSelectModelContext();
  const civModel = useCivSelectModelContext();
  const layout = LayoutModel.get();
  const bannerAsset = createMemo(() => civModel.selectedCiv().civID == "RANDOM" ? "CIVILIZATION_RANDOM_BANNER_GAME_ASSET" : `${civModel.selectedCiv().civID}_BANNER_GAME_ASSET`);
  const headerHeight = layout.toScaledPixels(144);
  const footerHeight = layout.toScaledPixels(76);
  const primaryColor = createMemo(() => leaderModel.selectedLeader().colors?.primaryColor);
  const secondaryColor = createMemo(() => leaderModel.selectedLeader().colors?.secondaryColor);
  return createComponent(Scene3d, {
    name: "leader-banner-scene",
    get children() {
      return [createComponent(Background3d, {
        get children() {
          return [createComponent(BackgroundLayer3d, {
            name: "bg-texture",
            texture: "grey-box-texture"
          }), createComponent(BackgroundLayer3d, {
            name: "header",
            get size() {
              return {
                x: layout.screenWidthScaled(),
                y: headerHeight()
              };
            },
            offset: {
              x: 0,
              y: 0
            },
            get alignX() {
              return AlignMode.Minimum;
            },
            get alignY() {
              return AlignMode.Minimum;
            },
            texture: "grey-box-texture-dark"
          }), createComponent(BackgroundLayer3d, {
            name: "footer",
            get size() {
              return {
                x: layout.screenWidthScaled(),
                y: footerHeight()
              };
            },
            offset: {
              x: 0,
              y: 0
            },
            get alignX() {
              return AlignMode.Minimum;
            },
            get alignY() {
              return AlignMode.Maximum;
            },
            texture: "grey-box-texture-dark"
          })];
        }
      }), createComponent(Show, {
        get when() {
          return !props.bgOnly;
        },
        get children() {
          return [createComponent(Camera3d, {
            cameraPos: {
              x: 0,
              y: -40,
              z: 11
            },
            subjectPos: {
              x: -17,
              y: 5,
              z: 10.5
            }
          }), createComponent(ModelGroup3d, {
            name: "CivDetails3dModelGroup",
            get children() {
              return [createComponent(Model3d, {
                model: "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
                angle: 0
              }), createComponent(Model3d, {
                get model() {
                  return leaderModel.selectedLeader().model;
                },
                state: "IDLE_CharSelect",
                location: {
                  offset: {
                    x: -5,
                    y: 0,
                    z: 0
                  }
                }
              }), createComponent(Model3d, {
                get model() {
                  return bannerAsset();
                },
                get tintColor1() {
                  return primaryColor();
                },
                get tintColor2() {
                  return secondaryColor();
                },
                location: {
                  offset: {
                    x: 0,
                    y: 20,
                    z: 17
                  }
                },
                scale: 1.4
              })];
            }
          })];
        }
      })];
    }
  });
};
const LeaderPedestalBanner3d = (props) => {
  const leaderModel = useLeaderSelectModelContext();
  const civModel = useCivSelectModelContext();
  const [animState, setAnimState] = createSignal("SPAWN");
  const bannerAsset = createMemo(() => civModel.selectedCiv().civID == "RANDOM" ? "CIVILIZATION_RANDOM_BANNER_GAME_ASSET" : `${civModel.selectedCiv().civID}_BANNER_GAME_ASSET`);
  const primaryColor = createMemo(() => leaderModel.selectedLeader().colors?.primaryColor);
  const secondaryColor = createMemo(() => leaderModel.selectedLeader().colors?.secondaryColor);
  const isSmallScreen = useIsSmallScreen();
  return createComponent(Scene3d, {
    name: "leader-banner-scene",
    get children() {
      return createComponent(Show, {
        get when() {
          return !props.bgOnly;
        },
        get children() {
          return [createComponent(Camera3d, {
            cameraPos: {
              x: 0,
              y: -40,
              z: 11
            },
            subjectPos: {
              x: -17,
              y: 5,
              z: 10.5
            }
          }), createComponent(ModelGroup3d, {
            name: "CivDetails3dModelGroup",
            get children() {
              return [createComponent(Model3d, {
                model: "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
                angle: 0
              }), createComponent(Model3d, {
                model: "LEADER_SELECTION_PEDESTAL",
                angle: 120,
                scale: 0.9,
                get location() {
                  return {
                    offset: isSmallScreen() ? {
                      x: 0,
                      y: -6,
                      z: 0
                    } : {
                      x: -3,
                      y: -6,
                      z: 0
                    }
                  };
                }
              }), createComponent(Model3d, {
                get model() {
                  return leaderModel.selectedLeader().model;
                },
                state: "IDLE_CharSelect",
                get location() {
                  return {
                    offset: isSmallScreen() ? {
                      x: 0,
                      y: -6,
                      z: 0
                    } : {
                      x: -2,
                      y: -6,
                      z: 0
                    }
                  };
                }
              }), createComponent(Model3d, {
                get model() {
                  return bannerAsset();
                },
                get state() {
                  return animState();
                },
                get tintColor1() {
                  return primaryColor();
                },
                get tintColor2() {
                  return secondaryColor();
                },
                location: {
                  offset: {
                    x: 0,
                    y: 20,
                    z: 17
                  }
                },
                scale: 1.6,
                angle: -25,
                onTrigger: (hash) => {
                  if (hash == TRIGGER_HASH_SEQUENCE_TRIGGER) {
                    setAnimState("IDLE");
                  }
                }
              })];
            }
          })];
        }
      });
    }
  });
};
const LeaderZoomed3d = () => {
  const leaderModel = useLeaderSelectModelContext();
  const layout = LayoutModel.get();
  const headerHeight = layout.toScaledPixels(144);
  const footerHeight = layout.toScaledPixels(76);
  return createComponent(Scene3d, {
    name: "leader-banner-zoomed-scene",
    get children() {
      return [createComponent(Background3d, {
        get children() {
          return [createComponent(BackgroundLayer3d, {
            name: "bg-texture",
            texture: "grey-box-texture"
          }), createComponent(BackgroundLayer3d, {
            name: "header",
            get size() {
              return {
                x: layout.screenWidthScaled(),
                y: headerHeight()
              };
            },
            offset: {
              x: 0,
              y: 0
            },
            get alignX() {
              return AlignMode.Minimum;
            },
            get alignY() {
              return AlignMode.Minimum;
            },
            texture: "grey-box-texture-dark"
          }), createComponent(BackgroundLayer3d, {
            name: "footer",
            get size() {
              return {
                x: layout.screenWidthScaled(),
                y: footerHeight()
              };
            },
            offset: {
              x: 0,
              y: 0
            },
            get alignX() {
              return AlignMode.Minimum;
            },
            get alignY() {
              return AlignMode.Maximum;
            },
            texture: "grey-box-texture-dark"
          })];
        }
      }), createComponent(Camera3d, {
        cameraPos: {
          x: 0,
          y: -20,
          z: 17
        },
        subjectPos: {
          x: 0,
          y: 10,
          z: 10
        }
      }), createComponent(ModelGroup3d, {
        name: "CivDetails3dModelGroup",
        get children() {
          return [createComponent(Model3d, {
            model: "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
            angle: 0
          }), createComponent(Model3d, {
            get model() {
              return leaderModel.selectedLeader().model;
            },
            state: "IDLE_CharSelect"
          })];
        }
      })];
    }
  });
};

export { LeaderBanner3d, LeaderPedestalBanner3d, LeaderZoomed3d };
//# sourceMappingURL=leader-banner-3d.js.map
