---
name: hermes-skill-manager
production: true
description: Auto-discovers and manages Hermes Agent Desktop skills.
tags: [hermes, skill-manager, skill-discovery, dependency-resolution, lifecycle-management, auto-discovery]
category: devops
---

# Hermes Skill Manager

This skill provides comprehensive skill lifecycle management for Hermes Agent Desktop. It auto-discovers skills, validates dependencies, monitors performance, and manages skill activation and deactivation.

## Quick Start

### Auto-Discover and Load All Skills
```bash
# Automatically discover and validate all skills in the skills directory
hermes skill-manager discover

# Load all discovered skills with validation
hermes skill-manager load-all

# Reload skills after modifications
hermes skill-manager reload
```

### Validate Skills
```bash
# Validate all skills for correctness
hermes skill-manager validate

# Check specific skill dependencies
hermes skill-manager validate --skill hermes-model-switching

# Generate validation report
hermes skill-manager validate --output report.json
```

### Monitor Performance
```bash
# Show skill loading performance metrics
hermes skill-manager monitor

# Generate performance report
hermes skill-manager monitor --report perf-report.json

# Alert on slow-loading skills
hermes skill-manager monitor --threshold 2000
```

## Core Capabilities

### 1. Skill Discovery and Registry

#### Automatic Skill Discovery
```bash
# Scan the skills directory and catalog all available skills
npx hermes skill-manager discover

# Output: Complete list of skills with metadata
# - Skill name
# - Description
# - Category
# - Dependencies
# - Status (loaded/unchecked/broken)
# - Last loaded timestamp
```

#### Skill Registry Management
```bash
# Register a new skill
npx hermes skill-manager register --skill hermes-new-skill --path ./skills/hermes-new-skill

# Unregister a skill
npx hermes skill-manager unregister --skill hermes-old-skill

# Update skill metadata
npx hermes skill-manager update-metadata --skill hermes-existing-skill --description "Updated description"
```

### 2. Dependency Resolution

#### Dependency Graph
```bash
# Generate skill dependency graph
npx hermes skill-manager deps --graph skills-graph.png

# Show dependency tree for a specific skill
npx hermes skill-manager deps --skill hermes-model-switching

# Detect circular dependencies
npx hermes skill-manager deps --detect-circular
```

#### Dependency Resolution
```bash
# Install required dependencies for a skill
npx hermes skill-manager install-deps --skill hermes-new-feature

# Check if dependencies are satisfied
npx hermes skill-manager check-deps --skill hermes-integration

# Auto-resolve common dependency issues
npx hermes skill-manager auto-fix --skill hermes-broken-skill
```

### 3. Skill Validation

#### Validation Checks
```bash
# Comprehensive skill validation
npx hermes skill-manager validate

# Check specific validation areas:
- Syntax validation: --check syntax
- Dependency validation: --check deps
- Configuration validation: --check config
- Integration validation: --check integration

# Example validation output:
# ✅ hermes-skill-manager: Valid (12ms)
# ⚠️ hermes-model-switching: Missing dependency @openrouter/api (200ms)
# ❌ hermes-profile-manager: Invalid YAML frontmatter (line 5)
```

#### Validation Rules
| Check Type | Description | Priority |
|------------|-------------|----------|
| **YAML Frontmatter** | Valid frontmatter structure and required fields | Critical |
| **Schema Compliance** | SKILL.md structure matches expected format | Critical |
| **Dependency Check** | All referenced dependencies exist and are loadable | High |
| **Configuration** | Skill configuration is valid and complete | High |
| **Performance** | Skill loading time under threshold | Medium |
| **Security** | No security issues in skill code | High |

### 4. Performance Monitoring

#### Loading Performance
```bash
# Measure skill loading times
hermes skill-manager monitor

# Sample output:
# Skill Name          | Load Time | Status  | Last Loaded
# hermes-skill-manager| 15ms      | ✅ OK   | 2 min ago
# hermes-model-switching| 240ms    | ⚠️ WARNING | 5 min ago
# hermes-profile-manager| 35ms     | ✅ OK   | 3 min ago
# hermes-session-search| 8ms      | ✅ OK   | 1 min ago
```

#### Performance Reports
```bash
# Generate detailed performance report
hermes skill-manager monitor --report perf-report.json

# Include in report:
# - Per-skill loading times
# - Average loading time across all skills
# - Slowest and fastest skills
# - Trend data (loading times over time)
# - Recommendations for optimization
```

#### Optimization Recommendations
```bash
# Get optimization suggestions
hermes skill-manager monitor --optimize

# Common optimizations:
# - Cache frequently loaded skills
# - Lazy-load non-essential skills
# - Parallel load independent skills
# - Remove unused skills
# - Optimize YAML parsing
```

