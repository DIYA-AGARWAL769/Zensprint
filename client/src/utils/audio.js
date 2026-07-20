// Dynamic Web Audio API synthesizer for Zensprint notification sounds with custom audio URL playbacks
let audioCtx = null;
let playingUntil = 0;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Check if a string is a preset name
const PRESET_SOUNDS = ["Retro Beep", "Zen Bell", "System Alarm", "Brass Horn"];

function isPreset(sound) {
  return PRESET_SOUNDS.includes(sound);
}

// Check if any sound is currently active (playing or speech speaking)
export function isSoundActive() {
  const now = Date.now();
  const synthSpeaking = typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking;
  return now < playingUntil || synthSpeaking;
}

// Lock future sounds from playing for a duration in milliseconds
export function lockSound(durationMs) {
  playingUntil = Date.now() + durationMs;
}

// 1. Success Sound: A pleasant rising major chord arpeggio
export function playSuccessSound(sound) {
  if (isSoundActive()) return;

  if (sound && typeof sound === "string" && sound.trim() !== "") {
    const trimmed = sound.trim();
    if (isPreset(trimmed)) {
      playPresetSound(trimmed, "success");
      return;
    }
    try {
      const audio = new Audio(trimmed);
      audio.volume = 0.5;
      audio.play();
      audio.addEventListener("loadedmetadata", () => {
        lockSound((audio.duration || 1.5) * 1000);
      });
      lockSound(1500); // safe fallback lock
      return;
    } catch (e) {
      console.warn("Failed to play custom success audio URL, falling back to synth:", e);
    }
  }

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playDefaultSuccess(ctx, now);
    lockSound(700);
  } catch (e) {
    console.error("Failed to play success sound:", e);
  }
}

function playDefaultSuccess(ctx, now) {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.35);
  });
}

// 2. Roast Sound: A descending, discordant flat buzzer tone
export function playRoastSound(sound) {
  if (isSoundActive()) return;

  if (sound && typeof sound === "string" && sound.trim() !== "") {
    const trimmed = sound.trim();
    if (isPreset(trimmed)) {
      playPresetSound(trimmed, "roast");
      return;
    }
    try {
      const audio = new Audio(trimmed);
      audio.volume = 0.5;
      audio.play();
      audio.addEventListener("loadedmetadata", () => {
        lockSound((audio.duration || 1.5) * 1000);
      });
      lockSound(1500); // safe fallback lock
      return;
    } catch (e) {
      console.warn("Failed to play custom roast audio URL, falling back to synth:", e);
    }
  }

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playDefaultRoast(ctx, now);
    lockSound(450);
  } catch (e) {
    console.error("Failed to play roast sound:", e);
  }
}

function playDefaultRoast(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.linearRampToValueAtTime(60, now + 0.4);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

// 3. Supportive Sound: A warm, uplifting major-key arpeggio
export function playSupportiveSound(sound) {
  if (isSoundActive()) return;

  if (sound && typeof sound === "string" && sound.trim() !== "") {
    const trimmed = sound.trim();
    if (isPreset(trimmed)) {
      playPresetSound(trimmed, "supportive");
      return;
    }
    try {
      const audio = new Audio(trimmed);
      audio.volume = 0.5;
      audio.play();
      audio.addEventListener("loadedmetadata", () => {
        lockSound((audio.duration || 1.5) * 1000);
      });
      lockSound(1500); // safe fallback lock
      return;
    } catch (e) {
      console.warn("Failed to play custom supportive audio URL, falling back to synth:", e);
    }
  }

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playDefaultSupportive(ctx, now);
    lockSound(950);
  } catch (e) {
    console.error("Failed to play supportive sound:", e);
  }
}

function playDefaultSupportive(ctx, now) {
  const notes = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.1);

    gain.gain.setValueAtTime(0, now + index * 0.1);
    gain.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.1);
    osc.stop(now + index * 0.1 + 0.5);
  });
}

// 4. Start Sound: An energetic rising frequency sweep
export function playStartSound() {
  if (isSoundActive()) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
    lockSound(350);
  } catch (e) {
    console.error("Failed to play start sound:", e);
  }
}

// 5. Warning Sound: A short warning beep
export function playWarningSound() {
  if (isSoundActive()) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
    lockSound(150);
  } catch (e) {
    console.error("Failed to play warning sound:", e);
  }
}

// 6. Preset Sounds Synthesizers
export function playPresetSound(presetName, contextType = "roast") {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (presetName === "Retro Beep") {
      lockSound(200);
      // 8-bit double beep
      [0, 0.1].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(987.77, now + delay); // B5
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    } else if (presetName === "Zen Bell") {
      lockSound(2000);
      // Warm, ringing bowl chime
      const freqs = [220, 330, 440, 550]; // fundamental + overtones
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        
        gain.gain.setValueAtTime(0, now);
        const decay = 2.0 - (idx * 0.4);
        gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + decay);
      });
    } else if (presetName === "System Alarm") {
      lockSound(650);
      // Rapid pulse wailing alarm
      const duration = 0.6;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(350, now);
      
      // Sweep pitch up and down quickly
      for (let t = 0; t < duration; t += 0.1) {
        osc.frequency.setValueAtTime(t % 0.2 === 0 ? 580 : 380, now + t);
      }
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } else if (presetName === "Brass Horn") {
      lockSound(600);
      // Discordant horn buzz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(110, now); // A2
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(112, now); // detune
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } else {
      // Fallback
      if (contextType === "success") {
        playDefaultSuccess(ctx, now);
        lockSound(700);
      } else if (contextType === "supportive") {
        playDefaultSupportive(ctx, now);
        lockSound(950);
      } else {
        playDefaultRoast(ctx, now);
        lockSound(450);
      }
    }
  } catch (e) {
    console.error("Error playing preset sound:", e);
  }
}

