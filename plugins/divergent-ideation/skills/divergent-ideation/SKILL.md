---
name: divergent-ideation
description: Generate and refine structurally diverse ideas for brainstorming, innovation, strategy, naming, product concepts, and difficult problem-solving. Use when the user asks to brainstorm, diverge, generate creative options, break assumptions, get unstuck, or evaluate an idea portfolio. Do not use for routine execution, simple fact lookup, or implementation work whose direction is already settled.
---

# Divergent Ideation

Turn a rough problem into a diverse option portfolio, then converge without
discarding the strongest unusual ideas.

## Core Rules

1. **Separate generation from evaluation.** Do not rank, criticize, or reject
   an idea while generating the raw set.
2. **Expand before refining.** Breadth comes first; details come after the
   option space is mapped.
3. **Require mechanism diversity.** Two ideas are different only when they use
   a different mechanism, assumption, or constraint strategy.
4. **State assumptions.** If the brief is incomplete, infer the smallest
   useful set, label the assumptions, and continue. Ask only when a missing
   fact would send the work in a materially wrong direction.
5. **Do not manufacture evidence.** Mark unknowns and distinguish evidence
   from intuition.
6. **Resist anchoring.** Give an idea no special status merely because the
   user or another participant mentioned it first.

## Choose A Mode

- **Full ideation**: new opportunity, innovation program, strategy, or broad
  creative request. Target 20-40 ideas across at least six lenses.
- **Focused sprint**: product feature, workflow, name, campaign, or bounded
  concept. Target 10-20 ideas across at least three lenses.
- **Unstick**: the user is trapped in one direction. Generate 8-12 alternatives
  with at least three forced provocations.
- **Converge**: raw ideas already exist. Deduplicate, evaluate, and produce a
  small portfolio without generating more unless diversity is weak.
- **Stress test**: one idea is already selected. Attack its assumptions,
  failure modes, and alternatives before recommending commitment.

Announce the selected mode in one sentence. The user can redirect it.

Choose the interaction style explicitly:

- **Facilitated**: when the user wants to think together, ask one high-value
  question at a time and wait for the answer.
- **Autonomous**: when the user asks you to run the session, state assumptions
  and produce the complete brief without stopping for routine confirmation.

## Workflow

### 1. Frame

Establish:

- the decision to be made;
- the desired outcome;
- the user or beneficiary;
- hard constraints and non-goals;
- what would make an option successful.

For incomplete briefs, state the assumptions you will use. Prefer one concise
question over a long questionnaire. In autonomous mode, make the assumptions
explicit and proceed.

Rewrite the problem as three "How might we..." questions:

- a broad outcome question;
- a constraint-focused question;
- a deliberately disruptive question.

Do not embed a solution in the question.

### 2. Diverge

Select relevant methods from
[references/method-bank.md](references/method-bank.md). Use several
structurally different lenses rather than repeating one method.

For every idea, capture:

```text
ID:
Name:
Mechanism:
Core assumption:
What makes it different:
First test:
```

Generate raw ideas in compact form. Do not score them yet.

At the end of generation, audit diversity:

- Is every idea merely a variation of the same mechanism?
- Which assumptions do all ideas share?
- Which user, geography, business model, technology, or delivery model has not
  been considered?
- Which obvious option is missing because it is politically or socially
  uncomfortable?

If the set fails the diversity test, generate another lens rather than adding
more variations.

### 3. Provoke

Run at least three provocations from:

- remove the core feature or step;
- reverse who performs the work;
- multiply the budget by 10 and divide it by 10;
- model the solution on an unrelated domain;
- make the opposite assumption;
- give the problem to an extreme user;
- force a random word or image into the design;
- optimize a different variable entirely.

Add at least five ideas that were not reachable through ordinary feature
thinking. Reject only literal nonsense; preserve strange ideas that expose a
new mechanism.

### 4. Cluster

Remove exact duplicates and merge ideas that share all three of:

- the same mechanism;
- the same core assumption;
- the same cost or delivery profile.

Label each remaining idea as:

- `Safe`: likely to work and easy to defend;
- `Asymmetric`: bounded downside with a potentially large upside;
- `Wild`: low immediate feasibility but capable of exposing a new direction.

Name the mechanism for every cluster. A smaller set of genuinely different
mechanisms is better than a long list of renamed variations.

### 5. Converge

Read
[references/evaluation-rubric.md](references/evaluation-rubric.md) before
scoring.

Apply the hard gates first, then score the surviving ideas. Keep the scoring
visible enough that the user can disagree with one dimension without rejecting
the whole recommendation.

Build a portfolio rather than selecting only the highest average:

- one safe option;
- one asymmetric option;
- optionally one wild card when uncertainty is high or the current approach is
  weak.

For each selected option, define the cheapest test that could falsify its
weakest assumption. Prefer a test that can produce meaningful evidence within
24-72 hours.

### 6. Close The Loop

Report:

1. framing and assumptions;
2. count of ideas and mechanisms explored;
3. strongest portfolio with reasons;
4. rejected directions that may deserve a later revisit;
5. first tests and decision criteria.

When an implementation direction is selected and `$reuse-before-build` is
available, run a reuse review before writing code.

When a `goal-dag` graph is active, attach the ideation artifact to the relevant
branch and store the selected direction as that branch's decision artifact.

## Guardrails

- Do not collapse to three safe ideas and call the work complete.
- Do not score ideas during generation.
- Do not use novelty as a substitute for usefulness.
- Do not use feasibility as a reason to suppress a wild idea before the
  portfolio stage.
- Do not present a total score without showing what drove it.
- Do not confuse fluency with originality. More ideas do not automatically
  mean better ideas.
- Do not continue generating once new ideas are only recombinations of known
  mechanisms and the user has enough material to decide.

## Output Contract

Use a compact decision brief:

```markdown
## Framing
## Assumptions
## Diverge
### Mechanism Clusters
## Provocations
## Evaluation
## Recommended Portfolio
## First Tests
## Revisit Later
```

For a focused sprint, collapse empty sections. For a full session, write the
brief to `docs/ideation/<topic>-YYYY-MM-DD.md` unless the user specifies
another location.
