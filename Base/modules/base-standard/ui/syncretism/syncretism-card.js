import { template, insert, style, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, For, createRenderEffect, createSignal, createEffect, Show } from '../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { SyncretismScreenModel, getOpFlagString, getTraitIcon } from './syncretism-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative flex flex-col justify-start flex-auto px-2 pb-1 pt-1"><div class="flex flex-col flex-auto mx-1"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="syncretism-hover absolute -inset-2"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="size-full absolute"><div class="size-full absolute"data-name=sync-card-bg></div><div class="size-full absolute syncretism-card-bg-gradient"data-name=sync-card-bg></div><div class="w-full h-24 absolute syncretism-card-title-gradient"></div><div class="syncretism-card-hover absolute inset-0 opacity-0"data-name=sync-card-hover></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row px-2 pt-1"><div class="flex flex-row flex-auto justify-start px-1 pt-1 pb-2"><div class=p-1><div class=text-body></div></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div><div class="flex flex-col relative items-center justify-center"></div><div class="flex flex-auto justify-center flex-col ml-3"><div class="font-title uppercase text-secondary pr-2 pb-1"></div><div class="text-sm pb-1"></div></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="mx-2 mt-2 flex flex-row bg-accent-6 "></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="syncretism-card-bottom-lock flex items-center"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div><div class="mx-2 relative grow"><div data-name=sync-card-bg></div><div data-name=sync-card-bg></div><div class="w-full h-24 absolute syncretism-card-title-gradient"></div><div class="relative flex flex-col justify-start flex-auto px-2 pb-1 pt-1"><div class="flex flex-row pr-2 pt-1"><div class="flex flex-row flex-auto justify-start px-1 pt-1 pb-2"><div class=p-1><div class=text-body></div></div></div></div><div class="flex flex-col flex-auto mx-1"></div></div></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div><div><div class="flex flex-auto justify-center flex-col"><div class="font-title text-accent-1 pr-2 pb-1"></div><div class="text-sm pb-1"></div></div></div></div>`);
const SyncCard = (props) => {
  const model = SyncretismScreenModel.get();
  return (() => {
    var _el$ = _tmpl$3();
    insert(_el$, createComponent(Activatable, {
      onActivate: () => model.onCardClick(props),
      "class": "mx-1 relative grow syncretism-card",
      audio: {
        group: "audio-base",
        onPress: "data-audio-hero-press",
        onActivate: "data-audio-hero-press",
        onFocus: "data-audio-hero-focus"
      },
      hotkeyAction: "accept",
      get children() {
        return [createComponent(SyncCardBG, props), (() => {
          var _el$2 = _tmpl$(), _el$3 = _el$2.firstChild;
          insert(_el$2, createComponent(SyncCardHeader, props), _el$3);
          insert(_el$3, createComponent(For, {
            get each() {
              return props.itemsAvailable;
            },
            children: (item) => createComponent(SyncItemExpanded, {
              "class": "flex-row flex m-1 p-1",
              get title() {
                return item.name;
              },
              get icon() {
                return item.icon;
              },
              get description() {
                return item.description;
              },
              get addInfo1() {
                return item.addInfo1;
              },
              get addInfo2() {
                return item.addInfo2;
              }
            })
          }));
          return _el$2;
        })(), _tmpl$2()];
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = props.style, _v$2 = props.class;
      _p$.e = style(_el$, _v$, _p$.e);
      _v$2 !== _p$.t && className(_el$, _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const SyncCardBG = (props) => {
  return (() => {
    var _el$5 = _tmpl$4(), _el$6 = _el$5.firstChild;
    _el$6.style.setProperty("background-size", "cover");
    _el$6.style.setProperty("background-position-x", "50%");
    _el$6.style.setProperty("opacity", "0.80");
    createRenderEffect((_$p) => (_$p = `url('${props.bgImage}')`) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
    return _el$5;
  })();
};
const SyncCardHeader = (props) => {
  return (() => {
    var _el$7 = _tmpl$5(), _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild, _el$10 = _el$9.firstChild;
    insert(_el$7, createComponent(Icon, {
      "class": "size-12 self-center",
      get name() {
        return props.civIcon;
      },
      isUrl: true
    }), _el$8);
    insert(_el$9, createComponent(L10n.Stylize, {
      "class": "fxs-header text-shadow-subtle font-bold text-lg font-title uppercase tracking-100",
      get text() {
        return props.civ;
      }
    }), _el$10);
    insert(_el$10, () => Locale.compose(getOpFlagString(props.flagType)));
    insert(_el$7, createComponent(Icon, {
      "class": "size-8 self-center",
      get name() {
        return `url('blp:${getTraitIcon(props.traits[0]) ?? ""}')`;
      },
      isUrl: false
    }), null);
    insert(_el$7, createComponent(Icon, {
      "class": "size-8 self-center",
      get name() {
        return `url('blp:${getTraitIcon(props.traits[1]) ?? ""}')`;
      },
      isUrl: false
    }), null);
    return _el$7;
  })();
};
const SyncItemExpanded = (props) => {
  const [lockedBG, setLockedBG] = createSignal("flex-row mt-1 img-ticket-solid-shadow-container");
  createEffect(() => {
    if (props.addInfo2) {
      if (props.addInfo2 != "") {
        setLockedBG("flex-row mt-1 sync-locked-ticket-bg");
      }
    }
  });
  return (() => {
    var _el$11 = _tmpl$6(), _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling, _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
    insert(_el$13, createComponent(Icon, {
      "class": "size-12 self-center ",
      get name() {
        return props.icon ?? "";
      },
      isUrl: true
    }), null);
    insert(_el$13, createComponent(Show, {
      get when() {
        return props.addInfo2;
      },
      get children() {
        return createComponent(Icon, {
          "class": "-mt-5 size-9 self-center",
          name: `url('blp:icon_lock')`,
          isUrl: false
        });
      }
    }), null);
    insert(_el$15, createComponent(L10n.Stylize, {
      get text() {
        return props.title;
      }
    }));
    insert(_el$16, createComponent(L10n.Stylize, {
      get text() {
        return props.description;
      }
    }));
    insert(_el$11, createComponent(SyncItemUpgrade, props), null);
    insert(_el$11, createComponent(SyncItemRequires, props), null);
    createRenderEffect((_p$) => {
      var _v$3 = lockedBG(), _v$4 = props.class;
      _v$3 !== _p$.e && className(_el$11, _p$.e = _v$3);
      _v$4 !== _p$.t && className(_el$12, _p$.t = _v$4);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$11;
  })();
};
const SyncItemUpgrade = (props) => {
  return createComponent(Show, {
    get when() {
      return props.addInfo1 != "" && props.addInfo1;
    },
    get children() {
      var _el$17 = _tmpl$7();
      insert(_el$17, createComponent(Icon, {
        "class": "size-5 self-center mx-1",
        name: `url('blp:buildicon_warning')`,
        isUrl: false
      }), null);
      insert(_el$17, createComponent(L10n.Stylize, {
        "class": "text-info font-bold text-sm uppercase flex text-center px-4 pb-1 pt-1",
        get text() {
          return props.addInfo1 ?? "";
        }
      }), null);
      return _el$17;
    }
  });
};
const SyncItemRequires = (props) => {
  return createComponent(Show, {
    get when() {
      return props.addInfo2 != "" && props.addInfo2;
    },
    get children() {
      var _el$18 = _tmpl$7();
      insert(_el$18, createComponent(Icon, {
        "class": "size-5 self-center mx-1",
        name: `url('blp:buildicon_warning')`,
        isUrl: false
      }), null);
      insert(_el$18, createComponent(L10n.Stylize, {
        "class": "text-accent-1 font-bold text-sm uppercase flex px-4 pb-1 pt-1",
        get text() {
          return props.addInfo2 ?? "";
        }
      }), null);
      return _el$18;
    }
  });
};
const SyncretismPreviewCard = (props) => {
  return (() => {
    var _el$19 = _tmpl$9(), _el$20 = _el$19.firstChild, _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling, _el$23 = _el$22.nextSibling, _el$24 = _el$23.nextSibling, _el$25 = _el$24.firstChild, _el$27 = _el$25.firstChild, _el$28 = _el$27.firstChild, _el$29 = _el$28.firstChild, _el$30 = _el$25.nextSibling;
    _el$21.style.setProperty("background-size", "cover");
    _el$21.style.setProperty("background-position-x", "50%");
    _el$21.style.setProperty("opacity", "0.80");
    insert(_el$25, createComponent(Tooltip.Text, {
      get text() {
        return Locale.stylize("LOC_UI_SYNCRETISM_PREVIEW_ONLY");
      },
      get children() {
        var _el$26 = _tmpl$8();
        insert(_el$26, createComponent(Show, {
          get when() {
            return !props.isSyncretized;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-14 self-center",
              name: `url('blp:icon_lock')`,
              isUrl: false
            });
          }
        }));
        return _el$26;
      }
    }), _el$27);
    insert(_el$25, createComponent(Icon, {
      "class": "size-12 self-center",
      get name() {
        return props.civIcon;
      },
      isUrl: true
    }), _el$27);
    insert(_el$28, createComponent(L10n.Stylize, {
      get ["class"]() {
        return `text-shadow-subtle font-bold text-lg font-title uppercase tracking-100 ${props.isSyncretized ? "fxs-header" : ""}`;
      },
      get text() {
        return props.civ;
      }
    }), _el$29);
    insert(_el$29, () => Locale.compose(getOpFlagString(props.flagType)));
    insert(_el$25, createComponent(Icon, {
      get ["class"]() {
        return `size-8 self-center ${props.isSyncretized ? "" : "syncretism-card-lock"}`;
      },
      get name() {
        return `url('blp:${getTraitIcon(props.traits[0]) ?? ""}')`;
      },
      isUrl: false
    }), null);
    insert(_el$25, createComponent(Icon, {
      get ["class"]() {
        return `size-8 self-center ${props.isSyncretized ? "" : "syncretism-card-lock"}`;
      },
      get name() {
        return `url('blp:${getTraitIcon(props.traits[1]) ?? ""}')`;
      },
      isUrl: false
    }), null);
    insert(_el$30, createComponent(For, {
      get each() {
        return props.itemsAvailable;
      },
      children: (item) => createComponent(SyncPreviewItem, {
        "class": "flex-row flex m-1 p-1",
        get title() {
          return item.name;
        },
        get icon() {
          return item.icon;
        },
        get description() {
          return item.description;
        },
        get addInfo1() {
          return item.addInfo1;
        },
        get addInfo2() {
          return item.addInfo2;
        }
      })
    }));
    createRenderEffect((_p$) => {
      var _v$5 = props.style, _v$6 = props.class, _v$7 = `size-full absolute ${props.isSyncretized ? "" : "syncretism-card-lock"}`, _v$8 = `url('${props.bgImage}')`, _v$9 = `size-full absolute syncretism-card-bg-gradient ${props.isSyncretized ? "border border-tertiary" : ""}`;
      _p$.e = style(_el$19, _v$5, _p$.e);
      _v$6 !== _p$.t && className(_el$19, _p$.t = _v$6);
      _v$7 !== _p$.a && className(_el$21, _p$.a = _v$7);
      _v$8 !== _p$.o && ((_p$.o = _v$8) != null ? _el$21.style.setProperty("background-image", _v$8) : _el$21.style.removeProperty("background-image"));
      _v$9 !== _p$.i && className(_el$22, _p$.i = _v$9);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    });
    return _el$19;
  })();
};
const SyncPreviewItem = (props) => {
  const [lockedBG, setLockedBG] = createSignal("flex-row mt-1 img-ticket-solid-shadow-container");
  createEffect(() => {
    if (props.addInfo2) {
      if (props.addInfo2 != "") {
        setLockedBG("flex-row mt-1 sync-locked-ticket-bg");
      }
    }
  });
  return (() => {
    var _el$31 = _tmpl$10(), _el$32 = _el$31.firstChild, _el$33 = _el$32.firstChild, _el$34 = _el$33.firstChild, _el$35 = _el$34.nextSibling;
    insert(_el$32, createComponent(Icon, {
      "class": "size-12 self-center",
      get name() {
        return props.icon ?? "";
      },
      isUrl: true
    }), _el$33);
    insert(_el$34, createComponent(L10n.Stylize, {
      get text() {
        return props.title;
      }
    }));
    insert(_el$35, createComponent(L10n.Stylize, {
      get text() {
        return props.description;
      }
    }));
    insert(_el$31, createComponent(SyncItemRequires, props), null);
    insert(_el$31, createComponent(SyncItemUpgrade, props), null);
    createRenderEffect((_p$) => {
      var _v$10 = lockedBG(), _v$11 = props.class;
      _v$10 !== _p$.e && className(_el$31, _p$.e = _v$10);
      _v$11 !== _p$.t && className(_el$32, _p$.t = _v$11);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$31;
  })();
};

export { SyncCard, SyncItemExpanded, SyncItemRequires, SyncItemUpgrade, SyncPreviewItem, SyncretismPreviewCard };
//# sourceMappingURL=syncretism-card.js.map
