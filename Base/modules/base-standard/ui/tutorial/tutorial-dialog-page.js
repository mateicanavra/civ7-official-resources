import { s as styles } from './tutorial-dialog.chunk.js';

async function waitForElementStyle(element, property, target) {
  const _frameLimit = 3;
  let _framesLeft = _frameLimit;
  if (!element) {
    console.warn(`StyleChecker: Target element could not be found`);
    return false;
  }
  if (!window.getComputedStyle(element).getPropertyValue(property)) {
    console.warn(
      `StyleChecker: Target ${element.tagName} ${element.className} does not have a '${property}' property`
    );
    return false;
  }
  const promise = new Promise((res) => {
    const checkReadyStatus = () => {
      _framesLeft--;
      requestAnimationFrame(() => {
        const _value = parseFloat(window.getComputedStyle(element).getPropertyValue(property));
        if (_value == target) {
          requestAnimationFrame(() => {
            res(true);
          });
        } else if (_framesLeft == 0) {
          console.error(
            `StyleChecker: Target ${element.tagName} ${element.className} did not have its '${property}' property set to ${target} within ${_frameLimit} frames`
          );
          requestAnimationFrame(() => {
            res(false);
          });
        } else {
          checkReadyStatus();
        }
      });
    };
    checkReadyStatus();
  });
  return await promise;
}

const content = "<div class=\"tutorial-dialog-backgrounds flex absolute fullscreen-outside-safezone bg-cover\"></div>\r\n<div class=\"tutorial-dialog-bg-overlay absolute fullscreen-outside-safezone\"></div>\r\n<div class=\"tutorial-dialog-page-image-container absolute right-1\\.5\"></div>\r\n<div class=\"tutorial-dialog-page-logo\"></div>\r\n<div class=\"tutorial-dialog-info-container flex flex-col mx-26 mb-28 pb-5 flex-auto\">\r\n\t<div>\r\n\t\t<div class=\"tutorial-dialog-page-title uppercase fxs-header font-title ml-x mb-1 tracking-150\">\r\n\t\t\ttitle\r\n\t\t</div>\r\n\t\t<div class=\"tutorial-dialog-divider h-4 w-174 -mt-0\\.5 -ml-6 mb-0\\.5 opacity-50\"></div>\r\n\t\t<div class=\"tutorial-dialog-page-subtitle w-full ml-px font-title mb-2\">subtitle</div>\r\n\t\t<div class=\"tutorial-dialog-page-body font-body-lg mt-6 ml-4\">body</div>\r\n\t</div>\r\n</div>\r\n";

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
