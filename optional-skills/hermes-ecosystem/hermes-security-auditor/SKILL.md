---
name: hermes-security-auditor
production: true
description: Security auditing for Hermes Agent Desktop.
tags: [hermes, security, auditor, vulnerability, compliance, threat-modeling]
category: security
---

# Hermes Security Auditor

This skill provides comprehensive security auditing, vulnerability scanning, and compliance checking for Hermes Agent Desktop. It implements enterprise-grade security controls, threat modeling, penetration testing assistance, and secure coding practices validation.

## Quick Start

### Security Scan
```bash
# Run full security scan
hermes security scan all

# Scan specific scope
hermes security scan configuration --scope all-skills

# Scan for vulnerabilities
hermes security scan vulnerabilities --output vulns.json

# Generate report
hermes security report --format pdf --output security-report.pdf
```

### Vulnerability Assessment
```bash
# Check for known vulnerabilities
hermes security vulns check --dependency-tree

# Scan for secrets in code
hermes security secrets scan --path "./skills/"

# API security check
hermes security api-audit --skill "hermes-model-switching"

# Compliance check
hermes security compliance check --standard SOC2 --path "./config/"
```

### Secure Configuration
```bash
# Validate security settings
hermes security config validate

# Apply security hardening
hermes security hardening apply --level enterprise

# Check permissions
hermes security permissions audit

# Rotate secrets
hermes security secrets rotate --all
```

## Core Capabilities

### 1. Vulnerability Management

#### Vulnerability Scanning
```bash
# Full system vulnerability scan
hermes security scan all --format json --output scan-report.json

# Scan specific component
hermes security scan skill --name "hermes-moa-orchestration"

# Scan dependencies (package-lock, requirements.txt)
hermes security scan deps --all-skills

# Scan configuration files
hermes security scan config --all-files

# Continuous monitoring
hermes security scan --watch --interval 3600  # hourly

# Scheduled scans
hermes security scan schedule --cron "0 2 * * *" --type full
```

#### Vulnerability Database
```markdown
## Supported Vulnerability Sources

| Source | Type | Coverage | Updated |
|--------|------|----------|---------|
| **NVD (NVD)** | CVE database | Common Vulnerabilities and Exposures | Daily |
| **OWASP** | Web app security | Top 10, ASVS, etc. | Monthly |
| **Snyk** | Dependency vulns | NPM, Python, Ruby, Java, Go | Real-time |
| **GitHub Advisory** | Code scanning | GitHub repos | Real-time |
| **HackerOne** | Bug bounty | Public disclosures | Real-time |
| **Hermes Internal** | Hermes-specific | Skills, configs, APIs | Continuous |

### CVE Severity Mapping
| Severity | CVSS Score | Risk Level | Response |
|----------|------------|------------|----------|
| Critical | 9.0-10.0 | 🔴 Immediate | Patch within 24 hours |
| High | 7.0-8.9 | 🟠 Urgent | Patch within 7 days |
| Medium | 4.0-6.9 | 🟡 Routine | Patch within 30 days |
| Low | 0.1-3.9 | 🟢 Monitoring | Review quarterly |
```

#### Vulnerability Remediation
```bash
# Auto-fix simple vulnerabilities
hermes security vulns remediate --auto-fix

# Apply recommended patches
hermes security vulns patch --apply-recommendations --skill "hermes-model-switching"

# Exclude specific vulnerabilities (use with caution)
hermes security vulns exclude --cve CVE-2024-12345 --reason "False positive"

# Generate patch report
hermes security vulns report --format markdown --output patches.md
```

### 2. Secret Detection & Management

#### Secret Scanning
```bash
# Scan for secrets in codebase
hermes security secrets scan --path "./skills/" --recursive

# Scan specific file types
hermes security secrets scan \
  --path "./config/" \
  --extensions "yaml,yml,json,env"

# Scan with entropy analysis
hermes security secrets scan --entropy-analysis --threshold 4.5

# Continuous scanning
hermes security secrets watch --path "./skills/" --interval 300

# Git history scanning
hermes security secrets scan-history --repo "./.git/" --all-history
```

