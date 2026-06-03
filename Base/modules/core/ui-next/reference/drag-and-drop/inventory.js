import { template, insert, style, className, render } from '../../../vendor/solid-js/web/dist/web.js';
import { createRenderEffect, createMemo, createComponent, Show, For } from '../../../vendor/solid-js/dist/solid.js';
import { useDragAndDropContext, useDropzoneContext, useDraggableContext, Draggable, DragEndStatus, DragAndDrop, Dropzone } from '../../components/drag-and-drop.js';
import { Header } from '../../components/header.js';
import { useInventoryModel } from './inventory-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class=tile></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="absolute top-0 left-2 font-body text-xl"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div>This will unequip any existing item in this slot.</div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-col justify-center items-center"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-col"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col"><div class="font-body text-lg ml-3 mt-2 mb-2 text-tertiary-1">Items can be placed in either bag. Only letters may be equipped in slots while Extras accepts up to 3 items of either type.</div><div class="flex flex-row flex-auto"></div></div>`);
const Tile = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, () => props.value ?? "?");
    createRenderEffect((_$p) => style(_el$, props.style, _$p));
    return _el$;
  })();
};
const NamedContainer = (props) => {
  const dndContext = useDragAndDropContext();
  const dzContext = useDropzoneContext();
  const extraClasses = createMemo(() => {
    const dz = dzContext.dropzone();
    if (dz && dndContext.isDragging()) {
      if (dzContext.canDrop()) {
        const overDZ = dndContext.overDropzone();
        if (overDZ && overDZ.dropzone.id == dz.id) {
          return "items-can-drop-hover cursor-pointer";
        } else {
          return "items-can-drop cursor-pointer";
        }
      } else {
        return "items-no-drop cursor-not-allowed";
      }
    }
    return "";
  });
  return (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
    insert(_el$3, () => props.caption);
    insert(_el$2, () => props.children, null);
    createRenderEffect(() => className(_el$2, `relative flex flex-row flex-wrap justify-around items-center items ${extraClasses()}`));
    return _el$2;
  })();
};
const EmptySlot = (props) => {
  const dndContext = useDragAndDropContext();
  const dzContext = useDropzoneContext();
  const extraClasses = createMemo(() => {
    const dz = dzContext.dropzone();
    if (dz && dndContext.isDragging()) {
      if (dzContext.canDrop()) {
        const overDZ = dndContext.overDropzone();
        if (overDZ && overDZ.dropzone.id == dz.id) {
          return "slot-can-drop-hover cursor-pointer";
        } else {
          return "slot-can-drop cursor-pointer";
        }
      } else {
        return "slot-no-drop cursor-not-allowed";
      }
    }
    return "";
  });
  return (() => {
    var _el$4 = _tmpl$3();
    insert(_el$4, () => props.caption);
    createRenderEffect(() => className(_el$4, `slot ${extraClasses()}`));
    return _el$4;
  })();
};
const DraggableTile = (props) => {
  const dragonDropContext = useDragAndDropContext();
  const context = useDraggableContext();
  const dzContext = useDropzoneContext();
  const tileOpacity = createMemo(() => {
    if (!context.isRenderingOverlay && dragonDropContext.isDragging() != null) {
      if (dzContext.dropzone() == null || !dzContext.canDrop()) {
        return "0.5";
      }
    }
    return "";
  });
  const cursor = createMemo(() => {
    if (!context.isRenderingOverlay && dragonDropContext.isDragging() != null) {
      if (dzContext.dropzone() != null && dzContext.canDrop()) {
        return "pointer";
      }
    } else {
      return "";
    }
  });
  const slotting = createMemo(() => {
    if (context.isRenderingOverlay) {
      const dz = dragonDropContext.overDropzone();
      if (dz && dz.canDrop()) {
        if (["Slot1", "Slot2", "Slot3"].includes(dz.dropzone.data)) {
          return true;
        }
      }
    }
    return false;
  });
  return (() => {
    var _el$5 = _tmpl$5();
    insert(_el$5, createComponent(Tile, {
      get value() {
        return props.value;
      },
      get style() {
        return {
          opacity: tileOpacity(),
          cursor: cursor()
        };
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return slotting();
      },
      get children() {
        var _el$6 = _tmpl$4();
        _el$6.style.setProperty("background-color", "white");
        _el$6.style.setProperty("color", "black");
        return _el$6;
      }
    }), null);
    return _el$5;
  })();
};
const InventoryItem = (props) => {
  return createComponent(Draggable, {
    get data() {
      return props.value;
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
    get children() {
      return createComponent(DraggableTile, {
        get value() {
          return props.value;
        }
      });
    }
  });
};
const App = () => {
  const inventory = useInventoryModel();
  const handleDragDrop = (draggable, dropzone) => {
    const dragged = draggable.data;
    if (dropzone.data == "Regional") {
      inventory.autoSlotItem(dragged);
      return;
    }
    inventory.equipItem(dragged, dropzone.data);
  };
  const handleEquipmentDragEnd = (draggable, status, _zone, _position) => {
    if (status == DragEndStatus.Released) {
      inventory.unEquipItem(draggable.data);
    }
  };
  const canEquipItem = (draggable, dropzone) => {
    const memo = createMemo(() => {
      const item = typeof draggable.data == "string" ? draggable.data : "";
      const slot = typeof dropzone.data == "string" ? dropzone.data : "";
      return item != "" && slot != "" ? inventory.canContain(item, slot) : false;
    });
    return memo;
  };
  const canDropIntoAutoEquip = (draggable, _dropzone) => {
    const memo = createMemo(() => {
      const item = typeof draggable.data == "string" ? draggable.data : "";
      return item != "" ? inventory.canAutoSlotItem(item) : false;
    });
    return memo;
  };
  const extrasCaption = createMemo(() => {
    const extras = inventory.state.containers.find((c) => c.id == "Extras");
    return `Extras ${inventory.items("Extras").length}/${extras?.maxCount}`;
  });
  return (() => {
    var _el$7 = _tmpl$8(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
    insert(_el$7, createComponent(Header, {
      "class": "ml-3 mt-2 mb-2",
      children: "Drag and Drop Inventory Example"
    }), _el$8);
    _el$9.style.setProperty("background-color", "grey");
    insert(_el$9, createComponent(DragAndDrop, {
      onDragDrop: handleDragDrop,
      debugTrace: true,
      get children() {
        return [(() => {
          var _el$10 = _tmpl$6();
          _el$10.style.setProperty("max-width", "50%");
          insert(_el$10, createComponent(Dropzone, {
            debugId: "Bag1 Dropzone",
            data: "Bag1",
            get children() {
              return createComponent(NamedContainer, {
                caption: "Container 1",
                get children() {
                  return createComponent(For, {
                    get each() {
                      return inventory.items("Bag1");
                    },
                    children: (item) => createComponent(InventoryItem, {
                      value: item
                    })
                  });
                }
              });
            }
          }), null);
          insert(_el$10, createComponent(Dropzone, {
            debugId: "Bag2 Dropzone",
            data: "Bag2",
            get children() {
              return createComponent(NamedContainer, {
                caption: "Container 2",
                get children() {
                  return createComponent(For, {
                    get each() {
                      return inventory.items("Bag2");
                    },
                    children: (item) => createComponent(InventoryItem, {
                      value: item
                    })
                  });
                }
              });
            }
          }), null);
          return _el$10;
        })(), (() => {
          var _el$11 = _tmpl$7();
          _el$11.style.setProperty("flex", "2 1 auto");
          insert(_el$11, createComponent(Dropzone, {
            debugId: "Regional Dropzone",
            data: "Regional",
            canDrop: canDropIntoAutoEquip,
            get children() {
              return createComponent(NamedContainer, {
                caption: "Gear",
                get children() {
                  return createComponent(For, {
                    each: ["Slot1", "Slot2", "Slot3"],
                    children: (slot) => createComponent(Dropzone, {
                      debugId: "Nested Dropzone",
                      data: slot,
                      canDrop: canEquipItem,
                      get children() {
                        return createComponent(Show, {
                          get when() {
                            return inventory.items(slot).length > 0;
                          },
                          get fallback() {
                            return createComponent(EmptySlot, {
                              caption: slot
                            });
                          },
                          get children() {
                            return createComponent(InventoryItem, {
                              get value() {
                                return inventory.items(slot)[0];
                              },
                              onDragEnd: handleEquipmentDragEnd
                            });
                          }
                        });
                      }
                    })
                  });
                }
              });
            }
          }), null);
          insert(_el$11, createComponent(Dropzone, {
            debugId: "Extras Dropzone",
            data: "Extras",
            canDrop: canEquipItem,
            get children() {
              return createComponent(NamedContainer, {
                get caption() {
                  return extrasCaption();
                },
                get children() {
                  return createComponent(For, {
                    get each() {
                      return inventory.items("Extras");
                    },
                    children: (item) => createComponent(InventoryItem, {
                      value: item,
                      onDragEnd: handleEquipmentDragEnd
                    })
                  });
                }
              });
            }
          }), null);
          return _el$11;
        })()];
      }
    }));
    return _el$7;
  })();
};
engine.whenReady.then(() => {
  render(() => {
    return createComponent(App, {});
  }, document.getElementById("root"));
});

export { Tile };
//# sourceMappingURL=inventory.js.map
