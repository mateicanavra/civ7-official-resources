import { waitForElementStyle } from '../../../core/ui/utilities/utilities-core-stylechecker.js';
import content from './tutorial-dialog-page.html.js';
import styles from './tutorial-dialog.scss.js';

class TutorialDialogPage extends Component {
  _index = -1;
  title = "";
  subtitle = "";
  body = "";
  titleImage = "";
  backgroundImages = [];
  /// The index of the page this represents
  get index() {
    return this._index;
  }
  onAttach() {
    super.onAttach();
    this.Root.setAttribute("role", "paragraph");
    this._index = parseInt(this.Root.getAttribute("index"));
    this.title = this.Root.getAttribute("title") ?? "";
    this.subtitle = this.Root.getAttribute("subtitle") ?? "";
    this.body = this.Root.getAttribute("body") ?? "";
    this.backgroundImages = (this.Root.getAttribute("backgroundImages") ?? "").split(",");
    this.setBackgroundImageInDiv(this.titleImage, "tutorial-dialog-page-image");
    this.setStringInDivClass(this.title, "tutorial-dialog-page-title");
    this.setStringInDivClass(this.subtitle, "tutorial-dialog-page-subtitle");
    this.setStringInDivClass(this.body, "tutorial-dialog-page-body");
    this.setImages();
    const element = this.Root.querySelector(".tutorial-dialog-backgrounds");
    if (element) {
      this.backgroundImages.forEach((imageURL, i) => {
        const img = document.createElement("div");
        img.classList.add("tutorial-dialog-page-bg", "top-0", "left-0", "size-full", "absolute");
        img.style.backgroundImage = `url("${imageURL}")`;
        img.classList.add(`tut-bg-${i <= 2 ? i : 3}`);
        element.appendChild(img);
      });
    } else {
      console.error("tutorial-dialog-page: onAttach(): Missing element with '.tutorial-dialog-backgrounds'");
    }
    waitForElementStyle(this.Root, "opacity", 0).then((_ready) => {
      this.Root.classList.remove("no-anim");
      window.dispatchEvent(new CustomEvent("tutorial-dialog-page-ready", { detail: { index: this._index } }));
    }).catch((error) => {
      console.log("tutorial-dialog-page: onAttach(): " + error);
    });
  }
  setImages() {
    const images = this.Root.querySelectorAll(".tutorial-image");
    images.forEach((image) => {
      image.classList.remove("tutorial-image");
      image.classList.add("tutorial-dialog-page-image", "absolute", "left-0", "top-0");
      image.style.backgroundImage = `url('${image.getAttribute("image")}')`;
      if (image.getAttribute("width") != "") {
        image.style.width = `${image.getAttribute("width")}rem`;
      }
      if (image.getAttribute("height") != "") {
        image.style.height = `${image.getAttribute("height")}rem`;
      }
      if (image.getAttribute("x") != "") {
        image.style.left = `${image.getAttribute("x")}rem`;
      }
      if (image.getAttribute("y") != "") {
        image.style.top = `${image.getAttribute("y")}rem`;
      }
      const imageContainer = this.Root.querySelector(".tutorial-dialog-page-image-container");
      if (imageContainer) {
        imageContainer.appendChild(image);
      }
    });
  }
  setBackgroundImageInDiv(value, cssClassName) {
    if (value == void 0 || value == null) {
      console.error(
        "tutorial-dialog-page: setBackgroundImageInDiv(): Missing value to set background image in tutorial page.  (Empty string required to clear.)"
      );
      return false;
    }
    const element = this.Root.querySelector(`.${cssClassName}`);
    if (!element) {
      return false;
    }
    const imageURL = `url(${value})`;
    element.style.backgroundImage = imageURL;
    return true;
  }
  setStringInDivClass(value, cssClassName) {
    if (value == void 0 || value == null) {
      console.error(
        "tutorial-dialog-page: setStringInDivClass(): Missing value to set div '" + cssClassName + "' in tutorial page.  (Empty string required to clear.)"
      );
      return false;
    }
    const element = this.Root.querySelector(`.${cssClassName}`);
    if (!element) {
      return false;
    }
    element.innerHTML = Locale.stylize(value);
    return true;
  }
}
Controls.define("tutorial-dialog-page", {
  createInstance: TutorialDialogPage,
  description: "Dialog box containing a series of tutorial information.",
  classNames: [
    "inactive",
    "no-anim",
    "pointer-events-none",
    "size-full",
    "absolute",
    "flow-row",
    "justify-center",
    "items-end"
  ],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});

export { TutorialDialogPage as Default, TutorialDialogPage as default };
//# sourceMappingURL=tutorial-dialog-page.js.map
