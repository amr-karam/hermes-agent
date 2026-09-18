---
name: hermes-session-management
production: true
description: Manage Hermes Agent Desktop session lifecycle.
tags: [hermes, session-management, session-lifecycle, state.db, SQLite, persistence, recovery]
category: productivity
---

# Hermes Session Management

This skill provides comprehensive session lifecycle management for Hermes Agent Desktop. It manages the SQLite state.db database, session persistence, backup, recovery, and full session state operations.

## Quick Start

### Session Operations
```bash
# Save current session
hermes session save --name "Work on project-alpha" --description "Initial sprint planning"

# Load a session
hermes session load --id session-12345

# List saved sessions
hermes session list --limit 20

# Delete a session
hermes session delete --id session-12345 --confirm
```

### Session State Management
```bash
# Export session
hermes session export --id session-12345 --format json --output session.json

# Import session
hermes session import --file session.json --replace current

# Backup all sessions
hermes session backup --output sessions-backup-$(date +%Y%m%d).tar.gz

# Restore from backup
hermes session restore --file sessions-backup-20260115.tar.gz
```

### State Database Operations
```bash
# View state.db schema
hermes session db-schema

# Run database optimization
hermes session optimize-db

# Check database health
hermes session db-health

# Export database
hermes session export-db --output state.db.backup

# Import database
hermes session import-db --file state.db.backup
```

## Core Capabilities

### 1. Session Lifecycle Management

#### Creating Sessions
```bash
# Create a new session with metadata
hermes session create \
  --name "React Component Design" \
  --description "Design new dashboard components" \
  --profile "Developer" \
  --tags "react,components,dashboard"

# Create session from template
hermes session create-from-template \
  --template "code-review" \
  --name "Review feature-x"

# Duplicate existing session
hermes session duplicate --id session-12345 --name "Copy of Review"
```

#### Session Metadata
```bash
# Add metadata to session
hermes session update-metadata \
  --id session-12345 \
  --set priority "high" \
  --set status "in-progress" \
  --set project "project-alpha"

# List sessions with metadata
hermes session list --format table \
  --show-columns "name,created,updated,duration,model,profile,tag"

# Filter sessions by metadata
hermes session list \
  --tag "urgent" \
  --profile "Developer" \
  --status "in-progress"

# Search sessions by metadata
hermes session search-metadata --query "project:alpha AND priority:high"
```

#### Session States
| State | Description | Actions Allowed |
|-------|-------------|-----------------|
| **Active** | Currently in use | Read, write, save |
| **Paused** | Temporarily stopped | Resume, save, delete |
| **Saved** | Persisted to disk | Load, import, delete |
| **Exported** | Backed up externally | Import, restore |
| **Archived** | Read-only, historical | Load, export, delete |
| **Deleted** | Marked for removal | Recover, permanently delete |

### 2. State Database (state.db) Management

#### Database Schema
```sql
-- Hermes state database schema
SQLite version 5.x - state.db

Tables:
- sessions (session metadata and state)
- messages (conversation messages)
- tools (tool invocation history)
- memories (persistent memory storage)
- agents (agent state and preferences)
- profiles (profile configurations)
- models (model configurations)
- skills (skill states)
- analytics (usage analytics)
```

#### Database Operations
```bash
# Check database size and stats
hermes session db-stats

# Run vacuum to optimize
hermes session db-vacuum

# Analyze tables
hermes session db-analyze --table sessions

# Export specific tables
hermes session export-table --table messages --id session-12345 --output messages.csv

# Import into table
hermes session import-table --table messages --file messages.csv

# Generate database report
hermes session db-report --output db-report-2026.json
```

#### Database Maintenance
```bash
# Fix database integrity
hermes session db-fix --check-integrity

# Rebuild indexes
hermes session db-reindex

# Compact database
hermes session db-compact

# Validate schema
hermes session db-validate-schema

# Generate database migration script
hermes session db-migrate --target-version 5.2
```

### 3. Session Recovery and Backup

#### Automated Backups
```bash
# Enable automatic session backup
hermes session backup-enable --interval daily --retention 30

# Schedule backup times
hermes session backup-schedule --daily "02:00" --weekly "sunday" --monthly "1st"

# Configure backup destination
hermes session backup-set-destination \
  --local \
  --cloud aws://hermes-backups \
  --email archive@example.com

# Test backup connectivity
hermes session backup-test
```

