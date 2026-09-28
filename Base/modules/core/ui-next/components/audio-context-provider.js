import '../../vendor/solid-js/web/dist/web.js';
import { useContext, createMemo, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { AudioContext, compileAudioRules } from '../services/audio-support.js';

const AudioContextProvider = (props) => {
  const parent = useContext(AudioContext);
  const currentPath = createMemo(() => [parent.path(), props.segment].filter((p) => p).join("/"));
  const currentVars = createMemo(() => {
    return {
      ...parent.vars(),
      ...props.vars
    };
  });
  const currentTree = createMemo(() => props.rules ? compileAudioRules(props.rules) : parent.tree());
  return createComponent(AudioContext.Provider, {
    value: {
      path: currentPath,
      vars: currentVars,
      tree: currentTree
    },
    get children() {
      return props.children;
    }
  });
};

export { AudioContextProvider };
//# sourceMappingURL=audio-context-provider.js.map
