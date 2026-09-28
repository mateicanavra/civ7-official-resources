class HighlightManager {
  highlighters = /* @__PURE__ */ new Map();
  registerHighlighter(name, addFunc, removeFunc) {
    this.highlighters.set(name, { add: addFunc, remove: removeFunc });
  }
  add(element) {
    const name = element.getAttribute("data-tut-highlight") ?? "default";
    const func = this.highlighters.get(name)?.add;
    if (func) {
      func(element);
    } else {
      console.error(
        `Tutorial cannot add highlight to an element because specified highlighter '${name}' doesn't exist. element: ${element.className}`
      );
    }
  }
  remove(element) {
    const name = element.getAttribute("data-tut-highlight") ?? "default";
    const func = this.highlighters.get(name)?.remove;
    if (func) {
      func(element);
    } else {
      console.error(
        `Tutorial cannot remove a highlight from an element because specified highlighter '${name}' doesn't exist. element: ${element.className}`
      );
    }
  }
}
const highlighter = new HighlightManager();
function downArrowAdd(element) {
  const highlightRoot = document.createElement("div");
  highlightRoot.classList.add("tut-arrow-vert");
  element.appendChild(highlightRoot);
}
function downArrowDelete(element) {
  const highlightRoot = element.querySelector(".tut-arrow-vert");
  if (!highlightRoot) {
    console.warn("Unable to remove down arrow highlight from element, cannot find root highlight node.");
    return;
  }
  highlightRoot.classList.remove("tut-arrow-vert");
  highlightRoot.parentElement?.removeChild(highlightRoot);
}
highlighter.registerHighlighter("downArrowHighlighter", downArrowAdd, downArrowDelete);
function defaultHighlightAdd(element) {
  element.classList.add("tut-default-highlight");
}
function defaultHighlightRemove(element) {
  element.classList.remove("tut-default-highlight");
}
highlighter.registerHighlighter("default", defaultHighlightAdd, defaultHighlightRemove);
function founderHighlightAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.value = "tut-circle-highlight absolute min-w-36 min-h-36 pointer-events-none";
  element.classList.add("flex", "justify-center", "items-center");
  element.appendChild(pingAnim);
}
function founderHighlightRemove(element) {
  const highlightLeftover = element.querySelector(".tut-circle-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.classList.remove("flex", "justify-center", "items-center");
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("founderHighlight", founderHighlightAdd, founderHighlightRemove);
function productionHighlightAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-container-highlight");
  pingAnim.classList.add("production-highlight");
  element.appendChild(pingAnim);
}
function productionHighlightRemove() {
  const highlightLeftover = document.querySelector(".tut-container-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("productionHighlights", productionHighlightAdd, productionHighlightRemove);
function techHighlightAdd(element) {
  const borderAnim = document.createElement("div");
  borderAnim.classList.add("tut-chooser-item-highlight");
  element.appendChild(borderAnim);
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-ping-pos-highlight", "tut-ping-pos-highlight-top");
  borderAnim.appendChild(pingAnim);
  const arrowAnim = document.createElement("div");
  arrowAnim.classList.add("tut-ping-arrow", "tut-ping-arrow-top");
  element.appendChild(arrowAnim);
}
function techHighlightRemove() {
  const borderHighlightLeftover = document.querySelector(".tut-chooser-item-highlight");
  borderHighlightLeftover?.remove();
  const arrowHighlightLeftover = document.querySelector(".tut-ping-arrow");
  arrowHighlightLeftover?.remove();
}
highlighter.registerHighlighter("techChooserHighlights", techHighlightAdd, techHighlightRemove);
function techHighlightOffAdd(element) {
  const pingAnim = document.createElement("div");
  pingAnim.classList.add("tut-blank-highlight");
  element.appendChild(pingAnim);
}
function techHighlightOffRemove() {
  const highlightLeftover = document.querySelector(".tut-blank-highlight");
  if (highlightLeftover?.parentElement) {
    highlightLeftover.parentElement.removeChild(highlightLeftover);
  }
}
highlighter.registerHighlighter("techChooserHighlightsOff", techHighlightOffAdd, techHighlightOffRemove);
var Tutorial;
((Tutorial2) => {
  function highlightElement(element) {
    highlighter.add(element);
  }
  Tutorial2.highlightElement = highlightElement;
  function unhighlightElement(element) {
    highlighter.remove(element);
  }
  Tutorial2.unhighlightElement = unhighlightElement;
})(Tutorial || (Tutorial = {}));

export { Tutorial };
//# sourceMappingURL=tutorial-highlighter.js.map
