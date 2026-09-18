---
name: hermes-moa-orchestration
production: true
description: Orchestrate MoA workflows in Hermes Agent Desktop.
tags: [hermes, moa-orchestration, voting-consensus, ensemble, multi-agent, coordination]
category: autonomous-ai-agents
---

# Hermes MoA Orchestration

This skill provides comprehensive Mixture of Agents (MoA) orchestration for Hermes Agent Desktop. It enables coordination of multiple AI agents and models for complex tasks, using advanced voting mechanisms, consensus algorithms, and ensemble methods to produce superior outputs.

## Quick Start

### Basic MoA Workflow
```bash
# Run a simple MoA task
hermes moa run --task "Analyze this code for security issues" --input "./code/"

# Specify agents to use
hermes moa run --task "Draft a technical spec" --agents "gpt-4,claude-3,vicuna" --consensus

# Use voting mechanism
hermes moa run --task "Prioritize these user stories" --agents "gpt-4,claude-3" --voting
```

### Configure MoA Settings
```bash
# Configure default MoA settings
hermes moa configure --default-agents "openrouter/gpt-4o,anthropic/claude-3-opus" --consensus-method "weighted-similarity"

# Set consensus thresholds
hermes moa configure --voting-threshold 0.8 --consensus-required 3

# Configure agent personality
hermes moa configure-agent --name "gpt-4" --personality "precise" --weight 1.2
```

### Analyze Results
```bash
# Show consensus details
hermes moa analyze --task-id task-12345 --show-consensus

# Compare agent outputs
hermes moa analyze --task-id task-12345 --compare-outputs

# Get voting breakdown
hermes moa analyze --task-id task-12345 --voting-breakdown
```

## Core Capabilities

### 1. Agent Orchestration

#### Agent Definitions
| Agent Name | Provider | Model | Strengths | Weight |
|------------|----------|-------|-----------|--------|
| **GPT-4** | OpenAI | gpt-4o | Complex reasoning, coding | 1.0 |
| **Claude-3** | Anthropic | claude-3-opus | Analysis, writing | 1.0 |
| **Gemini** | Google | gemini-pro | Multimodal, search | 0.9 |
| **Llama-3** | Meta | llama-3-70b | Fast, cost-effective | 0.8 |
| **GPT-4-Turbo** | OpenAI | gpt-4-turbo | Speed, recent data | 1.0 |
| **Claude-3.5** | Anthropic | claude-3-5-sonnet | Balanced performance | 1.0 |

#### Agent Registration
```bash
# Register a new agent for MoA
hermes moa register-agent \
  --name "Custom-Agent" \
  --provider "openrouter" \
  --model "custom-model" \
  --temperature 0.7 \
  --personality "analytical" \
  --weight 1.1

# Remove an agent
hermes moa unregister-agent --name "Custom-Agent"

# Update agent configuration
hermes moa update-agent --name "GPT-4" --weight 1.2 --temperature 0.5

# List all registered agents
hermes moa list-agents
```

#### Agent Selection Strategies
```bash
# Select best agents for task
hermes moa select-agents --task "Code review" --auto-select

# Manual agent selection
hermes moa select-agents --task "Analysis" --agents "claude-3,gpt-4,gemini"

# Role-based agent assignment
hermes moa configure-task-types:
  coding: ["gpt-4", "claude-3"]
  writing: ["claude-3", "gpt-4"]
  analysis: ["gpt-4", "claude-3", "gemini"]
  research: ["claude-3", "gpt-4", "gemini"]
  creative: ["gpt-4", "claude-3"]
```

### 2. Consensus Methods

#### Voting Methods
```bash
# Majority voting (simple mode)
hermes moa run --task "Classify this feedback" --voting-method majority

# Weighted voting
hermes moa run --task "Rate this proposal" --voting-method weighted --agent-weights "gpt-4:1.2,claude-3:1.0"

# Borda count
hermes moa run --task "Rank these options" --voting-method borda

# Approval voting
hermes moa run --task "Select best approach" --voting-method approval

# Quadratic voting
hermes moa run --task "Allocate budget" --voting-method quadratic
```

#### Consensus Algorithms
```bash
# Weighted similarity (default)
hermes moa run --task "Synthesize insights" --consensus-method "weighted-similarity" --similarity-threshold 0.85

# Jaccard similarity
hermes moa run --task "Compare approaches" --consensus-method "jaccard" --threshold 0.7

# Cosine similarity with embeddings
hermes moa run --task "Semantic analysis" --consensus-method "cosine" --embedding-provider "openai"

# Kemeny-Young method
hermes moa run --task "Rank preferences" --consensus-method "kemeny-young"

# Copeland's method
hermes moa run --task "Preference aggregation" --consensus-method "copeland"
```

