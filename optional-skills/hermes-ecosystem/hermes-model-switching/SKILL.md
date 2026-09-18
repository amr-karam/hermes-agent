---
name: hermes-model-switching
production: true
description: Manage Hermes Agent Desktop model providers.
tags: [hermes, model-switching, provider-management, OpenRouter, Anthropic, OpenAI, Gemini, Groq]
category: devops
---

# Hermes Model Switching

This skill provides comprehensive model provider management for Hermes Agent Desktop. It integrates with Hermes's `/model` command, manages multiple AI model providers, and provides intelligent model selection and switching capabilities.

## Quick Start

### List Available Models
```bash
# List all available model providers and models
hermes model-switch list

# Output:
# Provider: OpenRouter
#   - GPT-4o (200k context, $0.01/m)
#   - Claude-3-opus (200k context, $0.08/m)
#   - Gemini-pro (1M context, $0.01/m)
#
# Provider: OpenAI
#   - GPT-4o-mini (128k context, $0.001/m)
#   - GPT-4-turbo (128k context, $0.01/m)
#
# Provider: Anthropic
#   - Claude-3-5-sonnet (200k context, $0.03/m)
```

### Switch Models
```bash
# Switch to a specific model
hermes model-switch to --provider openrouter --model gpt-4o

# Switch using model alias
hermes model-switch to --provider anthropic --model claude-3-opus

# Check current model
hermes model-switch status
```

### Configure Model Preferences
```bash
# Set preferred model for specific tasks
hermes model-switch set-task --task vision --provider google --model gemini-pro-vision

# Reset to default model
hermes model-switch reset

# Backup current model configuration
hermes model-switch backup --name "pre-deployment-config"
```

## Core Capabilities

### 1. Provider Management

#### Supported Providers
| Provider | Models Available | Max Context | Pricing Range | Enterprise Features |
|----------|------------------|-------------|----------------|-------------------|
| **OpenRouter** | 200+ models | 200k | $0.001-$0.08/m | Advanced routing, cost optimization |
| **OpenAI** | GPT-4o, GPT-4-turbo, GPT-3.5-turbo | 128k | $0.001-$0.03/m | Azure OpenAI integration |
| **Anthropic** | Claude-3-series | 200k | $0.01-$0.08/m | Constitutional AI, detailed safety |
| **Google Gemini** | Gemini 1.0, Pro, Vision | 1M | $0.01-$0.10/m | Multimodal, multimodal routing |
| **Groq** | Llama 3 series | 128k | $0.0001-$0.001/m | Lightning-fast, low-latency |
| **Hugging Face** | Open-source models | Varies | Free-$0.05/m | Private model deployment |
| **xAI** | Grok-1 | 128k | $0.01-$0.05/m | Real-time web access |
| **Cohere** | Command series | 128k | $0.01-$0.05/m | Enterprise search, embeddings |

#### Provider Operations
```bash
# Add new provider
hermes model-switch add-provider --name custom-provider --base-url https://api.custom.com --api-key ${CUSTOM_API_KEY}

# Remove provider
hermes model-switch remove-provider --name deprecated-provider

# Update provider configuration
hermes model-switch update-provider --name openrouter --default-model gpt-4o --priority 1

# List all providers
hermes model-switch providers --show-details
```

### 2. Model Configuration

#### Per-Task Model Assignment
```bash
# Set model for specific task types
hermes model-switch configure-task --task coding --provider openrouter --model gpt-4o

hermes model-switch configure-task --task writing --provider anthropic --model claude-3-opus

hermes model-switch configure-task --task analysis --provider google --model gemini-pro

hermes model-switch configure-task --task vision --provider openrouter --model gpt-4o-vision

hermes model-switch configure-task --task audio --provider google --model gemini-pro-1.5
```

#### Model Templates
```bash
# Use predefined model templates for common workflows
hermes model-switch use-template --name "creative-writing" --task writing

hermes model-switch use-template --name "code-review" --task coding

hermes model-switch use-template --name "data-analysis" --task analysis

hermes model-switch use-template --name "multimodal" --task vision --provider openrouter
```

