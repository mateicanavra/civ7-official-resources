import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, mergeProps, createEffect, createComponent, createMemo, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { getRelationship, getPlayerDiplomacy, getRelationshipIconFromPlayer } from '../../../core/ui/utilities/diplomacy-utilities.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { Filigree } from '../../../core/ui-next/components/filigree.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relationship-breakdown__relationship-items-container flex flex-col px-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=relationship-breakdown-container data-name=Relationship-Breakdown><div class="relationship-breakdown__Header flex flex-col items-center justify-center w-full"><div class="relationship-breakdown__info flex items-center"><div class=mx-2></div><div class=mr-2></div></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="event-line flex justify-between p-1"><div class="event-text flex-1 pr-4"></div><div class="event-amount font-bold"></div></div>`);
const RelationshipBreakdownComponent = (props) => {
  const [relationship, setRelationship] = createSignal({
    type: DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNKNOWN,
    levelName: "unknown",
    amount: 0
  });
  const [relationshipItems, setRelationshipItems] = createSignal([]);
  const propsWithDefaults = mergeProps({
    comparisonPlayerId: GameContext.localPlayerID
  }, props);
  createEffect(() => {
    setRelationship(getRelationship(propsWithDefaults.playerId, propsWithDefaults.comparisonPlayerId));
    const playerDiplomacy = getPlayerDiplomacy(propsWithDefaults.playerId);
    if (!playerDiplomacy) {
      console.error("RelationshipBreakdownComponent: Can't find diplomacy object for player", propsWithDefaults.playerId);
      return;
    }
    if (propsWithDefaults.comparisonPlayerId == PlayerIds.NO_PLAYER) {
      console.error("RelationshipBreakdownComponent: comparisonPlayerId is NO_PLAYER");
      return;
    }
    const relationshipHistory = playerDiplomacy.getPlayerRelationshipHistory(propsWithDefaults.comparisonPlayerId);
    if (!relationshipHistory) {
      console.error("RelationshipBreakdownComponent: Can't find relationshipHistory between players", propsWithDefaults.playerId, "and", propsWithDefaults.comparisonPlayerId);
      return;
    }
    const relationshipItemList = [];
    for (const historyItem of relationshipHistory) {
      const itemIndex = relationshipItemList.findIndex((item) => historyItem.eventType == item.eventType);
      if (itemIndex != -1) {
        relationshipItemList[itemIndex].amount += historyItem.amount;
      } else {
        relationshipItemList.push({
          eventType: historyItem.eventType,
          amount: historyItem.amount
        });
      }
    }
    setRelationshipItems(relationshipItemList);
  });
  const addPlusIfNeeded = (num) => {
    return `${num > 0 ? "+" : ""}` + num;
  };
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
    insert(_el$2, createComponent(FiligreeTitle.H4, {
      "class": "relationship-breakdown__title mb-1 flex items-center",
      text: "LOC_INDEPENDENT_RELATIONSHIP"
    }), _el$3);
    insert(_el$3, createComponent(Icon, {
      "class": "size-8",
      get name() {
        return getRelationshipIconFromPlayer(propsWithDefaults.playerId);
      },
      isUrl: true
    }), _el$4);
    insert(_el$4, createComponent(L10n.Compose, {
      get text() {
        return relationship().levelName;
      }
    }));
    insert(_el$5, (() => {
      var _c$ = createMemo(() => relationship().amount > 0);
      return () => _c$() ? `+${relationship().amount}` : relationship().amount;
    })());
    insert(_el$, createComponent(Filigree.GoldFrame, {
      topClass: "relationship-breakdown__section-line-above mt-2",
      bottomClass: "relationship-breakdown__section-line-below",
      get hideDecoration() {
        return relationshipItems().length === 0;
      },
      get children() {
        var _el$6 = _tmpl$();
        insert(_el$6, createComponent(For, {
          get each() {
            return relationshipItems();
          },
          children: (relationshipItem, index) => (() => {
            var _el$7 = _tmpl$3(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
            insert(_el$8, createComponent(L10n.Stylize, {
              get text() {
                return getPlayerDiplomacy(propsWithDefaults.comparisonPlayerId)?.getFavorGrievanceEventTypeName(relationshipItem.eventType) ?? "";
              }
            }));
            insert(_el$9, () => addPlusIfNeeded(Math.floor(relationshipItem.amount * 10) / 10));
            createRenderEffect((_p$) => {
              var _v$3 = !!(index() % 2 === 0), _v$4 = !!(index() % 2 !== 0), _v$5 = !!(relationshipItem.amount > 0), _v$6 = !!(relationshipItem.amount < 0);
              _v$3 !== _p$.e && _el$7.classList.toggle("bg-primary-3", _p$.e = _v$3);
              _v$4 !== _p$.t && _el$8.classList.toggle("text-accent-1", _p$.t = _v$4);
              _v$5 !== _p$.a && _el$9.classList.toggle("text-positive", _p$.a = _v$5);
              _v$6 !== _p$.o && _el$9.classList.toggle("text-negative", _p$.o = _v$6);
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0
            });
            return _el$7;
          })()
        }));
        return _el$6;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = !!(relationship().amount > 0), _v$2 = !!(relationship().amount < 0);
      _v$ !== _p$.e && _el$5.classList.toggle("text-positive", _p$.e = _v$);
      _v$2 !== _p$.t && _el$5.classList.toggle("text-negative", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const RelationshipBreakdown = ComponentRegistry.register({
  name: "RelationshipBreakdown",
  createInstance: RelationshipBreakdownComponent
});

export { RelationshipBreakdown };
//# sourceMappingURL=relationship-breakdown.js.map
