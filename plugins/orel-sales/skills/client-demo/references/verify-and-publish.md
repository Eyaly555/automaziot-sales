# Verify and publish

"Done" means the client's persona can do what they asked for on the published link. A page that loads is not that.

## Verify

1. Parse every JSON file and every script. For a Vite project: `npm run build`.
2. Serve the app folder and walk it in a real browser as their persona, at 390×844 and 1440×900: do the things
   they said they need, press the moments, and confirm a number moves where it should.
   Serve in the background (`python -m http.server 4173 -d app`, or `python3` on a Mac), note the process id, and
   stop that one process when done; never stop processes by name. Screenshot with
   `npx --yes playwright screenshot --browser=chromium --viewport-size=390,844 http://localhost:4173 phone.png`
   (the first run downloads a browser; if that fails, ask him to open the page and tell you what he sees).
3. Open the screenshots and look. Page text does not show placeholders, blank images, icon-only buttons or overlap.
4. Hunt dead controls: every visible button, link, tab and filter does something or goes.
5. Check their own sentences: take the asks you wrote down in `demo-spec.json` and confirm each one has its screen
   and its words on it. A demo can cover every screen and still drop something they asked for in words.
6. Check nothing identifies another client, and that no real phone or email of this client sits in the files.

## Publish

Publish only the app folder, with `index.html` at its top (for Vite, `dist/`). `demo-spec.json`, notes and anything
quoting a call stay one level above it.

1. Call `deploy_demo` with the client, a short English `slug` for the address (the client's name, e.g.
   `acme-clinic`), a Hebrew `title`, `seeded_data_only: true` (say true only if it is true),
   and a `password` when the demo shows anything the client would not want public. It returns what the publish
   script needs.
2. Run the publish script with the app folder and what `deploy_demo` returned, exactly as the tool's answer says:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/deploy-demo.mjs" "<app folder>" "<value from deploy_demo>"
   ```
   It prints `READY <link>` or `FAILED <reason in Hebrew>`. The first publish for a client can take up to four
   minutes, because a new address needs time to reach the internet; let it run. A publish ticket opens one
   upload: after a `FAILED`, fix the cause and start again from `deploy_demo`. If node is missing, help him install it from
   nodejs.org (the LTS button) and run it again.
3. Open the link and confirm the page is really yours; walk the main flow once more on the published link, on a
   phone width.

The link is a company address on our own server, hidden from search engines, of the form
`https://<name>-demo.eym.solutions`. Use the one the script prints after `READY`; never guess it. Publishing again
for the same client updates the same link. A refused file comes back with the reason: fix the cause, do not rename
around it. `my_demos` lists what he has published.

The client's real data never goes on this link. A system on their real data is `request_build`.

## Report

A few lines to him: the link (and the password, if set), what the demo is and for whom, what you researched, what
is seeded, what you verified and what you could not. Record it with `log_touch` as a note. Sending it is his
decision; offer a draft with `follow-up-writer`.
