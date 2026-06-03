import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, Show, mergeProps, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { getMajorLeader, getPlayerDiplomacy } from '../../../../core/ui/utilities/diplomacy-utilities.js';
import { getPlayerColorVariants } from '../../../../core/ui/utilities/utilities-color.js';
import { LeaderIconComponent } from '../../../../core/ui-next/components/portrait-icon.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="portrait-icon__domination bg-center bg-no-repeat bg-contain size-52 absolute -mt-2\\.5 -ml-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="absolute portrait-icon-container relative bg-center bg-no-repeat bg-contain size-52"data-name=Portrait-Icon></div><div class="portrait-icon__laurels bg-center bg-no-repeat bg-contain size-60 absolute -ml-7 -mt-9"></div><div class="portrait-icon__domination bg-center bg-no-repeat bg-contain size-48 absolute"></div><div class="portrait-icon__background bg-center bg-no-repeat bg-contain size-40 absolute ml-4 mt-4"></div><div class="absolute -mt-3\\.5 -ml-2\\.5"></div></div>`);
const PortraitIconVictoryComponent = (props) => {
  const [iconProps, setIconProps] = createSignal();
  const [backgroundColor, setBackgroundColor] = createSignal("");
  createEffect(() => {
    if (props.playerId === PlayerIds.NO_PLAYER) {
      return;
    }
    const majorLeader = getMajorLeader(props.playerId);
    if (!majorLeader) {
      return;
    }
    const leaderType = GameInfo.Leaders.lookup(majorLeader.leaderType)?.LeaderType;
    const playerDiplomacy = getPlayerDiplomacy(majorLeader);
    if (!playerDiplomacy) {
      return;
    }
    let portraitContext = "";
    if (props.isDefeat) {
      portraitContext = "LEADER_ANGRY";
    } else {
      portraitContext = "LEADER_HAPPY";
    }
    setIconProps({
      icon: UI.getIconCSS(leaderType ?? "UNKNOWN_LEADER", portraitContext),
      size: props.size,
      desaturate: props.desaturate
    });
    const variants = getPlayerColorVariants(props.playerId);
    if (variants) {
      setBackgroundColor(variants.secondaryColor.mainColor);
    }
  });
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$6 = _el$3.nextSibling, _el$7 = _el$6.nextSibling, _el$8 = _el$7.nextSibling;
    _el$2.style.setProperty("background-image", "url(blp:victory_hex_backingGlow)");
    _el$3.style.setProperty("background-image", "url(blp:popup_gold_laurels)");
    insert(_el$, createComponent(Show, {
      get when() {
        return props.isVictory && props.isDomination;
      },
      get children() {
        var _el$4 = _tmpl$();
        _el$4.style.setProperty("background-image", "url(blp:endScreen_dominationSwords)");
        return _el$4;
      }
    }), _el$6);
    insert(_el$, createComponent(Show, {
      get when() {
        return !props.isVictory && props.isDomination;
      },
      get children() {
        var _el$5 = _tmpl$();
        _el$5.style.setProperty("background-image", "url(blp:endScreen_defeatSwords)");
        return _el$5;
      }
    }), _el$6);
    _el$6.style.setProperty("background-image", "url(blp:final_leader-hex)");
    _el$7.style.setProperty("background-image", "url(blp:victory_gold-hex_endScreen)");
    insert(_el$8, createComponent(Show, {
      get when() {
        return iconProps();
      },
      children: (icon) => createComponent(LeaderIconComponent, mergeProps(icon))
    }));
    createRenderEffect((_p$) => {
      var _v$ = `relative flex size-${props.size}`, _v$2 = backgroundColor();
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$6.style.setProperty("fxs-background-image-tint", _v$2) : _el$6.style.removeProperty("fxs-background-image-tint"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const PortraitIconVictory = ComponentRegistry.register({
  name: "PortraitIconVictory",
  createInstance: PortraitIconVictoryComponent
});

export { PortraitIconVictory };
//# sourceMappingURL=victory-portrait-component.js.map
