---
name: goal-dag
description: Manage long-horizon work as a directed acyclic goal graph with branching, multi-parent merges, and multiple parallel trunks. Use when the user asks to add or remove branches, decompose a goal, create a merge gate, track goal status, or authorizes autonomous goal expansion.
---

# Goal DAG

Use the local graph as the source of truth for the project's current goal state. Do not reconstruct the graph only from chat history.

## Workflow

1. Call `goal_graph_get`. If it does not exist, call `goal_graph_init` with the root goal.
2. Express each node as an outcome with a stable ID, not as a vague activity.
3. When the user asks for one or more branches, call `goal_graph_add_branch` immediately.
4. When branches must converge, call `goal_graph_add_merge`.
5. Use `goal_node_set_status` when work starts, blocks, completes, fails, or is cancelled.
6. Call `goal_graph_validate` before scheduling any work.
7. Call `goal_graph_ready` to find pending nodes whose required upstream branches are complete.
8. Run at most one writable Codex thread per node. Different nodes may run in parallel only with isolated worktrees or non-overlapping write scopes.
9. Store each node's output as an artifact. A merge node reads upstream artifacts, resolves conflicts, records the decision, and emits the next work.
10. Before implementing a substantial project or subsystem branch, use `$reuse-before-build` when available and store the reuse decision as the branch artifact.

## Autonomous Expansion

- If the user says "add this branch", add it without asking for confirmation unless the parent or requested outcome is genuinely ambiguous.
- If the user authorizes autonomous planning or expansion, add a bounded set of 2-5 useful branches at a time.
- Never erase or rename existing branches during autonomous expansion.
- Default new branches to `pending`, `join: "all"`, and required `decompose` edges.
- Create a merge gate only when the user requests convergence or all branch outputs are clearly required by the same next outcome.
- After changing the graph, report the new branch IDs, the parent, and any newly ready nodes.

## Graph Rules

- Nodes may have multiple parents. A graph is not required to remain a tree.
- `join: "all"` waits for every required parent. `join: "any"` releases after one required parent completes.
- Optional edges provide context but never block readiness.
- Keep execution acyclic. Represent a feedback loop as a new versioned node rather than adding a dependency cycle.
- Use `goal_graph_mermaid` when a human review needs a compact visual.

Read [references/schema.md](references/schema.md) when creating or repairing a graph.

## Thread And Message Policy

- Map one node to one Codex thread and persist its `threadId` in the node runtime metadata.
- `Steer` changes the current turn without stopping it.
- `Queue` stores the message for the next turn after the current run completes.
- `Interrupt & Redirect` stops the active turn, records why it was interrupted, then starts a new turn with the new instruction.
- Never silently retarget a branch after a merge. The merge node owns the new direction.

## Merge Protocol

At a merge node:

1. Read only the named artifacts and current node summaries from upstream branches.
2. List agreements, conflicts, missing evidence, and irreversible decisions.
3. Decide whether to proceed, narrow, split, or stop.
4. Write the decision and its evidence to the merge node.
5. Create the next nodes only after the merge decision is explicit.

Do not concatenate complete branch transcripts. This causes context pollution and hides unresolved conflicts.

## Scope

Use this skill for long-running, branching, converging, or portfolio-shaped work. Do not use it for a single linear task that fits in one thread.
