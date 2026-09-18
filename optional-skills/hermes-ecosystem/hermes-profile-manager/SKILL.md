---
name: hermes-profile-manager
production: true
description: Manage Hermes Agent Desktop profiles and model assignments.
tags: [hermes, profile-manager, profile-switching, model-provider-assignment, profile-templates, AGENTS]
category: devops
---

# Hermes Profile Manager

This skill provides comprehensive profile management for Hermes Agent Desktop through AGENTS screen automation. Profiles are configuration containers that define model provider assignments, skill sets, and operational parameters for different agent personalities and use cases.

## Quick Start

### List Profiles
```bash
# List all profiles
hermes profile-manager list

# Show active profile
hermes profile-manager active

# Get detailed profile information
hermes profile-manager show --name "My Profile"
```

### Create Profile
```bash
# Create a new profile via AGENTS screen automation
hermes profile-manager create --name "Code Review Assistant" --description "Specialized coding assistant"

# Create from template
hermes profile-manager create-from-template --template "developer"

# Clone existing profile
hermes profile-manager clone --source "Default Profile" --name "Clone Profile"
```

### Switch Profiles
```bash
# Switch to a profile
hermes profile-manager switch --name "Code Review Assistant"

# Switch to profile by ID
hermes profile-manager switch --id profile-abc123

# Auto-switch profiles based on context
hermes profile-manager auto-switch --context coding --profile "Code Review Assistant"
```

### Delete Profile
```bash
# Delete a profile (with confirmation)
hermes profile-manager delete --name "Old Profile" --confirm

# Delete profile by ID
hermes profile-manager delete --id profile-xyz789
```

## Core Capabilities

### 1. AGENTS Screen Automation

#### Profile Management
```bash
# Navigate to AGENTS screen and interact
hermes profile-manager open-agents-screen

# Create profile through UI automation
hermes profile-manager create --name "Custom Profile" --description "Custom agent config"

# Update profile settings
hermes profile-manager update --name "Custom Profile" --set model="gpt-4o" --set provider="openrouter"

# Delete profile through UI
hermes profile-manager remove --name "Profile to Remove"
```

#### Profile Configuration
```bash
# Configure model assignments for a profile
hermes profile-manager set-models \
  --profile "Developer" \
  --main-model "openrouter/gpt-4o" \
  --fallback-model "google/gemini-pro"

# Configure auxiliary task models
hermes profile-manager set-task-models \
  --profile "Researcher" \
  --task coding "anthropic/claude-3-opus" \
  --task writing "anthropic/claude-3-opus" \
  --task analysis "google/gemini-pro" \
  --task vision "openrouter/gpt-4o-vision"

# Configure skill sets
hermes profile-manager set-skills \
  --profile "Developer" \
  --skills "hermes-skill-manager,hermes-model-switching,hermes-session-search"

# Configure memory settings
hermes profile-manager set-memory \
  --profile "Researcher" \
  --max-context 100000 \
  --memory-retention 7d \
  --session-persistence true
```

### 2. Profile Templates

#### Pre-built Templates
| Template | Description | Default Model | Skills Enabled |
|----------|-------------|---------------|----------------|
| **developer** | Coding and software development focus | GPT-4o/OpenRouter | hermes-skill-manager, hermes-model-switching, hermes-session-search, hermes-code-review |
| **researcher** | Research and analysis focus | Claude-3-opus/Anthropic | hermes-skill-manager, hermes-model-switching, hermes-session-search, hermes-moa |
| **writer** | Creative and technical writing | Claude-3-opus/Anthropic | hermes-skill-manager, hermes-model-switching, hermes-memory |
| **analyst** | Data analysis and business insights | Gemini-pro/Google | hermes-skill-manager, hermes-model-switching, hermes-session-search |
| **creative** | Design and creative content | GPT-4o/OpenRouter | hermes-skill-manager, hermes-model-switching, hermes-moa, hermes-vision |
| **support** | Customer support and help | Claude-3-haiku/Anthropic | hermes-skill-manager, hermes-model-switching, hermes-memory |
| **teacher** | Educational content and tutoring | Claude-3-5-sonnet/Anthropic | hermes-skill-manager, hermes-model-switching, hermes-session-search |

