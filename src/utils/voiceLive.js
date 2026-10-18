// Live two-way voice for Voice Ticket (restaurant.voiceAi.engine === 'live').
// The browser talks straight to the realtime model over WebRTC with a short-lived key from our server
// (POST /api/voice-ticket/:rid/live-session — the menu, rules and tools are baked into that key).
// The model never edits the order by itself: its tool calls come here, go through our server's menu
// checks (POST …/live-tool) and the screen applies the checked ops; send / cancel run the screen's own
// send flow (same order + KOT path as everywhere). Live captions both ways + audio levels for the orb.

import apiClient from '../lib/api';

export async function startLiveVoice({
  restaurantId,
  getDraft,          // () => current ticket (for the model's context + tool checks)
  onOps,             // (ops) => void  — apply checked ops to the ticket
  onSend,            // async () => 'what to tell the model' (e.g. 'Sent as order #12' / 'Failed: …')
  onCancel,          // () => void
  onState,           // ('connecting'|'listening'|'hearing'|'thinking'|'speaking'|'ended') => void
  onYou,             // (text, final) => void   live caption of the staff
  onAi,              // (text, final) => void   live caption of the assistant
  onTool,            // ({ name, output }) => void
  onError,           // (message) => void
  onEnd,             // (reason) => void
}) {
  onState && onState('connecting');
  // Declared up front: stop() can run while setup is still going (a failure half-way) and must
  // always release the mic / connection.
  let cap = null;
  let pc = null;
  let mic = null;
  let meters = null;
  let dc = null;
  let ended = false;
  const started = Date.now();
  const usage = { audioIn: 0, audioOut: 0, textIn: 0, cached: 0, textOut: 0 };
  const audioEl = document.createElement('audio');
  const ses = await apiClient.request(`/api/voice-ticket/${restaurantId}/live-session`, { method: 'POST', body: { draft: getDraft && getDraft() } });
  if (!ses || !ses.success || !ses.key) throw new Error((ses && ses.error) || 'Could not start the live voice');

  pc = new RTCPeerConnection();
  audioEl.autoplay = true;
  audioEl.setAttribute('playsinline', '');
  let remoteStream = null;
  pc.ontrack = (e) => { remoteStream = e.streams[0]; audioEl.srcObject = remoteStream; if (meters) meters.attachRemote(remoteStream); };

  try {
    mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (e) { stop('failed'); throw e; }
  mic.getTracks().forEach((t) => pc.addTrack(t, mic));
  meters = makeMeters(mic);

  dc = pc.createDataChannel('oai-events');
  let you = '';
  let ai = '';
  const sendEvt = (o) => { try { if (dc && dc.readyState === 'open') dc.send(JSON.stringify(o)); } catch { /* closed */ } };

  // Tool calls run ONE AFTER ANOTHER in the order the model made them ("add a coke and send it" =
  // update_order then send_order — the send must see the coke). Their outputs go back as they finish;
  // ONE response.create follows once the model's turn is done and every tool has answered.
  let toolChain = Promise.resolve();
  let toolsPending = 0;
  let needReply = false;
  let turnDone = false;
  const maybeReply = () => {
    if (needReply && turnDone && toolsPending === 0) { needReply = false; sendEvt({ type: 'response.create' }); }
  };
  const toolOutput = (callId, output) => {
    sendEvt({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: callId, output: String(output).slice(0, 4000) } });
  };
  const queueTool = (name, callId, argsText) => {
    toolsPending++; needReply = true;
    toolChain = toolChain.then(() => runTool(name, callId, argsText)).catch(() => {}).then(() => { toolsPending--; maybeReply(); });
  };

  const runTool = async (name, callId, argsText) => {
    onState && onState('thinking');
    let output = '';
    try {
      if (name === 'send_order') output = await onSend();
      else if (name === 'cancel_order') { onCancel && onCancel(); output = 'Order cleared.'; }
      else {
        const res = await apiClient.request(`/api/voice-ticket/${restaurantId}/live-tool`, { method: 'POST', body: { name, args: argsText, draft: getDraft && getDraft(), transcript: you } });
        if (!res || !res.success) throw new Error((res && res.error) || 'failed');
        if (res.ops) onOps && onOps(res.ops);
        output = res.output || 'Done.';
      }
    } catch (e) {
      output = `That did not work: ${e && e.message ? e.message : 'error'}. Tell the staff briefly.`;
    }
    onTool && onTool({ name, output });
    toolOutput(callId, output);
  };

  dc.onmessage = (m) => {
    let ev; try { ev = JSON.parse(m.data); } catch { return; }
    switch (ev.type) {
      case 'input_audio_buffer.speech_started': you = ''; onState && onState('hearing'); onYou && onYou('', false); break;
      case 'input_audio_buffer.speech_stopped': onState && onState('thinking'); break;
      case 'conversation.item.input_audio_transcription.delta': you += ev.delta || ''; onYou && onYou(you, false); break;
      case 'conversation.item.input_audio_transcription.completed': you = String(ev.transcript || you).trim(); onYou && onYou(you, true); break;
      case 'response.created': ai = ''; turnDone = false; break;
      case 'response.output_audio_transcript.delta': ai += ev.delta || ''; onAi && onAi(ai, false); break;
      case 'response.output_audio_transcript.done': ai = String(ev.transcript || ai).trim(); onAi && onAi(ai, true); break;
      case 'output_audio_buffer.started': onState && onState('speaking'); break;
      case 'output_audio_buffer.stopped': case 'output_audio_buffer.cleared': onState && onState('listening'); break;
      case 'response.function_call_arguments.done': queueTool(ev.name, ev.call_id, ev.arguments || '{}'); break;
      case 'response.done': {
        turnDone = true; maybeReply();
        const u = ev.response && ev.response.usage;
        if (u) {
          const ind = u.input_token_details || {}; const outd = u.output_token_details || {};
          usage.audioIn += ind.audio_tokens || 0; usage.textIn += ind.text_tokens || 0; usage.cached += ind.cached_tokens || 0;
          usage.audioOut += outd.audio_tokens || 0; usage.textOut += outd.text_tokens || 0;
        }
        break;
      }
      case 'error': onError && onError((ev.error && ev.error.message) || 'Live voice error'); break;
      default: break;
    }
  };

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdpRes = await fetch(ses.callUrl || 'https://api.openai.com/v1/realtime/calls', {
      method: 'POST', body: offer.sdp, headers: { Authorization: `Bearer ${ses.key}`, 'Content-Type': 'application/sdp' },
    });
    if (!sdpRes.ok) throw new Error('Could not connect the live voice');
    await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });
    await new Promise((resolve) => { if (dc.readyState === 'open') resolve(); else dc.onopen = () => resolve(); setTimeout(resolve, 6000); });
  } catch (e) { stop('failed'); throw e; }
  if (ended) throw new Error('Live voice stopped');
  onState && onState('listening');

  cap = setTimeout(() => stop('time'), Math.max(1, ses.maxMinutes || 6) * 60 * 1000);
  // 'disconnected' usually recovers in a few seconds (Wi-Fi blip) — end only if it doesn't
  let dropTimer = null;
  pc.onconnectionstatechange = () => {
    const st = pc.connectionState;
    if (st === 'failed' || st === 'closed') stop('dropped');
    else if (st === 'disconnected') { clearTimeout(dropTimer); dropTimer = setTimeout(() => { if (pc.connectionState === 'disconnected') stop('dropped'); }, 8000); }
    else if (st === 'connected') clearTimeout(dropTimer);
  };

  function stop(reason = 'user') {
    if (ended) return;
    ended = true;
    clearTimeout(cap);
    try { if (dc) dc.close(); } catch { /* closed */ }
    try { if (pc) { pc.getSenders().forEach((s) => s.track && s.track.stop()); pc.close(); } } catch { /* closed */ }
    try { if (mic) mic.getTracks().forEach((t) => t.stop()); } catch { /* stopped */ }
    try { audioEl.srcObject = null; } catch { /* gone */ }
    if (meters) meters.stop();
    onState && onState('ended');
    const seconds = Math.round((Date.now() - started) / 1000);
    apiClient.request(`/api/voice-ticket/${restaurantId}/live-usage`, { method: 'POST', body: { seconds, usage } }).catch(() => {});
    onEnd && onEnd(reason);
  }

  return {
    stop,
    mute(on) { if (mic) mic.getAudioTracks().forEach((t) => { t.enabled = !on; }); },
    // tell the model about a change made by tap (so its picture of the order stays right)
    note(text) { sendEvt({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: `[POS note, do not reply] ${text}` }] } }); },
    levels: () => (meters ? meters.read() : { you: 0, ai: 0 }),
  };
}