#### Manual Backup Operations
```bash
# Create timestamped backup
hermes session backup-full --name "pre-migration" --include-attachments

# Create incremental backup
hermes session backup-incremental --since "last-backup"

# List available backups
hermes session backup-list --last 30

# Restore from specific backup
hermes session restore-backup \
  --backup-id backup-2026-01-15 \
  --sessions-only \
  --overwrite-existing
```

#### Recovery Scenarios
```bash
# Recover deleted session
hermes session recover --id session-deleted-xyz

# Restore session from backup
hermes session restore-session \
  --backup "backup-2026-01-15" \
  --session-id session-12345

# Merge sessions
hermes session merge \
  --sessions "session-123,session-456" \
  --output "merged-session"

# Export to multiple formats
hermes session export-multi \
  --id session-12345 \
  --formats "json,md,csv,presentation"
```

### 4. Session Analytics

#### Usage Analytics
```bash
# Session duration statistics
hermes session analytics duration --period "last-month"

# Model usage breakdown
hermes session analytics models --period "last-quarter"

# Profile usage
hermes session analytics profiles --period "last-month"

# Task type analysis
hermes session analytics task-types --top 20
```

#### Performance Metrics
```bash
# Response time analysis
hermes session analytics response-times --period "last-week"

# Token usage
hermes session analytics tokens --period "last-month"

# Cost analysis
hermes session analytics costs --provider openrouter --period "last-month"

# Error rate analysis
hermes session analytics errors --type timeout --period "last-week"
```

#### Insights and Recommendations
```bash
# Get session insights
hermes session insights --session-id session-12345

# Recommendations for optimization
hermes session recommendations --focus performance

# Predictive session duration
hermes session predict-duration --session-id session-12345
```

### 5. Cross-Platform Session Management

#### Sync Across Devices
```bash
# Enable cross-device sync
hermes session sync-enable --method cloud --provider aws

# Configure sync interval
hermes session sync-set-interval --minutes 5

# Manual sync
hermes session sync-now

# View sync status
hermes session sync-status

# Resolve sync conflicts
hermes session sync-conflicts --resolve auto
```

#### Cloud Storage Integration
```bash
# Configure cloud storage
hermes session cloud-configure \
  --provider aws \
  --bucket hermes-sessions \
  --region us-west-2 \
  --credentials ~/.aws/credentials

# Sync specific sessions
hermes session cloud-sync \
  --sessions "session-123,session-456" \
  --direction upload

# Download from cloud
hermes session cloud-download --session-id session-123
```

#### File Format Support
```bash
# Supported export formats
- JSON (full session data)
- Markdown (transcript)
- CSV (messages)
- PDF (presentation)
- PNG/JPEG (conversation visualization)
- XML (standard format)
- YAML (configuration)
```

## Configuration

### Session Manager Config
```yaml
# ~/.hermes/session-config.yaml
session_management:
  # Auto-save settings
  auto_save: true
  auto_save_interval: 30  # seconds
  auto_save_on_exit: true
  
  # Session naming
  naming_strategy: "date-topic"  # Options: date-topic, auto, manual
  naming_format: "{date} - {topic}"
  
  # Metadata defaults
  default_tags: ["auto-saved"]
  default_profile: "Default"
  
  # Retention and cleanup
  retention_days: 90
  auto_cleanup: true
  cleanup_interval: 86400  # daily
  
  # Storage
  max_session_size: 500MB
  compression_enabled: true
  
  # Backup
  backup_enabled: true
  backup_interval: 86400  # daily
  backup_retention_days: 30
  backup_destination: "local"  # or "cloud", can be multiple
  
  # Sync
  sync_enabled: false
  sync_provider: "aws"
  sync_interval: 300  # seconds
  sync_conflict_resolution: "latest-wins"

database:
  # state.db settings
  db_path: "~/.hermes/state.db"
  journal_mode: "WAL"
  synchronous: "NORMAL"
  cache_size: 10000
  temp_store: "MEMORY"
  
  # Performance
  vacuum_interval: 86400  # daily
  analyze_interval: 86400
  
  # Security
  encrypt_at_rest: true
  backup_encryption: true
```

