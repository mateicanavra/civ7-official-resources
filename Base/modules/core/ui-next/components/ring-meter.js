import { template, use, insert, className, setAttribute } from '../../vendor/solid-js/web/dist/web.js';
import { mergeProps, createMemo, createEffect, on, createComponent, Show, For, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { createPropsRefSignal, createAnimationSignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute self-center top-px left-0 right-0 bottom-0"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div></div><div class=fxs-ring-meter__ring><div class=fxs-ring-meter__mask-left><div class=fxs-ring-meter__ring-left></div></div><div class=fxs-ring-meter__mask-right><div class=fxs-ring-meter__ring-right></div></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute ring-meter-pip"></div>`);
const RingMeterComponent = (props) => {
  const EPSILON = 5e-4;
  let ringFillStart = 0;
  const [_root, setRoot] = createPropsRefSignal(() => props.ref);
  const defaultProps = mergeProps({
    min: 0,
    max: 100,
    value: 0,
    animationDuration: 1500
  }, props);
  const reactiveDuration = createMemo(() => defaultProps.animationDuration);
  const [animationTimeElapsed, isAnimating, setIsAnimating] = createAnimationSignal(reactiveDuration);
  const fill = createMemo(() => {
    const minValue = defaultProps.min;
    const maxValue = defaultProps.max;
    if (maxValue - minValue <= 0) {
      return 0;
    } else {
      const value = Math.max(Math.min(maxValue, defaultProps.value), minValue);
      return (value - minValue) / (maxValue - minValue);
    }
  });
  const easedFill = createMemo(() => {
    if (props.animationDuration == 0) {
      return 0;
    }
    const timeElapsed = Math.min(animationTimeElapsed(), defaultProps.animationDuration);
    const cubicEaseFactor = Math.pow(1 - timeElapsed / defaultProps.animationDuration, 3);
    return fill() - (fill() - ringFillStart) * cubicEaseFactor;
  });
  const leftHidden = createMemo(() => {
    if (!props.isTopOrigin) {
      return easedFill() <= EPSILON;
    } else {
      return easedFill() <= 0.5;
    }
  });
  const rightHidden = createMemo(() => {
    if (!props.isTopOrigin) {
      return easedFill() <= 0.5;
    } else {
      return easedFill() <= EPSILON;
    }
  });
  const fillDegreesLeft = createMemo(() => {
    if (!props.isTopOrigin) {
      return easedFill() < 0.5 ? 180 - easedFill() * 360 : 0;
    } else {
      return easedFill() >= 0.5 ? 180 - (easedFill() - 0.5) * 360 : 0;
    }
  });
  const fillDegreesRight = createMemo(() => {
    if (!props.isTopOrigin) {
      return easedFill() >= 0.5 ? 180 - (easedFill() - 0.5) * 360 : 0;
    } else {
      return easedFill() < 0.5 ? 180 - easedFill() * 360 : 0;
    }
  });
  function playFillSound() {
    if (defaultProps.animationDuration > 0) {
    }
  }
  function playStopSound() {
    if (defaultProps.animationDuration > 0) {
    }
  }
  function calculatePipPositionAndRotation(pipNum) {
    let x = 0;
    let y = 0;
    let rotation = 0;
    const pipPercent = pipNum / props.max;
    const angle = Math.PI * 2 * pipPercent - Math.PI / 2;
    x = Math.cos(angle) * 50 + 50;
    y = Math.sin(angle) * 50 + 50;
    rotation = (angle + Math.PI) * 180 / Math.PI + 90;
    return [x, y, rotation];
  }
  createEffect(on(() => defaultProps.value, () => {
    if (isAnimating()) {
      ringFillStart = easedFill();
    } else {
      setIsAnimating(true);
      playFillSound();
    }
  }));
  createEffect(on(() => isAnimating(), (isAnimating2) => {
    if (!isAnimating2) {
      ringFillStart = fill();
      playStopSound();
    }
  }));
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$4.nextSibling, _el$7 = _el$6.firstChild;
    use(setRoot, _el$);
    insert(_el$2, () => props.children);
    _el$5.style.setProperty("background-size", "cover");
    _el$5.style.setProperty("background-position", "left");
    _el$7.style.setProperty("background-size", "cover");
    _el$7.style.setProperty("background-position", "right");
    insert(_el$3, createComponent(Show, {
      get when() {
        return props.progressPips && props.progressPips.length > 0;
      },
      get children() {
        var _el$8 = _tmpl$();
        insert(_el$8, createComponent(For, {
          get each() {
            return props.progressPips;
          },
          children: (pip) => (() => {
            var _el$9 = _tmpl$3();
            createRenderEffect((_p$) => {
              var _v$16 = `${calculatePipPositionAndRotation(pip)[0]}%`, _v$17 = `${calculatePipPositionAndRotation(pip)[1]}%`, _v$18 = `rotate(${calculatePipPositionAndRotation(pip)[2]}deg)`;
              _v$16 !== _p$.e && ((_p$.e = _v$16) != null ? _el$9.style.setProperty("left", _v$16) : _el$9.style.removeProperty("left"));
              _v$17 !== _p$.t && ((_p$.t = _v$17) != null ? _el$9.style.setProperty("top", _v$17) : _el$9.style.removeProperty("top"));
              _v$18 !== _p$.a && ((_p$.a = _v$18) != null ? _el$9.style.setProperty("transform", _v$18) : _el$9.style.removeProperty("transform"));
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0
            });
            return _el$9;
          })()
        }));
        return _el$8;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `fxs-ring-meter relative ${props.class}`, _v$2 = props.audio?.group, _v$3 = props.audio?.onFillSound, _v$4 = props.audio?.onRingAnimateStop, _v$5 = `fxs-ring-meter__content ${props.contentClass ?? "flex items-center justify-center w-full h-full"}`, _v$6 = !!leftHidden(), _v$7 = `rotate(-${fillDegreesLeft()}deg)`, _v$8 = `rotate(${fillDegreesLeft()}deg)`, _v$9 = props.ringImage ?? `url("blp:hud_small-progress_bar.png")`, _v$10 = props.ringTint ?? "", _v$11 = !!rightHidden(), _v$12 = `rotate(-${fillDegreesRight()}deg)`, _v$13 = `rotate(${fillDegreesRight()}deg)`, _v$14 = props.ringImage ?? `url("blp:hud_small-progress_bar.png")`, _v$15 = props.ringTint ?? "";
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && setAttribute(_el$, "data-audio-group-ref", _p$.t = _v$2);
      _v$3 !== _p$.a && setAttribute(_el$, "data-audio-fill-sound-ref", _p$.a = _v$3);
      _v$4 !== _p$.o && setAttribute(_el$, "data-audio-ring-animate-stop-ref", _p$.o = _v$4);
      _v$5 !== _p$.i && className(_el$2, _p$.i = _v$5);
      _v$6 !== _p$.n && _el$4.classList.toggle("opacity-0", _p$.n = _v$6);
      _v$7 !== _p$.s && ((_p$.s = _v$7) != null ? _el$4.style.setProperty("transform", _v$7) : _el$4.style.removeProperty("transform"));
      _v$8 !== _p$.h && ((_p$.h = _v$8) != null ? _el$5.style.setProperty("transform", _v$8) : _el$5.style.removeProperty("transform"));
      _v$9 !== _p$.r && ((_p$.r = _v$9) != null ? _el$5.style.setProperty("background-image", _v$9) : _el$5.style.removeProperty("background-image"));
      _v$10 !== _p$.d && ((_p$.d = _v$10) != null ? _el$5.style.setProperty("fxs-background-image-tint", _v$10) : _el$5.style.removeProperty("fxs-background-image-tint"));
      _v$11 !== _p$.l && _el$6.classList.toggle("opacity-0", _p$.l = _v$11);
      _v$12 !== _p$.u && ((_p$.u = _v$12) != null ? _el$6.style.setProperty("transform", _v$12) : _el$6.style.removeProperty("transform"));
      _v$13 !== _p$.c && ((_p$.c = _v$13) != null ? _el$7.style.setProperty("transform", _v$13) : _el$7.style.removeProperty("transform"));
      _v$14 !== _p$.w && ((_p$.w = _v$14) != null ? _el$7.style.setProperty("background-image", _v$14) : _el$7.style.removeProperty("background-image"));
      _v$15 !== _p$.m && ((_p$.m = _v$15) != null ? _el$7.style.setProperty("fxs-background-image-tint", _v$15) : _el$7.style.removeProperty("fxs-background-image-tint"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0,
      h: void 0,
      r: void 0,
      d: void 0,
      l: void 0,
      u: void 0,
      c: void 0,
      w: void 0,
      m: void 0
    });
    return _el$;
  })();
};
const RingMeter = ComponentRegistry.register({
  name: "RingMeter",
  createInstance: RingMeterComponent
});

export { RingMeter };
//# sourceMappingURL=ring-meter.js.map
