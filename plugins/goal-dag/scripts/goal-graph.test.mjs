import test from "node:test";
import assert from "node:assert/strict";

import {
  createGraph,
  upsertNode,
  upsertEdge,
  validateGraph,
  getReadyNodes,
} from "./lib/goal-graph.mjs";

function buildMergeGraph() {
  const graph = createGraph({
    id: "empire",
    title: "Build a large business",
  });

  upsertNode(graph, { id: "marketing", title: "Marketing" });
  upsertNode(graph, { id: "technology", title: "Technology" });
  upsertNode(graph, {
    id: "validation",
    title: "Validate the combined business",
    join: "all",
  });

  upsertEdge(graph, { from: "empire", to: "marketing", required: true });
  upsertEdge(graph, { from: "empire", to: "technology", required: true });
  upsertEdge(graph, { from: "marketing", to: "validation", required: true });
  upsertEdge(graph, { from: "technology", to: "validation", required: true });

  return graph;
}

test("accepts a DAG whose node has multiple required parents", () => {
  const graph = buildMergeGraph();

  assert.deepEqual(validateGraph(graph), { valid: true, errors: [] });
  assert.deepEqual(graph.nodes.validation.parents, ["marketing", "technology"]);
});

test("does not release a merge node until every required parent is complete", () => {
  const graph = buildMergeGraph();
  graph.nodes.empire.status = "completed";

  assert.deepEqual(
    getReadyNodes(graph).map((node) => node.id),
    ["marketing", "technology"],
  );

  graph.nodes.marketing.status = "completed";
  assert.deepEqual(
    getReadyNodes(graph).map((node) => node.id),
    ["technology"],
  );

  graph.nodes.technology.status = "completed";
  assert.deepEqual(
    getReadyNodes(graph).map((node) => node.id),
    ["validation"],
  );
});

test("optional incoming edges do not block a node", () => {
  const graph = createGraph({ id: "root", title: "Root" });
  upsertNode(graph, { id: "required-work", title: "Required work" });
  upsertNode(graph, { id: "optional-research", title: "Optional research" });
  upsertNode(graph, { id: "next", title: "Next step", join: "all" });

  upsertEdge(graph, { from: "root", to: "required-work", required: true });
  upsertEdge(graph, { from: "root", to: "optional-research", required: true });
  upsertEdge(graph, { from: "required-work", to: "next", required: true });
  upsertEdge(graph, { from: "optional-research", to: "next", required: false });

  graph.nodes.root.status = "completed";
  graph.nodes["required-work"].status = "completed";

  assert.deepEqual(
    getReadyNodes(graph).map((node) => node.id),
    ["next", "optional-research"],
  );
});

test("join any releases a merge node after one required parent completes", () => {
  const graph = createGraph({ id: "root", title: "Root" });
  upsertNode(graph, { id: "branch-a", title: "Branch A" });
  upsertNode(graph, { id: "branch-b", title: "Branch B" });
  upsertNode(graph, { id: "merge", title: "Merge", join: "any" });

  upsertEdge(graph, { from: "root", to: "branch-a", required: true });
  upsertEdge(graph, { from: "root", to: "branch-b", required: true });
  upsertEdge(graph, { from: "branch-a", to: "merge", required: true });
  upsertEdge(graph, { from: "branch-b", to: "merge", required: true });

  graph.nodes.root.status = "completed";
  graph.nodes["branch-a"].status = "completed";

  assert.deepEqual(
    getReadyNodes(graph).map((node) => node.id),
    ["branch-b", "merge"],
  );
});

test("preserves a node UI position across metadata updates", () => {
  const graph = createGraph({ id: "root", title: "Root" });
  upsertNode(graph, {
    id: "root",
    title: "Updated root",
    ui: { x: 120, y: 240 },
  });
  upsertNode(graph, { id: "root", title: "Updated again" });

  assert.deepEqual(graph.nodes.root.ui, { x: 120, y: 240 });
});

test("rejects a cycle", () => {
  const graph = createGraph({ id: "a", title: "A" });
  upsertNode(graph, { id: "b", title: "B" });
  upsertEdge(graph, { from: "a", to: "b", required: true });
  upsertEdge(graph, { from: "b", to: "a", required: true });

  const result = validateGraph(graph);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "CYCLE"));
});

test("rejects an edge that references a missing node", () => {
  const graph = createGraph({ id: "a", title: "A" });
  upsertEdge(graph, { from: "a", to: "missing", required: true });

  const result = validateGraph(graph);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "MISSING_NODE"));
});
