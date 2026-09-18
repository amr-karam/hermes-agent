---
name: hermes-skill-registry
production: true
description: Centralized registry for all Hermes Agent Desktop skills. Provides skill discovery, categorization, version management, dependency resolution, and compatibility checking with an extensible skill marketplace ecosystem.
---

# Hermes Skill Registry

This skill provides a centralized registry for all Hermes Agent Desktop skills. It manages skill discovery, categorization, version management, dependency resolution, and compatibility checking across the Hermes skill ecosystem.

## Quick Start

### Skill Discovery
```bash
# List all registered skills
hermes skill-registry list

# Search skills by keyword
hermes skill-registry search --query "model"

# Filter by category
hermes skill-registry list --category "management"

# Filter by status
hermes skill-registry list --status "production"

# Show skill details
hermes skill-registry show --skill "hermes-model-switching"
```

### Skill Registration
```bash
# Register a new skill
hermes skill-registry register \
  --path ./skills/hermes-new-skill \
  --category "custom"

# Register from remote
hermes skill-registry register-remote --url "https://github.com/example/hermes-skill"

# Register from marketplace
hermes skill-registry install --skill "hermes-data-viz" --from marketplace
```

### Version Management
```bash
# List available versions
hermes skill-registry versions --skill "hermes-skill-manager"

# Update to latest version
hermes skill-registry update --skill "hermes-skill-manager"

# Update to specific version
hermes skill-registry update --skill "hermes-skill-manager" --version 2.1.0

# Compare versions
hermes skill-registry diff-versions --skill "hermes-model-switching" --from 1.0 --to 2.0
```

### Dependency Management
```bash
# Check skill dependencies
hermes skill-registry deps --skill "hermes-moa-orchestration"

# Check for conflicts
hermes skill-registry deps --check-conflicts

# Install dependencies
hermes skill-registry deps --install

# Auto-update dependencies
hermes skill-registry deps --auto-update
```

## Core Capabilities

### 1. Skill Categorization

#### Categories
```markdown
## Skill Categories

### Core Hermes
Essential skills for Hermes operation (always loaded)
- hermes-skill-manager
- hermes-model-switching
- hermes-profile-manager
- hermes-session-search
- hermes-session-management

### Management
Skills for managing Hermes environment
- hermes-skill-registry
- hermes-skill-testing
- hermes-performance-monitoring
- hermes-analytics

### Development
Skills for development workflows
- hermes-code-review
- hermes-debugging-assistant
- hermes-testing
- hermes-docs-generator

### Data & Analytics
Skills for data processing and analysis
- hermes-data-analysis
- hermes-data-visualization
- hermes-ml-pipeline
- hermes-bigquery-integration

### Creative
Skills for creative content generation
- hermes-content-generation
- hermes-image-generation
- hermes-video-generation
- hermes-music-generation

### Integration
Skills for external integrations
- hermes-cloudflare-integration
- hermes-google-integration
- hermes-github-integration
- hermes-anima-design

### Specialized
Skills for specific use cases
- hermes-enterprise-tools
- hermes-security-auditor
- hermes-performance-optimizer
- hermes-accessibility-checker
```

#### Category Management
```bash
# Assign category to skill
hermes skill-registry categorize --skill "my-skill" --category "development"

# Create custom category
hermes skill-registry create-category --name "custom" --description "Custom team skills"

# Move skill between categories
hermes skill-registry move --skill "old-skill" --from "deprecated" --to "development"

# List all categories
hermes skill-registry categories --show-count
```

### 2. Registry Structure

#### Skill Metadata Schema
```json
{
  "id": "hermes-skill-manager",
  "name": "Hermes Skill Manager",
  "version": "1.0.0",
  "description": "Manage Hermes Agent Desktop skills",
  "category": "core-hermes",
  "subcategory": "management",
  "author": "Nous Research",
  "license": "MIT",
  "homepage": "https://github.com/NousResearch/hermes-agent",
  "repository": "https://github.com/NousResearch/hermes-agent/tree/main/skills",
  "keywords": ["hermes", "skill-management", "registry"],
  "dependencies": {
    "hermes-core": "^1.0.0",
    "sqlite3": "^5.0.0"
  },
  "peerDependencies": {
    "hermes-runtime": "^2.0.0"
  },
  "conflicts": [
    "hermes-old-skill-manager"
  ],
  "replaces": [],
  "provides": [
    "skill-discovery",
    "skill-validation",
    "skill-monitoring"
  ],
  "platforms": ["linux", "darwin", "win32"],
  "engines": {
    "node": ">=18.0.0"
  },
  "tags": ["core", "management", "production"],
  "production": true,
  "rating": 4.8,
  "downloads": 12543,
  "last_updated": "2026-01-15T10:30:00Z",
  "compatibility": {
    "min_hermes_version": "2.0.0",
    "max_hermes_version": "3.0.0"
  },
  "entrypoint": "SKILL.md",
  "permissions": {
    "filesystem": true,
    "network": false,
    "shell": false
  }
}
```

