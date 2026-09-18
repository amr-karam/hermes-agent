---
name: hermes-analytics-dashboard
production: true
description: Interactive analytics dashboards for Hermes Agent Desktop.
tags: [hermes, analytics, dashboard, metrics, visualization]
category: productivity
---

# Hermes Analytics Dashboard

This skill provides comprehensive analytics and dashboard capabilities for Hermes Agent Desktop. It enables creation of interactive dashboards for monitoring skill performance, model usage, session analytics, and system metrics with real-time updates and export capabilities.

## Quick Start

### Create Dashboard
```bash
# Create a new dashboard
hermes analytics dashboard create --name "System Overview" --template overview

# Create dashboard from template
hermes analytics dashboard create --name "Model Performance" --template model-metrics

# Create custom dashboard
hermes analytics dashboard create --name "Custom Dash" --widgets "cpu,memory,model-usage,skill-performance"
```

### Add Widgets
```bash
# Add metric widget
hermes analytics dashboard add-widget --dashboard "System Overview" --widget-type metric --title "CPU Usage" --query "cpu.utilization"

# Add chart widget
hermes analytics dashboard add-widget --dashboard "Model Performance" --widget-type line-chart --title "Model Response Times" --query "model.response_time --group-by provider"

# Add table widget
hermes analytics dashboard add-widget --dashboard "Skill Analytics" --widget-type table --title "Skill Performance" --query "skill.metrics --limit 10"
```

### View Dashboard
```bash
# View dashboard in terminal (text)
hermes analytics dashboard view --name "System Overview"

# View dashboard in browser
hermes analytics dashboard serve --name "System Overview" --port 8080

# Export dashboard
hermes analytics dashboard export --name "System Overview" --format html --output dashboard.html
```

## Core Capabilities

### 1. Dashboard Types & Templates

#### Pre-built Dashboard Templates
| Template | Description | Widgets Included |
|----------|-------------|------------------|
| **overview** | System health overview | CPU, Memory, Disk, Network, Active Sessions |
| **model-metrics** | AI model performance | Response time, Tokens used, Error rate, Cost |
| **skill-analytics** | Skill performance | Execution time, Success rate, Load time, Calls |
| **session-analytics** | Session activity | Duration, Message count, Model usage, Peaks |
| **cost-analytics** | Cost analysis | Daily/weekly/monthly costs, Provider breakdown |
| **moa-analytics** | MoA workflow | Consensus rates, Agent utilization, Quality scores |
| **security-analytics** | Security monitoring | Alerts, Failed attempts, Permission changes |
| **custom** | User-defined widgets | Any combination of widgets |

#### Widget Types
| Widget Type | Description | Best For |
|-------------|-------------|----------|
| **metric** | Single value display | Current CPU%, Active sessions |
| **gauge** | Circular progress | Memory usage %, Error rate % |
| **line-chart** | Trends over time | Response time trends, Daily costs |
| **bar-chart** | Comparisons | Model usage by provider, Skill call counts |
| **pie-chart** | Proportions | Cost distribution, Error types |
| **table** | Tabular data | Top skills, Recent sessions, Alert list |
| **heatmap** | Density visualization | Hourly activity, Error patterns |
| **timeline** | Event sequencing | Session events, Workflow steps |
| **status** | Health indicators | Service status, Connection states |
| **log-viewer** | Real-time logs | Skill execution logs, Error traces |

### 2. Data Sources & Queries

#### Built-in Data Sources
```yaml
# Available data sources for widgets
data_sources:
  system:
    - cpu.utilization
    - memory.usage
    - disk.usage
    - network.io
    - process.count
  
  skills:
    - skill.execution_time
    - skill.success_rate
    - skill.load_time
    - skill.call_count
    - skill.memory_usage
  
  models:
    - model.response_time
    - model.tokens_used
    - model.error_rate
    - model.cost_per_1k
    - model.availability
  
  sessions:
    - session.duration
    - session.message_count
    - session.model_usage
    - session.peak_concurrent
    - session.token_consumption
  
  moa:
    - moa.consensus_rate
    - moa.agent_utilization
    - moa.quality_score
    - moa.workflow_duration
  
  alerts:
    - alert.count
    - alert.severity_distribution
    - alert.response_time
    - alert.false_positive_rate
```

