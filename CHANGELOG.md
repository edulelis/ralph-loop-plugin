# Changelog

## [1.1.0] — Fork @edulelis

### Added
- **`/ralph` command alias** — shorter way to start a Ralph Loop (same as `/ralph-loop`)
- **`RALPH_MAX_ITERATIONS` env var** — set a global default for max iterations. Used when `maxIterations` tool param is not provided. Falls back to 100.
  ```bash
  export RALPH_MAX_ITERATIONS=200
  ```
- **Session error recovery** — plugin now clears loop state on `session.error` events, preventing orphaned state files from crashed sessions.

### Changed
- **`maxIterations` tool param** — now `optional` instead of `default (100)`. Priority: explicit param > env var > code default (100).
- **Help tool** — updated to document new `/ralph` alias and env var configuration.
- **Package name** — renamed from `opencode-ralph-loop` to `ralph-loop-plugin` for clarity.

### Original
Forked from [charfeng1/opencode-ralph-loop](https://github.com/charfeng1/opencode-ralph-loop) v1.0.8 (MIT license).
Credits to Charles Feng for the original implementation based on Anthropic's Ralph Wiggum technique.
