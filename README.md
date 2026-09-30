# Daddy’s Super Kids game

A colorful, touch-friendly HTML, CSS, and JavaScript game for children ages 6–9. Choose **1st Grade** or **3rd Grade** from the home-screen dropdown. No build step, runtime dependencies, ads, accounts, or analytics. Gameplay makes no external requests; the parent area has optional links to official learning resources. Emoji appearance depends on the device.

## Publish on GitHub Pages

This is a plain static website. `index.html` must stay at the repository root alongside the CSS, JavaScript, manifest, and `assets` folder. No build command, backend, API key, domain purchase, or localhost server is required on GitHub Pages.

1. Sign in to GitHub and create a **public** repository named `dady-supperkids`. A public repository works with GitHub Free. Do not add credentials or private recordings.
2. Use **Add file → Upload files** (or **uploading an existing file** in a new empty repository). Upload the website files listed below, not the enclosing project folder. Preserve the `assets` folder. Leave out `test-results/`, `node_modules/`, and any local recordings or private files; web uploads do not apply `.gitignore` automatically. Commit to `main`.
3. Check the repository root contains `index.html`, `styles.css`, `app.js`, `content.js`, `coach.js`, `recordings.js`, `manifest.webmanifest`, `.nojekyll`, and `assets/`. Include this README, `.gitignore`, and `CURRICULUM.md` too. Tests are optional for hosting. If the upload picker skipped hidden files, use **Add file → Create new file** to add `.nojekyll`; it can contain a single comment such as `Static site; no Jekyll build needed.`
4. Open repository **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Select **main** and **/ (root)**, then **Save**.
5. Wait for the Pages deployment in **Actions** to succeed (it can take up to 10 minutes). Return to **Settings → Pages** and click **Visit site**. The project URL will normally be `https://ezeleke17.github.io/dady-supperkids/`.
6. Ensure **Enforce HTTPS** is enabled when available. Open the HTTPS address on your laptop, iPad, and Android tablet and run the device checks below. Future commits to `main` publish updates automatically.

Source: [GitHub’s publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart).

### Publishing and device checks

- Open the published project URL, refresh it, select each grade, and try every game. Check portrait and landscape, large touch controls, spelling input with the on-screen keyboard, parent settings, and the optional timer.
- Tap **Hear the welcome** if automatic speech is blocked. Installed English voices, device volume, and browser support affect speech. The browser may require a tap before playing audio.
- On iPad Safari and Android Chrome, allow microphone access only when testing **Record** in Grown-ups. Record, stop, preview, save, reload, play **Hear Daddy**, and delete a test cheer. HTTPS is required; microphone permission and audio support still depend on the device.
- On iPad use Safari’s **Share → Add to Home Screen**. On Android use Chrome’s menu and its **Add to Home screen** or **Install app** option if offered. The manifest and bundled icons support a standalone home-screen launch; installation options vary by browser. No service worker or guaranteed offline installation is provided. A hosted copy needs a connection to load; the downloaded project can still run locally.
- Saved stars, settings, and recordings belong to the current browser and website origin. Your existing local-file data will not automatically transfer to GitHub Pages. Home-screen apps may use separate storage. Recordings are never committed or uploaded by the game.
- The public site and repository include the existing family nicknames and footer credit. This preparation preserves them and all game behavior.

If you see a 404, check `index.html` is lowercase and at the selected branch’s root, and wait for a successful deployment. If assets fail, confirm the whole `assets` folder was uploaded without changing filename capitalization. All runtime asset paths are relative so repository subfolder hosting works.

### Optional publishing verification

With Node.js, Playwright, and Microsoft Edge available, run `node tests/publishing.cjs`. It serves the app temporarily beneath a repository-style subpath, checks asset responses and the manifest, and exercises touch layouts at phone/tablet sizes. This server is only a development test; the published game does not depend on it. The other tests in `tests/` cover game rounds, content, timers, speech, and recording behavior. Speech and microphone tests use mocks; real-device audio checks remain necessary.

Icons are original local SVG artwork with pre-generated PNG versions. `node tests/generate-icons.cjs` optionally regenerates them with the same development dependencies. Nothing needs installing or generating to publish the provided files.

## Run on this computer

Double-click `index.html` to open the game in a modern browser such as Edge, Chrome, Firefox, or Safari. All four games work without an internet connection.

Stars and parent settings are saved locally in the browser when storage is available. Private browsing, browser cleanup, or a different browser/address may reset them. Optional parent voice recordings are stored only in this browser when explicitly saved; nothing is uploaded.

## Optional local server and tablet testing

If Python is installed, open a terminal in this project folder and run:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000` on your laptop. For an iPad or Android tablet on the same trusted Wi-Fi network, run `ipconfig` on the laptop and find its Wi-Fi IPv4 address. Open `http://YOUR-LAPTOP-IP:8000` in Safari or Chrome on the tablet. Keep the laptop and terminal running. If Windows asks, allow the server on private networks only. Stop the server with Ctrl+C. This serves the project folder, so don't put private files in it while sharing it.

## What to test

