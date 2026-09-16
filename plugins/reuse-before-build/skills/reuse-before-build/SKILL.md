---
name: reuse-before-build
description: Search GitHub before substantial development and decide whether to use an existing project directly, fork or compose it, borrow its design patterns, or build fresh. Use when starting a project or major subsystem, when the user says "有没有现成的", "先找找", "能不能直接用", "抄一个方案", or asks to avoid reinventing the wheel.
---

# Reuse Before Build

Reduce total implementation and maintenance cost by checking public prior art before writing substantial code.

## Trigger

Use proactively for:

- a new app, website, service, agent, workflow, CLI, dashboard, crawler, or reusable tool;
- a substantial subsystem such as authentication, search, scheduling, payments, uploads, queueing, parsing, notifications, or data pipelines;
- requests to build something "from scratch" or to avoid reinventing the wheel.

Do not use for a narrow bug fix, a small utility, a learning exercise whose purpose is building from scratch, or work where the user already chose the upstream project and only wants implementation help.

## Hard Gate

This is a pre-development review. Until the user explicitly approves the recommendation, do not scaffold, install dependencies, edit application code, begin a refactor, or deploy anything. Research, source inspection, comparison, and a minimal design are allowed.

## Workflow

### 1. Frame the requirement

State the intended capability, target user, must-have behavior, runtime/platform, deployment constraints, privacy needs, and existing repository constraints. Inspect local code first when one exists. Ask only for missing information that can materially change the recommendation.

### 2. Search GitHub first

Prefer GitHub MCP tools when available. Otherwise use `gh search repos`, the GitHub REST API, or reliable web search. Search capability terms, synonyms, stack constraints, and adjacent implementations, not just the proposed product name.

Keep 3-5 serious candidates. Star count is a discovery signal, not a decision.

### 3. Verify winners from source

For each serious candidate inspect, where available:

- purpose and actual scope;
- latest meaningful commits and releases;
- archived/deprecated status;
- license and major transitive-license risk;
- issue/PR responsiveness and abandonment signals;
- installation and deployment path;
- tests, examples, and extension boundaries;
- representative source, config, and test files;
- security, privacy, credential, and data-egress risk;
- exit and migration cost.

Read [references/decision-rubric.md](references/decision-rubric.md) when comparing close candidates or when licensing and maintenance health are decisive.

### 4. Search secondary ecosystems only when useful

Use npm, PyPI, crates.io, Maven Central, Hugging Face, MCP Registry, or official product pages only when they can change the decision. Do not search every registry by default.

### 5. Choose exactly one main decision

- `USE DIRECTLY`: adopt the project substantially as-is.
- `FORK / COMPOSE`: reuse the core or combine mature components with limited adaptation.
- `BORROW PATTERNS`: reuse architecture, API shape, UI interaction, tests, or operational lessons without copying code.
- `BUILD FRESH`: existing options are stale, incompatible, unsafe, too complex, or license-incompatible.

Explain why the chosen path beats the alternatives.

### 6. Define the smallest MVP

State:

- reused unchanged;
- adapted;
- custom-built;
- intentionally deferred;
- verification criteria.

Do not expand scope before the first working vertical slice.

## Integration With Goal DAG

When `goal-dag` adds an implementation branch, run this review before implementation starts. The result can be stored as the branch artifact, for example:

```text
docs/reuse/<branch-id>.md
```

The goal branch remains `pending` until the reuse decision is approved, then moves to `active`.

## Output Contract

Keep the report decision-oriented:

1. **Recommendation:** one sentence with `USE DIRECTLY`, `FORK / COMPOSE`, `BORROW PATTERNS`, or `BUILD FRESH`.
2. **Candidate table:** at most five candidates with fit, maintenance, reuse cost, license/security risk, and verdict.
3. **Evidence:** strongest verified source files, releases, tests, and unknowns.
4. **Smallest MVP:** reuse, adapt, custom-build, defer.
5. **Decision gate:** `Implementation status: NOT STARTED - waiting for explicit approval.`

After approval, proceed with implementation. If scope materially changes, run the reuse review again.

## Final Checks

- GitHub was searched first when public research was allowed.
- Serious candidates were verified beyond README claims.
- License, maintenance, security, deployment, and exit cost were considered.
- Exactly one main decision was chosen.
- The MVP is smaller than the full wish list.
- No implementation began before explicit approval.
- Verified facts and inferences are clearly separated.
