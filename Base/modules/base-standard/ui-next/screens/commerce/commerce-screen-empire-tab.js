import { template, use, insert, classList } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createComponent, Show, For, mergeProps, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { FiligreeTitle } from '../../../../core/ui-next/components/filigree-title.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { OrnateCard } from '../../../../core/ui-next/components/ornate-card.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { CommerceScreenBaseTabContent } from './commerce-screen-base-tab-content.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="text-secondary self-center text-center text-accent-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="empire-resource-cards-row flex flex-row flex-wrap flex-auto relative"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="ml-1 text-white"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col w-full grow items-center mt-8"><div class="mb-2 w-full"></div><div class="w-full text-center items-center flex-col px-2"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-col w-full justify-center items-center mt-1 mb-1"><div class="flex flex-row flex-wrap"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="mx-2 h-10 w-0\\.5 bg-accent"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row items-center mb-1 px-2"></div>`);
const EMPIRE_CARD_MARGIN_RIGHT = Layout.pixelsToScreenPixels(20);
const EmpireResourceContainer = (props) => {
  let cardsRowRef;
  let cardsRowResizeObserver;
  const [empireResourceCardWidth, setEmpireResourceCardWidth] = createSignal(void 0);
  const [hasCheckedForWrap, setHasCheckedForWrap] = createSignal(false);
  const [numCardsInFirstRow, setNumCardsInFirstRow] = createSignal(0);
  const [isSecondMeasurementPass, setIsSecondMeasurementPass] = createSignal(false);
  let numResizes = 0;
  onMount(() => {
    cardsRowResizeObserver = new ResizeObserver(() => {
      delayByFrame(() => {
        checkForWrap();
      });
    });
    if (cardsRowRef) {
      cardsRowResizeObserver.observe(cardsRowRef);
      delayByFrame(() => {
        checkForWrap();
      });
    }
  });
  onCleanup(() => {
    cardsRowResizeObserver?.disconnect();
  });
  const checkForWrap = () => {
    numResizes++;
    if (numResizes > 25) {
      console.error("commerce-screen-empire-tab: Too many resizes, stopping measurement.");
      setHasCheckedForWrap(true);
      return;
    }
    if (!cardsRowRef) {
      setHasCheckedForWrap(false);
      return;
    }
    const cards = cardsRowRef.querySelectorAll(".empire-resource-card");
    if (cards.length === 0) {
      setHasCheckedForWrap(false);
      return;
    }
    const cardsRow = cards[0].closest(".empire-resource-cards-row");
    if (!cardsRow || cardsRow.clientWidth === 0) {
      setHasCheckedForWrap(false);
      return;
    }
    const firstCardTop = cards[0].getBoundingClientRect().top;
    const lastCardTop = cards[cards.length - 1].getBoundingClientRect().top;
    if (lastCardTop > firstCardTop) {
      const firstRowCards = Array.from(cards).filter((card) => card.getBoundingClientRect().top == firstCardTop);
      const parentWidth = cardsRow.clientWidth || 0;
      if (parentWidth != 0 && firstRowCards.length > 0) {
        const rowCardCount = firstRowCards.length;
        if (!isSecondMeasurementPass()) {
          setIsSecondMeasurementPass(true);
          setNumCardsInFirstRow(rowCardCount);
          delayByFrame(() => {
            checkForWrap();
          });
          return;
        }
        const firstCard = firstRowCards[0];
        const lastCard = firstRowCards[rowCardCount - 1];
        const rowUsedWidth = lastCard.offsetLeft + lastCard.offsetWidth - firstCard.offsetLeft;
        const currentCardWidth = Number.parseFloat(getComputedStyle(firstCard).width) || 0;
        const residualWidthPerCard = (parentWidth - rowUsedWidth) / rowCardCount;
        const newCardWidth = currentCardWidth + residualWidthPerCard;
        if (empireResourceCardWidth() !== newCardWidth + "px") {
          setEmpireResourceCardWidth(newCardWidth + "px");
        }
        setIsSecondMeasurementPass(false);
      }
    }
    setHasCheckedForWrap(true);
  };
  return createComponent(CommerceScreenBaseTabContent, {
    title: "LOC_COMMERCE_EMPIRE_RESOURCE_TITLE",
    description: "LOC_COMMERCE_EMPIRE_RESOURCES_DESCRIPTION",
    get children() {
      return createComponent(ScrollArea, {
        "class": "flex-auto",
        useProxy: true,
        get children() {
          var _el$ = _tmpl$2();
          var _ref$ = cardsRowRef;
          typeof _ref$ === "function" ? use(_ref$, _el$) : cardsRowRef = _el$;
          insert(_el$, createComponent(Show, {
            get when() {
              return props.empireResourceData.length == 0;
            },
            get children() {
              var _el$2 = _tmpl$();
              insert(_el$2, createComponent(L10n.Compose, {
                text: "LOC_COMMERCE_NO_EMPIRE_RESOURCES_DESCRIPTION"
              }));
              return _el$2;
            }
          }), null);
          insert(_el$, createComponent(For, {
            get each() {
              return props.empireResourceData;
            },
            children: (resourceData, index) => createComponent(OrnateCard, {
              get iconSrc() {
                return resourceData.iconSrc;
              },
              get ["class"]() {
                return `flex flex-col items-center justify-between relative pb-1 empire-resource-card ${hasCheckedForWrap() ? "opacity-100" : "opacity-0"}`;
              },
              get style() {
                return {
                  width: empireResourceCardWidth() !== void 0 ? empireResourceCardWidth() : Layout.pixelsToScreenPixels(384) + "px",
                  "margin-right": numCardsInFirstRow() === 0 || (index() + 1) % numCardsInFirstRow() !== 0 ? EMPIRE_CARD_MARGIN_RIGHT + "px" : "0px"
                };
              },
              get childrenInFront() {
                return createComponent(Icon, {
                  "class": "absolute top-2 size-6",
                  get name() {
                    return `url(blp:${resourceData.isTreasure ? "restype_treasure" : "restype_empire_v2"})`;
                  }
                });
              },
              get children() {
                return [(() => {
                  var _el$3 = _tmpl$4(), _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling;
                  insert(_el$4, createComponent(FiligreeTitle.Plain, {
                    get text() {
                      return resourceData.title;
                    },
                    get children() {
                      var _el$5 = _tmpl$3();
                      insert(_el$5, () => `[${resourceData.amount}]`);
                      return _el$5;
                    }
                  }));
                  insert(_el$6, createComponent(For, {
                    get each() {
                      return resourceData.description;
                    },
                    children: (description) => createComponent(CardFrame, {
                      "class": "w-full",
                      get children() {
                        var _el$9 = _tmpl$7();
                        insert(_el$9, createComponent(Show, {
                          get when() {
                            return resourceData.isCombatResource;
                          },
                          get children() {
                            return [createComponent(Icon, {
                              "class": "size-8",
                              name: "url(blp:pedia_combat)"
                            }), _tmpl$6()];
                          }
                        }), null);
                        insert(_el$9, createComponent(Show, {
                          get when() {
                            return IsControllerActive();
                          },
                          get fallback() {
                            return createComponent(L10n.Stylize, {
                              "class": "py-1 self-center text-center",
                              text: description
                            });
                          },
                          get children() {
                            return createComponent(L10n.Stylize, {
                              "class": "py-1 self-center text-center",
                              text: description,
                              args: ["disableTooltips"]
                            });
                          }
                        }), null);
                        return _el$9;
                      }
                    })
                  }));
                  return _el$3;
                })(), (() => {
                  var _el$7 = _tmpl$5(), _el$8 = _el$7.firstChild;
                  insert(_el$7, createComponent(FiligreeTitle.Plain, {
                    text: "LOC_COMMERCE_EMPIRE_RESOURCES_ORIGIN_TITLE"
                  }), _el$8);
                  insert(_el$8, createComponent(For, {
                    get each() {
                      return resourceData.resourceOriginData;
                    },
                    children: (originData) => createComponent(Tooltip.Text, {
                      header: "LOC_COMMERCE_EMPIRE_ORIGIN_CITIES",
                      get text() {
                        return resourceData.tooltips[originData.leaderId];
                      },
                      showFiligrees: false,
                      get children() {
                        return createComponent(PortraitIcon, mergeProps({
                          "class": "-mx-2 -my-1"
                        }, () => ({
                          playerId: originData.leaderId,
                          size: 14
                        })));
                      }
                    })
                  }));
                  return _el$7;
                })()];
              }
            })
          }), null);
          createRenderEffect((_$p) => classList(_el$, {
            "h-full justify-center": props.empireResourceData.length === 0
          }, _$p));
          return _el$;
        }
      });
    }
  });
};

export { EmpireResourceContainer };
//# sourceMappingURL=commerce-screen-empire-tab.js.map
