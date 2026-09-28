import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, createRenderEffect, For, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { HSlot } from '../../../../core/ui-next/components/slot.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { VictoryCountdownTooltip } from '../../tooltips/victory-countdown-tooltip.js';
import style from './victories-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute left-0 h-full"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative flex-auto flex flex-col justify-center"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute -translate-x-1\\/2"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="countdown-bar-portrait absolute"></div>`);
const VictoryCountdownBarComponent = (props) => {
  const playersByIndex = createMemo(() => {
    const playersByIndexDictionary = {};
    for (let i = 0; i < props.countdownDuration; i++) {
      playersByIndexDictionary[i] = [];
    }
    props.players.forEach((player) => {
      const index = player.countdownProgress;
      if (playersByIndexDictionary[index]) {
        playersByIndexDictionary[index].push(player);
      } else {
        console.warn("Invalid countdownProgress:", index, player);
      }
    });
    return playersByIndexDictionary;
  });
  const furthestProgress = createMemo(() => {
    if (props.players.length === 0) {
      return 0;
    }
    return props.players.reduce((max, player) => Math.max(max, player.countdownProgress), 0);
  });
  const barWidthAsPercent = createMemo(() => {
    const total = props.countdownDuration;
    const progress = furthestProgress();
    if (total <= 0 || progress <= 0) {
      return "0%";
    }
    const percentage = progress / total * 100;
    return `${Math.min(percentage, 100)}%`;
  });
  function peekPortraits(event) {
    const el = event.currentTarget;
    const numChildren = el.childNodes.length;
    const step = 180 / numChildren;
    el.childNodes.forEach((child, index) => {
      const childElement = child;
      if (!childElement) {
        return;
      }
      childElement.classList.add("expand");
      const angle = 180 + (step * index + step / 2);
      const angleInRads = angle / 360 * Math.PI * 2;
      const xDistance = 10 * numChildren;
      const yDistance = 20;
      childElement.style.setProperty("--x", `${Math.cos(angleInRads) * xDistance}px`);
      childElement.style.setProperty("--y", `${Math.sin(angleInRads) * yDistance}px`);
    });
  }
  function unpeekPortraits(event) {
    const el = event.currentTarget;
    el.childNodes.forEach((child) => {
      const childElement = child;
      if (!childElement) {
        return;
      }
      childElement.classList.remove("expand");
    });
  }
  return createComponent(HSlot, {
    "class": "h-4 w-128 items-center justify-center relative",
    style: {
      "background-image": "linear-gradient(to right, rgba(51, 54, 64, 1), rgba(51, 54, 64, 0.75), rgba(51, 54, 64, 1))"
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        _el$.style.setProperty("background-image", "linear-gradient(to left, rgba(87, 149, 68, 1), rgba(13, 73, 32, 1))");
        _el$.style.setProperty("border-color", "rgba(140, 126, 98, 1)");
        _el$.style.setProperty("border-style", "solid");
        _el$.style.setProperty("border-width", "1px");
        createRenderEffect((_$p) => (_$p = barWidthAsPercent()) != null ? _el$.style.setProperty("width", _$p) : _el$.style.removeProperty("width"));
        return _el$;
      })(), createComponent(For, {
        get each() {
          return Array.from({
            length: props.countdownDuration
          });
        },
        children: (_, index) => {
          const players = createMemo(() => playersByIndex()[index()]);
          return (() => {
            var _el$2 = _tmpl$2();
            insert(_el$2, createComponent(Divider.Vertical, {
              "class": "-translate-x-1\\/2"
            }), null);
            insert(_el$2, createComponent(Show, {
              get when() {
                return createMemo(() => !!(index() > 0 && players()))() && players().length > 0;
              },
              get children() {
                return createComponent(Show, {
                  get when() {
                    return players().length > 1;
                  },
                  get fallback() {
                    return createComponent(VictoryCountdownTooltip, {
                      get countdownDuration() {
                        return props.countdownDuration;
                      },
                      get players() {
                        return players();
                      },
                      get children() {
                        var _el$3 = _tmpl$3();
                        insert(_el$3, createComponent(PortraitIcon, {
                          size: 12,
                          get playerId() {
                            return players()[0].playerInfo.playerId;
                          },
                          get desaturate() {
                            return players()[0].launchpadDamaged;
                          }
                        }));
                        return _el$3;
                      }
                    });
                  },
                  get children() {
                    return createComponent(VictoryCountdownTooltip, {
                      get countdownDuration() {
                        return props.countdownDuration;
                      },
                      get players() {
                        return players();
                      },
                      get children() {
                        return createComponent(Activatable, {
                          "class": "absolute size-12 left-0 -translate-x-1\\/2",
                          onMouseOver: (e) => peekPortraits(e),
                          onFocusIn: (e) => peekPortraits(e),
                          onMouseOut: (e) => unpeekPortraits(e),
                          onFocusOut: (e) => unpeekPortraits(e),
                          get children() {
                            return createComponent(For, {
                              get each() {
                                return players();
                              },
                              children: (player, index2) => (() => {
                                var _el$4 = _tmpl$4();
                                insert(_el$4, createComponent(PortraitIcon, {
                                  size: 12,
                                  get playerId() {
                                    return player.playerInfo.playerId;
                                  },
                                  get desaturate() {
                                    return player.launchpadDamaged;
                                  }
                                }));
                                createRenderEffect((_$p) => (_$p = `${index2() / players().length * 16 - 8}px`) != null ? _el$4.style.setProperty("--initial-left", _$p) : _el$4.style.removeProperty("--initial-left"));
                                return _el$4;
                              })()
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            }), null);
            return _el$2;
          })();
        }
      }), createComponent(Divider.Vertical, {
        "class": "translate-x-1\\/2"
      })];
    }
  });
};
const VictoryCountdownBar = ComponentRegistry.register({
  name: "VictoryCountdownBar",
  createInstance: VictoryCountdownBarComponent,
  styles: [style]
});

export { VictoryCountdownBar };
//# sourceMappingURL=victory-countdown-bar.js.map
