'use strict';

// One optional play break per perfect round. No learning-score changes or penalties.
const prizeGame = (() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'prize-dialog';
  dialog.setAttribute('aria-labelledby', 'prize-title');
  document.body.append(dialog);
  let timer, endsAt = 0, running = false;
  let mode = 'animals', lane = 1, shells = 0, lastFrame = 0, drops = [];
  function steer(next) {
    tick();
    if (!running || mode !== 'boat') return;
    lane = Math.max(0, Math.min(2, next));
    dialog.querySelector('#little-boat').style.left = `${(lane + .5) * 100 / 3}%`;
    dialog.querySelectorAll('[data-lane]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === lane)));
  }
  function sail() {
    const now = Date.now();
    const step = Math.min(500, now - lastFrame) / 1000;
    lastFrame = now;
    if (document.hidden) return;
    drops.forEach(drop => {
      const previous = drop.y;
      drop.y += step * 15;
      if (previous < 72 && drop.y >= 72 && drop.lane === lane) {
        shells++;
        dialog.querySelector('#boat-shells').textContent = shells;
        dialog.querySelector('#prize-message').textContent = ['A seashell for your boat! 🐚', 'A dolphin says hello, captain! 🐬', 'Splish, splash! What a lovely day! ☀️'][shells % 3];
        drop.el.style.visibility = 'hidden';
      }
      if (drop.y > 105) {
        drop.y = -12; drop.lane = Math.floor(Math.random() * 3);
        drop.el.style.visibility = 'visible';
      }
      drop.el.style.top = `${drop.y}%`;
      drop.el.style.left = `${(drop.lane + .5) * 100 / 3}%`;
    });
  }
  function boatMarkup() {
    return `<h2 id="prize-title">Sunny Boat Ride</h2><p>Choose a river lane to sail toward seashells. No crashes or lost points—just a happy three-minute cruise!</p><div id="prize-friends"><div class="boat-river" aria-label="A sunny river with three sailing lanes"><div class="river-scenery" aria-hidden="true">☀️ ☁️ 🌴</div><span class="river-duck" aria-hidden="true">🦆</span><span id="little-boat" aria-hidden="true">⛵</span>${[0,1,2].map(i => `<span class="river-shell" id="shell-${i}" aria-hidden="true">🐚</span>`).join('')}</div><p class="shell-count">Seashell souvenirs: <b id="boat-shells">0</b></p><div class="boat-controls" aria-label="Choose a sailing lane">${['Left','Middle','Right'].map((label,i) => `<button type="button" data-lane="${i}" aria-pressed="${i === 1}">${['←','↑','→'][i]} ${label}</button>`).join('')}</div><small>Tap a lane or use the left and right arrow keys. Missing a shell is okay!</small></div><p id="prize-message" class="prize-message" role="status" aria-live="polite">Welcome aboard, little captain! 🌈</p>`;
  }
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
    else if (mode === 'boat') sail();
  }
  dialog.addEventListener('close', close);
  dialog.addEventListener('keydown', event => {
    if (mode !== 'boat' || !running || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); steer(lane + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pagehide', () => { close(); if (dialog.open) dialog.close(); });
  return {
    open(kind = 'animals') {
      if (dialog.open) return;
      catCoach.pause(); giggles = 0;
      mode = kind === 'boat' ? 'boat' : 'animals';
      dialog.innerHTML = `<div class="prize-top"><span>🎁 Your 10/10 treat</span><span aria-label="Break time remaining">⏳ <b id="prize-clock">2:00</b></span></div><h2 id="prize-title">Silly Animal Party!</h2><p>Tap an animal for a silly surprise. No rush, no scores—just giggles! Your break lasts two minutes.</p><div id="prize-friends" class="prize-friends">${friends.map((friend, i) => `<button type="button" aria-label="Make animal ${i + 1} do something silly">${friend}</button>`).join('')}</div><p id="prize-message" class="prize-message" role="status" aria-live="polite">The animals are ready for their silly dance! 🪩</p><button type="button" class="primary" id="prize-close">Back to my celebration</button>`;
      if (mode === 'boat') {
        dialog.innerHTML = `<div class="prize-top"><span>🎁 Your 10/10 treat</span><span aria-label="Break time remaining">⏳ <b id="prize-clock">3:00</b></span></div>${boatMarkup()}<button type="button" class="primary" id="prize-close">Back to my celebration</button>`;
        lane = 1; shells = 0; lastFrame = Date.now();
        drops = [0, 1, 2].map(i => ({ el: dialog.querySelector(`#shell-${i}`), lane: i, y: -10 - i * 35 }));
        dialog.querySelectorAll('[data-lane]').forEach(button => button.addEventListener('click', () => steer(Number(button.dataset.lane))));
        sail();
      }
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
      endsAt = Date.now() + (mode === 'boat' ? 180000 : 120000); running = true;
      dialog.showModal(); timer = setInterval(tick, 250);
    }
  };
})();
