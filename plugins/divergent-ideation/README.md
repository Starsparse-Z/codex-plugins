# Divergent Ideation

A Codex plugin for structured brainstorming, creative provocation, and idea
convergence. It is controlled entirely from the Codex conversation and has no
UI or background service.

## Workflow

```text
Frame -> Diverge -> Provoke -> Cluster -> Converge -> First Tests
```

The skill enforces separation between generation and evaluation, requires
mechanism diversity rather than renamed variations, and produces a portfolio
instead of collapsing immediately to the safest idea.

## Modes

- full ideation for broad innovation and strategy work;
- focused sprints for features, products, names, and campaigns;
- unstick sessions for one-direction thinking;
- convergence for raw idea sets that already exist;
- stress testing for a single selected idea.

## Example Prompts

```text
$divergent-ideation

我想创业，但不要先给建议。先重构问题，再发散 30 个机制不同的方向，最后只保留安全型、非对称型和野卡各一个。
```

```text
$divergent-ideation

我们准备做一个 AI 学习产品。先破坏团队默认的三个假设，再生成方案组合并给出 72 小时内可验证的测试。
```

## Method Sources

The implementation is an independent synthesis of common creative problem
solving methods, including HMW, SCAMPER, Crazy 8s, Synectics, lateral thinking,
SIT, TRIZ, morphological analysis, Six Hats, and perspective rotation.

The design was informed by open-source projects including `obra/superpowers`,
`nWave-ai/nWave`, `yogsoth-ai/de-anthropocentric-research-engine`, and
`thinkbigleaders/claude-innovation-skills`. No code from the AGPL-licensed
`NeuroAIHub/BrainPilot` project is included.

## License

MIT