### Session Templates
```yaml
# Predefined session templates
session_templates:
  code_review:
    name: "Code Review"
    profile: "Developer"
    tags: ["code-review", "analysis"]
    model_assignment:
      main: "openrouter/gpt-4o"
      code-specific: "anthropic/claude-3-opus"
    auto_save_interval: 15
    
  research:
    name: "Research Session"
    profile: "Researcher"
    tags: ["research", "analysis", "documentation"]
    model_assignment:
      main: "anthropic/claude-3-opus"
      search: "google/gemini-pro"
    auto_save_interval: 30
```

## Integration Points

### 1. Hermes Model Switching Integration
```bash
# Track model usage per session
hermes session track-model --session-id session-12345 --action "used gpt-4o for coding"

# Auto-select model based on session context
hermes session auto-set-model --session-id session-12345 --context "coding"
```

### 2. Profile Manager Integration
```bash
# Create session with profile settings
hermes session create \
  --name "Research Project" \
  --profile "Researcher" \
  --import-profile-models

# Apply profile settings to session
hermes session apply-profile --session-id session-12345 --profile "Analyst"
```

### 3. Session Search Integration
```bash
# Search sessions
hermes session-search query --text "project-alpha"

# Advanced session analysis
hermes session-search analyze-sessions --period "last-month" --metrics "duration,model-usage"
```

### 4. Skill Manager Integration
```bash
# Skills that require session access
hermes skill-manager enable-session-access

# Register session-dependent skills
hermes skill-manager register-sessions-skills
```

## Best Practices

### 1. Session Organization
```markdown
## Organizing Sessions Effectively

### Naming Conventions
- Descriptive: "React Dashboard Implementation"
- Date-based: "2026-01-15 - API Design Session"
- Project-based: "[Project-XYZ] User Authentication"

### Tagging Strategy
```yaml
tags:
  - project: "project-alpha, project-beta"
  - priority: "urgent, high, normal, low"
  - status: "in-progress, completed, archived"
  - type: "coding, writing, analysis, research"
  - team: "backend, frontend, design"
  - milestone: "sprint-1, sprint-2, review"
```

### Archival Strategy
- Active: 30 days with version history
- Recently completed: 90 days at higher resolution
- Historical: Compressed archives with metadata only
```

### 2. Backup Strategy
```bash
# Daily incremental backups
hermes session backup --frequency daily --type incremental

# Weekly full backups
hermes session backup --frequency weekly --type full --compression

# Monthly archives
hermes session backup --frequency monthly --type archive --encrypt

# Disaster recovery plan
hermes session backup-test --every 7days
```

### 3. Security Considerations
```bash
# Encrypt sensitive session data
hermes session encrypt --enabled true

# Access control for session data
hermes session set-permissions \
  --session-id session-12345 \
  --read "team-users" \
  --write "team-leads"

# Audit session access
hermes session audit-access --session-id session-12345 --days 30
```

## Troubleshooting

### Common Issues

#### Session Corruption
```bash
# Diagnose session corruption
hermes session diagnose-corruption --id session-12345

# Repair session
hermes session repair --id session-12345

# Restore from backup
hermes session restore-session --from-backup session-backup-2026-01-15 --id session-12345
```

#### Database Lock Issues
```bash
# Check database locks
hermes session db-locks --status

# Kill blocking processes
hermes session db-unlock --process-id 12345

# Enable WAL mode for better concurrency
hermes session db-set-journal-mode --mode WAL
```

#### Sync Conflicts
```bash
# List sync conflicts
hermes session sync-conflicts --list

# Resolve conflicts
hermes session sync-conflicts --resolve --strategy "merge"

# Force sync direction
hermes session sync --force-upload

# Pause sync temporarily
hermes session sync --pause --duration 1h
```

#### Performance Issues
```bash
# Profile session loading
hermes session profile-load --id session-12345

# Optimize database
hermes session optimize-db

# Clear session cache
hermes session clear-cache

# Check for large sessions
hermes session check-size --threshold 100MB
```

## CLI Commands Reference

