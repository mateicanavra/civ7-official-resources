import { template, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, mergeProps, createRenderEffect, Show, Switch, Match, createMemo } from '../../../core/vendor/solid-js/dist/solid.js';
import { getRelationshipIconFromPlayer, getWarStatusFromPlayerId } from '../../../core/ui/utilities/diplomacy-utilities.js';
import { getPlayerColorVariants, isPrimaryColorLighter } from '../../../core/ui/utilities/utilities-color.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.js';
import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import { multiplayerTeamColors } from '../../../core/ui/utilities/utilities-network-constants.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { PortraitIcon } from '../../../core/ui-next/components/portrait-icon.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { getSettlementIconInfo } from '../../../core/ui-next/utilities/settlement-utilities.js';
import { RelationshipTooltip } from '../tooltips/relationship-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative flex flex-col top-0 items-center justify-center"><div class="absolute -bottom-2 w-18 h-9 bg-contain bg-center bg-no-repeat self-center"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative pointer-events-auto self-center flex justify-center items-center font-base text-2xs -ml-px w-11 h-3\\\\.5"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative bg-center bg-full bg-no-repeat"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative font-body-base text-white text-shadow"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div class="absolute inset-0"></div><div class="absolute inset-0"></div><div class="absolute inset-0"></div><div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="z-0 relative flex flex-col items-center justify-center"data-name=Leader-Tile></div>`);
const LeaderWithRibbonComponent = (props) => {
  const [tileProps, setTileProps] = createSignal({
    playerId: -1,
    size: 20
  });
  const [bannerColor, setBannerColor] = createSignal("");
  const [playerConfig, setPlayerConfig] = createSignal();
  const [civSymbol, setCivSymbol] = createSignal("");
  const [civSymbolColor, setCivSymbolColor] = createSignal("");
  const [relationshipIcon, setRelationshipIcon] = createSignal("");
  const [warStatusWithLocalPlayer, setWarStatusWithLocalPlayer] = createSignal();
  const [settlementName, setSettlementName] = createSignal("");
  const [playerName, setPlayerName] = createSignal("");
  const omitRelationshipIcon = () => props.omitRelationshipIcon || props.leaderId === GameContext.localPlayerID || props.leaderId === PlayerIds.NO_PLAYER;
  createEffect(() => {
    setTileProps({
      playerId: props.leaderId,
      size: props.size
    });
    if (props.leaderId === PlayerIds.NO_PLAYER) {
      return;
    }
    setRelationshipIcon(getRelationshipIconFromPlayer(props.leaderId));
    const player = Players.get(props.leaderId);
    if (!player) {
      return;
    }
    setPlayerName(Locale.compose(player.name));
    const variants = getPlayerColorVariants(props.leaderId);
    if (variants) {
      setBannerColor(variants.primaryColor.moreColor);
    }
    if (props.cityId) {
      const iconProperities = getSettlementIconInfo(props.cityId);
      if (iconProperities) {
        setCivSymbol(iconProperities.icon);
        setCivSymbolColor(iconProperities.color);
      }
      const city = Cities.get(props.cityId);
      if (city) {
        setSettlementName(Locale.compose(city.name));
      }
    } else {
      setCivSymbol(Icon.getCivSymbolFromCivilizationType(player.civilizationType));
    }
    setPlayerConfig(Configuration.getPlayer(props.leaderId));
    setWarStatusWithLocalPlayer(getWarStatusFromPlayerId(props.leaderId));
  });
  const Portrait = [(() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$, createComponent(PortraitIcon, mergeProps(tileProps)), _el$2);
    createRenderEffect((_p$) => {
      var _v$ = !!(relationshipIcon() === "" || omitRelationshipIcon()), _v$2 = relationshipIcon();
      _v$ !== _p$.e && _el$2.classList.toggle("hidden", _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background-image", _v$2) : _el$2.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })(), createComponent(Show, {
    get when() {
      return warStatusWithLocalPlayer();
    },
    children: (warStatus) => createComponent(Show, {
      get when() {
        return warStatus().isAtWar && !props.omitFullRibbon;
      },
      get children() {
        var _el$3 = _tmpl$2();
        insert(_el$3, createComponent(L10n.Compose, {
          get text() {
            return warStatus().warSupport.toString();
          }
        }));
        createRenderEffect((_p$) => {
          var _v$3 = !!(warStatus().warSupport > 0), _v$4 = !!(warStatus().warSupport < 0);
          _v$3 !== _p$.e && _el$3.classList.toggle("bg-positive-light", _p$.e = _v$3);
          _v$4 !== _p$.t && _el$3.classList.toggle("bg-negative-light", _p$.t = _v$4);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$3;
      }
    })
  })];
  return (() => {
    var _el$4 = _tmpl$6();
    insert(_el$4, createComponent(Switch, {
      fallback: Portrait,
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.representsCityState;
          },
          get children() {
            return createComponent(Tooltip.Text, {
              header: "LOC_CIVILIZATION_CITY_STATE_NAME",
              text: "LOC_COMMERCE_TRADE_ROUTE_CITY_STATE_TOOLTIP",
              get args() {
                return [settlementName(), playerName()];
              },
              get children() {
                return createComponent(PortraitIcon, mergeProps(tileProps));
              }
            });
          }
        }), createComponent(Match, {
          get when() {
            return !omitRelationshipIcon();
          },
          get children() {
            return createComponent(RelationshipTooltip, {
              get playerId() {
                return props.leaderId;
              },
              children: Portrait
            });
          }
        })];
      }
    }), null);
    insert(_el$4, createComponent(Show, {
      get when() {
        return !props.omitFullRibbon;
      },
      get children() {
        var _el$5 = _tmpl$5(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.nextSibling;
        _el$6.style.setProperty("border-image-slice", "40 31 31 31 fill");
        _el$6.style.setProperty("border-image-source", "url(blp:hud_frontbanner)");
        _el$7.style.setProperty("border-image-source", "url('blp:hud_frontbanner_shadow')");
        _el$7.style.setProperty("border-image-slice", "40 31 31 31 fill");
        _el$8.style.setProperty("border-image-source", "url('blp:hud_frontbanner_overlay')");
        _el$8.style.setProperty("border-image-slice", "1 31 29 31 fill");
        insert(_el$5, createComponent(Show, {
          get when() {
            return createMemo(() => !!((Configuration.getGame().isNetworkMultiplayer || Configuration.getGame().isHotseat) && Game.Diplomacy.hasTeammate(props.leaderId)))() && playerConfig() !== void 0;
          },
          get children() {
            return [(() => {
              var _el$10 = _tmpl$3();
              createRenderEffect((_$p) => (_$p = multiplayerTeamColors[playerConfig().team + 1]) != null ? _el$10.style.setProperty("--multiplayer-team-colors", _$p) : _el$10.style.removeProperty("--multiplayer-team-colors"));
              return _el$10;
            })(), (() => {
              var _el$11 = _tmpl$4();
              insert(_el$11, () => (playerConfig().team + 1).toString());
              return _el$11;
            })()];
          }
        }), null);
        createRenderEffect((_p$) => {
          var _v$5 = `-z-1 relative ml-2 mr-1\\.5 ${props.representsCityState ? "min-h-21" : "min-h-24"} flex-1 flex flex-row justify-center self-stretch -mt-10 ${props.ribbonClass ?? ""}`, _v$6 = `${Layout.pixels(40)} ${Layout.pixels(31)} ${Layout.pixels(31)} ${Layout.pixels(31)}`, _v$7 = props.representsCityState ? "white" : bannerColor(), _v$8 = `${Layout.pixels(40)} ${Layout.pixels(31)} ${Layout.pixels(31)} ${Layout.pixels(31)}`, _v$9 = `${Layout.pixels(1)} ${Layout.pixels(31)} ${Layout.pixels(29)} ${Layout.pixels(31)}`, _v$10 = `bg-contain bg-center bg-no-repeat relative self-end mb-5 ${props.iconSizeClass ?? "size-9"}`, _v$11 = civSymbol().startsWith("url") ? civSymbol() : `url('${civSymbol()}')`, _v$12 = civSymbolColor();
          _v$5 !== _p$.e && className(_el$5, _p$.e = _v$5);
          _v$6 !== _p$.t && ((_p$.t = _v$6) != null ? _el$6.style.setProperty("border-image-width", _v$6) : _el$6.style.removeProperty("border-image-width"));
          _v$7 !== _p$.a && ((_p$.a = _v$7) != null ? _el$6.style.setProperty("fxs-border-image-tint", _v$7) : _el$6.style.removeProperty("fxs-border-image-tint"));
          _v$8 !== _p$.o && ((_p$.o = _v$8) != null ? _el$7.style.setProperty("border-image-width", _v$8) : _el$7.style.removeProperty("border-image-width"));
          _v$9 !== _p$.i && ((_p$.i = _v$9) != null ? _el$8.style.setProperty("border-image-width", _v$9) : _el$8.style.removeProperty("border-image-width"));
          _v$10 !== _p$.n && className(_el$9, _p$.n = _v$10);
          _v$11 !== _p$.s && ((_p$.s = _v$11) != null ? _el$9.style.setProperty("background-image", _v$11) : _el$9.style.removeProperty("background-image"));
          _v$12 !== _p$.h && ((_p$.h = _v$12) != null ? _el$9.style.setProperty("fxs-background-image-tint", _v$12) : _el$9.style.removeProperty("fxs-background-image-tint"));
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0,
          h: void 0
        });
        return _el$5;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$13 = !!isPrimaryColorLighter(props.leaderId), _v$14 = !!(props.leaderId === GameContext.localPlayerID);
      _v$13 !== _p$.e && _el$4.classList.toggle("primary-color-is-lighter", _p$.e = _v$13);
      _v$14 !== _p$.t && _el$4.classList.toggle("local-player", _p$.t = _v$14);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$4;
  })();
};
const LeaderWithRibbon = ComponentRegistry.register({
  name: "LeaderWithRibbon",
  createInstance: LeaderWithRibbonComponent
});

export { LeaderWithRibbon };
//# sourceMappingURL=leader-with-ribbon.js.map