#### Registry Database Schema
```sql
-- Skills registry database
SQLite: registry.db

Tables:
- skills (skill metadata)
- categories (category definitions)
- dependencies (skill dependency graph)
- versions (version history)
- tags (skill tags)
- ratings (community ratings)
- downloads (download statistics)
- compatibility (version compatibility matrix)
- marketplace (marketplace entries)
```

### 3. Search and Discovery

#### Advanced Search
```bash
# Full-text search across skill metadata
hermes skill-registry search --query "model switching" --fuzzy

# Faceted search
hermes skill-registry search \
  --category "development" \
  --tag "coding" \
  --rating-min 4.0 \
  --downloads-min 1000

# Filter by compatibility
hermes skill-registry search --hermes-version 3.0.0 --compatible

# Search with boolean operators
hermes skill-registry search --query "provider:anthropic AND version:2.* AND rating:>=4"
```

#### Searchable Fields
| Field | Description | Example |
|-------|-------------|---------|
| `name` | Skill name | `hermes-model-switching` |
| `description` | Skill description | `Switch AI models` |
| `category` | Skill category | `core-hermes`, `management` |
| `tags` | Skill tags | `production`, `verified` |
| `author` | Author name | `Nous Research` |
| `version` | Version number | `1.0.0`, `2.1.3` |
| `rating` | User rating | `>=4.0` |
| `downloads` | Download count | `>=1000` |
| `production` | Production status | `true`, `false` |
| `compatibility` | Hermes version | `>=2.0.0,<3.0.0` |
| `language` | Implementation language | `typescript`, `python` |
| `provider` | Model provider | `openrouter`, `anthropic` |

#### Recommended Skills
```bash
# Get personalized recommendations
hermes skill-registry recommend

# Recommendations based on current profile
hermes skill-registry recommend --profile "Developer"

# Similar skills
hermes skill-registry similar --skill "hermes-skill-manager"

# Skills used together
hermes skill-registry used-with --skill "hermes-model-switching"
```

### 4. Version Control

#### Version History
```bash
# View version history
hermes skill-registry history --skill "hermes-skill-manager"

# View changelog for specific version
hermes skill-registry changelog --skill "hermes-skill-manager" --version 2.0.0

# Compare two versions
hermes skill-registry compare --skill "hermes-model-switching" --from 1.0 --to 2.0

# Release notes for upcoming version
hermes skill-registry release-notes --skill "hermes-moa-orchestration"
```

#### Version Management
```bash
# Tag a version
hermes skill-registry tag --skill "hermes-skill-manager" --version 2.1.0 --tag "stable"

# Promote version to production
hermes skill-registry promote --skill "hermes-model-switching" --version 3.0.0 --environment production

# Rollback to previous version
hermes skill-registry rollback --skill "hermes-profile-manager" --to 2.0.0

# Prerelease version
hermes skill-registry release --skill "my-skill" --prerelease "beta.1"
```

#### Compatibility Matrix
```bash
# Check compatibility
hermes skill-registry compatibility --skill "hermes-skill-manager" --hermes-version 3.0.0

# Generate compatibility report
hermes skill-registry compatibility-report --format json --output compat-report.json

# Auto-check all skills
hermes skill-registry check-all-compatibility
```

### 5. Dependency Resolution

#### Dependency Graph
```bash
# Generate dependency graph
hermes skill-registry deps-graph --output deps-graph.png

# Check for circular dependencies
hermes skill-registry deps --circular

# List dependency tree
hermes skill-registry deps-tree --skill "hermes-moa-orchestration"

# Analyze unused dependencies
hermes skill-registry deps --unused
```

#### Conflict Resolution
```bash
# Check for conflicts
hermes skill-registry check-conflicts

# Auto-resolve conflicts
hermes skill-registry resolve-conflicts --auto

# Show conflict details
hermes skill-registry conflicts --detail

# Ignore specific conflicts (use with caution)
hermes skill-registry ignore-conflict --skill "hermes-a" --conflicts-with "hermes-b"
```

## Integration with Marketplace

### Local Registry
```bash
# Initialize local registry
hermes skill-registry init-local

# Add local registry
hermes skill-registry add-source --name local --path ./.skills

# Sync with local registry
hermes skill-registry sync-local

# Publish to local registry
hermes skill-registry publish-local --skill "hermes-my-skill"
```

