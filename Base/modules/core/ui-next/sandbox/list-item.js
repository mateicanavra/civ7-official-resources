import { template, insert } from '../../vendor/solid-js/web/dist/web.js';

var _tmpl$ = /* @__PURE__ */ template(`<span class="flex flex-row p-2 mx-2 my-1 text-base mx-2 mt-2 min-w-72">Name: <!> &nbsp;&nbsp;&nbsp; Value: </span>`);
const ListItem = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$4 = _el$2.nextSibling, _el$3 = _el$4.nextSibling;
    _el$.style.setProperty("border", "1px solid white");
    insert(_el$, () => props.name, _el$4);
    insert(_el$, () => props.value, null);
    return _el$;
  })();
};

export { ListItem };
//# sourceMappingURL=list-item.js.map
