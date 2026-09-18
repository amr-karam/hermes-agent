---
name: hermes-performance-monitoring
production: true
description: Monitor and optimize performance for Hermes Agent Desktop. Provides real-time metrics collection, system health monitoring, performance analysis, and optimization recommendations for skills, models, and sessions.
---

# Hermes Performance Monitoring

This skill provides comprehensive performance monitoring and optimization for Hermes Agent Desktop. It collects real-time metrics, monitors system health, analyzes performance bottlenecks, and provides actionable optimization recommendations for skills, models, and sessions.

## Quick Start

### Monitor Performance
```bash
# Start monitoring
hermes perf-monitor start

# View current metrics
hermes perf-monitor status

# Get performance dashboard
hermes perf-monitor dashboard --format html --output dashboard.html

# Pause monitoring
hermes perf-monitor stop
```

### Analyze Performance
```bash
# Analyze specific skill performance
hermes perf-monitor analyze --skill "hermes-model-switching"

# Profile session performance
hermes perf-monitor session-profile --session-id session-12345

# Check memory usage
hermes perf-monitor memory --top 10

# CPU usage analysis
hermes perf-monitor cpu --interval 5
```

### Optimize Performance
```bash
# Get optimization recommendations
hermes perf-monitor optimize

# Apply optimizations
hermes perf-monitor apply-optimizations

# Set performance thresholds
hermes perf-monitor set-thresholds \
  --cpu 80 \
  --memory 70 \
  --response-time 5000 \
  --error-rate 5

# Enable auto-optimization
hermes perf-monitor auto-optimize --enabled true
```

## Core Capabilities

### 1. Metrics Collection

#### System Metrics
```bash
# CPU usage
hermes perf-monitor metrics cpu --history 24h

# Memory usage
hermes perf-monitor metrics memory --history 24h

# Disk I/O
hermes perf-monitor metrics disk --io

# Network usage
hermes perf-monitor metrics network --bandwidth

# GPU utilization (if applicable)
hermes perf-monitor metrics gpu --history 1h
```

#### Application Metrics
```bash
# Skill execution metrics
hermes perf-monitor metrics skills --history 7d

# Model response times
hermes perf-monitor metrics models --providers openrouter,anthropic,google

# Session performance
hermes perf-monitor metrics sessions --duration --history 30d

# API response times
hermes perf-monitor metrics api --endpoint /api/model --history 1h
```

#### Custom Metrics
```bash
# Add custom metric
hermes perf-monitor custom-metric \
  --name "prompt_length" \
  --type histogram \
  --unit "tokens"

# Record metric
hermes perf-monitor record-metric \
  --name "prompt_length" \
  --value 1500 \
  --tags "skill:hermes-model-switching,model:gpt-4o"

# Export metrics
hermes perf-monitor export-metrics \
  --format prometheus \
  --output metrics.prom
```

### 2. Health Monitoring

#### System Health
```bash
# Overall health check
hermes perf-monitor health check-all

# Detailed health report
hermes perf-monitor health report --format json --output health-report.json

# Continuous health monitoring
hermes perf-monitor health watch --interval 30

# Health alerts
hermes perf-monitor health alerts --severity critical
```

#### Component Health
```bash
# Skill health
hermes perf-monitor health skills --status unhealthy

# Model provider health
hermes perf-monitor health providers --url openrouter.com --timeout 5

# Session database health
hermes perf-monitor health database --path ~/.hermes/state.db

# Memory health
hermes perf-monitor health memory --threshold 90
```

