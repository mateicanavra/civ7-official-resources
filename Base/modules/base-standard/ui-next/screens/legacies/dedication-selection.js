import { template, insert, className, use } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, mergeProps, createRenderEffect, useContext, onMount, onCleanup, Show, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { DialogBoxManager } from '../../../../core/ui/dialog-box/manager-dialog-box.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { MetalCardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { useDragAndDropContext, Draggable, DragEndStatus, DragAndDrop, Dropzone } from '../../../../core/ui-next/components/drag-and-drop.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { FiligreeTitle } from '../../../../core/ui-next/components/filigree-title.js';
import { Filigree } from '../../../../core/ui-next/components/filigree.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { Header } from '../../../../core/ui-next/components/header.js';
import { InnerFrame } from '../../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot, SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { ViewExperience } from '../../../../core/ui-next/services/view-experience.js';
import { useIsSmallScreen } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { OrnatePopupFrame, OrnateTopIcon } from '../../components/ornate-popup.js';
import { DedicationCardContents } from './dedication-card-contents.js';
import { DedicationsModel } from './dedications-model.js';
import { DialogBoxAction } from '../../../../core/ui/dialog-box/model-dialog-box.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0 metal-card-frame-bg-hover"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute inset-0 py-2 px-3 flex flex-col items-center justify-center uppercase"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute z-1"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="max-w-full relative mt-4 mb-2"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div role=heading><div class="flex items-center font-body text-accent-2 text-sm mt-1"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<span class="m-1 truncate"></span>`);
const DedicationCard = (props) => {
  const [isHover, setIsHover] = createSignal(false);
  const onHover = () => {
    setIsHover(true);
    if (props.onHover) {
      props.onHover();
    }
  };
  const onDehover = () => {
    setIsHover(false);
    if (props.onDehover) {
      props.onDehover();
    }
  };
  const dndContext = useDragAndDropContext();
  const isDragging = createMemo(() => {
    const draggable = dndContext.isDragging();
    if (draggable != null && draggable.data == props.id) {
      return true;
    }
    return false;
  });
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Draggable, {
      get disabled() {
        return props.isDisplayOnly || props.disabled;
      },
      get data() {
        return props.id;
      },
      get onDragStart() {
        return props.onDragStart;
      },
      get onDragEnd() {
        return props.onDragEnd;
      },
      get onDragDrop() {
        return props.onDragDrop;
      },
      get canDrop() {
        return props.canDrop;
      },
      ghostElementStyle: {
        opacity: "0.3"
      },
      get children() {
        return createComponent(Activatable, {
          "class": `flex flex-auto justify-center relative`,
          get onActivate() {
            return props.isDisplayOnly || props.disabled ? void 0 : props.onDedicationActivate;
          },
          get onFocus() {
            return props.isDisplayOnly || props.disabled ? void 0 : onHover;
          },
          get onBlur() {
            return props.isDisplayOnly || props.disabled ? void 0 : onDehover;
          },
          get id() {
            return props.id;
          },
          get style() {
            return {
              // MouseEnter in drag and drop doesn't work if the pointer events consume the input
              "pointer-events": `${isDragging() ? "none" : "auto"}`,
              cursor: `${props.isDisplayOnly ? "auto" : "pointer"}`,
              opacity: props.disabled ? "0.3" : "1"
            };
          },
          get disableFocus() {
            return props.isDisplayOnly;
          },
          name: "DedicationCard",
          get tabIndex() {
            return props.tabIndex;
          },
          get autoFocus() {
            return props.tabIndex == 0;
          },
          get children() {
            return createComponent(DedicationCardContents, mergeProps(props, {
              isHover,
              isDragging,
              onHover,
              onDehover
            }));
          }
        });
      }
    }));
    createRenderEffect(() => className(_el$, `flex ${props.class ? props.class : ""}`));
    return _el$;
  })();
};
const EmptySlot = (props) => {
  const [isHover, setIsHover] = createSignal(false);
  const onHover = () => {
    setIsHover(true);
    if (props.onHover) {
      props.onHover();
    }
  };
  const onDehover = () => {
    setIsHover(false);
  };
  const isMobile = ViewExperience() == UIViewExperience.Mobile;
  const isSmallScreen = useIsSmallScreen();
  return createComponent(Activatable, {
    get ["class"]() {
      return `${isMobile ? "flex" : ""} flex-auto justify-center ${props.class}`;
    },
    onFocus: onHover,
    onBlur: onDehover,
    get tabIndex() {
      return props.tabIndex;
    },
    get autoFocus() {
      return props.tabIndex == 0;
    },
    get children() {
      return createComponent(MetalCardFrame, {
        onMouseEnter: onHover,
        onMouseLeave: onDehover,
        get ["class"]() {
          return `${isMobile && isSmallScreen() ? "w-96 min-h-36" : "w-72 h-32"} max-w-full flex flex-auto justify-center items-center font-fit-shrink text-xs relative`;
        },
        get style() {
          return {
            filter: "grayscale(1)",
            width: isMobile && !isSmallScreen() ? `${Layout.pixelsToScreenPixels(412)}px` : void 0,
            "min-height": isMobile && !isSmallScreen() ? `${Layout.pixelsToScreenPixels(182)}px` : void 0
          };
        },
        get children() {
          return [(() => {
            var _el$2 = _tmpl$2();
            _el$2.style.setProperty("filter", "grayscale(1)");
            createRenderEffect(() => _el$2.classList.toggle("invisible", !isHover()));
            return _el$2;
          })(), (() => {
            var _el$3 = _tmpl$3();
            _el$3.style.setProperty("background-image", "radial-gradient(140% 120% at top, rgba(172, 8, 142, 0.4), rgba(172, 8, 142, 0.35) 10%, rgba(172, 8, 142,0) 35%)");
            insert(_el$3, createComponent(L10n.Stylize, {
              text: "LOC_DEDICATIONS_EMPTY_SLOT"
            }));
            createRenderEffect((_p$) => {
              var _v$ = !!isHover(), _v$2 = !isHover();
              _v$ !== _p$.e && _el$3.classList.toggle("text-secondary-1", _p$.e = _v$);
              _v$2 !== _p$.t && _el$3.classList.toggle("text-secondary-2", _p$.t = _v$2);
              return _p$;
            }, {
              e: void 0,
              t: void 0
            });
            return _el$3;
          })()];
        }
      });
    }
  });
};
const DedicationSelectionComponent = () => {
  let overlay;
  const model = DedicationsModel.get();
  const isMobile = ViewExperience() == UIViewExperience.Mobile;
  const isSmallScreen = useIsSmallScreen();
  const audio = useAudio("ChooseDedicationsPopup");
  const dedicationAudio = useAudio("ChooseDedicationsPopup/DragonDrop/DedicationCard");
  const hotkeyContext = useContext(HotkeyContext);
  const [shouldAutoFocusEmpty, setShouldAutoFocusEmpty] = createSignal(true);
  const [shouldAutoFocusAvailable, setShouldAutoFocusAvailable] = createSignal(false);
  onMount(() => {
    hotkeyContext.registerNavtray("cancel", "LOC_GENERIC_BACK");
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("cancel");
  });
  const onCardUpdated = () => {
    model.updateSelectedItems();
  };
  const onEffectUsed = () => {
    model.applyEffects();
  };
  const buttonConfirm = {
    onActivate: () => {
      const isSlotsFull = model.state.selectedItems.length == model.DEDICATIONS_SLOT_IDS.length;
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_DEDICATIONS_CONFIRM_DEDICATIONS_TITLE",
        body: isSlotsFull ? "LOC_DEDICATIONS_CONFIRM_DEDICATIONS_FULL" : "LOC_DEDICATIONS_CONFIRM_DEDICATIONS_EMPTY",
        canClose: false,
        displayQueue: "SystemMessage",
        addToFront: true,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            model.confirmDeck();
            ContextManager.pop("screen-dedication-selection");
          } else {
            setTimeout(() => {
              Input.setActiveContext(InputContext.Shell);
            }, 300);
          }
        }
      });
    },
    name: "LOC_GENERIC_CONFIRM"
  };
  const buttonViewMap = {
    onActivate: () => {
      ContextManager.pop("screen-dedication-selection");
    },
    name: "LOC_ADVANCED_START_VIEW_MAP"
  };
  onMount(() => {
    audio("popup-open");
    Telemetry.sendCardSelectionStart();
    engine.on("AdvancedStartCardAdded", onCardUpdated);
    engine.on("AdvancedStartCardRemoved", onCardUpdated);
    engine.on("AdvancedStartEffectUsed", onEffectUsed);
  });
  onCleanup(() => {
    engine.off("AdvancedStartCardAdded", onCardUpdated);
    engine.off("AdvancedStartCardRemoved", onCardUpdated);
    engine.off("AdvancedStartEffectUsed", onEffectUsed);
  });
  const handleDragDrop = (draggable, dropzone) => {
    const dragged = draggable.data;
    if (!model.hasItem(dropzone.data)) {
      model.equipItem(dragged, dropzone.data);
    } else {
      model.swapItem(dragged, dropzone.data);
    }
    dedicationAudio("dropAccept", {
      cardType: draggable.data
    });
  };
  const canEquipItem = (draggable, dropzone) => {
    const memo = createMemo(() => {
      const item = typeof draggable.data == "string" ? draggable.data : "";
      const slot = typeof dropzone.data == "string" ? dropzone.data : "";
      return item != "" && slot != "" ? model.canContain(slot) : false;
    });
    return memo;
  };
  const handleEquipmentDragEnd = (draggable, status, _zone, _position) => {
    switch (status) {
      case DragEndStatus.Released:
        dedicationAudio("dropReleased");
        model.unEquipItem(draggable.data);
        break;
      case DragEndStatus.RejectedByDropzone:
        dedicationAudio("dropReject");
        break;
    }
  };
  const handleActivateDedication = (card) => {
    if (model.contains(card.id, model.DEDICATIONS_AVAILABLE_ID) && model.canAutoSlotItem(card.id)) {
      model.autoSlotItem(card.id);
      setShouldAutoFocusEmpty(false);
      setShouldAutoFocusAvailable(true);
      return;
    }
    if (model.DEDICATIONS_SLOT_IDS.some((slot) => model.contains(card.id, slot))) {
      model.unEquipItem(card.id);
      setShouldAutoFocusEmpty(true);
      setShouldAutoFocusAvailable(false);
    }
  };
  const getNavTrayText = (id) => {
    if (model.contains(id, model.DEDICATIONS_AVAILABLE_ID)) {
      return "LOC_GENERIC_SELECT";
    }
    return "LOC_GENERIC_REMOVE";
  };
  return createComponent(Panel, {
    name: "Dedication Selection Screen",
    id: "screen-dedication-selection",
    "class": `${isMobile ? "fullscreen" : "flex"}`,
    get style() {
      return isMobile ? {} : {
        height: model.isSmallScreen() ? "auto" : Layout.pixels(860),
        width: model.isSmallScreen() ? "auto" : Layout.pixels(1060),
        position: model.isSmallScreen() ? "absolute" : void 0,
        top: model.isSmallScreen() ? Layout.pixels(-10) : "auto",
        bottom: model.isSmallScreen() ? Layout.pixels(-10) : "auto",
        left: model.isSmallScreen() ? Layout.pixels(-18) : "auto",
        right: model.isSmallScreen() ? Layout.pixels(-18) : "auto"
      };
    },
    get children() {
      return [(() => {
        var _el$4 = _tmpl$4();
        var _ref$ = overlay;
        typeof _ref$ === "function" ? use(_ref$, _el$4) : overlay = _el$4;
        return _el$4;
      })(), createComponent(AudioContextProvider, {
        segment: "ChooseDedicationsPopup",
        get children() {
          return createComponent(OrnatePopupFrame, {
            "class": "flex-auto",
            get style() {
              return {
                "padding-bottom": isMobile ? Layout.pixels(8) : model.isSmallScreen() ? Layout.pixels(0) : Layout.pixels(12)
              };
            },
            get topIconSrc() {
              return model.isSmallScreen() ? "" : "url('blp:sub_legacy_color')";
            },
            topIconClass: "size-9 -mt-1",
            topIconBackgroundTint: "#0089ff",
            longFiligree: !isMobile,
            noClose: !isMobile,
            closePopupCallback: isMobile ? () => ContextManager.pop("screen-dedication-selection") : void 0,
            isFullscreen: isMobile,
            get children() {
              return [(() => {
                var _el$5 = _tmpl$();
                className(_el$5, `absolute top-0 ${isMobile ? "left-2 mt-2" : "left-6 mt-4"} bottom-0 h-1/2 w-64 img-frame-filigree pointer-events-none`);
                return _el$5;
              })(), (() => {
                var _el$6 = _tmpl$();
                className(_el$6, `absolute top-0 ${isMobile ? "right-2 mt-2" : "right-6 mt-4"} bottom-0 h-1/2 w-64 rotate-y-180 img-frame-filigree pointer-events-none`);
                return _el$6;
              })(), createComponent(Show, {
                get when() {
                  return !model.isSmallScreen();
                },
                get fallback() {
                  return (() => {
                    var _el$11 = _tmpl$();
                    className(_el$11, `${isMobile ? "relative mt-6" : ""}`);
                    insert(_el$11, createComponent(Filigree.TitleAccent, {
                      get children() {
                        return [createComponent(OrnateTopIcon, {
                          "class": "mr-2",
                          get style() {
                            return {
                              height: Layout.pixels(36),
                              width: Layout.pixels(36)
                            };
                          },
                          iconClass: "size-5 -mt-0",
                          backgroundTint: "#0089ff",
                          iconSrc: "url('blp:sub_legacy_color')"
                        }), createComponent(Header, {
                          "class": `flex-auto max-w-full text-center justify-center`,
                          get children() {
                            return createComponent(L10n.Compose, {
                              text: "LOC_DEDICATIONS_CHOOSE_DEDICATIONS"
                            });
                          }
                        })];
                      }
                    }));
                    return _el$11;
                  })();
                },
                get children() {
                  var _el$7 = _tmpl$5();
                  insert(_el$7, createComponent(FiligreeTitle.H2, {
                    text: "LOC_DEDICATIONS_CHOOSE_DEDICATIONS",
                    bgGlow: true
                  }));
                  return _el$7;
                }
              }), createComponent(VSlot, {
                "class": "flex-auto w-full items-center",
                autoFocus: true,
                get children() {
                  return [createComponent(AudioContextProvider, {
                    segment: "DragonDrop",
                    get children() {
                      return createComponent(DragAndDrop, {
                        onDragDrop: handleDragDrop,
                        debugTrace: false,
                        overlayParent: overlay,
                        get children() {
                          return [createComponent(HSlot, {
                            "class": "justify-center",
                            tabindex: 0,
                            get autoFocus() {
                              return shouldAutoFocusEmpty();
                            },
                            get children() {
                              return createComponent(For, {
                                get each() {
                                  return model.DEDICATIONS_SLOT_IDS;
                                },
                                children: (slot, index) => createComponent(Dropzone, {
                                  debugId: `Empty Dropzone ${slot}`,
                                  data: slot,
                                  canDrop: canEquipItem,
                                  get children() {
                                    return createComponent(Show, {
                                      get when() {
                                        return model.items(slot)[0];
                                      },
                                      keyed: true,
                                      get fallback() {
                                        return createComponent(EmptySlot, {
                                          get ["class"]() {
                                            return `${isMobile ? `my-2 ${isSmallScreen() ? "mx-4" : "mx-7"}` : "m-2"}`;
                                          },
                                          onHover: () => hotkeyContext.unregisterNavtray("accept"),
                                          get tabIndex() {
                                            return index();
                                          }
                                        });
                                      },
                                      children: (slotCard) => createComponent(DedicationCard, {
                                        get id() {
                                          return slotCard.id;
                                        },
                                        "class": "flex-auto",
                                        get contentClass() {
                                          return `${isMobile ? `my-4 ${isSmallScreen() ? "mx-4" : "mx-7"}` : "m-3"}`;
                                        },
                                        get title() {
                                          return slotCard.title;
                                        },
                                        get description() {
                                          return slotCard.description;
                                        },
                                        get background() {
                                          return slotCard.descriptionBG;
                                        },
                                        get icon() {
                                          return slotCard.traitIcon;
                                        },
                                        onDragEnd: handleEquipmentDragEnd,
                                        onDedicationActivate: () => handleActivateDedication(slotCard),
                                        onHover: () => hotkeyContext.registerNavtray("accept", getNavTrayText(model.items(slot)[0].id)),
                                        onDehover: () => hotkeyContext.unregisterNavtray("accept"),
                                        get tabIndex() {
                                          return index();
                                        }
                                      })
                                    });
                                  }
                                })
                              });
                            }
                          }), (() => {
                            var _el$8 = _tmpl$6(), _el$9 = _el$8.firstChild;
                            className(_el$8, `flex flex-col items-center pointer-events-none ${isMobile ? "relative" : ""}`);
                            insert(_el$8, createComponent(Header, {
                              "class": `max-w-full text-center justify-center}`,
                              get children() {
                                return createComponent(L10n.Compose, {
                                  text: "LOC_DEDICATIONS_AVAILABLE_DEDICATIONS"
                                });
                              }
                            }), _el$9);
                            insert(_el$9, createComponent(L10n.Compose, {
                              text: "LOC_DEDICATIONS_CHOOSE_DEDICATIONS_DESC"
                            }));
                            createRenderEffect((_p$) => {
                              var _v$3 = model.isSmallScreen() ? Layout.pixels(4) : Layout.pixels(12), _v$4 = model.isSmallScreen() ? Layout.pixels(4) : Layout.pixels(12);
                              _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$8.style.setProperty("margin-top", _v$3) : _el$8.style.removeProperty("margin-top"));
                              _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$8.style.setProperty("margin-bottom", _v$4) : _el$8.style.removeProperty("margin-bottom"));
                              return _p$;
                            }, {
                              e: void 0,
                              t: void 0
                            });
                            return _el$8;
                          })(), (() => {
                            var _el$10 = _tmpl$();
                            className(_el$10, `flex flex-auto ${isMobile ? "px-5" : ""}`);
                            insert(_el$10, createComponent(InnerFrame, {
                              "class": "flex-auto w-full",
                              get children() {
                                return createComponent(ScrollArea, {
                                  "class": `flex-auto ${isMobile ? "px-5 py-2" : ""}`,
                                  useProxy: true,
                                  reserveSpace: true,
                                  get children() {
                                    return createComponent(Dropzone, {
                                      debugId: "Dedication Available Dropzone",
                                      get data() {
                                        return model.DEDICATIONS_AVAILABLE_ID;
                                      },
                                      canDrop: canEquipItem,
                                      get children() {
                                        return createComponent(SpatialSlot, {
                                          name: "Available Spatial Slot",
                                          "class": "flex justify-center items-start flex-wrap relative left-3 p-3",
                                          tabIndex: 1,
                                          get autoFocus() {
                                            return shouldAutoFocusAvailable();
                                          },
                                          get children() {
                                            return createComponent(For, {
                                              get each() {
                                                return model.items(model.DEDICATIONS_AVAILABLE_ID);
                                              },
                                              children: (card, index) => createComponent(DedicationCard, {
                                                get id() {
                                                  return card.id;
                                                },
                                                get contentClass() {
                                                  return `${isMobile ? `my-4 ${isSmallScreen() ? "mx-4" : "mx-7"}` : "m-3"} mt-5`;
                                                },
                                                get title() {
                                                  return card.title;
                                                },
                                                get description() {
                                                  return card.description;
                                                },
                                                get background() {
                                                  return card.descriptionBG;
                                                },
                                                get icon() {
                                                  return card.traitIcon;
                                                },
                                                get disabled() {
                                                  return card.isDisabled;
                                                },
                                                onDragEnd: handleEquipmentDragEnd,
                                                onDedicationActivate: () => handleActivateDedication(card),
                                                onHover: () => hotkeyContext.registerNavtray("accept", getNavTrayText(card.id)),
                                                onDehover: () => hotkeyContext.unregisterNavtray("accept"),
                                                get tabIndex() {
                                                  return index();
                                                }
                                              })
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            }));
                            return _el$10;
                          })()];
                        }
                      });
                    }
                  }), createComponent(HSlot, {
                    "class": `my-5 justify-center items-center ${isMobile ? "relative" : ""}`,
                    tabIndex: 2,
                    get children() {
                      return [createComponent(Header, {
                        role: "heading",
                        get children() {
                          return createComponent(L10n.Compose, {
                            text: "LOC_DEDICATIONS_PICK_YOUR_CAPITAL"
                          });
                        }
                      }), createComponent(Dropdown, {
                        "class": "ml-2 w-96 pointer-events-auto",
                        get defaultValue() {
                          return model.getSelectedCapitalCity();
                        },
                        onItemSelected: (item) => model.setSelectedCapital(item.id),
                        selectedItemTemplate: (item) => (() => {
                          var _el$12 = _tmpl$7();
                          insert(_el$12, (() => {
                            var _c$ = createMemo(() => !!item.isCapital);
                            return () => _c$() ? createComponent(L10n.Compose, {
                              text: "LOC_DEDICATIONS_CURRENT_CAPITAL",
                              get args() {
                                return [item.name];
                              }
                            }) : createComponent(L10n.Compose, {
                              get text() {
                                return item.name;
                              }
                            });
                          })());
                          return _el$12;
                        })(),
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return model.getAllCapitals();
                            },
                            children: (item) => createComponent(DropdownItem, {
                              value: item,
                              get children() {
                                return createMemo(() => !!item.isCapital)() ? createComponent(L10n.Compose, {
                                  text: "LOC_DEDICATIONS_CURRENT_CAPITAL",
                                  get args() {
                                    return [item.name];
                                  }
                                }) : createComponent(L10n.Compose, {
                                  get text() {
                                    return item.name;
                                  }
                                });
                              }
                            })
                          });
                        }
                      })];
                    }
                  }), createComponent(HSlot, {
                    get style() {
                      return {
                        "margin-bottom": isMobile ? Layout.pixels(18) : model.isSmallScreen() ? Layout.pixels(56) : Layout.pixels(24)
                      };
                    },
                    tabIndex: 3,
                    get children() {
                      return [createComponent(AudioContextProvider, {
                        segment: "Confirm",
                        get children() {
                          return createComponent(Button, {
                            "class": "mx-3",
                            get onActivate() {
                              return buttonConfirm.onActivate;
                            },
                            get children() {
                              return createComponent(L10n.Compose, {
                                get text() {
                                  return buttonConfirm.name || "";
                                }
                              });
                            }
                          });
                        }
                      }), createComponent(AudioContextProvider, {
                        segment: "ViewMap",
                        get children() {
                          return createComponent(Button, {
                            "class": "mx-3",
                            get onActivate() {
                              return buttonViewMap.onActivate;
                            },
                            get children() {
                              return createComponent(L10n.Compose, {
                                get text() {
                                  return buttonViewMap.name || "";
                                }
                              });
                            }
                          });
                        }
                      })];
                    }
                  })];
                }
              })];
            }
          });
        }
      })];
    }
  });
};
const DedicationSelection = ComponentRegistry.register({
  name: "DedicationSelection",
  createInstance: DedicationSelectionComponent
});
defineLegacyComponent("screen-dedication-selection", {
  classNames: ["fullscreen", "flex", "justify-center", "items-center"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(DedicationSelection, {});
});

export { DedicationCard, DedicationSelection, EmptySlot };
//# sourceMappingURL=dedication-selection.js.map
