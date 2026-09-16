# Reuse Decision Rubric

## Candidate Scorecard

Score each criterion as `strong`, `acceptable`, `weak`, or `unknown`.

| Criterion | Strong evidence |
|---|---|
| Functional fit | Core workflow already exists and matches must-have constraints |
| Maintenance | Recent meaningful commits, releases, issue responses, multiple maintainers |
| Test quality | Tests cover core behavior; CI is maintained and meaningful |
| Integration | Stable API/plugin boundary; minimal adapter code |
| Deployment | Runs in the required OS/runtime/self-hosted/offline environment |
| License | Compatible with commercial, closed-source, redistribution, and network-use needs |
| Security | Clear disclosure policy; least-privilege defaults; no risky install hooks |
| Complexity | Reuse removes more code and maintenance than it adds |
| Exit cost | Data and interfaces are portable; replacement is feasible |

Use `unknown` rather than assuming support.

## License Quick Guide

This is engineering guidance, not legal advice.

- `MIT`, `BSD`, `ISC`, `Apache-2.0`: usually suitable for commercial reuse; preserve notices and patent terms where applicable.
- `MPL-2.0`: file-level copyleft; modified MPL files generally must stay MPL.
- `LGPL`: dynamic linking may be acceptable, but distribution obligations require review.
- `GPL`, `AGPL`: strong copyleft; AGPL is especially relevant to network-hosted services.
- `NOASSERTION`, custom, fair-code, non-commercial, or missing license: do not assume reuse rights. Treat as blocked until reviewed.
- Generated model weights, datasets, fonts, icons, and documentation can have licenses different from the code.

## Maintenance Red Flags

- archived repository;
- no release or substantive commit for a long time;
- only one maintainer and no successor plan;
- thousands of open issues with no triage;
- README claims unsupported by code, tests, or releases;
- hidden install hooks, binary blobs, telemetry, or credential collection;
- fork far behind upstream;
- unstable API and frequent breaking changes;
- dependency tree much larger than the problem being solved.

## Decision Bias

Prefer, in order:

1. direct dependency or hosted service;
2. fork/compose with a narrow adapter;
3. pattern borrowing with independent implementation;
4. fully custom build.

Move to a heavier option only when the lighter option fails fit, maintenance, license, security, or deployment constraints.

## Evidence Notes

Record:

- exact version, tag, commit, or release inspected;
- URL of each primary source;
- files actually opened;
- checks run locally;
- facts not verified;
- assumptions that could change the recommendation.
