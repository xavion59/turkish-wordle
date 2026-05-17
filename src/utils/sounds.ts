import { Audio } from 'expo-av';

type SoundName = 'keypress' | 'reveal' | 'win' | 'lose' | 'hint';

const soundFiles: Record<SoundName, any> = {
  keypress: require('../../assets/sounds/keypress.wav'),
  reveal: require('../../assets/sounds/reveal.wav'),
  win: require('../../assets/sounds/win.mp3'),
  lose: require('../../assets/sounds/lose.mp3'),
  hint: require('../../assets/sounds/hint.wav'),
};

let sounds: Record<SoundName, Audio.Sound | null> = {
  keypress: null,
  reveal: null,
  win: null,
  lose: null,
  hint: null,
};

let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export async function loadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    for (const [name, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
        sounds[name as SoundName] = sound;
      } catch {
        // Skip individual sound load failure
      }
    }
  } catch {
    // Audio mode setup failed
  }
}

export async function playSound(name: SoundName): Promise<void> {
  if (!enabled) return;
  const sound = sounds[name];
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {
    // Ignore play errors
  }
}

export async function unloadSounds(): Promise<void> {
  for (const name of Object.keys(sounds) as SoundName[]) {
    const sound = sounds[name];
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload errors
      }
      sounds[name] = null;
    }
  }
}