#### Model Selection Criteria
```bash
# Smart model selection based on requirements
hermes model-switch recommend --context 100000 --priority speed --cost-limit 0.02

# Example output:
# Recommended: groq/llama-3-70b-instruct
# Reason: Fast (12ms), fits budget ($0.0002), sufficient context (128k)

# Performance-based selection
hermes model-switch recommend --task coding --quality high --speed critical

# Output:
# Recommended: openrouter/gpt-4o
# Reason: Excellent coding performance, good balance of speed/quality
```

### 3. Intelligent Switching

#### Context-Aware Switching
```bash
# Automatically switch models based on conversation context
hermes model-switch enable-context-switching

# Switch based on user request type
hermes model-switch set-context-switcher --conditions:
  - "user requests code" -> code/model
  - "user requests writing" -> writing/model
  - "user requests analysis" -> analysis/model
  - "user requests vision" -> vision/model

# Smart switching examples:
# User: "Help me debug this Python code"
# Action: Automatically switches to openrouter/gpt-4o
# User: "Write a blog post about AI"
# Action: Automatically switches to anthropic/claude-3-opus
```

#### Seamless User Experience
```bash
# Natural model switching during conversation
hermes model-switch set-auto-switch

# Monitor and log all model switches
hermes model-switch log-switching

# Revert last switch
hermes model-switch undo-switch

# See switch history
hermes model-switch history
```

### 4. Enterprise Features

#### Cost Management
```bash
# Set daily cost limits
hermes model-switch set-cost-limit --provider openrouter --daily-limit 10.00

# Monitor daily costs
hermes model-switch cost-report --today

# Get cost alerts
hermes model-switch enable-cost-alerts --threshold 8.00

# Generate cost optimization recommendations
hermes model-switch optimize-costs --provider openrouter
```

#### Access Control
```bash
# Restrict model access by user role
hermes model-switch restrict-access --role junior --models "gpt-3.5,claude-3-haiku"

# Allow only specific providers for enterprise users
hermes model-switch enterprise-access --providers "openrouter,anthropic,google"

# Audit model access logs
hermes model-switch audit-access --user-id jsmith@example.com --date-range "2026-01-01..2026-01-31"
```

#### SLA Monitoring
```bash
# Monitor model provider SLAs
hermes model-switch monitor-sla --provider openrouter --warning-threshold 5 --critical-threshold 10

# Automatic failover to backup providers
hermes model-switch set-failover --primary openrouter --backup google --auto-failover true

# Generate SLA reports
hermes model-switch sla-report --provider openrouter --format pdf --output openai-sla.pdf
```

### 5. Configuration Management

#### Model Settings File
```yaml
# ~/.hermes/model-config.yaml
models:
  default:
    provider: openrouter
    model: gpt-4o
    context: 200000
  
  tasks:
    coding:
      provider: openrouter
      model: gpt-4o
      temperature: 0.1
      max_tokens: 4000
    writing:
      provider: anthropic
      model: claude-3-opus
      temperature: 0.7
      max_tokens: 8000
    analysis:
      provider: google
      model: gemini-pro
      temperature: 0.3
      max_tokens: 2000
    vision:
      provider: openrouter
      model: gpt-4o-vision
      temperature: 0.1
      max_tokens: 1000
    
  providers:
    openrouter:
      base_url: "https://openrouter.ai/api/v1"
      api_key_env: "OPENROUTER_API_KEY"
      default_model: "gpt-4o"
      cost_per_1k_tokens: 0.01
      max_context: 200000
      rate_limit: 100
    anthropic:
      base_url: "https://api.anthropic.com"
      api_key_env: "ANTHROPIC_API_KEY"
      default_model: "claude-3-opus"
      cost_per_1k_tokens: 0.08
      max_context: 200000
      rate_limit: 100
    google:
      base_url: "https://generativelanguage.googleapis.com/v1beta"
      api_key_env: "GOOGLE_API_KEY"
      default_model: "gemini-pro"
      cost_per_1k_tokens: 0.01
      max_context: 1000000
      rate_limit: 100
    
  monitoring:
    cost_alerts: true
    cost_limit: 50.00
    auto_failover: true
    log_switches: true
    performance_tracking: true
```

