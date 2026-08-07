import { template, spread, insert, use, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, mergeProps, Show, createMemo, Switch, Match, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { PoliciesModel } from './model-policies.js';
import { setTraditionSlotsFocused, setPolicySlotsFocused, getCivBGFromPolicy, getCivIconFromPolicy, getAdditionalPolicyIcon, policiesFocus, traditionsFocus } from './policies-support.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="size-full absolute"data-info-name=resize-container></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto"><div class="flex flex-auto flex-col p-4"><div class="relative w-full justify-start items-center flex flex-row"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div><div class="size-full absolute"data-info-name=resize-container></div><div class="flex flex-row flex-auto"><div class="flex flex-auto flex-col p-4"><div class="relative w-full justify-start items-center flex flex-row"></div></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class="inset-0 absolute empty-card-tint"><div class="h-1\\/2 w-full policy-card-frame"></div><div class="h-1\\/2 w-full -scale-y-100 policy-card-frame"></div></div><div class="flex flex-row size-full"><div class="flex flex-auto size-full justify-center text-xs font-title tracking-100 uppercase items-center"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div class="inset-0 absolute empty-card-tint"><div class="h-1\\/2 w-full policy-card-frame"></div><div class="h-1\\/2 w-full -scale-y-100 policy-card-frame"></div></div><div class="flex flex-row size-full"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="inset-0 absolute"><div class="h-1\\/2 w-full policy-card-frame"></div><div class="h-1\\/2 w-full -scale-y-100 policy-card-frame"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-col relative"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="w-6 flex items-center relative left-0\\.5 ml-px"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="inset-0 absolute"><div class="size-full absolute policy-card-bg-image"data-name=tradition-card-bg></div><div class=size-full data-name=tradition-card-bg-overlay></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="w-full py-2"><div class="flex h-px w-full"></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div><div class="relative size-full bg-cover bg-center bg-no-repeat new-dot-tint"></div><div class="absolute inset-1 bg-cover bg-center bg-no-repeat"></div></div>`);
const PolicyCard = (props) => {
  const model = PoliciesModel.get();
  function disableClick() {
    if (props.card.CultureSlotType == "TRADITION_CULTURE_SLOT" && model.canSwapPolicies || props.card.CultureSlotType == "POLICY_CULTURE_SLOT" && model.canSwapPolicies) {
      return false;
    }
    if (props.card.CultureSlotType == "CRISIS_CULTURE_SLOT" && model.canSwapCrisis) {
      return false;
    }
    return true;
  }
  function setFocusStyles(mouseEnter) {
    const slotType = props.card.CultureSlotType;
    if (props.isActive) {
      return;
    }
    if (slotType == "TRADITION_CULTURE_SLOT" && mouseEnter) {
      setTraditionSlotsFocused(true);
    }
    if (slotType == "TRADITION_CULTURE_SLOT" && !mouseEnter) {
      setTraditionSlotsFocused(false);
    }
    if (slotType == "POLICY_CULTURE_SLOT" && mouseEnter) {
      setPolicySlotsFocused(true);
    }
    if (slotType == "POLICY_CULTURE_SLOT" && !mouseEnter) {
      setPolicySlotsFocused(false);
    }
  }
  function focusableNotActivatable() {
    return disableClick() && IsControllerActive();
  }
  function cardCannotMove() {
    if (props.isActive) {
      return false;
    }
    return !model.canSlotCard(props.card);
  }
  return createComponent(AudioContextProvider, {
    segment: "PolicyCard",
    get children() {
      return createComponent(Activatable, mergeProps(props, {
        ref(r$) {
          var _ref$ = props.ref;
          typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
        },
        get disabled() {
          return createMemo(() => !!disableClick())() && !IsControllerActive() || cardCannotMove();
        },
        get ["class"]() {
          return `flex flex-col my-1 relative text-accent-1 policy-base-card ${props.isActive ? "ml-4" : "ml-2"} ${!props.card.Name ? "opacity-0" : ""} ${props.card.CultureSlotType == "TRADITION_CULTURE_SLOT" ? "tradition-base-bg" : props.card.CultureSlotType == "CRISIS_CULTURE_SLOT" ? "crisis-base-bg" : "policy-base-bg"}`;
        },
        onActivate: () => [focusableNotActivatable() ? null : model.onCardClick(props.card, props.isActive, props.tradSlot)],
        onMouseOver: () => setFocusStyles(true),
        onMouseLeave: () => setFocusStyles(false),
        onFocus: () => setFocusStyles(true),
        onBlur: () => setFocusStyles(false),
        get disableFocus() {
          return !props.card.Name;
        },
        get autoFocus() {
          return props.autoFocus;
        },
        get audioComponentAlias() {
          return focusableNotActivatable() || !props.card ? "" : props.isActive ? "Assigned" : "Unassigned";
        },
        get children() {
          return [(() => {
            var _el$ = _tmpl$();
            spread(_el$, props, false, false);
            return _el$;
          })(), createComponent(Show, {
            get when() {
              return props.isTradition;
            },
            get children() {
              return createComponent(BackgroundImage, {
                get bgImage() {
                  return getCivBGFromPolicy(props.card);
                }
              });
            }
          }), createComponent(DecorativeFrame, {}), (() => {
            var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild;
            insert(_el$2, createComponent(IconPod, props), _el$3);
            insert(_el$4, createComponent(Show, {
              get when() {
                return props.isTradition;
              },
              get children() {
                return createComponent(Icon, {
                  "class": "tradition-civ-icon",
                  get name() {
                    return `url('blp:${getCivIconFromPolicy(props.card) ?? ""}')`;
                  },
                  isUrl: true
                });
              }
            }), null);
            insert(_el$4, createComponent(Show, {
              get when() {
                return getAdditionalPolicyIcon(props.card) != "";
              },
              get children() {
                return createComponent(Icon, {
                  "class": "tradition-civ-icon mr-1",
                  get name() {
                    return `url('blp:${getAdditionalPolicyIcon(props.card) ?? ""}')`;
                  },
                  isUrl: true
                });
              }
            }), null);
            insert(_el$4, createComponent(L10n.Stylize, {
              get text() {
                return props.name ?? "";
              },
              "class": "flex flex-auto font-title uppercase tracking-100 break-words text-sm font-bold"
            }), null);
            insert(_el$3, createComponent(DividerGradient, props), null);
            insert(_el$3, createComponent(L10n.Stylize, {
              get text() {
                return props.description ?? "";
              },
              "class": "text-sm relative text-left text-accent-2"
            }), null);
            return _el$2;
          })(), createComponent(NewDot, {
            "class": "absolute top-1\\.5 right-1\\.5",
            get visible() {
              return props.isNewCard;
            }
          })];
        }
      }));
    }
  });
};
const DisplayPolicyCard = (props) => {
  return (() => {
    var _el$5 = _tmpl$3(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild;
    var _ref$2 = props.ref;
    typeof _ref$2 === "function" ? use(_ref$2, _el$5) : props.ref = _el$5;
    spread(_el$5, mergeProps(props, {
      get ["class"]() {
        return `flex flex-col my-1 ml-1 relative text-accent-1 policy-base-card gov-overview mr-3\\.5 ${!props.card.Name ? "opacity-0" : ""} ${props.card.CultureSlotType == "TRADITION_CULTURE_SLOT" ? "tradition-base-bg" : props.card.CultureSlotType == "CRISIS_CULTURE_SLOT" ? "crisis-base-bg" : "policy-base-bg"}`;
      }
    }), false, true);
    spread(_el$6, props, false, false);
    insert(_el$5, createComponent(Show, {
      get when() {
        return props.isTradition;
      },
      get children() {
        return createComponent(BackgroundImage, {
          get bgImage() {
            return getCivBGFromPolicy(props.card);
          }
        });
      }
    }), _el$7);
    insert(_el$5, createComponent(DecorativeFrame, {}), _el$7);
    insert(_el$7, createComponent(IconPod, props), _el$8);
    insert(_el$9, createComponent(Show, {
      get when() {
        return props.isTradition;
      },
      get children() {
        return createComponent(Icon, {
          "class": "tradition-civ-icon",
          get name() {
            return `url('blp:${getCivIconFromPolicy(props.card) ?? ""}')`;
          },
          isUrl: true
        });
      }
    }), null);
    insert(_el$9, createComponent(L10n.Stylize, {
      get text() {
        return props.name ?? "";
      },
      "class": "flex flex-auto font-title uppercase tracking-100 break-words text-sm font-bold"
    }), null);
    insert(_el$8, createComponent(DividerGradient, props), null);
    insert(_el$8, createComponent(L10n.Stylize, {
      get text() {
        return props.description ?? "";
      },
      "class": "text-sm relative text-left text-accent-2"
    }), null);
    insert(_el$5, createComponent(NewDot, {
      "class": "absolute top-1\\.5 right-1\\.5",
      get visible() {
        return props.isNewCard;
      }
    }), null);
    return _el$5;
  })();
};
const CardSlot = (props) => {
  function getSlotStyles() {
    return policiesFocus() ? "policy-slot-bg empty-base-bg-highlight" : traditionsFocus() && props.slotType == "TRADITION_CULTURE_SLOT" ? "tradition-slot-bg empty-base-bg-highlight" : "opacity-50 empty-base-bg";
  }
  return (() => {
    var _el$10 = _tmpl$4(), _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$12.firstChild;
    var _ref$3 = props.ref;
    typeof _ref$3 === "function" ? use(_ref$3, _el$10) : props.ref = _el$10;
    spread(_el$10, mergeProps(props, {
      "data-name": "empty card slot",
      get ["class"]() {
        return `pointer-events-none my-1 ml-4 relative empty-base-card ${getSlotStyles()}`;
      }
    }), false, true);
    insert(_el$12, createComponent(SlotIconPod, mergeProps(props, {
      isSlot: true
    })), _el$13);
    insert(_el$13, createComponent(L10n.Stylize, {
      "class": "text-accent-1",
      get text() {
        return props.slotType == "TRADITION_CULTURE_SLOT" ? "LOC_UI_POLICIES_ADD_TRADITION" : "LOC_UI_POLICIES_ADD_POLICY";
      }
    }));
    return _el$10;
  })();
};
const BlankCardSlot = (props) => {
  return (() => {
    var _el$14 = _tmpl$5(), _el$15 = _el$14.firstChild;
    var _ref$4 = props.ref;
    typeof _ref$4 === "function" ? use(_ref$4, _el$14) : props.ref = _el$14;
    spread(_el$14, mergeProps(props, {
      "data-name": "empty card slot",
      "class": `pointer-events-none my-1 ml-1 mr-4 relative policy-base-card empty-base-bg opacity-0`
    }), false, true);
    return _el$14;
  })();
};
const DecorativeFrame = () => {
  return _tmpl$6();
};
const IconPod = (props) => {
  return (() => {
    var _el$17 = _tmpl$8();
    insert(_el$17, createComponent(Switch, {
      get fallback() {
        return createComponent(Icon, {
          "class": "policy-card-icon-backer left-px absolute bg-left flex items-center",
          name: `url('blp:accent_circle_policy')`,
          isUrl: true,
          get children() {
            return createComponent(Icon, {
              "class": "policy-card-icon -ml-5",
              name: `url('blp:icon_policy')`,
              isUrl: true
            });
          }
        });
      },
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.tradSlot;
          },
          get children() {
            var _el$18 = _tmpl$7();
            insert(_el$18, createComponent(Icon, {
              get ["class"]() {
                return `policy-card-icon-backer left-px absolute bottom-0 bg-left flex items-center ${props.card.CultureSlotType != "TRADITION_CULTURE_SLOT" ? "policy-grayscale" : ""}`;
              },
              name: `url('blp:accent_hex_tradition')`,
              isUrl: true,
              get children() {
                return [createComponent(Icon, {
                  "class": "policy-card-icon -ml-5",
                  get name() {
                    return `${props.card.CultureSlotType == "TRADITION_CULTURE_SLOT" ? "url('blp:icon_tradition')" : "url('blp:icon_tradition_gray')"}`;
                  },
                  isUrl: true
                }), createComponent(Show, {
                  get when() {
                    return props.card.CultureSlotType != "TRADITION_CULTURE_SLOT";
                  },
                  get children() {
                    return createComponent(Icon, {
                      "class": "absolute policy-card-icon -ml-5 policy-dark-backer opacity-30",
                      get name() {
                        return `${props.card.CultureSlotType == "TRADITION_CULTURE_SLOT" ? "url('blp:icon_tradition')" : "url('blp:icon_tradition_gray')"}`;
                      },
                      isUrl: true
                    });
                  }
                })];
              }
            }), null);
            insert(_el$18, createComponent(Icon, {
              get ["class"]() {
                return `policy-card-icon-backer left-px absolute top-0 bg-left flex items-center ${props.card.CultureSlotType != "POLICY_CULTURE_SLOT" ? "policy-grayscale" : ""}`;
              },
              name: `url('blp:accent_circle_policy')`,
              isUrl: true,
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return props.card.CultureSlotType != "POLICY_CULTURE_SLOT";
                  },
                  get children() {
                    return createComponent(Icon, {
                      "class": "absolute policy-card-icon -ml-5 policy-dark-backer opacity-30",
                      get name() {
                        return `${props.card.CultureSlotType == "POLICY_CULTURE_SLOT" ? "url('blp:icon_policy')" : "url('blp:icon_policy')"}`;
                      },
                      isUrl: true
                    });
                  }
                }), createComponent(Icon, {
                  "class": "policy-card-icon -ml-5",
                  get name() {
                    return `${props.card.CultureSlotType == "POLICY_CULTURE_SLOT" ? "url('blp:icon_policy')" : "url('blp:icon_policy_gray')"}`;
                  },
                  isUrl: true
                })];
              }
            }), null);
            return _el$18;
          }
        }), createComponent(Match, {
          get when() {
            return props.card.CultureSlotType == "TRADITION_CULTURE_SLOT";
          },
          get children() {
            return createComponent(Icon, {
              "class": "policy-card-icon-backer left-px absolute bg-left flex items-center",
              name: `url('blp:accent_hex_tradition')`,
              isUrl: true,
              get children() {
                return createComponent(Icon, {
                  "class": "policy-card-icon -ml-5",
                  name: `url('blp:icon_tradition')`,
                  isUrl: true
                });
              }
            });
          }
        }), createComponent(Match, {
          get when() {
            return props.card.CultureSlotType == "CRISIS_CULTURE_SLOT";
          },
          get children() {
            return createComponent(Icon, {
              "class": "policy-card-icon-backer left-px absolute bg-left flex items-center",
              name: `url('blp:accent_triangle_crisis_gray')`,
              isUrl: true,
              get children() {
                return createComponent(Icon, {
                  "class": "policy-card-icon -ml-5",
                  name: `url('blp:icon_crisis')`,
                  isUrl: true
                });
              }
            });
          }
        })];
      }
    }));
    return _el$17;
  })();
};
const SlotIconPod = (props) => {
  return (() => {
    var _el$19 = _tmpl$8();
    insert(_el$19, createComponent(Switch, {
      get fallback() {
        return createComponent(Icon, {
          get ["class"]() {
            return `policy-card-icon-backer left-px absolute bg-left flex items-center ${policiesFocus() ? "" : "policy-grayscale"}`;
          },
          name: `url('blp:accent_circle_policy')`,
          isUrl: true,
          get children() {
            return createComponent(Icon, {
              get ["class"]() {
                return `policy-card-icon -ml-5 ${policiesFocus() ? "policies-focus-icon-scale" : "policy-grayscale"}`;
              },
              name: `url('blp:icon_policy')`,
              isUrl: true
            });
          }
        });
      },
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.slotType == "TRADITION_CULTURE_SLOT";
          },
          get children() {
            var _el$20 = _tmpl$7();
            insert(_el$20, createComponent(Icon, {
              get ["class"]() {
                return `policy-card-icon-backer left-px absolute bottom-0 bg-left flex items-center ${traditionsFocus() ? "" : "policy-grayscale"}`;
              },
              name: `url('blp:accent_hex_tradition')`,
              isUrl: true,
              get children() {
                return createComponent(Icon, {
                  get ["class"]() {
                    return `policy-card-icon -ml-5 ${traditionsFocus() ? "policies-focus-icon-scale" : ""}`;
                  },
                  name: `url('blp:icon_tradition')`,
                  isUrl: true
                });
              }
            }), null);
            insert(_el$20, createComponent(Icon, {
              get ["class"]() {
                return `policy-card-icon-backer left-px absolute top-0 bg-left flex items-center ${policiesFocus() ? "" : "policy-grayscale"}`;
              },
              name: `url('blp:accent_circle_policy')`,
              isUrl: true,
              get children() {
                return createComponent(Icon, {
                  get ["class"]() {
                    return `policy-card-icon -ml-5 ${policiesFocus() ? "policies-focus-icon-scale" : ""}`;
                  },
                  name: `url('blp:icon_policy')`,
                  isUrl: true
                });
              }
            }), null);
            return _el$20;
          }
        }), createComponent(Match, {
          get when() {
            return props.slotType == "CRISIS_CULTURE_SLOT";
          },
          get children() {
            return createComponent(Icon, {
              "class": "policy-card-icon-backer left-px absolute bg-left flex items-center",
              name: `url('blp:accent_triangle_crisis_gray')`,
              isUrl: true,
              get children() {
                return createComponent(Icon, {
                  "class": "policy-card-icon -ml-5",
                  name: `url('blp:icon_crisis')`,
                  isUrl: true
                });
              }
            });
          }
        })];
      }
    }));
    return _el$19;
  })();
};
const BackgroundImage = (props) => {
  return (() => {
    var _el$21 = _tmpl$9(), _el$22 = _el$21.firstChild, _el$23 = _el$22.nextSibling;
    _el$22.style.setProperty("background-size", "cover");
    _el$22.style.setProperty("background-position-x", "50%");
    _el$23.style.setProperty("background-image", "url('blp:frame_policy_tradition_dark')");
    _el$23.style.setProperty("background-size", "cover");
    _el$23.style.setProperty("background-position-x", "50%");
    createRenderEffect((_$p) => (_$p = `url('${props.bgImage}')`) != null ? _el$22.style.setProperty("background-image", _$p) : _el$22.style.removeProperty("background-image"));
    return _el$21;
  })();
};
const DividerGradient = (props) => {
  function getBG() {
    if (props.card.CultureSlotType == "TRADITION_CULTURE_SLOT") {
      return "linear-gradient(to right, rgba(162, 147, 122, 1), rgba(162, 147, 122, 0))";
    } else {
      return "linear-gradient(to right, rgba(121, 134, 146, 1), rgba(121, 134, 146, 0))";
    }
  }
  return (() => {
    var _el$24 = _tmpl$10(), _el$25 = _el$24.firstChild;
    createRenderEffect((_$p) => (_$p = getBG()) != null ? _el$25.style.setProperty("background-image", _$p) : _el$25.style.removeProperty("background-image"));
    return _el$24;
  })();
};
const NewDot = (props) => {
  return createComponent(Show, {
    get when() {
      return props.visible;
    },
    get children() {
      var _el$26 = _tmpl$11(), _el$27 = _el$26.firstChild, _el$28 = _el$27.nextSibling;
      _el$27.style.setProperty("background-image", "url(blp:new_dot_base)");
      _el$28.style.setProperty("background-image", "url(blp:new_dot_highlite)");
      createRenderEffect(() => className(_el$26, `size-3\\.5 ${props.class}`));
      return _el$26;
    }
  });
};

export { BlankCardSlot, CardSlot, DisplayPolicyCard, PolicyCard };
//# sourceMappingURL=policy-card.js.map