```bash
# Session CRUD
hermes session create --name "session name" --description "description"
hermes session list [options]                    # List sessions
hermes session show --id ID                      # Show session details
hermes session load --id ID                      # Load session
hermes session save --name "name" --set-active   # Save and make active
hermes session delete --id ID                    # Delete session
hermes session duplicate --id ID --name "copy"   # Duplicate session

# Metadata operations
hermes session update-metadata --id ID --set key=value
hermes session add-tags --id ID --tags "tag1,tag2"
hermes session remove-tags --id ID --tags "tag1"
hermes session search-metadata --query "key:value"

# Export/Import
hermes session export --id ID --format json --output file.json
hermes session import --file file.json --replace current
hermes session export-transcript --id ID --format markdown --output transcript.md

# Backup operations
hermes session backup --name "backup-name" --full
hermes session backup-restore --backup-id ID --sessions-only
hermes session backup-list --last 30
hermes session backup-test

# Database operations
hermes session db-stats                           # Show database statistics
hermes session db-vacuum                            # Optimize database
hermes session db-analyze                           # Analyze tables
hermes session db-repair                            # Repair database
hermes session db-schema                            # Show schema
hermes session db-backup --output backup.db        # Backup database
hermes session db-restore --file backup.db         # Restore database

# Analytics and reporting
hermes session analytics duration                  # Duration statistics
hermes session analytics models                    # Model usage
hermes session analytics costs                     # Cost analysis
hermes session analytics errors                    # Error analysis
hermes session insights --id ID                   # Session insights
hermes session recommendations                   # Improvement recommendations

# Sync operations
hermes session sync-enable --method cloud
hermes session sync-now
hermes session sync-status
hermes session sync-conflicts --resolve
hermes session cloud-sync --direction upload
hermes session cloud-download --session-id ID
```

## API Reference

### JavaScript API
```javascript
import { SessionManager } from 'hermes-session-management';

const sm = new SessionManager({
  dbPath: '~/.hermes/state.db',
  basePath: '~/.hermes/sessions'
});

// Create session
const sessionId = await sm.create({
  name: 'Code Review Session',
  description: 'Review feature-x implementation',
  profile: 'Developer',
  tags: ['code-review', 'feature-x']
});

// Load session
const session = await sm.load(sessionId);

// Save session with metadata
await sm.save(session, {
  metadata: {
    status: 'completed',
    priority: 'high'
  }
});

// Export session
await sm.export(sessionId, {
  format: 'json',
  output: './sessions/code-review.json'
});

// Get analytics
const analytics = await sm.getAnalytics({
  period: 'last-month',
  metrics: ['duration', 'tokenUsage', 'cost']
});
```

### Python API
```python
from hermes_session import SessionManager

sm = SessionManager(
    db_path='~/.hermes/state.db',
    session_path='~/.hermes/sessions'
)

# Create session
session_id = sm.create(
    name='Research Session',
    description='Investigate new framework',
    profile='Researcher',
    tags=['research', 'framework']
)

# Add metadata
sm.update_metadata(
    session_id,
    {'priority': 'high', 'status': 'in-progress'}
)

# Full backup
sm.backup(
    name='pre-migration-backup',
    include_attachments=True,
    encrypt=True
)

# Analytics
analytics = sm.analytics(
    period='last-month',
    metrics=['duration', 'model_usage', 'cost']
)
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Session CRUD operations
- [x] Session metadata management
- [x] state.db database operations
- [x] Export/Import functionality
- [x] Basic backup/restore

### Phase 2 (Q4 2026)
- [ ] Cross-device sync
- [ ] Cloud storage integration
- [ ] Advanced analytics dashboard
- [ ] Session templates
- [ ] Automated cleanup policies

### Phase 3 (2027)
- [ ] AI-powered session organization
- [ ] Predictive session management
- [ ] Collaborative session editing
- [ ] Enterprise backup solutions
- [ ] Session version control

### Phase 4 (Future)
- [ ] Quantum-resistant encryption
- [ ] Blockchain session verification
- [ ] Cross-platform federation
- [ ] Semantic session search
- [ ] AI session summarization

---

**Hermes Session Management** - Comprehensive session lifecycle management for Hermes Agent Desktop. Preserve, organize, and analyze your conversations with full SQLite state.db integration, backup, recovery, and cross-device sync capabilities.