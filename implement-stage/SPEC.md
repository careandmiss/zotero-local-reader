# Implementation SPEC — DSH Zotero local reader

- Request: build a DSH right-sidebar plugin that reads a local Zotero library in real time.
- Target: installable Host + Web Client bundle in this repository; local collections/items and local PDFs appear inside the DSH sidebar without Zotero Desktop running.
- Inputs: local `zotero.sqlite`, Zotero-managed files under the local `storage/` directory, and an optional `dataDir` setting.
- Outputs: read-only JSON endpoints and inline PDF response at `/dsh-zotero-local/api/*`; rendered sidebar UI. No user library content is written to the repo or sent to external services.
- Success command: `node --test tests/*.test.js && node scripts/check-bundle.mjs`.
- Base commit: `d92349b2ff004cdf704337eddf19c0dfd69fc02b` (approved plan/gate commit; captured before implementation files were written).
- Scope cuts: no Zotero Web API/login/API key, no database writes, no linked files outside Zotero storage, no annotation/note editing, no OCR, no telemetry, no remote fetch.
