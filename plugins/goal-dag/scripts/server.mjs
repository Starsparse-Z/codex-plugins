import readline from "node:readline";

import {
  createGraph,
  getReadyNodes,
  upsertEdge,
  upsertNode,
  validateGraph,
} from "./lib/goal-graph.mjs";
import {
  graphExists,
  loadGraph,
  saveGraph,
} from "./lib/graph-store.mjs";

const SERVER_INFO = { name: "goal-dag", version: "0.1.0" };
const PROTOCOL_VERSION = "2025-06-18";
const ROOT = process.env.GOAL_DAG_ROOT || process.cwd();

const TOOLS = [
  {
    name: "goal_graph_init",
    title: "Initialize goal DAG",
    description:
      "Create the local goal DAG. Use once per project before adding nodes or edges.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Stable root goal ID." },
        title: { type: "string", description: "Root goal title." },
      },
      required: ["id", "title"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_graph_get",
    title: "Get goal DAG",
    description:
      "Read the complete local goal DAG, including nodes, edges, status, and runtime metadata.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: "goal_graph_add_branch",
    title: "Add goal branches",
    description:
      "Add one or more child goal branches under a parent node. Use this when the user asks to add a branch or authorizes autonomous decomposition.",
    inputSchema: {
      type: "object",
      properties: {
        parentId: {
          type: "string",
          description: "Parent node ID. Defaults to the graph root.",
        },
        branches: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              kind: { type: "string" },
              status: {
                type: "string",
                enum: [
                  "pending",
                  "active",
                  "blocked",
                  "completed",
                  "failed",
                  "cancelled",
                ],
              },
              join: { type: "string", enum: ["all", "any"] },
              edgeType: { type: "string" },
              required: { type: "boolean" },
            },
            required: ["title"],
            additionalProperties: false,
          },
        },
      },
      required: ["branches"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_graph_add_merge",
    title: "Add a merge gate",
    description:
      "Create a merge node and connect multiple required parent branches into it.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        parents: {
          type: "array",
          minItems: 2,
          items: { type: "string" },
        },
        join: { type: "string", enum: ["all", "any"] },
        edgeType: { type: "string" },
        required: { type: "boolean" },
      },
      required: ["title", "parents"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_node_upsert",
    title: "Create or update a goal node",
    description:
      "Create or update one objective, workstream, company, milestone, or merge gate.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        kind: { type: "string" },
        status: {
          type: "string",
          enum: [
            "pending",
            "active",
            "blocked",
            "completed",
            "failed",
            "cancelled",
          ],
        },
        join: { type: "string", enum: ["all", "any"] },
        ui: {
          type: ["object", "null"],
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            lastDecision: { type: "string" },
            lastDecisionAt: { type: "string" },
          },
          additionalProperties: true,
        },
        runtime: {
          type: "object",
          properties: {
            threadId: { type: ["string", "null"] },
            activeTurnId: { type: ["string", "null"] },
            messageQueue: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          },
          additionalProperties: true,
        },
      },
      required: ["id", "title"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_node_set_status",
    title: "Set goal node status",
    description:
      "Update only a goal node's status without replacing its title or metadata.",
    inputSchema: {
      type: "object",
      properties: {
        nodeId: { type: "string" },
        status: {
          type: "string",
          enum: [
            "pending",
            "active",
            "blocked",
            "completed",
            "failed",
            "cancelled",
          ],
        },
      },
      required: ["nodeId", "status"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_edge_upsert",
    title: "Create or update a goal edge",
    description:
      "Connect two nodes with a dependency, contribution, alternative, or merge edge.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        type: { type: "string" },
        required: { type: "boolean" },
      },
      required: ["from", "to"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  {
    name: "goal_graph_validate",
    title: "Validate goal DAG",
    description:
      "Check for missing nodes, self-edges, and cycles before scheduling work.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: "goal_graph_ready",
    title: "List ready goal nodes",
    description:
      "Return pending nodes whose required incoming branches are complete.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: "goal_graph_mermaid",
    title: "Render goal DAG as Mermaid",
    description:
      "Render the graph as Mermaid flowchart text for review or embedding.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
];

let writeQueue = Promise.resolve();

function enqueueWrite(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

function textResult(text, structuredContent) {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}

function errorResult(error) {
  return {
    isError: true,
    content: [{ type: "text", text: error.message }],
  };
}

function mermaidId(id) {
  return `n_${id.replace(/[^A-Za-z0-9_]/g, "_")}`;
}

function renderMermaid(graph) {
  const lines = ["flowchart LR"];
  for (const node of Object.values(graph.nodes)) {
    const label = `${node.title}\\n[${node.status}]`;
    lines.push(`  ${mermaidId(node.id)}["${label.replaceAll('"', "'")}"]`);
  }
  for (const edge of graph.edges) {
    const arrow = edge.required ? "-->" : "-.->";
    lines.push(
      `  ${mermaidId(edge.from)} ${arrow}|${edge.type}| ${mermaidId(edge.to)}`,
    );
  }
  return lines.join("\n");
}

function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "branch";
}

function uniqueNodeId(graph, requestedId, title) {
  const base = requestedId || slugify(title);
  if (!graph.nodes[base]) return base;
  let suffix = 2;
  while (graph.nodes[`${base}-${suffix}`]) suffix += 1;
  return `${base}-${suffix}`;
}

async function callTool(name, args) {
  switch (name) {
    case "goal_graph_init": {
      return enqueueWrite(async () => {
        if (await graphExists(ROOT)) {
          throw new Error(
            "A goal graph already exists. Read it before making changes instead of overwriting it.",
          );
        }
        const graph = createGraph({ id: args.id, title: args.title });
        const path = await saveGraph(ROOT, graph);
        return textResult(`Created goal DAG at ${path}.`, { graph, path });
      });
    }
    case "goal_graph_get": {
      const graph = await loadGraph(ROOT);
      return textResult(`Loaded goal DAG with ${Object.keys(graph.nodes).length} nodes.`, {
        graph,
      });
    }
    case "goal_graph_add_branch": {
      return enqueueWrite(async () => {
        const graph = await loadGraph(ROOT);
        const parentId = args.parentId || graph.rootId;
        if (!graph.nodes[parentId]) {
          throw new Error(`Parent node not found: ${parentId}`);
        }
        const added = [];
        for (const branch of args.branches) {
          const id = uniqueNodeId(graph, branch.id, branch.title);
          const node = upsertNode(graph, {
            id,
            title: branch.title,
            kind: branch.kind ?? "objective",
            status: branch.status ?? "pending",
            join: branch.join ?? "all",
          });
          const edge = upsertEdge(graph, {
            from: parentId,
            to: id,
            type: branch.edgeType ?? "decompose",
            required: branch.required ?? true,
          });
          added.push({ node, edge });
        }
        await saveGraph(ROOT, graph);
        return textResult(
          `Added ${added.length} branch(es) under ${parentId}.`,
          { added, graph },
        );
      });
    }
    case "goal_graph_add_merge": {
      return enqueueWrite(async () => {
        const graph = await loadGraph(ROOT);
        const missing = args.parents.filter((id) => !graph.nodes[id]);
        if (missing.length) {
          throw new Error(`Parent nodes not found: ${missing.join(", ")}`);
        }
        const id = uniqueNodeId(graph, args.id, args.title);
        const node = upsertNode(graph, {
          id,
          title: args.title,
          kind: "merge_gate",
          status: "pending",
          join: args.join ?? "all",
        });
        const edges = args.parents.map((parentId) =>
          upsertEdge(graph, {
            from: parentId,
            to: id,
            type: args.edgeType ?? "merge_into",
            required: args.required ?? true,
          }),
        );
        await saveGraph(ROOT, graph);
        return textResult(`Created merge node ${id}.`, {
          node,
          edges,
          graph,
        });
      });
    }
    case "goal_node_upsert": {
      return enqueueWrite(async () => {
        const graph = await loadGraph(ROOT);
        const node = upsertNode(graph, args);
        await saveGraph(ROOT, graph);
        return textResult(`Saved node ${node.id}.`, { node, graph });
      });
    }
    case "goal_node_set_status": {
      return enqueueWrite(async () => {
        const graph = await loadGraph(ROOT);
        const node = graph.nodes[args.nodeId];
        if (!node) throw new Error(`Node not found: ${args.nodeId}`);
        node.status = args.status;
        graph.updatedAt = new Date().toISOString();
        await saveGraph(ROOT, graph);
        return textResult(`Set ${args.nodeId} to ${args.status}.`, {
          node,
          graph,
        });
      });
    }
    case "goal_edge_upsert": {
      return enqueueWrite(async () => {
        const graph = await loadGraph(ROOT);
        const edge = upsertEdge(graph, args);
        await saveGraph(ROOT, graph);
        return textResult(`Connected ${edge.from} to ${edge.to}.`, {
          edge,
          graph,
        });
      });
    }
    case "goal_graph_validate": {
      const graph = await loadGraph(ROOT);
      const validation = validateGraph(graph);
      return textResult(
        validation.valid ? "Goal DAG is valid." : "Goal DAG has validation errors.",
        validation,
      );
    }
    case "goal_graph_ready": {
      const graph = await loadGraph(ROOT);
      const nodes = getReadyNodes(graph);
      return textResult(`${nodes.length} goal node(s) are ready.`, { nodes });
    }
    case "goal_graph_mermaid": {
      const graph = await loadGraph(ROOT);
      const mermaid = renderMermaid(graph);
      return textResult(mermaid, { mermaid });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handle(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: message.params?.protocolVersion ?? PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER_INFO,
      instructions:
        "Use one goal node per Codex thread. Call goal_graph_validate before scheduling. For merged nodes, create one synthesis thread and read each upstream node's artifacts rather than concatenating full chat histories.",
    };
  }

  if (message.method === "tools/list") {
    return { tools: TOOLS };
  }

  if (message.method === "tools/call") {
    try {
      return await callTool(message.params?.name, message.params?.arguments ?? {});
    } catch (error) {
      return errorResult(error);
    }
  }

  if (message.method === "ping") {
    return {};
  }

  const error = new Error(`Method not found: ${message.method}`);
  error.code = -32601;
  throw error;
}

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

input.on("line", async (line) => {
  if (!line.trim()) return;

  let message;
  try {
    message = JSON.parse(line);
  } catch {
    process.stdout.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      })}\n`,
    );
    return;
  }

  if (message.id === undefined) return;

  try {
    const result = await handle(message);
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: "2.0", id: message.id, result })}\n`,
    );
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: error.code ?? -32603,
          message: error.message,
        },
      })}\n`,
    );
  }
});
