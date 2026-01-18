import { F as FxsActivatable } from '../../../core/ui/components/fxs-activatable.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/shell/mp-staging/mp-friends.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';

const styles = "fs://game/base-standard/ui/pantheon-chooser/panel-religion-chooser.css";

const ROOT_INNER_HTML = `
<fxs-vslot>
	<div class="panel-religion-chooser__religion-header">
		<div class="panel-religion-chooser__religion-background-image"></div>
		<fxs-icon class="panel-religion-chooser__chosen-religion"></fxs-icon>
	</div>
	<div class="panel-religion-chooser__religion-title">Religion Title</div>
	<div class="panel-religion-chooser__religion-stats">
		<div class="panel-religion-chooser__religion-stats-background-image"></div>
		<div class="panel-religion-chooser__religion-stats-container">
			<div class="panel-religion-chooser__religion-stats-row">
				<div class="panel-religion-chooser__stat-container">
					<fxs-icon class="panel-religion-chooser__stat-icon city-icon"></fxs-icon>
					<div class="panel-religion-chooser__cities-value stat-value">#</div>
				</div>
				<div class="panel-religion-chooser__stat-container">
					<fxs-icon class="panel-religion-chooser__stat-icon town-icon"></fxs-icon>
					<div class="panel-religion-chooser__towns-value stat-value">#</div>
				</div>
			</div>
		</div>
	</div>
	<fxs-scrollable>
		<fxs-vslot class="panel-religion-chooser__beliefs-container">
			<div class="panel-religion-chooser__belief-container enhancer-container">
				<div class="panel-religion-chooser__belief-header-container">
					<div class="panel-religion-chooser__enhancer-header-text"></div>
					<div class="panel-religion-chooser__assigned-values">
						<div class="panel-religion-chooser__enhancer-header-assigned">0</div>
						<div class="panel-religion-chooser__enhancer-header-max">/ 1</div>
					</div>
				</div>
				<fxs-activatable class="panel-religion-chooser__enhancer-button belief-button">
					<div class="panel-religion-chooser__belief-background"></div>
					<div class="panel-religion-chooser__hcontainer">
						<div class+"panel-religion-chooser__belief-icon-container">
							<fxs-icon class="panel-religion-chooser__enhancer-icon belief-icon"></fxs-icon>
						</div>
						<div class="panel-religion-chooser__vcontainer">
							<div class="panel-religion-chooser__enhancer-name"></div>
							<div class="panel-religion-chooser__enhancer-description"></div>
						</div>
					</div>
				</fxs-activatable>
			</div>
			<div class="panel-religion-chooser__belief-container reliquary-container">
				<div class="panel-religion-chooser__belief-header-container">
					<div class="panel-religion-chooser__reliquary-header-text"></div>
					<div class="panel-religion-chooser__assigned-values">
						<div class="panel-religion-chooser__reliquary-header-assigned">0</div>
						<div class="panel-religion-chooser__reliquary-header-max">/ 1</div>
					</div>
				</div>
				<fxs-activatable class="panel-religion-chooser__reliquary-button belief-button">
					<div class="panel-religion-chooser__belief-background"></div>
					<div class="panel-religion-chooser__hcontainer">
						<div class="panel-religion-chooser__belief-icon-container">
							<fxs-icon class="panel-religion-chooser__reliquary-icon belief-icon"></fxs-icon>
						</div>
						<div class="panel-religion-chooser__vcontainer">
							<div class="panel-religion-chooser__reliquary-name"></div>
							<div class="panel-religion-chooser__reliquary-description"></div>
						</div>
					</div>
				</fxs-activatable>
			</div>
			<div>
				<div class="panel-religion-chooser__belief-container founder-container">
					<div class="panel-religion-chooser__belief-header-container">
						<div class="panel-religion-chooser__founder-header-text"></div>
						<div class="panel-religion-chooser__assigned-values">
							<div class="panel-religion-chooser__founder-header-assigned">0</div>
							<div class="panel-religion-chooser__founder-header-max">/ 3</div>
						</div>
					</div>
					<fxs-activatable class="panel-religion-chooser__founder-button-01 belief-button">
						<div class="panel-religion-chooser__belief-background"></div>
						<div class="panel-religion-chooser__hcontainer">
							<div class="panel-religion-chooser__belief-icon-container">
								<fxs-icon class="panel-religion-chooser__founder-icon-01 belief-icon"></fxs-icon>
							</div>
							<div class="panel-religion-chooser__vcontainer">
								<div class="panel-religion-chooser__founder-name-01"></div>
								<div class="panel-religion-chooser__founder-description-01"></div>
							</div>
						</div>
					</fxs-activatable>
					<fxs-activatable class="panel-religion-chooser__founder-button-02 belief-button">
						<div class="panel-religion-chooser__belief-background"></div>
						<div class="panel-religion-chooser__hcontainer">
							<div class="panel-religion-chooser__belief-icon-container">
								<fxs-icon class="panel-religion-chooser__founder-icon-02 belief-icon"></fxs-icon>
							</div>
							<div class="panel-religion-chooser__vcontainer">
								<div class="panel-religion-chooser__founder-name-02"></div>
								<div class="panel-religion-chooser__founder-description-02"></div>
							</div>
						</div>
					</fxs-activatable>
					<fxs-activatable class="panel-religion-chooser__founder-button-03 belief-button">
						<div class="panel-religion-chooser__belief-background"></div>
						<div class="panel-religion-chooser__hcontainer">
							<div class="panel-religion-chooser__belief-icon-container">
								<fxs-icon class="panel-religion-chooser__founder-icon-03 belief-icon"></fxs-icon>
							</div>
							<div class="panel-religion-chooser__vcontainer">
								<div class="panel-religion-chooser__founder-name-03"></div>
								<div class="panel-religion-chooser__founder-description-03"></div>
							</div>
						</div>
					</fxs-activatable>
				</div>
			</div>
		</fxs-vslot>
	</fxs-scrollable>
</fxs-vslot>
`;
class PanelReligionChooser extends Panel {
  // header
  religionHeader = null;
  chosenReligion = null;
  religionButtons = [];
  religionName = null;
  currentBeliefsContainer = null;
  // options are the belief choices per belief class
  beliefOptionVSlot = null;
  beliefOptionButtons = [];
  beliefOptionIndices = [];
  enhancerTitle = null;
  enhancerAmount = null;
  enhancerButton = null;
  enhancerIcon = null;
  enhancerName = null;
  enhancerDescription = null;
  enhancerIndex = -1;
  reliquaryTitle = null;
  reliquaryAmount = null;
  reliquaryButton = null;
  reliquaryIcon = null;
  reliquaryName = null;
  reliquaryDescription = null;
  reliquaryIndex = -1;
  founderTitle = null;
  founderAmount = null;
  founderButtons = [];
  founderIcons = [];
  founderNames = [];
  founderDescriptions = [];
  founderIndices = [];
  // stats
  citiesIcon = null;
  citiesValue = null;
  townsIcon = null;
  townsValue = null;
  players = [];
  currentPlayer = null;
  currentActiveBeliefClass = "";
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.inputContext = InputContext.Dual;
  }
  onAttach() {
    super.onAttach();
    const localPlayerID = GameContext.localObserverID;
    this.Root.innerHTML = ROOT_INNER_HTML;
    window.addEventListener(InputEngineEventName, this.engineInputListener);
    const closeButton = document.createElement("fxs-close-button");
    {
      closeButton.addEventListener("action-activate", () => {
        this.close();
      });
    }
    this.Root.appendChild(closeButton);
    this.religionHeader = this.Root.querySelector(".panel-religion-chooser__religion-header");
    this.chosenReligion = this.Root.querySelector(".panel-religion-chooser__chosen-religion");
    this.religionName = this.Root.querySelector(".panel-religion-chooser__religion-title");
    const religionButtonContainer = document.createElement("fxs-hslot");
    religionButtonContainer.classList.add("panel-religion-chooser__religion-buttons-container");
    this.citiesIcon = this.Root.querySelector(".city-icon");
    this.citiesValue = this.Root.querySelector(".panel-religion-chooser__cities-value");
    this.townsIcon = this.Root.querySelector(".town-icon");
    this.townsValue = this.Root.querySelector(".panel-religion-chooser__towns-value");
    if (this.citiesIcon != null) {
      this.citiesIcon.style.setProperty("--religion-icon", `url("fs://game/unitflag_missingicon.png")`);
    }
    if (this.townsIcon != null) {
      this.townsIcon.style.setProperty("--religion-icon", `url("fs://game/unitflag_missingicon.png")`);
    }
    this.enhancerTitle = this.Root.querySelector(".panel-religion-chooser__enhancer-header-text");
    this.enhancerAmount = this.Root.querySelector(
      ".panel-religion-chooser__enhancer-header-assigned"
    );
    this.enhancerButton = this.Root.querySelector(".panel-religion-chooser__enhancer-button");
    this.enhancerName = this.Root.querySelector(".panel-religion-chooser__enhancer-name");
    this.enhancerDescription = this.Root.querySelector(
      ".panel-religion-chooser__enhancer-description"
    );
    this.enhancerIcon = this.Root.querySelector(".panel-religion-chooser__enhancer-icon");
    this.reliquaryTitle = this.Root.querySelector(".panel-religion-chooser__reliquary-header-text");
    this.reliquaryAmount = this.Root.querySelector(
      ".panel-religion-chooser__reliquary-header-assigned"
    );
    this.reliquaryButton = this.Root.querySelector(".panel-religion-chooser__reliquary-button");
    this.reliquaryName = this.Root.querySelector(".panel-religion-chooser__reliquary-name");
    this.reliquaryDescription = this.Root.querySelector(
      ".panel-religion-chooser__reliquary-description"
    );
    this.founderTitle = this.Root.querySelector(".panel-religion-chooser__founder-header-text");
    this.founderAmount = this.Root.querySelector(
      ".panel-religion-chooser__founder-header-assigned"
    );
    for (let index = 1; index <= 3; index++) {
      const founderButton = this.Root.querySelector(
        `.panel-religion-chooser__founder-button-0${index}`
      );
      if (founderButton != null) {
        founderButton.setAttribute("tabindex", "-1");
        this.founderButtons.push(founderButton);
        founderButton?.addEventListener("action-activate", (event) => {
          this.onBeliefButtonActivated(event);
        });
        founderButton?.addEventListener("focus", (event) => {
          this.onButtonFocused(event);
        });
        founderButton?.addEventListener("blur", (event) => {
          this.onButtonFocused(event);
        });
      }
      const founderIcon = this.Root.querySelector(
        `.panel-religion-chooser__founder-icon-0${index}`
      );
      const founderName = this.Root.querySelector(
        `.panel-religion-chooser__founder-name-0${index}`
      );
      const founderDescription = this.Root.querySelector(
        `.panel-religion-chooser__founder-description-0${index}`
      );
      if (founderIcon) {
        this.founderIcons.push(founderIcon);
      }
      if (founderName) {
        this.founderNames.push(founderName);
      }
      if (founderDescription) {
        this.founderDescriptions.push(founderDescription);
      }
    }
    if (this.enhancerButton != null) {
      this.enhancerButton.addEventListener("action-activate", (event) => {
        this.onBeliefButtonActivated(event);
      });
      this.enhancerButton.addEventListener("focus", (event) => {
        this.onButtonFocused(event);
      });
      this.enhancerButton.addEventListener("blur", (event) => {
        this.onButtonFocused(event);
      });
      this.enhancerButton.setAttribute("tabindex", "-1");
    }
    if (this.reliquaryButton != null) {
      this.reliquaryButton?.addEventListener("action-activate", (event) => {
        this.onBeliefButtonActivated(event);
      });
      this.reliquaryButton?.addEventListener("focus", (event) => {
        this.onButtonFocused(event);
      });
      this.reliquaryButton?.addEventListener("blur", (event) => {
        this.onButtonFocused(event);
      });
      this.reliquaryButton.setAttribute("tabindex", "-1");
    }
    if (this.currentBeliefsContainer == null) {
      this.currentBeliefsContainer = document.createElement("div");
      this.currentBeliefsContainer.classList.add("panel-religion-chooser__belief-options-container");
    }
    const beliefOptionScrollbox = document.createElement("fxs-scrollable");
    this.currentBeliefsContainer.appendChild(beliefOptionScrollbox);
    if (this.beliefOptionVSlot == null) {
      this.beliefOptionVSlot = document.createElement("fxs-vslot");
      beliefOptionScrollbox.appendChild(this.beliefOptionVSlot);
    }
    GameInfo.BeliefClasses.forEach((beliefClass) => {
      if (beliefClass.BeliefClassType == "BELIEF_CLASS_ENHANCER") {
        if (this.enhancerTitle) {
          this.enhancerTitle.textContent = Locale.compose(`${beliefClass.Name}`);
        }
      } else if (beliefClass.BeliefClassType == "BELIEF_CLASS_RELIQUARY") {
        if (this.reliquaryTitle) {
          this.reliquaryTitle.textContent = Locale.compose(`${beliefClass.Name}`);
        }
      } else {
        if (this.founderTitle) {
          this.founderTitle.textContent = Locale.compose(`${beliefClass.Name}`);
        }
      }
    });
    Players.getEverAlive().forEach((player) => {
      if (player.Religion?.hasCreatedReligion()) {
        const religionData = GameInfo.Religions.lookup(player.Religion.getReligionType());
        this.createReligionButton(religionButtonContainer, religionData);
        this.players.push(player.id);
      }
    });
    window.dispatchEvent(new HideMiniMapEvent(true));
    this.religionHeader?.appendChild(religionButtonContainer);
    this.updateReligionData(Players.get(localPlayerID));
    this.determineInitialFocus();
  }
  onDetach() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    window.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  // use the player as an argument because Player.Religion.get() returns a pantheon
  createReligionButton(buttonContainer, religionData) {
    if (religionData == null) {
      return;
    }
    const newbutton = document.createElement("religion-button");
    newbutton.setAttribute("tabindex", "-1");
    const buttonBackground = document.createElement("div");
    buttonBackground.classList.add("panel-religion-chooser__religion-button-background");
    newbutton.appendChild(buttonBackground);
    const buttonIcon = document.createElement("fxs-icon");
    buttonIcon.classList.add("panel-religion-chooser__religion-button-icon");
    const buttonIconPath = `fs://game/unitflag_missingicon.png`;
    buttonIcon?.style.setProperty("--religion-icon", `url("${buttonIconPath}")`);
    newbutton.appendChild(buttonIcon);
    this.religionButtons.push(newbutton);
    buttonContainer.appendChild(newbutton);
    newbutton.addEventListener("action-activate", (event) => {
      this.onReligionButtonActivated(event);
    });
    newbutton.addEventListener("focus", (event) => {
      this.onButtonFocused(event);
    });
    newbutton.addEventListener("blur", (event) => {
      this.onButtonFocused(event);
    });
  }
  updateReligionData(player) {
    if (player == null) {
      return;
    }
    const currentReligion = Players.Religion?.get(player.id);
    if (currentReligion == null) {
      return;
    }
    const religionDef = GameInfo.Religions.lookup(currentReligion.getReligionType());
    if (religionDef == null) {
      return;
    }
    this.closeBeliefOptions();
    const chooseReligionText = currentReligion.getReligionName();
    if (this.religionName) {
      this.religionName.setAttribute("data-l10n-id", chooseReligionText);
    }
    if (this.chosenReligion) {
      const iconPath = `fs://game/${religionDef.IconString}`;
      this.chosenReligion.setAttribute("data-icon-id", `${iconPath}`);
    }
    {
      let citiesInReligion = 0;
      let townsInReligion = 0;
      Players.getAlive().forEach((_player) => {
        if (_player.Stats) {
          citiesInReligion += _player.Stats?.getNumMyCitiesFollowingSpecificReligion(
            currentReligion.getReligionType()
          );
        }
        _player.Cities?.getCities().forEach((_city) => {
          if (_city.isTown && _city.Religion?.majorityReligion == currentReligion?.getReligionType()) {
            townsInReligion++;
          }
        });
      });
      if (this.citiesValue) {
        this.citiesValue.textContent = citiesInReligion.toString();
      }
      if (this.townsValue) {
        this.townsValue.textContent = townsInReligion.toString();
      }
    }
    let currentFoundercount = 0;
    const beliefs = currentReligion.getBeliefs();
    if (beliefs) {
      beliefs.forEach((belief) => {
        const beliefDef = GameInfo.Beliefs.lookup(belief);
        if (beliefDef != null) {
          if (beliefDef.BeliefClassType == "BELIEF_CLASS_ENHANCER") {
            this.enhancerIndex = beliefDef.$index;
            if (this.enhancerAmount) {
              this.enhancerAmount.textContent = "1";
            }
            if (this.enhancerName) {
              this.enhancerName.textContent = Locale.compose(beliefDef.Name);
            }
            if (this.enhancerDescription) {
              this.enhancerDescription.textContent = Locale.compose(beliefDef.Description);
            }
            if (this.enhancerIcon) {
              const beliefIconPath = `fs://game/unitflag_missingicon.png`;
              this.enhancerIcon.style.setProperty("--belief-icon", `url(${beliefIconPath})`);
            }
          } else if (beliefDef.BeliefClassType == "BELIEF_CLASS_RELIQUARY") {
            this.reliquaryIndex = beliefDef.$index;
            if (this.reliquaryAmount) {
              this.reliquaryAmount.textContent = "1";
            }
            if (this.reliquaryName) {
              this.reliquaryName.textContent = Locale.compose(beliefDef.Name);
            }
            if (this.reliquaryDescription) {
              this.reliquaryDescription.textContent = Locale.compose(beliefDef.Description);
            }
            if (this.reliquaryIcon) {
              const beliefIconPath = `fs://game/unitflag_missingicon.png`;
              this.reliquaryIcon.style.setProperty("--belief-icon", `url(${beliefIconPath})`);
            }
          } else if (beliefDef.BeliefClassType == "BELIEF_CLASS_FOUNDER") {
            this.founderIndices.push(beliefDef.$index);
            if (this.founderNames[currentFoundercount]) {
              this.founderNames[currentFoundercount].textContent = Locale.compose(beliefDef.Name);
            }
            if (this.founderDescriptions[currentFoundercount]) {
              this.founderDescriptions[currentFoundercount].textContent = Locale.compose(
                beliefDef.Description
              );
            }
            if (this.founderIcons[currentFoundercount]) {
              const beliefIconPath = `fs://game/unitflag_missingicon.png`;
              this.founderIcons[currentFoundercount].style.setProperty(
                "--belief-icon",
                `url(${beliefIconPath})`
              );
            }
            currentFoundercount++;
          }
        }
      });
    }
    if (this.founderAmount) {
      this.founderAmount.textContent = currentFoundercount.toString();
    }
    for (let lockedFoundersIndex = currentFoundercount; lockedFoundersIndex < 3; lockedFoundersIndex++) {
      if (this.founderNames[lockedFoundersIndex]) {
        this.founderNames[lockedFoundersIndex].textContent = "Locked text title";
      }
      if (this.founderDescriptions[lockedFoundersIndex]) {
        this.founderDescriptions[lockedFoundersIndex].textContent = "Locked text description";
      }
    }
  }
  createBeliefOption(belief) {
    if (belief == null) {
      return;
    }
    const buttonContainer = document.createElement("div");
    const newbutton = document.createElement("belief-button");
    newbutton.setAttribute("tabindex", "-1");
    buttonContainer.classList.add("panel-religion-chooser__belief-button-background");
    if (belief.$index == this.enhancerIndex || belief.$index == this.reliquaryIndex || this.founderIndices.indexOf(belief.$index) >= 0) {
      buttonContainer.style.setProperty("--background-color", "red");
    }
    const buttonIcon = document.createElement("fxs-icon");
    buttonIcon.classList.add("panel-religion-chooser__religion-button-icon");
    const buttonPath = `fs://game/unitflag_missingicon.png`;
    buttonIcon?.style.setProperty("--belief-icon", `url("${buttonPath}")`);
    const textContainer = document.createElement("div");
    textContainer.classList.add("panel-religion-chooser__vcontainer");
    const buttonText = document.createElement("div");
    buttonText.textContent = Locale.compose(belief.Name);
    const buttonDescription = document.createElement("div");
    buttonDescription.textContent = Locale.compose(belief.Description);
    newbutton.appendChild(buttonIcon);
    textContainer.appendChild(buttonText);
    textContainer.appendChild(buttonDescription);
    newbutton.appendChild(textContainer);
    buttonContainer.appendChild(newbutton);
    this.beliefOptionButtons.push(newbutton);
    this.beliefOptionIndices.push(belief.$index);
    this.beliefOptionVSlot?.appendChild(buttonContainer);
    newbutton.addEventListener("action-activate", (event) => {
      this.onBeliefOptionActivated(event);
    });
    newbutton.addEventListener("focus", (event) => {
      this.onButtonFocused(event);
    });
    newbutton.addEventListener("blur", (event) => {
      this.onButtonFocused(event);
    });
  }
  onBeliefOptionActivated(event) {
    if (event.target instanceof HTMLElement) {
      const activateBeliefDef = GameInfo.Beliefs[this.beliefOptionIndices[this.beliefOptionButtons.indexOf(event.target)]];
      this.closeBeliefOptions();
      const args = {
        BeliefType: Database.makeHash(activateBeliefDef.BeliefType)
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.ADD_BELIEF,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.ADD_BELIEF, args);
      } else {
        console.error(
          `Religion-chooser:  player operation ADD_BELIEF of ${Locale.compose(activateBeliefDef.Name)} failed! Reason: ${result.FailureReasons ? result.FailureReasons[0] : "None"}`
        );
      }
      this.updateReligionData(this.currentPlayer);
    }
  }
  onBeliefButtonActivated(event) {
    if (event.target instanceof HTMLElement) {
      let beliefClass = "";
      if (event.target == this.enhancerButton) {
        beliefClass = "BELIEF_CLASS_ENHANCER";
      } else if (event.target == this.reliquaryButton) {
        beliefClass = "BELIEF_CLASS_RELIQUARY";
      } else {
        beliefClass = "BELIEF_CLASS_FOUNDER";
      }
      if (this.currentActiveBeliefClass != null && this.currentActiveBeliefClass != beliefClass) {
        this.clearBeliefOptions();
        this.currentActiveBeliefClass = beliefClass;
        GameInfo.Beliefs.forEach((belief) => {
          if (belief.BeliefClassType == this.currentActiveBeliefClass) {
            this.createBeliefOption(belief);
          }
        });
        if (this.currentBeliefsContainer) {
          this.Root.appendChild(this.currentBeliefsContainer);
          this.currentBeliefsContainer.style.visibility = "visible";
        }
      }
    }
  }
  onReligionButtonActivated(event) {
    if (event.target instanceof HTMLElement) {
      const playerID = this.players[this.religionButtons.indexOf(event.target)];
      this.updateReligionData(Players.get(playerID));
    }
  }
  onButtonFocused(event) {
    if (event.target instanceof HTMLElement) {
      event.target.classList.toggle("focused", event.type == "focus");
    }
  }
  clearBeliefOptions() {
    this.beliefOptionButtons.forEach((button) => {
      button.parentElement?.removeChild(button);
    });
    this.beliefOptionButtons = [];
    this.beliefOptionIndices = [];
  }
  closeBeliefOptions() {
    if (this.currentBeliefsContainer) {
      this.Root.appendChild(this.currentBeliefsContainer);
      this.currentBeliefsContainer.style.visibility = "hidden";
    }
    this.clearBeliefOptions();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  determineInitialFocus() {
    if (this.enhancerButton) {
      FocusManager.setFocus(this.enhancerButton);
    }
  }
}
Controls.define("panel-religion-chooser", {
  createInstance: PanelReligionChooser,
  description: "Select a religion.",
  classNames: ["panel-religion-chooser"],
  styles: [styles]
});
Controls.define("religion-button", {
  createInstance: FxsActivatable,
  description: "A religion in the world.",
  classNames: ["panel-religion-chooser__religion-button"],
  styles: [styles]
});
Controls.define("belief-button", {
  createInstance: FxsActivatable,
  description: "A belief that could belong to the religion",
  classNames: ["panel-religion-chooser-belief-button"],
  styles: [styles]
});
//# sourceMappingURL=panel-religion-chooser.js.map