#### Query Language
```bash
# Basic metric query
hermes analytics dashboard add-widget \
  --dashboard "Perf" \
  --widget-type metric \
  --title "CPU Usage" \
  --query "cpu.utilization"

# Aggregated query
hermes analytics dashboard add-widget \
  --dashboard "Models" \
  --widget-type bar-chart \
  --title "Model Usage" \
  --query "model.provider --group-by provider --aggregate count"

# Time-series query
hermes analytics dashboard add-widget \
  --dashboard "Trends" \
  --widget-type line-chart \
  --title "Response Time Trend" \
  --query "model.response_time --time-window 1h --interval 1m --aggregate avg"

# Filtered query
hermes analytics dashboard add-widget \
  --dashboard "Skills" \
  --widget-type table \
  --title "Slow Skills" \
  --query "skill.execution_time --filter 'execution_time > 5000' --sort desc --limit 10"

# Comparative query
hermes analytics dashboard add-widget \
  --dashboard "Costs" \
  --widget-type pie-chart \
  --title "Cost by Provider" \
  --query "model.cost --group-by provider --aggregate sum"
```

### 3. Real-Time Updates

#### Update Intervals
```bash
# Set dashboard refresh rate
hermes analytics dashboard configure \
  --name "Live Monitor" \
  --refresh-interval 5  # seconds

# Configure per-widget updates
hermes analytics dashboard configure-widget \
  --dashboard "Live Monitor" \
  --widget "CPU Usage" \
  --update-interval 2

# Pause/resume updates
hermes analytics dashboard pause --name "Live Monitor"
hermes analytics dashboard resume --name "Live Monitor"
```

#### Streaming Data
```bash
# Enable real-time streaming
hermes analytics dashboard stream enable \
  --name "Live Monitor" \
  --websockets true

# View live updates in terminal
hermes analytics dashboard stream-view --name "Live Monitor"

# Export live data stream
hermes analytics dashboard stream-export \
  --name "Live Monitor" \
  --format json \
  --output live-data.json
```

### 4. Dashboard Layout & Design

#### Layout Options
```bash
# Grid layout (default)
hermes analytics dashboard set-layout \
  --name "Overview" \
  --layout grid \
  --columns 2 \
  --rows 3

# Flex layout
hermes analytics dashboard set-layout \
  --name "Flex Dash" \
  --layout flex \
  --direction vertical

# Custom positioning
hermes analytics dashboard set-layout \
  --name "Custom Pos" \
  --layout absolute \
  --positions:
    - widget: "CPU Usage"
      x: 0
      y: 0
      width: 6
      height: 4
    - widget: "Memory Usage"
      x: 6
      y: 0
      width: 6
      height: 4
```

#### Theming
```bash
# Apply theme
hermes analytics dashboard set-theme \
  --name "Professional" \
  --theme dark \
  --primary-color "#007bff" \
  --secondary-color "#6c757d"

# Create custom theme
hermes analytics dashboard theme-create \
  --name "Corporate" \
  --background "#ffffff" \
  --text-color "#333333" \
  --accent-color "#0066cc" \
  --font-family "Arial, sans-serif"
```

### 5. Export & Sharing

#### Export Formats
```bash
# Export as interactive HTML
hermes analytics dashboard export \
  --name "Report" \
  --format html \
  --output dashboard.html \
  --include-data true

# Export as static image
hermes analytics dashboard export \
  --name "Snapshot" \
  --format png \
  --output snapshot.png \
  --width 1920 \
  --height 1080

# Export as PDF report
hermes analytics dashboard export \
  --name "Monthly Report" \
  --format pdf \
  --output report.pdf \
  --include-comments true \
  --page-size A4

# Export data only
hermes analytics dashboard export-data \
  --name "Data Export" \
  --format csv \
  --output data.csv \
  --widgets "all"
```

