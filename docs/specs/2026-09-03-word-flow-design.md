# word-flow — Design Spec

Date: 2026-09-03
Status: Approved, not yet implemented. Sections describe what is to be built.

## Purpose

A client-side tool that builds git branch names from a configurable template.
You pick a type, type a ticket number and a free-text description, and it
produces a branch name that is correctly slugified and actually valid as a git
ref — plus the `git checkout -b` command to go with it.

### Origin

The functional idea comes from a CodePen ("Kabob Kase",
`codepen.io/DBeardionaire/full/PRKWqJ`): a 40-line Vue 2 page with a type
select, a ticket id, a branch name, and a Copy button. This project keeps the
idea and rebuilds it. It is not a port — no code is carried over.

### What the original gets wrong

These are the concrete defects that justify the rewrite. Each one has a
counterpart in this design.

| Original                                                                                               | Consequence                                                                                                   |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| The `str.replace(KEBAB_REGEX, …)` result is discarded                                                  | The camelCase → kebab conversion it appears to do never happens. `fixLoginBug` stays `fixLoginBug`.           |
| Ticket prefix `CON-` hardcoded in a template literal                                                   | Unusable by anyone whose project is not called CON.                                                           |
| Separators removed by `split().join()` over a hand-written list, with a stray `,,` (sparse array hole) | Anything outside that list survives: accents, emoji, `#`, `%`, `+`.                                           |
| No Unicode normalization                                                                               | `Corrección` becomes `corrección`, which git accepts but is unpleasant in a terminal and breaks some tooling. |
| Empty fields concatenated blindly                                                                      | An empty ticket yields `feature/CON--name`.                                                                   |
| No validation                                                                                          | Nothing stops `feature/.name.lock`, which `git checkout -b` rejects with a cryptic error.                     |
| Falls back to the raw name when no id is given                                                         | The branch type silently disappears from the output.                                                          |
| `document.execCommand('copy')`                                                                         | Deprecated.                                                                                                   |

## Scope

- Build a branch name from a template made of tokens and literal text.
- Slugify each field correctly: Unicode normalization, transliteration,
  camelCase splitting, separator collapsing.
- Validate the result against the real rules of `git check-ref-format` and say
  which rule failed, in plain language.
- Show the assembled name with each segment colored by the token it came from.
- Produce the `git checkout -b <name>` command, ready to copy.
- Share the _configuration_ (template, project prefix, type list) through the
  URL query string, so a team can hand each other a link that carries their
  convention.
- Keyboard shortcuts for the copy actions.
- 100% client-side: no backend, no API route, no network call of any kind.

### Out of scope

Deliberately excluded, not oversights:

- A general-purpose case converter (kebab/snake/camel/Pascal/…). The tool
  builds branch names; a second, unrelated mode would dilute it.
- Local history of generated branches. Considered and dropped: the value of a
  branch name is at the moment you create it, and a list of past names is
  clutter you scroll past.
- Integration with Jira, Azure Boards, GitHub or any issue tracker. That needs
  credentials and a backend, and would break the no-network promise.
- Accounts, persistence beyond the URL, analytics.

## Stack

Same as `jwt-viewer`, for the same reasons — a backend-less single-route tool.

- Next.js 16 (App Router) as a build/routing shell only. The whole app is
  client-side under one route. No API routes, no server actions.
- React 19, TypeScript, Tailwind v4 (CSS-first, tokens in `globals.css`).
- Zustand for state. No data fetching, so no TanStack Query.
- No form library. Every input is a controlled field bound to the store and
  validated as you type; nothing is ever submitted.
- No slug library (`slugify`, `lodash.kebabCase`). The transformation is the
  product — it is ~60 lines, it needs per-token behaviour that no library
  offers, and every rule in it must be individually testable.
- `lucide-react` for icons, `clsx` + `tailwind-merge` for class composition.
- Testing: Vitest + Testing Library (unit/component), Playwright (e2e).
- Tooling: ESLint, Prettier, Yarn Classic 1.22.

## Architecture

