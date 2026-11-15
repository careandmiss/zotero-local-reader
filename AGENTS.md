# AGENTS.md — repository memory

## Commands

- Build/check bundle: `node scripts/check-bundle.mjs`
- Test: `node --test tests/*.test.js`
- Syntax: `node --check index.js && node --check client.js && node --check src/zotero-db.js && node --check src/http.js`
- Do not install dependencies unless the plan is amended and the user approves the dependency/build-script risk.

## Verification

Run bundle check, all tests, and syntax checks before reporting work complete. Keep tests synthetic; never log or commit real Zotero titles, abstracts, database files, storage directories, PDFs, or user credentials.

## Architecture

The DSH Host plugin reads Zotero SQLite read-only and streams only Zotero-managed PDF attachments through a same-origin route. The DSH Client registers a right-sidebar tab and uses that route for library browsing and reading. It never calls Zotero Desktop's localhost API or a cloud API.

## Security

Use parameterized SQL, `readOnly` SQLite connections plus `query_only`, GET-only local routes, no CORS, loopback/source checks, key-based attachment lookup, realpath containment under Zotero `storage`, and bounded pagination. Never accept arbitrary filesystem paths from the Client.