#### Custom Consensus Functions
```bash
# Use custom consensus method
hermes moa run \
  --task "Complex analysis" \
  --consensus-method "custom" \
  --consensus-script "./scripts/my_consensus.py" \
  --consensus-params '{"alpha": 0.5, "beta": 0.3}'

# Hybrid consensus combining multiple methods
hermes moa run \
  --task "Multi-criteria evaluation" \
  --consensus-method "hybrid" \
  --methods "weighted-similarity:0.5,jaccard:0.3,cosine:0.2"
```

### 3. Workflow Management

#### Parallel Agent Execution
```bash
# Run agents in parallel
hermes moa run \
  --task "Brainstorm solutions" \
  --agents "gpt-4,claude-3,gemini" \
  --parallel \
  --mode "independent"

# Run with dependencies
hermes moa run \
  --task "Multi-stage analysis" \
  --agents "gpt-4,claude-3" \
  --workflow "sequential" \
  --steps "analyze,synthesize,finalize"
```

#### Multi-Stage Workflows
```bash
# Two-stage workflow: brainstorm then critique
hermes moa workflow --name "brainstorm-critique"
hermes moa workflow add-stage --workflow "brainstorm-critique" --stage "brainstorm" --agents "gpt-4,claude-3,gemini"
hermes moa workflow add-stage --workflow "brainstorm-critique" --stage "critique" --agents "claude-3,gpt-4"

# Three-stage workflow: research, synthesize, validate
hermes moa workflow --name "research-synth-validate"
hermes moa workflow add-stage --workflow "research-synth-validate" --stage "research" --agents "claude-3,gemini"
hermes moa workflow add-stage --workflow "research-synth-validate" --stage "synthesize" --agents "gpt-4,claude-3"
hermes moa workflow add-stage --workflow "research-synth-validate" --stage "validate" --agents "gpt-4"
```

#### Workflow Templates
| Template | Description | Agents | Stages |
|----------|-------------|--------|--------|
| **brainstorm-critique** | Generate ideas then critique them | 3-4 agents | 2 stages |
| **research-synth-validate** | Research topic, synthesize findings, validate results | 2-3 agents | 3 stages |
| **pro-con-analysis** | Analyze pros and cons from different perspectives | 2-4 agents | 1 stage |
| **multilingual-review** | Review in multiple languages | 3-5 agents | 1 stage |
| **expert-panel** | Simulate expert panel discussion | 4-6 agents | Multi-stage |

### 4. Result Aggregation

#### Combining Agent Outputs
```bash
# Select best output
hermes moa aggregate --method "best-output" --criteria "quality,coherence,relevance"

# Merge outputs
hermes moa aggregate --method "merge" --conflict-resolution "vote"

# Average outputs for numeric values
hermes moa aggregate --method "average" --fields "score,confidence"

# Extract unique ideas
hermes moa aggregate --method "unique-extraction" --similarity-threshold 0.8
```

#### Quality Metrics
```bash
# Evaluate output quality
hermes moa evaluate --task-id task-12345 --metrics "coherence,creativity,relevance"

# Compare agent performance
hermes moa evaluate --compare-agents --task-type "coding" --metric "accuracy"

# Get confidence intervals
hermes moa evaluate --task-id task-12345 --confidence-intervals
```

### 5. MoA Configuration

#### Configuration File
```yaml
# ~/.hermes/moa-config.yaml
moa:
  # Agent configurations
  agents:
    gpt-4:
      provider: openrouter
      model: gpt-4o
      api_key_env: OPENROUTER_API_KEY
      temperature: 0.7
      max_tokens: 4000
      weight: 1.0
      personality: "balanced"
      
    claude-3:
      provider: anthropic
      model: claude-3-5-sonnet-20241022
      api_key_env: ANTHROPIC_API_KEY
      temperature: 0.7
      max_tokens: 4000
      weight: 1.0
      personality: "analytical"
      
    gemini:
      provider: google
      model: gemini-1.5-pro
      api_key_env: GOOGLE_API_KEY
      temperature: 0.7
      max_tokens: 4000
      weight: 0.9
      personality: "creative"
    
    llama-3:
      provider: groq
      model: llama-3-70b-8192
      api_key_env: GROQ_API_KEY
      temperature: 0.7
      max_tokens: 4000
      weight: 0.8
      personality: "fast"
  
  # Consensus settings
  consensus:
    method: "weighted-similarity"
    similarity_threshold: 0.85
    minimum_consensus: 3
    fallback_agent: "gpt-4"  # Used if consensus fails
    tie_breaker: "claude-3"
    
  # Voting settings
  voting:
    method: "weighted"
    required_majority: 0.6
    agent_weights:
      gpt-4: 1.2
      claude-3: 1.2
      gemini: 1.0
      llama-3: 0.8
    
  # Execution settings
  execution:
    parallelism: 3  # Max concurrent agents
    timeout: 300    # Per-agent timeout in seconds
    retry_attempts: 2
    retry_delay: 5
    
  # Output settings
  output:
    combine_method: "weighted-similarity"
    quality_threshold: 0.8
    include_individual_outputs: false
    format: "markdown"
```

