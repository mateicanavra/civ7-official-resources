import FocusManager from '../../../core/ui/input/focus-manager.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';

var LineDirection = /* @__PURE__ */ ((LineDirection2) => {
  LineDirection2[LineDirection2["UP_LINE"] = 0] = "UP_LINE";
  LineDirection2[LineDirection2["SAME_LEVEL_LINE"] = 1] = "SAME_LEVEL_LINE";
  LineDirection2[LineDirection2["DOWN_LINE"] = 2] = "DOWN_LINE";
  return LineDirection2;
})(LineDirection || {});
var TreeGridDirection = /* @__PURE__ */ ((TreeGridDirection2) => {
  TreeGridDirection2[TreeGridDirection2["HORIZONTAL"] = 0] = "HORIZONTAL";
  TreeGridDirection2[TreeGridDirection2["VERTICAL"] = 1] = "VERTICAL";
  return TreeGridDirection2;
})(TreeGridDirection || {});
var TreeClassSelector = /* @__PURE__ */ ((TreeClassSelector2) => {
  TreeClassSelector2["CARD"] = "tree-card-selector";
  return TreeClassSelector2;
})(TreeClassSelector || {});
class TreeCardBase extends Component {
  cardClass = "tree-card-selector" /* CARD */;
  constructor(root) {
    super(root);
    this.Root.classList.add(this.cardClass);
  }
}
const UpdateLinesEventName = "update-tree-lines";
class UpdateLinesEvent extends CustomEvent {
  constructor() {
    super(UpdateLinesEventName, { bubbles: false, cancelable: true });
  }
}
const ScaleTreeCardEventName = "scale-tree-card";
class ScaleTreeCardEvent extends CustomEvent {
  constructor(scale) {
    super(ScaleTreeCardEventName, { bubbles: false, cancelable: true, detail: { scale } });
  }
}
class TreeCardScaleBoundary {
  currentGrid;
  _currentCardScale = 1;
  // 70% of original tree card is the lower limit for scaling
  MIN_SCALE = 0.7;
  MAX_SCALE = 1;
  linesContainer = null;
  resizeEventListener = this.onResize.bind(this);
  get currentCardScale() {
    return this._currentCardScale;
  }
  set currentCardScale(value) {
    this._currentCardScale = value;
    this.updateCardLines();
  }
  constructor(container, minScale, maxScale) {
    this.currentGrid = container;
    if (minScale) {
      this.MIN_SCALE = minScale;
    }
    if (maxScale) {
      this.MAX_SCALE = maxScale;
    }
    window.addEventListener("resize", this.resizeEventListener);
  }
  resetScale() {
    this.currentCardScale = this.MAX_SCALE;
  }
  updateCardLines() {
    window.dispatchEvent(new ScaleTreeCardEvent(this.currentCardScale));
    this.linesContainer = this.currentGrid.querySelector(".lines-container");
    if (!this.linesContainer) {
      console.warn("updateCardLines(): No lines container to update lines from");
      return;
    }
    this.linesContainer.querySelectorAll("tree-line")?.forEach((c) => {
      c.dispatchEvent(new UpdateLinesEvent());
    });
  }
  onResize() {
    this.checkBoundaries();
  }
  checkBoundaries() {
    this.resetScale();
    waitForLayout(() => {
      const treeContainer = this.currentGrid.querySelector(".tree-container");
      if (!treeContainer) {
        console.warn("screen-tech-tree: checkBoundaries(): No tree container found, focus is not posible");
        return;
      }
      const children = treeContainer.children;
      let totalParentHeight = 0;
      let biggestChildHeight = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childHeight = child.offsetHeight;
        const parent = child.parentElement;
        if (!parent) {
          continue;
        }
        const parentHeight = parent.offsetHeight;
        totalParentHeight = parentHeight;
        if (childHeight > parentHeight && childHeight > biggestChildHeight) {
          biggestChildHeight = childHeight;
        }
      }
      if (totalParentHeight > 0 && biggestChildHeight > 0) {
        const scalingPercentage = totalParentHeight / biggestChildHeight;
        const currentCardScale = Math.round(Math.max(this.MIN_SCALE, scalingPercentage) * 100) / 100;
        this.currentCardScale = currentCardScale;
      }
    });
  }
  removeListeners() {
    window.removeEventListener("resize", this.resizeEventListener);
  }
}
var TreeSupport;
((TreeSupport2) => {
  function getGridElement(tree, direction, createCardFn) {
    if (direction == 0 /* HORIZONTAL */) {
      return createGridElementHorizontal(tree, createCardFn);
    } else {
      return createGridElementVertical(tree, createCardFn);
    }
  }
  TreeSupport2.getGridElement = getGridElement;
  const SMALL_SCREEN_MODE_MAX_HEIGHT = 800;
  const SMALL_SCREEN_MODE_MAX_WIDTH = 1e3;
  function isSmallScreen() {
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    return isMobileViewExperience || window.innerHeight <= Layout.pixelsToScreenPixels(SMALL_SCREEN_MODE_MAX_HEIGHT) || window.innerWidth <= Layout.pixelsToScreenPixels(SMALL_SCREEN_MODE_MAX_WIDTH);
  }
  TreeSupport2.isSmallScreen = isSmallScreen;
  function createGridElementHorizontal(tree, createCardFn) {
    const scrollable = document.createElement("fxs-scrollable-horizontal");
    scrollable.classList.add("w-full", "flex-auto");
    const treeContainer = document.createElement("div");
    treeContainer.classList.add("tree-container", "items-center", "flex", "flex-row", "m-6");
    treeContainer.addEventListener("navigate-input", TreeNavigation.Horizontal.onNavigateInput);
    const cardsColumn = document.createElement("div");
    cardsColumn.classList.add("tree-grid-column");
    Databind.for(cardsColumn, `${tree}.treeGrid.grid`, "column");
    {
      const cardDiv = document.createElement("div");
      Databind.for(cardDiv, "column", "card");
      {
        const card = document.createElement("div");
        card.classList.add("tree-grid-card");
        Databind.attribute(card, "row", "card.row");
        Databind.attribute(card, "column", "card.column");
        createCardFn(card);
        cardDiv.appendChild(card);
      }
      cardsColumn.appendChild(cardDiv);
    }
    treeContainer.appendChild(cardsColumn);
    scrollable.appendChild(treeContainer);
    waitForLayout(() => {
      const linesContainer = document.createElement("div");
      linesContainer.classList.add("lines-container");
      const cardLineDiv = document.createElement("div");
      Databind.for(cardLineDiv, `${tree}.treeGrid.lines`, "line");
      {
        const cardLine = document.createElement("tree-line");
        cardLine.setAttribute("direction", `${0 /* HORIZONTAL */}`);
        Databind.attribute(cardLine, "from", "line.from");
        Databind.attribute(cardLine, "to", "line.to");
        Databind.attribute(cardLine, "locked", "line.locked");
        Databind.attribute(cardLine, "dummy", "line.dummy");
        Databind.attribute(cardLine, "collision-offset", "line.collisionOffset");
        cardLineDiv.appendChild(cardLine);
      }
      linesContainer.appendChild(cardLineDiv);
      treeContainer.appendChild(linesContainer);
    });
    const cardScaling = new TreeCardScaleBoundary(scrollable);
    cardScaling.checkBoundaries();
    return { scrollable, cardScaling };
  }
  function createGridElementVertical(tree, createCardFn) {
    const scrollable = document.createElement("fxs-scrollable");
    scrollable.classList.add("w-full", "flex-auto", "mx-5");
    scrollable.setAttribute("handle-gamepad-pan", "true");
    const treeContainer = document.createElement("div");
    treeContainer.classList.add("tree-container", "items-center", "flex", "flex-col", "m-6");
    treeContainer.addEventListener("navigate-input", TreeNavigation.Vertical.onNavigateInput);
    const cardsRow = document.createElement("div");
    cardsRow.classList.add("tree-grid-row");
    Databind.for(cardsRow, `${tree}.treeGrid.grid`, "row");
    {
      const cardDiv = document.createElement("div");
      Databind.for(cardDiv, "row", "card");
      {
        const card = document.createElement("div");
        card.classList.add("tree-grid-card");
        Databind.attribute(card, "row", "card.row");
        Databind.attribute(card, "column", "card.column");
        createCardFn(card);
        cardDiv.appendChild(card);
      }
      cardsRow.appendChild(cardDiv);
    }
    const linesContainer = document.createElement("div");
    linesContainer.classList.add("lines-container", "vertical");
    const cardLineDiv = document.createElement("div");
    Databind.for(cardLineDiv, `${tree}.treeGrid.lines`, "line");
    {
      const cardLine = document.createElement("tree-line");
      cardLine.setAttribute("direction", `${1 /* VERTICAL */}`);
      Databind.attribute(cardLine, "from", "line.from");
      Databind.attribute(cardLine, "to", "line.to");
      Databind.attribute(cardLine, "locked", "line.locked");
      Databind.attribute(cardLine, "dummy", "line.dummy");
      cardLineDiv.appendChild(cardLine);
    }
    linesContainer.appendChild(cardLineDiv);
    treeContainer.appendChild(linesContainer);
    treeContainer.appendChild(cardsRow);
    scrollable.appendChild(treeContainer);
    return { scrollable, cardScaling: null };
  }
})(TreeSupport || (TreeSupport = {}));
var TreeNavigation;
((TreeNavigation2) => {
  let Horizontal;
  ((Horizontal2) => {
    let lastMoveCoordY = 0;
    function onNavigateInput(navigationEvent) {
      const live = treeNavigation(navigationEvent);
      if (!live) {
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
      }
    }
    Horizontal2.onNavigateInput = onNavigateInput;
    function treeNavigation(navigationEvent) {
      if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
        if (navigationEvent.detail.name == "nav-move") {
          lastMoveCoordY = navigationEvent.detail.y;
        }
        return true;
      }
      const originElement = FocusManager.getFocus();
      const isFocusCard = originElement.classList.contains("tree-card-selector" /* CARD */);
      const originCard = isFocusCard ? originElement : originElement.closest(`.${"tree-card-selector" /* CARD */}`);
      if (!originCard) {
        console.error("tree-support: Horizontal::treeNavigation(): Tree card not found");
        return true;
      }
      if (!originCard.parentElement) {
        console.error("tree-support: Horizontal::treeNavigation(): current focus parent element not found.");
        return true;
      }
      const originRowAttribute = originCard.parentElement.getAttribute("row");
      const originColAttribute = originCard.parentElement.getAttribute("column");
      if (!originRowAttribute || !originColAttribute) {
        console.error(
          "tree-support: Horizontal::treeNavigation(): coordinates not found for the current focus."
        );
        return true;
      }
      const originTree = originCard.closest(".tree-container");
      if (!originTree) {
        console.error("tree-support: Horizontal::treeNavigation(): No .tree-container parent were found!");
        return true;
      }
      const cards = originTree.querySelectorAll(
        `.${"tree-card-selector" /* CARD */}`
      );
      if (cards.length <= 0) {
        console.error("tree-support: Horizontal::treeNavigation(): There is no card within that tree!");
        return true;
      }
      let nextTarget = { x: -1, y: -1 };
      const origin = { x: parseInt(originColAttribute), y: parseInt(originRowAttribute) };
      for (let i = 0; i < cards.length; ++i) {
        const card = cards[i];
        const isDummy = card.classList.contains("dummy");
        if (isDummy) {
          continue;
        }
        if (!card.parentElement) {
          console.error("tree-support: Horizontal::treeNavigation(): Current card parent element not found.");
          return true;
        }
        const candidateRowAttribute = card.parentElement.getAttribute("row");
        const candidateColAttribute = card.parentElement.getAttribute("column");
        if (!candidateRowAttribute || !candidateColAttribute) {
          console.error(
            "tree-support: Horizontal::treeNavigation(): coordinates not found for the candidate!"
          );
          return true;
        }
        const candidate = { x: parseInt(candidateColAttribute), y: parseInt(candidateRowAttribute) };
        if (candidate.x == origin.x && candidate.y == origin.y) {
          continue;
        }
        switch (navigationEvent.getDirection()) {
          case InputNavigationAction.DOWN:
            nextTarget = bestDownTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.UP:
            nextTarget = bestUpTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.LEFT:
            nextTarget = bestLeftTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.RIGHT:
            nextTarget = bestRightTarget(origin, nextTarget, candidate);
            break;
          default:
            return true;
        }
      }
      if (nextTarget.x != -1) {
        const card = originTree.querySelector(
          `div[row="${nextTarget.y}"][column="${nextTarget.x}"] .${"tree-card-selector" /* CARD */}`
        );
        if (card) {
          FocusManager.setFocus(card);
        }
      }
      lastMoveCoordY = 0;
      return false;
    }
    function bestDownTarget(origin, current, candidate) {
      if (candidate.y > origin.y && candidate.x == origin.x) {
        if (current.y == -1 || current.y > candidate.y) {
          return candidate;
        }
      }
      return current;
    }
    function bestUpTarget(origin, current, candidate) {
      if (candidate.y < origin.y && candidate.x == origin.x) {
        if (current.y == -1 || current.y < candidate.y) {
          return candidate;
        }
      }
      return current;
    }
    function bestLeftTarget(origin, current, candidate) {
      if (candidate.x >= origin.x) {
        return current;
      }
      if (current.y == -1) {
        return candidate;
      }
      if (current.x < candidate.x) {
        return candidate;
      }
      if (current.x == candidate.x) {
        if (candidate.y == origin.y) {
          return candidate;
        }
        if (lastMoveCoordY < 0) {
          if (candidate.y > origin.y) {
            if (current.y < origin.y || candidate.y < current.y) {
              return candidate;
            }
          } else {
            if (current.y < origin.y && current.y < candidate.y) {
              return candidate;
            }
          }
        } else if (lastMoveCoordY > 0) {
          if (candidate.y < origin.y) {
            if (current.y > origin.y || candidate.y > current.y) {
              return candidate;
            }
          } else {
            if (current.y > origin.y && current.y > candidate.y) {
              return candidate;
            }
          }
        } else {
          const currentRowDiff = Math.abs(current.y - origin.y);
          const candidateRowDiff = Math.abs(candidate.y - origin.y);
          if (currentRowDiff > candidateRowDiff) {
            return candidate;
          }
          if (currentRowDiff == candidateRowDiff) {
            if (candidate.y < current.y) {
              return candidate;
            }
          }
        }
      }
      return current;
    }
    function bestRightTarget(origin, current, candidate) {
      if (candidate.x <= origin.x) {
        return current;
      }
      if (current.y == -1) {
        return candidate;
      }
      if (current.x > candidate.x) {
        return candidate;
      }
      if (current.x == candidate.x) {
        if (candidate.y == origin.y) {
          return candidate;
        }
        if (lastMoveCoordY < 0) {
          if (candidate.y > origin.y) {
            if (current.y < origin.y || candidate.y < current.y) {
              return candidate;
            }
          } else {
            if (current.y < origin.y && current.y < candidate.y) {
              return candidate;
            }
          }
        } else if (lastMoveCoordY > 0) {
          if (candidate.y < origin.y) {
            if (current.y > origin.y || candidate.y > current.y) {
              return candidate;
            }
          } else {
            if (current.y > origin.y && current.y > candidate.y) {
              return candidate;
            }
          }
        } else {
          const currentRowDiff = Math.abs(current.y - origin.y);
          const candidateRowDiff = Math.abs(candidate.y - origin.y);
          if (currentRowDiff > candidateRowDiff) {
            return candidate;
          }
          if (currentRowDiff == candidateRowDiff) {
            if (candidate.y < current.y) {
              return candidate;
            }
          }
        }
      }
      return current;
    }
  })(Horizontal = TreeNavigation2.Horizontal || (TreeNavigation2.Horizontal = {}));
  let Vertical;
  ((Vertical2) => {
    let lastMoveCoordX = 0;
    function onNavigateInput(navigationEvent) {
      const live = treeNavigation(navigationEvent);
      if (!live) {
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
      }
    }
    Vertical2.onNavigateInput = onNavigateInput;
    function treeNavigation(navigationEvent) {
      if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
        if (navigationEvent.detail.name == "nav-move") {
          lastMoveCoordX = navigationEvent.detail.x;
        }
        return true;
      }
      const originElement = FocusManager.getFocus();
      const isFocusCard = originElement.classList.contains("tree-card-selector" /* CARD */);
      const originCard = isFocusCard ? originElement : originElement.closest(`.${"tree-card-selector" /* CARD */}`);
      if (!originCard) {
        console.error("tree-support: Vertical::treeNavigation(): Tree card not found");
        return true;
      }
      if (!originCard.parentElement) {
        console.error("tree-support: Vertical::treeNavigation(): current focus parent element not found.");
        return true;
      }
      const originRowAttribute = originCard.parentElement.getAttribute("row");
      const originColAttribute = originCard.parentElement.getAttribute("column");
      if (!originRowAttribute || !originColAttribute) {
        console.error(
          "tree-support: Vertical::treeNavigation(): Coordinates not found for the origin (current focus)!"
        );
        return true;
      }
      const originTree = originCard.closest(".tree-container");
      if (!originTree) {
        console.error("tree-support: Vertical::treeNavigation(): No .tree-container parent were found!");
        return true;
      }
      const cards = originTree.querySelectorAll(
        `.${"tree-card-selector" /* CARD */}`
      );
      if (cards.length <= 0) {
        console.error("tree-support: Vertical::treeNavigation(): There is no card within that tree!");
        return true;
      }
      let nextTarget = { x: -1, y: -1 };
      const origin = { x: parseInt(originColAttribute), y: parseInt(originRowAttribute) };
      for (let i = 0; i < cards.length; ++i) {
        const card = cards[i];
        const isDummy = card.classList.contains("dummy");
        if (isDummy) {
          continue;
        }
        if (!card.parentElement) {
          console.error("tree-support: Vertical::treeNavigation(): Current card parent element not found.");
          return true;
        }
        const candidateRowAttribute = card.parentElement.getAttribute("row");
        const candidateColAttribute = card.parentElement.getAttribute("column");
        if (!candidateRowAttribute || !candidateColAttribute) {
          console.error(
            "culture-rectangular-grid: Vertical::treeNavigation(): coordinates not found for the candidate!"
          );
          return true;
        }
        const candidate = { x: parseInt(candidateColAttribute), y: parseInt(candidateRowAttribute) };
        if (candidate.x == origin.x && candidate.y == origin.y) {
          continue;
        }
        switch (navigationEvent.getDirection()) {
          case InputNavigationAction.DOWN:
            nextTarget = bestDownTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.UP:
            nextTarget = bestUpTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.LEFT:
            nextTarget = bestLeftTarget(origin, nextTarget, candidate);
            break;
          case InputNavigationAction.RIGHT:
            nextTarget = bestRightTarget(origin, nextTarget, candidate);
            break;
          default:
            return true;
        }
      }
      if (nextTarget.x != -1) {
        const card = originTree.querySelector(
          `div[row="${nextTarget.y}"][column="${nextTarget.x}"] .${"tree-card-selector" /* CARD */}`
        );
        if (card) {
          FocusManager.setFocus(card);
        }
      }
      lastMoveCoordX = 0;
      return false;
    }
    function bestRightTarget(origin, current, candidate) {
      if (candidate.x > origin.x && candidate.y == origin.y) {
        if (current.x == -1 || current.x > candidate.x) {
          return candidate;
        }
      }
      return current;
    }
    function bestLeftTarget(origin, current, candidate) {
      if (candidate.x < origin.x && candidate.y == origin.y) {
        if (current.x == -1 || current.x < candidate.x) {
          return candidate;
        }
      }
      return current;
    }
    function bestUpTarget(origin, current, candidate) {
      if (candidate.y >= origin.y) {
        return current;
      }
      if (current.x == -1) {
        return candidate;
      }
      if (current.y < candidate.y) {
        return candidate;
      }
      if (current.y == candidate.y) {
        if (candidate.x == origin.x) {
          return candidate;
        }
        if (lastMoveCoordX > 0) {
          if (candidate.x > origin.x) {
            if (current.x < origin.x || candidate.x < current.x) {
              return candidate;
            }
          } else {
            if (current.x < origin.x && current.x < candidate.x) {
              return candidate;
            }
          }
        } else if (lastMoveCoordX < 0) {
          if (candidate.x < origin.x) {
            if (current.x > origin.x || candidate.x > current.x) {
              return candidate;
            }
          } else {
            if (current.x > origin.x && current.x > candidate.x) {
              return candidate;
            }
          }
        } else {
          const currentColumnDiff = Math.abs(current.x - origin.x);
          const candidateColumnDiff = Math.abs(candidate.x - origin.x);
          if (currentColumnDiff > candidateColumnDiff) {
            return candidate;
          }
          if (currentColumnDiff == candidateColumnDiff) {
            if (candidate.x < current.x) {
              return candidate;
            }
          }
        }
      }
      return current;
    }
    function bestDownTarget(origin, current, candidate) {
      if (candidate.y <= origin.y) {
        return current;
      }
      if (current.x == -1) {
        return candidate;
      }
      if (current.y > candidate.y) {
        return candidate;
      }
      if (current.y == candidate.y) {
        if (candidate.x == origin.x) {
          return candidate;
        }
        if (lastMoveCoordX > 0) {
          if (candidate.x > origin.x) {
            if (current.x < origin.x || candidate.x < current.x) {
              return candidate;
            }
          } else {
            if (current.x < origin.x && current.x < candidate.x) {
              return candidate;
            }
          }
        } else if (lastMoveCoordX < 0) {
          if (candidate.x < origin.x) {
            if (current.x > origin.x || candidate.x > current.x) {
              return candidate;
            }
          } else {
            if (current.x > origin.x && current.x > candidate.x) {
              return candidate;
            }
          }
        } else {
          const currentColumnDiff = Math.abs(current.x - origin.x);
          const candidateColumnDiff = Math.abs(candidate.x - origin.x);
          if (currentColumnDiff > candidateColumnDiff) {
            return candidate;
          }
          if (currentColumnDiff == candidateColumnDiff) {
            if (candidate.x < current.x) {
              return candidate;
            }
          }
        }
      }
      return current;
    }
  })(Vertical = TreeNavigation2.Vertical || (TreeNavigation2.Vertical = {}));
})(TreeNavigation || (TreeNavigation = {}));
var TreeNodesSupport;
((TreeNodesSupport2) => {
  function getReplaceUnits(unit) {
    const replaceUnits = GameInfo.UnitReplaces.filter(
      (o) => o.ReplacesUnitType == unit.UnitType
    );
    if (!replaceUnits) {
      console.warn("TreeNodesSupport: getReplaceUnits(): Missing replace data.");
      return;
    }
    return replaceUnits.map((r) => r.CivUniqueUnitType);
  }
  function getRepeatedUniqueUnits(unlocks) {
    const unitsMap = {};
    for (const unlock of unlocks) {
      const unitInfo = GameInfo.Units.find((o) => o.UnitType == unlock.TargetType);
      if (unitInfo) {
        const uniqueUnits = getReplaceUnits(unitInfo);
        if (uniqueUnits) {
          uniqueUnits.forEach((unit) => {
            unitsMap[unit] = unitInfo.UnitType;
          });
        }
      }
    }
    const result = [];
    for (const unlock of unlocks) {
      if (unitsMap.hasOwnProperty(unlock.TargetType)) {
        result.push(unitsMap[unlock.TargetType]);
      }
    }
    return result;
  }
  TreeNodesSupport2.getRepeatedUniqueUnits = getRepeatedUniqueUnits;
  function getUnlocksByDepthStateText(state) {
    if (state.isCompleted) {
      return `[${Locale.compose("LOC_UI_COMPLETED_TREE")}]`;
    } else if (state.isCurrent) {
      return `[${Locale.compose("LOC_UI_RESEARCHING_TREE")}]`;
    } else if (state.isLocked) {
      return `[${Locale.compose("LOC_UI_LOCKED_TREE")}]`;
    }
    return "";
  }
  TreeNodesSupport2.getUnlocksByDepthStateText = getUnlocksByDepthStateText;
  function getValidNodeUnlocks(nodeData) {
    const nodeDefinitions = [];
    for (let i = 0; i < nodeData.unlockIndices.length; i++) {
      const index = nodeData.unlockIndices[i];
      const unlockInfo = GameInfo.ProgressionTreeNodeUnlocks[index];
      if (!unlockInfo || unlockInfo.Hidden) {
        continue;
      }
      nodeDefinitions.push(unlockInfo);
    }
    return nodeDefinitions;
  }
  TreeNodesSupport2.getValidNodeUnlocks = getValidNodeUnlocks;
})(TreeNodesSupport || (TreeNodesSupport = {}));

export { LineDirection as L, ScaleTreeCardEventName as S, TreeSupport as T, UpdateLinesEvent as U, TreeGridDirection as a, TreeCardBase as b, TreeNodesSupport as c, UpdateLinesEventName as d, TreeClassSelector as e };
//# sourceMappingURL=tree-support.chunk.js.map
