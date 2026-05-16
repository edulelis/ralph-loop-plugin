// Isolate the plugin from the real ~/.config/opencode during tests.
// The plugin reads HOME at module-eval time to compute OPENCODE_CONFIG_DIR.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sandboxHome = mkdtempSync(join(tmpdir(), "ralph-loop-test-"));
process.env.HOME = sandboxHome;
process.env.USERPROFILE = sandboxHome;
