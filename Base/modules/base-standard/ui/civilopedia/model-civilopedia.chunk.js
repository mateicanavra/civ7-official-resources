import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

var DetailsType = /* @__PURE__ */ ((DetailsType2) => {
  DetailsType2[DetailsType2["Section"] = 0] = "Section";
  DetailsType2[DetailsType2["PageGroup"] = 1] = "PageGroup";
  DetailsType2[DetailsType2["Page"] = 2] = "Page";
  return DetailsType2;
})(DetailsType || {});
const CIVILOPEDIA_SEARCH_CONTEXT = "Civilopedia";
class Civilopedia {
  _NavigatePageEvent = new LiteEvent();
  _History;
  _HomePage;
  _CurrentPage;
  _CurrentHistoryIndex;
  _MaxHistoricEntries;
  _isOpen = false;
  sections;
  chapterOverrides;
  chapterBodyQueries;
  chaptersByLayout;
  pageGroupsBySection;
  pagesBySection;
  pagesByUUID;
  civilopediaHotkeyListener = this.onCivilopediaHotkey.bind(this);
  constructor() {
    this.sections = [];
    this.chapterOverrides = /* @__PURE__ */ new Map();
    this.chapterBodyQueries = /* @__PURE__ */ new Map();
    this.chaptersByLayout = /* @__PURE__ */ new Map();
    this.pageGroupsBySection = /* @__PURE__ */ new Map();
    this.pagesBySection = /* @__PURE__ */ new Map();
    this.pagesByUUID = /* @__PURE__ */ new Map();
    this.initialize();
    if (this.sections.length == 0) {
      throw new Error("No civilopedia sections exist!");
    }
    const firstSection = this.sections[0];
    const pages = this.pagesBySection.get(firstSection.sectionID);
    if (pages && pages.length > 0) {
      this._HomePage = {
        sectionID: firstSection.sectionID,
        pageID: pages[0].pageID
      };
    } else {
      throw new Error("No pages for section!");
    }
    this._CurrentPage = this._HomePage;
    this._History = [this._CurrentPage];
    this._CurrentHistoryIndex = 0;
    this._MaxHistoricEntries = 10;
    window.addEventListener("hotkey-open-civilopedia", this.civilopediaHotkeyListener);
  }
  set isOpen(value) {
    this._isOpen = value;
  }
  get isOpen() {
    return this._isOpen;
  }
  /**
   * The intro/home page of the pedia.
   */
  get homePage() {
    return this._HomePage;
  }
  /**
   * The current page the user is viewing.
   */
  get currentPage() {
    return this._CurrentPage;
  }
  /**
   * This value represents the index into the history array that the current page is at.
   * 0 = The most recent page.
   */
  get currentHistoryIndex() {
    return this._CurrentHistoryIndex;
  }
  /**
   * The list of pages visited by the user in chronological order.
   */
  get history() {
    return this._History;
  }
  get maxHistoricEntries() {
    return this._MaxHistoricEntries;
  }
  set maxHistoricEntries(value) {
    this._MaxHistoricEntries = value;
    if (this._MaxHistoricEntries > 0) {
      this.truncateHistory(this._MaxHistoricEntries);
    }
  }
  /**
   * Returns true if the user can navigate forward in the history.
   */
  canNavigateForward() {
    return this.currentHistoryIndex > 0;
  }
  /**
   * Returns false if the user can navigate backwards in the history.
   */
  canNavigateBackwards() {
    return this.currentHistoryIndex < this.history.length - 1;
  }
  /**
   * Purges all history.
   */
  clearHistory() {
    this._History = [this.currentPage];
    this._CurrentHistoryIndex = 0;
  }
  /**
   * Reduces the history to the `maxItems` recent items.
   * @param maxItems The maximum items to include in the history.
   */
  truncateHistory(maxItems) {
    this._History.splice(maxItems);
  }
  /**
   * Navigates to the front/home page of the pedia.
   */
  navigateHome() {
    this.navigateTo(this.homePage);
  }
  /**
   * Navigates back in the history.
   * Returns false if page no longer exists or there is no further pages in the history.
   */
  navigateBack(numPagesBack = 1) {
    if (this.canNavigateBackwards()) {
      this._CurrentHistoryIndex += numPagesBack;
      const page = this.history[this._CurrentHistoryIndex];
      if (this.doNavigate(page)) {
        this._NavigatePageEvent.trigger(page);
        return true;
      }
    }
    return false;
  }
  /**
   * Navigate forward in the history.
   * Returns false if page no longer exists or there is no further pages in the history.
   */
  navigateForward(numPagesForward = 1) {
    if (this.canNavigateForward()) {
      this._CurrentHistoryIndex -= numPagesForward;
      const page = this.history[this._CurrentHistoryIndex];
      if (this.doNavigate(page)) {
        this._NavigatePageEvent.trigger(page);
        return true;
      }
    }
    return false;
  }
  /**
   * Navigate to the desired page.
   */
  navigateTo(page) {
    if (this.doNavigate(page)) {
      this._History.splice(0, this._CurrentHistoryIndex, page);
      if (this._MaxHistoricEntries > -1) {
        this.truncateHistory(this._MaxHistoricEntries);
      }
      this._CurrentHistoryIndex = 0;
      this._NavigatePageEvent.trigger(page);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Navigate to the page we were on when we closed the civilopedia
   */
  navigateToLastPageInHistory() {
    if (this.history.length > 0) {
      const page = this.history[this._CurrentHistoryIndex];
      if (this.doNavigate(page)) {
        this._NavigatePageEvent.trigger(page);
        return true;
      }
    }
    return false;
  }
  /**
   * Perform a search with the given term.
   * @param term The term(s) to search for.
   * @returns The results from the search, which can then be fed into `navigateTo`.
   */
  search(term, maxResults) {
    if (maxResults == null) {
      maxResults = 5;
    }
    const results = [];
    for (const sectionPages of this.pagesBySection) {
      const sectionID = sectionPages[0];
      if (term == sectionID) {
        const frontPage = sectionPages[1][0];
        results.push({ page: { sectionID, pageID: frontPage.pageID } });
        if (results.length >= maxResults) {
          return results;
        }
      } else {
        for (const page of sectionPages[1]) {
          if (page.pageID == term) {
            results.push({ page: { sectionID, pageID: page.pageID } });
            if (results.length >= maxResults) {
              return results;
            }
          }
        }
      }
    }
    const searchResults = Search.search(CIVILOPEDIA_SEARCH_CONTEXT, term, maxResults);
    if (searchResults && searchResults.length > 0) {
      for (const result of searchResults) {
        const [sectionID, pageID] = result.type.split("|", 2);
        results.push({ page: { sectionID, pageID }, details: result });
        if (results.length >= maxResults) {
          return results;
        }
      }
    }
    return results;
  }
  get onNavigatePage() {
    return this._NavigatePageEvent.expose();
  }
  /**
   * Perform the actual navigation.
   * @param page The page to navigate to.
   * @returns True if navigated to a new page.
   */
  doNavigate(page) {
    if (this._CurrentPage.sectionID != page.sectionID || this._CurrentPage.pageID != page.pageID) {
      const pageDetails = this.getPage(page.sectionID, page.pageID);
      if (pageDetails) {
        this._CurrentPage = {
          sectionID: page.sectionID,
          pageID: page.pageID
        };
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  /**
   * Returns left-to-right list of sections w/ information.
   */
  getSections() {
    return this.sections;
  }
  /**
   * Returns top - to - bottom list of pages including groups
   * @param sectionID
   * @returns
   */
  getPages(sectionID) {
    return this.pagesBySection.get(sectionID) ?? null;
  }
  /**
   * Returns the first page structure with the specified section id and page id.
   * @param sectionID
   * @param pageID
   * @returns
   */
  getPage(sectionID, pageID) {
    const uuid = `${sectionID}::${pageID}`;
    return this.pagesByUUID.get(uuid) ?? null;
  }
  /**
   * Returns the page groups in top-to-bottom order.
   * @param sectionID
   * @returns
   */
  getPageGroups(sectionID) {
    return this.pageGroupsBySection.get(sectionID) ?? null;
  }
  /**
   * Returns the first page group structure with the specified section id and page group id.
   * @param sectionID
   * @param pageGroupID
   * @returns
   */
  getPageGroup(sectionID, pageGroupID) {
    const groups = this.pageGroupsBySection.get(sectionID);
    if (groups) {
      return groups.find((g) => {
        g.pageGroupID == pageGroupID;
      }) ?? null;
    }
    return null;
  }
  /**
   * Returns a list of ChapterIds pre - sorted.
   * @param pageLayoutID
   * @returns
   */
  getPageChapters(pageLayoutID) {
    return this.chaptersByLayout.get(pageLayoutID) ?? null;
  }
  /**
   * Returns a single text key representing the heading of the chapter.
   * @param sectionID
   * @param pageID
   * @param chapterID
   * @returns
   */
  getChapterHeader(sectionID, pageID, chapterID) {
    const uuid = `${sectionID}|${pageID}|${chapterID}`;
    const override = this.chapterOverrides.get(uuid);
    if (override && override.headerKey) {
      return override.headerKey;
    } else {
      const page = this.getPage(sectionID, pageID);
      if (page) {
        const chapters = this.getPageChapters(page.pageLayoutID);
        if (chapters) {
          for (const ch of chapters) {
            if (ch.chapterID == chapterID) {
              if (ch.headerKey) {
                return ch.headerKey;
              }
              break;
            }
          }
        }
      }
      return this.findChapterTextKey(sectionID, pageID, chapterID, "TITLE");
    }
  }
  /**
   * Returns a list of text keys representing separate paragraphs of a chapter.
   * @param sectionID
   * @param pageID
   * @param chapterID
   * @returns
   */
  getChapterBody(sectionID, pageID, chapterID, pageLayoutID) {
    const uuid = `${sectionID}|${pageID}|${chapterID}`;
    const override = this.chapterOverrides.get(uuid);
    if (override && override.body.length > 0) {
      return override.body.map((p) => p.textKey);
    } else {
      const chapterBodyQuery = this.chapterBodyQueries.get(`${pageLayoutID}|${chapterID}`);
      if (chapterBodyQuery) {
        const paragraphs = Database.query("gameplay", chapterBodyQuery.SQL, pageID, sectionID);
        if (paragraphs) {
          const keys = [];
          for (const p of paragraphs) {
            const value = p.Text;
            if (typeof value == "string" && Locale.keyExists(value)) {
              keys.push(value);
            }
          }
          if (keys.length > 0) {
            return keys;
          }
        }
      } else {
        const bodyKey = this.findChapterTextKey(sectionID, pageID, chapterID, "BODY");
        if (bodyKey) {
          return [bodyKey];
        } else {
          const keys = [];
          let i = 1;
          let key = this.findChapterTextKey(sectionID, pageID, chapterID, `PARA_${i}`);
          while (key) {
            keys.push(key);
            i++;
            key = this.findChapterTextKey(sectionID, pageID, chapterID, `PARA_${i}`);
          }
          if (keys.length > 0) {
            return keys;
          }
        }
      }
    }
    return null;
  }
  /**
   * Returns the first found text key that conforms to the section search patterns.
   * @param sectionID
   * @param tag
   */
  findSectionTextKey(sectionID, tag) {
    const keys = [`LOC_PEDIA_${sectionID}_${tag}`];
    return keys.find((k) => Locale.keyExists(k)) ?? null;
  }
  /**
   * Returns the first found text key that conforms to the page search patterns.
   * @param sectionID
   * @param pageID
   * @param tag
   */
  findPageTextKey(sectionID, pageID, tag) {
    const suffix = `_${tag}`;
    const keys = [
      `LOC_PEDIA_${sectionID}_PAGE_${pageID}${suffix}`,
      `LOC_PEDIA_PAGE_${pageID}${suffix}`,
      `LOC_PEDIA_PAGE_${tag}`
    ];
    const page = this.getPage(sectionID, pageID);
    if (page) {
      const prefix = page.textKeyPrefix;
      if (prefix) {
        keys.unshift(`${prefix}_${pageID}${suffix}`, `${prefix}${suffix}`);
      }
    }
    return keys.find((k) => Locale.keyExists(k)) ?? null;
  }
  /**
   * Returns the first found text key that conforms to the chapter search patterns
   * @param sectionID
   * @param pageID
   * @param chapterID
   * @param tag
   * @returns
   */
  findChapterTextKey(sectionID, pageID, chapterID, tag) {
    const suffix = `_CHAPTER_${chapterID}_${tag}`;
    const keys = [
      `LOC_PEDIA_${sectionID}_PAGE_${pageID}${suffix}`,
      `LOC_PEDIA_${sectionID}_PAGE${suffix}`,
      `LOC_PEDIA_PAGE_${pageID}${suffix}`,
      `LOC_PEDIA_PAGE${suffix}`
    ];
    const page = this.getPage(sectionID, pageID);
    if (page) {
      const prefix = page.textKeyPrefix;
      if (prefix) {
        keys.unshift(`${prefix}_${pageID}${suffix}`, `${prefix}${suffix}`);
      }
    }
    return keys.find((k) => Locale.keyExists(k)) ?? null;
  }
  initialize() {
    const excludes = /* @__PURE__ */ new Set();
    const supportsSSO = Network.supportsSSO();
    if (!supportsSSO) {
      excludes.add("CONCEPTS::LEGENDS_1");
      excludes.add("CONCEPTS::LEGENDS_2");
      excludes.add("CONCEPTS::LEGENDS_3");
      excludes.add("CONCEPTS::LEGENDS_4");
      excludes.add("CONCEPTS::LEGENDS_5");
    } else {
      excludes.add("CONCEPTS::MEMENTOS");
    }
    const sections = this.sections;
    const sectionSet = /* @__PURE__ */ new Set();
    const pagesBySection = this.pagesBySection;
    const pageGroupsBySection = this.pageGroupsBySection;
    const pagesByUUID = this.pagesByUUID;
    function addPage(page) {
      const pageUUID = `${page.sectionID}::${page.pageID}`;
      if (!excludes.has(page.sectionID) && !excludes.has(pageUUID) && (page.pageGroupID == null || !excludes.has(`${page.sectionID}|:${page.pageGroupID}`))) {
        let pages = pagesBySection.get(page.sectionID);
        if (!pages) {
          pages = [];
          pagesBySection.set(page.sectionID, pages);
        }
        pages.push(page);
        pagesByUUID.set(pageUUID, page);
      }
    }
    function addPageGroup(pageGroup) {
      const pageGroupExcludesKey = `${pageGroup.sectionID}|:${pageGroup.pageGroupID}`;
      if (!excludes.has(pageGroup.sectionID) && !excludes.has(pageGroupExcludesKey)) {
        if (sectionSet.has(pageGroup.sectionID)) {
          let pageGroups = pageGroupsBySection.get(pageGroup.sectionID);
          if (!pageGroups) {
            pageGroups = [];
            pageGroupsBySection.set(pageGroup.sectionID, pageGroups);
          }
          pageGroups.push(pageGroup);
        }
      }
    }
    if (GameInfo.CivilopediaSectionExcludes) {
      GameInfo.CivilopediaSectionExcludes.forEach((row) => {
        excludes.add(row.SectionID);
      });
    }
    if (GameInfo.CivilopediaPageExcludes) {
      GameInfo.CivilopediaPageExcludes.forEach((row) => {
        excludes.add(`${row.SectionID}::${row.PageID}`);
      });
    }
    if (GameInfo.CivilopediaPageGroupExcludes) {
      GameInfo.CivilopediaPageGroupExcludes.forEach((row) => {
        excludes.add(`${row.SectionID}|:${row.PageGroupID}`);
      });
    }
    if (GameInfo.CivilopediaSections) {
      GameInfo.CivilopediaSections.forEach((row) => {
        if (!excludes.has(row.SectionID)) {
          const section = {
            detailsType: 0 /* Section */,
            sectionID: row.SectionID,
            nameKey: row.Name,
            tabText: null,
            icon: row.Icon,
            sortIndex: row.SortIndex
          };
          sections.push(section);
          sectionSet.add(row.SectionID);
        }
      });
    }
    if (GameInfo.CivilopediaPageGroups) {
      GameInfo.CivilopediaPageGroups.forEach((row) => {
        const pageGroup = {
          detailsType: 1 /* PageGroup */,
          sectionID: row.SectionID,
          pageGroupID: row.PageGroupID,
          nameKey: row.Name,
          tabText: row.Name,
          visibleIfEmpty: row.VisibleIfEmpty,
          sortIndex: row.SortIndex,
          collapsed: true
        };
        addPageGroup(pageGroup);
      });
    }
    if (GameInfo.CivilopediaPages) {
      GameInfo.CivilopediaPages.forEach((row) => {
        const page = {
          detailsType: 2 /* Page */,
          sectionID: row.SectionID,
          pageID: row.PageID,
          pageGroupID: row.PageGroupID ?? null,
          pageLayoutID: row.PageLayoutID,
          nameKey: row.Name,
          titleText: null,
          subTitleText: null,
          tabText: row.Name,
          textKeyPrefix: row.TextKeyPrefix ?? null,
          sortIndex: row.SortIndex
        };
        addPage(page);
      });
    }
    if (GameInfo.CivilopediaPageGroupQueries) {
      GameInfo.CivilopediaPageGroupQueries.forEach((row) => {
        const q = Database.query("gameplay", row.SQL);
        q?.forEach((r) => {
          if (typeof r.Name == "string" && typeof r.PageGroupID == "string") {
            const visibleIfEmpty = typeof r.VisibleIfEmpty == "boolean" ? r.VisibleIfEmpty : false;
            const sortIndex = typeof r.SortIndex == "number" ? r.SortIndex : 0;
            const pageGroup = {
              detailsType: 1 /* PageGroup */,
              sectionID: row.SectionID,
              pageGroupID: r.PageGroupID,
              nameKey: r.Name,
              tabText: r.Name,
              visibleIfEmpty,
              sortIndex,
              collapsed: true
            };
            addPageGroup(pageGroup);
          }
        });
      });
    }
    if (GameInfo.CivilopediaPageQueries) {
      const currentAge = GameInfo.Ages.lookup(Game.age)?.AgeType;
      GameInfo.CivilopediaPageQueries.forEach((row) => {
        const q = Database.query("gameplay", row.SQL, currentAge ?? "NO_AGE");
        q?.forEach((r) => {
          if (typeof r.PageID == "string" && typeof r.Name == "string" && typeof r.PageLayoutID == "string") {
            const pageGroupID = typeof r.PageGroupID == "string" ? r.PageGroupID : null;
            const sortIndex = typeof r.SortIndex == "number" ? r.SortIndex : 0;
            const textKeyPrefix = typeof r.TextKeyPrefix == "string" ? r.TextKeyPrefix : null;
            const page = {
              detailsType: 2 /* Page */,
              sectionID: row.SectionID,
              pageID: r.PageID,
              pageGroupID,
              pageLayoutID: r.PageLayoutID,
              nameKey: r.Name,
              titleText: null,
              subTitleText: null,
              tabText: r.Name,
              textKeyPrefix,
              sortIndex
            };
            addPage(page);
          }
        });
      });
    }
    if (GameInfo.CivilopediaPageLayoutChapters) {
      GameInfo.CivilopediaPageLayoutChapters.forEach((row) => {
        const chapter = {
          chapterID: row.ChapterID,
          pageLayoutID: row.PageLayoutID,
          headerKey: row.Header ?? null,
          sortIndex: row.SortIndex
        };
        let chapters = this.chaptersByLayout.get(row.PageLayoutID);
        if (!chapters) {
          chapters = [];
          this.chaptersByLayout.set(row.PageLayoutID, chapters);
        }
        chapters.push(chapter);
      });
    }
    this.chaptersByLayout.forEach((chapters) => {
      chapters.sort((a, b) => {
        return a.sortIndex - b.sortIndex;
      });
    });
    if (GameInfo.CivilopediaPageChapterHeaders) {
      GameInfo.CivilopediaPageChapterHeaders.forEach((row) => {
        const chapterUUID = `${row.SectionID}|${row.PageID}|${row.ChapterID}`;
        let override = this.chapterOverrides.get(chapterUUID);
        if (!override) {
          override = {
            headerKey: null,
            body: []
          };
          this.chapterOverrides.set(chapterUUID, override);
        }
        override.headerKey = row.Header;
        this.chapterOverrides.set(chapterUUID, override);
      });
    }
    if (GameInfo.CivilopediaPageLayoutChapterContentQueries) {
      GameInfo.CivilopediaPageLayoutChapterContentQueries.forEach((row) => {
        const uuid = `${row.PageLayoutID}|${row.ChapterID}`;
        this.chapterBodyQueries.set(uuid, row);
      });
    }
    if (GameInfo.CivilopediaPageChapterParagraphs) {
      GameInfo.CivilopediaPageChapterParagraphs.forEach((row) => {
        const chapterUUID = `${row.SectionID}|${row.PageID}|${row.ChapterID}`;
        let override = this.chapterOverrides.get(chapterUUID);
        if (!override) {
          override = {
            headerKey: null,
            body: []
          };
          this.chapterOverrides.set(chapterUUID, override);
        }
        override.body.push({
          textKey: row.Paragraph,
          sortIndex: row.SortIndex
        });
      });
    }
    this.sections.forEach((s) => {
      const sectionID = s.sectionID;
      const tabKey = this.findSectionTextKey(sectionID, "TAB_NAME") ?? s.nameKey;
      s.tabText = Locale.compose(tabKey);
    });
    this.sections.sort((a, b) => {
      if (a.sortIndex != b.sortIndex) {
        return a.sortIndex - b.sortIndex;
      } else {
        return Locale.compare(a.tabText ?? "", b.tabText ?? "");
      }
    });
    this.pageGroupsBySection.forEach((groups) => {
      groups.forEach((g) => {
        const tabKey = this.findPageTextKey(g.sectionID, g.pageGroupID, "TAB_NAME") ?? g.nameKey;
        g.tabText = Locale.compose(tabKey);
      });
      groups.sort((a, b) => {
        if (a.sortIndex != b.sortIndex) {
          return a.sortIndex - b.sortIndex;
        } else {
          return Locale.compare(a.tabText ?? "", b.tabText ?? "");
        }
      });
    });
    const duplicatePages = /* @__PURE__ */ new Map();
    this.pagesBySection.forEach((pages, sectionID) => {
      duplicatePages.clear();
      pages.forEach((page) => {
        const pageID = page.pageID;
        const tabKey = this.findPageTextKey(sectionID, pageID, "TAB_NAME") ?? page.nameKey;
        const titleKey = this.findPageTextKey(sectionID, pageID, "TITLE") ?? page.nameKey;
        const subtitleKey = this.findPageTextKey(sectionID, pageID, "SUBTITLE");
        if (sectionID == "UNITS") {
          let dupes = duplicatePages.get(tabKey);
          if (dupes == null) {
            dupes = [];
            duplicatePages.set(tabKey, dupes);
          }
          dupes.push(page);
        }
        page.tabText = Locale.compose(tabKey);
        page.titleText = Locale.compose(titleKey);
        if (subtitleKey) {
          page.subTitleText = Locale.compose(subtitleKey);
        }
      });
      if (duplicatePages.size > 0) {
        duplicatePages.forEach((pages2, tabKey) => {
          if (pages2.length > 1) {
            pages2.forEach((page) => {
              let tier = -1;
              const unitType = page.pageID;
              const unit = GameInfo.Units.lookup(unitType);
              if (unit && unit.Tier != null) {
                tier = unit.Tier;
              }
              if (tier > 1) {
                const titleKey = this.findPageTextKey(page.sectionID, page.pageID, "TITLE") ?? page.nameKey;
                page.tabText = Locale.compose("LOC_CIVILOPEDIA_UNIT_NAME_WITH_TIER", tabKey, tier);
                page.titleText = Locale.compose("LOC_CIVILOPEDIA_UNIT_NAME_WITH_TIER", titleKey, tier);
              }
            });
          }
        });
      }
      pages.sort((a, b) => {
        if (a.pageGroupID == b.pageGroupID) {
          if (a.sortIndex != b.sortIndex) {
            return a.sortIndex - b.sortIndex;
          } else {
            return Locale.compare(a.tabText ?? "", b.tabText ?? "");
          }
        } else {
          const groups = this.pageGroupsBySection.get(a.sectionID);
          const agIndex = groups?.findIndex((g) => g.pageGroupID == a.pageGroupID) ?? -1;
          const bgIndex = groups?.findIndex((g) => g.pageGroupID == b.pageGroupID) ?? -1;
          return agIndex - bgIndex;
        }
      });
    });
    this.chaptersByLayout.forEach((chapters) => {
      chapters.sort((a, b) => {
        return a.sortIndex - b.sortIndex;
      });
    });
    this.chapterOverrides.forEach((override) => {
      override.body.sort((a, b) => {
        return a.sortIndex - b.sortIndex;
      });
    });
    this.populateSearchData();
  }
  /**
   * Indexes cached data into a search database.
   */
  populateSearchData() {
    if (Search.hasContext(CIVILOPEDIA_SEARCH_CONTEXT)) {
      Search.destroyContext(CIVILOPEDIA_SEARCH_CONTEXT);
    }
    if (Search.createContext(CIVILOPEDIA_SEARCH_CONTEXT, "[B]", "[/B]")) {
      const additionalSearchTerms = /* @__PURE__ */ new Map();
      if (GameInfo.CivilopediaPageSearchTermQueries) {
        for (const q of GameInfo.CivilopediaPageSearchTermQueries) {
          const results = Database.query("gameplay", q.SQL);
          if (results) {
            for (const searchTerm of results) {
              const key = `${searchTerm.SectionID}|${searchTerm.PageID}`;
              let lookup = additionalSearchTerms.get(key);
              if (!lookup) {
                lookup = [];
                additionalSearchTerms.set(key, lookup);
              }
              lookup.push(Locale.compose(searchTerm.Term));
            }
          }
        }
      }
      for (const searchTerm of GameInfo.CivilopediaPageSearchTerms) {
        const key = `${searchTerm.SectionID}|${searchTerm.PageID}`;
        let lookup = additionalSearchTerms.get(key);
        if (!lookup) {
          lookup = [];
          additionalSearchTerms.set(key, lookup);
        }
        lookup.push(Locale.compose(searchTerm.Term));
      }
      Search.beginAddingData();
      for (const sectionPages of this.pagesBySection) {
        for (const page of sectionPages[1]) {
          const key = `${page.sectionID}|${page.pageID}`;
          let terms = additionalSearchTerms.get(key);
          if (!terms) {
            terms = [];
          }
          let titleText = page.titleText ?? "";
          if (page.tabText) {
            titleText = page.tabText;
            if (page.titleText) {
              terms.push(page.titleText);
            }
          }
          const description = "";
          Search.addData(CIVILOPEDIA_SEARCH_CONTEXT, key, titleText, description, terms);
        }
      }
      Search.finishedAddingData();
      Search.optimize(CIVILOPEDIA_SEARCH_CONTEXT);
    }
  }
  onCivilopediaHotkey() {
    if (ContextManager.isCurrentClass("screen-civilopedia")) {
      ContextManager.pop("screen-civilopedia");
    } else if (!ContextManager.hasInstanceOf("screen-pause-menu") && !ContextManager.hasInstanceOf("age-transition-banner") && !ContextManager.hasInstanceOf("age-ending__container") && !ContextManager.hasInstanceOf("screen-legends-report")) {
      ContextManager.push("screen-civilopedia", { singleton: true, createMouseGuard: true });
    }
  }
}
const instance = new Civilopedia();

export { DetailsType, instance };
//# sourceMappingURL=model-civilopedia.chunk.js.map