#### Dynamic Agent Selection
```bash
# Configure dynamic selection based on task type
hermes moa set-task-agent-mapping \
  --task-type "creative" \
  --agents "gpt-4,claude-3,gemini" \
  --consensus "weighted-similarity" \
  --threshold 0.8

# Configure cost-aware agent selection
hermes moa configure-cost-limits \
  --budget 0.50 \
  --priority "quality" \
  --fallback-to-cheaper true

# Configure performance-based selection
hermes moa configure-performance-based-selection \
  --metric "response-time" \
  --max-latency "10s" \
  --fallback-method "cost-aware"
```

## Integration Points

### 1. Model Switching Integration
```bash
# MoA automatically uses configured models
hermes moa run --task "Analysis" --use-profile-models

# Override with specific models
hermes moa run --task "Coding" --override-models "openrouter/gpt-4o,anthropic/claude-3-opus"

# Use fallback models
hermes moa run --task "Fallback test" --enable-fallback-models
```

### 2. Profile Manager Integration
```bash
# Use profile-specific agent sets
hermes moa configure --profile "Researcher" --agents "claude-3,gemini,gpt-4"

# Profile-based workflow selection
hermes moa workflow --profile "Developer" --workflow "code-review"

# Apply profile settings
hermes moa apply-profile --profile "Analyst"
```

### 3. Session Search Integration
```bash
# Run MoA task and save to session
hermes moa run --task "Document analysis" --save-session "analysis-session"

# Search MoA task results
hermes session-search query --text "moa task" --tag moa

# Analyze MoA task history
hermes session-search moa-analytics --task-type "all" --period "last-30-days"
```

### 4. Skill Manager Integration
```bash
# Load MoA-dependent skills
hermes skill-manager load-all --group moa

# Validate MoA skills
hermes skill-manager validate --group moa

# Configure MoA skills
hermes skill-manager configure --skill hermes-moa-orchestration
```

## Best Practices

### 1. Agent Composition
```markdown
## Optimal Agent Combinations

### For Creative Tasks
- GPT-4: Divergent thinking and idea generation
- Claude-3: Coherence and narrative structure
- Gemini: Multimodal creativity

### For Analytical Tasks
- Claude-3: Deep analysis and synthesis
- GPT-4: Logical reasoning and patterns
- Gemini: Fact-checking and research

### For Technical Tasks
- GPT-4: Code generation and debugging
- Claude-3: Code review and optimization
- Llama-3: Fast iteration and testing

### For Research Tasks
- Claude-3: Comprehensive research
- Gemini: Web search and synthesis
- GPT-4: Logical synthesis
```

### 2. Consensus Strategies
```markdown
## Choosing the Right Consensus Method

### Simple Agreement Tasks
- Use: Majority Voting
- When: Binary choices, classifications
- Agents: 3-5 agents minimum

### Complex Analysis Tasks
- Use: Weighted Similarity
- When: Nuanced analysis, synthesis tasks
- Agents: 3-4 high-quality agents

### Ranking Tasks
- Use: Borda Count or Kemeny-Young
- When: Prioritizing, ranking options
- Agents: 3+ agents with diverse perspectives

### Numeric Evaluation Tasks
- Use: Average/Aggregation
- When: Scoring, rating, quantitative analysis
- Agents: Any with numeric capability
```

### 3. Performance Optimization
```bash
# Monitor MoA performance
hermes moa monitor

# Optimize agent latency
hermes moa optimize --focus latency

# Optimize for cost
hermes moa optimize --focus cost

# Balance performance and cost
hermes moa optimize --balance 0.7  # 70% performance, 30% cost
```

## Troubleshooting

### Common Issues

#### Consensus Failure
```bash
# Diagnose consensus issues
hermes moa diagnose --task-id task-12345

# Common fixes:
# 1. Lower similarity threshold
# 2. Add more agents
# 3. Try different consensus method
# 4. Check agent availability
# 5. Run: hermes moa reconfigure --consensus "jaccard" --threshold 0.7
```

