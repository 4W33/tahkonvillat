import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const targets = [
  path.join(process.cwd(), ".next"),
  path.join(os.tmpdir(), "villasivut-next-dev"),
  path.join(process.cwd(), "node_modules", ".cache"),
];

function killPort(port) {
  if (process.platform !== "win32") return;

  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const match = line.trim().match(/\s+(\d+)\s*$/);
      if (match) pids.add(match[1]);
    }

    for (const pid of pids) {
      if (pid === "0") continue;
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`Stopped process ${pid} on port ${port}`);
      } catch {
        // already gone
      }
    }
  } catch {
    // port not in use
  }
}

for (const port of [3000, 3001]) {
  killPort(port);
}

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${path.relative(process.cwd(), target)}`);
  }
}

console.log("Dev cache clean — start with: npm run dev");