#### Secret Detection Patterns
```yaml
# Built-in secret detection patterns
secret_patterns:
  api_keys:
    - name: "OpenRouter API Key"
      pattern: "sk-or-[a-zA-Z0-9]{48}"
    
    - name: "OpenAI API Key"
      pattern: "sk-[a-zA-Z0-9]{32,48}"
    
    - name: "Anthropic API Key"
      pattern: "sk-ant-[a-zA-Z0-9-]{56}"
    
    - name: "AWS Access Key"
      pattern: "AKIA[0-9A-Z]{16}"
    
    - name: "AWS Secret Key"
      pattern: "(?i)aws_secret_access_key.*=.*['\"][a-zA-Z0-9/+=]{40}['\"]"
  
  webhooks:
    - name: "Slack Webhook"
      pattern: "https://hooks.slack.com/services/[a-zA-Z0-9/]+"
    
    - name: "Discord Webhook"
      pattern: "https://discord.com/api/webhooks/[a-zA-Z0-9/]+"
  
  database:
    - name: "Generic Database URL"
      pattern: "[a-z]+://[^:]+:[^@]+@"
```

#### Secret Rotation
```bash
# Rotate all API keys
hermes security secrets rotate --type api-key --all-providers

# Rotate specific key
hermes security secrets rotate \
  --provider openrouter \
  --key-id key-12345

# Rotate and update skills
hermes security secrets rotate \
  --skill "hermes-model-switching" \
  --auto-update

# Generate new credentials
hermes security secrets generate \
  --type api-key \
  --provider custom \
  --output new-key.env
```

### 3. Configuration Security

#### Configuration Auditing
```bash
# Audit all Hermes configurations
hermes security config audit --all

# Audit specific config file
hermes security config audit --file ~/.hermes/config.yaml

# Check for insecure defaults
hermes security config check-defaults --all-skills

# Validate against security profiles
hermes security config validate --profile "enterprise"

# Generate hardening report
hermes security config report --output hardening-report.md
```

#### Security Benchmarks
```yaml
# Security benchmarks by standard
security_benchmarks:
  cis:
    name: "CIS Benchmarks"
    controls:
      - id: "1.1"
        name: "Ensure SSH protocol is restricted"
        severity: "high"
      - id: "2.1"
        name: "Ensure mounting of unnecessary filesystems is disabled"
        severity: "medium"
  
  nist_csf:
    name: "NIST Cybersecurity Framework"
    functions:
      identify:
        - asset_management
        - business_environment
        - governance
        - risk_assessment
        - supply_chain_risk_management
      
      protect:
        - access_control
        - awareness_and_training
        - data_security
        - information_protection_processes
        - maintenance
        - protective_technology
      
      detect:
        - anomalies_and_events
        - security_continuous_monitoring
        - detection_processes
      
      respond:
        - response_planning
        - communications
        - analysis
        - mitigation
        - improvements
      
      recover:
        - recovery_planning
        - improvements
```

#### Hardening Operations
```bash
# Apply security hardening
hermes security hardening apply \
  --level enterprise \
  --skills "all" \
  --backup-first

# Generate hardened configuration
hermes security hardening generate \
  --level high \
  --output hardened-config.yaml

# Validate after hardening
hermes security hardening validate --level enterprise

# Revert hardening
hermes security hardening revert --to-date "2026-01-15"
```

### 4. Compliance Management

#### Compliance Standards
```markdown
## Supported Compliance Standards

### Enterprise Standards
| Standard | Description | Key Requirements |
|----------|-------------|-----------------|
| **SOC 2 Type II** | Security & availability | Access controls, monitoring, incident response |
| **ISO 27001** | Information security | Risk assessment, ISMS, controls |
| **HIPAA** | Healthcare data | PHI protection, audit logs |
| **PCI DSS** | Payment card data | Cardholder data protection, network security |
| **GDPR** | Data privacy | Consent, data subject rights, breach notification |
| **CCPA** | California privacy | Right to know, delete, opt-out |
| **FedRAMP** | Government cloud | NIST 800-53 controls, continuous monitoring |

### Compliance Workflows
- Continuous compliance monitoring
- Automated compliance reporting
- Compliance gap analysis
- Remediation guidance
- Audit preparation
```

