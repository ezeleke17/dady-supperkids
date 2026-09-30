'use strict';

const app = document.querySelector('#app');
const settings = document.querySelector('#settings');
const storageKey = 'kids-learning-adventure-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (_) { /* Storage is optional. */ }
const preferences = {
  grade: saved.grade === '3' ? '3' : '1',
  difficulty: ['easy', 'medium', 'hard'].includes(saved.difficulty) ? saved.difficulty : 'easy',
  quiet: saved.quiet === true,
  timed: saved.timed === true,
  stars: Number.isSafeInteger(saved.stars) && saved.stars >= 0 ? saved.stars : 0,
};
let round = null;
let memoryTimer;
let challengeTimer;
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function elapsedTime() {
  if (!round?.timed) return 0;
  return round.elapsed ?? Math.max(0, performance.now() - round.startedAt);
}
function updateClock() {
  const clock = app.querySelector('#challenge-clock');
  if (clock) clock.textContent = formatTime(elapsedTime());
}
function stopClock() {
  if (round?.timed && round.elapsed === null) round.elapsed = elapsedTime();
  clearInterval(challengeTimer);
  updateClock();
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) { /* Games still work without storage. */ }
  document.querySelector('#total-stars').textContent = preferences.stars;
  document.body.classList.toggle('quiet', preferences.quiet);
}
function awardStar() { preferences.stars++; round.score++; persist(); }
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function randomInt(max) { return Math.floor(Math.random() * (max + 1)); }
function focusHeading() { const h = app.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
function home() {
  clearTimeout(memoryTimer);
  clearInterval(challengeTimer);
  round = null;
  delete app.dataset.game;
  app.innerHTML = `<section class="hero"><div><span class="hello-pill"><i></i> A happy place to learn & play</span><h1>Daddy’s<br><em>Super Kids game</em></h1><p>Pick a game, make a discovery, and have fun.<br>Go at your own happy pace!</p><button type="button" class="secondary welcome-button" id="hear-welcome">🔊 Hear the welcome</button></div><div class="hero-art"><div class="art-blob" aria-hidden="true"></div><button class="mascot" id="fox-hello" aria-label="Say hello to Pip the fox">🦊</button><span class="mascot-message" id="mascot-message" role="status">Hi, I’m Pip! Tap me! 👋</span><span aria-hidden="true" class="art-chip chip-one">2+3</span><span aria-hidden="true" class="art-chip chip-two">Aa</span><span aria-hidden="true" class="art-chip chip-three">★</span><span aria-hidden="true" class="art-spark">✧</span><span aria-hidden="true" class="art-dot">✦</span></div></section>
  <section class="grade-picker" aria-label="Choose a grade"><div><label for="grade-select">My learning level</label><select id="grade-select"><option value="1" ${preferences.grade === '1' ? 'selected' : ''}>1st Grade · Build the basics</option><option value="3" ${preferences.grade === '3' ? 'selected' : ''}>3rd Grade · Stretch my skills</option></select></div><p>${preferences.grade === '1' ? 'Numbers, phonics, and short stories. Build strong foundations, one little win at a time.' : 'Bigger number puzzles, wonderful words, and stories to explore. One discovery at a time!'}</p></section>
  <section class="challenge-picker" aria-label="Optional time challenge"><label for="time-challenge"><input type="checkbox" id="time-challenge" ${preferences.timed ? 'checked' : ''}> ⏱ Time challenge</label><p id="challenge-help">Just for fun! Count your time with no deadline or lost stars. The clock runs during breaks; writing is untimed.</p></section>
  <section aria-labelledby="choose-title"><div class="section-heading"><h2 id="choose-title">Pick your adventure</h2><p>Grade ${preferences.grade} · Four ways to learn and play.</p></div><div class="games">
  <article class="game-card math-card"><div class="card-top"><span class="game-icon" aria-hidden="true">🐸</span><span class="game-tag">🌿 NUMBER FOREST</span></div><h3>Math Game</h3><p>${preferences.grade === '1' ? 'Add, subtract, and explore tens, shapes, time, and simple stories.' : 'Multiply, divide, and explore fractions, area, data, and word problems.'}</p><div class="game-meta"><span aria-hidden="true">✦</span> Explain & solve <span>·</span> 10 questions</div><button class="play-button" data-game="math">Let's do math <span aria-hidden="true">↗</span></button></article>
  <article class="game-card spelling-card"><div class="card-top"><span class="game-icon" aria-hidden="true">🦄</span><span class="game-tag">✨ WORD MAGIC</span></div><h3>Spelling Game</h3><p>${preferences.grade === '1' ? 'Explore letter sounds, blends, and vowel teams with picture clues.' : 'Discover prefixes, suffixes, syllables, and spelling patterns.'}</p><div class="game-meta"><span aria-hidden="true">✦</span> Word clues <span>·</span> 10 words</div><button class="play-button" data-game="spelling">Let's spell <span aria-hidden="true">↗</span></button></article>
  <article class="game-card reading-card"><div class="card-top"><span class="game-icon" aria-hidden="true">🦉</span><span class="game-tag">☁ STORY SKY</span></div><h3>Reading & Writing</h3><p>${preferences.grade === '1' ? 'Read little stories, find details, and write your own sentences.' : 'Find the main idea, use text evidence, and explain your thinking.'}</p><div class="game-meta"><span aria-hidden="true">✦</span> 2 texts <span>·</span> 10 questions</div><button class="play-button" data-game="reading">Let's read <span aria-hidden="true">↗</span></button></article>
  <article class="game-card memory-card"><div class="card-top"><span class="game-icon" aria-hidden="true">🐰</span><span class="game-tag">🌸 ANIMAL GARDEN</span></div><h3>Memory Game</h3><p>Flip, find, and match your favorites.<br>A little wonder under every card!</p><div class="game-meta"><span aria-hidden="true">✦</span> Animal friends <span>·</span> Matching pairs</div><button class="play-button" data-game="memory">Let's find pairs <span aria-hidden="true">↗</span></button></article></div></section>
  <aside class="daily-note"><span aria-hidden="true">🌱</span><div><strong>There’s no rush. You belong here!</strong><p>Try, wonder, giggle, and take a break whenever you like. Every try is part of the adventure.</p></div><span class="note-stars" aria-hidden="true">✧ ★ ✧</span></aside>`;
  catCoach.mount(app.querySelector('.hero'), false, preferences.grade);
  app.querySelector('#hear-welcome').addEventListener('click', () => catCoach.welcome());
  let greeting = 0;
  const greetings = ['You bring the curiosity. I’ll bring the smiles! 🌈', 'Mistakes help us discover new things! 🌱', 'Wiggle your fingers. Ready to play? 🐾', 'A little break is lovely too. Take your time! 💛'];
  app.querySelector('#fox-hello').addEventListener('click', () => {
    app.querySelector('#mascot-message').textContent = greetings[greeting++ % greetings.length];
  });
  app.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => start(button.dataset.game)));
  app.querySelector('#time-challenge').setAttribute('aria-describedby', 'challenge-help');
  app.querySelector('#time-challenge').addEventListener('change', event => {
    preferences.timed = event.target.checked; persist();
  });
  app.querySelector('#grade-select').addEventListener('change', event => {
    preferences.grade = event.target.value; persist(); home(); app.querySelector('#grade-select').focus();
  });
}
const animals = [['🐱','cat'],['🐶','dog'],['🦊','fox'],['🐼','panda'],['🐸','frog'],['🦁','lion'],['🐨','koala'],['🐰','rabbit'],['🦋','butterfly'],['🐢','turtle']];
function start(game) {
  clearTimeout(memoryTimer);
  clearInterval(challengeTimer);
  round = { game, grade: preferences.grade, level: preferences.difficulty, index: 0, score: 0, answered: false, review: [], timed: preferences.timed, startedAt: performance.now(), elapsed: null };
  if (game !== 'memory') round.questions = curriculum[game](round.grade, round.level);
  if (game === 'memory') {
    const count = (round.grade === '1' ? { easy: 6, medium: 8, hard: 10 } : { easy: 8, medium: 9, hard: 10 })[round.level];
    round.cards = shuffle([...animals.slice(0,count), ...animals.slice(0,count)]).map(([emoji, name]) => ({ emoji, name, matched: false }));
    round.flipped = []; round.moves = 0;
    renderMemory();
  } else renderQuestion();
  if (round.timed) challengeTimer = setInterval(updateClock, 250);
  focusHeading();
}
function shell(content) {
  app.dataset.game = round.game;
  app.innerHTML = `<div class="game-header ${round.timed ? 'has-timer' : ''}"><button class="back" id="back-home">← All adventures</button>${round.timed ? `<span class="challenge-clock"><span aria-hidden="true">⏱</span> ${round.elapsed === null ? 'Time' : 'Finished in'} <b id="challenge-clock" role="timer" aria-label="Elapsed round time" aria-live="off">${formatTime(elapsedTime())}</b></span>` : ''}<span class="round-stars" id="round-stars">★ ${round.score} stars this round</span></div>${content}`;
  catCoach.mount(app.querySelector('.game-header'), !app.querySelector('.celebration-panel'), round.grade);
  document.querySelector('#back-home').addEventListener('click', () => { home(); focusHeading(); });
}
function renderQuestion() {
  round.answered = false;
  const math = round.game === 'math';
  const spelling = round.game === 'spelling';
  round.question = round.questions[round.index];
  const q = round.question;
  const fraction = q.fraction ? `<div class="fraction-model" role="img" aria-label="${q.fraction.shaded} of ${q.fraction.parts} equal parts shaded">${Array.from({length:q.fraction.parts},(_,i) => `<span class="${i < q.fraction.shaded ? 'shaded' : ''}"></span>`).join('')}</div>` : '';
  shell(`<section class="game-panel ${round.game === 'reading' ? 'reading-panel' : ''}"><span class="eyebrow">${math ? 'NUMBER EXPLORER' : spelling ? 'WORD WIZARD' : 'STORY DETECTIVE'}</span><h1>${math ? 'Let’s do math!' : spelling ? 'What’s the word?' : 'Read, think, discover!'}</h1><div class="progress-label">Grade ${round.grade} · Question ${round.index + 1} of 10${round.game === 'reading' ? '' : ` · ${round.level}`}</div><div class="progress-track" role="progressbar" aria-label="Questions completed" aria-valuenow="${round.index}" aria-valuemin="0" aria-valuemax="10"><div class="progress-fill" style="width:${round.index * 10}%"></div></div><div class="star-path" aria-hidden="true">${Array.from({length:10}, (_,i) => `<span class="${i < round.index ? 'visited' : i === round.index ? 'current' : ''}">${i < round.index ? '★' : i === round.index ? '🦊' : '·'}</span>`).join('')}</div><span class="skill-label">${q.skill}</span>${q.passage ? `<article class="reading-passage"><h2>${q.title}</h2><p>${q.passage}</p></article>` : ''}${spelling ? `<div class="clue" role="img" aria-label="Picture clue: ${q.label}">${q.emoji}</div>` : ''}${fraction}<div class="question ${q.label.length > 25 ? 'word-question' : ''}">${q.label}</div>${spelling ? '<p>Choose the correct spelling, or type it below.</p>' : ''}<div class="answers ${round.game === 'reading' ? 'text-answers' : ''}">${q.options.map((option,i) => `<button class="answer" data-answer-index="${i}">${option}</button>`).join('')}</div>${spelling ? `<form class="type-form" id="word-form"><label for="word-input">Want to spell it yourself?</label><input id="word-input" aria-label="Type the word" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="30"><button class="primary" type="submit">Check</button></form>` : ''}<div class="feedback" id="feedback" role="status" aria-live="polite">🦊 Take your time. Let’s explore together!</div><button class="primary next-button" id="next-question" disabled>${round.index === 9 ? 'See my stars' : 'Next question'} →</button></section>`);
  app.querySelectorAll('[data-answer-index]').forEach(button => button.addEventListener('click', () => answer(q.options[Number(button.dataset.answerIndex)])));
  app.querySelector('#word-form')?.addEventListener('submit', event => { event.preventDefault(); const value = app.querySelector('#word-input').value.trim().toLowerCase(); if (value) answer(value); else app.querySelector('#feedback').textContent = 'Type a word first, or tap an answer above.'; });
  app.querySelector('#next-question').addEventListener('click', () => { if (!round.answered) return; round.index++; if (round.index === 10) result(); else renderQuestion(); focusHeading(); });
}
function answer(value) {
  if (round.answered) return;
  round.answered = true;
  if (round.index === round.questions.length - 1) stopClock();
  const correct = value === round.question.answer;
  if (correct) awardStar();
  round.review.push({skill: round.question.skill, correct});
  app.querySelectorAll('[data-answer-index]').forEach(button => {
    button.disabled = true;
    const option = round.question.options[Number(button.dataset.answerIndex)];
    if (option === round.question.answer) button.classList.add('correct');
    else if (option === value) button.classList.add('incorrect');
  });
  app.querySelectorAll('#word-form input, #word-form button').forEach(el => el.disabled = true);
  app.querySelector('#feedback').textContent = (correct ? ['Great Job! A little star for you! ⭐ ', 'You found it! Lovely exploring! 🌈 ', 'Hooray! Look at you learning! 🦊 '][round.index % 3] : `Good try! Let’s learn together. The answer is ${round.question.answer}. 🌱 `) + round.question.explanation;
  app.querySelector('#feedback').classList.add(correct ? 'happy-feedback' : 'gentle-feedback');
  app.querySelector('#round-stars').textContent = `★ ${round.score} stars this round`;
  app.querySelector('#next-question').disabled = false;
  catCoach.feedback(correct ? 'success' : 'missed', true);
}
function renderMemory() {
  shell(`<section class="game-panel"><span class="eyebrow">MATCH MASTER</span><h1>Find your animal friends!</h1><p>Tap two cards. Can you find a matching pair?</p><div class="memory-stats" id="memory-stats">0 of ${round.cards.length / 2} pairs · 0 turns</div><div class="memory-grid">${round.cards.map((_,i) => `<button class="memory-card-button" data-card="${i}" aria-label="Card ${i + 1}, face down">✳</button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">Pick a card to start exploring! 🐾</div><button class="primary next-button" id="memory-finish" hidden>See my stars →</button></section>`);
  app.querySelectorAll('[data-card]').forEach(button => button.addEventListener('click', () => flip(Number(button.dataset.card))));
  app.querySelector('#memory-finish').addEventListener('click', result);
  app.querySelector('.memory-stats').insertAdjacentHTML('beforebegin', `<p class="progress-label">Grade ${round.grade} · ${round.level} · A playful attention break</p>`);
}
function flip(index) {
  const card = round.cards[index];
  if (round.flipped.length === 2 || card.matched || round.flipped.includes(index)) return;
  round.flipped.push(index);
  const button = app.querySelector(`[data-card="${index}"]`);
  button.textContent = card.emoji; button.classList.add('revealed'); button.setAttribute('aria-label', `Card ${index + 1}, ${card.name}`); button.disabled = true;
  if (round.flipped.length < 2) return;
  round.moves++;
  const [a,b] = round.flipped;
  const matched = round.cards[a].name === round.cards[b].name;
  if (matched) {
    awardStar();
    [a,b].forEach(i => { round.cards[i].matched = true; app.querySelector(`[data-card="${i}"]`).classList.add('matched'); app.querySelector(`[data-card="${i}"]`).setAttribute('aria-label', `Card ${i + 1}, ${round.cards[i].name}, matched`); });
    round.flipped = [];
    app.querySelector('#feedback').textContent = 'Great Job! A matching pair! ⭐';
    if (round.score === round.cards.length / 2) {
      stopClock();
      app.querySelector('#feedback').textContent = 'You found every animal friend! Amazing! 🎉';
      app.querySelector('#memory-finish').hidden = false;
    }
  } else {
    app.querySelector('#feedback').textContent = 'Not a pair yet! Our friends will wait. Try Again! 🐾';
    memoryTimer = setTimeout(() => {
      [a,b].forEach(i => { const el = app.querySelector(`[data-card="${i}"]`); el.textContent = '✳'; el.classList.remove('revealed'); el.disabled = false; el.setAttribute('aria-label', `Card ${i + 1}, face down`); });
      round.flipped = [];
    }, 1300);
  }
  catCoach.feedback(matched ? 'success' : 'missed', round.score === round.cards.length / 2);
  app.querySelector('#memory-stats').textContent = `${round.score} of ${round.cards.length / 2} pairs · ${round.moves} turns`;
  app.querySelector('#round-stars').textContent = `★ ${round.score} stars this round`;
}
function result() {
  stopClock();
  const game = round.game;
  const total = game === 'memory' ? round.cards.length / 2 : 10;
  shell(`<section class="game-panel celebration-panel"><div class="celebration-sprinkles" aria-hidden="true">✦ <span>●</span> ✧ <span>♥</span> ✦</div><div class="result-icon" aria-hidden="true">${round.score === total ? '🏆' : '🌟'}</div><span class="eyebrow">ADVENTURE COMPLETE</span><h1>${round.score === total ? 'You’re a superstar!' : 'Look how far you’ve come!'}</h1><p>You explored, you tried, you learned. Pip is happy you came to play!</p><div class="result-score">★ ${round.score} / ${total} stars</div><p>${game === 'memory' ? `You found all ${total} pairs in ${round.moves} turns.` : 'Your stars have been added to your collection.'}</p><div class="result-actions"><button class="primary" id="play-again">Play again ↻</button><button class="secondary" id="result-home">All adventures</button></div></section>`);
  if (round.timed) {
    app.querySelector('.result-actions').insertAdjacentHTML('beforebegin', `<div class="time-result"><span aria-hidden="true">⏱</span><strong>Your time: ${formatTime(round.elapsed)}</strong><p>Challenge complete! Try another round and see how you do. Careful answers matter too.</p></div>`);
  }
  if (game !== 'memory') {
    const practice = [...new Set(round.review.filter(item => !item.correct).map(item => item.skill))];
    app.querySelector('.result-actions').insertAdjacentHTML('beforebegin', `<div class="round-review"><strong>Grade ${round.grade} · Your next little step</strong><p>${practice.length ? `Keep practicing: ${practice.join(', ')}.` : 'You answered every question correctly this round. Try another round or explain one answer to a grown-up!'}</p><p>Stars celebrate practice; they are not an exam-readiness score.</p></div>`);
  }
  if (game === 'reading') {
    const passages = round.questions.filter((q,i,all) => all.findIndex(other => other.title === q.title) === i);
    app.querySelector('.result-actions').insertAdjacentHTML('beforebegin', `<section class="writing-practice"><h2>Now tell it in your own words</h2><p>Choose a writing adventure to do with a grown-up. Writing is not automatically scored or saved.</p>${passages.map((q,i) => `<details><summary>${q.title}</summary><p>${q.passage}</p><label for="writing-${i}">${q.writingPrompt}</label><textarea id="writing-${i}" rows="5" maxlength="3000" placeholder="Write your ideas here…" spellcheck="true"></textarea></details>`).join('')}<strong>Read your work with a grown-up:</strong><ul><li>Did I answer the question?</li><li>Did I use ${round.grade === '1' ? 'a detail' : 'details and explain my thinking'} from the text?</li><li>Did I use complete sentences, capitals, and punctuation?</li></ul><p>You can also write on paper. Leaving this screen clears typed writing.</p></section>`);
  }
  catCoach.feedback('complete', true);
  if (game !== 'memory' && round.score === 10 && !round.prizeUsed) {
    app.querySelector('.result-actions').insertAdjacentHTML('beforebegin', '<div class="prize-invite"><strong>🎁 10/10! You unlocked a silly animal party!</strong><p>Enjoy a two-minute giggle break whenever you’re ready.</p><button type="button" class="primary" id="open-prize">Play my 2-minute prize 🎉</button></div>');
    app.querySelector('#open-prize').addEventListener('click', event => {
      if (round.prizeUsed) return;
      round.prizeUsed = true;
      event.currentTarget.disabled = true;
      event.currentTarget.textContent = 'Your prize break was opened 💛';
      prizeGame.open();
    });
  }
  app.querySelector('#play-again').addEventListener('click', () => start(game));
  app.querySelector('#result-home').addEventListener('click', () => { home(); focusHeading(); });
  focusHeading();
}
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); home(); focusHeading(); });
document.querySelector('#parent-open').addEventListener('click', () => {
  document.querySelector('#difficulty').value = preferences.difficulty;
  document.querySelector('#reduce-motion').checked = preferences.quiet;
  catCoach.pause();
  settings.showModal();
});
settings.addEventListener('close', () => catCoach.resume());
document.querySelector('#parent-close').addEventListener('click', () => settings.close());
document.querySelector('#settings-form').addEventListener('submit', event => {
  event.preventDefault(); preferences.difficulty = document.querySelector('#difficulty').value;
  preferences.quiet = document.querySelector('#reduce-motion').checked; persist(); settings.close();
});
persist();
home();