#### Agent Timeout Issues
```bash
# Check agent latency
hermes moa diagnose-latency --agent gpt-4

# Increase timeout
hermes moa configure --timeout 600  # 10 minutes

# Enable parallel execution
hermes moa configure --parallel true --max-parallel 5
```

#### Cost Overruns
```bash
# Monitor costs
hermes moa cost-report --period "today"

# Set cost alerts
hermes moa set-cost-alert --monthly-limit 100

# Enable cost-aware selection
hermes moa configure --cost-aware true --max-cost-per-task 5.00
```

#### Quality Issues
```bash
# Evaluate output quality
hermes moa evaluate-quality --task-id task-12345

# Adjust quality thresholds
hermes moa configure --quality-threshold 0.85

# Add quality-checking agents
hermes moa add-agent --name "Quality-Check" --provider openrouter --model gpt-4o
```

## CLI Commands Reference

```bash
# Task execution
hermes moa run --task "description"
hermes moa run --task "description" --agents "gpt-4,claude-3" --consensus
hermes moa run --task "description" --voting --voting-method majority

# Agent management
hermes moa register-agent --name NAME --provider PROVIDER --model MODEL
hermes moa unregister-agent --name NAME
hermes moa list-agents
hermes moa update-agent --name NAME --weight 1.2

# Workflow management
hermes moa workflow --name "workflow-name"
hermes moa workflow add-stage --workflow NAME --stage STAGE --agents "gpt-4,claude-3"
hermes moa workflow run --name "workflow-name" --task "description"

# Configuration
hermes moa configure --default-agents "gpt-4,claude-3"
hermes moa configure --consensus-method "weighted-similarity"
hermes moa configure --timeout 300 --retry-attempts 2

# Analysis and reporting
hermes moa analyze --task-id ID
hermes moa evaluate --task-id ID --metrics "all"
hermes moa cost-report --period "today"
hermes moa performance-report

# Integration
hermes moa apply-profile --profile "Researcher"
hermes moa enable-fallback-models
hermes moa use-profile-models
```

## API Reference

### JavaScript
```javascript
import { MoAManager } from 'hermes-moa-orchestration';

const moa = new MoAManager({
  configPath: '~/.hermes/moa-config.yaml'
});

// Run MoA task
const result = await moa.run({
  task: 'Analyze this code for security issues',
  agents: ['gpt-4', 'claude-3'],
  consensusMethod: 'weighted-similarity',
  similarityThreshold: 0.85
});

// Create workflow
const workflow = moa.createWorkflow('brainstorm-critique');
workflow.addStage('brainstorm', ['gpt-4', 'claude-3', 'gemini']);
workflow.addStage('critique', ['claude-3', 'gpt-4']);
const wfResult = await workflow.execute('Generate product ideas');

// Analyze results
const analysis = await moa.analyze(result.taskId, {
  metrics: ['coherence', 'quality', 'relevance']
});
```

### Python
```python
from hermes_moa import MoAManager

moa = MoAManager(config_path='~/.hermes/moa-config.yaml')

# Run task with consensus
result = moa.run(
    task="Draft a technical specification",
    agents=["gpt-4", "claude-3"],
    consensus_method="weighted_similarity",
    voting=True
)

# Create multi-stage workflow
workflow = moa.create_workflow("research-synth-validate")
workflow.add_stage("research", ["claude-3", "gemini"])
workflow.add_stage("synthesize", ["gpt-4", "claude-3"])
workflow.add_stage("validate", ["gpt-4"])

result = workflow.execute("Investigate quantum computing applications")

# Evaluate results
analysis = moa.analyze(result.task_id, metrics=["quality", "coherence"])
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Multi-agent orchestration
- [x] Voting and consensus methods
- [x] Parallel execution
- [x] Basic workflows
- [x] Agent configuration

### Phase 2 (Q4 2026)
- [ ] Dynamic agent selection based on task analysis
- [ ] AI-powered workflow optimization
- [ ] Cross-profile MoA coordination
- [ ] Advanced consensus algorithms

### Phase 3 (2027)
- [ ] Self-improving MoA workflows
- [ ] Federated agent orchestration
- [ ] Real-time MoA monitoring dashboard
- [ ] Collaborative MoA sessions

### Phase 4 (Future)
- [ ] Autonomous MoA task decomposition
- [ ] Cross-session knowledge transfer
- [ ] Predictive agent performance modeling
- [ ] Quantum-enhanced consensus algorithms

---

**Hermes MoA Orchestration** - Advanced Mixture of Agents orchestration for Hermes Agent Desktop. Coordinate multiple AI models for superior outputs using voting, consensus, and ensemble methods.