// Hands-free listening for Voice Ticket: the microphone stays open, but only SPEECH leaves the device.
// Energy-based voice detection runs locally (no network, no cost). A sentence starts when the level
// rises clearly above the room's noise, ends after a short pause, and is handed over as a small
// 16 kHz mono WAV (with a little pre-roll so the first word is not clipped). Silence, coughs and
// clatter shorter than a word are never sent. After a long quiet stretch the session ends itself.

const TARGET_RATE = 16000;

function encodeWav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

function downsample(chunk, fromRate) {
  if (fromRate === TARGET_RATE) return chunk;
  const ratio = fromRate / TARGET_RATE;
  const out = new Float32Array(Math.floor(chunk.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio); const end = Math.min(chunk.length, Math.floor((i + 1) * ratio));
    let sum = 0; for (let j = start; j < end; j++) sum += chunk[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

/**
 * Start a hands-free session.
 * @returns {Promise<{ stop: Function, pause: Function, resume: Function }>}
 * opts: onSegment(blob, { ms }), onLevels(number[14]), onSpeaking(bool), onIdle(), idleMs, endSilenceMs
 */
export async function startVadSession({
  onSegment, onLevels, onSpeaking, onIdle,
  idleMs = 20000, endSilenceMs = 900, minSpeechMs = 350, maxSegmentMs = 15000, prerollMs = 350,
} = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  try { await ctx.resume(); } catch { /* user gesture already given */ }
  const src = ctx.createMediaStreamSource(stream);
  const an = ctx.createAnalyser(); an.fftSize = 64;
  src.connect(an);
  const proc = ctx.createScriptProcessor(2048, 1, 1);
  src.connect(proc); proc.connect(ctx.destination); // must be connected to run; outputs silence

  const rate = ctx.sampleRate;
  const frameMs = (2048 / rate) * 1000;
  let noise = 0.01;           // running noise floor (RMS)
  let speaking = false;
  let paused = false;
  let stopped = false;
  let voicedMs = 0;
  let quietMs = 0;
  let segMs = 0;
  let lastSpeech = Date.now();
  const pre = [];             // pre-roll ring (downsampled frames)
  let preMs = 0;
  let seg = [];

  const finish = () => {
    const keep = voicedMs >= minSpeechMs;
    const frames = seg; seg = []; segMs = 0; voicedMs = 0; quietMs = 0;
    if (speaking) { speaking = false; onSpeaking && onSpeaking(false); }
    if (!keep) return; // a blip, not a sentence — never sent
    let n = 0; frames.forEach((f) => { n += f.length; });
    const all = new Float32Array(n); let o = 0; frames.forEach((f) => { all.set(f, o); o += f.length; });
    onSegment && onSegment(encodeWav(all, TARGET_RATE), { ms: Math.round((n / TARGET_RATE) * 1000) });
  };

  proc.onaudioprocess = (e) => {
    if (stopped) return;
    const input = e.inputBuffer.getChannelData(0);
    let sum = 0; for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
    const rms = Math.sqrt(sum / input.length);
    const small = downsample(input, rate);
    if (paused) { pre.length = 0; preMs = 0; return; }
    const threshold = Math.max(0.012, noise * 3.2);
    const loud = rms > threshold;
    if (!speaking) {
      // learn the room while nobody talks (slowly, and never from speech)
      if (!loud) noise = noise * 0.95 + rms * 0.05;
      pre.push(small); preMs += frameMs;
      while (preMs > prerollMs && pre.length > 1) { pre.shift(); preMs -= frameMs; }
      if (loud) {
        speaking = true; onSpeaking && onSpeaking(true);
        seg = pre.splice(0); preMs = 0; segMs = 0; voicedMs = frameMs; quietMs = 0;
        lastSpeech = Date.now();
      } else if (Date.now() - lastSpeech > idleMs) {
        onIdle && onIdle();
      }
      return;
    }
    seg.push(small); segMs += frameMs;
    if (loud) { voicedMs += frameMs; quietMs = 0; lastSpeech = Date.now(); } else quietMs += frameMs;
    if (quietMs >= endSilenceMs || segMs >= maxSegmentMs) finish();
  };

  // level bars for the UI
  let raf = 0;
  const data = new Uint8Array(an.frequencyBinCount);
  const loop = () => {
    if (stopped) return;
    an.getByteFrequencyData(data);
    onLevels && onLevels(Array.from({ length: 14 }, (_, i) => Math.max(0.08, Math.min(1, (data[i + 2] || 0) / 200))));
    raf = requestAnimationFrame(loop);
  };
  loop();

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      try { proc.disconnect(); src.disconnect(); } catch { /* gone */ }
      stream.getTracks().forEach((t) => t.stop());
      try { ctx.close(); } catch { /* gone */ }
    },
    // while the device is speaking a reply (so it does not hear itself) or a request is in flight
    pause() { paused = true; if (speaking) { seg = []; voicedMs = 0; speaking = false; onSpeaking && onSpeaking(false); } },
    resume() { paused = false; lastSpeech = Date.now(); },
  };
}

export const __test = { encodeWav, downsample };
