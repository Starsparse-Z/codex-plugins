# Goal DAG Schema

The graph is stored at `.goal-dag/graph.json`.

## Node

```json
{
  "id": "validation",
  "title": "Validate the combined business",
  "kind": "merge_gate",
  "status": "pending",
  "join": "all",
  "parents": ["marketing", "technology"],
  "children": ["company-a", "company-b"],
  "artifacts": ["validation-report.md"],
  "runtime": {
    "threadId": "thr_123",
    "activeTurnId": null
  }
}
```

Allowed statuses:

- `pending`
- `active`
- `blocked`
- `completed`
- `failed`
- `cancelled`

Useful node kinds:

- `goal`
- `objective`
- `workstream`
- `milestone`
- `merge_gate`
- `company`
- `decision`
- `artifact`

## Edge

```json
{
  "id": "marketing->validation",
  "from": "marketing",
  "to": "validation",
  "type": "contributes_to",
  "required": true
}
```

Useful edge types:

- `depends_on`
- `decompose`
- `contributes_to`
- `informs`
- `alternative_to`
- `merge_into`

`required: false` means the edge contributes context but does not block the target node.

## Merge Semantics

- `join: "all"`: every required incoming edge must complete.
- `join: "any"`: one required incoming edge is enough to release the node.
- Optional incoming edges never block.

A merge node is a new decision boundary. It should output:

- accepted facts
- rejected assumptions
- conflicts and how they were resolved
- evidence links
- next direction and acceptance criteria
