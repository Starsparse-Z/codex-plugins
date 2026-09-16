# Codex Plugins by Starsparse-Z

Curated Codex plugins for long-horizon project planning, creative exploration,
and reuse-first engineering.

## Plugins

### Goal DAG

Manage a long-horizon objective from Codex chat:

- add one or more goal branches;
- create multi-parent merge gates;
- update node status;
- query ready nodes;
- authorize bounded autonomous expansion.

The graph is stored in `.goal-dag/graph.json` inside the selected project.

### Reuse Before Build

Before substantial development:

- search GitHub for existing implementations;
- verify strong candidates from source;
- check maintenance, license, security, deployment, and exit cost;
- choose `USE DIRECTLY`, `FORK / COMPOSE`, `BORROW PATTERNS`, or `BUILD FRESH`;
- stop for explicit approval before implementation.

### Divergent Ideation

For brainstorming, innovation, and difficult creative problems:

- separate idea generation from evaluation;
- generate options across multiple creative lenses;
- challenge dominant assumptions and force cross-domain connections;
- cluster ideas by mechanism rather than wording;
- produce a safe, asymmetric, and optional wild-card portfolio;
- define the cheapest next test for each selected direction.

## Install

```bash
codex plugin marketplace add Starsparse-Z/codex-plugins
codex plugin add goal-dag@starsparse-codex
codex plugin add reuse-before-build@starsparse-codex
codex plugin add divergent-ideation@starsparse-codex
```

Install only the plugin you need.

## Usage

```text
在“技术实现”下增加三个分支：数据层、Agent 运行时、基础设施。
```

```text
让营销和技术汇合到第一验证节点。
```

```text
$reuse-before-build

我想做一个 Windows 本地 PDF 知识库。先找 GitHub 上有没有能直接用或 Fork 改造的项目。
```

```text
$divergent-ideation

我想创业，但不要先给建议。先重构问题，再发散 30 个机制不同的方向，最后保留安全型、非对称型和野卡。
```

## Development

Run all validations:

```bash
python scripts/validate_plugins.py
node --test plugins/goal-dag/scripts/*.test.mjs
```

## Security

The Goal DAG MCP server only reads and writes `.goal-dag/graph.json` under its configured workspace root. It does not execute graph content, make network requests, or store credentials.

Reuse Before Build performs read-only research before implementation. It must not install dependencies or edit application code before explicit approval.

## License

MIT
