---
name: hermes-session-search
production: true
description: Search Hermes Agent Desktop sessions using SQLite FTS5 full-text search. Query session content, metadata, and conversation history with advanced filtering, sorting, and aggregation capabilities.
---

# Hermes Session Search

This skill provides powerful SQLite FTS5 full-text search capabilities for Hermes Agent Desktop session management. It enables advanced querying of session states, conversation histories, and metadata stored in Hermes's state.db database.

## Quick Start

### Basic Search
```bash
# Search sessions by keyword
hermes session-search query --text "error handling"

# Search with date range
hermes session-search query --text "python" --start "2026-01-01" --end "2026-01-31"

# Search in specific sessions
hermes session-search session --id session-12345

# List recent sessions
hermes session-search recent --limit 20
```

### Advanced Search
```bash
# Full-text search with metadata filters
hermes session-search advanced \
  --text "react component" \
  --model "gpt-4o" \
  --duration "5m" \
  --sort relevance \
  --limit 50

# Boolean search
hermes session-search query --text "react AND component NOT testing"

# Phrase search
hermes session-search query --text "\"database schema\""

# Wildcard search
hermes session-search query --text "program*"
```
```

### Session Details
```bash
# Get session details
hermes session-search details --id session-12345

# Get conversation transcript
hermes session-search transcript --id session-12345

# Get session metadata
hermes session-search metadata --id session-12345
```

## Core Capabilities

### 1. Full-Text Search Engine

#### Search Syntax
```bash
# Basic keyword search
hermes session-search query --text "machine learning"

# Multi-keyword search (OR logic)
hermes session-search query --text "python javascript typescript"

# Phrase search with quotes
hermes session-search query --text "\"full stack development\""

# Boolean operators
hermes session-search query --text "python NEAR/5 django"

# Wildcards
hermes session-search query --text "debug*"

# Field-specific search
hermes session-search query --text "content:react"  # Search in content
hermes session-search query --text "model:gpt-4"     # Search in model field
hermes session-search query --text "author:john"     # Search in metadata
```

#### Search Configuration
```yaml
# ~/.hermes/session-search.yaml
search:
  enable_fts5: true
  bm25_weight: 1.0
  content_weight: 1.5
  metadata_weight: 0.8
  
  # Search index settings
  index_content: true
  index_metadata: true
  index_embedding: false  # Optional, for semantic search
  
  # Performance tuning
  cache_results: true
  cache_ttl: 3600  # 1 hour
  max_results: 1000
  timeout: 30  # seconds
  
  # Ranking options
  sort_options:
    - relevance  # BM25 score
    - date       # Most recent first
    - duration   # Longest sessions first
    - model_name # Alphabetical by model
```

### 2. Metadata Filtering

#### Date Range Filters
```bash
# Date range search
hermes session-search query --text "bug fix" --start "2026-01-01" --end "2026-01-31"

# Relative date filters
hermes session-search recent-days --days 7  # Last 7 days
hermes session-search recent-weeks --weeks 4  # Last 4 weeks
```

#### Session Type Filters
```bash
# By session type
hermes session-search query --text "research" --type research
hermes session-search query --text "code" --type coding
hermes session-search query --text "document" --type writing

# By profile
hermes session-search query --text "analysis" --profile "Data Analyst"
hermes session-search query --text "review" --profile "Code Reviewer"
```

#### User/Author Filters
```bash
# By author/contributor
hermes session-search query --text "api" --author "john@example.com"
hermes session-search query --text "requirements" --contributor "alice"

# Multiple authors
hermes session-search query --text "implementation" --authors "john,jane,bob"
```

#### Model Provider Filters
```bash
# By provider
hermes session-search query --text "coding" --provider openai
hermes session-search query --text "analysis" --provider anthropic

# By specific model
hermes session-search query --text "react" --model "gpt-4o"
hermes session-search query --text "python" --model "claude-3-opus"
```

#### Duration and Activity Filters
```bash
# By session duration
hermes session-search query --text "long" --duration-min 10  # 10+ minutes
hermes session-search query --text "quick" --duration-max 5   # 5 minutes or less

# By message count
hermes session-search query --text "discussion" --messages-min 50
hermes session-search query --text "short" --messages-max 10
```

### 3. Session Analysis

#### Term Frequency Analysis
```bash
# Get most common terms in sessions
hermes session-search analyze-terms --top 50

# Analyze terms in specific timeframe
hermes session-search analyze-terms --start "2026-01-01" --end "2026-01-31"