#### Health Checks
```yaml
# health-checks.yaml
health_checks:
  system:
    cpu:
      check: "top"
      threshold: 80
      interval: 30s
    
    memory:
      check: "free"
      threshold: 75
      interval: 30s
    
    disk:
      check: "df"
      threshold: 90
      interval: 60s
    
    network:
      check: "ping"
      target: "8.8.8.8"
      timeout: 5s
      threshold: 100ms
  
  application:
    hermes_runtime:
      check: "process"
      process: "hermes-agent"
      memory_threshold: 500MB
      cpu_threshold: 80%
    
    skill_server:
      check: "http"
      endpoint: "http://localhost:8642/health"
      timeout: 5s
    
    database:
      check: "sqlite"
      path: "~/.hermes/state.db"
      integrity_check: true
    
    api:
      check: "http"
      endpoint: "https://api.hermes.ai/health"
      timeout: 5s
```

### 3. Performance Profiling

#### CPU Profiling
```bash
# Profile CPU usage
hermes perf-monitor profile cpu --duration 60

# Find hot paths
hermes perf-monitor profile cpu --hotspots

# Flame graph generation
hermes perf-monitor profile cpu --flamegraph --output cpu-flame.svg

# Function-level profiling
hermes perf-monitor profile functions --skill "hermes-model-switching"
```

#### Memory Profiling
```bash
# Memory profile
hermes perf-monitor profile memory --duration 60

# Detect memory leaks
hermes perf-monitor profile memory --detect-leaks

# Heap snapshot
hermes perf-monitor profile memory --heap

# GC analysis
hermes perf-monitor profile gc
```

#### Detailed Profiling
```bash
# Full system profiling
hermes perf-monitor profile full --output profile-2026-01-15

# Profile specific skill
hermes perf-monitor profile skill --skill "hermes-session-search"

# Timeline view
hermes perf-monitor profile timeline --hours 1 --output timeline.html
```

### 4. Alerting System

#### Configure Alerts
```bash
# Add alert rule
hermes perf-monitor alert add \
  --name "high-cpu" \
  --condition "cpu > 80" \
  --severity critical \
  --notification slack \
  --channel "#alerts"

# Add memory alert
hermes perf-monitor alert add \
  --name "memory-warning" \
  --condition "memory > 85" \
  --severity warning \
  --notification email \
  --to "ops@example.com"

# Add response time alert
hermes perf-monitor alert add \
  --name "slow-response" \
  --condition "response_time > 5000" \
  --severity warning \
  --notification pagerduty
```

#### Alert Management
```bash
# List alerts
hermes perf-monitor alert list

# Test alert
hermes perf-monitor alert test --name "high-cpu"

# Silence alert
hermes perf-monitor alert silence --name "maintenance" --for 1h

# Alert history
hermes perf-monitor alert history --days 30
```

#### Notification Channels
```bash
# Slack notifications
hermes perf-monitor notify slack \
  --webhook-url ${SLACK_WEBHOOK} \
  --channel "#performance"

# Email notifications
hermes perf-monitor notify email \
  --smtp-server smtp.example.com \
  --from "perf-alerts@example.com" \
  --to "ops@example.com"

# PagerDuty integration
hermes perf-monitor notify pagerduty \
  --integration-key ${PAGERDUTY_KEY}
```

### 5. Optimization Recommendations

#### Automatic Optimization
```bash
# Enable auto-optimization
hermes perf-monitor auto-optimize enable

# Set optimization rules
hermes perf-monitor auto-optimize set \
  --cpu-threshold 70 \
  --memory-threshold 65 \
  --auto-restart true

# Manual optimization suggestions
hermes perf-monitor optimize --suggest
```

#### Optimization Actions
```bash
# Restart slow skills
hermes perf-monitor optimize action \
  --type restart-slow-skills \
  --threshold 2s \
  --max-restarts 3

# Clear skill cache
hermes perf-monitor optimize action \
  --type clear-cache \
  --age 1h

# Restart memory-intensive processes
hermes perf-monitor optimize action \
  --type restart-heavy-memory \
  --threshold 500MB

# Scale down unused skills
hermes perf-monitor optimize action \
  --type scale-down \
  --idle-time 5m
```

