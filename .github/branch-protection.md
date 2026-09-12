# Branch Protection Rules

This document describes the branch protection rules that must be configured in
GitHub Settings > Branches for the LEXDATA IA repository.

## `main` branch

| Setting | Value |
|---|---|
| **Require a pull request before merging** | Yes |
| Require approvals | 1 minimum |
| Dismiss stale pull request approvals when new commits are pushed | Yes |
| Require review from code owners | Yes (when CODEOWNERS file is configured) |
| **Require status checks to pass before merging** | Yes |
| Require branches to be up to date before merging | Yes |
| Required status checks | `Typecheck + Lint + Unit Tests`, `Build (web + api)`, `Flutter Analyze + Test` |
| **Require conversation resolution before merging** | Yes |
| **Require signed commits** | No (optional, enable if team uses GPG) |
| **Require linear history** | Yes (squash or rebase merges only) |
| **Do not allow bypassing the above settings** | Yes (applies to admins too) |
| **Restrict who can push to matching branches** | Yes — only merge via PR |
| **Allow force pushes** | No |
| **Allow deletions** | No |

## How to configure

1. Go to **Settings > Branches > Branch protection rules**.
2. Click **Add rule**.
3. Set **Branch name pattern** to `main`.
4. Apply all settings from the table above.
5. Click **Create** / **Save changes**.

## Environment protection (for deployments)

| Environment | Required reviewers | Wait timer | Branch restriction |
|---|---|---|---|
| `staging` | None | None | `main` only |
| `production` | 1 reviewer (project lead or DPO) | 5 minutes | `main` only |

Configure these under **Settings > Environments**.

## CODEOWNERS (optional)

Create `.github/CODEOWNERS` to require reviews from specific people:

```
# Default owner for everything
* @cognitex/lexdata-core

# Legal corpus changes require legal admin review
packages/legal-corpus/ @cognitex/legal-team

# Database migrations require DBA or lead review
supabase/migrations/ @cognitex/lexdata-core
apps/api/prisma/ @cognitex/lexdata-core

# Security-sensitive files
.github/workflows/ @cognitex/lexdata-core
```
