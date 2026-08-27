# Plan

Open tasks and deferred items for this repository. Each entry is either an
explicitly planned feature or a decision flagged during earlier work.

## Documentation

- Write `spec/docs/contribution.md` (contribution workflow). Referenced as
  planned from `AGENTS.md`; until written, `CONTRIBUTING.md` is the authority.

## Tooling

- Add a CI workflow that runs `npm run check` on pull requests. The checks
  currently run only through the pre-commit hook.
- Wire the `lychee` link checker into CI. It is currently a manual command
  documented in `spec/docs/tooling.md`.

## Content Decisions

- Expand the `Proxy Tools` category definition in `spec/docs/categories.md`
  and its canon entry.
- Decide whether golang `goroutine` belongs in `Network : Asynchronous` or
  `Concurrency` (canon placement rule points to `Concurrency`).
- Fix the `Text Processing : Unites of measure` heading typo in `php.md`
  (should read "Units of measure").

## Documents Not Aligned Yet

- `cli.md` and `manuals.md` were not part of the canonical tree alignment and
  still use pre-canon structures. Decide whether they should align to
  `spec/docs/categories.md`.