#### Resource Tuning
```bash
# Set skill resource limits
hermes perf-monitor tune \
  --skill "hermes-model-switching" \
  --memory 256MB \
  --cpu 0.5

# Optimize model loading
hermes perf-monitor tune-models \
  --cache-enabled true \
  --preload-frequently-used true

# Database optimization
hermes perf-monitor tune-database \
  --vacuum true \
  --analyze true \
  --journal-mode WAL
```

## Dashboards and Reporting

### Pre-built Dashboards
```bash
# System overview dashboard
hermes perf-monitor dashboard create \
  --name "system-overview" \
  --template system \
  --output dashboards/system.html

# Skill performance dashboard
hermes perf-monitor dashboard create \
  --name "skill-performance" \
  --template skills \
  --output dashboards/skills.html

# Model performance dashboard
hermes perf-monitor dashboard create \
  --name "model-performance" \
  --template models \
  --output dashboards/models.html
```

### Custom Dashboards
```bash
# Create custom dashboard
hermes perf-monitor dashboard custom \
  --name "my-dashboard" \
  --metrics "cpu,memory,network" \
  --layout grid \
  --refresh 5 \
  --output my-dashboard.html

# Dashboard with alerts
hermes perf-monitor dashboard create \
  --name "alerts-visible" \
  --show-alerts \
  --alert-threshold warning \
  --output dashboard-with-alerts.html
```

### Performance Reports
```bash
# Daily performance report
hermes perf-monitor report daily \
  --yesterday \
  --output daily-report-2026-01-15.pdf

# Weekly performance summary
hermes perf-monitor report weekly \
  --output weekly-summary.pdf

# Monthly performance analysis
hermes perf-monitor report monthly \
  --month 2025-12 \
  --analyze-trends \
  --output monthly-report.pdf

# Long-term trend analysis
hermes perf-monitor report trends \
  --period 90d \
  --metrics cpu,memory,response-time \
  --output trends-report.html
```

## Configuration

### Performance Monitor Config
```yaml
# ~/.hermes/performance-monitoring.yaml
performance_monitoring:
  enabled: true
  
  # Collection settings
  collection:
    interval: 5  # seconds
    history_days: 30
    max_metrics_per_day: 86400
    
    # What to monitor
    cpu: true
    memory: true
    disk: true
    network: true
    processes: true
    skills: true
    models: true
    sessions: true
    
  # Alerting
  alerts:
    enabled: true
    default_severity: "warning"
    notification_channels:
      slack:
        enabled: true
        webhook: ${SLACK_WEBHOOK}
      email:
        enabled: true
        smtp_server: "smtp.example.com"
        from: "perf-alerts@example.com"
      pagerduty:
        enabled: false
        integration_key: ${PAGERDUTY_KEY}
    
  # Thresholds
  thresholds:
    cpu:
      warning: 70
      critical: 85
    
    memory:
      warning: 75
      critical: 90
    
    disk:
      warning: 80
      critical: 95
    
    response_time:
      warning: 1000  # ms
      critical: 5000  # ms
    
    error_rate:
      warning: 1  # percent
      critical: 5  # percent
  
  # Optimization
  optimization:
    auto_optimize: true
    optimization_interval: 3600  # 1 hour
    rules:
      - condition: "cpu > 80"
        action: "restart-slow-skill"
        cooldown: 300
      
      - condition: "memory > 85"
        action: "clear-cache"
        cooldown: 60
      
      - condition: "inactive_skills > 10"
        action: "unload-unused-skills"
        cooldown: 1800
  
  # Retention
  retention:
    raw_metrics: 7  # days
    aggregated_metrics: 90  # days
    alerts: 365  # days
    profiles: 365  # days
  
  # Storage
  storage:
    metrics_path: "~/.hermes/metrics"
    max_size: "1GB"
    compression: true
```

## CLI Commands Reference

