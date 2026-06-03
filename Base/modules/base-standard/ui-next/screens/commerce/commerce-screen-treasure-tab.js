import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, For, mergeProps, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';
import { TreasureConvoyCard } from './treasure-convoy-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap flex-auto relative"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-col flex-wrap text-wrap text-center items-center justify-center my-4"><div class="text-secondary uppercase"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap flex-auto relative mt-6"></div>`);
const TreasureResourceContainer = (props) => {
  return createComponent(CommerceScreenBaseTabContent, {
    title: "LOC_COMMERCE_TREASURE_FLEETS_TITLE",
    description: "LOC_COMMERCE_TREASURE_EMPTY_DESCRIPTION",
    get children() {
      return createComponent(ScrollArea, {
        "class": "flex-auto",
        get children() {
          var _el$ = _tmpl$();
          insert(_el$, createComponent(For, {
            get each() {
              return props.sections;
            },
            children: (section) => createComponent(CollapsibleContainer, mergeProps(() => section.collapsibleContainerData, {
              "class": "w-full",
              headerClass: "font-title fxs-header",
              get children() {
                return createComponent(Show, {
                  get when() {
                    return section.fleets.length == 0 && section.emptyTitle != void 0;
                  },
                  get fallback() {
                    return (() => {
                      var _el$4 = _tmpl$3();
                      insert(_el$4, createComponent(For, {
                        get each() {
                          return section.fleets;
                        },
                        children: (fleet) => createComponent(TreasureConvoyCard, {
                          fleet,
                          get inGeneratingConvoysSection() {
                            return section.generatingConvoys;
                          }
                        })
                      }));
                      return _el$4;
                    })();
                  },
                  get children() {
                    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
                    insert(_el$3, createComponent(L10n.Compose, {
                      text: "LOC_COMMERCE_TREASURE_FLEETS_EMPTY_TITLE"
                    }));
                    insert(_el$2, createComponent(Icon, {
                      "class": "bg-center bg-contain bg-no-repeat w-16 h-4",
                      name: "url(popup_middle_decor)"
                    }), null);
                    insert(_el$2, createComponent(L10n.Compose, {
                      text: "LOC_COMMERCE_TREASURE_FLEETS_EMPTY_DESCRIPTION"
                    }), null);
                    return _el$2;
                  }
                });
              }
            }))
          }));
          return _el$;
        }
      });
    }
  });
};

export { TreasureResourceContainer };
//# sourceMappingURL=commerce-screen-treasure-tab.js.map
