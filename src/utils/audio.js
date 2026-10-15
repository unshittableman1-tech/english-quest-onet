// audio.js - Web Audio API Synthesizer for Game Feel

let audioCtx = null;
let bgmCtx = null;
let isBgmPlaying = false;
let nextNoteTime = 0;
let currentNoteIndex = 0;
let timerID;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.1) {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
  try {
    const ctx = initAudio();
    // Happy ding! Two quick rising tones
    playTone(659.25, 'sine', 0.15, 0.28); // E5
    setTimeout(() => playTone(880.00, 'sine', 0.3, 0.28), 100); // A5
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playWrongSound() {
  try {
    const ctx = initAudio();
    // Sad buzz
    playTone(300, 'sawtooth', 0.2, 0.14);
    setTimeout(() => playTone(250, 'sawtooth', 0.3, 0.14), 150);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playLevelUpSound() {
  try {
    const ctx = initAudio();
    // Fanfare! C - E - G - C
    playTone(523.25, 'square', 0.15, 0.14); // C5
    setTimeout(() => playTone(659.25, 'square', 0.15, 0.14), 150); // E5
    setTimeout(() => playTone(783.99, 'square', 0.15, 0.14), 300); // G5
    setTimeout(() => playTone(1046.50, 'square', 0.4, 0.14), 450); // C6
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

/**
 * Daily streak reward sound.
 * isMilestone=true  → warm 5-note chime (Day 3 / 5 / 7)
 * isMilestone=false → cheerful 3-note pop
 */
export function playStreakSound(isMilestone = false) {
  try {
    const ctx = initAudio();
    if (isMilestone) {
      // 🎵 Warm pentatonic chime: G4 A4 B4 D5 G5
      const notes = [392.00, 440.00, 493.88, 587.33, 783.99];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.5, 0.18);
          // Add a soft octave-up shimmer
          playTone(freq * 2, 'sine', 0.25, 0.07);
        }, i * 130);
      });
    } else {
      // 🎵 Bright pop: C5 E5 G5
      playTone(523.25, 'triangle', 0.25, 0.18); // C5
      setTimeout(() => playTone(659.25, 'triangle', 0.25, 0.18), 110); // E5
      setTimeout(() => playTone(783.99, 'triangle', 0.4,  0.18), 220); // G5
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}



export function playHoverSound() {
  try {
    // Very quick, soft pop
    playTone(800, 'sine', 0.05, 0.07);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playClickSound() {
  try {
    const ctx = initAudio();
    // A quick ascending blip
    playTone(400, 'triangle', 0.1, 0.14);
    setTimeout(() => playTone(600, 'triangle', 0.1, 0.14), 50);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function toggleBGM() {
  if (isBgmPlaying) {
    stopBGM();
    return false;
  } else {
    startBGM();
    return true;
  }
}

// --- BGM Sequencer Logic ---
const sequence = [
  // C Major bouncy arpeggio
  261.63, 392.00, 329.63, 392.00,
  // A minor bouncy arpeggio
  220.00, 329.63, 261.63, 329.63,
  // F Major bouncy arpeggio
  174.61, 261.63, 220.00, 261.63,
  // G Major bouncy arpeggio
  196.00, 293.66, 246.94, 293.66
];

function nextNote() {
  const tempo = 140; // Upbeat BPM
  const secondsPerBeat = 60.0 / tempo;
  nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
  currentNoteIndex++;
  if (currentNoteIndex === sequence.length) {
    currentNoteIndex = 0;
  }
}

function scheduleNote(beatNumber, time) {
  if (!bgmCtx) return;
  const osc = bgmCtx.createOscillator();
  const gain = bgmCtx.createGain();
  
  // Mix of square and sawtooth for synth-pop feel
  osc.type = beatNumber % 2 === 0 ? 'square' : 'sawtooth';
  osc.frequency.value = sequence[beatNumber] * 2; // Jump up an octave
  
  // Pluck envelope
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.08, time + 0.01); // Increased volume
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  
  osc.connect(gain);
  gain.connect(bgmCtx.destination);
  
  osc.start(time);
  osc.stop(time + 0.15);
}

function scheduler() {
  if (!isBgmPlaying || !bgmCtx) return;
  while (nextNoteTime < bgmCtx.currentTime + 0.1) {
    scheduleNote(currentNoteIndex, nextNoteTime);
    nextNote();
  }
  timerID = setTimeout(scheduler, 25);
}

function startBGM() {
  if (isBgmPlaying) return;
  try {
    bgmCtx = new (window.AudioContext || window.webkitAudioContext)();
    isBgmPlaying = true;
    
    if (bgmCtx.state === 'suspended') {
      bgmCtx.resume();
    }
    
    currentNoteIndex = 0;
    nextNoteTime = bgmCtx.currentTime + 0.05;
    scheduler();
    
  } catch(e) {
    console.warn("BGM failed", e);
    isBgmPlaying = false;
  }
}

function stopBGM() {
  if (!isBgmPlaying) return;
  isBgmPlaying = false;
  clearTimeout(timerID);
  
  if (bgmCtx && bgmCtx.state !== 'closed') {
    bgmCtx.close();
    bgmCtx = null;
  }
}