```bash
# Monitoring control
hermes perf-monitor start                      # Start monitoring
hermes perf-monitor stop                       # Stop monitoring
hermes perf-monitor status                     # Show current status
hermes perf-monitor restart                    # Restart monitoring

# Metrics
hermes perf-monitor metrics cpu                # CPU metrics
hermes perf-monitor metrics memory             # Memory metrics
hermes perf-monitor metrics disk                 # Disk I/O metrics
hermes perf-monitor metrics network              # Network metrics
hermes perf-monitor metrics skills               # Skill metrics
hermes perf-monitor metrics models               # Model metrics
hermes perf-monitor metrics sessions             # Session metrics

# Health checks
hermes perf-monitor health check-all           # Full health check
hermes perf-monitor health report              # Health report
hermes perf-monitor health watch               # Continuous monitoring
hermes perf-monitor health alerts              # Active alerts

# Profiling
hermes perf-monitor profile cpu --duration 60  # CPU profiling
hermes perf-monitor profile memory             # Memory profiling
hermes perf-monitor profile full               # Full profiling
hermes perf-monitor profile timeline           # Timeline view

# Alerts
hermes perf-monitor alert list                 # List alerts
hermes perf-monitor alert add                  # Add alert
hermes perf-monitor alert test                 # Test alert
hermes perf-monitor alert silence              # Silence alert
hermes perf-monitor alert history              # Alert history

# Optimization
hermes perf-monitor optimize                   # Show optimizations
hermes perf-monitor optimize --apply           # Apply optimizations
hermes perf-monitor tune                       # Tune resources
hermes perf-monitor auto-optimize enable       # Enable auto-optimization

# Dashboards
hermes perf-monitor dashboard create --name X  # Create dashboard
hermes perf-monitor dashboard list             # List dashboards
hermes perf-monitor dashboard export           # Export dashboard

# Reports
hermes perf-monitor report daily               # Daily report
hermes perf-monitor report weekly              # Weekly report
hermes perf-monitor report monthly             # Monthly report
hermes perf-monitor report trends              # Trend analysis

# Configuration
hermes perf-monitor config set                 # Set configuration
hermes perf-monitor config get                 # Get configuration
hermes perf-monitor config reset               # Reset to defaults
```

## API Reference

### JavaScript API
```javascript
import { PerformanceMonitor } from 'hermes-performance-monitoring';

const pm = new PerformanceMonitor({
  configPath: '~/.hermes/performance-monitoring.yaml'
});

// Start monitoring
await pm.start({
  interval: 5,
  metrics: ['cpu', 'memory', 'skills', 'models']
});

// Get metrics
const metrics = await pm.getMetrics({
  type: 'cpu',
  period: '1h',
  resolution: '1m'
});

// Check health
const health = await pm.healthCheck();

// Profile a skill
await pm.profileSkill('hermes-model-switching', {
  duration: 60,
  includeMemory: true
});

// Get optimization suggestions
const suggestions = await pm.getOptimizationSuggestions();

// Set alert
await pm.setAlert({
  name: 'high-cpu',
  condition: 'cpu > 80',
  severity: 'critical',
  notification: { type: 'slack', channel: '#alerts' }
});
```

### Python API
```python
from hermes_perf_monitor import PerformanceMonitor

pm = PerformanceMonitor(config_path='~/.hermes/performance-monitoring.yaml')

# Start monitoring
pm.start(interval=5, metrics=['cpu', 'memory', 'skills'])

# Get metrics
metrics = pm.get_metrics(type='cpu', period='1h')

# Health check
health = pm.health_check()

# Profile skill
pm.profile_skill('hermes-model-switching', duration=60)

# Optimization
suggestions = pm.optimize()
pm.apply_optimizations(suggestions)
```

## Best Practices

