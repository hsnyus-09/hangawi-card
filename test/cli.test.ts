import { execFile } from "node:child_process";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("CLI", () => {
  beforeAll(async () => {
    await execFileAsync("npm", ["run", "build:lib"]);
  }, 60_000);

  it("prints help", async () => {
    const { stdout } = await execFileAsync("node", ["dist/cli/index.js", "--help"]);
    expect(stdout).toContain("Hangawi Card CLI");
    expect(stdout).toContain("--font-file <path>");
    expect(stdout).toContain("--format <format>");
  });

  it("writes unicode SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hangawi-cli-"));
    const output = join(dir, "card.svg");
    await execFileAsync("node", [
      "dist/cli/index.js",
      "--to",
      "하늘",
      "--from",
      "바다",
      "--message",
      "따뜻한 추석 보내세요",
      "--output",
      output
    ]);
    await expect(readFile(output, "utf8")).resolves.toContain("따뜻한 추석 보내세요");
  });

  it("returns exit code 2 for invalid format", async () => {
    await expect(
      execFileAsync("node", ["dist/cli/index.js", "--to", "A", "--from", "B", "--message", "C", "--format", "pdf", "--output", "x.pdf"])
    ).rejects.toMatchObject({ code: 2 });
  });

  it("returns exit code 1 for file write errors", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hangawi-file-error-"));
    await expect(
      execFileAsync("node", ["dist/cli/index.js", "--to", "A", "--from", "B", "--message", "C", "--output", dir])
    ).rejects.toMatchObject({ code: 1 });
  });

  it("writes PNG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hangawi-png-"));
    const output = join(dir, "card.png");
    await execFileAsync("node", [
      "dist/cli/index.js",
      "--to",
      "은하",
      "--from",
      "마음",
      "--message",
      "밝은 한가위",
      "--format",
      "png",
      "--output",
      output
    ]);
    const file = await stat(output);
    expect(file.size).toBeGreaterThan(1000);
  });
});
