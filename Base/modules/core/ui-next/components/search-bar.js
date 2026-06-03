import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, mergeProps, Show, createMemo } from '../../vendor/solid-js/dist/solid.js';
import { Icon } from './icon.js';
import { L10n } from './l10n.js';
import { TextInput } from './text-input.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-row items-center justify-start pointer-events-none"><div class="m-2 text-accent-2"></div></div>`);
const SearchBarComponent = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  return createComponent(TextInput, mergeProps(props, {
    setIsEditing,
    get disableFocus() {
      return props.disableFocus ?? true;
    },
    get children() {
      return createComponent(Show, {
        get when() {
          return createMemo(() => !!!isEditing())() && !props.value();
        },
        get children() {
          return [(() => {
            var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
            insert(_el$2, createComponent(L10n.Compose, {
              text: "LOC_OPTIONS_SEARCH"
            }));
            return _el$;
          })(), createComponent(Icon, {
            "class": "absolute right-1 top-1 size-8 pointer-events-none",
            name: "url('blp:soc_search')"
          })];
        }
      });
    }
  }));
};
const SearchBar = ComponentRegistry.register("Search", SearchBarComponent);

export { SearchBar };
//# sourceMappingURL=search-bar.js.map