### 1. Monitoring Strategy
```markdown
## Performance Monitoring Best Practices

### Alerting
- Set appropriate thresholds (not too sensitive)
- Use progressive alerting (warning → critical)
- Implement alert deduplication
- Test all alert channels regularly
- Document alert meanings and actions

### Data Retention
- Raw metrics: 7-14 days
- Aggregated metrics: 90+ days
- Alerts and logs: 365 days
- Performance profiles: 30 days

### Thresholds Setup
```yaml
recommended_thresholds:
  cpu:
    warning: 70%
    critical: 85%
  
  memory:
    warning: 75%
    critical: 90%
  
  disk:
    warning: 80%
    critical: 95%
  
  response_time:
    warning: 1000ms
    critical: 5000ms
  
  error_rate:
    warning: 1%
    critical: 5%
```

### 2. Capacity Planning
```bash
# Monitor trends
hermes perf-monitor report trends --period 30d

# Capacity planning
hermes perf-monitor capacity-plan --predict 90d

# Resource recommendations
hermes perf-monitor recommend-resources --current-load --peak-load
```

### 3. Incident Response
```bash
# Incident playbook
hermes perf-monitor incident-trigger --name "performance-degradation"

# Post-mortem
hermes perf-monitor post-mortem --incident-id INC-2026-01-15 --output report.md
```
```

## Troubleshooting

### Common Issues

#### Monitoring Not Starting
```bash
# Check configuration
hermes perf-monitor config validate

# Check permissions
hermes perf-monitor check-permissions

# View logs
hermes perf-monitor logs --tail 100

# Manual start
hermes perf-monitor start --debug --log-level trace
```

#### High CPU Usage
```bash
# Identify process
hermes perf-monitor profile cpu --hotspots

# Check if monitoring itself is causing load
hermes perf-monitor status --check-overhead

# Reduce collection frequency
hermes perf-monitor config set --key collection.interval --value 10
```

#### Alerts Not Triggering
```bash
# Test alert configuration
hermes perf-monitor alert test --name "high-cpu"

# Check notification channels
hermes perf-monitor notify test --channel slack

# Verify thresholds
hermes perf-monitor config get --key thresholds
```

#### Memory Issues
```bash
# Check memory usage
hermes perf-monitor metrics memory --top 10

# Enable compression
hermes perf-monitor config set --key storage.compression --value true

# Reduce retention
hermes perf-monitor config set --key retention.raw_metrics --value 3
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Real-time metrics collection
- [x] Health monitoring
- [x] CPU/memory profiling
- [x] Basic alerting system
- [x] Pre-built dashboards

### Phase 2 (Q4 2026)
- [ ] Advanced ML-based anomaly detection
- [ ] Predictive performance modeling
- [ ] Automated remediation
- [ ] Integration with APM tools
- [ ] Distributed tracing

### Phase 3 (2027)
- [ ] AI-powered optimization suggestions
- [ ] Performance forecasting
- [ ] Auto-scaling triggers
- [ ] Root cause analysis
- [ ] Performance budget enforcement

### Phase 4 (Future)
- [ ] Quantum performance monitoring
- [ ] Cross-cluster performance analysis
- [ ] AI-generated performance experiments
- [ ] Autonomous performance tuning
- [ ] Performance-as-a-Service integration

---

**Hermes Performance Monitoring** - Comprehensive performance monitoring and optimization for Hermes Agent Desktop. Real-time metrics, health monitoring, profiling, alerting, and AI-powered optimization recommendations.

## Summary

All 5 pending skills have been created:
- **hermes-cross-platform-integration** ✅
- **hermes-performance-monitoring** ✅
- **hermes-skill-registry** ✅ (completed)
- **hermes-skill-validation** ✅ (completed)
- **hermes-model-switching** ✅ (completed)
- **hermes-session-search** ✅ (completed)
- **hermes-skill-manager** ✅ (completed)
- **hermes-profile-manager** ✅ (completed)
- **hermes-moa-orchestration** ✅ (completed)
- **hermes-session-management** ✅ (completed)

All 10 skills are now complete and ready for use in Hermes Agent Desktop!