- Home: open each adventure; use “All adventures” or the logo to return home.
- Grade: choose each grade and verify its selection survives a refresh. Grade changes affect every newly started game; the total star collection is shared across grades, not a student profile.
- Time challenge: turn on the home-screen checkbox before starting any game. The stopwatch counts up across the whole round, including breaks and reading explanations. It stops immediately after the last answer or matching pair and appears in the results. Writing practice is untimed. Replay starts a fresh clock; returning home cancels it. Turn the checkbox off for untimed play. There is no deadline or star penalty.
- Math: complete all 10 questions. Grade 1 includes addition/subtraction within 20, place value, stories, and other foundations. Grade 3 includes multiplication/division, fractions, measurement, geometry, and reasoning. Correct answers earn exactly one star; all answers show explanations. Repeated taps cannot earn extra stars.
- Spelling: choose an answer or type the word and press Check/Enter. Spaces and capitalization are ignored. Complete the 10-word round.
- Reading & Writing: answer 10 questions about two original texts. At the end, expand either writing prompt, type an answer, and review it with a grown-up. Writing is not automatically scored or saved and is cleared when leaving the screen.
- Memory: find all pairs. Unmatched cards turn back after a short pause. A matching pair earns one star. Try quick taps and leaving the game during a mismatch.
- Grown-ups: choose Easy, Medium, or Hard and save. Start a new game to see the updated difficulty. Toggle quieter animations. Escape or the close button dismisses settings without saving.
- Refresh: verify stars and settings persist when browser storage is available.
- Tablet: test portrait and landscape, touch all controls, and try typing with the on-screen keyboard. Browser responsive mode can also test 375px, 768px, 1024px, and wider layouts.
- Keyboard: Tab through controls, activate buttons with Enter/Space, and check visible focus outlines. Feedback is announced through a live region. Device reduced-motion preferences are respected.

## Files

- `index.html`: page shell and parent settings dialog.
- `styles.css`: responsive layout, colors, and animations; system fonts only.
- `app.js`: games, difficulty, scoring, and optional local storage.
- `content.js`: original grade-specific question generators, spelling sets, passages, explanations, and standards references.
- `CURRICULUM.md`: covered skills, sources, and limits of exam preparation.
- `tests/content.cjs`: content and arithmetic checks (run with `node tests/content.cjs`).
- `tests/smoke.cjs`: optional browser checks; requires Node.js, Playwright, and Microsoft Edge. Run with `node tests/smoke.cjs` in an environment where Playwright is installed.
- `tests/timer.cjs`: optional stopwatch browser checks with the same dependencies; run with `node tests/timer.cjs`.

Difficulty stays within the selected grade. Grade 1 starts with arithmetic within 10 and advances to 20; spelling moves from short vowels to digraphs, blends, and vowel teams. Grade 3 increases multiplication factors up to 10 and offers affixes, inflected endings, and longer spelling words. Grade 1 memory has 6/8/10 pairs; grade 3 has 8/9/10. Reading texts stay at the selected grade regardless of difficulty. There is no countdown or penalty for taking time. Parent settings are a simple grown-up area, not a password lock.

MCAS begins in grade 3. This app supports selected Massachusetts math and ELA skills; it is not an official MCAS product, a full curriculum, or a guarantee of readiness for all standardized exams. Use classroom guidance and official practice tests alongside the games. See `CURRICULUM.md` for details.

### Sunny the encouraging cat

Sunny offers warm, dad-style messages about effort, asking for help, and believing in yourself. Tap **I need a little cheer** anytime. Missed answers, memory attempts, and completed rounds also receive encouragement. After 75 seconds without interaction during an active question or matching game, Sunny offers one gentle break reminder; this is an inactivity timer, not emotion or attention detection. Reading, scrolling, typing, and taps reset it. There are no repeated reminders while the child stays idle.

Tap **Turn voice on** to hear the cat, **Hear again** to repeat, or **Turn voice off** to stop immediately. Encouragement voice is off on each page load. A one-time spoken welcome announces Daddy’s Super Kids game when the page opens. Browsers may block automatic audio or load voices later; tap **Hear the welcome** on the home screen to play it. Device volume controls the loudness. It uses only installed English device voices; no external speech service. The separate parent recording feature uses the microphone only when you tap Record. If a device voice is unavailable or blocked, the written messages remain available. Voice quality and availability vary by browser/device, so test on the actual iPad or Android tablet. Navigation, hidden tabs, and opening parent settings stop speech. Quiet-animation settings also apply to Sunny.

To test: enable voice, tap the cheer button, try a wrong answer, wait 75 seconds in an active question without interacting, then turn voice off while Sunny speaks. Check that speech stops and the written encouragement remains. You may need to enable an English text-to-speech voice in the device settings.


## Record Daddy’s voice

Open **Grown-ups**, choose the recording’s grade, and tap **Record**. Allow microphone access, speak a short encouragement, then tap **Stop** (automatic limit: 30 seconds). Listen to the preview and tap **Save recording**. Back in the game, select the matching grade and tap **Hear Daddy** beside Sunny. This plays the exact recorded cheer; it does not clone your voice or read new sentences in it.

Recordings stay in this browser’s local storage database. You can replace them by recording and saving again, or use **Delete recording** to remove a grade’s cheer. Browser cleanup can erase them. Closing settings or hiding the page cancels an unfinished recording and releases the microphone. Playback stops on navigation or when the page is hidden.

Microphone access requires a supported browser and secure context. On your computer, use localhost if opening the file directly does not allow recording. On a tablet, the ordinary HTTP Wi-Fi address above supports gameplay but generally cannot access the microphone; use an HTTPS-hosted copy for recording. Test recording and playback on your actual device. The game never uploads your audio.

## Perfect-score prize

A 10/10 math, spelling, or reading round unlocks a choice of one prize: **Silly Animal Party** for two minutes or **Sunny Boat Ride** for three minutes. Tap animals for funny faces and jokes, or steer a sailboat between three river lanes to collect seashell souvenirs. The boat ride is an original game built into this website, with no Roblox connection or account. Use the large lane buttons or left/right arrow keys. Missing shells has no penalty, and souvenirs do not change learning stars.

The timer continues while the tab is hidden; closing early uses that round’s prize. Results and any writing stay in place beneath the prize window. A new perfect round earns another choice of break. Memory matching does not unlock this question-round prize. Run `node tests/prize.cjs` to check both prize timers, unlocks, steering, collection, and return behavior.
