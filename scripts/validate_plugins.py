#!/usr/bin/env python3
"""Validate the repository marketplace and bundled plugins."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MARKETPLACE = ROOT / ".agents" / "plugins" / "marketplace.json"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing file: {path}")
    except json.JSONDecodeError as error:
        fail(f"invalid JSON in {path}: {error}")


def validate_skill(skill_dir: Path) -> None:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        fail(f"missing SKILL.md: {skill_md}")
    text = skill_md.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        fail(f"missing frontmatter: {skill_md}")
    frontmatter = text.split("---", 2)[1]
    for key in ("name:", "description:"):
        if key not in frontmatter:
            fail(f"missing {key} in {skill_md}")


def main() -> None:
    marketplace = load_json(MARKETPLACE)
    plugins = marketplace.get("plugins")
    if not isinstance(plugins, list) or not plugins:
        fail("marketplace must contain a non-empty plugins array")

    for entry in plugins:
        name = entry.get("name")
        source = entry.get("source", {})
        relative = source.get("path")
        if source.get("source") != "local" or not relative:
            fail(f"unsupported marketplace source for {name}")
        plugin_dir = (ROOT / relative).resolve()
        if ROOT not in plugin_dir.parents:
            fail(f"plugin path escapes repository: {relative}")

        manifest = load_json(plugin_dir / ".codex-plugin" / "plugin.json")
        if manifest.get("name") != name:
            fail(f"plugin name mismatch for {name}")
        if not manifest.get("version"):
            fail(f"missing version for {name}")
        if not manifest.get("description"):
            fail(f"missing description for {name}")

        skills_dir = plugin_dir / "skills"
        if not skills_dir.is_dir():
            fail(f"missing skills directory for {name}")
        for skill_dir in skills_dir.iterdir():
            if skill_dir.is_dir():
                validate_skill(skill_dir)

        mcp = manifest.get("mcpServers")
        if mcp:
            mcp_path = plugin_dir / str(mcp).removeprefix("./")
            load_json(mcp_path)

    print(f"Validated {len(plugins)} plugins.")


if __name__ == "__main__":
    main()