### 5. Lifecycle Management

#### Skill Activation/Deactivation
```bash
# Enable a skill
hermes skill-manager enable --skill hermes-new-feature

# Disable a skill (without deleting)
hermes skill-manager disable --skill hermes-old-feature

# Toggle skill status
hermes skill-manager toggle --skill hermes-experimental
```

#### Skill Health Check
```bash
# Check overall skill health
hermes skill-manager health

# Output health status:
# Overall Health: 94% ✅
# - Critical Issues: 0
# - Warning Issues: 2
# - OK Skills: 28 of 30
# - Broken Skills: 2

# List issues:
# ⚠️ hermes-model-switching: Slow loading (240ms > 200ms threshold)
# ⚠️ hermes-profile-manager: Deprecated API usage detected
```

## Skill Categories

### 📦 **Core Hermes Skills** (Always Loaded)
- `hermes-skill-manager` - Skill management (this skill)
- `hermes-model-switching` - Model provider switching
- `hermes-profile-manager` - Profile management
- `hermes-session-search` - Session discovery
- `hermes-moa-orchestration` - Mixture of Agents

### 🔧 **Development Skills** (Optional)
- `hermes-code-review` - Code review automation
- `hermes-testing` - Skill testing framework
- `hermes-debug` - Debugging utilities
- `hermes-docs` - Documentation generation

### 🌐 **Integration Skills** (Conditional)
- `hermes-api-integration` - External API connections
- `hermes-git-integration` - Git operations
- `hermes-cloud-integration` - Cloud service integration
- `hermes-database-integration` - Database operations

### 🎯 **Specialized Skills** (Task-Specific)
- `hermes-creative` - Creative content generation
- `hermes-data-science` - Data analysis and ML
- `hermes-web-dev` - Web development helpers
- `hermes-mobile` - Mobile app development

## Configuration

### Skill Manager Config
```yaml
# ~/.hermes/skill-manager.yaml
skill_manager:
  auto_discover: true
  validate_on_load: true
  monitor_performance: true
  performance_threshold: 2000  # ms
  cache_loading: true
  cache_ttl: 3600  # seconds
  max_concurrent_loads: 5
  enable_analytics: true
  log_level: "info"
  
skills:
  auto_load_pattern: "hermes-*"
  exclude_patterns: []
  include_patterns: []
  
  # Performance settings
  parallel_loading: true
  max_parallel: 5
  load_order: "dependencies-first"
  
  # Validation settings
  strict_validation: true
  warn_on_deprecated: true
  fail_on_broken: false
  
  # Monitoring settings
  enable_metrics: true
  metrics_retention: 30  # days
  alert_on_slow_load: true
  slow_load_threshold: 2000  # ms
```

### Custom Skill Registration
```yaml
# Register custom skills in config
custom_skills:
  - name: hermes-my-custom-skill
    path: ./custom-skills/my-skill
    priority: 10  # Higher priority loads first
    enabled: true
    dependencies:
      - hermes-core
      - hermes-utils
```

## Integration with Hermes Ecosystem

### AGENTS Screen Integration
```bash
# Skills appear automatically in AGENTS screen after discovery
hermes skill-manager sync-with-agents

# Manual sync if needed
hermes skill-manager refresh-agents-screen
```

### Model Provider Integration
```bash
# Model switching skills integrate with /model command
hermes skill-manager integrate-models

# Switch models using skill
hermes skill-manager switch-model --provider openrouter --model gpt-4o

# Update model configurations
hermes skill-manager update-model-config --provider anthropic --model claude-3-opus
```

### Session State Integration
```bash
# Skills integrate with Hermes state.db (SQLite FTS5)
hermes skill-manager sync-session-state

# Query session state from skills
hermes skill-manager query-state --filter "recent" --limit 10

# Export session data for skills
hermes skill-manager export-session-data --format json --output sessions.json
```

## Best Practices

### 1. Skill Design Guidelines
```markdown
## Writing Hermes-Compatible Skills

### Required Fields in SKILL.md
```yaml
---
name: your-skill-name
description: Clear description of what the skill does
production: true  # or false for development skills
---
```

### Recommended Structure
```markdown
# Your Skill Name

## Quick Start
Minimal usage examples

## Core Capabilities
- Capability 1
- Capability 2
- Capability 3

## Configuration
Required and optional settings

## Examples
Concrete usage examples

## Dependencies
List of required packages/skills
```

### Skill Naming Conventions
- **Use**: `hermes-verb-noun` format (e.g., `hermes-model-switching`)
- **Avoid**: Generic names like `helper`, `utils`, `tools`
- **Prefix**: Always use `hermes-` prefix for Hermes skills
- **Lowercase**: All lowercase with hyphens for word separation

### Dependency Management
```yaml
# In SKILL.md frontmatter or separate deps file
dependencies:
  - hermes-core: "^1.0.0"
  - hermes-model-switching: "^2.0.0"
  - @openrouter/api: "^1.0.0"

