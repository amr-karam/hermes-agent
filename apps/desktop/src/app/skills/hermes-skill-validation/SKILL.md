---
name: hermes-skill-validation
production: true
description: Validate and test Hermes Agent Desktop skills. Comprehensive testing framework with unit tests, integration tests, linting, type checking, and quality metrics for skill development and maintenance.
---

# Hermes Skill Validation

This skill provides a comprehensive testing and validation framework for Hermes Agent Desktop skills. It includes unit testing, integration testing, linting, type checking, and quality metrics to ensure skills are production-ready and maintainable.

## Quick Start

### Run All Tests
```bash
# Run all tests for a skill
hermes skill-validation test --skill "hermes-model-switching"

# Run with verbose output
hermes skill-validation test --skill "hermes-profile-manager" --verbose

# Stop on first failure
hermes skill-validation test --skill "hermes-session-search" --bail
```

### Validate Skill Structure
```bash
# Validate SKILL.md file
hermes skill-validation validate --skill "hermes-model-switching"

# Check for required fields
hermes skill-validation validate --check required-fields

# Validate YAML syntax
hermes skill-validation validate --check yaml-syntax

# Validate markdown formatting
hermes skill-validation validate --check markdown
```

### Comprehensive Analysis
```bash
# Run full validation suite
hermes skill-validation analyze --skill "hermes-moa-orchestration"

# Get quality score
hermes skill-validation quality-score --skill "hermes-session-management"

# Generate validation report
hermes skill-validation report --style markdown --output validation-report.md

# CI/CD integration
hermes skill-validation ci --skill "hermes-skill-registry" --fail-on-warning false
```

## Core Capabilities

### 1. Testing Framework

#### Unit Tests
```bash
# Run unit tests
hermes skill-validation test-unit --skill "hermes-model-switching"

# Test specific functions
hermes skill-validation test-unit --skill "hermes-profile-manager" --test "createProfile"

# Test with mock data
hermes skill-validation test-unit --skill "hermes-session-search" --mock

# Coverage report
hermes skill-validation test-unit --coverage --output coverage.html
```

#### Integration Tests
```bash
# Run integration tests with real APIs
hermes skill-validation test-integration --skill "hermes-model-switching"

# Test with Hermes API
hermes skill-validation test-integration --api http://localhost:8642

# Test database interactions
hermes skill-validation test-integration --database test.db

# Parallel test execution
hermes skill-validation test-integration --parallel --threads 4
```

#### End-to-End Tests
```bash
# Full workflow tests
hermes skill-validation test-e2e --skill "hermes-profile-manager"

# Test user scenarios
hermes skill-validation test-e2e --scenario "create-profile-workflows"

# Visual regression tests (for UI skills)
hermes skill-validation test-e2e --visual

# Cross-platform tests
hermes skill-validation test-e2e --platform "darwin,linux,win32"
```

#### Test Configuration
```yaml
# test.config.yaml
testing:
  # Test environments
  environments:
    - name: "unit"
      type: "isolated"
      timeout: 30
      parallelism: 1
      
    - name: "integration"
      type: "staging"
      timeout: 120
      parallelism: 4
      api_endpoint: "http://localhost:8642"
      
    - name: "e2e"
      type: "production"
      timeout: 300
      parallelism: 2
      api_endpoint: "https://api.hermes.ai"
  
  # Test coverage targets
  coverage:
    statements: 80
    branches: 75
    functions: 80
    lines: 80
  
  # Fail conditions
  fail_on:
    - critical_errors
    - coverage_below_threshold
    - memory_leaks
    - performance_degradation
  
  # Reporting
  report:
    format: "junit+xml"
    output: "./test-results"
    notify_on_fail: true
```

### 2. Lint and Quality Checks

#### YAML Validation
```bash
# Validate YAML syntax and structure
hermes skill-validation lint-yaml --skill "hermes-model-switching"

# Check frontmatter
hermes skill-validation lint-yaml --check frontmatter

# Validate field types
hermes skill-validation lint-yaml --check types

# Check required fields
hermes skill-validation lint-yaml --check required
```

#### Markdown Linting
```bash
# Check markdown formatting
hermes skill-validation lint-markdown --skill "hermes-profile-manager"

# Check heading hierarchy
hermes skill-validation lint-markdown --check headings

# Check code block syntax
hermes skill-validation lint-markdown --check code-blocks

# Check link validity
hermes skill-validation lint-markdown --check links
```

