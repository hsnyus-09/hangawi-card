import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const tempRoot = await mkdtemp(join(tmpdir(), "hangawi-pack-smoke-"));

try {
  const packDir = join(tempRoot, "pack");
  const workspace = join(tempRoot, "consumer");
  await mkdir(packDir, { recursive: true });
  await mkdir(workspace, { recursive: true });

  const { stdout } = await execFileAsync("npm", ["pack", "--json", "--foreground-scripts=false", "--pack-destination", packDir], { cwd: root });
  const pack = JSON.parse(stdout)[0];
  const tarball = join(packDir, pack.filename);

  await writeFile(
    join(workspace, "package.json"),
    JSON.stringify(
      {
        type: "module",
        dependencies: { "hangawi-card": tarball },
        devDependencies: { typescript: "5.9.3" }
      },
      null,
      2
    )
  );
  await execFileAsync("npm", ["install", "--ignore-scripts"], { cwd: workspace });

  await writeFile(
    join(workspace, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          skipLibCheck: false,
          noEmit: true
        },
        include: ["api-smoke.ts"]
      },
      null,
      2
    )
  );
  await writeFile(
    join(workspace, "api-smoke.ts"),
    `import { createHangawiCard, type HangawiCardOptions, type TemplateId } from "hangawi-card";

const template: TemplateId = "lunar";
const options: HangawiCardOptions = { to: "가을", from: "테스트", message: "보름달처럼 밝은 밤", template };
const card = createHangawiCard(options);
if (!card.svg.includes("보름달처럼 밝은 밤")) throw new Error("unicode svg missing");
`
  );
  await execFileAsync("npx", ["tsc", "--noEmit"], { cwd: workspace });

  await writeFile(
    join(workspace, "api-smoke.mjs"),
    `import { createHangawiCard } from "hangawi-card";
const card = createHangawiCard({ to: "가을", from: "테스트", message: "보름달처럼 밝은 밤" });
if (!card.svg.includes("보름달처럼 밝은 밤")) throw new Error("unicode svg missing");
`
  );
  await execFileAsync("node", ["api-smoke.mjs"], { cwd: workspace });

  await mkdir(join(workspace, "out"), { recursive: true });
  await execFileAsync(
    "npx",
    ["hangawi-card", "--to", "가을", "--from", "테스트", "--message", "둥근 달과 함께", "--format", "svg", "--output", "out/card.svg"],
    { cwd: workspace }
  );
  const svg = await readFile(join(workspace, "out/card.svg"), "utf8");
  if (!svg.includes("둥근 달과 함께")) throw new Error("CLI SVG smoke failed");

  await execFileAsync(
    "npx",
    ["hangawi-card", "--to", "가을", "--from", "테스트", "--message", "둥근 달과 함께", "--format", "png", "--output", "out/card.png"],
    { cwd: workspace }
  );
  const pngPath = join(workspace, "out/card.png");
  const png = await stat(pngPath);
  if (png.size < 1000) throw new Error("CLI PNG smoke produced a tiny file");
  const pngBuffer = await readFile(pngPath);
  if (pngBuffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("CLI PNG smoke produced an invalid PNG signature");
  }

  console.log(`pack smoke ok: ${pack.filename}, declarations compile, ${png.size} byte PNG`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
