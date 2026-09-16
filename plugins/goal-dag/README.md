# Goal DAG

Goal DAG is a local-first Codex plugin for long-horizon work that cannot be represented as a linear plan or a single-parent tree. It is controlled from the Codex conversation, without a UI.

It supports:

- add a branch by describing it in chat
- add several branches when autonomous expansion is authorized
- send multiple branches into a merge gate
- update node status as work progresses
- query ready nodes and validate the DAG
- render Mermaid when text review is enough

The graph is stored in `.goal-dag/graph.json` inside the selected project.

## MCP Tools

- `goal_graph_init`
- `goal_graph_get`
- `goal_graph_add_branch`
- `goal_graph_add_merge`
- `goal_node_upsert`
- `goal_node_set_status`
- `goal_edge_upsert`
- `goal_graph_validate`
- `goal_graph_ready`
- `goal_graph_mermaid`

## Example

```text
Root goal
├── marketing
├── technology
└── capital
    ├── marketing + technology -> validation gate
    └── company A + company B -> shared platform / holding company
```

See `examples/empire.graph.json` for a complete graph with two merge gates.

## Development

Run the test suite:

```bash
node --test scripts/*.test.mjs
```

Validate the plugin package:

```bash
python "$CODEX_HOME/skills/.system/plugin-creator/scripts/validate_plugin.py" .
```

## Security

The MCP server only reads and writes `.goal-dag/graph.json` under `GOAL_DAG_ROOT`, defaulting to the current working directory. It does not execute graph content, use the network, or store credentials.
