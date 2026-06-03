import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { splitProps, mergeProps, createComponent, Show } from '../../vendor/solid-js/dist/solid.js';
import { Filigree } from './filigree.js';
import { Header } from './header.js';
import { L10n } from './l10n.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="h-24 absolute -top-7 img-fxs-header-glow pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div role=heading aria-level=3 data-name=FiligreeTitle.None></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div role=heading aria-level=1 data-name=FiligreeTitle.H1></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div role=heading aria-level=2 data-name=FiligreeTitle.H2></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div role=heading aria-level=3 data-name=FiligreeTitle.H3></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div role=heading aria-level=5 data-name=FiligreeTitle.Small></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="h-0\\.5 grow"></div><div class="flex flex-row uppercase font-title text-secondary px-3"></div><div class="h-0\\.5 grow"></div></div>`);
const BackgroundGlow = () => {
  return _tmpl$();
};
const FiligreeTitleNone = (props) => {
  const [local, other] = splitProps(props, ["class", "textClass", "text", "bgGlow", "args"]);
  return (() => {
    var _el$2 = _tmpl$2();
    spread(_el$2, mergeProps({
      get ["class"]() {
        return `max-w-full ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$2, createComponent(Header, {
      get ["class"]() {
        return `flex-auto max-w-full text-center justify-center ${local.textClass ?? ""}`;
      },
      get classList() {
        return {
          "text-shadow-subtle z-1": !!local.bgGlow
        };
      },
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return local.text || "";
          },
          get args() {
            return local.args;
          }
        });
      }
    }));
    return _el$2;
  })();
};
const FiligreeTitleH1 = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return (() => {
    var _el$3 = _tmpl$3();
    spread(_el$3, mergeProps({
      get ["class"]() {
        return `flex flex-col items-center max-w-full relative ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$3, createComponent(Show, {
      get when() {
        return local.bgGlow;
      },
      get children() {
        return createComponent(BackgroundGlow, {});
      }
    }), null);
    insert(_el$3, createComponent(Header, {
      get ["class"]() {
        return `flex-auto max-w-full text-center justify-center ${local.textClass ?? ""}`;
      },
      get classList() {
        return {
          "text-shadow-subtle z-1": !!local.bgGlow
        };
      },
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return local.text || "";
          },
          get args() {
            return local.args;
          }
        });
      }
    }), null);
    insert(_el$3, createComponent(Filigree.H1, {}), null);
    return _el$3;
  })();
};
const FiligreeTitleH2 = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return (() => {
    var _el$4 = _tmpl$4();
    spread(_el$4, mergeProps({
      get ["class"]() {
        return `flex flex-col items-center max-w-full relative ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$4, createComponent(Show, {
      get when() {
        return local.bgGlow;
      },
      get children() {
        return createComponent(BackgroundGlow, {});
      }
    }), null);
    insert(_el$4, createComponent(Header, {
      get ["class"]() {
        return `flex-auto max-w-full text-center justify-center ${local.textClass ?? ""}`;
      },
      get classList() {
        return {
          "text-shadow-subtle z-1": !!local.bgGlow
        };
      },
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return local.text || "";
          },
          get args() {
            return local.args;
          }
        });
      }
    }), null);
    insert(_el$4, createComponent(Filigree.H2, {
      "class": "mt-1"
    }), null);
    return _el$4;
  })();
};
const FiligreeTitleH3 = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return (() => {
    var _el$5 = _tmpl$5();
    spread(_el$5, mergeProps({
      get ["class"]() {
        return `flex flex-col items-center justify-center max-w-full relative ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$5, createComponent(Show, {
      get when() {
        return local.bgGlow;
      },
      get children() {
        return createComponent(BackgroundGlow, {});
      }
    }), null);
    insert(_el$5, createComponent(Header, {
      get ["class"]() {
        return `flex-auto max-w-full text-center justify-center ${local.textClass ?? ""}`;
      },
      get classList() {
        return {
          "text-shadow-subtle z-1": !!local.bgGlow
        };
      },
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return local.text || "";
          },
          get args() {
            return local.args;
          }
        });
      }
    }), null);
    insert(_el$5, createComponent(Filigree.H3, {}), null);
    return _el$5;
  })();
};
const FiligreeTitleH4 = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return createComponent(Filigree.H4, mergeProps({
    role: "heading",
    "aria-level": 4,
    name: "FiligreeTitle.H4",
    get ["class"]() {
      return `flex justify-center max-w-full items-center relative ${local.class ?? ""}`;
    }
  }, other, {
    get children() {
      return [createComponent(Show, {
        get when() {
          return local.bgGlow;
        },
        get children() {
          return createComponent(BackgroundGlow, {});
        }
      }), createComponent(Header, {
        get ["class"]() {
          return `max-w-full text-center justify-center ${local.textClass ?? ""}`;
        },
        get classList() {
          return {
            "text-shadow-subtle z-1": !!local.bgGlow
          };
        },
        get children() {
          return createComponent(L10n.Compose, {
            get text() {
              return local.text || "";
            },
            get args() {
              return local.args;
            }
          });
        }
      })];
    }
  }));
};
const FiligreeTitleSmall = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return (() => {
    var _el$6 = _tmpl$6();
    spread(_el$6, mergeProps({
      get ["class"]() {
        return `flex flex-col items-center max-w-full relative ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$6, createComponent(Show, {
      get when() {
        return local.bgGlow;
      },
      get children() {
        return createComponent(BackgroundGlow, {});
      }
    }), null);
    insert(_el$6, createComponent(Header, {
      get ["class"]() {
        return `flex-auto max-w-full text-center justify-center ${local.textClass ?? ""}`;
      },
      get classList() {
        return {
          "text-shadow-subtle z-1": !!local.bgGlow
        };
      },
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return local.text || "";
          },
          get args() {
            return local.args;
          }
        });
      }
    }), null);
    insert(_el$6, createComponent(Filigree.Small, {}), null);
    return _el$6;
  })();
};
const FiligreeTitleAccent = (props) => {
  const [local, other] = splitProps(props, ["bgGlow", "textClass", "text", "class", "args"]);
  return createComponent(Filigree.TitleAccent, mergeProps({
    role: "heading",
    "aria-level": 3,
    name: "FiligreeTitle.Accent",
    get ["class"]() {
      return `flex justify-center max-w-full items-center relative ${local.class ?? ""}`;
    }
  }, other, {
    get children() {
      return [createComponent(Show, {
        get when() {
          return local.bgGlow;
        },
        get children() {
          return createComponent(BackgroundGlow, {});
        }
      }), createComponent(Header, {
        get ["class"]() {
          return `max-w-full text-center justify-center ${local.textClass ?? ""}`;
        },
        get classList() {
          return {
            "text-shadow-subtle z-1": !!local.bgGlow
          };
        },
        get children() {
          return createComponent(L10n.Compose, {
            get text() {
              return local.text || "";
            },
            get args() {
              return local.args;
            }
          });
        }
      })];
    }
  }));
};
const FiligreeTitlePlain = (props) => {
  const [localProps, otherProps] = splitProps(props, ["text", "class"]);
  return (() => {
    var _el$7 = _tmpl$7(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling;
    spread(_el$7, mergeProps({
      get ["class"]() {
        return `flex flex-row w-full ${localProps.class} items-center`;
      }
    }, otherProps), false, true);
    _el$8.style.setProperty("background-image", "linear-gradient(to left, rgba(77, 83, 102, 1), rgba(77, 83, 102, 0))");
    insert(_el$9, createComponent(L10n.Compose, {
      get text() {
        return localProps.text;
      }
    }), null);
    insert(_el$9, createComponent(Show, {
      get when() {
        return props.children;
      },
      get children() {
        return props.children;
      }
    }), null);
    _el$10.style.setProperty("background-image", "linear-gradient(to right, rgba(77, 83, 102, 1), rgba(77, 83, 102, 0))");
    return _el$7;
  })();
};
const FiligreeTitle = ComponentRegistry.register("FiligreeTitle", FiligreeTitleH3);
FiligreeTitle.None = ComponentRegistry.register("FiligreeTitle.None", FiligreeTitleNone);
FiligreeTitle.H1 = ComponentRegistry.register("FiligreeTitle.H1", FiligreeTitleH1);
FiligreeTitle.H2 = ComponentRegistry.register("FiligreeTitle.H2", FiligreeTitleH2);
FiligreeTitle.H3 = ComponentRegistry.register("FiligreeTitle.H3", FiligreeTitleH3);
FiligreeTitle.H4 = ComponentRegistry.register("FiligreeTitle.H4", FiligreeTitleH4);
FiligreeTitle.Small = ComponentRegistry.register("FiligreeTitle.Small", FiligreeTitleSmall);
FiligreeTitle.Accent = ComponentRegistry.register("FiligreeTitle.Accent", FiligreeTitleAccent);
FiligreeTitle.Plain = ComponentRegistry.register("FiligreeTitle.Plain", FiligreeTitlePlain);

export { FiligreeTitle };
//# sourceMappingURL=filigree-title.js.map
