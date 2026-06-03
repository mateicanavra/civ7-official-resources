const chainedAnimations = [];
let isCancellingAnimations = false;
function cancelAllChainedAnimations(jumpToEnd = false) {
  isCancellingAnimations = true;
  chainedAnimations.forEach(({ timer: n, function: f }) => {
    clearTimeout(n);
    if (f && jumpToEnd) {
      f(n);
    }
  });
  chainedAnimations.length = 0;
  isCancellingAnimations = false;
}
function getNumChainedAnimations() {
  return chainedAnimations.length;
}
async function chainAnimation(...props) {
  let _timer = 0;
  const root = [];
  props[0].element.classList.toggle(props[0].classname, !props[0].remove);
  root.push(props[0]);
  let j = 1;
  for (j; j < props.length; j++) {
    if (props[j].startWithPrev) {
      props[j].element.classList.toggle(props[j].classname, !props[j].remove);
      root.push(props[j]);
    } else {
      j--;
      break;
    }
  }
  const animProps = await findAnimationEnd(root, props[0].offset);
  const oldprops = props.splice(0, j + 1);
  let propFunction;
  propFunction = () => {
    for (const prop of oldprops) {
      if (prop.callback) {
        prop.callback();
      }
    }
    if (props.length > 0) {
      chainAnimation(...props);
    }
  };
  if (isCancellingAnimations) {
    propFunction();
    return 0;
  }
  _timer = setTimeout(
    () => {
      propFunction(_timer);
      chainedAnimations.splice(chainedAnimations.indexOf({ timer: _timer, function: propFunction }, 1));
    },
    1e3 * Math.max(0, animProps.time)
  );
  const newChainedAnim = { timer: _timer, function: propFunction };
  chainedAnimations.push(newChainedAnim);
  return _timer;
}
async function findAnimationEnd(root, addDelay = 0) {
  const elArr = [];
  for (const r of root) {
    let target2 = "*";
    if (r.target) {
      target2 = `[class*="${r.target}"]`;
    }
    elArr.push(...Array.from(r.element.querySelectorAll(target2)));
    if (!r.target) {
      elArr.push(r.element);
    }
  }
  let total = 0;
  let target = root[0].element;
  let classname = "";
  let animProps;
  const promise = new Promise((res) => {
    requestAnimationFrame(() => {
      for (const el of elArr) {
        let _de = 0;
        let _du = 0;
        const _deArr = window.getComputedStyle(el).getPropertyValue("transition-delay").split("s,");
        const _duArr = window.getComputedStyle(el).getPropertyValue("transition-duration").split("s,");
        const _length = _deArr.length > _duArr.length ? _deArr.length : _duArr.length;
        for (let i = 0; i < _length; i++) {
          _de = parseFloat(_deArr.length > i ? _deArr[i] : _deArr[_deArr.length - 1]);
          _du = parseFloat(_duArr.length > i ? _duArr[i] : _duArr[_duArr.length - 1]);
          if (_de + _du > total) {
            total = _de + _du;
            target = el;
            classname = el.className;
          }
        }
      }
      const _animProps = { element: target, time: total + addDelay, classname };
      res(_animProps);
    });
  });
  animProps = await promise;
  return animProps;
}
var SpriteSheet;
((SpriteSheet2) => {
  function from(source, startFrame, frames) {
    return {
      imageName: source.imageName,
      rows: source.rows,
      cols: source.cols,
      frames,
      startFrame
    };
  }
  SpriteSheet2.from = from;
})(SpriteSheet || (SpriteSheet = {}));
class SpriteSheetAnimation {
  constructor(element, spriteSheet, durationMs) {
    this.element = element;
    this.spriteSheet = spriteSheet;
    this.durationMs = durationMs;
  }
  isRunning = false;
  lastFrameTime = 0;
  elapsed = 0;
  frameHandler;
  start(spriteSheet) {
    if (spriteSheet) {
      this.spriteSheet = spriteSheet;
    }
    if (!this.isRunning) {
      this.lastFrameTime = 0;
      this.elapsed = 0;
      this.element.style.backgroundImage = `url(${this.spriteSheet.imageName})`;
      this.element.style.backgroundSize = `${Math.floor(this.spriteSheet.cols * 100)}% ${Math.floor(this.spriteSheet.rows * 100)}%`;
      if (this.spriteSheet.frames > 1) {
        this.isRunning = true;
        requestAnimationFrame((time) => this.doFrame(time));
      } else {
        this.drawFrame(this.spriteSheet.startFrame ?? 0);
      }
    }
  }
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.element.style.backgroundImage = "";
      this.element.style.backgroundSize = "";
      this.element.style.backgroundPositionX = "";
      this.element.style.backgroundPositionY = "";
      if (this.frameHandler) {
        cancelAnimationFrame(this.frameHandler);
        this.frameHandler = void 0;
      }
    }
  }
  doFrame(timestamp) {
    if (!this.isRunning) {
      return;
    }
    if (this.lastFrameTime != 0) {
      this.elapsed += timestamp - this.lastFrameTime;
    }
    this.lastFrameTime = timestamp;
    while (this.elapsed >= this.durationMs) {
      this.elapsed -= this.durationMs;
    }
    const frame = Math.floor(this.spriteSheet.frames * this.elapsed / this.durationMs) + (this.spriteSheet.startFrame ?? 0);
    this.drawFrame(frame);
    this.frameHandler = requestAnimationFrame((time) => this.doFrame(time));
  }
  drawFrame(frame) {
    const row = Math.floor(frame / this.spriteSheet.cols);
    const col = Math.floor(frame % this.spriteSheet.cols);
    this.element.style.backgroundPositionX = `${100 * (col / (this.spriteSheet.cols - 1))}%`;
    this.element.style.backgroundPositionY = `${100 * (row / (this.spriteSheet.rows - 1))}%`;
  }
}

export { SpriteSheet, SpriteSheetAnimation, cancelAllChainedAnimations, chainAnimation, findAnimationEnd, getNumChainedAnimations };
//# sourceMappingURL=animations.js.map
