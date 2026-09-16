const STATUSES = new Set([
  "pending",
  "active",
  "blocked",
  "completed",
  "failed",
  "cancelled",
]);

function clampStatus(status) {
  return STATUSES.has(status) ? status : "pending";
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

function refreshRelationships(graph) {
  for (const node of Object.values(graph.nodes)) {
    node.parents = [];
    node.children = [];
  }

  for (const edge of graph.edges) {
    if (graph.nodes[edge.from]) {
      graph.nodes[edge.from].children.push(edge.to);
    }
    if (graph.nodes[edge.to]) {
      graph.nodes[edge.to].parents.push(edge.from);
    }
  }

  for (const node of Object.values(graph.nodes)) {
    node.parents = [...new Set(node.parents)].sort();
    node.children = [...new Set(node.children)].sort();
  }
}

export function createGraph({ id, title }) {
  return {
    version: 1,
    rootId: id,
    nodes: {
      [id]: {
        id,
        title,
        kind: "goal",
        status: "pending",
        join: "all",
        ui: { x: 0, y: 0 },
        parents: [],
        children: [],
        artifacts: [],
        runtime: {
          threadId: null,
          activeTurnId: null,
        },
      },
    },
    edges: [],
    updatedAt: new Date().toISOString(),
  };
}

export function upsertNode(graph, node) {
  const existing = graph.nodes[node.id];
  graph.nodes[node.id] = {
    id: node.id,
    title: node.title ?? existing?.title ?? node.id,
    kind: node.kind ?? existing?.kind ?? "objective",
    status: clampStatus(node.status ?? existing?.status ?? "pending"),
    join: node.join ?? existing?.join ?? "all",
    ui: node.ui ?? existing?.ui ?? null,
    parents: existing?.parents ?? [],
    children: existing?.children ?? [],
    artifacts: node.artifacts ?? existing?.artifacts ?? [],
    runtime: {
      ...(existing?.runtime ?? { threadId: null, activeTurnId: null }),
      ...(node.runtime ?? {}),
    },
  };
  refreshRelationships(graph);
  graph.updatedAt = new Date().toISOString();
  return graph.nodes[node.id];
}

export function upsertEdge(graph, edge) {
  const key = edgeKey(edge.from, edge.to);
  const next = {
    id: edge.id ?? key,
    from: edge.from,
    to: edge.to,
    type: edge.type ?? "depends_on",
    required: edge.required ?? true,
  };
  const index = graph.edges.findIndex((current) => current.id === next.id);

  if (index === -1) {
    graph.edges.push(next);
  } else {
    graph.edges[index] = next;
  }

  refreshRelationships(graph);
  graph.updatedAt = new Date().toISOString();
  return next;
}

export function validateGraph(graph) {
  const errors = [];

  for (const edge of graph.edges) {
    if (!graph.nodes[edge.from] || !graph.nodes[edge.to]) {
      errors.push({
        code: "MISSING_NODE",
        message: `Edge ${edge.from} -> ${edge.to} references a missing node.`,
      });
    }
    if (edge.from === edge.to) {
      errors.push({
        code: "SELF_EDGE",
        message: `Node ${edge.from} cannot depend on itself.`,
      });
    }
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(nodeId) {
    if (visiting.has(nodeId)) {
      errors.push({
        code: "CYCLE",
        message: `Cycle detected at node ${nodeId}.`,
      });
      return;
    }
    if (visited.has(nodeId)) return;

    visiting.add(nodeId);
    for (const edge of graph.edges) {
      if (edge.from === nodeId && graph.nodes[edge.to]) {
        visit(edge.to);
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  for (const nodeId of Object.keys(graph.nodes)) {
    visit(nodeId);
  }

  return { valid: errors.length === 0, errors };
}

export function getReadyNodes(graph) {
  const requiredIncoming = new Map();

  for (const nodeId of Object.keys(graph.nodes)) {
    requiredIncoming.set(nodeId, []);
  }

  for (const edge of graph.edges) {
    if (edge.required && requiredIncoming.has(edge.to)) {
      requiredIncoming.get(edge.to).push(edge.from);
    }
  }

  return Object.values(graph.nodes)
    .filter((node) => node.status === "pending")
    .filter((node) => {
      const parents = requiredIncoming.get(node.id);
      const completed = parents.filter(
        (parentId) => graph.nodes[parentId]?.status === "completed",
      );
      return node.join === "any"
        ? parents.length === 0 || completed.length > 0
        : completed.length === parents.length;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}
