import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

async function withServer(run) {
  const root = await mkdtemp(join(tmpdir(), "goal-dag-"));
  const child = spawn(process.execPath, ["scripts/server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, GOAL_DAG_ROOT: root },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const pending = new Map();
  let buffer = "";
  let nextId = 1;

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) {
        const message = JSON.parse(line);
        if (message.id && pending.has(message.id)) {
          pending.get(message.id)(message);
          pending.delete(message.id);
        }
      }
      newline = buffer.indexOf("\n");
    }
  });

  function request(method, params = {}) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, 3000);
      pending.set(id, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }

  try {
    await run({ request, root });
  } finally {
    child.kill();
    await rm(root, { recursive: true, force: true });
  }
}

test("initializes as an MCP tool server", async () => {
  await withServer(async ({ request }) => {
    const response = await request("initialize", {
      protocolVersion: "2025-06-18",
      clientInfo: { name: "test", version: "1.0.0" },
    });

    assert.equal(response.result.serverInfo.name, "goal-dag");
    assert.ok(response.result.capabilities.tools);
  });
});

test("lists goal graph tools", async () => {
  await withServer(async ({ request }) => {
    const response = await request("tools/list");
    const names = response.result.tools.map((tool) => tool.name);

    assert.deepEqual(names, [
      "goal_graph_init",
      "goal_graph_get",
      "goal_graph_add_branch",
      "goal_graph_add_merge",
      "goal_node_upsert",
      "goal_node_set_status",
      "goal_edge_upsert",
      "goal_graph_validate",
      "goal_graph_ready",
      "goal_graph_mermaid",
    ]);
  });
});

test("initializes and reads a local graph", async () => {
  await withServer(async ({ request, root }) => {
    const init = await request("tools/call", {
      name: "goal_graph_init",
      arguments: { id: "empire", title: "Build a large business" },
    });
    assert.equal(init.result.isError, undefined);

    const get = await request("tools/call", {
      name: "goal_graph_get",
      arguments: {},
    });
    assert.equal(get.result.structuredContent.graph.rootId, "empire");

    const saved = JSON.parse(
      await readFile(join(root, ".goal-dag", "graph.json"), "utf8"),
    );
    assert.equal(saved.nodes.empire.title, "Build a large business");
  });
});

test("does not overwrite an existing graph on repeated init", async () => {
  await withServer(async ({ request }) => {
    await request("tools/call", {
      name: "goal_graph_init",
      arguments: { id: "first", title: "First root" },
    });

    const second = await request("tools/call", {
      name: "goal_graph_init",
      arguments: { id: "second", title: "Second root" },
    });

    assert.equal(second.result.isError, true);
    const get = await request("tools/call", {
      name: "goal_graph_get",
      arguments: {},
    });
    assert.equal(get.result.structuredContent.graph.rootId, "first");
  });
});

test("adds multiple branches and a merge node", async () => {
  await withServer(async ({ request }) => {
    await request("tools/call", {
      name: "goal_graph_init",
      arguments: { id: "empire", title: "Build a large business" },
    });

    await request("tools/call", {
      name: "goal_graph_add_branch",
      arguments: {
        parentId: "empire",
        branches: [
          { id: "marketing", title: "Marketing" },
          { id: "technology", title: "Technology" },
        ],
      },
    });

    await request("tools/call", {
      name: "goal_graph_add_merge",
      arguments: {
        id: "validation",
        title: "Validate the combined business",
        parents: ["marketing", "technology"],
      },
    });

    const get = await request("tools/call", {
      name: "goal_graph_get",
      arguments: {},
    });
    const graph = get.result.structuredContent.graph;

    assert.deepEqual(graph.nodes.validation.parents, [
      "marketing",
      "technology",
    ]);
    assert.equal(graph.edges.length, 4);
  });
});

test("updates node status without replacing the node", async () => {
  await withServer(async ({ request }) => {
    await request("tools/call", {
      name: "goal_graph_init",
      arguments: { id: "empire", title: "Build a large business" },
    });

    const response = await request("tools/call", {
      name: "goal_node_set_status",
      arguments: { nodeId: "empire", status: "active" },
    });

    assert.equal(response.result.structuredContent.node.title, "Build a large business");
    assert.equal(response.result.structuredContent.node.status, "active");
  });
});