### Remote Registry
```bash
# Add remote registry
hermes skill-registry add-remote \
  --name "team-registry" \
  --url "https://skills.company.com/registry"

# Sync from remote
hermes skill-registry sync-from --remote "team-registry"

# Publish to remote
hermes skill-registry publish \
  --remote "team-registry" \
  --skill "hermes-internal-skill"

# Search remote registry
hermes skill-registry search-remote \
  --remote "team-registry" \
  --query "internal tools"
```

### Skill Verification
```bash
# Verify skill integrity
hermes skill-registry verify --skill "hermes-skill-manager"

# Verify all skills
hermes skill-registry verify-all

# Sign skill for publication
hermes skill-registry sign --skill "hermes-new-skill"

# Check skill signature
hermes skill-registry check-signature --skill "hermes-verified-skill"
```

## Configuration

### Registry Config
```yaml
# ~/.hermes/skill-registry.yaml
registry:
  # Local storage
  local_path: "~/.hermes/skills"
  local_enabled: true
  
  # Remote registries
  remotes:
    - name: "official"
      url: "https://registry.hermes.ai"
      type: "official"
      priority: 1
      auto_sync: true
      sync_interval: 3600
    
    - name: "team-registry"
      url: "https://skills.company.com/registry"
      type: "team"
      priority: 2
      auto_sync: false
      auth:
        type: "token"
        token_env: "HERMES_REGISTRY_TOKEN"
  
  # Search settings
  search:
    enable_fuzzy: true
    fuzzy_threshold: 0.7
    max_results: 100
    highlight_matches: true
    
    # Search weights
    field_weights:
      name: 3.0
      description: 1.5
      keywords: 1.2
      tags: 1.0
      author: 0.5
  
  # Discovery settings
  discovery:
    auto_recommend: true
    recommend_similarity: 0.8
    show_trending: true
    trending_period: 7  # days
    
  # Version management
  versioning:
    auto_update: false
    update_strategy: "semver-compatible"  # semver, latest, none
    auto_update_check: "daily"
    warn_on_major: true
    
  # Compatibility
  compatibility:
    check_on_load: true
    auto_check: true
    auto_repair: false
    
  # Security
  security:
    verify_signatures: true
    require_publisher: false
    trusted_publishers: ["Nous Research", "Official"]
    sandbox_untrusted: true
    
  # Performance
  cache:
    enabled: true
    ttl: 3600
    max_size: "100MB"
    
  # Logging
  logging:
    level: "info"
    log_searches: true
    log_installs: true
    log_updates: true
```

### Skill Package Manifest
```yaml
# hermes-skill.yaml (skill manifest)
name: hermes-skill-name
version: 1.0.0
description: "Brief description of the skill"
category: "core-hermes"
author: "Author Name"

dependencies:
  hermes-core: "^1.0.0"
  hermes-skill-manager: "^2.0.0"

devDependencies:
  - hermes-testing: "^1.0.0"

peerDependencies:
  hermes-runtime: "^2.0.0"

permissions:
  filesystem: true
  network: false
  shell: false

entry: SKILL.md
scripts:
  install: "npm install"
  test: "npm run test"
  build: "npm run build"
  cleanup: "npm run cleanup"

hooks:
  on-load: "scripts/on-load.sh"
  on-unload: "scripts/on-unload.sh"
  on-error: "scripts/on-error.sh"
```

## Best Practices

### 1. Skill Naming Conventions
```markdown
## Skill Naming Best Practices

### Format
`hermes-[category]-[description]` format for Hermes-specific skills
- Good: `hermes-model-switching`
- Good: `hermes-session-search`
- Avoid: `skill-model`, `hermes123`

### Version Naming
Use Semantic Versioning (SemVer):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Versioning Examples
- 1.0.0: Initial stable release
- 1.0.1: Bug fix
- 1.1.0: New feature, backward compatible
- 2.0.0: Breaking change
```

### 2. Registry Maintenance
```bash
# Regular maintenance tasks
hermes skill-registry cleanup              # Remove unused entries
hermes skill-registry reindex             # Rebuild search index
hermes skill-registry prune               # Remove old versions
hermes skill-registry repair              # Fix registry inconsistencies
hermes skill-registry backup              # Create registry backup
```

### 3. Security Guidelines
```bash
# Sign skills before publishing
hermes skill-registry sign --skill "hermes-new-skill"

# Verify signatures on install
hermes skill-registry install --skill "hermes-verfied" --verify

# Check for known vulnerabilities
hermes skill-registry security-check --skill "hermes-skill"

# Scan for vulnerabilities across all skills
hermes skill-registry security-scan
```

## Troubleshooting

### Common Issues

#### Skill Not Found
```bash
# Search with broader terms
hermes skill-registry search --query "model" --fuzzy

# Check all registries
hermes skill-registry search --all-registries "task"

# Update registry index
hermes skill-registry sync-all

# Check for typos in skill ID
hermes skill-registry show --skill "hermes-model-switching" --suggest
```