#### Custom Template Creation
```bash
# Create a custom template
hermes profile-manager template-create \
  --name "Custom Assistant" \
  --description "Custom assistant for my workflow" \
  --main-model "openrouter/gpt-4o" \
  --fallback-model "anthropic/claude-3-sonnet" \
  --skills "hermes-skill-manager,hermes-model-switching,hermes-session-search"

# List all templates
hermes profile-manager templates-list

# Export a template
hermes profile-manager template-export --name "Developer" --output dev-template.json

# Import a template
hermes profile-manager template-import --file team-template.json
```

### 3. Profile Sharing and Synchronization

#### Team Sharing
```bash
# Share profile with team members
hermes profile-manager share \
  --profile "Team Developer" \
  --users "alice@example.com,bob@example.com" \
  --permission read-only

# Share with edit permissions
hermes profile-manager share \
  --profile "Team Developer" \
  --users "alice@example.com" \
  --permission admin

# List shared profiles
hermes profile-manager shared-list

# Accept shared profile
hermes profile-manager accept-share --profile "Shared Profile" --from alice@example.com

# Remove sharing
hermes profile-manager unshare --profile "Team Developer" --user bob@example.com
```

#### Profile Synchronization
```bash
# Sync profiles across sessions
hermes profile-manager sync

# Sync from remote
hermes profile-manager sync-from-remote --remote-url "https://profiles.hermes.ai/team"

# Sync to remote
hermes profile-manager sync-to-remote --profile "Developer" --remote-id profile-123

# Check sync status
hermes profile-manager sync-status
```

### 4. Profile Analytics

#### Profile Performance
```bash
# Analyze profile usage
hermes profile-manager analytics --profile "Developer"

# Performance report
hermes profile-manager performance-report --profile "Developer" --period "last-30-days"

# Model usage breakdown
hermes profile-manager model-usage --profile "Developer" --period "today"

# Cost analysis
hermes profile-manager cost-analysis --profile "Developer" --period "this-month"
```

#### Profile Recommendations
```bash
# Get profile optimization suggestions
hermes profile-manager recommend --profile "Developer"

# Example output:
# 🔍 Profile "Developer" Analysis
# 
# Recommendations:
# 1. Switch main model from gpt-4o to claude-3-opus for coding tasks (92% better performance)
# 2. Enable hermes-code-review skill for automatic PR analysis
# 3. Lower temperature to 0.1 for more deterministic code generation
# 4. Add vision model for documentation screenshot analysis

# Apply recommendations
hermes profile-manager apply-recommendations --profile "Developer" --accept-all
```

### 5. Profile Export/Import

#### Profile Management
```bash
# Export profile
hermes profile-manager export --profile "Developer" --output developer-profile.json

# Import profile
hermes profile-manager import --file developer-profile.json

# Export all profiles
hermes profile-manager export-all --output backup-2026-01-01.json

# Import all profiles
hermes profile-manager import-all --file backup-2026-01-01.json --overwrite
```

## Configuration

### Profile Manager Config
```yaml
# ~/.hermes/profile-manager.yaml
profile_manager:
  auto_sync: true
  sync_interval: 300  # 5 minutes
  backup_interval: 3600  # 1 hour
  default_template: "developer"
  enable_analytics: true
  analytics_retention: 90  # days
  enable_sharing: true
  max_profiles: 100
  profile_naming_pattern: "{name} - {timestamp}"
  
profiles:
  auto_switch_enabled: true
  auto_switch_rules:
    - context: "coding"
      profile: "Developer"
      confidence_threshold: 0.8
    - context: "writing"
      profile: "Writer"
      confidence_threshold: 0.7
    - context: "research"
      profile: "Researcher"
      confidence_threshold: 0.75
    - context: "analysis"
      profile: "Analyst"
      confidence_threshold: 0.8
    
  validation:
    require_description: true
    require_model_assignment: true
    validate_skills: true
    check_dependencies: true
    
  security:
    encrypt_profile_data: true
    secure_sharing: true
    audit_log: true
```

