# Contributing

## Setup

```bash
git clone https://github.com/charfeng1/opencode-ralph-loop
cd opencode-ralph-loop
npm install
```

No build step. Plugin ships TypeScript source directly.

## Local checks

```bash
npm run typecheck
npm test
```

CI runs the same on every PR (Node 20/22).

## Layout

- `src/index.ts` — plugin entry
- `skills/`, `commands/` — auto-copied to `~/.config/opencode` on first run
- `tests/` — vitest unit + smoke tests
- `.github/workflows/release.yml` — CI + auto-publish

## PRs

- Branch off `master`, one concern per PR
- Add a test if you touch tool registration, state parsing, or completion detection
- Match existing style — minimal, no needless abstraction
- No new deps without a strong reason

## Bug reports

Include opencode version, OS, repro steps, and relevant logs.

## License

MIT — by contributing you agree your changes are licensed the same.
