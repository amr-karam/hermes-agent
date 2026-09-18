---
name: hermes-cross-platform-integration
production: true
description: Cross-platform integration for Hermes Agent Desktop skills.
tags: [hermes, cross-platform, integration, CI/CD, cloud-services, IDEs, adapters, APIs]
category: devops
---

# Hermes Cross-Platform Integration

This skill provides comprehensive cross-platform integration capabilities for Hermes Agent Desktop. It enables seamless interoperability with external systems, cloud platforms, CI/CD pipelines, IDEs, and development tools through standardized APIs and adapters.

## Quick Start

### Configure External Integrations
```bash
# List available integrations
hermes cross-platform list

# Configure cloud provider integration
hermes cross-platform configure --provider aws --region us-west-2

# Configure CI/CD integration
hermes cross-platform configure --ci github-actions --repo owner/repo

# Configure IDE integration
hermes cross-platform configure --ide vscode --workspace ./my-project
```

### Execute Cross-Platform Commands
```bash
# Sync skills to cloud
hermes cross-platform sync --target cloud --provider aws

# Deploy to CI/CD
hermes cross-platform deploy --pipeline production --skill hermes-skill-manager

# Share with team
hermes cross-platform share --team my-team --skills "skill1,skill2"

# Export for external use
hermes cross-platform export --format docker --output ./hermes-docker
```

## Core Capabilities

### 1. Cloud Platform Integrations

#### AWS Integration
```bash
# Configure AWS
hermes cross-platform aws configure \
  --region us-west-2 \
  --profile hermes \
  --credentials ~/.aws/credentials

# Deploy skills as Lambda functions
hermes cross-platform aws deploy \
  --skill hermes-model-switching \
  --function-name hermes-model-switcher \
  --memory 512 \
  --timeout 60

# S3 skill storage
hermes cross-platform aws s3 sync \
  --bucket hermes-skills-prod \
  --prefix skills/

# CloudWatch monitoring
hermes cross-platform aws cloudwatch enable \
  --skill hermes-performance-monitoring \
  --namespace Hermes/Skills

# EventBridge integration
hermes cross-platform aws eventbridge \
  --rule skill-execution \
  --targets lambda:hermes-skill-executor
```

#### GCP Integration
```bash
# Configure GCP
hermes cross-platform gcp configure \
  --project hermes-production \
  --region us-central1 \
  --service-account hermes@project.iam.gserviceaccount.com

# Deploy to Cloud Run
hermes cross-platform gcp deploy \
  --skill hermes-session-search \
  --service-name hermes-session-searcher \
  --min-instances 1 \
  --max-instances 100

# Cloud Storage sync
hermes cross-platform gcp storage sync \
  --bucket gs://hermes-skills \
  --folder skills/

# Cloud Functions
hermes cross-platform gcp functions deploy \
  --skill hermes-moa-orchestration \
  --trigger-http \
  --memory 1GiB
```

#### Azure Integration
```bash
# Configure Azure
hermes cross-platform azure configure \
  --subscription-id xxxxxx \
  --resource-group hermes-rg \
  --location eastus

# Deploy to Container Apps
hermes cross-platform azure deploy \
  --skill hermes-profile-manager \
  --container-app hermes-profile \
  --cpu 1.0 \
  --memory 2Gi

# Blob Storage
hermes cross-platform azure storage sync \
  --account hermesstorage \
  --container skills

# Functions
hermes cross-platform azure functions deploy \
  --skill hermes-session-management \
  --function-name hermes-sessions
```

### 2. CI/CD Pipeline Integrations

#### GitHub Actions
```bash
# Configure GitHub Actions
hermes cross-platform github configure \
  --repo owner/repo \
  --token ${GITHUB_TOKEN} \
  --workflows-dir .github/workflows

# Generate workflow for skill testing
hermes cross-platform github generate-workflow \
  --skill hermes-skill-validation \
  --trigger push \
  --branches main,develop

# Deploy workflow
hermes cross-platform github deploy-workflow \
  --skill hermes-model-switching \
  --workflow-name skill-test.yml

# Publish to GitHub Packages
hermes cross-platform github publish \
  --skill hermes-session-search \
  --package-name @owner/hermes-session-search \
  --registry npm.pkg.github.com
```