#### Profile JSON Format
```json
{
  "id": "profile-12345",
  "name": "Developer Assistant",
  "description": "Specialized coding assistant",
  "created": "2026-01-15T10:30:00Z",
  "modified": "2026-01-20T15:45:00Z",
  "models": {
    "main": {
      "provider": "openrouter",
      "model": "gpt-4o",
      "temperature": 0.1,
      "max_tokens": 8000
    },
    "fallback": {
      "provider": "anthropic",
      "model": "claude-3-sonnet",
      "temperature": 0.2,
      "max_tokens": 8000
    }
  },
  "task_models": {
    "coding": {
      "provider": "openrouter",
      "model": "gpt-4o",
      "temperature": 0.1,
      "max_tokens": 8000
    },
    "writing": {
      "provider": "anthropic",
      "model": "claude-3-opus",
      "temperature": 0.7,
      "max_tokens": 4000
    }
  },
  "skills": {
    "enabled": ["hermes-skill-manager", "hermes-model-switching", "hermes-code-review"],
    "disabled": ["hermes-testing"]
  },
  "memory": {
    "max_context": 100000,
    "retention_days": 7,
    "persistence": true
  },
  "permissions": {
    "shared_with": ["alice@example.com"],
    "read_only": false,
    "owner": "user@example.com"
  }
}
```

## Integration with Other Hermes Skills

### Model Switching Integration
```bash
# Profile manager integrates with model-switching skill
hermes profile-manager sync-models

# Apply profile model settings
hermes profile-manager apply-model-config --profile "Developer"
```

### Session Search Integration
```bash
# Profile-aware session search
hermes profile-manager session-search --profile "Developer" --query "Python error"

# Filter sessions by profile
hermes profile-manager sessions --profile "Developer" --limit 10
```

### MoA Orchestration Integration
```bash
# Profile-based agent mixing
hermes profile-manager set-moa-config \
  --profile "Researcher" \
  --agents "claude-pro:gpt-4,openai:gemini" \
  --voting-threshold 0.8 \
  --consensus-method "weighted-similarity"
```

## Best Practices

### 1. Profile Organization
```markdown
## Profile Naming Best Practices

### Use Descriptive Names
- Good: "Developer - Python Backend"
- Good: "Researcher - Web Scraping"
- Avoid: "My Profile", "Copy of Copy"

### Use Templates
- Start with pre-built templates for common use cases
- Customize templates to fit specific workflows
- Share templates across teams for consistency

### Regular Maintenance
- Review and update profiles monthly
- Remove unused or outdated profiles
- Archive important profiles before deletion
```

### 2. Model Assignment Guidelines
```yaml
# Recommended model assignments per profile type
developer:
  main: "openrouter/gpt-4o"
  fallback: "anthropic/claude-3-sonnet"
  coding: "openrouter/gpt-4o"
  debugging: "openrouter/gpt-4o"
  
researcher:
  main: "anthropic/claude-3-opus"
  fallback: "google/gemini-pro"
  research: "anthropic/claude-3-opus"
  analysis: "google/gemini-pro"
  
writer:
  main: "anthropic/claude-3-opus"
  fallback: "openrouter/gpt-4o"
  creative_writing: "anthropic/claude-3-opus"
  technical_writing: "openrouter/gpt-4o"
```

### 3. Security Considerations
- Never share profiles with embedded API keys
- Use environment variables for sensitive configurations
- Enable encryption for profile data
- Audit profile access logs
- Implement proper RBAC for team profiles

## Troubleshooting

### Common Issues

#### Profile Not Loading
```bash
# Diagnose profile loading issues
hermes profile-manager diagnose --profile "Broken Profile"

# Common fixes:
# 1. Check profile JSON validity
# 2. Verify skill dependencies
# 3. Check model availability
# 4. Validate API key access
# 5. Run: hermes profile-manager validate --profile "Profile Name"
```

#### Profile Switch Failures
```bash
# Diagnostic for switching issues
hermes profile-manager diagnose-switch --profile "Target Profile"

# Troubleshooting steps:
# 1. Check AGENTS screen connectivity
# 2. Verify profile exists
# 3. Check permissions
# 4. Look for model provider issues
# 5. Run: hermes profile-manager test-switch
```

#### Sharing Issues
```bash
# Diagnose sharing problems
hermes profile-manager diagnose-share --profile "Shared Profile"

# Common fixes:
# 1. Check recipient email validity
# 2. Verify sharing permissions
# 3. Ensure profile encryption compatibility
# 4. Run: hermes profile-manager test-share --profile "Profile Name"
```

