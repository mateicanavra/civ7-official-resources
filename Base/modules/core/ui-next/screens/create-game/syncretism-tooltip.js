import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, splitProps, mergeProps, Show, For } from '../../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { Tooltip } from '../../components/tooltip.js';
import { AgeIcon } from './age-icon.js';
import { SyncretismDataModel } from './syncretism-model.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './civ-select-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row items-center"><div class="self-stretch w-0\\.5 bg-primary-3 mr-2"></div><div class="flex flex-col pr-13"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="civ-details-card-outer"><div class="civ-details-card-inner flex flex-col gap-1"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col items-stretch"><div class="flex flex-col mb-1 items-center"><div class="flex flex-row items-center"><span class="uppercase text-sm text-accent-2"></span></div></div><div class="flex flex-col gap-2"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="self-stretch h-0\\.5 bg-primary-3 mr-2"></div>`);
const SyncretismEntry = (props) => {
  const icon = createMemo(() => {
    if (props.Kind == "KIND_QUARTER") return "CITY_UNIQUE_QUARTER";
    return props.Type;
  });
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    insert(_el$, createComponent(Icon, {
      "class": "size-8 mr-2",
      get name() {
        return icon();
      }
    }), _el$2);
    insert(_el$3, createComponent(L10n.Stylize, {
      "class": "uppercase text-tertiary-1 text-sm font-title uppercase",
      get text() {
        return props.Name;
      }
    }), null);
    insert(_el$3, createComponent(L10n.Stylize, {
      "class": "text-sm create-game-markup tight",
      get text() {
        return props.Description;
      }
    }), null);
    return _el$;
  })();
};
const SyncretismTooltipComponent = (props) => {
  const [local, other] = splitProps(props, ["children", "class", "civilizationType"]);
  const civData = createMemo(() => SyncretismDataModel.Info.get(local.civilizationType));
  return createComponent(Tooltip, mergeProps(other, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get ["class"]() {
          return local.class;
        },
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "w-128",
            get children() {
              var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$5.nextSibling;
              insert(_el$5, createComponent(L10n.Stylize, {
                "class": "uppercase text-tertiary-1 font-title uppercase",
                get text() {
                  return civData().CivilizationName;
                }
              }), _el$6);
              insert(_el$6, createComponent(AgeIcon, {
                get ageId() {
                  return civData().AgeType;
                },
                "class": "mr-2 size-8"
              }), _el$7);
              insert(_el$7, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_AVAILABLE_IN_THE_AGE",
                get args() {
                  return [civData().AgeName];
                }
              }));
              insert(_el$8, createComponent(Show, {
                get when() {
                  return civData().Infrastructure.length > 0;
                },
                get children() {
                  var _el$9 = _tmpl$2(), _el$10 = _el$9.firstChild;
                  insert(_el$9, createComponent(L10n.Stylize, {
                    "class": "uppercase text-accent-2 my-1 ml-4",
                    text: "LOC_CREATE_GAME_UNLOCK_SYNCRETISM_INFRASTRUCTURE"
                  }), _el$10);
                  insert(_el$10, createComponent(For, {
                    get each() {
                      return civData().Infrastructure;
                    },
                    children: (unlock, index) => [createComponent(Show, {
                      get when() {
                        return index() != 0;
                      },
                      get children() {
                        return _tmpl$4();
                      }
                    }), createComponent(SyncretismEntry, unlock)]
                  }));
                  return _el$9;
                }
              }), null);
              insert(_el$8, createComponent(Show, {
                get when() {
                  return civData().Unit.length > 0;
                },
                get children() {
                  var _el$11 = _tmpl$2(), _el$12 = _el$11.firstChild;
                  insert(_el$11, createComponent(L10n.Stylize, {
                    "class": "uppercase text-accent-2 my-1 ml-4",
                    text: "LOC_CREATE_GAME_UNLOCK_SYNCRETISM_UNITS"
                  }), _el$12);
                  insert(_el$12, createComponent(For, {
                    get each() {
                      return civData().Unit;
                    },
                    children: (unlock, index) => [createComponent(Show, {
                      get when() {
                        return index() != 0;
                      },
                      get children() {
                        return _tmpl$4();
                      }
                    }), createComponent(SyncretismEntry, unlock)]
                  }));
                  return _el$11;
                }
              }), null);
              return _el$4;
            }
          });
        }
      })];
    }
  }));
};
const SyncretismTooltip = ComponentRegistry.register({
  name: "SyncretismTooltip",
  createInstance: SyncretismTooltipComponent,
  images: ["blp:base_ticket-bg", "blp:shell_line-divider"],
  styles: [style]
});

export { SyncretismTooltip, SyncretismTooltipComponent };
//# sourceMappingURL=syncretism-tooltip.js.map