// mic + assistant loudness (0..1) for the orb animation
function makeMeters(micStream) {
  let ctx = null; let micA = null; let remA = null; const buf = new Uint8Array(256);
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    micA = ctx.createAnalyser(); micA.fftSize = 512;
    ctx.createMediaStreamSource(micStream).connect(micA);
  } catch { /* meters are decoration */ }
  const level = (a) => {
    if (!a) return 0;
    a.getByteTimeDomainData(buf);
    let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
    return Math.min(1, Math.sqrt(sum / buf.length) * 4);
  };
  return {
    attachRemote(stream) {
      try { if (!ctx) return; remA = ctx.createAnalyser(); remA.fftSize = 512; ctx.createMediaStreamSource(stream).connect(remA); } catch { /* ignore */ }
    },
    read: () => ({ you: level(micA), ai: level(remA) }),
    stop() { try { ctx && ctx.close(); } catch { /* closed */ } },
  };
}

// Classic engine + "AI voice" answers: natural voice from our server (falls back to the device voice)
export async function playAiVoice(restaurantId, text, { onStart, onEnd } = {}) {
  const token = apiClient.getToken() || '';
  const base = apiClient.baseURL || '';
  const res = await fetch(`${base}/api/voice-ticket/${restaurantId}/speak`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('speak failed');
  const url = URL.createObjectURL(await res.blob());
  const a = new Audio(url);
  await new Promise((resolve) => {
    const done = () => { try { URL.revokeObjectURL(url); } catch { /* ignore */ } onEnd && onEnd(); resolve(); };
    a.onended = done; a.onerror = done;
    a.play().then(() => onStart && onStart()).catch(done);
  });
}