#### Environment Configuration
```bash
# Set environment variables for different environments
export HERMES_MODEL_PROVIDER="openrouter"
export HERMES_MODEL_NAME="gpt-4o"
export HERMES_MODEL_TEMPERATURE="0.1"
export HERMES_MODEL_MAX_TOKENS="4000"
export HERMES_MODEL_API_KEY="${OPENROUTER_API_KEY}"

# Environment-specific configurations
hermes model-switch set-env --env production --provider openrouter --model gpt-4o --cost-limit 100
hermes model-switch set-env --env staging --provider google --model gemini-pro --cost-limit 10
hermes model-switch set-env --env development --provider anthropic --model claude-3-haiku --cost-limit 1
```

### 6. API Integration

#### Hermes Integration
```bash
# Integrate with Hermes's /model command
hermes model-switch connect-to-hermes

# Use Hermes's API endpoints
hermes model-switch api --get "http://localhost:8642/api/model/options"
hermes model-switch api --post "http://localhost:8642/api/model/set" --data '{"scope": "main", "task": "coding", "provider": "openrouter", "model": "gpt-4o"}'

# Sync model configurations with Hermes
hermes model-switch sync-with-hermes --overwrite-local
```

#### External Service Integration
```bash
# Integrate with OpenRouter API
hermes model-switch integrate --provider openrouter --api-version v1 --auth-type bearer

# Integrate with Anthropic API
hermes model-switch integrate --provider anthropic --api-version v1 --auth-type bearer

# Integrate with Google API
hermes model-switch integrate --provider google --api-version v1beta --auth-type api-key

# Integrate with custom provider
hermes model-switch integrate --provider custom --api-version v2 --auth-type oauth --base-url https://api.custom.com
```

## Best Practices

### 1. Model Selection Guidelines
```markdown
## Choosing the Right Model

### Performance Considerations
- **Speed**: Groq (Llama 3) for lightning-fast responses
- **Quality**: OpenRouter/GPT-4o, Anthropic Claude-3 for best results
- **Cost**: Groq (Llama 3) for budget-conscious applications
- **Context**: Google Gemini for large context windows (1M tokens)
- **Specialties**: 
  - Coding: GPT-4o, Claude-3-opus
  - Writing: Claude-3-opus, GPT-4o
  - Analysis: Gemini-pro, Claude-3-sonnet
  - Vision: GPT-4o-vision, Gemini-pro-vision
  - Audio: Gemini-pro-1.5
```

### 2. Configuration Best Practices
```yaml
# Recommended configuration for Hermes
models:
  default: "openrouter/gpt-4o"
  
tasks:
  coding:
    model: "openrouter/gpt-4o"
    temperature: 0.1  # Lower temp for consistent code
    max_tokens: 8000  # Ample room for complex code
  
  writing:
    model: "anthropic/claude-3-opus"
    temperature: 0.7  # Higher temp for creativity
    max_tokens: 8000  # Long-form content
  
  analysis:
    model: "google/gemini-pro"
    temperature: 0.3  # Balanced for accuracy
    max_tokens: 4000  # Sufficient for analysis
```

### 3. Cost Optimization
```bash
# Use appropriate models for task types to optimize costs
hermes model-switch cost-optimize

# Examples:
# - For simple tasks: Use groq/llama-3-fast
# - For writing: Use anthropic/claude-3-haiku
# - For complex reasoning: Use openrouter/gpt-4o
# - For vision: Use openrouter/gpt-4o-vision
```

### 4. Security Best Practices
- Store API keys in environment variables
- Use HTTPS for all provider communications
- Implement rate limiting and quotas
- Monitor for unusual API usage patterns
- Regular rotation of API keys and credentials

## Troubleshooting

### Common Issues

#### Model Not Available
```bash
# Check provider status and available models
hermes model-switch diagnose --provider openrouter --model gpt-4o

# Common fixes:
# 1. Check API key and provider configuration
# 2. Verify model name spelling
# 3. Check provider service status
# 4. Verify rate limits and quotas
# 5. Run: hermes model-switch list --provider openrouter
```

