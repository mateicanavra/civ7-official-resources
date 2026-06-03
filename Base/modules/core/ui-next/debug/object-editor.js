import { template, insert, use, delegateEvents } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, on, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { RadioButton } from '../components/radio-button.js';
import { ScrollArea } from '../components/scroll-area.js';
import { SimpleButton } from './simple-button.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<textarea class="w-full h-auto"></textarea>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto"><div class="flex flex-row"></div></div>`);
const ObjectEditorComponent = (props) => {
  let textArea;
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [jsonValue, setJsonValue] = createSignal("");
  function updateModel() {
    if (textArea && props.proxy) {
      props.proxy.value = JSON.parse(textArea.value);
    }
  }
  function forceRefresh() {
    if (props.proxy) {
      const value = props.proxy.value;
      const json = JSON.stringify(value, null, 2);
      setJsonValue(json);
    }
  }
  createEffect(() => {
    if (autoRefresh() && props.proxy) {
      const json = JSON.stringify(props.proxy.value, null, 2);
      setJsonValue(json);
    }
  });
  createEffect(on(() => jsonValue(), updateTextAreaSize));
  function updateTextAreaSize() {
    waitForLayout(() => {
      if (textArea) {
        textArea.style.height = `${textArea?.scrollHeight}px`;
      }
    });
  }
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(RadioButton, {
      "class": "mx-1 my-2",
      get isChecked() {
        return autoRefresh();
      },
      onActivate: () => setAutoRefresh((v) => !v),
      children: "Auto"
    }), null);
    insert(_el$2, createComponent(SimpleButton, {
      "class": "ml-4 mr-2 my-2",
      onActivate: forceRefresh,
      children: "Refresh"
    }), null);
    insert(_el$2, createComponent(SimpleButton, {
      "class": "m-2",
      onActivate: updateModel,
      children: "Push"
    }), null);
    insert(_el$, createComponent(ScrollArea, {
      "class": "flex-auto m-2",
      get children() {
        var _el$3 = _tmpl$();
        _el$3.$$input = updateTextAreaSize;
        use((r) => textArea = r, _el$3);
        insert(_el$3, jsonValue);
        return _el$3;
      }
    }), null);
    return _el$;
  })();
};
const ObjectEditor = ComponentRegistry.register({
  name: "ObjectEditor",
  createInstance: ObjectEditorComponent
});
delegateEvents(["input"]);

export { ObjectEditor, ObjectEditorComponent };
//# sourceMappingURL=object-editor.js.map