```
src/
  app/
    layout.tsx
    page.tsx          # assembles the panels, holds no logic
    globals.css       # design tokens, including one color per template token
  components/
    ui/               # Button, Panel, CopyButton, Field
    branch-config/    # PresetPicker, TemplateInput, TypeListInput, ProjectInput
    branch-form/      # TypeSelect, TicketInput, DescriptionInput
    branch-output/    # BranchPreview (colored segments), ValidationReport, GitCommand
  lib/
    branch/
      template.ts     # "{type}/{project}-{ticket}" → TemplateNode[]
      slugify.ts      # free text → slug, per-token transform modes
      assemble.ts     # nodes + values → Segment[] (collapses empty tokens)
      validate.ts     # git check-ref-format rules → ValidationResult
      presets.ts      # the three shipped conventions
      build.ts        # the one entry point above calls: parse → assemble → validate
      types.ts
    url/
      config-params.ts # Config ⇄ URLSearchParams
    cn.ts
  store/
    branch-store.ts       # Zustand: config + values. No derived field.
    use-branch-result.ts  # buildBranch(), memoized — the only derivation site
    use-config-url-sync.ts
    use-shortcuts.ts
  test/
    setup.ts
```

`lib/branch` must not import React, Next, or the store. It is the part worth
testing and the part worth keeping.

## The engine

### Template grammar

A template is literal text interleaved with tokens written `{name}`. Four
tokens exist and no more: `type`, `project`, `ticket`, `slug`.

Parsing produces `TemplateNode[]`, each node either
`{ kind: 'literal', text }` or `{ kind: 'token', name }`.

Parsing never throws. A template being typed is frequently invalid — an
unclosed brace, an unknown `{branch}` — and the parser reports the problem
while still returning the nodes it understood, so the preview keeps rendering.

### Per-token transform

Each token declares how its value is transformed. This is what replaces the
hardcoded `CON-` while keeping the output people actually want:

| Token     | Mode       | Input → output                                                |
| --------- | ---------- | ------------------------------------------------------------- |
| `type`    | `slug`     | `feature` → `feature`                                         |
| `project` | `preserve` | `CON` → `CON` — cleaned of illegal characters, case untouched |
| `ticket`  | `preserve` | `1234` → `1234`                                               |
| `slug`    | `slug`     | `Arreglar Login Ñoño` → `arreglar-login-nono`                 |

`preserve` runs the same pipeline as `slug` minus two steps: no camelCase
split and no lowercasing. The character set it emits is therefore
`[A-Za-z0-9]` plus separators — `my.project` still becomes `my-project`, but
`CON` stays `CON`. Uppercase is legal in a git ref, and `feature/CON-1234-…`
is the shape teams read fastest.

### Slugify pipeline

Order matters; each step exists because of a case the original fails.

1. Split camelCase and PascalCase boundaries (`fixLoginBug` → `fix Login Bug`).
   Done first, while the capitals still carry meaning.
2. Unicode NFD normalize, then drop combining marks (`Corrección` →
   `Correccion`).
3. Transliterate what NFD does not decompose: `ß→ss`, `æ→ae`, `œ→oe`, `ø→o`,
   `đ→d`, `ł→l`, `þ→th`, `ð→d`.
4. Lowercase.
5. Replace every remaining character outside `[a-z0-9]` with the separator.
   One rule covers emoji, CJK, Cyrillic and punctuation, instead of a list of
   special cases that will always be incomplete.
6. Collapse runs of separators, then trim them from both ends.

### Assembly

`assemble(nodes, values)` returns `Segment[]`, where each segment carries its
text and its provenance (`literal` or the token name). Joining the segments
gives the branch name; the same array drives the colored preview. One pass,
one source of truth for both.

**Empty tokens collapse their adjacent separators.** With
`{type}/{project}-{ticket}-{slug}` and no ticket, the result is
`feature/CON-arreglar-login`, never `feature/CON--arreglar-login`. This is the
most visible single improvement over the original.

The rule, precisely — it needs to be, because the obvious implementations get
it wrong:

