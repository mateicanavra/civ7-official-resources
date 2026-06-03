import { Layout } from '../utilities/utilities-layout.js';

class FxsFlipBook extends Component {
  /** Frames per second of animation */
  fps = 15;
  /** Internal representation of each atlas and their corresponding HTML element */
  atlas = [];
  /** Total number of frames across all atlases */
  nFrames = 0;
  /** Current shown atlas. -1 means it has not yet initialized */
  atlasIndex = -1;
  /** Current frame (out of FlipBook.nFrames, not per atlas frames*/
  frame = 0;
  /** Internal update interval ID */
  intervalId;
  /** Is the flipbook animating or not */
  isRunning = false;
  /** Get current animation frame */
  get getFrame() {
    return this.frame;
  }
  onAttach() {
    const attribute = this.Root.getAttribute("data-flipbook-definition");
    if (attribute) {
      const flipbookDef = JSON.parse(attribute);
      this.createFlipbook(flipbookDef.atlas, flipbookDef.fps, flipbookDef.preload);
      this.connectedCallback();
      this.run();
    }
  }
  onDetach() {
    clearInterval(this.intervalId);
  }
  /**
   * @remarks This will not add the flipbook to DOM, only register the texture atlas data. If preload is true it will also load in the images (but not show them).
   * @param atlas Either a single texture atlas or multiple atlases
   * @param fps Frames per second of the animation
   * @param preload Whether or not the texture atlases should be preloaded
   */
  createFlipbook(atlas, fps, preload = false) {
    this.atlas = [];
    for (let i = 0; i < atlas.length; i++) {
      let nFrames = -1;
      if (atlas[i].nFrames) {
        nFrames = atlas[i].nFrames;
      }
      const _atlas = {
        src: atlas[i].src,
        sprite: { width: atlas[i].spriteWidth, height: atlas[i].spriteHeight },
        size: atlas[i].size,
        nFrames,
        countMax: { x: 0, y: 0 }
      };
      this.atlas.push({ element: void 0, data: _atlas });
    }
    let f = 0;
    for (let item = 0; item < this.atlas.length; item++) {
      const a = this.atlas[item];
      const nX = Math.floor(a.data.size / a.data.sprite.width);
      const nY = Math.floor(a.data.size / a.data.sprite.height);
      if (a.data.nFrames == -1) a.data.nFrames = nY * nX;
      a.data.countMax = { x: nX, y: nY };
      f += a.data.nFrames;
    }
    this.nFrames = f;
    this.fps = fps;
    if (preload) {
      this.atlas.forEach((a) => {
        const img = new Image();
        img.src = a.data.src;
      });
    }
  }
  /** Callback for when this is added to DOM. Will automatically draw the first frame. */
  connectedCallback() {
    this.Root.innerHTML = "";
    this.Root.style.position = "relative";
    this.Root.style.width = Layout.pixels(this.atlas[0].data.sprite.width);
    this.Root.style.height = Layout.pixels(this.atlas[0].data.sprite.height);
    this.atlas.forEach((atlas) => {
      const animation = document.createElement("div");
      animation.style.position = "absolute";
      animation.style.willChange = "transform";
      animation.style.width = Layout.pixels(atlas.data.sprite.width);
      animation.style.height = Layout.pixels(atlas.data.sprite.height);
      animation.style.backgroundImage = `url(${atlas.data.src})`;
      animation.style.visibility = "hidden";
      atlas.element = animation;
      this.Root.appendChild(animation);
    });
  }
  /** Start the animation. If the animation is already running, {@link FlipBook.restart | restart}. */
  run() {
    if (this.isRunning) {
      console.warn("Trying to run an already playing flipbook. Restarting instead.");
      this.restart();
    } else {
      this.isRunning = true;
      this.spawnInterval();
    }
  }
  /** Restarts the animation. */
  restart() {
    clearInterval(this.intervalId);
    this.frame = 0;
    this.isRunning = true;
    this.spawnInterval();
  }
  /** Stops the animation. */
  end() {
    clearInterval(this.intervalId);
  }
  /**
   * Skips to a certain frame. Will not change whether or not the animation is running.
   * @param frame Frame to go to
   */
  goto(frame) {
    if (frame < 0 || frame > this.nFrames)
      console.error(`Trying to skip to frame ${frame} but it is out of bounds (0 <= f < ${this.nFrames})`);
    else {
      this.frame = frame;
      this.drawFrame(frame);
    }
  }
  /** Pauses the current animation. */
  pause() {
    if (!this.isRunning) console.warn("Trying to pause a flipbook that is not running");
    else {
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }
  /** Resumes the current animation. */
  resume() {
    if (this.isRunning) console.warn("Trying to resume a flipbook that is already running");
    else this.run();
  }
  /** Utility function to toggle between paused/unpaused. */
  toggleRunning() {
    if (this.isRunning) this.pause();
    else this.resume();
  }
  /** Shows the flipbook */
  show() {
    this.Root.style.display = "block";
  }
  /** Hides the flipbook and pauses it. */
  hide() {
    if (!this.Root) console.warn("Trying to show an uninitialized flipbook");
    else {
      this.Root.style.display = "none";
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }
  /** Creates the internal update loop. */
  spawnInterval() {
    this.intervalId = setInterval(() => {
      try {
        this.drawFrame(this.frame);
      } catch (e) {
        console.error(e);
        this.pause();
        return;
      }
      this.frame++;
      if (this.frame == this.nFrames) this.frame = 0;
    }, 1e3 / this.fps);
  }
  /**
   * Renders a frame on screen.
   * @param f Frame to render
   */
  drawFrame(f) {
    let prevFrameCount = 0;
    let correctAtlasIndex = 0;
    for (let i = 0; i < this.atlas.length; i++) {
      prevFrameCount += this.atlas[i].data.nFrames;
      if (prevFrameCount > f) {
        prevFrameCount -= this.atlas[i].data.nFrames;
        correctAtlasIndex = i;
        break;
      }
    }
    if (correctAtlasIndex != this.atlasIndex) {
      this.atlasIndex = correctAtlasIndex;
      this.atlas.forEach((atlas) => {
        if (!atlas.element)
          console.error(`Flipbook is trying to access a non-existing element for ${atlas.data.src}`);
        else atlas.element.style.visibility = "hidden";
      });
      this.atlas[this.atlasIndex].element.style.visibility = "visible";
      if (!this.Root) console.warn("This should never happen! Trying to draw frame before initialization");
      else {
        this.Root.style.width = Layout.pixels(this.atlas[this.atlasIndex].data.sprite.width);
        this.Root.style.height = Layout.pixels(this.atlas[this.atlasIndex].data.sprite.height);
      }
    }
    const internalFrame = f - prevFrameCount;
    const y = Math.floor(internalFrame / this.atlas[this.atlasIndex].data.countMax.x);
    const x = this.frame - y * this.atlas[this.atlasIndex].data.countMax.y;
    if (!this.atlas[this.atlasIndex].element)
      console.error(
        `Flipbook is trying to access a non-existing element for ${this.atlas[this.atlasIndex].data.src}`
      );
    else {
      const ele = this.atlas[this.atlasIndex].element;
      ele.style.backgroundPositionX = Layout.pixels(-x * this.atlas[this.atlasIndex].data.sprite.width);
      ele.style.backgroundPositionY = Layout.pixels(-y * this.atlas[this.atlasIndex].data.sprite.height);
      ele.style.backgroundSize = Layout.pixels(this.atlas[this.atlasIndex].data.size);
    }
  }
}
Controls.define("fxs-flipbook", {
  createInstance: FxsFlipBook,
  description: "Flipbook animation component",
  classNames: ["flipbook-container"],
  attributes: [
    {
      name: "data-flipbook-definition"
    }
  ]
});

export { FxsFlipBook };
//# sourceMappingURL=fxs-flipbook.js.map
