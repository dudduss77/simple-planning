import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

export async function readTextFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function ensureFileWithContent(
  filePath: string,
  content: string,
): Promise<void> {
  if (await fileExists(filePath)) {
    return;
  }

  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

export async function copyFileIfMissing(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  if (await fileExists(targetPath)) {
    return;
  }

  await ensureDirectory(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
}

export async function isDocumentMeaningful(filePath: string): Promise<boolean> {
  if (!(await fileExists(filePath))) {
    return false;
  }

  const contents = await fs.readFile(filePath, "utf8");
  const stripped = contents
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("Status:"))
    .filter((line) => !line.startsWith("Owner:"))
    .filter((line) => !line.startsWith("Last updated:"))
    .filter((line) => !/^#/.test(line))
    .filter((line) => !/^[-*]\s*$/.test(line));

  return stripped.length > 0;
}
