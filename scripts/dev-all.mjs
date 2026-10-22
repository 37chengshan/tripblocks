import { spawn } from "node:child_process";

const children = [
  spawn(process.execPath, ["server.mjs"], { stdio: "inherit" }),
  spawn("npx", ["vite", "--host", "127.0.0.1"], { stdio: "inherit", shell: process.platform === "win32" }),
];

function stop(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) stop(code);
  });
}
