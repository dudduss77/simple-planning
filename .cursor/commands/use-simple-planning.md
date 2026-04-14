# Use Simple Planning

Use this command whenever the user wants to create, review, or organize planning documents managed by Simple Planning.

## Rules
- Always start by checking the project state with `npx simple-planning status` or `npx simple-planning list`.
- Prefer `npx simple-planning next --feature <slug-or-id>` to discover the next legal main step.
- Use `npx simple-planning run <step> --feature <slug-or-id>` before editing any planning document so the CLI can tell you which files are required and return the exact prompt text plus a prompt reference, for example `@commands/Discovery.md`.
- After you update the target markdown file, call `npx simple-planning run <step> --feature <slug-or-id> --complete`.
- If the CLI says `Zatrzymaj się i poproś użytkownika o dalsze instrukcje.`, stop and ask the user.
- Do not continue to the next main step based only on a casual user reply. Use the dedicated Cursor command `continue-simple-planning`.
- You may update `decision-log` or `parking-lot` during another step only if the user explicitly asks for it.
- Do not rely on memory to decide which markdown files are needed. Ask the CLI every time.
