import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const [, , command = "dev", ...args] = process.argv;
const astroCli = fileURLToPath(
  new URL("../node_modules/astro/astro.js", import.meta.url),
);

const child = spawn(process.execPath, [astroCli, command, ...args], {
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: process.env.ASTRO_TELEMETRY_DISABLED ?? "1",
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`Failed to start Astro: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