#### Style and Quality
```bash
# Check coding style
hermes skill-validation lint-code --skill "hermes-session-search"

# Check for security issues
hermes skill-validation lint-security --skill "hermes-moa-orchestration"

# Check for deprecated APIs
hermes skill-validation lint-deprecated --skill "hermes-skill-manager"

# Check documentation quality
hermes skill-validation lint-docs --skill "hermes-session-management"
```

#### Quality Metrics
```bash
# Calculate quality score
hermes skill-validation score --skill "hermes-model-switching"

# Show detailed metrics
hermes skill-validation metrics --skill "hermes-profile-manager"

# Compare quality scores
hermes skill-validation compare-quality --skills "skill1,skill2,skill3"

# Trend analysis
hermes skill-validation quality-trend --skill "hermes-skill-manager" --period last-30-days
```

### 3. Security Validation

#### Static Analysis
```bash
# Security scan
hermes skill-validation scan-security --skill "hermes-model-switching"

# Check for vulnerabilities
hermes skill-validation scan-vulnerabilities --output report.json

# API key exposure check
hermes skill-validation scan-secrets --skill "hermes-profile-manager"

# Dependency vulnerability scan
hermes skill-validation scan-deps --skill "hermes-session-search"
```

#### Security Rules
```markdown
## Security Validation Rules

### Code Security
- ❌ No hardcoded API keys or secrets
- ❌ No command injection vulnerabilities
- ❌ No SQL injection in database queries
- ❌ Proper input validation
- ❌ Secure file handling
- ❌ Safe shell command execution

### Dependency Security
- ✅ Dependencies must not have known vulnerabilities
- ✅ Dependencies must use maintained versions
- ✅ Avoid dependencies with security advisories
- ✅ Pin exact dependency versions
- ✅ Regular dependency audits

### Access Control
- ✅ Validate user permissions
- ✅ Restrict file system access
- ✅ Protect sensitive operations
- ✅ Audit important actions
```

### 4. Performance Testing

#### Load Testing
```bash
# Load test a skill function
hermes skill-validation perf-load --skill "hermes-session-search" --function "query" --users 100 --duration 60

# Stress test model operations
hermes skill-validation perf-stress --skill "hermes-model-switching" --iterations 1000

# Rate limit testing
hermes skill-validation perf-rate-limit --skill "hermes-profile-manager" --requests-per-second 100
```

#### Performance Profiling
```bash
# Profile function performance
hermes skill-validation profile --skill "hermes-model-switching" --function "switchModel"

# Memory profiling
hermes skill-validation profile-memory --skill "hermes-session-search"

# Startup time measurement
hermes skill-validation measure-startup --skill "hermes-skill-manager"

# Generate performance report
hermes skill-validation perf-report --output performance.html
```

#### Benchmark Comparison
```bash
# Benchmark against baseline
hermes skill-validation benchmark --skill "hermes-model-switching" --baseline 1.0.0

# Compare multiple skills
hermes skill-validation benchmark-compare --skills "skill1,skill2,skill3"

# Performance history
hermes skill-validation perf-history --skill "hermes-moa-orchestration" --days 30

# Regression detection
hermes skill-validation perf-regression --report perf-report-2026.json
```

### 5. Compatibility Validation

#### Version Compatibility
```bash
# Check Hermes version compatibility
hermes skill-validation compat-check --skill "hermes-model-switching" --hermes-version 3.0.0

# Check Node.js compatibility
hermes skill-validation compat-check --skill "hermes-profile-manager" --node-version 18

# Check dependency compatibility
hermes skill-validation compat-deps --skill "hermes-session-search"

# Generate compatibility matrix
hermes skill-validation compat-matrix --output compat-matrix.json
```

#### Platform Compatibility
```bash
# Check platform support
hermes skill-validation compat-platform --skill "hermes-model-switching" --platforms "darwin,linux,win32"

# Test on specific platform
hermes skill-validation test-platform --skill "hermes-moa-orchestration" --platform linux

# Emulator testing
hermes skill-validation test-emulator --platform "win32" --skill "hermes-session-management"
```

### 6. Documentation Validation

#### Documentation Completeness
```bash
# Check documentation coverage
hermes skill-validation doc-coverage --skill "hermes-skill-manager"

# Verify example completeness
hermes skill-validation doc-examples --skill "hermes-model-switching"

# Check API documentation
hermes skill-validation doc-api --skill "hermes-profile-manager"

# Generate documentation report
hermes skill-validation doc-report --output docs-report.md
```