# Exclude common words
hermes session-search analyze-terms --exclude-stopwords
```

#### Session Clustering
```bash
# Cluster sessions by topic similarity
hermes session-search cluster --method lda --n-clusters 10

# Cluster by model usage
hermes session-search cluster --method model --n-clusters 5

# Export clusters
hermes session-search cluster --export clusters.json
```

#### Trend Analysis
```bash
# Session volume over time
hermes session-search trends --interval day --period "last-30-days"

# Model usage trends
hermes session-search trends-models --interval week --period "last-12-weeks"

# Topic trends
hermes session-search trends-topics --interval month --period "last-6-months"
```

### 4. Export and Reporting

#### Session Exporting
```bash
# Export sessions to JSON
hermes session-search export --format json --output sessions.json --limit 100

# Export to CSV
hermes session-search export --format csv --output sessions.csv --text "python"

# Export transcript only
hermes session-search export-transcript --id session-12345 --output transcript.txt

# Export in markdown format
hermes session-search export --format markdown --output sessions.md
```

#### Report Generation
```bash
# Generate activity report
hermes session-search report --type activity --period "last-week" --output activity-report.pdf

# Generate model usage report
hermes session-search report --type models --period "last-month" --output model-report.pdf

# Generate word cloud
hermes session-search generate-wordcloud --top 100 --output wordcloud.png

# Generate conversation visualization
hermes session-search visualize-conversation --id session-12345 --output conversation.png
```

## SQLite FTS5 Integration

### Database Schema
```sql
-- Hermes session datastore schema
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    title TEXT NOT NULL,
    tags TEXT,
    metadata TEXT,
    
    -- FTS5 virtual table for full-text search
    content TEXT,
    content_summary TEXT
);

