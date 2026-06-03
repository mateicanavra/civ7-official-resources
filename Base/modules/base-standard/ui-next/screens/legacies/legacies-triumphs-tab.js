import { template, insert, use, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, createSignal, onMount, createEffect, on, onCleanup, createComponent, For, createRenderEffect, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { useWindowSize } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { createLayoutComplete } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { useLegaciesScreenContext, TriumphFilterOptions } from './legacies-model.js';
import { TriumphCard } from './triumph-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full text-center text-accent-2 text-sm"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="mt-2 flex flex-col flex-auto items-center mx-8 mb-5 pl-8 pr-8 pt-2 relative"><div class="absolute h-6 -top-0\\.5 -left-1\\.5 -right-1\\.5"></div><div class="flex flex-col flex-auto w-full pb-4 relative"><div class="flex flex-row w-full items-center px-4"><div class="text-secondary uppercase font-title"></div><div class="flex flex-row flex-auto items-center justify-end"></div></div></div><div class="absolute h-6 -bottom-0\\.5 -left-1\\.5 -right-1\\.5 -scale-y-100"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap relative items-start justify-center pt-3"></div>`);
const LegaciesTriumphTab = () => {
  const model = useLegaciesScreenContext();
  const hotkeyContext = useContext(HotkeyContext);
  const audio = useAudio("LegaciesTriumphsPopup");
  let root;
  const layoutComplete = createLayoutComplete();
  const windowSize = useWindowSize();
  const [triumphCardHeight, setTriumphCardHeight] = createSignal(void 0);
  const [hasInitialCardHeight, setHasInitialCardHeight] = createSignal(false);
  const calculateTriumphCardHeights = () => {
    if (!root) {
      return;
    }
    const cards = Array.from(root.querySelectorAll(".triumph-card"));
    if (cards.length === 0) {
      setTriumphCardHeight(void 0);
      setHasInitialCardHeight(true);
      return;
    }
    const tallestCardHeight = Math.max(...cards.map((card) => Math.max(card.offsetHeight, card.scrollHeight)));
    const newHeight = tallestCardHeight + "px";
    setTriumphCardHeight(newHeight);
    setHasInitialCardHeight(true);
  };
  const matchesTriumphFilter = (filterOptions, isTracked) => {
    const selectedFilter = model.selectedTriumphFilter();
    if (selectedFilter === TriumphFilterOptions.TRACKED) {
      return isTracked;
    }
    if (selectedFilter === TriumphFilterOptions.UNTRACKED) {
      return !isTracked;
    }
    return filterOptions.some((filter) => filter == selectedFilter);
  };
  onMount(() => {
    audio("popup-open");
    hotkeyContext.registerNavtray("accept", "LOC_LEGACIES_TRACK_UNTRACK");
    hotkeyContext.registerNavtray("shell-action-2", "LOC_ADVANCED_START_FILTER");
    createEffect(on([layoutComplete, model.selectedTriumphFilter, windowSize], () => {
      if (layoutComplete()) {
        calculateTriumphCardHeights();
      }
    }));
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("accept");
    hotkeyContext.unregisterNavtray("shell-action-2");
  });
  const currentSetType = Configuration.getGame().getValue("LegacySet");
  const currentSetDefinition = GameInfo.LegacySets.find((set) => set.$hash === currentSetType);
  const isDefaultOrNone = !currentSetDefinition || currentSetDefinition.LegacySetType === "LEGACY_SET_DEFAULT" || currentSetDefinition.LegacySetType === "LEGACY_SET_NONE";
  const triumphsTitle = Locale.compose("LOC_LEGACIES_TRIUMPHS_TITLE");
  const currentSetName = isDefaultOrNone ? triumphsTitle : Locale.compose(currentSetDefinition.Name) + " " + triumphsTitle;
  return [(() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(L10n.Compose, {
      text: "LOC_TRIUMPHS_TAB_DESCRIPTION"
    }));
    return _el$;
  })(), (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$4.nextSibling;
    var _ref$ = root;
    typeof _ref$ === "function" ? use(_ref$, _el$2) : root = _el$2;
    _el$2.style.setProperty("background-image", "linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.7), rgba(20, 20, 20, 0.8))");
    _el$3.style.setProperty("border-image-source", "url(blp:hud_section-line)");
    _el$3.style.setProperty("border-image-slice", "4 32 0 32 fill");
    _el$3.style.setProperty("border-image-width", "auto");
    insert(_el$6, currentSetName);
    insert(_el$7, createComponent(L10n.Compose, {
      text: "LOC_ADVANCED_START_FILTER"
    }), null);
    insert(_el$7, createComponent(Dropdown, {
      disableFocus: true,
      "class": "ml-2 w-60 pointer-events-auto grow-0",
      selectedItemTemplate: (item) => (() => {
        var _el$9 = _tmpl$3();
        insert(_el$9, createComponent(L10n.Stylize, {
          text: `LOC_LEGACIES_FILTER_${item}`
        }));
        createRenderEffect(() => className(_el$9, `flex font-fit-shrink ${window.innerWidth <= Layout.pixelsToScreenPixels(1280) ? "text-xs" : ""}`));
        return _el$9;
      })(),
      get defaultValue() {
        return TriumphFilterOptions.DEFAULT;
      },
      onItemSelected: (item) => {
        model.setSelectedTriumphFilter(item);
      },
      hotkey: "shell-action-2",
      get children() {
        return createComponent(For, {
          get each() {
            return Object.keys(TriumphFilterOptions);
          },
          children: (item) => createComponent(DropdownItem, {
            value: item,
            get children() {
              return createComponent(L10n.Stylize, {
                text: `LOC_LEGACIES_FILTER_${item}`
              });
            }
          })
        });
      }
    }), null);
    insert(_el$4, createComponent(Divider.Horizontal, {
      "class": "w-full h-0\\\\.5 my-2"
    }), null);
    insert(_el$4, createComponent(SpatialSlot, {
      name: "TriumphsTabScrollable",
      "class": "flex-auto",
      get children() {
        return createComponent(ScrollArea, {
          "class": "flex-auto pl-4",
          get children() {
            return createComponent(For, {
              get each() {
                return model.triumphSections;
              },
              children: (section) => createComponent(CollapsibleContainer, {
                disableFocus: true,
                get titleText() {
                  return section.titleText;
                },
                centerTitle: true,
                "class": "mb-2",
                get children() {
                  var _el$10 = _tmpl$4();
                  insert(_el$10, createComponent(For, {
                    get each() {
                      return section.triumphs;
                    },
                    children: (legacy) => createComponent(Show, {
                      get when() {
                        return matchesTriumphFilter(legacy.filterOptions, legacy.isTracked);
                      },
                      get children() {
                        return createComponent(TriumphCard, {
                          triumph: legacy,
                          model,
                          get style() {
                            return {
                              height: triumphCardHeight()
                            };
                          },
                          get ["class"]() {
                            return `${hasInitialCardHeight() ? "opacity-100" : "opacity-0"}`;
                          }
                        });
                      }
                    })
                  }));
                  return _el$10;
                }
              })
            });
          }
        });
      }
    }), null);
    _el$8.style.setProperty("border-image-source", "url(blp:hud_section-line)");
    _el$8.style.setProperty("border-image-slice", "4 32 0 32 fill");
    _el$8.style.setProperty("border-image-width", "auto");
    return _el$2;
  })()];
};

export { LegaciesTriumphTab };
//# sourceMappingURL=legacies-triumphs-tab.js.map
