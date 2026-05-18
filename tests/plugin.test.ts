import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import RalphLoopPlugin from "../src/index.ts";

const TOOL_NAMES = ["ralph-loop", "ralph", "cancel-ralph", "help"] as const;

describe("RalphLoopPlugin", () => {
  it("returns tool and event handlers", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    const result = await RalphLoopPlugin({ directory, client: {} });

    expect(result.tool).toBeDefined();
    expect(typeof result.event).toBe("function");
  });

  // Regression test for issue #4: opencode's ToolRegistry calls
  // Object.entries(tool.args) when resolving tools. If `args` is undefined
  // (e.g. because someone reverted to the old JSON-Schema `parameters` form),
  // every session prompt crashes with:
  //   TypeError: Object.entries requires that input parameter not be null or undefined
  it.each(TOOL_NAMES)("tool %s has an Object.entries-safe args shape", async (name) => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    const result = await RalphLoopPlugin({ directory, client: {} });

    const def = (result.tool as Record<string, { args: unknown; execute: unknown }>)[name];

    expect(def, `tool "${name}" not registered`).toBeDefined();
    expect(def.args, `tool "${name}" is missing args (would crash opencode 1.14+)`).toBeDefined();
    expect(() => Object.entries(def.args as object)).not.toThrow();
    expect(typeof def.execute).toBe("function");
  });

  it("ralph-loop tool writes state when executed", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    const result = await RalphLoopPlugin({ directory, client: {} });

    const ralphLoop = (result.tool as any)["ralph-loop"];
    const output = await ralphLoop.execute({ task: "test task", maxIterations: 5 });

    expect(output).toContain("Ralph Loop started");
    expect(output).toContain("test task");

    const stateFile = join(directory, ".opencode", "ralph-loop.local.md");
    expect(existsSync(stateFile)).toBe(true);
    const contents = readFileSync(stateFile, "utf-8");
    expect(contents).toContain("active: true");
    expect(contents).toContain("maxIterations: 5");
    expect(contents).toContain("test task");
  });

  it("cancel-ralph reports no active loop when state is empty", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    const result = await RalphLoopPlugin({ directory, client: {} });

    const cancelRalph = (result.tool as any)["cancel-ralph"];
    const output = await cancelRalph.execute();

    expect(output).toBe("No active Ralph Loop to cancel.");
  });

  it("ralph alias tool writes state same as ralph-loop", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    const result = await RalphLoopPlugin({ directory, client: {} });

    const ralph = (result.tool as any)["ralph"];
    const output = await ralph.execute({ task: "alias test", maxIterations: 10 });

    expect(output).toContain("Ralph Loop started");
    expect(output).toContain("alias test");
    expect(output).toContain("max 10 iterations");

    const stateFile = join(directory, ".opencode", "ralph-loop.local.md");
    expect(existsSync(stateFile)).toBe(true);
    const contents = readFileSync(stateFile, "utf-8");
    expect(contents).toContain("active: true");
    expect(contents).toContain("maxIterations: 10");
    expect(contents).toContain("alias test");
  });

  it("ralph-loop tool falls back to RALPH_MAX_ITERATIONS env var", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    process.env.RALPH_MAX_ITERATIONS = "42";
    const result = await RalphLoopPlugin({ directory, client: {} });

    const ralphLoop = (result.tool as any)["ralph-loop"];
    const output = await ralphLoop.execute({ task: "env test" });

    expect(output).toContain("max 42 iterations");

    const stateFile = join(directory, ".opencode", "ralph-loop.local.md");
    const contents = readFileSync(stateFile, "utf-8");
    expect(contents).toContain("maxIterations: 42");

    delete process.env.RALPH_MAX_ITERATIONS;
  });

  it("explicit maxIterations overrides RALPH_MAX_ITERATIONS env var", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ralph-loop-plugin-"));
    process.env.RALPH_MAX_ITERATIONS = "42";
    const result = await RalphLoopPlugin({ directory, client: {} });

    const ralphLoop = (result.tool as any)["ralph-loop"];
    const output = await ralphLoop.execute({ task: "override test", maxIterations: 7 });

    expect(output).toContain("max 7 iterations");

    const stateFile = join(directory, ".opencode", "ralph-loop.local.md");
    const contents = readFileSync(stateFile, "utf-8");
    expect(contents).toContain("maxIterations: 7");

    delete process.env.RALPH_MAX_ITERATIONS;
  });
});
