'use strict';

// Encouragement stays on the device. Only installed, local speech voices are used.
const catCoach = (() => {
  // Keep the familiar written nickname separate from the speech pronunciation hint.
  const learners = {
    '1': { name: 'Sarity', spoken: 'Sarithee' },
    '3': { name: 'Kiya', spoken: 'Kia' }
  };
  let learner = learners['1'];
  let currentGrade = '1';
  const messages = {
    welcome: ['Hi, I’m Sunny the cat! I believe in you. Let’s learn one little step at a time.'],
    missed: [
      'One missed question does not change how wonderful you are. You can learn this. Let’s look at the answer together.',
      'You don’t have to know it yet. Try saying: I can learn with practice. I believe in you!',
      'That was a brave try! Take your time, look for a clue, and ask a grown-up if you need help.',
      'Being smart doesn’t mean getting every answer right. Asking questions and trying new ways help you grow.'
    ],
    boost: [
      'Here’s a Daddy-style cheer: I’m proud of you for trying. You don’t need a perfect score to make me smile.',
      'You can do hard things, one small step at a time. Try saying: I believe in myself. I can keep learning!',
      'You have wonderful ideas! Keep asking questions and practicing. You can work toward your own best.',
      'Feeling frustrated is okay. Relax your shoulders, take a gentle breath, and ask for help when you need it.',
      'You matter more than any score. Take a little break if you want. Your adventure will be here when you’re ready.'
    ],
    idle: ['Thinking time is welcome here. Wiggle your fingers, take a gentle breath, or have a little break. You can do this at your own pace.'],
    success: ['You tried a strategy and found it! Keep believing in yourself.', 'Lovely work! Every little discovery is something to celebrate.'],
    complete: ['Look at all the exploring you did! Be proud of your effort. Keep being curious and working toward your own best.']
  };
  const positions = {};
  let enabled = false;
  let active = false;
  let idleShown = false;
  let idleTimer;
  let speechToken = 0;
  let current = messages.welcome[0];
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const panel = document.createElement('aside');
  panel.className = 'cat-coach';
  panel.setAttribute('aria-label', 'Sunny the encouraging cat');
  panel.innerHTML = `<div class="cat-face" aria-hidden="true">🐱<span>Sunny</span></div><div class="cat-content"><strong>Your little cheer buddy</strong><p id="cat-message" role="status" aria-live="polite"></p><div class="cat-actions"><button type="button" id="cat-boost">💛 I need a little cheer</button><button type="button" id="cat-voice" aria-pressed="false">🔈 Turn voice on</button><button type="button" id="cat-repeat" hidden>🔊 Hear again</button></div><small id="cat-voice-note">Tap voice on to hear Sunny. You can turn it off anytime.</small></div>`;
  const message = panel.querySelector('#cat-message');
  const voiceButton = panel.querySelector('#cat-voice');
  const repeatButton = panel.querySelector('#cat-repeat');
  const note = panel.querySelector('#cat-voice-note');
  const daddyButton = document.createElement('button');
  daddyButton.type = 'button';
  daddyButton.id = 'cat-daddy';
  daddyButton.textContent = '💛 Hear Daddy';
  daddyButton.hidden = true;
  panel.querySelector('.cat-actions').append(daddyButton);
  function updateDaddy() { daddyButton.hidden = !daddyVoice.has(currentGrade); }
  document.addEventListener('daddy-voice-change', updateDaddy);
  daddyButton.addEventListener('click', async () => {
    stopSpeech();
    const played = await daddyVoice.play(currentGrade);
    note.textContent = played ? 'Playing your saved cheer from Daddy.' : 'The recording could not play. Please try again.';
  });
  function showMessage() { message.textContent = `${learner.name}, ${current}`; }
  showMessage();
  function stopSpeech() {
    daddyVoice.stop();
    speechToken++;
    if (supported) window.speechSynthesis.cancel();
    panel.classList.remove('speaking');
  }
  function localVoice() {
    if (!supported) return null;
    return window.speechSynthesis.getVoices().find(voice => voice.localService && /^en(?:-|$)/i.test(voice.lang));
  }
  function speak() {
    stopSpeech();
    if (!enabled || document.hidden) return;
    const voice = localVoice();
    if (!voice) {
      note.textContent = 'A device English voice is not ready. You can still read Sunny’s cheers. Try Hear again after enabling an English voice in your device settings.';
      return;
    }
    note.textContent = 'Voice is on. Sunny uses an English voice installed on this device.';
    const token = speechToken;
    const utterance = new SpeechSynthesisUtterance(`${learner.spoken}, ${current}`);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.88;
    utterance.pitch = 1.12;
    utterance.onstart = () => { if (token === speechToken) panel.classList.add('speaking'); };
    utterance.onend = () => { if (token === speechToken) panel.classList.remove('speaking'); };
    utterance.onerror = () => {
      if (token !== speechToken) return;
      panel.classList.remove('speaking');
      note.textContent = 'Voice could not play. Tap Hear again, or enjoy the written cheer.';
    };
    try { window.speechSynthesis.speak(utterance); }
    catch (_) { note.textContent = 'Voice could not play. Sunny’s written cheers are still here for you.'; }
  }
  function say(kind) {
    const list = messages[kind];
    const index = positions[kind] || 0;
    current = list[index % list.length];
    positions[kind] = index + 1;
    showMessage();
    speak();
  }
  function welcome() {
    stopSpeech();
    if (document.hidden) return;
    const voice = localVoice();
    if (!voice) {
      note.textContent = 'Welcome to Daddy’s Super Kids game! An installed English voice is needed to hear the welcome.';
      return;
    }
    const token = speechToken;
    const greeting = new SpeechSynthesisUtterance('Welcome to Daddy’s Super Kids game! Let’s learn, play, and have fun!');
    greeting.voice = voice;
    greeting.lang = voice.lang;
    greeting.rate = 0.9;
    greeting.pitch = 1.12;
    greeting.volume = 1;
    greeting.onstart = () => { if (token === speechToken) panel.classList.add('speaking'); };
    greeting.onend = () => { if (token === speechToken) panel.classList.remove('speaking'); };
    greeting.onerror = () => {
      if (token !== speechToken) return;
      panel.classList.remove('speaking');
      note.textContent = 'Tap Hear the welcome to start the greeting. Your browser may need a tap before playing audio.';
    };
    note.textContent = 'Welcome! If you don’t hear the greeting, tap Hear the welcome. Other cheers stay quiet until you turn voice on.';
    try { window.speechSynthesis.speak(greeting); }
    catch (_) { greeting.onerror(); }
  }
  document.addEventListener('DOMContentLoaded', welcome, { once: true });
  function resetIdle() {
    clearTimeout(idleTimer);
    if (!active || idleShown || document.hidden || document.querySelector('dialog[open]')) return;
    idleTimer = setTimeout(() => {
      if (!active || document.hidden || document.querySelector('dialog[open]')) return;
      idleShown = true;
      say('idle');
    }, 75000);
  }
  function mount(anchor, playing = false, grade = '1') {
    stopSpeech();
    clearTimeout(idleTimer);
    active = playing;
    idleShown = false;
    learner = learners[grade] || learners['1'];
    currentGrade = grade;
    updateDaddy();
    anchor.after(panel);
    current = playing ? 'I believe in you! Take your time, look for clues, and remember: you can ask for help.' : messages.welcome[0];
    showMessage();
    resetIdle();
  }
  function feedback(kind, finished = false) {
    if (finished) { active = false; clearTimeout(idleTimer); }
    say(kind);
  }
  panel.querySelector('#cat-boost').addEventListener('click', () => say('boost'));
  voiceButton.addEventListener('click', () => {
    enabled = !enabled;
    voiceButton.setAttribute('aria-pressed', String(enabled));
    voiceButton.textContent = enabled ? '🔇 Turn voice off' : '🔈 Turn voice on';
    repeatButton.hidden = !enabled;
    if (enabled) speak();
    else { stopSpeech(); note.textContent = 'Voice is off. Sunny’s written cheers are always here.'; }
  });
  repeatButton.addEventListener('click', speak);
  if (!supported) {
    voiceButton.disabled = true;
    voiceButton.textContent = 'Voice unavailable';
    note.textContent = 'This browser does not support voice. Enjoy Sunny’s written cheers.';
  }
  for (const event of ['pointerdown', 'keydown', 'input', 'scroll']) document.addEventListener(event, resetIdle, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => { stopSpeech(); resetIdle(); });
  window.addEventListener('pagehide', () => { stopSpeech(); clearTimeout(idleTimer); });
  return { mount, feedback, welcome, pause: () => { stopSpeech(); clearTimeout(idleTimer); }, resume: resetIdle };
})();
