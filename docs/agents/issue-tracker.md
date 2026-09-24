# Issue Tracker Configuration

## Type: GitHub

Repository: `NousResearch/hermes-agent`
GitHub: https://github.com/NousResearch/hermes-agent

## Operations

### Create issue
```
gh issue create --repo NousResearch/hermes-agent --title "TITLE" --body-file BODY --label LABELS
```

### List issues
```
gh issue list --repo NousResearch/hermes-agent --state all --label LABEL
```

### Add comment
```
gh issue comment ISSUE_NUMBER --body "comment" --repo NousResearch/hermes-agent
```

### Add label
```
gh issue edit ISSUE_NUMBER --add-label LABEL --repo NousResearch/hermes-agent
```

### Set assignee
```
gh issue edit ISSUE_NUMBER --assignee USERNAME --repo NousResearch/hermes-agent
```

### Add dependency (blocking)
```
gh api /repos/NousResearch/hermes-agent/issues/ISSUE_NUMBER/actions/convert-to-dependency --method PUT -f dependency_type=blocking -f dependent_issue_number=DEPENDENT_NUM
```

## Labels

- `wayfinder:map` — the canonical wayfinding map issue
- `wayfinder:research` — research ticket
- `wayfinder:prototype` — prototype ticket
- `wayfinder:grilling` — grilling ticket
- `wayfinder:task` — task ticket
- `wayfinder:blocked` — blocked by another ticket
