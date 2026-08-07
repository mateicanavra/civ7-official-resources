import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, createRenderEffect, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { getPlayerColorVariants } from '../../../../core/ui/utilities/utilities-color.js';
import { getModifierArgumentByContext, getModifierTextByContext } from '../../../../core/ui/utilities/utilities-core-textprovider.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { Filigree } from '../../../../core/ui-next/components/filigree.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { Header } from '../../../../core/ui-next/components/header.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { NavHelp } from '../../../../core/ui-next/components/nav-help.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../../core/ui-next/utilities/component-utilities.js';
import { useLocalPlayerId } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { RaiseDiplomacyEvent } from '../../../ui/diplomacy/diplomacy-events.js';
import { OrnatePopupFrame } from '../../components/ornate-popup.js';
import style from './diplo-message-popup.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute top-0 bottom-0 left-3 right-3 bg-black"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute overflow-hidden h-full w-full self-center opacity-50 top-1"><div class="absolute h-full w-full self-center"></div><div class="absolute h-full w-full self-center"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute top-1 left-1 rotate-180 size-4 bg-contain opacity-30"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute top-1 right-1 -rotate-90 size-4 bg-contain opacity-30"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute bottom-1 left-4 rotate-90 size-4 bg-contain opacity-30"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute bottom-1 right-4 size-4 bg-contain opacity-30"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute flex flex-row items-center justify-center"><div class="absolute bg-center bg-no-repeat bg-contain size-25"></div><div class="absolute leader-frame size-28"></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="relative flex flex-col justify-center items-center"><div class="relationship-delta-bg p-2 m-1 mt-3"></div><div class="minimal-card-bg flex flex-col flex-auto self-stretch items-center m-4 opacity-100 p-1"><div class="relative solid-card-bg p-3 px-9 flex flex-col self-stretch items-center justify-center"><div class="relative self-start size-6 -left-6 diplo-message-quote-r"></div><div class="relative self-end size-6 -right-6 diplo-message-quote-l"></div></div></div></div>`);
const debugDismiss = false;
const agendaPopupLegacyName = "diplo-message-popup";
const AgendaPopupComponent = (props) => {
  let buttonRef;
  const localPlayerId = useLocalPlayerId();
  const [notificationId, setNotificationId] = createSignal();
  const [fgColor, setFgColor] = createSignal("");
  const [bgColor, setBgColor] = createSignal("");
  const [relationshipChange, setRelationshipChange] = createSignal(0);
  const [leaderId, setLeaderId] = createSignal(-1);
  const [leaderType, setLeaderType] = createSignal("UNKNOWN_LEADER");
  const [leaderName, setLeaderName] = createSignal("UNKNOWN_LEADER");
  const [leaderMessage, setLeaderMessage] = createSignal("LOC_DIPLO_RELATIONSHIP_INCREASED_GENERIC");
  const [portraitContext, setPortraitContext] = createSignal("");
  const [agendaName, setAgendaName] = createSignal("");
  const [agendaDesc, setAgendaDesc] = createSignal("");
  const onClose = () => {
    ContextManager.pop(agendaPopupLegacyName);
    const _notificationID = notificationId();
    if (_notificationID && !debugDismiss) {
      Game.Notifications.dismiss(_notificationID);
    }
  };
  const raiseLeader = () => {
    window.dispatchEvent(new RaiseDiplomacyEvent(leaderId()));
    onClose();
  };
  createEffect(() => {
    const rawNotificationID = props.attrs["data-notification-id"];
    if (rawNotificationID) {
      setNotificationId(JSON.parse(rawNotificationID));
    }
    setRelationshipChange(Number(props.attrs["data-relationship-change"] ?? "0"));
    const isPositiveChange = relationshipChange() >= 0;
    const fromLeaderId = Number(props.attrs["data-from-player"] ?? "0");
    const fromLeader = Players.get(fromLeaderId);
    if (!fromLeader) {
      console.error("diplo-message-popup: fromPlayer expected but not found!");
      return;
    }
    const playerDiplomacy = fromLeader.Diplomacy;
    if (!playerDiplomacy) {
      console.error("diplo-message-popup: playerDiplomacy not found!");
      return;
    }
    const eModifierId = props.attrs["data-modifier-id"] ?? "";
    if (eModifierId) {
      const name = getModifierArgumentByContext(eModifierId, "ModName") || getModifierTextByContext(eModifierId, "Name");
      const description = getModifierArgumentByContext(eModifierId, "Tooltip") || getModifierTextByContext(eModifierId, "Tooltip");
      setAgendaName(name);
      setAgendaDesc(description);
    }
    const leaderDef = GameInfo.Leaders.lookup(fromLeader.leaderType);
    if (leaderDef) {
      setLeaderId(fromLeaderId);
      setLeaderType(leaderDef.LeaderType);
      setLeaderName(leaderDef.Name);
      if (isPositiveChange) {
        const key = "LOC_DIPLO_RELATIONSHIP_INCREASED_" + leaderType();
        if (Locale.keyExists(key)) {
          setLeaderMessage(key);
        } else {
          setLeaderMessage("LOC_DIPLO_RELATIONSHIP_INCREASED_GENERIC");
        }
      } else {
        const key = "LOC_DIPLO_RELATIONSHIP_DECREASED_" + leaderType();
        if (Locale.keyExists(key)) {
          setLeaderMessage(key);
        } else {
          setLeaderMessage("LOC_DIPLO_RELATIONSHIP_DECREASED_GENERIC");
        }
      }
    }
    const variants = getPlayerColorVariants(fromLeaderId);
    if (variants) {
      setBgColor(variants.primaryColor.mainColor);
      setFgColor(variants.secondaryColor.mainColor);
    }
    const audio = useAudio("AgendaScreen");
    if (playerDiplomacy) {
      switch (playerDiplomacy.getRelationshipEnum(localPlayerId())) {
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE:
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNFRIENDLY:
          if (isPositiveChange) {
            setPortraitContext("");
            audio("positive-showing");
          } else {
            setPortraitContext("LEADER_ANGRY");
            audio("negative-showing");
          }
          break;
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_FRIENDLY:
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HELPFUL:
          if (isPositiveChange) {
            setPortraitContext("LEADER_HAPPY");
            audio("positive-showing");
          } else {
            setPortraitContext("");
            audio("negative-showing");
          }
          break;
        default:
          if (isPositiveChange) {
            setPortraitContext("LEADER_HAPPY");
            audio("positive-showing");
          } else {
            setPortraitContext("LEADER_ANGRY");
            audio("negative-showing");
          }
          break;
      }
    }
  });
  return createComponent(Panel, {
    name: "Agenda Popup",
    id: agendaPopupLegacyName,
    onCancelInput: () => {
      onClose();
    },
    "class": "relative",
    get children() {
      return [_tmpl$(), createComponent(OrnatePopupFrame, {
        "class": "pb-2 relative max-w-192 min-w-96",
        closePopupCallback: () => {
          onClose();
        },
        noClose: true,
        get children() {
          return [(() => {
            var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
            _el$3.style.setProperty("top", "-40%");
            _el$4.style.setProperty("bottom", "-66%");
            createRenderEffect((_p$) => {
              var _v$ = `radial-gradient(closest-side, ${bgColor()}, transparent)`, _v$2 = `radial-gradient(closest-side, ${bgColor()}, transparent)`;
              _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$3.style.setProperty("background-image", _v$) : _el$3.style.removeProperty("background-image"));
              _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$4.style.setProperty("background-image", _v$2) : _el$4.style.removeProperty("background-image"));
              return _p$;
            }, {
              e: void 0,
              t: void 0
            });
            return _el$2;
          })(), (() => {
            var _el$5 = _tmpl$3();
            _el$5.style.setProperty("background-image", "url(blp:mp_player_detail)");
            return _el$5;
          })(), (() => {
            var _el$6 = _tmpl$4();
            _el$6.style.setProperty("background-image", "url(blp:mp_player_detail)");
            return _el$6;
          })(), (() => {
            var _el$7 = _tmpl$5();
            _el$7.style.setProperty("background-image", "url(blp:mp_player_detail)");
            return _el$7;
          })(), (() => {
            var _el$8 = _tmpl$6();
            _el$8.style.setProperty("background-image", "url(blp:mp_player_detail)");
            return _el$8;
          })(), (() => {
            var _el$9 = _tmpl$7(), _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling;
            _el$10.style.setProperty("background-image", "url(blp:subsystem_panel_header_icon_backing)");
            insert(_el$9, createComponent(Icon, {
              "class": "absolute size-32 -top-18",
              get name() {
                return UI.getIconCSS(leaderType(), portraitContext());
              },
              isUrl: true
            }), null);
            createRenderEffect((_$p) => (_$p = fgColor()) != null ? _el$10.style.setProperty("fxs-background-image-tint", _$p) : _el$10.style.removeProperty("fxs-background-image-tint"));
            return _el$9;
          })(), createComponent(Header, {
            "class": `mt-12 max-w-full text-center justify-center text-shadow-subtle relative`,
            get children() {
              return [(() => {
                var _el$12 = _tmpl$8();
                insert(_el$12, createComponent(L10n.Stylize, {
                  text: "LOC_DIPLOMACY_AGENDA_TITLE",
                  "class": "text-sm"
                }), null);
                insert(_el$12, createComponent(Tooltip.Text, {
                  get initialHPosition() {
                    return TooltipHorizontalPosition.RIGHT;
                  },
                  get initialVPosition() {
                    return TooltipVerticalPosition.CENTER;
                  },
                  get header() {
                    return agendaName();
                  },
                  get text() {
                    return agendaDesc();
                  },
                  get children() {
                    return createComponent(Activatable, {
                      "class": "size-5 bg-no-repeat bg-cover ml-1 -top-0\\.5",
                      style: {
                        "background-image": "url(blp:icon_info)"
                      },
                      tabIndex: -1
                    });
                  }
                }), null);
                return _el$12;
              })(), createComponent(L10n.Stylize, {
                get text() {
                  return Locale.compose(agendaName());
                },
                "class": "text-xl"
              })];
            }
          }), (() => {
            var _el$13 = _tmpl$9(), _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling, _el$16 = _el$15.firstChild, _el$17 = _el$16.firstChild, _el$18 = _el$17.nextSibling;
            insert(_el$13, createComponent(Filigree.Small, {}), _el$14);
            insert(_el$13, createComponent(L10n.Stylize, {
              get text() {
                return createMemo(() => relationshipChange() >= 0)() ? agendaDesc() + "_LIKES" : agendaDesc() + "_DISLIKES";
              },
              "class": "text-accent-3"
            }), _el$14);
            insert(_el$14, createComponent(L10n.Stylize, {
              text: "LOC_DIPLOMACY_AGENDA_CHANGE_DESCRIPTION",
              get args() {
                return [relationshipChange()];
              },
              get ["class"]() {
                return relationshipChange() >= 0 ? "text-positive" : "text-negative";
              }
            }));
            insert(_el$16, createComponent(L10n.Stylize, {
              get text() {
                return leaderMessage();
              }
            }), _el$18);
            insert(_el$13, createComponent(HSlot, {
              autoFocus: true,
              get children() {
                return createComponent(Activatable, {
                  "class": `justify-center items-center flex flex-row mb-4 p-4 relative group`,
                  hotkeyAction: "accept",
                  onActivate: raiseLeader,
                  suppressPointerChanges: true,
                  get disabled() {
                    return !IsControllerActive();
                  },
                  get children() {
                    return [createComponent(Button, {
                      "class": "mr-3",
                      hotkeyAction: "accept",
                      onActivate: raiseLeader,
                      tabIndex: -1,
                      autoFocus: true,
                      get children() {
                        return [createComponent(NavHelp, {
                          "class": "mr-2"
                        }), createComponent(L10n.Compose, {
                          text: "LOC_DIPLOMACY_VIEW_LEADER"
                        })];
                      }
                    }), createComponent(Button, {
                      ref(r$) {
                        var _ref$ = buttonRef;
                        typeof _ref$ === "function" ? _ref$(r$) : buttonRef = r$;
                      },
                      hotkeyAction: "cancel",
                      "class": "",
                      onActivate: onClose,
                      tabIndex: -1,
                      get children() {
                        return [createComponent(NavHelp, {
                          "class": "mr-2"
                        }), createComponent(L10n.Compose, {
                          text: "LOC_NOTIFICATION_DISMISS"
                        })];
                      }
                    })];
                  }
                });
              }
            }), null);
            return _el$13;
          })()];
        }
      })];
    }
  });
};
const AgendaPopup = ComponentRegistry.register({
  name: "Agenda",
  createInstance: AgendaPopupComponent
});
ComponentUtilities.loadStyles(style);
defineLegacyComponent(agendaPopupLegacyName, {
  attrs: {
    "data-notification-id": "-1",
    "data-notification-type": "-1",
    "data-from-player": "-1",
    "data-to-player": "-1",
    "data-relationship-change": "-1",
    "data-modifier-id": "-1"
  }
}, (attrs) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(AgendaPopupComponent, {
    attrs
  });
});

export { AgendaPopup };
//# sourceMappingURL=diplo-message-popup.js.map
