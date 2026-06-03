import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, For, Show } from '../../../core/vendor/solid-js/dist/solid.js';
import { Divider } from '../../../core/ui-next/components/divider.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col"><div class="font-title text-secondary"></div></div>`);
const VictoryCountdownTooltipComponent = (props) => {
  const [damagedLaunchpads, setDamagedLaunchpads] = createSignal({});
  const [countdownRemaining, setCountdownRemaining] = createSignal(0);
  createEffect(() => {
    if (props.players.length > 0) {
      setCountdownRemaining(props.countdownDuration - props.players[0].countdownProgress);
    }
    const result = {};
    props.players.forEach((victoryCountdownPlayer) => {
      const player = Players.get(victoryCountdownPlayer.playerInfo.playerId);
      if (!player) {
        return;
      }
      result[player.leaderName] = victoryCountdownPlayer.launchpadDamaged;
    });
    setDamagedLaunchpads(result);
  });
  return createComponent(Tooltip, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        "class": "pointer-events-none",
        get children() {
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
              insert(_el$2, createComponent(L10n.Compose, {
                text: "LOC_VICTORY_PROGRESS_TURNS_REMAINING",
                get args() {
                  return [countdownRemaining()];
                }
              }));
              insert(_el$, createComponent(Divider.Horizontal, {
                margin: 2
              }), null);
              insert(_el$, createComponent(For, {
                get each() {
                  return Object.entries(damagedLaunchpads());
                },
                children: ([leaderName, launchpadDamaged]) => createComponent(Show, {
                  when: launchpadDamaged,
                  get fallback() {
                    return createComponent(L10n.Compose, {
                      text: leaderName
                    });
                  },
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_VICTORIES_SCIENTIFIC_LEADER_DAMAGED_LAUNCHPAD",
                      get args() {
                        return [Locale.compose(leaderName)];
                      }
                    });
                  }
                })
              }), null);
              return _el$;
            }
          });
        }
      })];
    }
  });
};
const VictoryCountdownTooltip = ComponentRegistry.register({
  name: "VictoryCountdownTooltip",
  createInstance: VictoryCountdownTooltipComponent
});

export { VictoryCountdownTooltip };
//# sourceMappingURL=victory-countdown-tooltip.js.map