## Test File Structure

```bash
skill-directory/
├── SKILL.md
├── tests/
│   ├── unit/
│   │   ├── skill.test.js
│   │   ├── skill.test.ts
│   │   └── mocks/
│   │       └── api-mocks.js
│   ├── integration/
│   │   ├── skill.integration.test.js
│   │   ├── test-helpers.js
│   │   └── fixtures/
│   │       └── test-data.json
│   ├── e2e/
│   │   ├── skill.e2e.test.js
│   │   ├── scenarios/
│   │       ├── happy-path.test.js
│   │       └── edge-cases.test.js
│   └── __mocks__/
│       └── skill-mocks.js
├── jest.config.js
├── vitest.config.ts
├── .mocharc.json
├── cypress.json
├── test.config.yaml
├── package.json
└── README.md
```

## Validation Checklist

```markdown
## Skill Validation Checklist

### Before Production ✅
- [ ] SKILL.md follows naming conventions
- [ ] Required YAML frontmatter fields present
- [ ] Description is specific and includes trigger terms
- [ ] All commands have usage examples
- [ ] Code examples are correct and complete
- [ ] External links are valid
- [ ] No hardcoded secrets or API keys
- [ ] Dependencies are properly declared
- [ ] Skill passes all unit tests (100% critical paths)
- [ ] Skill passes integration tests
- [ ] Security scan passes (no critical/high issues)
- [ ] Performance under threshold
- [ ] Documentation completeness > 85%
- [ ] No deprecated APIs used
- [ ] Version is properly tagged
- [ ] License file present
- [ ] Compatible with target Hermes versions

### Quality Standards
- Code quality: A (Linting passes)
- Test coverage: > 80%
- Security: No critical issues
- Performance: < 2s per operation
- Documentation: Complete and accurate
- UX: Clear and intuitive

### Release Checklist
- [ ] Version bumped appropriately (SemVer)
- [ ] Changelog updated
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Performance regression check
- [ ] Compatibility verified
- [ ] Documentation reviewed
- [ ] Signed for publication
```

## Configuration

### Validation Config
```yaml
# ~/.hermes/skill-validation.yaml
validation:
  enabled: true
  
  # YAML validation
  yaml:
    required_fields: ["name", "description", "production"]
    validate_types: true
    max_description_length: 1024
    min_description_length: 50
    
  # Markdown validation
  markdown:
    check_headings: true
    check_links: true
    check_code_blocks: true
    min_lines: 50
    max_lines: 5000
    
  # Testing
  testing:
    run_tests: true
    fail_on_test_failure: true
    coverage_threshold: 80
    parallel: true
    timeout: 300
    
  # Security
  security:
    scan_secrets: true
    check_vulnerabilities: true
    max_dependency_age: 365  # days
    block_known_vulnerable: true
    
  # Performance
  performance:
    max_load_time: 5000  # ms
    max_execution_time: 30000  # ms
    profile_memory: true
    
  # Quality
  quality:
    min_rating: 4.0
    check_deprecated: true
    verify_examples: true
    validate_integration: true
    
  # CI/CD
  ci_cd:
    fail_on_warning: false
    generate_reports: true
    notify_on_failure: true
    required_status_checks:
      - tests
      - security
      - lint
      - performance
```

## CLI Commands Reference

```bash
# Validation
hermes skill-validation validate --skill NAME
hermes skill-validation lint --skill NAME --check TYPE
hermes skill-validation analyze --skill NAME

# Testing
hermes skill-validation test --skill NAME
hermes skill-validation test-unit --skill NAME
hermes skill-validation test-integration --skill NAME
hermes skill-validation test-e2e --skill NAME --scenario SCENARIO

# Quality checks
hermes skill-validation quality-score --skill NAME
hermes skill-validation metrics --skill NAME
hermes skill-validation score --skill NAME

# Security
hermes skill-validation scan-security --skill NAME
hermes skill-validation scan-vulnerabilities --output FILE
hermes skill-validation scan-secrets --skill NAME

# Performance
hermes skill-validation perf-load --skill NAME --function FUNC --users 100
hermes skill-validation perf-stress --skill NAME --iterations 1000
hermes skill-validation measure-startup --skill NAME
hermes skill-validation perf-report --output FILE

# Compatibility
hermes skill-validation compat-check --skill NAME --hermes-version VERSION
hermes skill-validation compat-platform --skill NAME --platforms "darwin,linux"

# Documentation
hermes skill-validation doc-coverage --skill NAME
hermes skill-validation doc-examples --skill NAME
hermes skill-validation doc-api --skill NAME

# CI/CD
hermes skill-validation ci --skill NAME --fail-on-warning false
hermes skill-validation report --style markdown --output FILE

# Utilities
hermes skill-validation compare-quality --skills "s1,s2,s3"
hermes skill-validation quality-trend --skill NAME --days 30
```