1. A token whose value is empty becomes a hole and is dropped.
2. For each hole, trim `[-_.]` characters from the **end of the preceding
   literal**. If that removes nothing — there is no preceding literal, or it
   held no trimmable character — trim them from the **start of the following**
   one instead. Exactly one side is trimmed, or `{project}-{ticket}-{slug}`
   would lose both dashes and glue `CON` to the description.
3. `/` is never trimmed by step 2 — `{type}/{ticket}-{slug}` with no ticket
   must stay `feature/arreglar-login`, not `feature-arreglar-login`. This is
   also why step 2 needs its second attempt: there the preceding literal is
   `/`, nothing comes off it, and without falling through to the following
   literal the result would be `feature/-arreglar-login`.
4. Final pass over the joined result: collapse `//` and trim `[-_./]` from
   both ends. That is what removes the trailing slash from `{type}/{slug}`
   with an empty description.

### Validation

`validate(name)` returns `{ status: 'ok' | 'warning' | 'error', issues: Issue[] }`,
where each `Issue` carries a stable `rule` id and a Spanish message. The rule
id is what tests assert on, so every rule below gets its own test.

**Why validation is not redundant with slugify.** Token values come out
sanitized, so on their own they can never break a rule. The template's
_literal_ text does not: `{type} {slug}` has a space in it, `{type}/.{slug}`
opens a component with a dot, `{slug}.lock` ends in a forbidden suffix. Those
literals are deliberately left untouched — silently rewriting what someone
typed into the template box would be worse than telling them it is invalid.
Validation is what makes the template box safe to leave editable.

Rules, from `git check-ref-format` (a branch name is `refs/heads/<name>`):

| Rule id                 | Rejects                                                  |
| ----------------------- | -------------------------------------------------------- |
| `empty`                 | An empty name.                                           |
| `leading-dash`          | Starts with `-`; git parses it as a command-line option. |
| `component-leading-dot` | Any `/`-separated component starting with `.`.           |
| `trailing-dot`          | Ends with `.`.                                           |
| `lock-suffix`           | Any component ending in `.lock`.                         |
| `double-dot`            | Contains `..`.                                           |
| `at-brace`              | Contains `@{`.                                           |
| `single-at`             | Is exactly `@`.                                          |
| `backslash`             | Contains a backslash.                                    |
| `space`                 | Contains a space.                                        |
| `control-char`          | Contains an ASCII control character or DEL.              |
| `special-char`          | Contains `~`, `^`, `:`, `?`, `*` or `[`.                 |
| `slash-edge`            | Starts or ends with `/`.                                 |
| `double-slash`          | Contains `//`.                                           |

One warning rather than an error: `too-long`, over 100 characters. Git imposes
no limit of its own, but longer names wrap in every terminal and truncate in
every UI.

### Presets

Three, shipped in `presets.ts`. A preset sets the template _and_ the type list;
after applying one, both stay editable.

| Preset              | Template                           | Example                           |
| ------------------- | ---------------------------------- | --------------------------------- |
| Jira / Azure Boards | `{type}/{project}-{ticket}-{slug}` | `feature/CON-1234-arreglar-login` |
| GitFlow             | `{type}/{slug}`                    | `feature/arreglar-login`          |
| Ticket first        | `{ticket}-{slug}`                  | `1234-arreglar-login`             |

Default type list: `feature`, `bugfix`, `hotfix`, `chore`, `release`.

The list is edited as one comma-separated text field: entries are trimmed and
empties dropped. If the selected type disappears from the list — after
applying a preset, or after an edit — the selection falls back to the first
entry, so the preview never renders a type nobody can choose again.

## State

The split between configuration and values is the axis the whole UI turns on.

```ts
type Config = {
    // your team's convention — travels in the URL
    template: string;
    project: string;
    types: string[];
};

type Values = {
    // this branch, right now — never leaves the tab
    type: string;
    ticket: string;
    description: string; // free text; becomes {slug}
};
```

Everything else comes out of one pure function, `buildBranch(template, values)`,
which returns `nodes`, `templateIssues`, `segments`, `name`, `validation`,
`command` and `slugDropped`. The store holds no derived field, so there is no
second copy of anything to keep in sync, and the whole derivation is testable
without rendering anything.

