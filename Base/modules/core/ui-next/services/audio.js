import { createEffect, createContext } from '../../vendor/solid-js/dist/solid.js';
import { createJsonResource } from '../utilities/async-load.js';
import audioBase from '../../ui/audio-base/audio-base.json.js';

const [audioData] = createJsonResource(audioBase);
createEffect(() => {
  if (audioData.error) {
    console.error("Error loading audio-base.json", audioData.error);
  }
});
function playSound(id, group) {
  if (audioData.loading || audioData.error) {
    return false;
  }
  const data = audioData();
  if (id.length == 0 || id == "none" || !data) {
    return false;
  }
  const soundTag = group ? data[group]?.[id] ?? data["audio-base"][id] : data["audio-base"][id];
  if (soundTag) {
    UI.sendAudioEvent(soundTag);
    return true;
  } else {
    console.error(`No sound tag found for ${id} with group ${group}`);
  }
  return false;
}
class AudioGroupProvider {
  constructor(groupName, parent) {
    this.groupName = groupName;
    this.parent = parent;
  }
  /**
   * Plays a sound for the given audio group context.
   * If the sound is overridden on the element, play it directly.
   * Otherwise, look it up in the audio data and play that.
   * If the sound is still unable to be played, try again in the parent context.
   * @param id The sound id to play
   * @param element the element playing the sound
   */
  playSound(id, element) {
    const resolvedId = element?.getAttribute(`${id}-ref`) ?? id;
    const resolvedGroup = element?.getAttribute("data-audio-group-ref") ?? this.groupName;
    if (!playSound(resolvedId, resolvedGroup)) {
      this.parent?.playSound(resolvedId, element);
    }
  }
}
const AudioGroupContext = createContext(() => new AudioGroupProvider("audio-base"));

export { AudioGroupContext, AudioGroupProvider, playSound };
//# sourceMappingURL=audio.js.map