## API Reference

### JavaScript API
```javascript
import { SkillValidator } from 'hermes-skill-validation';

const validator = new SkillValidator({
  configPath: '~/.hermes/skill-validation.yaml',
  hermesUrl: 'http://localhost:8642'
});

// Run full validation
const results = await validator.validate('hermes-model-switching');

// Run specific checks
const yamlValid = await validator.validateYaml('./skills/model-switching');
const testsPass = await validator.runTests('hermes-model-switching', { unit: true, integration: true });
const securityOk = await validator.scanSecurity('hermes-model-switching');

// Get quality score
const score = await validator.qualityScore('hermes-skill-manager');

// Generate report
await validator.generateReport('hermes-skill-registry', {
  format: 'html',
  output: './validation-report.html'
});
```

### Python API
```python
from hermes_skill_validation import SkillValidator

validator = SkillValidator(config_path='~/.hermes/skill-validation.yaml')

# Validate skill
results = validator.validate('hermes-session-search')

# Run tests
test_results = validator.run_tests('hermes-moa-orchestration')

# Security scan
security_report = validator.scan_security('hermes-profile-manager')

# Get metrics
metrics = validator.get_metrics('hermes-skill-manager')
```

## Best Practices

### 1. Test-Driven Development
```markdown
## TDD for Skills

### Write Tests First
1. Define test cases for skill functionality
2. Write unit tests for edge cases
3. Create integration tests with real systems
4. Build the skill to pass tests
5. Add end-to-end scenarios

### Test Coverage
- Aim for 85%+ code coverage
- Critical paths: 100% coverage
- Edge cases: Document and test
- Security paths: Special attention
```

### 2. Security First
```bash
# Always scan for secrets
hermes skill-validation scan-secrets --skill "new-skill"

# Use environment variables for credentials
echo "export API_KEY='your-key'" >> ~/.hermes/env

# Regular security audits
hermes skill-validation security-audit --all-skills
```

### 3. Performance Optimization
```bash
# Profile before optimizing
hermes skill-validation profile --skill "hermes-model-switching"

# Set performance baselines
hermes skill-validation perf-baseline --skill "hermes-profile-manager" --time 1000

# Regression testing
hermes skill-validation perf-regression-check
```

## Troubleshooting

### Common Test Failures

#### Test Timeout
```bash
# Increase timeout for slow tests
hermes skill-validation test --skill "hermes-session-search" --timeout 120
```

#### Memory Leaks
```bash
# Enable memory profiling
hermes skill-validation profile-memory --skill "hermes-profile-manager" --iterations 100
```

#### Integration Test Failures
```bash
# Check dependencies
hermes skill-validation check-deps --skill "hermes-model-switching"

# Reset test environment
hermes skill-validation reset-env --test "integration"
```

#### Security Scan Issues
```bash
# Review security findings
hermes skill-validation scan-security --skill "hermes-moa-orchestration" --verbose

# Fix security issues
hermes skill-validation security-fix --apply
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Unit testing framework
- [x] Integration testing
- [x] YAML/markdown validation
- [x] Security scanning
- [x] Quality metrics

### Phase 2 (Q4 2026)
- [ ] E2E testing capabilities
- [ ] Accessibility testing
- [ ] Visual regression testing
- [ ] Property-based testing
- [ ] Mutation testing

### Phase 3 (2027)
- [ ] AI-powered test generation
- [ ] Automated bug finding
- [ ] Performance benchmarking
- [ ] Security penetration testing
- [ ] Compliance verification

### Phase 4 (Future)
- [ ] Formal verification
- [ ] Symbolic execution
- [ ] Differential testing
- [ ] Intelligent test case generation
- [ ] AI-driven quality assurance

---

**Hermes Skill Validation** - Comprehensive testing and validation framework for Hermes Agent Desktop skills. Ensure production-ready quality with comprehensive testing, security scanning, performance optimization, and quality metrics.