#### GitLab CI/CD
```bash
# Configure GitLab
hermes cross-platform gitlab configure \
  --project-id 12345 \
  --token ${GITLAB_TOKEN} \
  --ci-config .gitlab-ci.yml

# Generate pipeline
hermes cross-platform gitlab generate-pipeline \
  --skill hermes-profile-manager \
  --stages test,build,deploy

# Trigger pipeline
hermes cross-platform gitlab trigger \
  --skill hermes-skill-manager \
  --branch main \
  --variables "DEPLOY_ENV=production"
```

#### Jenkins
```bash
# Configure Jenkins
hermes cross-platform jenkins configure \
  --url https://jenkins.company.com \
  --user jenkins-user \
  --token ${JENKINS_TOKEN}

# Create job
hermes cross-platform jenkins create-job \
  --skill hermes-moa-orchestration \
  --job-name hermes-moa-test \
  --pipeline-script Jenkinsfile

# Build and deploy
hermes cross-platform jenkins build \
  --job hermes-moa-test \
  --parameters "BRANCH=main,ENV=staging"
```

#### CircleCI
```bash
# Configure CircleCI
hermes cross-platform circleci configure \
  --project owner/project \
  --token ${CIRCLECI_TOKEN}

# Generate config
hermes cross-platform circleci generate-config \
  --skill hermes-skill-registry \
  --config .circleci/config.yml

# Run workflow
hermes cross-platform circleci trigger \
  --skill hermes-session-management \
  --branch main \
  --tag v1.0.0
```

### 3. IDE Integrations

#### VS Code
```bash
# Configure VS Code
hermes cross-platform vscode configure \
  --workspace ./my-project \
  --extension-id hermes.hermes-agent

# Generate extension
hermes cross-platform vscode generate-extension \
  --skill hermes-skill-manager \
  --output ./vscode-extension

# Sync settings
hermes cross-platform vscode sync-settings \
  --profile "Developer" \
  --settings-file .vscode/settings.json

# Register commands
hermes cross-platform vscode register-commands \
  --skill hermes-model-switching \
  --commands "switchModel,listModels"
```

#### Cursor
```bash
# Configure Cursor
hermes cross-platform cursor configure \
  --workspace ./my-project \
  --extension-dir ~/.cursor/extensions

# Generate Cursor extension
hermes cross-platform cursor generate-extension \
  --skill hermes-session-search \
  --name "Hermes Session Search"

# Install extension
hermes cross-platform cursor install-extension \
  --path ./cursor-extension

# Sync configuration
hermes cross-platform cursor sync-config \
  --config ~/.cursor/settings.json
```

#### IntelliJ/PhpStorm/WebStorm
```bash
# Configure IntelliJ
hermes cross-platform intellij configure \
  --ide webstorm \
  --workspace ./my-project

# Generate plugin
hermes cross-platform intellij generate-plugin \
  --skill hermes-profile-manager \
  --output ./intellij-plugin
```

### 4. Container and Deployment

#### Docker
```bash
# Generate Dockerfile
hermes cross-platform docker generate \
  --skill hermes-model-switching \
  --base-image node:20-alpine \
  --output ./Dockerfile

# Build image
hermes cross-platform docker build \
  --skill hermes-session-search \
  --tag hermes/session-search:latest \
  --platform linux/amd64,linux/arm64

# Run container
hermes cross-platform docker run \
  --skill hermes-moa-orchestration \
  --port 8642 \
  --env-file .env.production

# Push to registry
hermes cross-platform docker push \
  --image hermes/session-search:latest \
  --registry docker.io
```

#### Kubernetes
```bash
# Generate K8s manifests
hermes cross-platform k8s generate \
  --skill hermes-skill-manager \
  --namespace hermes-skills \
  --replicas 3

# Deploy to cluster
hermes cross-platform k8s deploy \
  --manifests ./k8s-manifests \
  --cluster production

# Create Helm chart
hermes cross-platform k8s helm \
  --skill hermes-session-management \
  --chart-name hermes-sessions \
  --output ./helm-chart
```

#### Serverless Framework
```bash
# Generate serverless.yml
hermes cross-platform serverless generate \
  --skill hermes-model-switching \
  --provider aws \
  --output ./serverless.yml

# Deploy serverless
hermes cross-platform serverless deploy \
  --config ./serverless.yml \
  --stage production
```

### 5. API and Webhook Integrations

#### REST API
```bash
# Generate API client
hermes cross-platform api generate-client \
  --skill hermes-skill-registry \
  --language typescript \
  --output ./api-client

# Test API endpoints
hermes cross-platform api test \
  --endpoint https://api.hermes.ai \
  --skill hermes-model-switching

# Generate OpenAPI spec
hermes cross-platform api openapi \
  --skill hermes-profile-manager \
  --version 3.0 \
  --output ./openapi.json
```

