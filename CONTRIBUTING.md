# Contributing to opencode-ralph-loop

Thanks for your interest in contributing! This plugin is small and the codebase is intentionally minimal, so most changes should be easy to land.

## Quick start

```bash
git clone https://github.com/charfeng1/opencode-ralph-loop
cd opencode-ralph-loop
npm install
npm run typecheck
npm test
```

That's it — no build step. The plugin ships its TypeScript source directly (`"main": "src/index.ts"`), and opencode loads it via its built-in TS support.

## Project layout

```
src/index.ts        Plugin entry — tools, event hooks, state management
skills/             Progressive-context skills copied to ~/.config/opencode on first run
commands/           Slash commands copied to ~/.config/opencode on first run
tests/              Vitest unit + smoke tests
.github/workflows/  CI and publish automation
```

## Making changes

1. **Fork** and create a branch off `master`.
2. **Make your change.** Keep diffs focused — one PR per concern.
3. **Run the gates locally** before pushing:
   ```bash
   npm run typecheck
   npm test
   ```
4. **Open a PR** against `master`. CI runs automatically on Node 18, 20, and 22.

### Writing tests

If your change touches the tool registration shape, state parsing, or completion detection, add a test in `tests/`. The existing tests are a good template:

- `tests/plugin.test.ts` — smoke test that imports the plugin and verifies the tool shape. This is what catches the class of bug that broke v1.0.7 (see [#4](https://github.com/charfeng1/opencode-ralph-loop/issues/4)).
- `tests/state.test.ts` — pure-function tests for `parseState`/`serializeState`.
- `tests/completion.test.ts` — regex tests for the `<promise>DONE</promise>` tag.

Tests run in `node` environment via vitest. `HOME` is sandboxed to a tmpdir in `tests/setup.ts` so the plugin's first-run file copy doesn't touch your real `~/.config/opencode`.

### Code style

- Match the existing style — minimal, no unnecessary abstractions.
- Default to no comments. Add one only when the *why* isn't obvious from the code.
- Don't add new dependencies without a strong reason; the runtime dependency surface is intentionally tiny (only `@opencode-ai/plugin` as a peer dep).

## Release process (maintainer only)

Releases are fully automated. To ship a new version:

1. Bump `version` in `package.json` (follow [semver](https://semver.org/)).
2. Commit and merge to `master` via PR.
3. The `CI & Release` workflow will:
   - Run typecheck + tests on Node 18/20/22
   - Detect that `package.json#version` differs from the latest on npm
   - Publish to npm with **OIDC trusted publishing** and an automatic **provenance attestation**
   - Push a `vX.Y.Z` git tag
   - Create a matching GitHub release with auto-generated notes

If the version didn't change, the publish job no-ops silently.

### One-time setup: npm trusted publishing

Before the publish workflow can run for the first time, the maintainer must configure the package on npmjs.com:

1. Sign in to https://www.npmjs.com and open the package settings: https://www.npmjs.com/package/opencode-ralph-loop/access
2. Scroll to **Trusted Publisher** and click **GitHub Actions**.
3. Fill in:
   - **Organization or user**: `charfeng1`
   - **Repository**: `opencode-ralph-loop`
   - **Workflow filename**: `release.yml`
   - **Environment name**: *(leave blank)*
4. Save.
5. (Recommended hardening) In **Publishing access**, select **Require two-factor authentication and disallow tokens**. After this, *only* the configured GitHub Actions workflow can publish — even a stolen npm token can't push a malicious version.

The workflow grants `id-token: write` permission so GitHub can mint a short-lived OIDC token that npm verifies against the trusted-publisher config. No long-lived `NPM_TOKEN` secret is needed (or used).

### Verifying a published version

After publish, the package page on npmjs.com will show a green **"Built and signed on GitHub Actions"** badge linking back to the exact workflow run and commit that produced the tarball. That's the [provenance attestation](https://docs.npmjs.com/generating-provenance-statements). It's the signal users use to verify the package came from this repo, unmodified.

## Reporting bugs

Open an issue with:
- opencode version (`opencode --version`)
- OS
- Steps to reproduce
- Relevant log output (especially from `~/.local/share/opencode/log/` or wherever opencode writes logs on your platform)

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the project).