#### Sharing & Collaboration
```bash
# Share dashboard link
hermes analytics dashboard share \
  --name "Team Dashboard" \
  --expires-in 7d \
  --permission view

# Share with edit permissions
hermes analytics dashboard share \
  --name "Collaborative Dash" \
  --users "alice@example.com,bob@example.com" \
  --permission edit

# Embed in external systems
hermes analytics dashboard embed-code \
  --name "Embedded Dash" \
  --iframe true \
  --responsive true
```

### 6. Alerting Integration

#### Dashboard Alerts
```bash
# Add alert widget
hermes analytics dashboard add-widget \
  --name "Alerts Panel" \
  --widget-type status \
  --title "System Alerts" \
  --query "alerts.active --severity critical,warning"

# Configure alert thresholds
hermes analytics dashboard set-alert-threshold \
  --dashboard "Monitor" \
  --widget "CPU Usage" \
  --warning 80 \
  --critical 90

# Auto-switch to alert view
hermes analytics dashboard configure-auto-switch \
  --name "Main Dashboard" \
  --condition "alert_count > 0" \
  --switch-to "Alerts Dashboard"
```

## Configuration

### Analytics Config
```yaml
# ~/.hermes/analytics-dashboard.yaml
analytics_dashboard:
  # Storage
  storage_path: "~/.hermes/dashboards"
  max_dashboards: 50
  
  # Refresh rates
  default_refresh_interval: 10  # seconds
  min_refresh_interval: 1  # seconds
  max_refresh_interval: 300  # seconds
  
  # Data retention
  data_retention_days: 30
  aggregate_retention_days: 90
  
  # Export limits
  max_export_rows: 100000
  max_chart_points: 10000
  
  # Theming
  default_theme: "professional"
  available_themes:
    - "professional"
    - "dark"
    - "light"
    - "corporate"
    - "high-contrast"
  
  # Real-time
  enable_websockets: true
  websocket_port: 8081
  max_concurrent_streams: 10
  
  # Alerting
  enable_integration: true
  alert_check_interval: 30  # seconds
  
  # Security
  sanitize_inputs: true
  rate_limit_api: true
  max_requests_per_minute: 60
  
  # Performance
  enable_caching: true
  cache_ttl: 300  # 5 minutes
  max_widgets_per_dashboard: 20
```

## Integration Points

### 1. Performance Monitoring Integration
```bash
# Pull metrics from performance monitoring
hermes analytics dashboard add-widget \
  --name "Perf Dash" \
  --widget-type line-chart \
  --title "Skill Performance" \
  --query "perf-monitor.metrics.skill.execution_time --group-by skill --aggregate avg"

# Configure auto-refresh from perf monitor
hermes analytics dashboard configure \
  --name "Perf Monitor" \
  --data-source perf-monitor \
  --refresh-interval 5
```

### 2. Session Search Integration
```bash
# Add session analytics to dashboard
hermes analytics dashboard add-widget \
  --name "Session Insights" \
  --widget-type table \
  --title "Recent Sessions" \
  --query "session-search.query --text \"\" --limit 10 --sort recent"

# Add session trend widget
hermes analytics dashboard add-widget \
  --name "Session Trends" \
  --widget-type area-chart \
  --title "Session Duration Trend" \
  --query "session-search.analytics --metric duration --group-by day --aggregate avg"
```

### 3. Model Switching Integration
```bash
# Model usage dashboard
hermes analytics dashboard add-widget \
  --name "Model Usage" \
  --widget-type pie-chart \
  --title "Model Distribution" \
  --query "model-switching.usage --group-by model --aggregate count"

# Model cost tracking
hermes analytics dashboard add-widget \
  --name "Model Costs" \
  --widget-type bar-chart \
  --title "Daily Model Costs" \
  --query "model-switching.costs --group-by model --aggregate sum --time-window 1d"
```