#### Template Import Errors
```bash
# Validate template before import
hermes profile-manager validate-template --file template.json

# Fix based on errors:
# 1. Check JSON syntax
# 2. Verify required fields
# 3. Check model provider names
# 4. Validate skill names
# 5. Run: hermes profile-manager import --file template.json --strict=false
```

## API Reference

### Programmatic Access
```javascript
// Profile management in JavaScript
import { ProfileManager } from 'hermes-profile-manager';

const manager = new ProfileManager({
  hermesUrl: 'http://localhost:8642',
  configPath: '~/.hermes/profile-manager.yaml'
});

// List all profiles
const profiles = await manager.listProfiles();

// Create a profile
await manager.createProfile({
  name: 'Code Reviewer',
  description: 'Automated code review specialist',
  models: {
    main: { provider: 'openrouter', model: 'gpt-4o' },
    coding: { provider: 'anthropic', model: 'claude-3-opus' }
  },
  skills: ['hermes-code-review', 'hermes-skill-manager']
});

// Switch profile
await manager.switchProfile('Code Reviewer');

// Get profile analytics
const analytics = await manager.getAnalytics('Code Reviewer', {
  period: 'last-30-days'
});

// Export profile
await manager.exportProfile('Code Reviewer', './profiles/code-reviewer.json');
```

### CLI Commands Reference
```bash
# Profile management
hermes profile-manager list                    # List all profiles
hermes profile-manager active                   # Show active profile
hermes profile-manager show --name NAME         # Show profile details
hermes profile-manager create --name NAME       # Create profile
hermes profile-manager delete --name NAME       # Delete profile
hermes profile-manager clone --source NAME      # Clone profile
hermes profile-manager switch --name NAME       # Switch profile
hermes profile-manager update --name NAME       # Update profile

# Template management
hermes profile-manager templates-list           # List templates
hermes profile-manager create-from-template --template NAME
hermes profile-manager template-create --name NAME
hermes profile-manager template-export --name NAME
hermes profile-manager template-import --file FILE

# Model configuration
hermes profile-manager set-models --profile NAME --main MODEL --fallback MODEL
hermes profile-manager set-task-models --profile NAME --task TASK MODEL
hermes profile-manager sync-models

# Skill management
hermes profile-manager set-skills --profile NAME --skills LIST
hermes profile-manager enable-skill --profile NAME --skill SKILL
hermes profile-manager disable-skill --profile NAME --skill SKILL

# Sharing and synchronization
hermes profile-manager share --profile NAME --users EMAILS
hermes profile-manager unshare --profile NAME --user EMAIL
hermes profile-manager sync
hermes profile-manager sync-from-remote --remote-url URL
hermes profile-manager sync-to-remote --profile NAME

# Analytics and recommendations
hermes profile-manager analytics --profile NAME
hermes profile-manager performance-report --profile NAME
hermes profile-manager model-usage --profile NAME
hermes profile-manager cost-analysis --profile NAME
hermes profile-manager recommend --profile NAME
hermes profile-manager apply-recommendations --profile NAME

# Export/Import
hermes profile-manager export --profile NAME --output FILE
hermes profile-manager import --file FILE
hermes profile-manager export-all --output FILE
hermes profile-manager import-all --file FILE --overwrite

# Diagnostics
hermes profile-manager diagnose --profile NAME
hermes profile-manager diagnose-switch --profile NAME
hermes profile-manager test-switch
hermes profile-manager validate --profile NAME
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Basic profile CRUD operations
- [x] AGENTS screen automation
- [x] Profile templates
- [x] Profile import/export

### Phase 2 (Q4 2026)
- [ ] Profile sharing and team collaboration
- [ ] Profile synchronization across devices
- [ ] Profile analytics and recommendations
- [ ] Smart profile switching based on context

### Phase 3 (2027)
- [ ] AI-powered profile creation
- [ ] Profile evolution and learning
- [x] Enterprise profile governance
- [ ] Profile marketplace for team sharing

### Phase 4 (Future)
- [ ] Cross-platform profile sync
- [ ] Profile-based A/B testing
- [ ] Profile performance benchmarking
- [ ] Community profile sharing platform

---

**Hermes Profile Manager** - Comprehensive profile management for Hermes Agent Desktop. Automate AGENTS screen operations, manage profile templates, enable team collaboration, and optimize agent configurations for peak performance.