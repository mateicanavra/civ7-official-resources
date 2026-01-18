var Audio;
((Audio2) => {
  function getSoundTag(id, group) {
    if (!Component.audio) {
      return "";
    }
    const soundTag = group ? Component.audio[group]?.[id] ?? Component.audio["audio-base"][id] : Component.audio["audio-base"][id];
    return soundTag ?? "";
  }
  Audio2.getSoundTag = getSoundTag;
  function playSound(id, group) {
    const tag = getSoundTag(id, group);
    if (tag) {
      UI.sendAudioEvent(tag);
    }
  }
  Audio2.playSound = playSound;
})(Audio || (Audio = {}));

export { Audio as A };
//# sourceMappingURL=audio-support.chunk.js.map