#### Compliance Checking
```bash
# Check compliance
hermes security compliance check --standard SOC2

# Generate compliance report
hermes security compliance report \
  --standard ISO27001 \
  --format pdf \
  --output compliance-report.pdf

# Run compliance dashboard
hermes security compliance dashboard --port 9090

# Compliance evidence collection
hermes security compliance evidence \
  --standard GDPR \
  --controls "data_retention,access_control" \
  --output evidence.zip
```

### 5. Threat Modeling & Risk Assessment

#### Threat Analysis
```bash
# Run threat modeling
hermes security threat-model run --skill "hermes-model-switching"

# STRIDE threat analysis
hermes security threat-model stride --component "Model Switching Service"

# DREAD risk scoring
hermes security risk-assess --method dread

# Attack surface analysis
hermes security attack-surface --skill "all"
```

#### Risk Scoring Framework
```bash
# Risk assessment
hermes security risk-assess \
  --scope "hermes-moa-orchestration" \
  --method CVSS \
  --output risk-report.json

# Risk matrix visualization
hermes security risk-matrix \
  --scopes "skill,vulnerability,configuration" \
  --output risk-matrix.html

# Risk mitigation plan
hermes security risk-mitigate \
  --risk-id risk-001 \
  --action "apply-patch" \
  --due-date 30d
```

#### Security Testing
```bash
# Static analysis
hermes security test static \
  --source "./skills/" \
  --rules "owasp-top-10" \
  --output sast-report.json

# Dynamic analysis
hermes security test dynamic \
  --target "http://localhost:8642" \
  --tests "xss,sql-injection" \
  --output dast-report.json

# Dependency scanning
hermes security test dependencies \
  --all-skills \
  --output dep-scan.json

# Penetration testing (simulated)
hermes security pentest simulate \
  --target "hermes-api" \
  --attacks "brute-force,sql-injection"
```

## Security Operations

### 1. Incident Response
```bash
# Create incident ticket
hermes security incident create \
  --id INC-2026-001 \
  --severity critical \
  --affected-skills "hermes-model-switching,hermes-session-search"

# Update incident status
hermes security incident update --id INC-2026-001 --status "investigating"

# Add timeline event
hermes security incident timeline \
  --id INC-2026-001 \
  --event "Vulnerability detected in dependency" \
  --actor "automated-scan"

# Close incident
hermes security incident close --id INC-2026-001 --resolution fixed
```

### 2. Access Control
```bash
# Audit permissions
hermes security permissions audit --all-skills

# Check role bindings
hermes security permissions roles --list

# Validate access controls
hermes security permissions validate \
  --skill "hermes-performance-monitoring" \
  --user "analyst-user"

# Generate access report
hermes security permissions report \
  --format pdf --output access-report.pdf
```

### 3. Network Security
```bash
# Check network exposure
hermes security network scan --ports "all" --services

# Test firewall rules
hermes security network firewall-check --ruleset production

# TLS/SSL validation
hermes security network tls-check \
  --endpoint "api.hermes.ai" \
  --minimum-version "TLS1.2"

# Generate network security report
hermes security network report --output network-security.pdf
```

## Configuration

