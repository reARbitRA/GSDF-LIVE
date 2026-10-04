# CI workflow (staged)

`github-workflow-ci.yml` is the GitHub Actions workflow for this repo (typecheck → tests+coverage →
key-less build → `npm audit --audit-level=high`).

It lives here instead of `.github/workflows/` only because the automation that opened the audit PR
does not hold the `workflows` permission GitHub requires to push workflow files. To activate it:

```bash
mkdir -p .github/workflows && git mv ci/github-workflow-ci.yml .github/workflows/ci.yml && git commit -m "ci: enable workflow"
```
