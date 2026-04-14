export interface ParsedArgs {
  command: string | null;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  return { command: command ?? null, positionals, flags };
}

export function requireStringFlag(
  flags: Record<string, string | boolean>,
  key: string,
  message: string,
): string {
  const value = flags[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

export function optionalStringFlag(
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined {
  const value = flags[key];
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value.trim();
}

export function booleanFlag(
  flags: Record<string, string | boolean>,
  key: string,
): boolean {
  return flags[key] === true;
}