# Optional dependencies
optional_deps:
  - hermes-profile-manager: "^1.0.0"  # For profile-aware operations
  - hermes-session-search: "^1.0.0"   # For session-aware operations
```

### Performance Considerations
- Keep SKILL.md under 500 lines
- Use progressive disclosure for detailed content
- Cache static content and examples
- Lazy-load non-essential features
- Parallel-load independent skills

### Security Best Practices
- Validate all user inputs in skill code
- Never expose API keys or secrets in skill documentation
- Use environment variables for sensitive configurations
- Follow Hermes security guidelines for skill execution
- Regularly update dependencies to patch security vulnerabilities

## Troubleshooting

### Common Issues

#### Skill Not Loading
```bash
# Diagnose loading issues
hermes skill-manager diagnose --skill hermes-broken-skill

# Common fixes:
# 1. Check YAML frontmatter validity
# 2. Verify all dependencies are installed
# 3. Check for syntax errors in skill code
# 4. Ensure skill directory structure is correct
# 5. Run: hermes skill-manager validate --skill hermes-broken-skill
```

#### Slow Loading Performance
```bash
# Identify slow skills
hermes skill-manager monitor --threshold 1000

# Optimization steps:
# 1. Check for expensive operations on load
# 2. Move heavy logic to lazy-loaded functions
# 3. Implement caching for static content
# 4. Parallel-load independent skills
# 5. Consider lazy-loading non-essential features
```

#### Dependency Conflicts
```bash
# Detect and resolve conflicts
hermes skill-manager deps --detect-conflicts

# Resolution:
# 1. Update conflicting dependencies to compatible versions
# 2. Use version ranges instead of exact versions
# 3. Isolate skills with conflicting dependencies
# 4. Implement skill-specific dependency isolation
```

#### Validation Failures
```bash
# Detailed validation output
hermes skill-manager validate --verbose

# Fix based on error messages:
# 1. Fix YAML syntax errors
# 2. Install missing dependencies
# 3. Update deprecated APIs
# 4. Reformat code to match style guidelines
# 5. Consult skill documentation for required fields
```

## API Reference

### Programmatic Access
```javascript
// Load skills programmatically
import { SkillManager } from 'hermes-skill-manager';

const manager = new SkillManager({
  skillsDir: './skills',
  configPath: '~/.hermes/skill-manager.yaml'
});

// Discover all skills
const skills = await manager.discover();

// Load a specific skill
await manager.loadSkill('hermes-model-switching');

// Validate a skill
const result = await manager.validateSkill('hermes-model-switching');

// Get performance metrics
const metrics = await manager.getPerformanceMetrics();

// Generate reports
await manager.generateReport('perf-report.json');
```

### CLI Commands Reference
```bash
# Discovery and registry
hermes skill-manager discover    # Auto-discover skills
hermes skill-manager register    # Register new skill
hermes skill-manager unregister  # Unregister skill
hermes skill-manager sync        # Sync with AGENTS screen

# Validation and quality
hermes skill-manager validate    # Validate all skills
hermes skill-manager validate --skill NAME  # Validate specific skill
hermes skill-manager health      # Check overall health

# Performance monitoring
hermes skill-manager monitor     # Monitor performance
hermes skill-manager monitor --report FILE  # Generate report
hermes skill-manager monitor --optimize  # Get optimizations

# Dependency management
hermes skill-manager deps        # Show dependency graph
hermes skill-manager deps --skill NAME  # Show skill deps
hermes skill-manager install-deps --skill NAME  # Install deps

# Lifecycle management
hermes skill-manager enable --skill NAME  # Enable skill
hermes skill-manager disable --skill NAME # Disable skill
hermes skill-manager health      # Check skill health
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Skill discovery and auto-loading
- [x] Basic validation
- [x] Performance monitoring
- [x] Dependency management

### Phase 2 (Q4 2026)
- [ ] Advanced dependency resolution
- [ ] Skill version management
- [ ] Skill marketplace integration
- [ ] Collaborative skill development

### Phase 3 (2027)
- [ ] AI-powered skill recommendations
- [ ] Cross-platform skill compatibility
- [ ] Distributed skill execution
- [ ] Skill analytics and insights

### Phase 4 (Future)
- [ ] Federated skill learning
- [ ] Skill evolution and auto-updates
- [ ] Community skill sharing platform
- [ ] Enterprise skill governance

---

**Hermes Skill Manager** - Empowering Hermes Agent Desktop with comprehensive skill management capabilities. Auto-discover, validate, monitor, and optimize all your Hermes skills for peak performance and reliability.