#### Slow Model Switching
```bash
# Diagnose switching performance
hermes model-switch performance-test --provider openrouter --model gpt-4o

# Optimization steps:
# 1. Check provider response times
# 2. Verify local cache
# 3. Check for network bottlenecks
# 4. Run: hermes model-switch enable-caching
```

#### API Key Issues
```bash
# Validate API keys
hermes model-switch validate-api-key --provider openrouter

# Troubleshooting:
# 1. Check environment variable settings
# 2. Verify key permissions and scopes
# 3. Check key expiration
# 4. Run: hermes model-switch test-api --provider openrouter
```

#### Model Configuration Errors
```bash
# Check configuration validity
hermes model-switch validate-config

# Fix based on errors:
# 1. Check YAML syntax
# 2. Verify provider names
# 3. Check model names
# 4. Verify required fields
# 5. Run: hermes model-switch fix-config
```

## API Reference

### Programmatic Access
```javascript
// Model switching in JavaScript
import { ModelSwitcher } from 'hermes-model-switching';

const switcher = new ModelSwitcher({
  hermesUrl: 'http://localhost:8642',
  configPath: '~/.hermes/model-config.yaml',
  defaultProvider: 'openrouter',
  defaultModel: 'gpt-4o'
});

// List all providers and models
const providers = await switcher.listProviders();

// Switch model
await switcher.switchModel({
  provider: 'openrouter',
  model: 'gpt-4o',
  task: 'coding'
});

// Get current model
const current = await switcher.getCurrentModel();

// Set model for specific task
await switcher.setTaskModel('writing', 'anthropic', 'claude-3-opus');

// Get model recommendations
const recommendations = await switcher.getRecommendations({
  context: 100000,
  priority: 'speed',
  costLimit: 0.02
});
```

### CLI Commands Reference
```bash
# Model listing and discovery
hermes model-switch list                    # List all providers and models
hermes model-switch providers              # Show only provider names
hermes model-switch models --provider NAME  # Show models for specific provider

# Model switching
hermes model-switch to --provider PROVIDER --model MODEL  # Switch model
hermes model-switch to --provider PROVIDER --model MODEL --task TASK  # Set for task
hermes model-switch status                               # Show current model

# Task configuration
hermes model-switch set-task --task TASK --provider PROVIDER --model MODEL
hermes model-switch tasks                                # Show all task configurations

# Provider management
hermes model-switch add-provider --name NAME --config CONFIG
hermes model-switch remove-provider --name NAME
hermes model-switch providers --show-details

# Configuration
hermes model-switch configure --file ~/.hermes/model-config.yaml
hermes model-switch backup --name NAME
hermes model-switch restore --name NAME

# Monitoring and diagnostics
hermes model-switch monitor                               # Monitor performance
hermes model-switch cost-report --today                  # Show cost report
hermes model-switch validate-config                      # Validate configuration
hermes model-switch test-api --provider NAME             # Test API connectivity

# Recommendations and optimization
hermes model-switch recommend --context 100000 --priority speed --cost-limit 0.02
hermes model-switch optimize-costs --provider NAME      # Get cost optimization tips
hermes model-switch recommend --task coding --quality high --speed critical
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Model provider discovery and listing
- [x] Basic model switching
- [x] Provider configuration
- [x] Task-based model assignment
- [x] Integration with Hermes's /model command

### Phase 2 (Q4 2026)
- [ ] Intelligent model selection
- [ ] Context-aware model switching
- [ ] Cost optimization
- [ ] Performance monitoring
- [ ] Enterprise access control

### Phase 3 (2027)
- [ ] AI-powered model recommendations
- [ ] Multi-provider failover
- [ ] Model performance analytics
- [ ] Automated model tuning
- [ ] Enterprise SLA management

### Phase 4 (Future)
- [ ] Federated model learning
- [ ] Model evolution and auto-updates
- [ ] Community model sharing
- [ ] Advanced model governance
- [ ] Quantum-compatible models

---

**Hermes Model Switching** - Enterprise-grade model provider management for Hermes Agent Desktop. Intelligent, secure, and cost-optimized model switching across all major AI providers.