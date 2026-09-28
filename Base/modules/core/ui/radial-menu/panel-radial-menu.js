import { Audio } from '../audio-base/audio-support.js';
import { ContextManager } from '../context-manager/context-manager.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { NavigateInputEventName, InputEngineEventName } from '../input/input-support.js';
import { InterfaceMode } from '../interface-modes/interface-modes.js';
import NavTray from '../navigation-tray/model-navigation-tray.js';
import Panel from '../panel-support.js';
import { MustGetElement } from '../utilities/utilities-dom.js';
import { Layout } from '../utilities/utilities-layout.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';
import { RibbonYieldType, DiploRibbonData } from '../../../base-standard/ui/diplo-ribbon/model-diplo-ribbon.js';
import { RaiseDiplomacyEvent } from '../../../base-standard/ui/diplomacy/diplomacy-events.js';
import PopupSequencer from '../../../base-standard/ui/popup-sequencer/popup-sequencer.js';
import TutorialManager from '../../../base-standard/ui/tutorial/tutorial-manager.js';
import styles from './panel-radial-menu.scss.js';
import { registerRadialMenu, getRadialMenus, NavigationType, clearRadialMenuItems, registerRadialMenuItem } from './radial-menu-item-store.js';

const RIBBON_YIELD_TYPE_TO_ICON_ID = {
  [RibbonYieldType.Default]: "YIELD_FOOD",
  [RibbonYieldType.Gold]: "YIELD_GOLD",
  [RibbonYieldType.Culture]: "YIELD_CULTURE",
  [RibbonYieldType.Science]: "YIELD_SCIENCE",
  [RibbonYieldType.Happiness]: "YIELD_HAPPINESS",
  [RibbonYieldType.Diplomacy]: "YIELD_DIPLOMACY",
  [RibbonYieldType.Settlements]: "YIELD_CITIES",
  [RibbonYieldType.Property]: "YIELD_FOOD",
  [RibbonYieldType.Trade]: "YIELD_TRADES"
};
const RIBBON_YIELD_TYPE_TO_COLOR_CLASS = {
  [RibbonYieldType.Default]: "text-accent-2",
  [RibbonYieldType.Gold]: "text-yield-gold",
  [RibbonYieldType.Culture]: "text-yield-culture",
  [RibbonYieldType.Science]: "text-yield-science",
  [RibbonYieldType.Happiness]: "text-yield-happiness",
  [RibbonYieldType.Diplomacy]: "text-yield-influence",
  [RibbonYieldType.Settlements]: "text-accent-3",
  [RibbonYieldType.Property]: "text-accent-2",
  [RibbonYieldType.Trade]: "text-accent-3"
};
const LeadersMenuSymbol = Symbol("Leaders");
registerRadialMenu({ symbol: LeadersMenuSymbol, title: "LOC_UI_RADIAL_MENU_LEADER_TITLE", sortOrder: 20 });
class PanelRadialMenu extends Panel {
  NAVIGATION_THRESHOLD = 0.5;
  // To limit the detection of radial selection to the amplitude of the joystick
  MAX_ROTATION_VALUE = (Number.MAX_SAFE_INTEGER + 1) / 128 - 1;
  // To keep the precision on the arrow rotation to the 2nd decimal
  menus = [];
  currentMenuIndex = 0;
  currentMenuFocusItemIndex = 0;
  rotation = 0;
  focusDeg = 0;
  tabBarElement;
  slotGroupElement;
  selectedMenuItemElements;
  selectedMenuItemDescriptions;
  selectedMenuArrowContainer;
  tabBarSelectedEventListener = this.onTabBarSelected.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  itemActionActivateListener = this.onItemActionActivate.bind(this);
  itemFocusListener = this.onItemFocus.bind(this);
  itemBlurListener = this.onItemBlur.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.populateLeaderMenu();
    this.menus = getRadialMenus().map((menu) => ({
      title: menu.title,
      items: this.resolveItemsOnClickFunction(
        this.resolveItemsPositionDeg(this.resolveItemsIsHidden(this.filterMenuItems(menu.items) ?? []))
      )
    }));
    this.Root.innerHTML = this.renderMenuStack(this.menus);
    const l10nParagraph = this.Root.querySelectorAll(".font-fit-shrink[data-l10n-id] p[cohinline]");
    l10nParagraph.forEach((element) => {
      element.classList.add("font-fit-shrink");
      element.setAttribute("style", "coh-font-fit-min-size: 6px;");
    });
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "controller-radial");
    this.tabBarElement = MustGetElement("fxs-tab-bar", this.Root);
    this.tabBarElement.addEventListener("tab-selected", this.tabBarSelectedEventListener);
    this.slotGroupElement = MustGetElement("fxs-slot-group", this.Root);
    const radialMenuItems = this.Root.querySelectorAll(".radial-menu-item");
    radialMenuItems?.forEach((elem) => {
      elem.addEventListener("action-activate", this.itemActionActivateListener);
      elem.addEventListener("focus", this.itemFocusListener);
      elem.addEventListener("blur", this.itemBlurListener);
      elem.setAttribute("data-audio-group-ref", "controller-radial");
    });
    this.Root.addEventListener(NavigateInputEventName, this.navigateInputListener);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.listenForWindowEvent(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
  }
  onAttach() {
    this.playAnimateInSound();
    this.updateSelectedMenuState(this.currentMenuIndex.toString());
  }
  getTotalRatioOfItems = (items) => {
    if (!items.length) {
      return 1;
    }
    return items.map(({ ratio }) => ratio ?? 1).reduce((result, ratio) => result + ratio);
  };
  filterMenuItems(items) {
    if (items) {
      return items.filter((item) => {
        if (item.excludedAge && item.excludedAge === Game.age) {
          return false;
        }
        if (item.requiredCapabilities) {
          for (const capability of item.requiredCapabilities) {
            if (!Game.hasCapability(capability)) {
              return false;
            }
          }
        }
        return true;
      });
    }
    return void 0;
  }
  resolveItemsPositionDeg = (items) => {
    const totalRatio = this.getTotalRatioOfItems(items);
    let nextStartDeg = items.length > 1 ? 0 : 180;
    return items.map((item) => {
      const { ratio = 1 } = item;
      const startDeg = nextStartDeg;
      const endDeg = startDeg + ratio / totalRatio * 360;
      nextStartDeg = endDeg;
      return {
        ...item,
        startDeg: (startDeg + 90) % 360,
        positionDeg: ((startDeg + endDeg) / 2 + 90) % 360
      };
    });
  };
  resolveItemsOnClickFunction = (items) => {
    return items.map((item) => {
      const { navigation = { type: NavigationType.NONE, value: "", createsMouseGuard: false } } = item;
      const { type, value, createsMouseGuard } = navigation;
      const onClickFn = (fn) => () => {
        this.close();
        fn();
      };
      let onClick = () => {
      };
      switch (type) {
        case NavigationType.CONTEXT:
          const radialItemValue = value();
          if (radialItemValue == "") {
            break;
          }
          onClick = onClickFn(() => {
            if (navigation.useSequencer) {
              const popupData = {
                category: PopupSequencer.getCategory(),
                screenId: radialItemValue,
                properties: { singleton: true, createMouseGuard: createsMouseGuard }
              };
              PopupSequencer.addDisplayRequest(popupData);
            } else {
              ContextManager.push(radialItemValue, {
                singleton: true,
                createMouseGuard: createsMouseGuard
              });
            }
          });
          break;
        case NavigationType.DIPLOMACY:
          const callback = () => {
            const playerId = Number.parseInt(value());
            window.dispatchEvent(new RaiseDiplomacyEvent(playerId));
          };
          onClick = onClickFn(callback);
          break;
        case NavigationType.INTERFACE:
          onClick = onClickFn(() => InterfaceMode.switchTo(value()));
          break;
        case NavigationType.FOCUS:
          onClick = onClickFn(
            () => FocusManager.get().setFocus(
              document.querySelector(".harness")?.querySelector(value()) ?? this.Root
            )
          );
          break;
      }
      return {
        ...item,
        onClick
      };
    });
  };
  resolveItemsIsHidden = (items) => {
    return items.map((item) => ({
      ...item,
      isHidden: item.isHidden !== void 0 ? item.isHidden : item.tutHidderId && TutorialManager.isItemExistInAll(item.tutHidderId) ? !TutorialManager.isItemCompleted(item.tutHidderId) : false
    }));
  };
  onDetach() {
    this.tabBarElement?.removeEventListener("tab-selected", this.tabBarSelectedEventListener);
    this.Root.removeEventListener(NavigateInputEventName, this.navigateInputListener);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onDetach();
  }
  onReceiveFocus() {
    this.updateSelectedMenuState(this.currentMenuIndex.toString());
    this.focusItem(this.focusDeg);
    NavTray.clear();
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateNavBeam("LOC_NAV_RADIAL_BEAM");
    super.onReceiveFocus();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  findNormalisedAngleDifference(angle1, angle2) {
    return Math.abs(this.findAngleDifference(angle1, angle2));
  }
  findAngleDifference(angle1, angle2) {
    const diff = (angle1 - angle2 + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
  }
  getFirstIndexOfMinValue(array) {
    return array.reduce((r, v, i, a) => v > a[r] ? r : i, -1);
  }
  handleMove = (navigationEvent) => {
    const {
      detail: { x, y }
    } = navigationEvent;
    const stickLength = Math.hypot(x, y);
    const focusDeg = stickLength > this.NAVIGATION_THRESHOLD ? (Math.atan2(y, x) * 180 / Math.PI + 360) % 360 : this.focusDeg;
    this.focusItem(focusDeg);
  };
  rotateMenuArrow = (focusDeg) => {
    const diff = this.findAngleDifference(focusDeg, this.focusDeg);
    this.rotation = (this.rotation + diff) % this.MAX_ROTATION_VALUE;
    this.selectedMenuArrowContainer?.style.setProperty("transform", `rotate(${180 - this.rotation}deg)`);
  };
  focusItem = (focusDeg) => {
    const focusItemIndex = this.getFirstIndexOfMinValue(
      this.menus[this.currentMenuIndex]?.items?.map(
        (item) => this.findNormalisedAngleDifference(item.positionDeg ?? 0, focusDeg)
      ) ?? []
    );
    if (focusItemIndex != this.currentMenuFocusItemIndex) {
      const focusElement = this.selectedMenuItemElements?.[focusItemIndex];
      FocusManager.get().setFocus(focusElement ?? this.Root);
      this.currentMenuFocusItemIndex = focusItemIndex;
    }
    return this.menus[this.currentMenuIndex]?.items?.[this.currentMenuFocusItemIndex];
  };
  handleNavigation = (navigationEvent) => {
    if (![InputActionStatuses.FINISH, InputActionStatuses.UPDATE].includes(navigationEvent.detail.status)) {
      return true;
    }
    switch (navigationEvent.detail.name) {
      case "nav-move":
        this.handleMove(navigationEvent);
        return false;
      default:
        return true;
    }
  };
  handleEngineInput = (inputEvent) => {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "sys-menu":
        this.close();
        return false;
      default:
        return true;
    }
  };
  onEngineInput(inputEvent) {
    if (!this.handleEngineInput(inputEvent)) {
      inputEvent.stopImmediatePropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigateInput(navigationEvent) {
    if (!this.handleNavigation(navigationEvent)) {
      navigationEvent.stopImmediatePropagation();
      navigationEvent.preventDefault();
    }
  }
  onActiveDeviceChange(event) {
    if (!event.detail.gamepadActive) {
      this.close();
    }
  }
  onTabBarSelected({
    detail: {
      selectedItem: { id }
    }
  }) {
    this.rotation = 0;
    this.focusDeg = 0;
    this.updateSelectedMenuState(id);
  }
  updateSelectedMenuState(id) {
    this.currentMenuIndex = Number.parseInt(id);
    this.selectedMenuArrowContainer = this.Root.querySelector(`.menu-items-arrow-container[index='${id}']`) ?? void 0;
    this.selectedMenuArrowContainer?.style.setProperty("transition-duration", "0s");
    this.selectedMenuItemElements = this.Root.querySelectorAll(`.radial-menu-item[menuIndex='${id}']`);
    this.selectedMenuItemDescriptions = this.Root.querySelectorAll(
      `.radial-menu__item-description[menuIndex='${id}']`
    );
    this.slotGroupElement?.setAttribute("selected-slot", id);
  }
  onItemActionActivate({ target }) {
    const targetElement = target;
    const isHidden = targetElement?.classList.contains("hidden");
    const index = Number.parseInt(targetElement?.getAttribute("index") ?? "-1");
    if (index >= 0 && !isHidden) {
      this.menus[this.currentMenuIndex]?.items?.[index]?.onClick?.();
    }
  }
  onItemFocus({ target }) {
    const targetIndex = target.getAttribute("index");
    if (targetIndex !== null) {
      const index = Number.parseInt(targetIndex);
      const { positionDeg = 0 } = this.menus[this.currentMenuIndex]?.items?.[index] ?? {};
      this.rotateMenuArrow(positionDeg);
      this.focusDeg = positionDeg;
      this.selectedMenuArrowContainer?.classList.remove("hidden");
      if (this.selectedMenuItemDescriptions) {
        for (const [i, desc] of this.selectedMenuItemDescriptions.entries()) {
          desc.classList.toggle("hidden", i != index);
        }
      }
      waitForLayout(() => this.selectedMenuArrowContainer?.style.setProperty("transition-duration", "0.1s"));
      Audio.playSound("data-audio-focus", "controller-radial");
    } else {
      console.warn("Radial Menu - 'index' attribute was not found on item.");
    }
  }
  onItemBlur({ target }) {
    const targetIndex = target.getAttribute("index");
    if (targetIndex !== null) {
      const index = Number.parseInt(targetIndex);
      this.selectedMenuItemDescriptions?.[index]?.classList.add("hidden");
    } else {
      console.warn("Radial Menu - 'index' attribute was not found on item.");
    }
  }
  populateLeaderMenu = () => {
    clearRadialMenuItems(LeadersMenuSymbol);
    DiploRibbonData.playerData.forEach(
      ({ civName, leaderType, civSymbol, canClick, primaryColor, secondaryColor, id, yields }, index) => {
        registerRadialMenuItem(LeadersMenuSymbol, {
          title: Players.get(id)?.name ?? "",
          subtitle: civName,
          icon1: `${leaderType}`,
          icon2: civSymbol,
          fgColor: secondaryColor,
          bgColor: primaryColor,
          navigation: {
            type: NavigationType.DIPLOMACY,
            value: () => id.toString()
          },
          isHidden: !canClick,
          sortOrder: (index + 1) * 10,
          description: () => {
            return `
						<div class="flow-row">
							<div class="radial-menu__name-filigree-left"></div>
							<div class="radial-menu__name-filigree-right"></div>
						</div>
						<div class="flow-row-wrap items-center justify-center my-1">
							${yields.map(
              ({ value, type = RibbonYieldType.Default }) => `
									<div class="flow-row justify-between w-18 -my-0\\.5 mx-1">
										<fxs-icon class="size-7" data-icon-id="${RIBBON_YIELD_TYPE_TO_ICON_ID[type]}"></fxs-icon>
										<div class="flex-auto flow-row justify-end items-center">
											<div class="font-fit-shrink whitespace-nowrap ${window.innerHeight > Layout.pixelsToScreenPixels(720) ? "font-body-base" : "font-body-sm"} ${RIBBON_YIELD_TYPE_TO_COLOR_CLASS[type]}" data-l10n-id="${value}"></div>
										</div>
									</div>
								`
            ).join("")}
						</div>
					`;
          }
        });
      }
    );
  };
  renderMenuStack = (menus) => {
    let tabItemsAttr = JSON.stringify(menus.map(({ title }, index) => ({ id: `${index}`, label: title })));
    tabItemsAttr = tabItemsAttr.replaceAll('"', "&quot;");
    return `
			<fxs-tab-bar
				class="mb-3 w-128"
				tab-for="panel-radial-menu"
				alt-controls="false"
				tab-items="${tabItemsAttr}"
			>
			</fxs-tab-bar>
			<fxs-slot-group>
				${menus.map(
      ({ items }, index) => `
					<fxs-slot
						class="relative flow-row justify-center items-center"
						index=${index}
						id=${index}
					>
						<div class="bg-cover bg-center radial-menu__donut"></div>
						<div class="absolute inset-0">
							${this.renderDivision(items)}
						</div>
						<div class="absolute inset-0">
							${this.renderItems(items, index)}
						</div>
						<div class="absolute bg-no-repeat bg-center inset-0 radial-menu__circle"></div>
						<div 
							class="absolute inset-0 hidden menu-items-arrow-container bottom-2\\.5"
							index=${index}
							style="
								transition-property: transform;
								transition-duration: 0.1s;
								transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
							">
							<div
								class="absolute inset-0 flow-row justify-center items-center"
								style="transform:translateX(-29%);"
							>
								<div class="radial-menu__directional"></div>	
							</div>
						</div>
					</fxs-slot>
				`
    ).join("")}
			</fxs-slot-group>
		`;
  };
  renderDivision = (items = []) => items.length > 1 ? items.map(
    ({ startDeg = 0 }) => `
		<div 
			class="absolute flow-row justify-center items-center inset-0 bottom-3 left-1 right-1 radial-menu__line-container" 
			style="
				transform:translateX(${![270, 90].includes(startDeg) ? `${100 * 0.4 * Math.cos(startDeg * Math.PI / 180)}%` : `0px`}) translateY(${![0, 180].includes(startDeg) ? `${-100 * 0.4 * Math.sin(startDeg * Math.PI / 180)}%` : `0px`}) rotate(${-(startDeg - 90)}deg);
			"
		>
			<div class="radial-menu__line"></div>	
		</div>
	`
  ).join("") : "";
  renderItems = (items = [], menuIndex) => `
		${items?.map(
    ({
      title,
      subtitle = "",
      icon1 = "",
      icon2 = "",
      fgColor = "",
      bgColor = "",
      isHidden,
      positionDeg = 0,
      description = () => ""
    }, index) => `
			<div
				class="radial-menu__item absolute inset-0 bottom-3 left-1 right-1 ${isHidden ? "hidden" : ""}"
				index=${index}
			>
				<div 
					class="absolute inset-0 flow-row justify-center items-center"
					style="transform:translateX(${![270, 90].includes(positionDeg) ? `${100 * 0.4 * Math.cos(positionDeg * Math.PI / 180)}%` : `0px`}) translateY(${![0, 180].includes(positionDeg) ? `${-100 * 0.4 * Math.sin(positionDeg * Math.PI / 180)}%` : `0px`});"
				>
					<fxs-activatable
						class="flow-row justify-center items-center radial-menu-item relative ${icon1.includes("LEADER") ? "w-16 h-16" : "w-14 h-14"} ${isHidden ? "hidden" : ""}"
						index=${index}
						menuIndex=${menuIndex}
						tabindex="-1"
					>
						<div 
							class="absolute inset-0 radial-menu__highlight transition-opacity"
							style="transform:translateX(${![270, 90].includes(positionDeg) ? `${-100 * 0.3 * Math.cos(positionDeg * Math.PI / 180)}%` : `0px`}) translateY(${![0, 180].includes(positionDeg) ? `${100 * 0.3 * Math.sin(positionDeg * Math.PI / 180)}%` : `0px`});"
						></div>
						${icon1.includes("LEADER") ? `
							<leader-icon class="${window.innerHeight > Layout.pixelsToScreenPixels(720) ? "w-16 h-16 bottom-5" : "w-12 h-12 bottom-4"}" leader="${icon1}" bg-color="${bgColor}" fg-color="${fgColor}" civ-icon-url="${icon2}"></leader-icon>
						` : `
							<fxs-icon class="relative" data-icon-id="${icon1}"></fxs-icon>
						`}
					</fxs-activatable>
				</div>

				<div class="radial-menu__item-description hidden absolute inset-0 flow-column items-center justify-center z-1" menuIndex=${menuIndex} index=${index}>
					<div class="radial-menu__item-description__container flow-column items-center justify-center">
						<div class="font-fit-shrink whitespace-nowrap ${window.innerHeight > Layout.pixelsToScreenPixels(720) ? "font-title-xl" : "font-title-lg"}" data-l10n-id="${title}" style="coh-font-fit-min-size:6px;"></div>
						${subtitle ? `<div class="font-body text-accent-4 font-fit-shrink whitespace-nowrap ${window.innerHeight > Layout.pixelsToScreenPixels(720) ? "font-title-base" : "font-title-sm"}" data-l10n-id="${subtitle}"></div>` : ""}
						${description()}
					</div>
				</div>

			</div>
		`
  ).join("")}
	`;
}
Controls.define("panel-radial-menu", {
  createInstance: PanelRadialMenu,
  description: "Radial menu allowing the player to quickly select multiple options.",
  classNames: ["panel-radial-menu", "fullscreen", "flow-column", "justify-center", "items-center"],
  styles: [styles],
  images: [
    "blp:radial_donut",
    "blp:radial_donut_sm",
    "blp:radial_middle_circle",
    "blp:radial_middle_circle_sm",
    "blp:radial_line",
    "blp:radial_line_sm",
    "blp:radial_directional",
    "blp:radial_directional_sm",
    "blp:radial_highlight",
    "blp:radial_highlight_sm",
    "blp:radial_tabbar-bg"
  ],
  tabIndex: -1
});

export { LeadersMenuSymbol };
//# sourceMappingURL=panel-radial-menu.js.map
