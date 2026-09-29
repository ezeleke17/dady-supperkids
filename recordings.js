'use strict';

const daddyVoice = (() => {
  const clips = new Map();
  const select = document.querySelector('#record-grade');
  const start = document.querySelector('#record-start');
  const stop = document.querySelector('#record-stop');
  const save = document.querySelector('#record-save');
  const remove = document.querySelector('#record-delete');
  const preview = document.querySelector('#record-preview');
  const status = document.querySelector('#record-status');
  const player = new Audio();
  let db, recorder, stream, deadline, draft, previewUrl, playUrl;
  let busy = false;
  let cancelled = false;
  const available = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  function halt() { player.pause(); preview.pause(); }
  function update(message) {
    start.disabled = busy || !available;
    stop.disabled = !busy || !recorder || recorder.state !== 'recording';
    select.disabled = busy;
    save.disabled = busy || !draft || !db;
    remove.disabled = busy || (!draft && !clips.has(select.value));
    if (message) status.textContent = message;
    document.dispatchEvent(new Event('daddy-voice-change'));
  }
  function showPreview(blob) {
    preview.pause();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    preview.removeAttribute('src');
    preview.hidden = !blob;
    if (blob) { previewUrl = URL.createObjectURL(blob); preview.src = previewUrl; }
  }
  function release() {
    clearTimeout(deadline);
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
  }
  function finish(discard = false) {
    cancelled = discard;
    if (recorder?.state === 'recording') recorder.stop();
    release();
  }
  function store(blob) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cheers', 'readwrite');
      const data = tx.objectStore('cheers');
      if (blob) data.put(blob, select.value); else data.delete(select.value);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  start.addEventListener('click', async () => {
    busy = true; cancelled = false;
    halt(); catCoach.pause();
    update('Allow microphone access to record your cheer.');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled || !document.querySelector('#settings').open || document.hidden) {
        release(); busy = false; update('Recording cancelled.'); return;
      }
      const chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => { finish(true); busy = false; update('Recording failed. Please try again.'); };
      recorder.onstop = () => {
        release(); busy = false;
        if (cancelled) { update('Recording cancelled. Your saved cheer is unchanged.'); return; }
        const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || 'audio/webm' });
        if (!blob.size) { update('No audio captured. Please try again.'); return; }
        draft = blob; showPreview(draft);
        update(db ? 'Listen to your cheer, then tap Save recording to keep it.' : 'Preview available, but browser storage is unavailable. This recording cannot be saved.');
      };
      recorder.start();
      update('Recording… Tap Stop when finished (30-second maximum).');
      deadline = setTimeout(() => finish(), 30000);
    } catch (_) {
      release(); busy = false;
      update('Microphone unavailable or permission denied. Allow microphone access in browser settings and try again. On tablets, open the game over HTTPS; on this computer, localhost also works.');
    }
  });
  stop.addEventListener('click', () => finish());
  save.addEventListener('click', async () => {
    busy = true; update();
    try { await store(draft); clips.set(select.value, draft); draft = null; update('Your cheer is saved on this device. Tap Hear Daddy on Sunny’s card to listen.'); }
    catch (_) { update('Could not save. Your preview is still available; try again.'); }
    finally { busy = false; update(); }
  });
  remove.addEventListener('click', async () => {
    busy = true; halt(); update();
    try {
      if (clips.has(select.value)) await store(null);
      clips.delete(select.value); draft = null; showPreview(null); update('Recording deleted for this grade.');
    } catch (_) { update('Could not delete the saved recording. Please try again.'); }
    finally { busy = false; update(); }
  });
  select.addEventListener('change', () => {
    draft = null; showPreview(clips.get(select.value));
    update(clips.has(select.value) ? 'A saved cheer is ready. Record again to replace it.' : 'Ready for your first cheer.');
  });
  function cleanup() { halt(); if (stream || busy) { cancelled = true; finish(true); } }
  document.querySelector('#settings').addEventListener('close', cleanup);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cleanup(); });
  window.addEventListener('pagehide', cleanup);
  update(available ? 'Ready to record a cheer.' : 'Recording is unavailable here. Use a browser with microphone support over HTTPS or localhost.');
  try {
    const request = indexedDB.open('kids-learning-voice', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('cheers');
    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction('cheers');
      for (const grade of ['1', '3']) {
        const read = tx.objectStore('cheers').get(grade);
        read.onsuccess = () => { if (read.result instanceof Blob) clips.set(grade, read.result); };
      }
      tx.oncomplete = () => { showPreview(clips.get(select.value)); update(); };
    };
    request.onerror = () => update('Browser storage is unavailable. You can record a preview, but cannot save it.');
  } catch (_) { update('Browser storage is unavailable. You can record a preview, but cannot save it.'); }
  return {
    has: grade => clips.has(grade), stop: halt,
    async play(grade) {
      halt();
      if (!clips.has(grade)) return false;
      if (playUrl) URL.revokeObjectURL(playUrl);
      playUrl = URL.createObjectURL(clips.get(grade)); player.src = playUrl;
      try { await player.play(); return true; } catch (_) { return false; }
    }
  };
})();
