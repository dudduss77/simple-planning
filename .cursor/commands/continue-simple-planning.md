# Continue Simple Planning

Use this command only when the user explicitly wants to continue a feature after a Simple Planning checkpoint.

## Rules
- Start by checking the project state with `npx simple-planning status` or `npx simple-planning next`.
- If multiple features exist and the target feature is unclear, ask the user which feature should continue.
- If the current feature is not waiting for confirmation, do not invent a continuation. Explain the current state instead.
- If the feature is waiting for confirmation and `nextSuggestedStep` exists, run `npx simple-planning run <next-step> --feature <slug-or-id> --confirmed-by-user`.
- The only purpose of this command is to unlock exactly one next step after a checkpoint.
- After preparing that next step, continue following the normal `use-simple-planning` flow.
