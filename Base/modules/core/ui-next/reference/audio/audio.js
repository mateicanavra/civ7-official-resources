import { template, insert, render } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, createMemo, createRenderEffect, For, createSignal, onMount } from '../../../vendor/solid-js/dist/solid.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Button } from '../../components/button.js';
import { useDraggableContext, useDragAndDropContext, DragEndStatus, DragAndDrop, Draggable, Dropzone } from '../../components/drag-and-drop.js';
import { Header } from '../../components/header.js';
import { Icon } from '../../components/icon.js';
import { Panel } from '../../components/panel.js';
import { RadioButton } from '../../components/radio-button.js';
import { SandboxBox } from '../../sandbox/sandbox-box.js';
import { SandboxNavigation } from '../../sandbox/sandbox-navigation.js';
import { useAudio } from '../../services/audio-support.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex justify-between"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row w-full"><div class="flex grow"></div><div class="flex size-50"></div><div class="flex size-50"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center"><div class="flex flex-col justify-center items-end mr-4"><div class="flex flex-row items-center mb-4">Ada Lovelace:&nbsp;</div><div class="flex flex-row items-center">Gilgamesh:&nbsp;</div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col"></div>`);
const ComponentBox = (props) => {
  return createComponent(SandboxBox, {
    "class": "flex flex-col justify-start items-center flex-auto",
    get children() {
      return [createComponent(Header, {
        "class": "mb-2",
        get children() {
          return props.name;
        }
      }), createMemo(() => props.children)];
    }
  });
};
const DraggableResource = (props) => {
  const draggable = useDraggableContext();
  const dndContext = useDragAndDropContext();
  const filter = createMemo(() => {
    if (draggable.isDragging()) {
      if (!draggable.isRenderingOverlay) {
        return "grayscale(100%)";
      } else if (dndContext.overDropzone()?.canDrop() === true) {
        return "fxs-color-tint(rgb(0, 255, 0))";
      } else if (dndContext.overDropzone()?.canDrop() === false) {
        return "fxs-color-tint(rgb(255, 0, 0))";
      }
    }
    return "";
  });
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Icon, {
      "class": "size-20",
      get name() {
        return props.resourceType;
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = filter(), _v$2 = !draggable.isDragging() || draggable.isRenderingOverlay ? "" : "0.4";
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$.style.setProperty("filter", _v$) : _el$.style.removeProperty("filter"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$.style.setProperty("opacity", _v$2) : _el$.style.removeProperty("opacity"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const DragAndDropExample = () => {
  const audio = useAudio("DraggableResource");
  const handleDragEnd = (draggable, status, _dropzone) => {
    switch (status) {
      case DragEndStatus.AcceptedByDropzone:
        audio("dropAccept", {
          resourceType: draggable.data
        });
        break;
      case DragEndStatus.RejectedByDropzone:
        audio("dropReject");
        break;
    }
  };
  const neverCanDrop = (_draggable, _dropzone) => {
    return () => false;
  };
  const resources = ["RESOURCE_SUGAR", "RESOURCE_COFFEE", "RESOURCE_FISH"];
  return createComponent(DragAndDrop, {
    onDragEnd: handleDragEnd,
    get children() {
      var _el$2 = _tmpl$3(), _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling, _el$6 = _el$5.nextSibling;
      insert(_el$3, createComponent(SandboxBox, {
        "class": "flex flex-col justify-start items-center flex-auto",
        get children() {
          return [createComponent(Header, {
            "class": "mb-2",
            children: "Draggables"
          }), (() => {
            var _el$4 = _tmpl$2();
            insert(_el$4, createComponent(For, {
              each: resources,
              children: (resource) => createComponent(Draggable, {
                data: resource,
                onDragEnd: handleDragEnd,
                get children() {
                  return createComponent(DraggableResource, {
                    resourceType: resource
                  });
                }
              })
            }));
            return _el$4;
          })()];
        }
      }));
      insert(_el$5, createComponent(Dropzone, {
        data: null,
        get children() {
          return createComponent(SandboxBox, {
            "class": "flex flex-col justify-start items-center flex-auto",
            get children() {
              return createComponent(Header, {
                "class": "mb-2",
                children: "Dropzone 1"
              });
            }
          });
        }
      }));
      insert(_el$6, createComponent(Dropzone, {
        data: null,
        canDrop: neverCanDrop,
        get children() {
          return createComponent(SandboxBox, {
            "class": "flex flex-col justify-start items-center flex-auto",
            get children() {
              return createComponent(Header, {
                "class": "mb-2",
                children: "Dropzone 2"
              });
            }
          });
        }
      }));
      return _el$2;
    }
  });
};
const App = () => {
  const simpleNav = new SandboxNavigation();
  let ref;
  const [leader, setLeader] = createSignal("LEADER_ADA_LOVELACE");
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  const rules = [{
    path: "Button",
    events: {
      activate: "play-button"
    }
  }, {
    path: "Contextual/Button",
    events: {
      activate: "play-button-contextual"
    }
  }, {
    path: "Button",
    constraints: {
      leader: "LEADER_ADA_LOVELACE"
    },
    events: {
      activate: "play-button-{leader}"
    }
  }, {
    path: "Button",
    constraints: {
      leader: {
        op: "eq",
        value: "LEADER_GILGAMESH"
      }
    },
    events: {
      activate: "play-button-gilgamesh"
    }
  }, {
    path: "DragonDrop/DraggableResource",
    events: {
      dropAccept: "play-drop-THIS-IS-A-BUG!",
      //! FIX ME - This event should not have been hit since there's a latter rule that handles dropAccept.
      dropReject: "play-drop-reject"
    }
  }, {
    path: "DragonDrop/DraggableResource",
    events: {
      dropAccept: "play-drop-{resourceType}"
    }
  }];
  return createComponent(Panel, {
    id: "sandbox-panel",
    name: "Sandbox",
    "class": "w-full h-full flex flex-col",
    ref(r$) {
      var _ref$ = ref;
      typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
    },
    get children() {
      return createComponent(AudioContextProvider, {
        rules,
        get children() {
          return [createComponent(Header, {
            "class": "text-2xl mt-4",
            children: "UI-Next Audio Sandbox"
          }), (() => {
            var _el$7 = _tmpl$6();
            insert(_el$7, createComponent(ComponentBox, {
              name: "Simple",
              get children() {
                return createComponent(Button, {
                  children: "Play"
                });
              }
            }), null);
            insert(_el$7, createComponent(ComponentBox, {
              name: "Contextual",
              get children() {
                return createComponent(AudioContextProvider, {
                  segment: "Contextual",
                  get children() {
                    var _el$8 = _tmpl$4();
                    insert(_el$8, createComponent(Button, {
                      children: "Play"
                    }));
                    return _el$8;
                  }
                });
              }
            }), null);
            insert(_el$7, createComponent(ComponentBox, {
              name: "Variables",
              get children() {
                var _el$9 = _tmpl$5(), _el$10 = _el$9.firstChild, _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$11.nextSibling, _el$14 = _el$13.firstChild;
                insert(_el$11, createComponent(RadioButton, {
                  get isChecked() {
                    return leader() == "LEADER_ADA_LOVELACE";
                  },
                  onActivate: () => {
                    setLeader("LEADER_ADA_LOVELACE");
                  }
                }), null);
                insert(_el$13, createComponent(RadioButton, {
                  get isChecked() {
                    return leader() == "LEADER_GILGAMESH";
                  },
                  onActivate: () => {
                    setLeader("LEADER_GILGAMESH");
                  }
                }), null);
                insert(_el$9, createComponent(AudioContextProvider, {
                  get vars() {
                    return {
                      leader: leader()
                    };
                  },
                  get children() {
                    return createComponent(Button, {
                      children: "Play"
                    });
                  }
                }), null);
                return _el$9;
              }
            }), null);
            insert(_el$7, createComponent(ComponentBox, {
              name: "Drag & Drop",
              get children() {
                return createComponent(AudioContextProvider, {
                  segment: "DragonDrop",
                  get children() {
                    return createComponent(DragAndDropExample, {});
                  }
                });
              }
            }), null);
            return _el$7;
          })()];
        }
      });
    }
  });
};
engine.whenReady.then(() => {
  render(() => {
    return createComponent(App, {});
  }, document.getElementById("root"));
});
//# sourceMappingURL=audio.js.map