#### GraphQL
```bash
# Generate GraphQL schema
hermes cross-platform graphql generate-schema \
  --skill hermes-session-search \
  --output ./schema.graphql

# Generate resolvers
hermes cross-platform graphql generate-resolvers \
  --skill hermes-moa-orchestration \
  --language typescript \
  --output ./resolvers
```

#### Webhooks
```bash
# Configure webhooks
hermes cross-platform webhook configure \
  --url https://hooks.company.com/hermes \
  --events "skill.install,skill.update,skill.delete" \
  --secret ${WEBHOOK_SECRET}

# Test webhook delivery
hermes cross-platform webhook test \
  --event skill.install \
  --payload '{"skill": "hermes-new-skill"}'

# Manage subscriptions
hermes cross-platform webhook subscribe \
  --url https://slack.company.com/hooks/hermes \
  --events "all"
```

### 6. Collaboration Platforms

#### Slack
```bash
# Configure Slack
hermes cross-platform slack configure \
  --workspace company.slack.com \
  --token ${SLACK_BOT_TOKEN} \
  --channel #hermes-skills

# Send notifications
hermes cross-platform slack notify \
  --message "New skill deployed: hermes-model-switching v2.0.0" \
  --channel #deployments

# Interactive commands
hermes cross-platform slack command \
  --command /hermes \
  --handler ./handlers/slack-handler.js
```

#### Microsoft Teams
```bash
# Configure Teams
hermes cross-platform teams configure \
  --tenant company.onmicrosoft.com \
  --app-id ${TEAMS_APP_ID} \
  --channel hermes-notifications

# Send adaptive cards
hermes cross-platform teams send-card \
  --skill hermes-skill-manager \
  --card-type deployment-summary
```

#### Discord
```bash
# Configure Discord
hermes cross-platform discord configure \
  --server-id 123456789 \
  --bot-token ${DISCORD_BOT_TOKEN} \
  --channel hermes-bot

# Register slash commands
hermes cross-platform discord commands \
  --skill hermes-session-search \
  --commands "search,analyze,export"
```

### 7. Data and Analytics Platforms

#### Datadog
```bash
# Configure Datadog
hermes cross-platform datadog configure \
  --api-key ${DATADOG_API_KEY} \
  --app-key ${DATADOG_APP_KEY}

# Send metrics
hermes cross-platform datadog metrics \
  --skill hermes-performance-monitoring \
  --metrics "execution_time,memory_usage,error_rate"

# Create dashboard
hermes cross-platform datadog dashboard \
  --skill hermes-model-switching \
  --title "Model Switching Metrics"
```

#### Prometheus/Grafana
```bash
# Configure Prometheus
hermes cross-platform prometheus configure \
  --endpoint http://prometheus:9090 \
  --job-name hermes-skills

# Export metrics
hermes cross-platform prometheus export \
  --skill hermes-session-management \
  --port 9091 \
  --path /metrics

# Generate Grafana dashboard
hermes cross-platform grafana dashboard \
  --skill hermes-skill-manager \
  --output ./grafana-dashboard.json
```

#### ElasticSearch
```bash
# Configure ElasticSearch
hermes cross-platform elastic configure \
  --endpoint https://es.company.com \
  --index hermes-skills \
  --api-key ${ES_API_KEY}

# Index skill data
hermes cross-platform elastic index \
  --skill hermes-skill-registry \
  --bulk-size 1000
```

## Configuration

