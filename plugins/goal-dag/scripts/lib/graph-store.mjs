import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export function resolveGraphPath(root) {
  return join(root, ".goal-dag", "graph.json");
}

export async function graphExists(root) {
  try {
    await readFile(resolveGraphPath(root), "utf8");
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export async function loadGraph(root) {
  const path = resolveGraphPath(root);
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "No goal graph exists. Call goal_graph_init before reading or editing.",
      );
    }
    throw error;
  }
}

export async function saveGraph(root, graph) {
  const path = resolveGraphPath(root);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
  return path;
}