#### Version Conflicts
```bash
# Check version compatibility
hermes skill-registry check-compat --skill "hermes-skill-manager"

# View dependency tree
hermes skill-registry deps-tree --skill "my-skill"

# Auto-resolve conflicts
hermes skill-registry resolve-conflicts --auto

# Install specific version
hermes skill-registry install --skill "hermes-model-switching" --version 1.2.3
```

#### Registry Sync Issues
```bash
# Check registry connectivity
hermes skill-registry check-remotes

# Force sync
hermes skill-registry sync --force

# Clear cache
hermes skill-registry clear-cache

# Check for corrupted entries
hermes skill-registry check-corruption --repair
```

#### Search Performance
```bash
# Rebuild search index
hermes skill-registry rebuild-index

# Optimize database
hermes skill-registry optimize

# Enable search caching
hermes skill-registry config-set --key search.cache.enabled --value true
```

## CLI Commands Reference

```bash
# Discovery
hermes skill-registry list                            # List all skills
hermes skill-registry search --query "TERM"          # Search skills
hermes skill-registry categories                     # List categories
hermes skill-registry show --skill NAME              # Show skill details
hermes skill-registry recommend                      # Get recommendations

# Registration
hermes skill-registry register --path PATH          # Register local skill
hermes skill-registry register-remote --url URL     # Register remote skill
hermes skill-registry install --skill NAME          # Install from registry
hermes skill-registry uninstall --skill NAME        # Remove skill

# Version Management
hermes skill-registry versions --skill NAME          # List versions
hermes skill-registry update --skill NAME           # Update to latest
hermes skill-registry update --skill NAME --version X.Y.Z  # Specific version
hermes skill-registry history --skill NAME         # View version history
hermes skill-registry rollback --skill NAME          # Rollback version

# Dependencies
hermes skill-registry deps --skill NAME             # Show dependencies
hermes skill-registry check-conflicts               # Check for conflicts
hermes skill-registry resolve-conflicts --auto     # Auto-resolve
hermes skill-registry deps-graph                  # Generate dependency graph

# Publishing
hermes skill-registry publish --skill NAME          # Publish to registry
hermes skill-registry publish-local --skill NAME    # Publish to local
hermes skill-registry sign --skill NAME            # Sign skill
hermes skill-registry verify --skill NAME          # Verify integrity

# Maintenance
hermes skill-registry sync-all                      # Sync all registries
hermes skill-registry rebuild-index               # Rebuild search index
hermes skill-registry cleanup                      # Clean up old entries
hermes skill-registry backup                       # Create backup
```

## API Reference

### JavaScript API
```javascript
import { SkillRegistry } from 'hermes-skill-registry';

const registry = new SkillRegistry({
  configPath: '~/.hermes/skill-registry.yaml'
});

// Search skills
const results = await registry.search({
  query: 'model switching',
  fuzzy: true,
  category: 'core-hermes',
  ratingMin: 4.0
});

// Register a skill
await registry.register({
  path: './skills/my-new-skill',
  category: 'development',
  version: '1.0.0'
});

// Check compatibility
const compat = await registry.checkCompatibility('hermes-skill-manager', '3.0.0');

// Get recommendations
const recs = await registry.recommend({
  profile: 'Developer',
  currentlyInstalled: ['hermes-skill-manager', 'hermes-model-switching']
});
```

### Python API
```python
from hermes_skill_registry import SkillRegistry

registry = SkillRegistry(config_path='~/.hermes/skill-registry.yaml')

# Search skills
results = registry.search(
    query='session search',
    category='core-hermes',
    min_rating=4.0
)

# Install skill
registry.install('hermes-performance-monitoring')

# Version management
versions = registry.list_versions('hermes-model-switching')
registry.update('hermes-model-switching', version='2.0.0')
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Skill discovery and search
- [x] Categorization and tagging
- [x] Dependency resolution
- [x] Version management
- [x] Basic security verification

### Phase 2 (Q4 2026)
- [ ] AI-powered skill recommendations
- [ ] Semantic skill search
- [ ] Cross-registry federation
- [ ] Advanced compatibility checking
- [ ] Skill quality scoring

### Phase 3 (2027)
- [ ] Community skill marketplace
- [ ] Skill rating and reviews
- [ ] Skill analytics and usage tracking
- [ ] Automated skill testing
- [ ] Skill evolution tracking

### Phase 4 (Future)
- [ ] Blockchain-based skill verification
- [ ] Decentralized skill sharing
- [ ] AI-assisted skill composition
- [ ] Skill ecosystem health monitoring
- [ ] Quantum-resistant signatures

---

**Hermes Skill Registry** - Centralized skill discovery, management, and version control for Hermes Agent Desktop. Find, install, update, and manage all Hermes skills with full dependency resolution and compatibility checking.