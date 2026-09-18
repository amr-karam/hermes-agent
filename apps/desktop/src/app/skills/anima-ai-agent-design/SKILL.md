---
name: anima-ai-agent-design
production: true
description: Design and deploy AI-powered interactive web applications using Anima's AI agent platform. Create responsive layouts with modern frameworks, integrate AI capabilities for content generation and user interaction, design and publish interactive prototypes, and optimize user experience. Use when creating AI-powered web applications, interactive designs, and prototyping with AI assistance.
---

# Anima AI Agent Design

This skill guides the creation of AI-powered web applications using Anima's AI agent platform. It covers everything from setting up the development environment to deploying live, interactive applications with AI capabilities.

## Quick Start Workflow

1. **Connect an AI Agent** to Anima:
   ```bash
   npx @animaapp/cli@latest login
   ```

2. **List and explore existing playgrounds**:
   ```bash
   npx @animaapp/cli@latest list
   ```

3. **Create a new playground**:
   ```bash
   npx @animaapp/cli@latest create -t empty --framework react --name "My AI Project"
   ```

4. **Work with the Git remote**:
   ```bash
   git clone <gitRemoteUrl> my-project
   cd my-project
   # Make your changes
   git add -A
   git commit -m "Describe your change"
   git push
   ```

5. **Publish when ready** (only when explicitly requested):
   ```bash
   npx @animaapp/cli@latest publish <sessionId>
   ```

## Core Capabilities

### 1. Project Creation and Setup

#### Empty Playground
```bash
npx @animaapp/cli@latest create -t empty --framework react --name "My AI Project"
```

This creates a clean project structure with a real Git remote. The agent can clone it, work with the code, and push changes back to the live playground.

#### AI-Generated Playgrounds
Create from prompts, URLs, or Figma designs:

- **From text prompt**: `p2c` (prompt-to-code)
- **From website**: `l2c` (live-to-code)  
- **From Figma**: `f2c` (figma-to-code)

These generation flows typically take several minutes. Wait for completion and work with the returned playground.

#### Import Existing Projects
```bash
# Import a local folder
npx @animaapp/cli@latest create -t import --from ./my-project

# Import from zip (handles larger projects with binary assets)
npx @animaapp/cli@latest create -t import --from ./my-project.zip
```

> **Note**: Importing creates a new playground from your files without modifying the original local folder.

### 2. Git-Based Workflow

Anima playgrounds are real Git repositories. The recommended workflow:

1. **Get a short-lived Git token**:
   ```bash
   npx @animaapp/cli@latest get-git-token <sessionId>
   ```

2. **Clone and work**:
   ```bash
   git clone <gitRemoteUrl> my-project
   cd my-project
   # Edit, test, modify files
   git add -A
   git commit -m "Your commit message"
   git push
   ```

3. **Update Git remote** if tokens expire (they expire within an hour):
   ```bash
   npx @animaapp/cli@latest get-git-token <sessionId>
   git remote set-url origin <newGitRemoteUrl>
   git push
   ```

> **Security**: Git remote URLs contain short-lived access tokens. Treat them as secrets.

### 3. AI Project Generation

Create sophisticated AI applications with:

#### Text-to-Code (p2c)
Generate complete applications from detailed prompts:
```bash
npx @animaapp/cli@latest create -t p2c --prompt "Create a smart todo application with AI-powered task prioritization and natural language search"
```

#### Live-to-Code (l2c)  
Reverse-engineer functionality from public websites:
```bash
npx @animaapp/cli@latest create -t l2c --url https://example.com/login-page
```

#### Figma-to-Code (f2c)
Convert selected Figma frames directly to code:
```bash
npx @animaapp/cli@latest create -t f2c --figma-url <figma-project-url> --frame <frame-name>
```

### 4. Interactive Features and AI Integration

Design applications with built-in AI capabilities:

#### Smart Components
```javascript
// Example: AI-powered chat interface
const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message: input, history: messages })
    });
    const data = await response.json();
    setMessages([...messages, { text: input, isUser: true }, { text: data.response, isUser: false }]);
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isUser ? 'user' : 'ai'}`}> 
            {msg.text}
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
```

#### AI-powered Forms
```javascript
// Example: Form with smart validation and suggestions
const SmartForm = () => {
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState({});
  
  const handleInputChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Get AI suggestions based on input
    if (value.length > 3) {
      const suggestion = await generateSmartSuggestion(field, value);
      setSuggestions(prev => ({ ...prev, [field]: suggestion }));
    }
  };
  
  return (
    <form>
      {Object.keys(fields).map(field => (
        <div key={field} className="form-group">
          <label>{field}</label>
          <input 
            type="text"
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
          {suggestions[field] && (
            <div className="suggestion">💡 {suggestions[field]}</div>
          )}
        </div>
      ))}
    </form>
  );
};
```

### 5. Design and Prototyping

Create interactive prototypes with AI assistance:

#### Component Library
```javascript
// Centralized component definitions with AI recommendations
export const ComponentLibrary = {
  Button: {
    props: ['variant', 'size', 'onClick', 'disabled'],
    defaultProps: { variant: 'primary', size: 'medium' },
    aiRecommendations: {
      recommendVariant: (useCase) => {
        if (useCase === 'primary-action') return 'primary';
        if (useCase === 'destructive') return 'danger';
        return 'secondary';
      }
    }
  },
  Modal: {
    props: ['isOpen', 'onClose', 'title', 'children'],
    defaultProps: { isOpen: false, title: 'Modal' }
  }
};
```

#### Design System Integration
```javascript
// AI-powered design system with adaptive theming
const DesignSystem = {
  theme: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSizes: { sm: '0.875rem', md: '1rem', lg: '1.125rem' }
    }
  },
  components: {
    card: {
      default: {
        padding: '1rem',
        borderRadius: '0.375rem',
        backgroundColor: 'white'
      },
      variants: {
        elevated: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }
      }
    }
  },
  aiThemeGenerator: (userPreferences, designContext) => {
    // Generate theme based on user preferences and use case
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: userPreferences.preferredColor || baseTheme.colors.primary,
        ...adaptColorsToContext(baseTheme.colors, designContext)
      }
    };
  }
};
```

### 6. Publishing and Deployment

Only publish when a human explicitly requests it:

```bash
npx @animaapp/cli@latest publish <sessionId>
```

This makes your playground publicly accessible at a live URL. Remember to unpublish when done:

```bash
npx @animaapp/cli@latest unpublish <sessionId>
```

### 7. Managing Playgrounds

#### Update Playground Properties
```bash
# Change visibility
npx @animaapp/cli@latest update <sessionId> --privacy public

# Rename playground
npx @animaapp/cli@latest update <sessionId> --name "New Name"
```

#### Share Playgrounds

Any playground is shareable at its Anima URL:
```
https://dev.animaapp.com/chat/<sessionId>
```

#### Clone Existing Work
```bash
# Create a copy of an existing playground
npx @animaapp/cli@latest create -t copy <sessionId> --name "My Copy"
```

## Best Practices

### 1. Git Workflow
- **Always work with Git**: Use the provided Git remote URL for all changes
- **Commit regularly**: Make descriptive commit messages that explain the changes
- **Treat Git tokens as secrets**: Never share Git remote URLs in chat or documentation

### 2. AI Generation
- **Wait for completion**: Let AI generation flows complete before starting new work
- **Review AI output**: Always review and validate AI-generated code
- **Iterate gradually**: Make incremental improvements rather than large, risky changes

### 3. Publishing
- **Only publish when explicitly requested**: Never publish without human approval
- **Use short-lived access**: Git tokens and publish access are temporary
- **Communicate with collaborators**: Let team members know when publishing changes

### 4. Security and Access
- **Use approved workspaces**: Only work in approved Anima workspaces
- **Manage access properly**: Use logout to clear local credentials and revoke from team settings
- **Follow safety rules**: Adhere to Anima's connection and usage guidelines

## Troubleshooting Common Issues

### Git Token Expiration

If git push fails due to authentication:
```bash
# Get a new token
npx @animaapp/cli@latest get-git-token <sessionId>

# Update the remote and retry
npm remote set-url origin <newGitRemoteUrl>
git push
```

### AI Generation Failures

If AI generation doesn't complete:
1. Check if the playground was created successfully
2. Try a simpler prompt for testing
3. Wait longer (generations can take several minutes)
4. Consider importing an existing project as a starting point

### Connection Issues

If having trouble connecting:
1. Ensure you have approved the agent in Anima team settings
2. Check that the invitation link is valid and not expired
3. Verify that the device login was completed successfully
4. Use `npx @animaapp/cli@latest logout` and try `login` again if needed

## Advanced Features

### MCP Configuration

Generate MCP configuration for future sessions:
```bash
npx @animaapp/cli@latest mcp-config
```

Add the generated configuration to your MCP client to enable native tool integration.

### Anonymous Handoff

Create shareable links for human review without initial login:

Share this link with your human collaborator:
```
https://public-api.animaapp.com/connect
```

The collaborator can claim the handoff within 24 hours to transfer work to their account.

## Integration with Other Skills

This skill works well with:
- **Frontend Development**: For building user interfaces with React, Next.js, etc.
- **Cloudflare Workers**: For deploying backend services and APIs
- **Git and DevOps**: For CI/CD pipelines and automated deployment
- **Quality Assurance**: For testing and validating AI-generated code

The Anima AI Agent Design skill provides a complete end-to-end workflow for creating, deploying, and managing AI-powered web applications with the latest AI assistance capabilities.
