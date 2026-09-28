import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, createSignal, mergeProps, createEffect, Show } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { useAudio } from '../services/audio-support.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const AccordianHeader = (props) => {
  const audioTrigger = useAudio();
  return createComponent(Activatable, {
    get ["class"]() {
      return `accordian-header w-full flex flex-row items-center relative group ${props.class ?? ""}`;
    },
    get style() {
      return props.style;
    },
    onActivate: () => {
      props.setIsCollapsed((value) => !value);
      if (props.isCollapsed()) {
        audioTrigger("dropdown-close");
      } else {
        audioTrigger("dropdown-open");
      }
    },
    "data-name": "accordian-header",
    audioComponentAlias: "AccordianHeader",
    get children() {
      return props.children;
    }
  });
};
function Accordian(props) {
  const [isCollapsed, setIsCollapsed] = createSignal(props.initialCollapsed ?? false);
  const defaultProps = mergeProps({
    expandedStyle: "expanded",
    collapsedStyle: "collapsed"
  }, props);
  createEffect(() => {
    if (props.setIsCollapsed) {
      props.setIsCollapsed(isCollapsed());
    }
  });
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `accordian flex flex-col ${isCollapsed() ? defaultProps.collapsedStyle : defaultProps.expandedStyle} ${props.class ?? ""}`;
      }
    }), false, true);
    insert(_el$, createComponent(AccordianHeader, {
      get ["class"]() {
        return props.headerClass;
      },
      get style() {
        return props.headerStyle;
      },
      isCollapsed,
      setIsCollapsed,
      get children() {
        return props.header;
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return !isCollapsed();
      },
      get children() {
        return props.children;
      }
    }), null);
    return _el$;
  })();
}

export { Accordian };
//# sourceMappingURL=accordian.js.map