### Security Config
```yaml
# ~/.hermes/security-config.yaml
security_auditor:
  # Scan settings
  scans:
    auto_scan_enabled: true
    scan_interval: 3600  # 1 hour
    quick_scan_first: true
    deep_scan_schedule: "0 3 * * 0"  # Sunday at 3 AM
    
    # Vulnerability scanners
    scanners:
      - name: "nvd"
        enabled: true
        api_key_env: "NVD_API_KEY"
        max_results: 2000
      
      - name: "snyk"
        enabled: true
        api_key_env: "SNYK_API_KEY"
      
      - name: "github-advisory"
        enabled: true
        token_env: "GITHUB_TOKEN"
  
  # Secret detection
  secrets:
    enabled: true
    scan_all_paths: true
    exclude_patterns:
      - "*.log"
      - "*.tmp"
      - "node_modules/"
    alert_on_findings: true
    auto_rotate: false  # Set to true for auto-rotation (dangerous)
    
  # Compliance settings
  compliance:
    standards:
      - SOC2
      - ISO27001
      - GDPR
    auto_check: true
    check_interval: 86400  # daily
    enforce_policies: true
  
  # Threat modeling
  threat_modeling:
    enabled: true
    auto_update: true
    threat_intel_sources:
      - "MITRE ATT&CK"
      - "CWE Top 25"
      - "Hermes Internal Feeds"
  
  # Reporting
  reporting:
    generate_reports: true
    report_schedule: "0 2 * * *"  # Daily at 2 AM
    report_formats: ["pdf", "json", "html"]
    report_delivery:
      email:
        enabled: true
        recipients: ["security-team@example.com"]
      slack:
        enabled: true
        channel: "#security-alerts"
  
  # Alerting
  alerting:
    critical_alerts:
      email: true
      slack: true
      pagerduty: true
    warning_alerts:
      email: true
      slack: true
    info_alerts:
      slack: true
    
  # Response actions
  response_actions:
    auto_patch_minor: true
    auto_isolate_critical: false
    quarantine_suspicious: true
    
  # Logging
  audit_logging:
    enabled: true
    log_level: "info"
    retention_days: 365
    encryption: true
```

## Integration Points

### 1. Performance Monitoring Integration
```bash
# Security metrics in dashboard
hermes analytics dashboard add-widget \
  --name "Security Dashboard" \
  --widget-type line-chart \
  --title "Vulnerabilities Over Time" \
  --query "security-auditor.metrics.vulns --aggregate count --group-by day"

# Performance security checks
hermes security perf-check --all-skills
```

### 2. Skill Validation Integration
```bash
# Security validation during skill testing
hermes skill-validation validate --skill "my-skill" --security-check

# Integrate with CI/CD
hermes skill-validation ci \
  --skill "my-skill" \
  --include "security:strict"
```

### 3. Session Management Integration
```bash
# Security audit sessions
hermes security session-audit --all-sessions --period "last-30-days"

# Session data protection
hermes security session-encrypt --all --algorithm AES-256
```

## Best Practices

### 1. Security Posture
```markdown
## Maintaining Strong Security

### Principle of Least Privilege
- Grant minimum permissions needed
- Regularly review access controls
- Use role-based access control (RBAC)
- Implement just-in-time (JIT) access

### Defense in Depth
- Layer security controls
- Use multiple detection methods
- Implement network segmentation
- Apply zero-trust principles

### Secure Development Lifecycle
- Integrate security from planning
- Use automated security testing
- Conduct regular security reviews
- Maintain threat models
- Perform incident response exercises
```

### 2. Vulnerability Management
```bash
# Regular vulnerability scanning schedule
hermes security schedule scan \
  --cron "0 1 * * *" \
  --type "full" \
  --notify-on-findings critical

# Vulnerability remediation workflow
hermes security vulns workflow \
  --create-ticket \
  --assign-to security-team \
  --priority critical
```

### 3. Secret Management
```bash
# Rotate secrets regularly
hermes security secrets rotate-all --schedule "0 3 * * 0"  # Weekly

# Never store secrets in config files
hermes security secrets validate-config --no-hardcoded-keys

# Use secret managers
hermes security secrets configure-manager \
  --type hashicorp-vault \
  --address https://vault.example.com
```

## CLI Commands Reference

