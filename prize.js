'use strict';

// A single, optional two-minute play break. No points or penalties.
const prizeGame = (() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'prize-dialog';
  dialog.setAttribute('aria-labelledby', 'prize-title');
  document.body.append(dialog);
  let timer, endsAt = 0, running = false;
  const friends = ['🐸', '🐱', '🐶', '🐵', '🦄', '🐷', '🐥', '🐙', '🦊'];
  const jokes = ['Boing! My socks just turned into bananas! 🍌', 'Meow! I ordered a pizza with extra giggles! 🍕', 'Wiggle, wiggle… jelly knees! 🍮', 'Who put a pancake on my head? 🥞', 'Beep beep! The duck bus is here! 🦆', 'I’m a very serious dancing potato! 🥔', 'Hiccup! That tickled my whiskers! 🌈'];
  let giggles = 0;
  function close() { clearInterval(timer); running = false; catCoach.pause(); catCoach.resume(); }
  function finish() {
    clearInterval(timer); running = false;
    dialog.querySelector('#prize-clock').textContent = '0:00';
    dialog.querySelector('#prize-friends').hidden = true;
    dialog.querySelector('#prize-message').textContent = 'That was a lovely little break! Stretch your arms and come back when you’re ready. 🌈';
    dialog.querySelector('#prize-close').textContent = 'Back to my celebration ✨';
    dialog.querySelector('#prize-close').focus();
  }
  function tick() {
    if (!running) return;
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    dialog.querySelector('#prize-clock').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (!left) finish();
  }
  dialog.addEventListener('close', close);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pagehide', () => { close(); if (dialog.open) dialog.close(); });
  return {
    open() {
      if (dialog.open) return;
      catCoach.pause(); giggles = 0;
      dialog.innerHTML = `<div class="prize-top"><span>🎁 Your 10/10 treat</span><span aria-label="Break time remaining">⏳ <b id="prize-clock">2:00</b></span></div><h2 id="prize-title">Silly Animal Party!</h2><p>Tap an animal for a silly surprise. No rush, no scores—just giggles! Your break lasts two minutes.</p><div id="prize-friends" class="prize-friends">${friends.map((friend, i) => `<button type="button" aria-label="Make animal ${i + 1} do something silly">${friend}</button>`).join('')}</div><p id="prize-message" class="prize-message" role="status" aria-live="polite">The animals are ready for their silly dance! 🪩</p><button type="button" class="primary" id="prize-close">Back to my celebration</button>`;
      dialog.querySelector('#prize-close').addEventListener('click', () => dialog.close());
      dialog.querySelectorAll('.prize-friends button').forEach((button, index) => {
        button.addEventListener('click', () => {
          tick(); if (!running) return;
          button.textContent = ['🥸', '🤪', '😎', '🎩', friends[index]][giggles % 5];
          dialog.querySelector('#prize-message').textContent = jokes[giggles++ % jokes.length];
          button.classList.remove('wiggle');
          void button.offsetWidth;
          button.classList.add('wiggle');
        });
      });
      endsAt = Date.now() + 120000; running = true;
      dialog.showModal(); timer = setInterval(tick, 250);
    }
  };
})();
