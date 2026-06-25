import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import { Catalog } from '../../../core/ui/utilities/utility-serialize.js';
import { Priority } from './advice-defines.js';
import { PopupPriority } from '../popup-sequencer/popup-priority.js';
import PopupSequencer from '../popup-sequencer/popup-sequencer.js';
import { TutorialLevel, TutorialAdvisorType } from '../tutorial/tutorial-item.js';

const DEBUG_LOG_REQUESTS = false;
const DEBUG_LOG_PAGE_DETAILS = false;
const VERSION = 4;
const ADVICE_INSTANCES = "_AdviceInstances";
const TURN_TO_DISPLAY_ADVISOR_POPUP = 4;
const adviceCatalogName = "AdviceTrackerCatalog";
class AdviceManagerClass {
  catalog;
  advisorMinds;
  /**
   * Open a catalog to load/save values to the save-game, to track pages selected for the advisors.
   *
   * Hotseat support: this will work as-is if the UI is reloaded between players.
   * If we persist the UI tree (and hence this manager) then either this CTOR functionality
   * needs to be moved out into an init() or the catalog needs to be switched based on player changes.
   */
  constructor() {
    this.advisorMinds = /* @__PURE__ */ new Map();
    this.advisorMinds.set(AdvisorTypes.CULTURE, this.createMind("culture"));
    this.advisorMinds.set(AdvisorTypes.MILITARY, this.createMind("military"));
    this.advisorMinds.set(AdvisorTypes.ECONOMIC, this.createMind("economic"));
    this.advisorMinds.set(AdvisorTypes.SCIENCE, this.createMind("science"));
    const localPlayerId = GameContext.localObserverID;
    this.catalog = new Catalog({ name: adviceCatalogName, version: VERSION, player: Players.get(localPlayerId) });
    if (!this.catalog.justCreated) {
      this.readFromDisk(this.advisorMinds.get(AdvisorTypes.CULTURE), AdvisorTypes.CULTURE);
      this.readFromDisk(this.advisorMinds.get(AdvisorTypes.MILITARY), AdvisorTypes.MILITARY);
      this.readFromDisk(this.advisorMinds.get(AdvisorTypes.ECONOMIC), AdvisorTypes.ECONOMIC);
      this.readFromDisk(this.advisorMinds.get(AdvisorTypes.SCIENCE), AdvisorTypes.SCIENCE);
    }
    engine.on("PlayerTurnActivated", this.onPlayerTurnActivated, this);
  }
  /**
   * Helper to create empty arrays for what is in an advisor's "mind"."
   */
  createMind(name) {
    return {
      diskName: name,
      followed: false,
      pages: [],
      turns: [],
      bundles: []
    };
  }
  /**
   * Realize a deferred request to consider adding pages.
   * Likely only called one per age when initially loading advice bundles.
   */
  updateGate = new UpdateGate(() => {
    this.considerNextPages();
  });
  /**
   * Event player turn has started
   * @param data Information about the player activating on this turn.
   */
  onPlayerTurnActivated(data) {
    const localPlayerID = GameContext.localObserverID;
    if (data.player != localPlayerID) {
      return;
    }
    const tutorialOn = Configuration.getUser().tutorialLevel === TutorialLevel.TutorialOn;
    const gameDifficultyName = Configuration.getGame().difficultyName;
    const isViceroyOrLower = [
      "LOC_DIFFICULTY_SETTLER_NAME",
      "LOC_DIFFICULTY_PRINCE_NAME",
      "LOC_DIFFICULTY_KING_NAME"
    ].includes(gameDifficultyName);
    if ((tutorialOn || isViceroyOrLower) && Game.turn === TURN_TO_DISPLAY_ADVISOR_POPUP && !this.isAnyFollowed() && !Autoplay.isActive) {
      const popupData = {
        category: PopupSequencer.getCategory(),
        screenId: "advisor-council-popup",
        popupId: "advisor-council-popup",
        properties: { singleton: true, createMouseGuard: true },
        priority: PopupPriority.beforeCinematics
      };
      PopupSequencer.addDisplayRequest(popupData);
    }
    this.considerNextPages();
  }
  /**
   * DEBUG - list contents of a bundle
   */
  debugInspectBundle(bundle) {
    console.log(`AdviceMgr: ---- bundle ${bundle.id} -----------------------------------------------`);
    console.log("    state: " + bundle.state);
    console.log(" priority: " + bundle.priority);
    console.log("...OnTurn: " + bundle.addedOnTurn);
    console.log("    index: " + bundle.index);
    console.log("    order: " + bundle.order.join("|"));
    console.log("    pages: " + bundle.pages.join("|"));
  }
  /**
   * DEBUG - list out what's in a mind, will attempt to determine advisorType from associated bundles if one isn't passed in.
   */
  debugInspectMind(mind, advisorType) {
    console.log("");
    console.log(`AdviceMgr: == Mind '${mind.diskName}' ===========================================`);
    console.log(`   follow: ${mind.followed}`);
    console.log(`    pages: ${this.serializePageIds(mind.pages)}`);
    console.log(`    turns: ${mind.turns.join("|")}`);
    if (!advisorType) {
      if (!mind.bundles[0]) {
        console.log("  Advisor type not passed in and no bundles to determine type.");
        return;
      }
      advisorType = mind.bundles[0].type;
    }
    mind.bundles.forEach((bundle) => {
      this.debugInspectBundle(bundle);
    });
    const pages = this.getAdvicePages(advisorType);
    pages.forEach((page, i) => {
      console.log(`AdviceMgr: ---- page ${i} -----------------------------------------------`);
      console.log("       id: " + page.id);
      console.log("    title: " + page.title);
      if (DEBUG_LOG_PAGE_DETAILS) {
        console.log("    quote: " + page.quote);
        console.log("  message: " + page.message);
        console.log("noteTitle: " + page.noteTitle);
        console.log(" noteDesc: " + page.noteDescription);
      }
    });
  }
  /**
   * DEBUG - Inspect the contents of the system
   */
  debugInspect() {
    const mindTypes = [AdvisorTypes.CULTURE, AdvisorTypes.ECONOMIC, AdvisorTypes.MILITARY, AdvisorTypes.SCIENCE];
    mindTypes.forEach((advisorType) => {
      const mind = this.advisorMinds.get(advisorType);
      if (mind) {
        this.debugInspectMind(mind, advisorType);
      }
    });
  }
  /**
   * Helper to return if a bundle of advice pages is done being activated and can be retired.
   * @param bundle A bundle of advisor advice.
   * @returns true if bundle has no new pages to add.
   */
  bundleIsDone(bundle) {
    return bundle.index >= bundle.order.length;
  }
  /**
   * Add a page to a mind.
   * @param mind Adivsor mind to add page into.
   * @param pageId Identifier of the page
   * @returns true if successfully added, false otherwise (such as duplicate)
   */
  addPage(mind, pageId) {
    if (mind.pages.length != mind.turns.length) {
      console.error(
        `AdviceMgr: Uneven lengths in '${mind.diskName}', pages=${mind.pages.length}, turns=${mind.turns.length}.`
      );
      console.log(`AdviceMgr:     pages: ${this.serializePageIds(mind.pages)}`);
      console.log(`AdviceMgr:     turns: ${mind.turns.join("|")}`);
    }
    mind.pages.push(pageId);
    mind.turns.push(Game.turn);
    return true;
  }
  /**
   * Determines the index # of a page.
   * @param mind Advisor mind who has the book to look through.
   * @param pageId The ID of the page to be looked up.
   * @returns -1 if not found, otherwise the index of the page.
   */
  existingPageIndex(mind, pageId) {
    for (let i = 0; i < mind.pages.length; i++) {
      const existingPageId = mind.pages[i];
      if (existingPageId.page == pageId.page) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Convert the advisor type to the row # for a notification (watch-out) warning.
   * @returns hash of the appropriate type of -1 if unknown advisor.
   */
  advisorTypeToWarningHash(advisorType) {
    switch (advisorType) {
      case AdvisorTypes.CULTURE:
        return Database.makeHash("ADVISOR_WARNING_NEW_CULTURE_INFORMATION_AVAILABLE");
      case AdvisorTypes.SCIENCE:
        return Database.makeHash("ADVISOR_WARNING_NEW_SCIENCE_INFORMATION_AVAILABLE");
      case AdvisorTypes.ECONOMIC:
        return Database.makeHash("ADVISOR_WARNING_NEW_ECONOMIC_INFORMATION_AVAILABLE");
      case AdvisorTypes.MILITARY:
        return Database.makeHash("ADVISOR_WARNING_NEW_MILITARY_INFORMATION_AVAILABLE");
    }
    console.error(`AdviceMgr: unable to generate hash for unknown advisro type '${advisorType}'.`);
    return -1;
  }
  /**
   * Check if a bundle has become obsolete.
   * @param bundle The bundle to check
   * @returns true if just made obsolete, false otherwise.
   */
  obsoleteCheck(bundle) {
    if (bundle.onObsolete) {
      const isObsolete = bundle.onObsolete();
      if (isObsolete) {
        bundle.state = "obsolete";
        return true;
      }
    }
    return false;
  }
  /**
   * Signal to game engine to generate a warning notification based on information
   * from the added page of advise.
   * @param mind Which Advisor "mind" this advice page is from.
   * @param pageId The page of Advice.
   */
  generateWarning(mind, pageId) {
    const player = Players.get(GameContext.localObserverID);
    const playerAdvisory = player?.Advisory;
    const warning = this.advisorTypeToWarningHash(mind.bundles[0].type);
    const advicePageId = Database.makeHash(pageId.page);
    playerAdvisory?.triggerAdvisorWarning(warning, advicePageId);
  }
  /**
   * Go through each advisor and auto-select the next page if it's time.
   */
  considerNextPages() {
    const turn = Game.turn;
    this.advisorMinds.forEach((mind) => {
      let pageId = null;
      const sortedBundles = [...mind.bundles].sort((a, b) => {
        if (b.priority && a.priority) {
          return b.priority - a.priority;
        }
        return 0;
      });
      for (const bundle of sortedBundles) {
        if (bundle.state != "active") {
          continue;
        }
        if (this.obsoleteCheck(bundle)) {
          this.writeBundleData(bundle);
          continue;
        }
        if (bundle.addedOnTurn != turn) {
          const selected = bundle.onSelect();
          if (selected) {
            bundle.addedOnTurn = turn;
            pageId = this.getNextPageId(bundle);
            if (pageId != null) {
              if (this.bundleIsDone(bundle)) {
                bundle.state = "complete";
              } else {
                this.obsoleteCheck(bundle);
              }
              this.writeBundleData(bundle);
              break;
            }
          }
        }
      }
      if (pageId != null) {
        this.addPage(mind, pageId);
        if (mind.followed) {
          this.generateWarning(mind, pageId);
        }
      }
      this.writeToDisk(mind);
    });
  }
  /**
   * De-serialize mind-specific save information.
   * Bundle based information will be overlayed as bundles are added back.
   * @param mind The advisor's "mind".
   */
  readFromDisk(mind, advisorType) {
    const obj = this.catalog.getObject(mind.diskName);
    if (!obj) {
      return;
    }
    mind.followed = obj.read("followed") ?? false;
    this.reportAdvisorStatusEvent(advisorType, mind.followed, false);
    if (mind.pages.length > 0) {
      console.warn(
        `AdvisorMgr: Mind '${mind.diskName}' is about to read pages from disk but already has ${mind.pages.length} existing!`
      );
    }
    const idsString = obj.read("pages");
    if (!idsString) {
      return;
    }
    mind.pages = this.unserializePageIds(idsString);
    const turnsString = obj.read("turns");
    if (turnsString != null) {
      mind.turns = turnsString.split("|").map(Number);
    } else {
      console.warn("AdviceMgr: Likley old save loaded, missing 'turns' entry.");
    }
    if (mind.pages.length != mind.turns.length) {
      console.warn(
        `AdviceMgr: Mismatch reading in pages served vs turns they were served. pages=${mind.pages.length}, turns=${mind.turns.length}`
      );
      console.log(`AdviceMgr:     pages: ${this.serializePageIds(mind.pages)}`);
      console.log(`AdviceMgr:     turns: ${mind.turns.join("|")}`);
      while (mind.turns.length < mind.pages.length) {
        mind.turns.push(-1);
      }
    }
  }
  /**
   * Convert an array of page IDs to a format that can be serialized as a property
   * @param pageIds Array of pageIDs.
   * @returns Single string to write to disk.
   */
  serializePageIds(pageIds) {
    return pageIds.map((pageId) => `${pageId.id}+${pageId.page}`).join("|");
  }
  /**
   * Take a string which is actually a serialize version of page Ids.
   * Purposely does not use map() inorder to prevent another scope.
   * @param idString String containing a serialize array of PageIDs read from disk.
   * @returns Array of pageIDs
   */
  unserializePageIds(idString) {
    const result = [];
    const ids = idString.split("|");
    const len = ids.length;
    for (let i = 0; i < len; i++) {
      const idString2 = ids[i];
      const plusIndex = idString2.indexOf("+");
      const id = idString2.slice(0, plusIndex);
      const page = idString2.slice(plusIndex + 1);
      result.push({ id, page });
    }
    return result;
  }
  /**
   * Serialize the entire mind to save file.
   * @param mind The advisor mind to output.
   */
  writeToDisk(mind) {
    const obj = this.catalog.getObject(mind.diskName);
    obj.write("followed", mind.followed == true);
    const pages = this.serializePageIds(mind.pages);
    obj.write("pages", pages);
    const turns = mind.turns.join("|");
    obj.write("turns", turns);
  }
  /**
   * Read in bundle data from disk (if it exists) and overwrite existing fields with i.
   * @param bundle The bundle to modify.
   */
  readBundleData(bundle) {
    const mind = this.advisorMinds.get(bundle.type);
    if (!mind) {
      console.error(`AdvisorMgr: Unable to read in overlay data, unknown mind type '${bundle.type}'`);
      return;
    }
    const obj = this.catalog.getObject(mind.diskName);
    const bundleIdString = obj.read("bundles");
    if (bundleIdString == null) {
      return;
    }
    const bundleIds = bundleIdString.split("|");
    if (!bundleIds.includes(bundle.id)) {
      return;
    }
    bundle.state = obj.read("bundle_" + bundle.id + "_state");
    bundle.index = obj.read("bundle_" + bundle.id + "_index");
    bundle.addedOnTurn = obj.read("bundle_" + bundle.id + "_addedOnNumber");
    bundle.order = obj.read("bundle_" + bundle.id + "_order").split(",").map(Number);
  }
  /**
   * Write out a bundle's data to disk.
   * @param bundle The bundle to write.
   */
  writeBundleData(bundle) {
    const mind = this.advisorMinds.get(bundle.type);
    if (!mind) {
      console.error(`AdvisorMgr: Unable to write overlay data, unknown mind type in bundle '${bundle.type}'`);
      return;
    }
    let bundleIds = [];
    const obj = this.catalog.getObject(mind.diskName);
    const bundleIdString = obj.read("bundles");
    if (bundleIdString != null) {
      bundleIds = bundleIdString.split("|");
    }
    if (!bundleIds.includes(bundle.id)) {
      bundleIds.push(bundle.id);
    }
    obj.write("bundles", bundleIds.join("|"));
    obj.write("bundle_" + bundle.id + "_state", bundle.state);
    obj.write("bundle_" + bundle.id + "_index", bundle.index);
    obj.write("bundle_" + bundle.id + "_addedOnNumber", bundle.addedOnTurn);
    obj.write("bundle_" + bundle.id + "_order", bundle.order.join(","));
  }
  /**
   * Take bundle defintion and turn it into a full blow bundle data to track.
   * @param bundle A bundle of advice to potentially add to the "advice book"
   */
  addBundle(bundle) {
    if (bundle.delivery == void 0) {
      bundle.delivery = "random";
    }
    const length = bundle.pages.length;
    if (length < 1) {
      console.error(
        `AdviceMgr: Cannot add advice bundle, need at least one page. id=${bundle.id} for type=${bundle.type}`
      );
      return;
    }
    const order = [];
    for (let i = 0; i < length; i++) {
      order[i] = i;
    }
    if (bundle.delivery == "random") {
      for (let i = 0; i < length; i++) {
        const temp = order[i];
        const swap = Math.floor(Math.random() * length);
        order[i] = order[swap];
        order[swap] = temp;
      }
    }
    const mind = this.advisorMinds.get(bundle.type);
    if (mind == void 0) {
      console.error(`AdviceMgr: Could not add bundle due to unknown advisor type ${bundle.type}`);
      return;
    }
    if (bundle.priority == void 0) {
      bundle.priority = Priority.low;
    }
    const bundleData = {
      ...bundle,
      state: "active",
      order,
      index: 0,
      addedOnTurn: -1
    };
    this.readBundleData(bundleData);
    mind.bundles.push(bundleData);
    this.updateGate.call("addBundle-" + bundle.id);
  }
  /**
   * Wrap an "item" into a one item bundle for delivery.
   * @param item
   */
  addItem(item) {
    this.addBundle({
      id: "bundlized_" + item.id,
      type: item.type,
      pages: [item.id],
      delivery: "sequential",
      onSelect: item.onSelect,
      onObsolete: item.onObsolete
    });
  }
  /**
   * Convert game engine string type to strong type for advisors.
   * @param adviceTypeString A string from the game engine (XML)
   * @returns Enum for the corresponding advisor or NO_ADVISOR if mismatch.
   */
  getAdvisorTypeFromString(adviceTypeString) {
    switch (adviceTypeString.toLocaleUpperCase()) {
      case "ADVISOR_CULTURE":
        return AdvisorTypes.CULTURE;
      case "ADVISOR_ECONOMIC":
        return AdvisorTypes.ECONOMIC;
      case "ADVISOR_MILITARY":
        return AdvisorTypes.MILITARY;
      case "ADVISOR_SCIENCE":
        return AdvisorTypes.SCIENCE;
    }
    return AdvisorTypes.NO_ADVISOR;
  }
  /**
   * Convert TutorialAdvisorTypes to AdvisorType.
   * @param tutorialAdvisorType An Advisor enum used by the tutorial
   * @returns Enum for the corresponding advisor or NO_ADVISOR if mismatch.
   */
  getAdvisorTypeFromTutorialAdvisorType(tutorialAdvisorType) {
    switch (tutorialAdvisorType) {
      case TutorialAdvisorType.Culture:
        return AdvisorTypes.CULTURE;
      case TutorialAdvisorType.Economic:
        return AdvisorTypes.ECONOMIC;
      case TutorialAdvisorType.Military:
        return AdvisorTypes.MILITARY;
      case TutorialAdvisorType.Science:
        return AdvisorTypes.SCIENCE;
    }
    return AdvisorTypes.NO_ADVISOR;
  }
  /**
   * Immediately add a page based on a (watch-out) notification if it contains advisor information to share.
   * @param notificationId The game engine notificationID.
   */
  addFromWatchOut(notificationId) {
    const notification = Game.Notifications.find(notificationId);
    if (!notification || !notification.AdviceType || notification.AdviceType == -1) {
      return;
    }
    const adviceInfo = GameInfo.AdviceInstances.lookup(notification.AdviceType);
    if (!adviceInfo) {
      console.error(
        `AdviceMgr: Add watch-out failed, Notification '${notificationId}', with advice type '${notification.AdviceType}' has no lookup in GameInfo.AdviceInstances`
      );
      return;
    }
    const advisorType = this.getAdvisorTypeFromString(adviceInfo.AdvisorType);
    if (advisorType == AdvisorTypes.NO_ADVISOR) {
      console.error(`AdviceMgr: Unknown advisor string '${adviceInfo.AdvisorType}' passed in to add watch-out.`);
      return;
    }
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      console.error(
        `AdviceMgr: Could not find advisor mind of type '${advisorType}' ('${notification.AdviceType}') for adding warn with notificationId '${notificationId}'.`
      );
      return;
    }
    const pageName = adviceInfo.AdviceID;
    if (this.existingPageIndex(mind, { id: ADVICE_INSTANCES, page: pageName }) == -1) {
      this.addPage(mind, { id: ADVICE_INSTANCES, page: pageName });
      this.writeToDisk(mind);
    }
  }
  /**
   * Take a page from a bundle and add it to the associated page.
   * @param bundle the bundle of advice to pull from.
   * @return pageID associated
   */
  getNextPageId(bundle) {
    if (bundle.index >= bundle.order.length) {
      console.error(
        `AdviceMgr: Attempt to get next page of advice from ${bundle.id} but already gave out all ${bundle.order.length} pages.`
      );
      return { id: bundle.id, page: "error" };
    }
    const page = bundle.pages[bundle.order[bundle.index]];
    if (page) {
      bundle.index++;
    } else {
      console.error(
        `AdviceMgr: Failed getting page for bundle '${bundle.id}' index '${bundle.index}' which resolves to index from order as '${bundle.order[bundle.index]}'. `
      );
    }
    return {
      id: bundle.id,
      page
    };
  }
  /**
   * Helper to generate an empty "page", usually being returned as part of an error.
   * @returns An empty page.
   */
  emptyPage() {
    return { id: "", quote: "", title: "", message: "", noteTitle: "", noteDescription: "" };
  }
  /**
   * Build the bundle of LOC strings which constitute a page of advice from the advisor.
   * @param pageId The ID to build the advice off of.
   * @returns Structure populated with LOC strings, structure of empty strings if it fails.
   */
  createAdvice(pageId) {
    const advice = GameInfo.AdviceInstances.lookup(pageId.page);
    if (!advice) {
      console.error(`AdviceMgr: Could not find XML entries for advice with ID '${pageId.page}'`);
      return this.emptyPage();
    }
    if (!advice.Quote || !advice.Title || !advice?.Message || !advice?.NoteTitle || !advice?.NoteDescription) {
      console.error(
        `AdviceMgr: Missing XML for for advice with id '${advice.AdviceID}' (${advice.$hash}). Missing: ${!advice.Quote ? "quote" : ""} ${!advice.Title ? "title" : ""} ${!advice.Message ? "message" : ""} ${!advice.NoteTitle ? "NoteTitle" : ""} ${!advice.NoteDescription ? "NoteDescription" : ""}`
      );
      return this.emptyPage();
    }
    const advicePage = {
      id: pageId.page,
      quote: Locale.compose(advice.Quote),
      title: Locale.compose(advice.Title),
      message: Locale.compose(advice.Message),
      noteTitle: Locale.compose(advice.NoteTitle),
      noteDescription: Locale.compose(advice.NoteDescription)
    };
    return advicePage;
  }
  /**
   * On which turn was the advice last served for an advisor?
   * Public so scripts can check.
   * @param advisorType The advisor's mind to look at. If none is provided,
   * 					  will look across all minds and provide the most
   * 					  recent turn number
   * @returns -1 for none, otherwise the turn for the mind (or all minds) in which an item was last served
   */
  lastTurnAdviceGiven(advisorType = AdvisorTypes.NO_ADVISOR) {
    if (advisorType == AdvisorTypes.NO_ADVISOR) {
      const turns = [
        this.lastTurnAdviceGiven(AdvisorTypes.CULTURE),
        this.lastTurnAdviceGiven(AdvisorTypes.ECONOMIC),
        this.lastTurnAdviceGiven(AdvisorTypes.MILITARY),
        this.lastTurnAdviceGiven(AdvisorTypes.SCIENCE)
      ];
      return Math.max(...turns);
    }
    const mind = this.advisorMinds.get(advisorType);
    const turn = mind?.turns[mind?.turns.length - 1];
    return turn ?? -1;
  }
  /**
   * Returns the pages of information for a given advisor.
   * @param advisorType The advisor to get pages for.
   * @returns Array of structures represnting "pages" in a book of advice from one advisor.
   */
  getAdvicePages(advisorType) {
    const advicePages = [];
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      console.error(`AdvisorMgr: Unable to get advice pages for unknown advisor type '${advicePages}'`);
      return [];
    }
    const pages = mind.pages;
    pages.forEach((page) => {
      const advice = this.createAdvice(page);
      if (advice.message != "") {
        advicePages.push(advice);
      }
    });
    return advicePages;
  }
  /**
   * @returns The ordered list of page advice for the culture advisor.
   */
  getCulturePages() {
    if (DEBUG_LOG_REQUESTS) {
      this.debugInspect();
    }
    return this.getAdvicePages(AdvisorTypes.CULTURE);
  }
  /**
   * @returns The ordered list of page advice for the military advisor.
   */
  getMilitaryPages() {
    return this.getAdvicePages(AdvisorTypes.MILITARY);
  }
  /**
   * @returns The ordered list of page advice for the economic advisor.
   */
  getEconomicPages() {
    return this.getAdvicePages(AdvisorTypes.ECONOMIC);
  }
  /**
   * @returns The ordered list of page advice for the scientific advisor.
   */
  getScientificPages() {
    return this.getAdvicePages(AdvisorTypes.SCIENCE);
  }
  /**
   * Helper to get if a particular advisor 'mind" is followed
   * @param advisorType Which advisor to look at
   * @returns true if followed false if not (or advisor not found).
   */
  isFollowed(advisorType) {
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      console.error(`AdvisorMgr: cannot get is followed status for type '${advisorType}'.`);
      return false;
    }
    return mind.followed;
  }
  isCultureFollowed() {
    return this.isFollowed(AdvisorTypes.CULTURE);
  }
  isMilitaryFollowed() {
    return this.isFollowed(AdvisorTypes.MILITARY);
  }
  isEconomicFollowed() {
    return this.isFollowed(AdvisorTypes.ECONOMIC);
  }
  isScientificFollowed() {
    return this.isFollowed(AdvisorTypes.SCIENCE);
  }
  isAnyFollowed() {
    return [...this.advisorMinds.values()].some((mind) => mind.followed);
  }
  /**
   * Internal helper to set if a particular advisor 'mind" is followed.
   * @param advisorType Which advisor to look at
   * @param isFollowed Whether or not the advisor is followed.
   */
  setFollowedInternal(advisorType, isFollowed) {
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      console.error(`AdvisorMgr: cannot set the follow status for the advisor type '${advisorType}'.`);
      return;
    }
    mind.followed = isFollowed;
    this.writeToDisk(mind);
    this.reportAdvisorStatusEvent(advisorType, isFollowed, true);
  }
  /**
   * Internal helper to report an advisor changed
   * @param advisorType Which advisor to report
   * @param isFollowed Whether or not the advisor is followed.
   */
  reportAdvisorStatusEvent(advisorType, isFollowed, isNewChoice) {
    const player = Players.get(GameContext.localObserverID);
    const playerAdvisory = player?.Advisory;
    playerAdvisory?.reportAdvisorSelected(GameContext.localObserverID, advisorType, isFollowed, isNewChoice);
  }
  setCultureFollowed(isFollowed) {
    this.setFollowedInternal(AdvisorTypes.CULTURE, isFollowed);
  }
  setMilitaryFollowed(isFollowed) {
    this.setFollowedInternal(AdvisorTypes.MILITARY, isFollowed);
  }
  setEconomicFollowed(isFollowed) {
    this.setFollowedInternal(AdvisorTypes.ECONOMIC, isFollowed);
  }
  setScientificFollowed(isFollowed) {
    this.setFollowedInternal(AdvisorTypes.SCIENCE, isFollowed);
  }
  /**
   * Function helper for Tuner Panel functions.
   * @param advisorType
   * @returns List of bundle IDs and their state, separated by semi-colon.
   */
  getTunerBundles(advisorType) {
    const results = [];
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      return [];
    }
    mind.bundles.forEach((bundle) => {
      results.push(bundle.id + ";" + bundle.state);
    });
    return results;
  }
  /**
   * Tuner Panel request to get bundles in a form for the controls.
   * List control takes one string per row, with semicolon between columns.
   */
  tunerGetBundles() {
    const results = [];
    results.push(this.getTunerBundles(AdvisorTypes.CULTURE));
    results.push(this.getTunerBundles(AdvisorTypes.MILITARY));
    results.push(this.getTunerBundles(AdvisorTypes.ECONOMIC));
    results.push(this.getTunerBundles(AdvisorTypes.SCIENCE));
    return results;
  }
  /**
   * Tuner Panel request to get bundles in a form for the controls.
   * List control takes one string per row, with semicolon between columns.
   */
  tunerGetItemsInBundle(bundleId) {
    const results = [];
    this.advisorMinds.forEach((mind) => {
      mind.bundles.forEach((bundle) => {
        if (bundle.id == bundleId) {
          bundle.pages.forEach((page) => {
            const delivered = mind.pages.some((pageId) => {
              if (pageId.page == page) return true;
              return false;
            });
            const state = delivered ? "delivered" : "pending";
            results.push(page + ";" + state);
          });
        }
      });
    });
    return results;
  }
  /**
   * Tuner Panel request to force adding all items from a bundle.
   * @param id
   */
  tunerAddBundleForcibly(id) {
    this.advisorMinds.forEach((mind) => {
      mind.bundles.forEach((bundle) => {
        if (bundle.id == id) {
          bundle.pages.forEach((page) => {
            const pageId = {
              id: bundle.id,
              page
            };
            this.addPage(mind, pageId);
          });
          this.writeBundleData(bundle);
        }
      });
      this.writeToDisk(mind);
    });
  }
  /**
   * Tuner Panel request to force adding a single page.
   * This will automatically find the bundle and corresponding mind.
   * @param id The identifier of the page to add.
   */
  tunerAddPageForcibly(id) {
    this.advisorMinds.forEach((mind) => {
      mind.bundles.forEach((bundle) => {
        bundle.pages.forEach((page) => {
          if (id == page) {
            const pageId = {
              id: bundle.id,
              page
            };
            this.addPage(mind, pageId);
            if (mind.followed) {
              this.generateWarning(mind, pageId);
            }
          }
        });
        this.writeBundleData(bundle);
      });
      this.writeToDisk(mind);
    });
  }
  tunerClearMind(advisorType) {
    const mind = this.advisorMinds.get(advisorType);
    if (!mind) {
      return;
    }
    mind.pages = [];
    mind.turns = [];
    this.writeToDisk(mind);
    mind.bundles.forEach((bundle) => {
      bundle.state = "active";
      bundle.index = 0;
      this.writeBundleData(bundle);
    });
  }
  tunerClearCultureMind() {
    this.tunerClearMind(AdvisorTypes.CULTURE);
  }
  tunerClearEconomicMind() {
    this.tunerClearMind(AdvisorTypes.ECONOMIC);
  }
  tunerClearMilitaryMind() {
    this.tunerClearMind(AdvisorTypes.MILITARY);
  }
  tunerClearScienceMind() {
    this.tunerClearMind(AdvisorTypes.SCIENCE);
  }
}
const AdviceManager = new AdviceManagerClass();
globalThis.AdviceManager = AdviceManager;

export { AdviceManager as default };
//# sourceMappingURL=advice-manager.js.map
