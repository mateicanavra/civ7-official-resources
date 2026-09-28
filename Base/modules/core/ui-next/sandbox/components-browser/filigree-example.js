import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { Filigree } from '../../components/filigree.js';
import { Header } from '../../components/header.js';
import { createComponent } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-full m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div></div></div>`);
const FiligreeExample = () => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling, _el$7 = _el$6.nextSibling;
    insert(_el$3, createComponent(Header, {
      "class": "text-2xl",
      children: "Filigree.H1"
    }), null);
    insert(_el$3, createComponent(Filigree.H1, {}), null);
    insert(_el$4, createComponent(Header, {
      "class": "text-xl",
      children: "Filigree.H2"
    }), null);
    insert(_el$4, createComponent(Filigree.H2, {}), null);
    insert(_el$5, createComponent(Header, {
      "class": "text-lg",
      children: "Filigree.H3"
    }), null);
    insert(_el$5, createComponent(Filigree.H3, {}), null);
    insert(_el$6, createComponent(Filigree.H4, {
      get children() {
        return createComponent(Header, {
          "class": "text-base",
          children: "Filigree.H4"
        });
      }
    }));
    insert(_el$7, createComponent(Header, {
      "class": "text-sm",
      children: "Filigree.Small"
    }), null);
    insert(_el$7, createComponent(Filigree.Small, {}), null);
    return _el$;
  })();
};

export { FiligreeExample };
//# sourceMappingURL=filigree-example.js.map