`slugDropped` covers a hole this design creates for itself: rule 5 of the
slugify pipeline drops every character outside `[a-z0-9]`, so a description
written in Cyrillic, Greek or CJK produces an empty slug. Silently dropping
what someone typed is exactly the behaviour being fixed in the original, so the
UI says so instead.

## URL sync

`?t=<template>&p=<project>&types=<a,b,c>` — configuration only. The ticket and
the description stay out on purpose: the link hands a colleague your
convention, not your current task.

Read once on mount. Written back with `history.replaceState`, debounced, so
typing a template does not push a hundred entries into the back button.

## UI approach

One screen, no tabs, no modes. Stacked on mobile, two columns from `lg`:

- **Configuration** (left): preset picker, template input with clickable token
  chips that insert `{type}` / `{project}` / `{ticket}` / `{slug}` at the
  caret, type list, project prefix.
- **Fields** (right): type select, ticket, description.
- **Output** (full width, below both): the branch name, large and monospaced,
  each segment colored by the token that produced it; the validation verdict;
  the `git checkout -b` command with its copy button.

Color carries exactly one meaning — which token a piece of the name came from —
and nothing else on the screen is colored. Same discipline as `jwt-viewer`'s
three token segments, and it is what makes an unfamiliar template legible at a
glance.

Empty state: the preview renders the template with dimmed placeholders, so the
shape of the result is visible before anything is typed.

Rejected alternatives:

- A wizard (type → ticket → name → result): rejected because every field fits
  in one glance and the result updates as you type. Steps would add clicks and
  hide the thing you came for.
- Configuration behind a settings modal: rejected because the template is the
  interesting part of this tool, not a preference to tuck away. A modal also
  cannot show the preview reacting to a template edit.

## Keyboard shortcuts

| Keys                   | Action                                                 |
| ---------------------- | ------------------------------------------------------ |
| `Enter` (in any field) | Copy the branch name                                   |
| `Ctrl`/`Cmd` + `Enter` | Copy the `git checkout -b` command                     |
| `Ctrl`/`Cmd` + `K`     | Focus the description                                  |
| `Esc`                  | Clear ticket and description — never the configuration |

Listed in the UI, not hidden. `Enter` copying is safe here because the screen
has exactly one output and nothing to submit.

## Testing

`lib/branch` carries the weight, because it holds the logic:

- `slugify`: a table of cases — accents, `ß`/`æ`/`ø`, emoji, Cyrillic, CJK,
  camelCase, PascalCase, leading and trailing junk, runs of separators, the
  empty string.
- `validate`: one test per rule id, each with a name that violates exactly that
  rule, plus the `too-long` warning boundary.
- `assemble`: empty-token collapsing at the start, middle and end of a
  template; every token empty; a literal-only template.
- `template`: unknown token, unclosed brace, stray braces, empty template.
- `presets`: each preset produces its documented example.
- `config-params`: round-trip Config → query string → Config, including a
  template containing `/`, `{`, `}` and spaces.

Store tests cover applying a preset and clearing values. Component tests cover
`BranchPreview` (segments colored by provenance) and `CopyButton`.

Playwright covers: filling the fields and copying the result; opening a URL
that carries a configuration and seeing it applied; an invalid template leaving
the page usable; responsive at 390/768/1366.

## Conventions

Follows `jwt-viewer` exactly:

- Identifiers, file names, types and agent-facing docs in English.
- **Everything a person reads is Spanish, using voseo** — UI copy, validation
  messages, code comments, test names, README.
- Tailwind v4 CSS-first. All tokens in `globals.css`; semantic classes only,
  never raw hex or stock palette colors.
- Classes composed with `cn()`.
- `yarn validate` = type-check + lint + format:check + unit tests. It does not
  run `yarn build`; both must pass before anything is called done.
- E2E specs named `*.e2e.ts`, so Vitest never collects them.
- Commits: Conventional Commits, English, no AI attribution of any kind.