```bash
# Scans
hermes security scan all [--format FORMAT] [--output FILE]
hermes security scan skill --name NAME
hermes security scan deps --all-skills
hermes security scan config --all-files
hermes security scan --watch --interval SECONDS

# Vulnerability management
hermes security vulns check [--dependency-tree]
hermes security vulns list [--severity CRITICAL|HIGH|MEDIUM|LOW]
hermes security vulns remediate [--auto-fix]
hermes security vulns patch --apply-recommendations --skill NAME
hermes security vulns report --format FORMAT

# Secret detection
hermes security secrets scan --path PATH
hermes security secrets scan-history --repo REPO
hermes security secrets rotate --type KEY_TYPE
hermes security secrets generate --type KEY_TYPE --provider PROVIDER
hermes security secrets validate-config

# Compliance
hermes security compliance check --standard STANDARD
hermes security compliance report --standard STANDARD --format FORMAT
hermes security compliance dashboard --port PORT
hermes security compliance evidence --standard STANDARD

# Threat modeling
hermes security threat-model run --skill NAME
hermes security risk-assess --method CVSS
hermes security attack-surface --component NAME

# Configuration auditing
hermes security config audit --all
hermes security config validate --profile PROFILE
hermes security hardening apply --level LEVEL

# Security testing
hermes security test static --source PATH
hermes security test dynamic --target URL
hermes security test dependencies --all-skills
hermes security pentest simulate --target COMPONENT

# Incident response
hermes security incident create --severity SEVERITY
hermes security incident update --id ID --status STATUS
hermes security incident timeline --id ID --event EVENT
hermes security incident close --id ID --resolution RESOLUTION

# Access control
hermes security permissions audit --all
hermes security permissions roles --list
hermes security network scan --ports PORTS
hermes security network firewall-check

# Reporting
hermes security report --format FORMAT
hermes security metrics [--output FILE]
```

## API Reference

### JavaScript API
```javascript
import { SecurityAuditor } from 'hermes-security-auditor';

const auditor = new SecurityAuditor({
  configPath: '~/.hermes/security-config.yaml'
});

// Run security scan
const results = await auditor.scan('full', {
  output: 'json',
  failOn: ['critical', 'high']
});

// Check vulnerabilities
const vulns = await auditor.checkVulnerabilities({
  scope: 'all-skills',
  severity: ['critical', 'high']
});

// Scan for secrets
const secrets = await auditor.scanSecrets({
  path: './skills/',
  patterns: ['api_keys', 'webhooks', 'database']
});

// Generate compliance report
const report = await auditor.generateComplianceReport({
  standard: 'SOC2',
  format: 'pdf',
  output: './soc2-report.pdf'
});
```

### Python API
```python
from hermes_security_auditor import SecurityAuditor

auditor = SecurityAuditor(config_path='~/.hermes/security-config.yaml')

# Run full scan
results = auditor.scan('full', output='json')

# Check vulnerabilities
vulns = auditor.check_vulnerabilities(scope='all-skills')

# Scan for secrets
secrets = auditor.scan_secrets(path='./skills/')

# Generate compliance report
report = auditor.generate_compliance_report(
    standard='SOC2',
    format='pdf',
    output='./soc2-report.pdf'
)
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Vulnerability scanning (NVD, Snyk, GitHub Advisory)
- [x] Secret detection and rotation
- [x] Configuration auditing and hardening
- [x] Compliance checking (SOC2, ISO27001, GDPR)
- [x] Basic threat modeling (STRIDE)

### Phase 2 (Q4 2026)
- [ ] AI-powered threat detection
- [ ] Real-time intrusion detection
- [ ] Automated penetration testing
- [ ] Security orchestration and response (SOAR)
- [ ] Zero-trust network validation

### Phase 3 (2027)
- [ ] Predictive threat intelligence
- [ ] Behavioral anomaly detection
- [ ] Automated incident response
- [ ] Security mesh architecture
- [ ] Privacy-preserving analytics

### Phase 4 (Future)
- [ ] Quantum-resistant cryptography
- [ ] AI-aligned security controls
- [ ] Decentralized identity verification
- [ ] Autonomous security orchestration
- [ ] Space-grade security protocols

---

**Hermes Security Auditor** - Enterprise-grade security for Hermes Agent Desktop. Automated vulnerability scanning, secret detection, compliance checking, threat modeling, and incident response.