### Cross-Platform Config
```yaml
# ~/.hermes/cross-platform.yaml
cross_platform:
  # Cloud providers
  clouds:
    aws:
      enabled: true
      default_region: "us-west-2"
      profile: "hermes"
      services:
        - lambda
        - s3
        - cloudwatch
        - eventbridge
        - ecs
    
    gcp:
      enabled: true
      default_project: "hermes-production"
      default_region: "us-central1"
      services:
        - cloudrun
        - cloudfunctions
        - storage
        - pubsub
    
    azure:
      enabled: false
      subscription_id: ""
      resource_group: "hermes-rg"
      location: "eastus"
  
  # CI/CD
  ci_cd:
    github:
      enabled: true
      default_repo: "owner/repo"
      workflows_path: ".github/workflows"
    
    gitlab:
      enabled: true
      project_id: "12345"
      ci_path: ".gitlab-ci.yml"
    
    jenkins:
      enabled: false
      url: "https://jenkins.company.com"
    
    circleci:
      enabled: true
      project: "owner/project"
  
  # IDEs
  ides:
    vscode:
      enabled: true
      extension_path: "~/.vscode/extensions"
      marketplace: true
    
    cursor:
      enabled: true
      config_path: "~/.cursor"
    
    intellij:
      enabled: false
      ide: "webstorm"
  
  # Containers
  containers:
    docker:
      enabled: true
      registry: "docker.io"
      platforms:
        - "linux/amd64"
        - "linux/arm64"
    
    kubernetes:
      enabled: true
      default_namespace: "hermes-skills"
      kubeconfig: "~/.kube/config"
    
    serverless:
      enabled: true
      framework: "serverless"
      provider: "aws"
  
  # APIs
  apis:
    rest:
      enabled: true
      default_base_url: "https://api.hermes.ai"
    
    graphql:
      enabled: true
      endpoint: "https://graphql.hermes.ai"
    
    websocket:
      enabled: false
      endpoint: "wss://ws.hermes.ai"
  
  # Collaboration
  collaboration:
    slack:
      enabled: true
      default_channel: "#hermes"
    
    teams:
      enabled: false
    
    discord:
      enabled: true
      default_channel: "hermes"
  
  # Observability
  observability:
    datadog:
      enabled: true
      namespace: "Hermes"
    
    prometheus:
      enabled: true
      port: 9090
      path: "/metrics"
    
    grafana:
      enabled: true
      datasource: "prometheus"
    
    elasticsearch:
      enabled: false
      index_prefix: "hermes"
```

## Best Practices

### 1. Secure Credential Management
```bash
# Store credentials securely
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export GITHUB_TOKEN="${GITHUB_TOKEN}"

# Use credential helpers
hermes cross-platform credentials store --provider aws --name production
hermes cross-platform credentials store --provider github --token ${GITHUB_TOKEN}
hermes cross-platform credentials store --provider slack --token ${SLACK_TOKEN}

# Rotate credentials
hermes cross-platform credentials rotate --provider aws --schedule monthly
```

### 2. Environment-Specific Configurations
```yaml
# environments.yaml
environments:
  development:
    clouds:
      aws:
        region: "us-west-2"
        profile: "dev"
    ci_cd:
      github:
        repo: "owner/dev-repo"
    
  staging:
    clouds:
      aws:
        region: "us-west-2"
        profile: "staging"
    ci_cd:
      github:
        repo: "owner/staging-repo"
  
  production:
    clouds:
      aws:
        region: "us-east-1"
        profile: "production"
    ci_cd:
      github:
        repo: "owner/production-repo"
```

### 3. Monitoring and Observability
```bash
# Enable observability for all deployments
hermes cross-platform observability enable --all

# Configure alerting
hermes cross-platform alerting configure \
  --channel slack \
  --conditions "error_rate>5%,latency>5s" \
  --cooldown 300

# Health checks
hermes cross-platform health-check --all-deployments
```

### 4. Testing Across Platforms
```bash
# Test in Docker
hermes cross-platform test docker --skill hermes-model-switching

# Test in Kubernetes (kind/minikube)
hermes cross-platform test k8s --skill hermes-session-search

# Test serverless locally
hermes cross-platform test serverless --skill hermes-moa-orchestration

# Multi-platform test matrix
hermes cross-platform test matrix \
  --skills "skill1,skill2" \
  --platforms "docker,k8s,lambda,cloudrun"
```

## CLI Commands Reference