### 4. Skill Registry Integration
```bash
# Skill adoption dashboard
hermes analytics dashboard add-widget \
  --name "Skill Adoption" \
  --widget-type bar-chart \
  --title "Skill Usage Count" \
  --query "skill-registry.usage --group-by skill --aggregate count --time-window 7d"

# Skill health dashboard
hermes analytics dashboard add-widget \
  --name "Skill Health" \
  --widget-type table \
  --title "Skill Status" \
  --query "skill-registry.health --filter status!=healthy"
```

### 5. MoA Orchestration Integration
```bash
# MoA performance dashboard
hermes analytics dashboard add-widget \
  --name "MoA Performance" \
  --widget-type gauge \
  --title "Consensus Rate" \
  --query "moa-orchestration.metrics.consensus_rate --aggregate avg"

# Agent utilization
hermes analytics dashboard add-widget \
  --name "Agent Utilization" \
  --widget-type bar-chart \
  --title "Agent Usage" \
  --query "moa-orchestration.metrics.agent_utilization --group-by agent --aggregate avg"
```

## Best Practices

### 1. Dashboard Design Principles
```markdown
## Effective Dashboard Design

### Layout Guidelines
- **Rule of Thirds**: Place key metrics in prominent positions
- **Z-Pattern Reading**: Top-left → Top-right → Bottom-left → Bottom-right
- **Whitespace**: Adequate spacing between widgets for readability
- **Consistency**: Uniform widget sizing and styling

### Widget Selection
- **Metrics**: Use for current vital signs (CPU, memory, active connections)
- **Charts**: Use for trends and comparisons over time
- **Tables**: Use for detailed listings and rankings
- **Gauges**: Use for bounded values with clear thresholds (0-100%)
- **Tables**: Use when exact values are needed for decision making

### Color Usage
- **Red**: Critical alerts, errors, problems
- **Yellow**: Warnings, caution, attention needed
- **Green**: Normal operation, success, good performance
- **Blue**: Informational, neutral data
- **Orange**: Medium priority, semi-critical
```

### 2. Performance Optimization
```bash
# Optimize dashboard performance
hermes analytics dashboard optimize \
  --name "Slow Dashboard" \
  --strategies "caching,query-optimization,widget-limit"

# Reduce data volume
hermes analytics dashboard configure \
  --name "Large Data Dash" \
  --data-sampling true \
  --sample-rate 0.1  # 10% sample

# Enable progressive loading
hermes analytics dashboard configure \
  --name "Complex Dash" \
  --progressive-loading true \
  --load-visible-first true
```

### 3. Maintenance & Updates
```bash
# Regular dashboard maintenance
hermes analytics dashboard cleanup \
  --older-than 90d  # Remove old dashboards

# Backup dashboards
hermes analytics dashboard backup \
  --output dashboard-backup-$(date +%Y%m%d).tar.gz

# Version dashboards
hermes analytics dashboard version \
  --name "Important Dash" \
  --version 1.0.0 \
  --comment "Initial production version"

# Dashboard templates
hermes analytics dashboard template-create \
  --name "Enterprise Standard" \
  --description "Standard dashboard for enterprise deployments"
```

## CLI Commands Reference