// 7. Text-to-Speech Roast Reader
export function speakRoast(text) {
  if (isSoundActive()) return;

  try {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech first so they don't overlap
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 0.8;
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // slightly lower pitch for a dry, sarcastic tone
      
      // Optionally try to find a robotic/british voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes("Google UK English Male") || 
        v.name.includes("Microsoft David") || 
        v.name.includes("Male") ||
        v.lang.startsWith("en-GB")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.max(1500, wordCount * 280 + 500); // 280ms per word + 500ms padding
      lockSound(estimatedDuration);

      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("Text-to-speech failed:", e);
  }
}

// ============================================================================
// 8. CONTINUOUS BACKGROUND ALARM — PERMANENTLY RUNNING OSCILLATOR APPROACH
// ============================================================================
//
// WHY THIS WORKS when everything else fails:
//   - Chrome throttles setInterval to 1/min in background tabs → no timer-based beeps
//   - Chrome blocks new Audio.play() from background tabs → no HTML5 audio fallback
//   - Chrome suspends muted audio elements → no muted pre-arm trick
//
// SOLUTION: Start a REAL oscillator during a user gesture. It runs FOREVER at
// gain=0 (silent). When the user switches tabs, we just set gain=0.4 (loud).
// Changing a gain parameter on an already-running oscillator works INSTANTLY
// in background tabs — no timers, no new audio, nothing to throttle.
// ============================================================================

let alarmOsc1 = null;
let alarmOsc2 = null;
let alarmGainNode = null;
let alarmArmed = false;
let customAlarmAudio = null;

// Called on any user click/keydown to arm the always-running silent oscillator
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Explicitly prompt for Notification permission during user interaction if not decided yet
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    // Only arm once
    if (alarmArmed) return;
    alarmArmed = true;

    // Create a gain node at 0 volume (silent)
    alarmGainNode = ctx.createGain();
    alarmGainNode.gain.setValueAtTime(0, ctx.currentTime);
    alarmGainNode.connect(ctx.destination);

    // Oscillator 1: 880Hz sawtooth (urgent alarm tone)
    alarmOsc1 = ctx.createOscillator();
    alarmOsc1.type = "sawtooth";
    alarmOsc1.frequency.setValueAtTime(880, ctx.currentTime);
    alarmOsc1.connect(alarmGainNode);
    alarmOsc1.start();

    // Oscillator 2: 885Hz sawtooth (slight detune for pulsing/beating effect)
    alarmOsc2 = ctx.createOscillator();
    alarmOsc2.type = "sawtooth";
    alarmOsc2.frequency.setValueAtTime(885, ctx.currentTime);
    alarmOsc2.connect(alarmGainNode);
    alarmOsc2.start();

    console.log("ZenSprint alarm oscillator armed (silent, always running).");
  } catch (e) {
    console.warn("unlockAudio/arm alarm failed:", e);
  }
}

// Check if alarm oscillator is armed
export function isAlarmArmed() {
  return alarmArmed;
}

// Turn the already-running oscillator LOUD — works instantly even in background tabs
// customAlarmSoundUrl: optional preset name or URL for a custom alarm sound
export function startContinuousAlarm(customAlarmSoundUrl) {
  if (!alarmGainNode || !alarmArmed) {
    unlockAudio();
  }

  // 1. Always turn on the oscillator (guaranteed to work in background)
  try {
    if (alarmGainNode) {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      alarmGainNode.gain.cancelScheduledValues(ctx.currentTime);
      alarmGainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    }
  } catch (err) {
    console.warn("startContinuousAlarm oscillator error:", err);
  }

  // 2. If custom alarm sound is set, also play it via HTML5 Audio (looping)
  stopCustomAlarmAudio(); // stop any previous custom audio
  if (customAlarmSoundUrl && typeof customAlarmSoundUrl === "string" && customAlarmSoundUrl.trim() !== "") {
    try {
      const src = customAlarmSoundUrl.trim();
      // For presets, use the Web Audio preset player once (non-looping)
      if (PRESET_SOUNDS.includes(src)) {
        playPresetSound(src, "roast");
      } else {
        // Custom URL or data URI — play looping
        customAlarmAudio = new Audio(src);
        customAlarmAudio.loop = true;
        customAlarmAudio.volume = 0.8;
        customAlarmAudio.play().catch((e) => console.warn("Custom alarm audio play failed:", e));
      }
    } catch (err) {
      console.warn("Custom alarm sound error:", err);
    }
  }
}

function stopCustomAlarmAudio() {
  if (customAlarmAudio) {
    try {
      customAlarmAudio.pause();
      customAlarmAudio.currentTime = 0;
      customAlarmAudio.src = "";
    } catch (e) {}
    customAlarmAudio = null;
  }
}

// Turn the oscillator back to silent — instant stop
export function stopContinuousAlarm() {
  try {
    if (alarmGainNode) {
      const ctx = getAudioContext();
      alarmGainNode.gain.cancelScheduledValues(ctx.currentTime);
      alarmGainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
    }
  } catch (err) {
    console.warn("stopContinuousAlarm error:", err);
  }

  stopCustomAlarmAudio();

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// 9. Desktop Notification Helper
export function showDesktopNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    if (Notification.permission === "granted") {
      new Notification(title, { 
        body, 
        icon: "/favicon.svg",
        requireInteraction: true,
        tag: "zensprint-tab-switch" 
      });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "/favicon.svg", tag: "zensprint-tab-switch" });
        }
      });
    } else {
      console.warn("Desktop notifications disabled by user browser permission.");
    }
  } catch (err) {
    console.warn("Desktop notification failed:", err);
  }
}
