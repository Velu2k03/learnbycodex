import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root = process.cwd();
for (const name of ["drvelu-build", "drvelu-curriculum"]) {
  const path = resolve(root, ".agents/skills", name, "SKILL.md");
  const content = readFileSync(path, "utf8");
  const header = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (
    !header ||
    !header[1].includes(`name: ${name}\n`) ||
    !/^description: .{30,}/m.test(header[1])
  )
    throw new Error(`Invalid frontmatter: ${name}`);
  if (
    !/^[a-z0-9-]{1,63}$/.test(name) ||
    /\bTODO\b|\[INSERT|\[REPLACE/.test(content)
  )
    throw new Error(`Unfinished skill: ${name}`);
  for (const required of [
    "docs/STATUS.md",
    "docs/PLAN.md",
    "docs/DECISIONS.md",
  ])
    if (!existsSync(resolve(root, required)))
      throw new Error(`Missing handoff file: ${required}`);
  console.log(`PASS ${name}: valid frontmatter and existing handoff files`);
}
