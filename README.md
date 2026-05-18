# ralph-loop-plugin

[![CI](https://github.com/edulelis/ralph-loop-plugin/actions/workflows/release.yml/badge.svg)](https://github.com/edulelis/ralph-loop-plugin/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/ralph-loop-plugin.svg)](https://www.npmjs.com/package/ralph-loop-plugin)

Minimal Ralph Loop plugin for [opencode](https://opencode.ai) - auto-continues until task completion.

Inspired by Anthropic's Ralph Wiggum technique for iterative, self-referential AI development loops.

## Extra Features

Based on [charfeng1/opencode-ralph-loop](https://github.com/charfeng1/opencode-ralph-loop) with additions:

- **`/ralph` alias** — shorter command, same as `/ralph-loop`
- **`RALPH_MAX_ITERATIONS` env var** — set global max-iterations default; per-task `maxIterations` param takes priority
- **Error recovery** — loop state auto-cleared on session crashes and session deletion

## Installation

Add to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["ralph-loop-plugin"]
}
```

Restart opencode. That's it!

On first run, the plugin will automatically install skills and commands to your `~/.config/opencode/` directory.

## Usage

### Start a loop

```
/ralph-loop "Build a REST API with authentication"
```

The AI will work on your task and automatically continue until completion.

### Cancel a loop

```
/cancel-ralph
```

### Get help

```
/help
```

## How it works

1. `/ralph-loop` creates a state file at `.opencode/ralph-loop.local.md`
2. When the AI goes idle, the plugin checks if `<promise>DONE</promise>` was output
3. If not found, it injects "Continue from where you left off"
4. Loop continues until DONE is found or max iterations (100) reached
5. State file is deleted when complete

### Completion Promise

When the AI finishes a task, it outputs:

```
<promise>DONE</promise>
```

**Important:** The AI should ONLY output this when the task is COMPLETELY and VERIFIABLY finished. False promises are not allowed.

## State File

The loop state is stored in your project directory:

```
.opencode/ralph-loop.local.md
```

Format (markdown with YAML frontmatter):

```markdown
---
active: true
iteration: 3
maxIterations: 100
sessionId: ses_abc123
---

Your original task prompt
```

Add `.opencode/ralph-loop.local.md` to your `.gitignore`.

## Features

- **Plug-and-play**: Just add to config and restart - no manual setup
- **Auto-setup**: Skills and commands are automatically installed on first run
- **Minimal**: ~300 lines, no bloat
- **Project-relative**: State file in `.opencode/`, not global
- **Completion detection**: Scans session messages for DONE promise
- **Progressive context**: Skills provide context only when needed
- **Commands**: `/ralph-loop`, `/ralph`, `/cancel-ralph`, and `/help`

## Architecture

Following Anthropic's Claude Code plugin pattern:

```
ralph-loop-plugin/
├── src/
│   └── index.ts        # Main plugin with event hooks and tools
├── skills/
│   ├── ralph-loop/     # Progressive context for starting loops
│   ├── cancel-ralph/   # Context for cancellation
│   └── help/           # Plugin documentation
├── commands/
│   ├── ralph-loop.md   # Slash command for starting
│   ├── cancel-ralph.md # Slash command for cancelling
│   └── help.md         # Slash command for help
└── package.json
```

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Releases

Auto-published from CI with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) — each tarball is cryptographically linked to the exact commit, no long-lived tokens involved.

## Credits

- Inspired by [Anthropic's Ralph Wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) plugin for Claude Code
- Implementation pattern from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

## License

MIT
