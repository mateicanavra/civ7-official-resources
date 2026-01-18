import { t as template, h as createMemo, c as createSignal, o as onMount, d as onCleanup, i as insert, e as createComponent, F as For, k as spread, m as mergeProps, C as ComponentRegistry } from './panel.chunk.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const FlipbookComponent = (props) => {
  let elapsed = 0;
  let lastFrameTime = 0;
  let frameHandler;
  const atlases = createMemo(() => props.atlas.map((atlas) => {
    const [isActive, setIsActive] = createSignal(false);
    const [xPos, setXPos] = createSignal(0);
    const [yPos, setYPos] = createSignal(0);
    const rows = atlas.size / atlas.spriteHeight;
    const cols = atlas.size / atlas.spriteWidth;
    const frames = atlas.nFrames ?? rows * cols;
    const duration = frames / props.fps * 1e3;
    const src = atlas.src;
    return {
      isActive,
      setIsActive,
      xPos,
      setXPos,
      yPos,
      setYPos,
      rows,
      cols,
      frames,
      duration,
      src
    };
  }));
  const totalFrames = createMemo(() => atlases().reduce((sum, a) => sum + a.frames, 0));
  const totalDuration = createMemo(() => atlases().reduce((sum, a) => sum + a.duration, 0));
  function showFrame(totalFrame) {
    let offset = 0;
    for (const atlas of atlases()) {
      const atlasFrame = totalFrame - offset;
      if (atlasFrame >= 0 && atlasFrame < atlas.frames) {
        const row = Math.floor(atlasFrame / atlas.cols);
        const col = Math.floor(atlasFrame % atlas.cols);
        atlas.setXPos(100 * (col / (atlas.cols - 1)));
        atlas.setYPos(100 * (row / (atlas.rows - 1)));
        atlas.setIsActive(true);
      } else {
        atlas.setIsActive(false);
      }
      offset += atlas.frames;
    }
  }
  function updateFrame(timestamp) {
    if (lastFrameTime != 0) {
      elapsed += timestamp - lastFrameTime;
      elapsed %= totalDuration();
    }
    lastFrameTime = timestamp;
    showFrame(Math.floor(totalFrames() * elapsed / totalDuration()));
    frameHandler = requestAnimationFrame(updateFrame);
  }
  onMount(() => {
    lastFrameTime = 0;
    requestAnimationFrame(updateFrame);
  });
  onCleanup(() => {
    if (frameHandler) {
      cancelAnimationFrame(frameHandler);
      frameHandler = void 0;
    }
  });
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(For, {
      get each() {
        return atlases();
      },
      children: (atlas) => (() => {
        var _el$2 = _tmpl$();
        spread(_el$2, mergeProps(props, {
          get classList() {
            return {
              hidden: !atlas.isActive()
            };
          },
          get style() {
            return {
              background: `url("${atlas.src}")`,
              "background-size": `${atlas.cols * 100}% ${atlas.rows * 100}%`,
              "background-position-x": `${atlas.xPos()}%`,
              "background-position-y": `${atlas.yPos()}%`
            };
          }
        }), false, false);
        return _el$2;
      })()
    }));
    return _el$;
  })();
};
const Flipbook = ComponentRegistry.register("Flipbook", FlipbookComponent);
const HourglassComponent = (props) => {
  return createComponent(Flipbook, mergeProps(props, {
    fps: 30,
    atlas: [{
      src: "blp:hourglasses01",
      spriteHeight: 128,
      spriteWidth: 128,
      size: 512
    }, {
      src: "blp:hourglasses02",
      spriteHeight: 128,
      spriteWidth: 128,
      size: 512
    }, {
      src: "blp:hourglasses03",
      spriteHeight: 128,
      spriteWidth: 128,
      size: 1024,
      nFrames: 13
    }]
  }));
};
Flipbook.Hourglass = ComponentRegistry.register({
  name: "Flipbook.Hourglass",
  createInstance: HourglassComponent,
  images: ["blp:hourglasses01", "blp:hourglasses02", "blp:hourglasses03"]
});

export { Flipbook as F };
//# sourceMappingURL=flipbook.chunk.js.map
