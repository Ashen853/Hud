/**
 * Futuristic Web Audio Synthesizer for Sierra-07 HUD
 * Procedurally generates futuristic sci-fi sound effects without external audio assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playLaserFire(fireMode: 'auto' | 'burst' | 'overcharge' = 'auto'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4500, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.16);

  if (fireMode === 'overcharge') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } else {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }
}

export function playEmptyDry(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(240, now);
  osc.frequency.setValueAtTime(180, now + 0.03);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

export function playReload(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Click 1: eject cell
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.exponentialRampToValueAtTime(80, now + 0.09);
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.1);

  // Mech hum & charge up
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(200, now + 0.2);
  osc2.frequency.exponentialRampToValueAtTime(880, now + 0.55);
  gain2.gain.setValueAtTime(0.01, now + 0.2);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.45);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.2);
  osc2.stop(now + 0.6);

  // Lock chamber click
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(1400, now + 0.58);
  osc3.frequency.exponentialRampToValueAtTime(600, now + 0.68);
  gain3.gain.setValueAtTime(0.25, now + 0.58);
  gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now + 0.58);
  osc3.stop(now + 0.7);
}

export function playDamage(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Impact thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);

  // Warning chirps
  const chirp = ctx.createOscillator();
  const chirpGain = ctx.createGain();
  chirp.type = 'sine';
  chirp.frequency.setValueAtTime(960, now + 0.1);
  chirp.frequency.setValueAtTime(740, now + 0.2);
  chirpGain.gain.setValueAtTime(0.15, now + 0.1);
  chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  chirp.connect(chirpGain);
  chirpGain.connect(ctx.destination);
  chirp.start(now + 0.1);
  chirp.stop(now + 0.35);
}

export function playHeal(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

export function playVisorBoot(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [440, 554, 659, 880];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.08;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.16);
  });
}
