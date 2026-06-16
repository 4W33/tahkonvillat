import fs from "node:fs";
import path from "node:path";

const targets = [
  path.join(process.cwd(), ".next"),
  path.join(process.cwd(), "node_modules", ".cache"),
];

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${path.relative(process.cwd(), target)}`);
  }
}