```bash
# Cloud providers
hermes cross-platform aws configure [options]
hermes cross-platform aws deploy --skill NAME [options]
hermes cross-platform aws s3 sync [options]
hermes cross-platform aws cloudwatch enable [options]

hermes cross-platform gcp configure [options]
hermes cross-platform gcp deploy --skill NAME [options]
hermes cross-platform gcp storage sync [options]

hermes cross-platform azure configure [options]
hermes cross-platform azure deploy --skill NAME [options]

# CI/CD
hermes cross-platform github configure [options]
hermes cross-platform github generate-workflow --skill NAME
hermes cross-platform github deploy-workflow --skill NAME
hermes cross-platform github publish --skill NAME

hermes cross-platform gitlab configure [options]
hermes cross-platform gitlab generate-pipeline --skill NAME

hermes cross-platform jenkins configure [options]
hermes cross-platform jenkins create-job --skill NAME

# IDEs
hermes cross-platform vscode configure [options]
hermes cross-platform vscode generate-extension --skill NAME
hermes cross-platform vscode register-commands --skill NAME

hermes cross-platform cursor configure [options]
hermes cross-platform cursor generate-extension --skill NAME

# Containers
hermes cross-platform docker generate --skill NAME
hermes cross-platform docker build --skill NAME
hermes cross-platform docker run --skill NAME

hermes cross-platform k8s generate --skill NAME
hermes cross-platform k8s deploy --manifests PATH
hermes cross-platform k8s helm --skill NAME

# APIs
hermes cross-platform api generate-client --skill NAME
hermes cross-platform api test --endpoint URL
hermes cross-platform api openapi --skill NAME

hermes cross-platform graphql generate-schema --skill NAME
hermes cross-platform graphql generate-resolvers --skill NAME

# Webhooks
hermes cross-platform webhook configure [options]
hermes cross-platform webhook test --event NAME
hermes cross-platform webhook subscribe --url URL

# Collaboration
hermes cross-platform slack configure [options]
hermes cross-platform slack notify --message "text"
hermes cross-platform teams configure [options]
hermes cross-platform discord configure [options]

# Observability
hermes cross-platform datadog configure [options]
hermes cross-platform datadog metrics --skill NAME
hermes cross-platform prometheus configure [options]
hermes cross-platform grafana dashboard --skill NAME

# Testing
hermes cross-platform test docker --skill NAME
hermes cross-platform test k8s --skill NAME
hermes cross-platform test matrix --skills LIST
```

## API Reference

### JavaScript API
```javascript
import { CrossPlatformManager } from 'hermes-cross-platform-integration';

const cp = new CrossPlatformManager({
  configPath: '~/.hermes/cross-platform.yaml'
});

// Deploy to AWS
await cp.aws.deploy({
  skill: 'hermes-model-switching',
  functionName: 'hermes-model-switcher',
  memory: 512,
  timeout: 60
});

// Generate GitHub Actions workflow
await cp.github.generateWorkflow({
  skill: 'hermes-skill-validation',
  triggers: ['push'],
  branches: ['main', 'develop']
});

// Build Docker image
await cp.docker.build({
  skill: 'hermes-session-search',
  tag: 'hermes/session-search:latest',
  platforms: ['linux/amd64', 'linux/arm64']
});

// Deploy to Kubernetes
await cp.k8s.deploy({
  manifests: './k8s-manifests',
  cluster: 'production'
});

// Sync with cloud storage
await cp.aws.s3.sync({
  bucket: 'hermes-skills-prod',
  prefix: 'skills/'
});
```

### Python API
```python
from hermes_cross_platform import CrossPlatformManager

cp = CrossPlatformManager(config_path='~/.hermes/cross-platform.yaml')

# Deploy to cloud
cp.aws.deploy(
    skill='hermes-model-switching',
    function_name='hermes-model-switcher',
    memory=512,
    timeout=60
)

# Generate CI/CD
cp.github.generate_workflow(
    skill='hermes-skill-validation',
    triggers=['push'],
    branches=['main']
)

# Docker build
cp.docker.build(
    skill='hermes-session-search',
    tag='hermes/session-search:latest'
)

# Kubernetes deploy
cp.k8s.deploy(manifests='./k8s-manifests', cluster='production')
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Cloud provider integrations (AWS, GCP, Azure)
- [x] CI/CD pipeline integrations
- [x] IDE integrations (VS Code, Cursor)
- [x] Container deployment (Docker, K8s)
- [x] Basic API integrations

### Phase 2 (Q4 2026)
- [ ] Advanced IDE integrations (IntelliJ, Vim/Neovim)
- [ ] Serverless framework support
- [ ] Enhanced webhook systems
- [ ] Message queue integrations (Kafka, RabbitMQ)
- [ ] Database migration tools

### Phase 3 (2027)
- [ ] Multi-cloud orchestration
- [ ] GitOps workflow automation
- [ ] Service mesh integration
- [ ] Edge computing deployment
- [ ] AI-powered deployment optimization

### Phase 4 (Future)
- [ ] Quantum-ready deployments
- [ ] Blockchain-verified deployments
- [ ] Autonomous infrastructure scaling
- [ ] Cross-platform skill federation
- [ ] Universal skill portability

---

**Hermes Cross-Platform Integration** - Seamless cross-platform deployment and integration for Hermes Agent Desktop skills. Deploy anywhere, integrate with anything, and maintain consistency across all environments.