-- Full-text search index
CREATE VIRTUAL TABLE sessions_fts USING fts5(
    id, 
    title, 
    content,
    content_summary,
    tokenize='porter unicode61'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER sessions_ai AFTER INSERT ON sessions BEGIN
    INSERT INTO sessions_fts(rowid, id, title, content, content_summary)
    VALUES (new.rowid, new.id, new.title, new.content, new.content_summary);
END;

CREATE TRIGGER sessions_au AFTER UPDATE ON sessions BEGIN
    UPDATE sessions_fts SET id = new.id, title = new.title, 
        content = new.content, content_summary = new.content_summary
    WHERE rowid = new.rowid;
END;

CREATE TRIGGER sessions_ad AFTER DELETE ON sessions BEGIN
    DELETE FROM sessions_fts WHERE rowid = old.rowid;
END;
```

### Advanced FTS5 Queries
```bash
# BM25 ranking
hermes session-search query --text "react state management" --rank bm25

# Highlight matches
hermes session-search query --text "javascript" --highlight --output highlighted-output.md

# Snippets with context
hermes session-search query --text "async await" --snippet-size 100 --output snippets.md

# Custom ranking function
hermes session-search query \
  --text "database optimization" \
  --rank-function "custom_ranking" \
  --params "recency_weight=0.3,content_weight=0.7"
```

## Integration Points

### 1. Hermes Model Switching Integration
```bash
# Find sessions by model
hermes session-search query --text "research" --model "gpt-4o"

# Analyze model performance in sessions
hermes session-search model-performance --model "claude-3-opus" --sort success-rate
```

### 2. Profile Manager Integration
```bash
# Search by profile
hermes session-search query --text "review" --profile "Developer"

# Profile session analytics
hermes session-search profile-analytics --profile "Developer"
```

### 3. Skill Manager Integration
```bash
# Find skill usage history
hermes session-search query --text "hermes-skill-manager"

# Show skill interaction patterns
hermes session-search skill-patterns --top-skills 20
```

## Best Practices

### 1. Efficient Querying
```markdown
## Search Best Practices

### Use Specific Terms
- ✅ "react hooks useEffect" 
- ❌ "javascript" (too broad)

### Combine Filters
```bash
hermes session-search query \
  --text "async" \
  --provider openai \
  --duration-min 5 \
  --start "2026-01-01"
```

### Use Wildcards for Partial Matches
```bash
hermes session-search query --text "reduc*"  # catches "reduce", "reduceByKey", etc.
```

### Avoid Overly Broad Queries
- Too many keywords dilute results
- Use quotes for exact phrases
- Use AND/OR operators to control logic
```

### 2. Session Organization
```yaml
# Recommended session tagging
session_organization:
  # Tags by topic
  tags:
    - technology: "react, vue, svelte, python, nodejs"
    - project: "project-alpha, project-beta"
    - status: "todo, in-progress, completed"
    - priority: "urgent, high, medium, low"
  
  # Title patterns
  title_patterns:
    - "[TYPE] {description} - {model}"
    - "{project}/{topic} - {summary}"
    - "{date} - {task} ({model})"
```

### 3. Performance Optimization
```bash
# Optimize search indexes
hermes session-search optimize

# Clear stale cache
hermes session-search clear-cache

# Rebuild FTS index
hermes session-search rebuild-index
```

## Troubleshooting

### Common Issues

#### Search Returns Too Many Results
```bash
# Add more filters
hermes session-search query --text "react" --provider openai --date 2026-01-01

# Use exact phrase matching
hermes session-search query --text "\"react hooks\""

# Narrow time range
hermes session-search query --text "component" --last-week
```

#### Search Returns Too Few Results
```bash
# Use broader terms
hermes session-search query --text "library"

# Remove restrictive filters
hermes session-search query --text "react" --date "2025-01-01" --end "2026-01-01"

# Check for typos
hermes session-search query --text "reducer"  # not "reducer"
```

#### Slow Query Performance
```bash
# Check database health
hermes session-search db-health

# Optimize query
hermes session-search query --text "react" --limit 50  # Add limit

# Rebuild index if needed
hermes session-search rebuild-index
```

#### FTS5 Index Issues
```bash
# Check FTS5 module
hermes session-search check-fts

# Reinstall FTS5 extension
hermes session-search install-fts

# Reindex from scratch
hermes session-search reindex
```

## CLI Commands Reference

```bash
# Basic searching
hermes session-search query --text "search terms"
hermes session-search recent --limit 20
hermes session-search session --id SESSION_ID

# Advanced filtering
hermes session-search query --text "python" --provider openai --model gpt-4o
hermes session-search query --text "bug" --type coding --duration-min 10
hermes session-search query --text "review" --profile "Developer" --author john@example.com

# Analysis commands
hermes session-search analyze-terms --top 50
hermes session-search cluster --method lda --n-clusters 10
hermes session-search trends --interval day

# Export and reporting
hermes session-search export --format json --output sessions.json
hermes session-search report --type activity --period last-month
hermes session-search generate-wordcloud --output wordcloud.png

# Administration
hermes session-search db-health
hermes session-search optimize
hermes session-search rebuild-index
hermes session-search clear-cache
```

## API Reference

### Programmatic Access (JavaScript)
```javascript
import { SessionSearch } from 'hermes-session-search';

const searcher = new SessionSearch({
  dbPath: '~/.hermes/state.db',
  ftsEnabled: true,
  cacheEnabled: true
});

// Basic search
const results = await searcher.query('react hooks useEffect');

// Advanced query
const advancedResults = await searcher.advancedQuery({
  text: 'database schema migration',
  provider: 'openai',
  model: 'gpt-4o',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  sortBy: 'relevance',
  limit: 50
});

// Get session transcript
const transcript = await searcher.getTranscript('session-12345');

// Analyze session data
const analysis = await searcher.analyze({
  type: 'terms',
  top: 100,
  period: 'last-30-days'
});
```

### Programmatic Access (Python)
```python
from hermes_session_search import SessionSearch

searcher = SessionSearch(
    db_path='~/.hermes/state.db',
    fts_enabled=True
)

# Search sessions
results = searcher.query("react component lifecycle")

# Advanced query with filters
advanced = searcher.advanced_query(
    text="python django",
    provider="anthropic",
    model="claude-3-opus",
    date_range=("2026-01-01", "2026-01-31")
)

# Get session details
session = searcher.get_session("session-12345")
transcript = searcher.get_transcript("session-12345")
```

## Roadmap

### Phase 1 (Current) ✅
- [x] SQLite FTS5 integration
- [x] Basic keyword search
- [x] Metadata filtering
- [x] Date range queries
- [x] Session extraction

### Phase 2 (Q4 2026)
- [ ] Semantic search (embeddings)
- [ ] AI-powered query suggestions
- [ ] Cross-session analysis
- [ ] Export in additional formats

### Phase 3 (2027)
- [ ] Real-time search
- [ ] Search analytics dashboard
- [ ] Query logging and optimization
- [ ] Collaborative search features

### Phase 4 (Future)
- [ ] Cross-database federation search
- [ ] Natural language query understanding
- [ ] Predictive search suggestions
- [ ] Session understanding with LLMs

---

**Hermes Session Search** - Powerful SQLite FTS5 full-text search for Hermes Agent Desktop sessions. Find, analyze, and export conversations with advanced filtering and comprehensive session intelligence.