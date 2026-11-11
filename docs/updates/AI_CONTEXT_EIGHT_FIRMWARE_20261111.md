# Eight-firmware AI Context Builder update

Developer: 歐陽芳泉

## Scope and source

Original generator: MangoBox-Platform `5c05ff7`, `docs/student-guide/site/ai-context-builder.html` with shared `ai-context-core.js` and browser controller `ai-context-builder.js`.

The default mode now reads `data/firmware-current.json`, schema 1, firmware source / BUILD_ID `96c0099c2a8189e9271c083e903b501903b5bb4b`, status `TEST_ONLY`. It supports five MangoX2/MangoLite plus three BarePico targets. It exports every selected target's complete Markdown, including source appendices, without applying historical module filters. Both language selections currently contain the same complete bilingual document, not a separate English translation.

The original five-target historical High-Level MicroPython and Host Python modes remain available under the separate historical-source selector. Their version/capability metadata are not treated as current eight-target acceptance. Original historical source content and shared-renderer checks remain intact.

Exports contain source, developer and qualification metadata. Missing, malformed, duplicate-target or wrong-source current packs fail closed; historical mode can still be used independently. Changing selections invalidates stale output. An old asynchronous fetch cannot overwrite a newer selection. Markdown download, clipboard and print use the same generated text. Browser print renders the Markdown text, as the existing generator did; this is not a separate typeset PDF manual engine.

## Opening locally

From this repository root run `python3 -m http.server 8769 --bind 127.0.0.1`, then open `http://127.0.0.1:8769/docs/student-guide/site/ai-context-builder.html`. Use HTTP rather than double-clicking the HTML: the generator fetches its adjacent JSON and Markdown files. No external AI service is called. This development update does not deploy the public website.

## Checks run

- `node --check docs/student-guide/site/ai-context-builder.js`: passed.
- `node tests/ai-context-builder/parity.js`: original 120 historical profile/render combinations passed; 16 current target/language combinations and 8 invalid-input checks passed.
- `node tests/ai-context-builder/dom-smoke.js`: 32 fixture/real-data target/language exports passed. Complete source text, including appendices, is preserved. Download/copy/print text parity, historical and Host gates, missing/malformed current data and stale-fetch protection passed in a minimal offline DOM harness.
- Actual browser E2E / PDF engine: blocked in this executor. Playwright's bundled browser is absent. The installed Chromium could not start because process sockets are not permitted, including the permitted escalated attempt. No browser rendering, downloadable PDF or visual QA pass is claimed.

The browser smoke suite is prepared for execution where Chromium can run. Run `node tests/ai-context-builder/smoke.js` for mocked current data and `AI_CONTEXT_REAL_PACK=1 node tests/ai-context-builder/smoke.js` for the real pack, with the local server running. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` only if using a system browser. The workflow runs the renderer/offline checks and both browser variants.

No firmware, hardware, release status, or public deployment was changed. Automated documentation checks do not establish eight-board physical validation.
