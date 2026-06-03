import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show } from '../../../vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from '../../../ui-next/components/fxs-solid-component.js';
import { Scene3d, Background3d, BackgroundLayer3d } from '../../../ui-next/components/scene-3d.js';
import { ComponentRegistry } from '../../../ui-next/services/component-registry.js';
import { LayoutModel, useIsSmallScreen } from '../../../ui-next/utilities/layout-utilities.js';

const FRONT_IMAGE_MARGIN = 7;
const FRONT_FILIGEE_X_OFFSET = 30;
const FRONT_FILIGEE_X_OFFSET_SMALL = -40;
const FRONT_FILIGEE_Y_OFFSET = 75;
const FRONT_FILIGEE_Y_OFFSET_SMALL = 35;
const MIDDLE_FILIGREE_Y_SIZE = 4;
const MIDDLE_FILIGREE_Y_OFFSET_REL = 4;
const MIDDLE_FILIGREE_Y_OFFSET_REL_SMALL = 3;
const MIDDLE_LEATHER_Y_MARGIN_REL = 2;
const MainMenuBackgroundComponent = (props) => {
  const layout = LayoutModel.get();
  const visible = createMemo(() => (props.attrs["visible"] ?? "false") === "true");
  const isSmallScreen = useIsSmallScreen();
  const frontImageMargin = layout.toScaledPixels(FRONT_IMAGE_MARGIN);
  const isWidescreen = createMemo(() => {
    return layout.screenWidth() / layout.screenHeight() > 2;
  });
  const frontFiligreeYOffset = createMemo(() => {
    return isSmallScreen() ? layout.toScaledPixels(FRONT_FILIGEE_Y_OFFSET_SMALL)() : layout.toScaledPixels(FRONT_FILIGEE_Y_OFFSET)();
  });
  const frontFiligreeMaxXOffset = createMemo(() => {
    return (layout.screenWidth() - layout.screenHeight() * 1.777) / 2;
  });
  const frontFiligreeXOffset = createMemo(() => {
    return isWidescreen() ? frontFiligreeMaxXOffset() : isSmallScreen() ? layout.toScaledPixels(FRONT_FILIGEE_X_OFFSET_SMALL)() : layout.toScaledPixels(FRONT_FILIGEE_X_OFFSET)();
  });
  const frontImageYSize = createMemo(() => {
    return layout.screenHeight() - frontFiligreeYOffset() * 2 - frontImageMargin();
  });
  const frontImageXSize = createMemo(() => {
    return layout.screenWidth() - frontFiligreeXOffset() * 2 - frontImageMargin();
  });
  const frontFiligreeXSize = createMemo(() => {
    return frontImageXSize() / 1.5;
  });
  const frontFiligreeYSize = createMemo(() => {
    return frontImageYSize() / 1.5;
  });
  const middleFiligreeYOffsetRel = createMemo(() => {
    return isSmallScreen() ? MIDDLE_FILIGREE_Y_OFFSET_REL_SMALL : MIDDLE_FILIGREE_Y_OFFSET_REL;
  });
  const middleLeatherYSizeRel = createMemo(() => {
    return 100 - middleFiligreeYOffsetRel() + MIDDLE_LEATHER_Y_MARGIN_REL;
  });
  return [createComponent(Show, {
    get when() {
      return createMemo(() => !!visible())() && !isSmallScreen();
    },
    get children() {
      return createComponent(Scene3d, {
        name: "main-menu-background",
        get children() {
          return createComponent(Background3d, {
            get children() {
              return [createComponent(BackgroundLayer3d, {
                name: "background-ramp",
                texture: "mm_allgradient",
                sizeRel: {
                  x: 100,
                  y: 100
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-right",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                },
                offsetRel: {
                  x: 100,
                  y: 0
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-middle",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-left",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                },
                offsetRel: {
                  x: -100,
                  y: 0
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-top-filigree",
                texture: "hud_section-line_gold",
                sizeRel: {
                  x: 120,
                  y: MIDDLE_FILIGREE_Y_SIZE
                },
                get offsetRel() {
                  return {
                    x: 0,
                    y: middleFiligreeYOffsetRel()
                  };
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                borderImageSlice: "15 32 1 32",
                borderImageWidth: "15 32 1 32"
              }), createComponent(BackgroundLayer3d, {
                name: "middle-bottom-filigree",
                texture: "hud_section-line_gold",
                sizeRel: {
                  x: 120,
                  y: MIDDLE_FILIGREE_Y_SIZE
                },
                get offsetRel() {
                  return {
                    x: 0,
                    y: middleFiligreeYOffsetRel()
                  };
                },
                flipY: true,
                get alignY() {
                  return AlignMode.Maximum;
                },
                borderImageSlice: "1 32 15 32",
                borderImageWidth: "1 32 15 32"
              }), createComponent(BackgroundLayer3d, {
                name: "front-background-image",
                texture: "mm_image_generic",
                get size() {
                  return {
                    x: frontImageXSize(),
                    y: frontImageYSize()
                  };
                },
                get stretch() {
                  return StretchMode.UniformFill;
                }
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-top-left",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Minimum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                flipY: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "90 1 1 90",
                borderImageWidth: "90 1 1 90"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-bottom-left",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Minimum;
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "1 1 90 90",
                borderImageWidth: "1 1 90 90"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-bottom-right",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Maximum;
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                flipX: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "1 90 90 1",
                borderImageWidth: "1 90 90 1"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-top-right",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Maximum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                flipX: true,
                flipY: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "90 90 1 1",
                borderImageWidth: "90 90 1 1"
              })];
            }
          });
        }
      });
    }
  }), createComponent(Show, {
    get when() {
      return createMemo(() => !!visible())() && isSmallScreen();
    },
    get children() {
      return createComponent(Scene3d, {
        name: "main-menu-background",
        get children() {
          return createComponent(Background3d, {
            get children() {
              return [createComponent(BackgroundLayer3d, {
                name: "background-ramp-small",
                texture: "mm_allgradient",
                sizeRel: {
                  x: 100,
                  y: 100
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-right-small",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                },
                offsetRel: {
                  x: 100,
                  y: 0
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-middle-small",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-leather-left-small",
                texture: "mm_leather",
                get sizeRel() {
                  return {
                    x: 100,
                    y: middleLeatherYSizeRel()
                  };
                },
                offsetRel: {
                  x: -100,
                  y: 0
                }
              }), createComponent(BackgroundLayer3d, {
                name: "middle-top-filigree-small",
                texture: "hud_section-line_gold",
                sizeRel: {
                  x: 120,
                  y: MIDDLE_FILIGREE_Y_SIZE
                },
                get offsetRel() {
                  return {
                    x: 0,
                    y: middleFiligreeYOffsetRel()
                  };
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                borderImageSlice: "15 32 1 32",
                borderImageWidth: "15 32 1 32"
              }), createComponent(BackgroundLayer3d, {
                name: "middle-bottom-filigree-small",
                texture: "hud_section-line_gold",
                sizeRel: {
                  x: 120,
                  y: MIDDLE_FILIGREE_Y_SIZE
                },
                get offsetRel() {
                  return {
                    x: 0,
                    y: middleFiligreeYOffsetRel()
                  };
                },
                flipY: true,
                get alignY() {
                  return AlignMode.Maximum;
                },
                borderImageSlice: "1 32 15 32",
                borderImageWidth: "1 32 15 32"
              }), createComponent(BackgroundLayer3d, {
                name: "front-background-image-small",
                texture: "mm_image_generic",
                get size() {
                  return {
                    x: frontImageXSize(),
                    y: frontImageYSize()
                  };
                },
                get stretch() {
                  return StretchMode.UniformFill;
                }
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-top-left-small",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Minimum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                flipY: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "90 1 1 90",
                borderImageWidth: "90 1 1 90"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-bottom-left-small",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Minimum;
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "1 1 90 90",
                borderImageWidth: "1 1 90 90"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-bottom-right-small",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Maximum;
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                flipX: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "1 90 90 1",
                borderImageWidth: "1 90 90 1"
              }), createComponent(BackgroundLayer3d, {
                name: "front-filigree-top-right-small",
                texture: "filigree_corner",
                get size() {
                  return {
                    x: frontFiligreeXSize(),
                    y: frontFiligreeYSize()
                  };
                },
                get alignX() {
                  return AlignMode.Maximum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                flipX: true,
                flipY: true,
                get offset() {
                  return {
                    x: frontFiligreeXOffset(),
                    y: frontFiligreeYOffset()
                  };
                },
                borderImageSlice: "90 90 1 1",
                borderImageWidth: "90 90 1 1"
              })];
            }
          });
        }
      });
    }
  })];
};
const MainMenuBackground = ComponentRegistry.register({
  name: "MainMenuBackground",
  createInstance: MainMenuBackgroundComponent
});
defineLegacyComponent("main-menu-background", {
  classNames: [""],
  attrs: {
    visible: "true"
  }
}, (attrs, _element) => createComponent(MainMenuBackground, {
  attrs
}));

export { MainMenuBackground };
//# sourceMappingURL=main-menu-background.js.map
