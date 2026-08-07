import { template, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, createComponent, Show, createRenderEffect, createSignal, createEffect, on, For, onCleanup } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../../ui/context-manager/context-manager.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { CheckBox } from '../../components/check-box.js';
import { ForWithSeparator } from '../../components/for-with-separator.js';
import { Header } from '../../components/header.js';
import { HeroButton2 } from '../../components/hero-button.js';
import { InlineHotkey, Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { NavHelp } from '../../components/nav-help.js';
import { Popup } from '../../components/popup.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { VSlot } from '../../components/slot.js';
import { Tab } from '../../components/tab.js';
import { Tooltip } from '../../components/tooltip.js';
import { AgeIcon } from './age-icon.js';
import { useAgeSelectModelContext } from './age-select-model.js';
import { AttributeIcon } from './attribute-icon.js';
import { useCivSelectModelContext, createAgeFilterModel, attrFilter } from './civ-select-model.js';
import { CreateGameTabPips } from './create-game-components.js';
import { CreateGameStage, CreateGameStageMode, CreateGameStageHeader } from './create-game-stage.js';
import { TotIcon } from './tot-icon.js';
import { getCivUnlockTrackingManager } from '../unlocks/civ-unlock-tracking-manager.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { ViewExperience } from '../../services/view-experience.js';
import { QuestTrackerRefreshRequestName } from '../../../../base-standard/ui/quest-tracker/quest-tracker.js';
import style from './civ-select-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex items-center justify-center"><span class="uppercase text-accent-2 ml-4 mt-1 mb-2"></span></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="civ-details-card-outer mt-4"><div class=civ-details-card-inner></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="civ-details-card-outer mt-4"><div class=civ-details-card-inner></div><div class="flex items-center justify-center"><span class="uppercase text-accent-2 ml-4 mt-1 mb-2"></span></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col relative"><div class="bg-center bg-no-repeat opacity-80 absolute -left-32 -top-5"></div><div class="flex flex-row items-center"><span class="uppercase text-sm text-accent-2"></span></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center mt-6 h-32"><div class="civ-select-age-border-divider self-stretch mr-4"></div><div class="flex flex-col items-center justify-center "><div class="flex flex-row items-center justify-center"></div></div><div class="civ-select-age-border-divider self-stretch ml-4"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="civ-select-age-divider my-1"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<span class=size-16></span>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col relative"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="text-base text-secondary uppercase font-title"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="text-sm text-accent-2 uppercase"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-col"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="flex flex-col h-full"><div class="flex flex-row justify-between"><div class="h-0 overflow-visible"></div></div><div class="civ-select-divider my-2"></div><div class="flex flex-row uppercase items-center text-accent-2"></div><div class="civ-select-divider my-2"></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="font-sm mr-7 flex flex-row items-center"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex flex-row mb-1"><div class="size-28 flex items-center justify-center"></div><div class="civ-details-card-divider-v ml-2"></div><div class="flex-auto ml-3"><div class="text-base font-title uppercase text-tertiary-1"></div></div></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="flex flex-col h-full"><div class="flex flex-row justify-between"><div class="h-0 overflow-visible"></div></div><div class="civ-select-divider my-2"></div><div class="text-lg font-title uppercase font-bold text-secondary-2"></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="civ-details-card-divider-h mb-2 -ml-2 -mr-4 relative"></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class=civ-details-card-shadow></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="flex flex-row mb-1"><div class="size-28 flex items-center justify-center"></div><div class="civ-details-card-divider-v ml-2"></div><div class="flex-auto ml-3"><div class="text-base font-title uppercase text-tertiary-1"></div><div class="flex flex-row flex-wrap text-sm uppercase font-title text-accent-2"></div></div></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="flex flex-col h-full text-accent-2"><div class="flex flex-row justify-between"><div class="h-0 overflow-visible"></div></div><div class="civ-select-divider my-2"></div><div class="text-lg font-title uppercase font-bold text-secondary-2"></div></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class="text-lg font-title uppercase font-bold text-secondary"></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="text-sm mb-2"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div class="flex flex-row items-center w-full my-2"><div class="h-2 flex-auto bg-cover mr-2"></div><div class="uppercase ml-2 font-title text-secondary"></div><div class="h-2 flex-auto bg-cover ml-2"></div></div>`), _tmpl$23 = /* @__PURE__ */ template(`<div class="text-lg font-title uppercase font-bold text-secondary mt-3"></div>`), _tmpl$24 = /* @__PURE__ */ template(`<div class="flex flex-col h-full text-accent-2"><div class="flex flex-row justify-between"><div class="h-0 overflow-visible"></div></div><div class="civ-select-divider my-2"></div></div>`), _tmpl$25 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap w-full"></div>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col items-center justify-end group"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div><div class="flex items-center justify-center size-36 relative mb-4"></div></div>`), _tmpl$27 = /* @__PURE__ */ template(`<div class="filigree-h4-left mt-3"></div>`), _tmpl$28 = /* @__PURE__ */ template(`<div class="filigree-h4-right mt-3"></div>`), _tmpl$29 = /* @__PURE__ */ template(`<div><div class="flex flex-row flex-auto items-start"><div class="flex flex-col items-center h-full civ-details-left-content"></div><div class="flex flex-col w-187 h-full relative"><div class="flex flex-row mb-8 mt-4 items-center justify-center"></div></div></div></div>`);
const CivSelectTicketItemComponent = (props) => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const isApexAgeSelected = createMemo(() => civ().apexAge == props.selectedAge);
  const audio = useAudio("CivilizationDetails");
  onMount(() => {
    audio("popup-open");
  });
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
    insert(_el$2, () => props.children);
    insert(_el$, createComponent(Show, {
      get when() {
        return !props.alwaysAvailable;
      },
      get children() {
        var _el$3 = _tmpl$(), _el$4 = _el$3.firstChild;
        insert(_el$3, createComponent(TotIcon, {
          "class": "-mt-4 size-10",
          get isApexAge() {
            return isApexAgeSelected();
          }
        }), _el$4);
        insert(_el$4, createComponent(Show, {
          get when() {
            return !isApexAgeSelected();
          },
          get fallback() {
            return createComponent(L10n.Compose, {
              text: "LOC_UI_CREATE_GAME_AVAILABLE_APEX_AGE"
            });
          },
          get children() {
            return createComponent(L10n.Compose, {
              text: "LOC_UI_CREATE_GAME_AVAILABLE_IN_THE_AGE",
              get args() {
                return [civ().ageName];
              }
            });
          }
        }));
        return _el$3;
      }
    }), null);
    createRenderEffect(() => _el$.classList.toggle("apex", !!(isApexAgeSelected() || props.alwaysAvailable)));
    return _el$;
  })();
};
const CivSelectTicketItem = ComponentRegistry.register("CivSelectTicketItem", CivSelectTicketItemComponent);
const CivSelectBuildingsTicketItemComponent = (props) => {
  const ages = {
    AGE_ANTIQUITY: {
      label: "AGE_ANTIQUITY",
      value: 1
    },
    AGE_EXPLORATION: {
      label: "AGE_EXPLORATION",
      value: 2
    },
    AGE_MODERN: {
      label: "AGE_MODERN",
      value: 3
    }
  };
  const model = useCivSelectModelContext();
  const ageModel = useAgeSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const isApexAgeSelected = createMemo(() => civ().apexAge == props.selectedAge);
  const isBeforeApexAge = createMemo(() => ages[civ().apexAge].value > ages[props.selectedAge].value);
  const isAfterApexAge = createMemo(() => ages[civ().apexAge].value < ages[props.selectedAge].value);
  const avalaibilityLabel = createMemo(() => {
    if (isApexAgeSelected()) {
      return "LOC_UI_CREATE_GAME_AVAILABLE_APEX_AGE";
    }
    if (isBeforeApexAge()) {
      return Locale.compose("LOC_UI_CREATE_GAME_AVAILABLE_IN_THE_AGE", ageModel.getAgeName(civ().apexAge));
    }
    if (isAfterApexAge()) {
      return "LOC_UI_CREATE_GAME_AVAILABLE";
    }
    return "";
  });
  return (() => {
    var _el$5 = _tmpl$3(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild;
    insert(_el$6, () => props.children);
    insert(_el$7, createComponent(TotIcon, {
      "class": "-mt-4 size-10",
      get isApexAge() {
        return isApexAgeSelected();
      }
    }), _el$8);
    insert(_el$8, createComponent(L10n.Compose, {
      get text() {
        return avalaibilityLabel();
      }
    }));
    createRenderEffect(() => _el$5.classList.toggle("apex", !!(isApexAgeSelected() || isAfterApexAge())));
    return _el$5;
  })();
};
const CivSelectBuildingsTicketItem = ComponentRegistry.register("CivSelectBuildingsTicketItem", CivSelectBuildingsTicketItemComponent);
const CivInfoHeaderComponent = () => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  return (() => {
    var _el$9 = _tmpl$4(), _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling, _el$12 = _el$11.firstChild;
    _el$10.style.setProperty("background-image", "url(blp:popup_icon_glow.png)");
    _el$10.style.setProperty("background-size", "100% 100%");
    insert(_el$9, createComponent(Header, {
      "class": "text-custom civ-details-info-header-text mt-8 font-bold max-w-128",
      get children() {
        return civ().name;
      }
    }), _el$11);
    insert(_el$11, createComponent(AgeIcon, {
      get ageId() {
        return civ().apexAge;
      },
      "class": "mr-2 size-8"
    }), _el$12);
    insert(_el$12, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_NAME_AGE_CIVILIZATION",
      get args() {
        return [civ().ageName];
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = Layout.pixels(680), _v$2 = Layout.pixels(140);
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$10.style.setProperty("width", _v$) : _el$10.style.removeProperty("width"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$10.style.setProperty("height", _v$2) : _el$10.style.removeProperty("height"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$9;
  })();
};
const CivInfoHeader = ComponentRegistry.register("CivInfoHeader", CivInfoHeaderComponent);
const [selectedAgePreview, setSelectedAgePreview] = createSignal("");
const AgePreviewComponent = () => {
  const model = useCivSelectModelContext();
  const ageModel = useAgeSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  createEffect(on(() => ageModel.selectedAge.type, (agePreview) => setSelectedAgePreview(agePreview)));
  const ageApexText = {
    AGE_ANTIQUITY: "LOC_UI_CREATE_GAME_ANTIQUITY_APEX",
    AGE_EXPLORATION: "LOC_UI_CREATE_GAME_EXPLORATION_APEX",
    AGE_MODERN: "LOC_UI_CREATE_GAME_MODERN_APEX"
  };
  function updateAgePreviewIndex(amount) {
    const ages = ageModel.sortedAges;
    const curAge = ages.findIndex((age) => age.type == selectedAgePreview());
    let nextAge = curAge + amount;
    if (nextAge < 0) {
      nextAge += ages.length;
    } else if (nextAge >= ages.length) {
      nextAge -= ages.length;
    }
    setSelectedAgePreview(ages[nextAge].type);
  }
  return (() => {
    var _el$13 = _tmpl$5(), _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling, _el$16 = _el$15.firstChild;
    insert(_el$15, createComponent(L10n.Stylize, {
      text: "LOC_UI_CREATE_GAME_AGE_PREVIEW",
      "class": "uppercase text-sm text-accent-2 mb-3"
    }), _el$16);
    insert(_el$16, createComponent(AudioContextProvider, {
      segment: "AgePreviewButton",
      get children() {
        return [createComponent(InlineHotkey, {
          hotkeyAction: "nav-shell-previous",
          onActivate: () => updateAgePreviewIndex(-1)
        }), createComponent(ForWithSeparator, {
          get separator() {
            return _tmpl$6();
          },
          get each() {
            return ageModel.sortedAges;
          },
          children: (age) => (() => {
            var _el$18 = _tmpl$8();
            insert(_el$18, createComponent(Show, {
              get when() {
                return createMemo(() => civ().apexAge == age.type)() && civ().civID != "RANDOM";
              },
              get children() {
                return createComponent(Icon, {
                  name: `url('blp:unit_combat-shadow')`,
                  "class": "w-18 h-20 absolute inset-0 -mx-1 top-4 opacity-40"
                });
              }
            }), null);
            insert(_el$18, createComponent(Activatable, {
              disableFocus: true,
              onActivate: () => setSelectedAgePreview(age.type),
              "class": "flex flex-col group h-24",
              get children() {
                return [_tmpl$7(), createComponent(Icon, {
                  name: `url('blp:popup_icon_glow')`,
                  "class": "size-28 absolute inset-0 -m-6 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"
                }), createComponent(Icon, {
                  name: `url('blp:leaderselect_xp_fill')`,
                  "class": "size-22 absolute inset-0 -my-3 -mx-3 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"
                }), createComponent(AgeIcon, {
                  get ageId() {
                    return age.type;
                  },
                  "class": "size-16 absolute inset-0",
                  get apexTooltip() {
                    return civ().apexAge == age.type;
                  },
                  framedIcons: true
                })];
              }
            }), null);
            insert(_el$18, createComponent(Show, {
              get when() {
                return createMemo(() => civ().apexAge == age.type)() && civ().civID != "RANDOM";
              },
              get children() {
                return createComponent(Tooltip.Text, {
                  get text() {
                    return ageApexText[age.type];
                  },
                  get children() {
                    return createComponent(Icon, {
                      name: `url('blp:civ_apex_100x100')`,
                      "class": "size-9 absolute inset-0 top-16 left-3\\.5"
                    });
                  }
                });
              }
            }), null);
            insert(_el$18, createComponent(Show, {
              get when() {
                return age.type == selectedAgePreview();
              },
              get children() {
                return createComponent(Icon, {
                  name: `url(blp:dip_component-arrow)`,
                  "class": "w-8 h-12 -rotate-90 absolute inset-0 -top-6 mx-4"
                });
              }
            }), null);
            return _el$18;
          })()
        }), createComponent(InlineHotkey, {
          hotkeyAction: "nav-shell-next",
          onActivate: () => updateAgePreviewIndex(1)
        })];
      }
    }));
    return _el$13;
  })();
};
const AgePreview = ComponentRegistry.register("AgePreview", AgePreviewComponent);
const CivGeneralInfoComponent = () => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const activeAbility = createMemo(() => civ().perAgeAbilities.find((a) => a.age == selectedAgePreview()) ?? civ().perAgeAbilities.find((a) => !a.age));
  return (() => {
    var _el$20 = _tmpl$12(), _el$21 = _el$20.firstChild, _el$22 = _el$21.firstChild, _el$23 = _el$21.nextSibling, _el$24 = _el$23.nextSibling, _el$25 = _el$24.nextSibling;
    insert(_el$21, createComponent(CivInfoHeader, {}), _el$22);
    insert(_el$22, createComponent(AgePreview, {}));
    insert(_el$24, createComponent(For, {
      get each() {
        return civ().traits;
      },
      children: (attribute) => (() => {
        var _el$29 = _tmpl$13();
        insert(_el$29, createComponent(AttributeIcon, {
          "class": "size-8 mr-2",
          attribute
        }), null);
        insert(_el$29, createComponent(L10n.Compose, {
          text: attribute
        }), null);
        return _el$29;
      })()
    }));
    insert(_el$20, createComponent(ScrollArea, {
      "class": "flex-auto -mr-8",
      reserveSpace: true,
      useProxy: true,
      get children() {
        var _el$26 = _tmpl$11();
        insert(_el$26, createComponent(L10n.Stylize, {
          "class": "create-game-markup",
          get text() {
            return civ().introText;
          }
        }), null);
        insert(_el$26, createComponent(CivSelectTicketItem, {
          get selectedAge() {
            return selectedAgePreview();
          },
          get requiredAge() {
            return selectedAgePreview();
          },
          alwaysAvailable: true,
          get children() {
            return [(() => {
              var _el$27 = _tmpl$9();
              insert(_el$27, createComponent(L10n.Compose, {
                get text() {
                  return activeAbility()?.abilityTitle ?? "";
                }
              }));
              return _el$27;
            })(), (() => {
              var _el$28 = _tmpl$10();
              insert(_el$28, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_CIVILIZATION_ABILITY"
              }));
              return _el$28;
            })(), createComponent(L10n.Stylize, {
              "class": "create-game-markup mt-2",
              get text() {
                return activeAbility()?.abilityText ?? "";
              }
            })];
          }
        }), null);
        return _el$26;
      }
    }), null);
    return _el$20;
  })();
};
const CivGeneralInfo = ComponentRegistry.register("CivGeneralInfo", CivGeneralInfoComponent);
const BuildingOrUnitInfoComponent = (props) => {
  return (() => {
    var _el$30 = _tmpl$14(), _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling, _el$33 = _el$32.nextSibling, _el$34 = _el$33.firstChild;
    insert(_el$31, createComponent(Icon, {
      "class": "size-24",
      get name() {
        return props.icon;
      }
    }));
    insert(_el$34, createComponent(L10n.Compose, {
      get text() {
        return props.title;
      }
    }));
    insert(_el$33, createComponent(L10n.Stylize, {
      "class": "create-game-markup",
      get text() {
        return props.description;
      }
    }), null);
    return _el$30;
  })();
};
const BuildingOrUnitInfo = ComponentRegistry.register("BuildingOrUnitInfo", BuildingOrUnitInfoComponent);
const CivBuildingsInfoComponent = () => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const hasQuarter = createMemo(() => civ().buildings.some((b) => b.kind == "KIND_QUARTER"));
  return (() => {
    var _el$35 = _tmpl$15(), _el$36 = _el$35.firstChild, _el$37 = _el$36.firstChild, _el$38 = _el$36.nextSibling, _el$39 = _el$38.nextSibling;
    insert(_el$36, createComponent(CivInfoHeader, {}), _el$37);
    insert(_el$37, createComponent(AgePreview, {}));
    insert(_el$39, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_UNIQUE_BUILDINGS"
    }));
    insert(_el$35, createComponent(ScrollArea, {
      "class": "flex-auto -mr-8",
      reserveSpace: true,
      useProxy: true,
      get children() {
        var _el$40 = _tmpl$11();
        insert(_el$40, createComponent(Show, {
          get when() {
            return hasQuarter();
          },
          get fallback() {
            return createComponent(For, {
              get each() {
                return civ().buildings;
              },
              children: (building) => createComponent(CivSelectBuildingsTicketItem, {
                get selectedAge() {
                  return selectedAgePreview();
                },
                get requiredAge() {
                  return civ().apexAge;
                },
                get children() {
                  return createComponent(BuildingOrUnitInfo, building);
                }
              })
            });
          },
          get children() {
            return createComponent(CivSelectBuildingsTicketItem, {
              get selectedAge() {
                return selectedAgePreview();
              },
              get requiredAge() {
                return civ().apexAge;
              },
              get children() {
                return createComponent(ForWithSeparator, {
                  get separator() {
                    return _tmpl$16();
                  },
                  get each() {
                    return civ().buildings;
                  },
                  children: (building) => [createComponent(BuildingOrUnitInfo, building), createComponent(Show, {
                    get when() {
                      return building.kind == "KIND_QUARTER";
                    },
                    get children() {
                      return _tmpl$17();
                    }
                  })]
                });
              }
            });
          }
        }));
        return _el$40;
      }
    }), null);
    return _el$35;
  })();
};
const CivBuildingsInfo = ComponentRegistry.register("CivBuildingsInfo", CivBuildingsInfoComponent);
const CivUnitsInfoComponent = () => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  return (() => {
    var _el$43 = _tmpl$15(), _el$44 = _el$43.firstChild, _el$45 = _el$44.firstChild, _el$46 = _el$44.nextSibling, _el$47 = _el$46.nextSibling;
    insert(_el$44, createComponent(CivInfoHeader, {}), _el$45);
    insert(_el$45, createComponent(AgePreview, {}));
    insert(_el$47, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_UNIQUE_UNITS"
    }));
    insert(_el$43, createComponent(ScrollArea, {
      "class": "flex-auto -mr-8",
      reserveSpace: true,
      useProxy: true,
      get children() {
        var _el$48 = _tmpl$11();
        insert(_el$48, createComponent(For, {
          get each() {
            return civ().units;
          },
          children: (unit) => createComponent(CivSelectTicketItem, {
            get selectedAge() {
              return selectedAgePreview();
            },
            get requiredAge() {
              return civ().apexAge;
            },
            get children() {
              return createComponent(BuildingOrUnitInfo, unit);
            }
          })
        }));
        return _el$48;
      }
    }), null);
    return _el$43;
  })();
};
const CivUnitsInfo = ComponentRegistry.register("CivUnitsInfo", CivUnitsInfoComponent);
const TraditionItemComponent = (props) => {
  return (() => {
    var _el$49 = _tmpl$18(), _el$50 = _el$49.firstChild, _el$51 = _el$50.nextSibling, _el$52 = _el$51.nextSibling, _el$53 = _el$52.firstChild, _el$54 = _el$53.nextSibling;
    insert(_el$50, createComponent(Icon, {
      "class": "size-16",
      get name() {
        return `url('blp:${props.icon}')`;
      },
      isUrl: true
    }));
    insert(_el$53, createComponent(L10n.Compose, {
      get text() {
        return props.name;
      }
    }));
    insert(_el$54, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_UNLOCKED_WITH",
      get args() {
        return [props.civic];
      }
    }));
    insert(_el$52, createComponent(L10n.Stylize, {
      "class": "create-game-markup",
      get text() {
        return props.description;
      }
    }), null);
    return _el$49;
  })();
};
const TraditionItem = ComponentRegistry.register("TraditionItem", TraditionItemComponent);
const CivTraditionsInfoComponent = () => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const filteredTraditions = createMemo(() => {
    return civ().traditions.filter((t) => t.age == selectedAgePreview());
  });
  return (() => {
    var _el$55 = _tmpl$19(), _el$56 = _el$55.firstChild, _el$57 = _el$56.firstChild, _el$58 = _el$56.nextSibling, _el$59 = _el$58.nextSibling;
    insert(_el$56, createComponent(CivInfoHeader, {}), _el$57);
    insert(_el$57, createComponent(AgePreview, {}));
    insert(_el$59, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_TRADITIONS"
    }));
    insert(_el$55, createComponent(ScrollArea, {
      "class": "flex-auto -mr-8",
      reserveSpace: true,
      useProxy: true,
      get children() {
        var _el$60 = _tmpl$11();
        insert(_el$60, createComponent(CivSelectTicketItem, {
          get selectedAge() {
            return selectedAgePreview();
          },
          get requiredAge() {
            return selectedAgePreview();
          },
          alwaysAvailable: true,
          get children() {
            return createComponent(ForWithSeparator, {
              get separator() {
                return _tmpl$16();
              },
              get each() {
                return filteredTraditions();
              },
              children: (item) => createComponent(TraditionItem, {
                icon: "unlock_tradition",
                get civic() {
                  return item.civic;
                },
                get name() {
                  return item.title;
                },
                get description() {
                  return item.text;
                }
              })
            });
          }
        }));
        return _el$60;
      }
    }), null);
    return _el$55;
  })();
};
const CivTraditionsInfo = ComponentRegistry.register("CivTraditionsInfo", CivTraditionsInfoComponent);
const CivUnlocksInfoComponent = (props) => {
  const model = useCivSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const civUnlocks = createMemo(() => civ().unlocks);
  const civUnlockedBy = createMemo(() => civ().unlockedBy);
  const [isTracked, setIsTracked] = createSignal(false);
  const [civUnlockTrackingManager, setCivUnlockTrackingManager] = createSignal(UI.isInGame() ? getCivUnlockTrackingManager() : null);
  const refreshCivUnlockTrackingManager = () => {
    setCivUnlockTrackingManager(UI.isInGame() ? getCivUnlockTrackingManager() : null);
  };
  onMount(() => {
    window.addEventListener(QuestTrackerRefreshRequestName, refreshCivUnlockTrackingManager);
    onCleanup(() => {
      window.removeEventListener(QuestTrackerRefreshRequestName, refreshCivUnlockTrackingManager);
    });
  });
  const canTrack = createMemo(() => {
    const manager = civUnlockTrackingManager();
    return props.isUnlocks && (manager?.canTrack(civ().civID) ?? false);
  });
  createEffect(on(() => [civ().civID, civUnlockTrackingManager()], ([civID, manager]) => {
    setIsTracked(manager?.isTracked(civID) ?? false);
  }));
  return (() => {
    var _el$62 = _tmpl$24(), _el$63 = _el$62.firstChild, _el$64 = _el$63.firstChild, _el$65 = _el$63.nextSibling;
    insert(_el$63, createComponent(CivInfoHeader, {}), _el$64);
    insert(_el$64, createComponent(AgePreview, {}));
    insert(_el$62, createComponent(ScrollArea, {
      "class": "flex-auto -mr-8",
      reserveSpace: true,
      useProxy: true,
      get children() {
        return [createComponent(Show, {
          get when() {
            return civUnlockedBy().length > 0;
          },
          get children() {
            return [(() => {
              var _el$66 = _tmpl$20();
              insert(_el$66, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_UNLOCKED_BY"
              }));
              return _el$66;
            })(), (() => {
              var _el$67 = _tmpl$21();
              insert(_el$67, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_UNLOCKED_BY_DESCRIPTION"
              }));
              return _el$67;
            })(), createComponent(Show, {
              get when() {
                return canTrack();
              },
              get children() {
                var _el$68 = _tmpl$22(), _el$69 = _el$68.firstChild, _el$70 = _el$69.nextSibling, _el$71 = _el$70.nextSibling;
                _el$69.style.setProperty("background-image", "url(blp:shell_line-divider)");
                insert(_el$68, createComponent(CheckBox, {
                  "class": "size-6",
                  get isChecked() {
                    return isTracked();
                  },
                  onActivate: () => {
                    const civType = civ().civID;
                    const manager = civUnlockTrackingManager();
                    if (manager != null) {
                      if (manager.isTracked(civType)) {
                        manager.untrackCivUnlock(civType);
                        setIsTracked(false);
                        return;
                      }
                      manager.trackCivUnlock(civType);
                      setIsTracked(manager.isTracked(civType));
                    }
                  }
                }), _el$70);
                insert(_el$70, createComponent(L10n.Compose, {
                  text: "LOC_LEGACIES_TRACK"
                }));
                _el$71.style.setProperty("background-image", "url(blp:shell_line-divider)");
                return _el$68;
              }
            }), createComponent(For, {
              get each() {
                return civUnlockedBy();
              },
              children: (unlockedBy, _) => (() => {
                var _el$73 = _tmpl$25();
                insert(_el$73, createComponent(Show, {
                  get when() {
                    return props.isUnlocks;
                  },
                  get children() {
                    return createComponent(CheckBox, {
                      "class": "size-6",
                      get isChecked() {
                        return unlockedBy.isUnlocked;
                      },
                      disabled: true,
                      disableFocus: true
                    });
                  }
                }), null);
                insert(_el$73, createComponent(L10n.Stylize, {
                  "class": "flex-auto create-game-markup tight",
                  get text() {
                    return unlockedBy.text;
                  }
                }), null);
                return _el$73;
              })()
            })];
          }
        }), createComponent(Show, {
          get when() {
            return civUnlocks().length > 0;
          },
          get children() {
            return [(() => {
              var _el$72 = _tmpl$23();
              insert(_el$72, createComponent(L10n.Compose, {
                text: "LOC_CREATE_GAME_AGE_UNLOCK_TITLE"
              }));
              return _el$72;
            })(), createComponent(For, {
              get each() {
                return civUnlocks();
              },
              children: (unlock) => createComponent(L10n.Stylize, {
                text: unlock
              })
            })];
          }
        })];
      }
    }), null);
    return _el$62;
  })();
};
const CivUnlocksInfo = ComponentRegistry.register("CivUnlocksInfo", CivUnlocksInfoComponent);
const CivDetailsComponent = () => {
  const flowContext = useScreenFlowContext();
  const model = useCivSelectModelContext();
  const isInGame = UI.isInGame();
  return createComponent(CreateGameStage, {
    get header() {
      return createComponent(CreateGameStageHeader, {
        get showSteps() {
          return createMemo(() => !!!(ViewExperience() == UIViewExperience.Handheld))() && !UI.isInGame();
        },
        title: "LOC_UI_CREATE_GAME_CIVILIZATION_DETAILS",
        onBack: () => flowContext.activate("civ-select"),
        hideButtonText: isInGame ? "LOC_UI_AGE_TRANSITION_VIEW_MAP" : void 0
      });
    },
    get backgroundImage() {
      return model.selectedCiv().bgImage;
    },
    backgroundOpacity: 0.4,
    addTextBgGradient: true,
    get mode() {
      return isInGame ? CreateGameStageMode.StageOnly : CreateGameStageMode.Full;
    },
    get children() {
      return createComponent(CivDetailsBase, {});
    }
  });
};
const CivDetailsBase = () => {
  const model = useCivSelectModelContext();
  const ageModel = useAgeSelectModelContext();
  const civ = createMemo(() => model.viewCiv() ?? model.selectedCiv());
  const [selectedAge, setSelectedAge] = createSignal(ageModel.selectedAge.type);
  const isInGame = UI.isInGame();
  const isUnlocks = isInGame && !!ContextManager.getTarget("screen-legacies");
  let flowContext = void 0;
  if (!isUnlocks) {
    flowContext = useScreenFlowContext();
  }
  createEffect(on(() => ageModel.selectedAge.type, (age) => setSelectedAge(age)));
  return (() => {
    var _el$74 = _tmpl$29(), _el$75 = _el$74.firstChild, _el$76 = _el$75.firstChild, _el$84 = _el$76.nextSibling, _el$85 = _el$84.firstChild;
    className(_el$74, `flex flex-row h-full relative ${isUnlocks ? "w-full" : ""}`);
    insert(_el$76, createComponent(Hotkeys, {
      hotkeys: [{
        hotkeyAction: "accept",
        navTrayText: "LOC_GENERIC_SELECT"
      }]
    }), null);
    insert(_el$76, createComponent(Icon, {
      get name() {
        return `url('${civ().icon ?? ""}')`;
      },
      isUrl: true,
      "class": "size-40"
    }), null);
    insert(_el$76, createComponent(L10n.Stylize, {
      text: isUnlocks ? "LOC_LEGACIES_CURRENT_AGE" : "LOC_UI_CREATE_GAME_STARTING_AGE",
      "class": "font-title uppercase civ-select-age-text"
    }), null);
    insert(_el$76, createComponent(L10n.Stylize, {
      get text() {
        return ageModel.getAgeName(selectedAge()) || "";
      },
      "class": "font-title uppercase font-black mb-2 civ-select-age-type-text font-fit-shrink"
    }), null);
    insert(_el$76, createComponent(Popup.Trigger, {
      name: "age-select",
      get children() {
        return createComponent(AudioContextProvider, {
          segment: "AgeSelectPopup",
          get children() {
            return createComponent(Activatable, {
              "class": "civ-details-age-banner relative",
              disabled: isInGame,
              disableFocus: true,
              hotkeyAction: "shell-action-3",
              get children() {
                var _el$77 = _tmpl$26(), _el$78 = _el$77.firstChild, _el$79 = _el$78.nextSibling, _el$80 = _el$79.nextSibling, _el$81 = _el$80.nextSibling, _el$82 = _el$81.nextSibling, _el$83 = _el$82.nextSibling;
                _el$79.style.setProperty("background-position", "center center");
                _el$79.style.setProperty("background-size", "cover");
                _el$83.style.setProperty("background-image", "url(blp:hud_sub_circle_dis_128x128)");
                _el$83.style.setProperty("background-repeat", "no-repeat");
                _el$83.style.setProperty("background-size", "cover");
                insert(_el$83, createComponent(Icon, {
                  get name() {
                    return ageModel.selectedAge.icon;
                  },
                  "class": "size-24 -bottom-px relative"
                }));
                insert(_el$77, createComponent(NavHelp, {
                  "class": "absolute bottom-2 right-2"
                }), null);
                createRenderEffect((_p$) => {
                  var _v$3 = `url(${UI.getIconBLP(selectedAge(), "BACKGROUND_VERT")})`, _v$4 = Layout.pixels(132), _v$5 = Layout.pixels(132);
                  _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$79.style.setProperty("background-image", _v$3) : _el$79.style.removeProperty("background-image"));
                  _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$83.style.setProperty("width", _v$4) : _el$83.style.removeProperty("width"));
                  _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$83.style.setProperty("height", _v$5) : _el$83.style.removeProperty("height"));
                  return _p$;
                }, {
                  e: void 0,
                  t: void 0,
                  a: void 0
                });
                return _el$77;
              }
            });
          }
        });
      }
    }), null);
    _el$84.style.setProperty("color", "#1B1B1B");
    insert(_el$84, createComponent(Tab, {
      "class": "flex flex-col flex-auto mt-8",
      get children() {
        return [createComponent(VSlot, {
          disableFocus: true,
          "class": "flex-auto",
          get children() {
            return createComponent(Tab.Output, {});
          }
        }), createComponent(CreateGameTabPips, {}), createComponent(Tab.Item, {
          name: "civ-general",
          title: () => "General",
          body: () => createComponent(CivGeneralInfo, {})
        }), createComponent(Tab.Item, {
          name: "civ-buildings",
          title: () => "Buildings",
          body: () => createComponent(CivBuildingsInfo, {})
        }), createComponent(Tab.Item, {
          name: "civ-units",
          title: () => "Units",
          body: () => createComponent(CivUnitsInfo, {})
        }), createComponent(Tab.Item, {
          name: "civ-traditiions",
          title: () => "Traditions",
          body: () => createComponent(CivTraditionsInfo, {})
        }), createComponent(Show, {
          get when() {
            return civ().unlocks.length > 0 || civ().unlockedBy.length > 0;
          },
          get children() {
            return createComponent(Tab.Item, {
              name: "civ-age-unlocks",
              title: () => "Age Unlocks",
              body: () => createComponent(CivUnlocksInfo, {
                isUnlocks
              })
            });
          }
        })];
      }
    }), _el$85);
    insert(_el$85, createComponent(Show, {
      when: !isUnlocks,
      get children() {
        return [_tmpl$27(), createComponent(HeroButton2, {
          "class": "civ-details-continue-button",
          get disabled() {
            return civ().isLocked;
          },
          onActivate: () => {
            flowContext.activateNext();
            const ageFilter = createAgeFilterModel();
            ageFilter.reset();
            attrFilter.reset();
          },
          get autoFocus() {
            return !civ().isLocked;
          },
          get children() {
            return createComponent(L10n.Stylize, {
              text: "LOC_GENERIC_SELECT"
            });
          }
        }), createComponent(Activatable, {
          "data-name": "focus-parking",
          get disabled() {
            return !civ().isLocked;
          },
          get autoFocus() {
            return civ().isLocked;
          }
        }), _tmpl$28()];
      }
    }));
    return _el$74;
  })();
};
const CivDetails = ComponentRegistry.register({
  name: "CivDetails",
  createInstance: CivDetailsComponent,
  styles: [style]
});

export { AgePreview, BuildingOrUnitInfo, CivBuildingsInfo, CivDetails, CivDetailsBase, CivGeneralInfo, CivInfoHeader, CivSelectBuildingsTicketItem, CivSelectTicketItem, CivTraditionsInfo, CivUnitsInfo, CivUnlocksInfo, TraditionItem, selectedAgePreview, setSelectedAgePreview };
//# sourceMappingURL=civ-details.js.map