```bash
# Dashboard management
hermes analytics dashboard create --name NAME [--template TEMPLATE]
hermes analytics dashboard list
hermes analytics dashboard show --name NAME
hermes analytics dashboard delete --name NAME
hermes analytics dashboard clone --source NAME --name NEW_NAME

# Widget management
hermes analytics dashboard add-widget --dashboard NAME --widget-type TYPE [options]
hermes analytics dashboard remove-widget --dashboard NAME --widget WIDGET
hermes analytics dashboard configure-widget --dashboard NAME --widget WIDGET [options]

# Layout & theming
hermes analytics dashboard set-layout --name NAME --layout LAYOUT [options]
hermes analytics dashboard set-theme --name NAME --theme THEME [options]
hermes analytics dashboard theme-create --name NAME [options]

# Data & queries
hermes analytics dashboard list-widgets --dashboard NAME
hermes analytics dashboard test-query --dashboard NAME --widget WIDGET --query QUERY

# Viewing & interaction
hermes analytics dashboard view --name NAME [--format text|json]
hermes analytics dashboard serve --name NAME --port PORT
hermes analytics dashboard stream-view --name NAME
hermes analytics dashboard pause --name NAME
hermes analytics dashboard resume --name NAME

# Export & sharing
hermes analytics dashboard export --name NAME --format FORMAT --output FILE
hermes analytics dashboard export-data --name NAME --format FORMAT --output FILE
hermes analytics dashboard share --name NAME --users EMAILS [--permission PERM]
hermes analytics dashboard embed-code --name NAME [options]

# Alerting integration
hermes analytics dashboard set-alert-threshold --dashboard NAME --widget WIDGET --warning VAL --critical VAL
hermes analytics dashboard configure-auto-switch --name NAME --condition COND --switch-to DASH

# Maintenance
hermes analytics dashboard optimize --name NAME [--strategies LIST]
hermes analytics dashboard backup --output FILE
hermes analytics dashboard restore --input FILE
hermes analytics dashboard cleanup [--older-than DAYS]
```

## API Reference

### JavaScript API
```javascript
import { AnalyticsDashboard } from 'hermes-analytics-dashboard';

const analytics = new AnalyticsDashboard({
  configPath: '~/.hermes/analytics-dashboard.yaml'
});

// Create dashboard
const dashboardId = await analytics.createDashboard({
  name: 'System Overview',
  template: 'overview'
});

// Add widget
await analytics.addWidget({
  dashboardId: dashboardId,
  widgetType: 'metric',
  title: 'CPU Usage',
  query: 'cpu.utilization'
});

// Serve dashboard
await analytics.serveDashboard({
  dashboardId: dashboardId,
  port: 8080
});

// Get data
const data = await analytics.getWidgetData({
  dashboardId: dashboardId,
  widgetId: 'widget-123'
});

// Export dashboard
await analytics.exportDashboard({
  dashboardId: dashboardId,
  format: 'html',
  output: './dashboard.html'
});
```

### Python API
```python
from hermes_analytics_dashboard import AnalyticsDashboard

analytics = AnalyticsDashboard(config_path='~/.hermes/analytics-dashboard.yaml')

# Create dashboard
dashboard_id = analytics.create_dashboard(
    name='System Overview',
    template='overview'
)

# Add widget
analytics.add_widget(
    dashboard_id=dashboard_id,
    widget_type='metric',
    title='CPU Usage',
    query='cpu.utilization'
)

# Serve dashboard
analytics.serve_dashboard(dashboard_id=dashboard_id, port=8080)

# Get data
data = analytics.get_widget_data(dashboard_id=dashboard_id, widget_id='widget-123')

# Export dashboard
analytics.export_dashboard(
    dashboard_id=dashboard_id,
    format='html',
    output='./dashboard.html'
)
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Core dashboard creation and widgets
- [x] Pre-built templates and layouts
- [x] Real-time updates and streaming
- [x] Export capabilities (HTML, PNG, PDF)
- [x] Alerting integration

### Phase 2 (Q4 2026)
- [ ] AI-powered insights and anomaly detection
- [ ] Natural language query interface
- [ ] Collaborative dashboard editing
- [ ] Advanced chart types (sankey, funnel, scatter)
- [ ] Dashboard templates marketplace

### Phase 3 (2027)
- [ ] Predictive analytics and forecasting
- [ ] Automated dashboard generation
- [ ] Cross-dashboard filtering and linking
- [ ] Embedded analytics in other applications
- [ ] Mobile-responsive dashboard layouts

### Phase 4 (Future)
- [ ] Augmented reality dashboard views
- [ ] Voice-controlled dashboard interaction
- [ ] Real-time collaboration with cursor tracking
- [ ] Automated insight generation and recommendations
- [ ] Performance-based dashboard optimization