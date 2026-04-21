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

/**
 * Odczytuje i parsuje JSON z pliku. Zwraca `unknown` — walidacja odbywa się osobno (np. Zod).
 * Przy błędzie składni JSON komunikat zawiera ścieżkę pliku (diagnostyka stanu workflow).
 */
export async function readJsonFile(filePath: string): Promise<unknown> {
  let contents: string;
  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(
      `Nie można odczytać pliku '${filePath}'. ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Nie można sparsować JSON w pliku '${filePath}': ${error.message}`,
      );
    }
    throw error;
  }
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

export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
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

export function extractMeaningfulDocumentText(contents: string): string {
  return contents
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("Status:"))
    .filter((line) => !line.startsWith("Owner:"))
    .filter((line) => !line.startsWith("Last updated:"))
    .filter((line) => !/^#/.test(line))
    .filter((line) => !/^[-*]\s*$/.test(line))
    .filter((line) => !/^[-*]\s*do uzupe[lł]nienia$/i.test(line))
    .filter((line) => !/^do uzupe[lł]nienia$/i.test(line))
    .join("\n")
    .trim();
}

export async function isDocumentMeaningful(filePath: string): Promise<boolean> {
  if (!(await fileExists(filePath))) {
    return false;
  }

  const contents = await fs.readFile(filePath, "utf8");
  return extractMeaningfulDocumentText(contents).length > 0;
}

export async function getMeaningfulDocumentCharacterCount(
  filePath: string,
): Promise<number> {
  if (!(await fileExists(filePath))) {
    return 0;
  }

  const contents = await fs.readFile(filePath, "utf8");
  return extractMeaningfulDocumentText(contents).length;
}
