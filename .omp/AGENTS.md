# Mini Tank Duel — Agent Context

You are working on Mini Tank Duel.

Before making implementation decisions, use these project documents as the source of truth:

@../GAME_DESIGN.md
@../ARCHITECTURE.md
@../IMPLEMENTATION_PLAN.md
@../TASKS.md

## Working Model

This repository uses phased development.

Always determine the current phase from TASKS.md before implementing anything.

Use OMP Todo for the current session, but TASKS.md is the persistent project progress record.

## Workflow

At the beginning of a development task:

1. Inspect `git status`.
2. Read current progress from `TASKS.md`.
3. Inspect existing implementation relevant to the task.
4. Create or synchronize OMP Todos with the current phase.
5. Implement only the active phase.

During implementation:

- Keep OMP Todo statuses accurate.
- Do not implement future phases early.
- Run targeted checks as useful.

Before declaring the task complete:

1. Run typecheck.
2. Run tests if tests exist.
3. Run production build.
4. Fix errors caused by the work.
5. Update `TASKS.md`.
6. Review `git diff`.
7. Commit the completed work.
8. Push the current branch.
9. Report the commit hash and push result.

Never claim completion if these steps have not actually succeeded.