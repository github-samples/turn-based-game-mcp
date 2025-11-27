---
applyTo: "**/*.agent.md"
description: Guidelines for creating GitHub Copilot custom agents
---

# Creating GitHub Copilot Custom Agents

Follow these guidelines when creating custom agent files (formerly known as chat modes).

## Purpose

Custom agents configure AI behavior for specialized development tasks. Each agent defines a persona with specific tools, instructions, and workflow transitions. Use agents to create focused experiences like planners, reviewers, or implementation specialists.

## File Location and Naming

### Workspace Agents
- Location: `.github/agents/` folder
- Available to all workspace users
- Shared via version control

### Naming Convention
- Use `.agent.md` extension
- Filename becomes default agent name
- Allowed characters: `.`, `-`, `_`, `a-z`, `A-Z`, `0-9`

```
.github/agents/
├── plan.agent.md
├── security-review.agent.md
└── test-specialist.agent.md
```

## File Structure

Agent files have two parts: YAML frontmatter and Markdown body.

```markdown
---
name: Agent Name
description: Brief description shown in chat input
tools: ['tool1', 'tool2']
---

# Agent Instructions

Your prompt and behavioral instructions go here.
```

## YAML Frontmatter Properties

### Required Properties

| Property | Description |
|----------|-------------|
| `description` | Brief explanation shown as placeholder text in chat input |

### Optional Properties

| Property | Description |
|----------|-------------|
| `name` | Display name (defaults to filename without extension) |
| `argument-hint` | Hint text guiding users on how to interact |
| `tools` | List of available tools (omit to enable all tools) |
| `model` | AI model to use (e.g., `Claude Sonnet 4`) |
| `target` | Environment: `vscode` or `github-copilot` (omit for both) |
| `mcp-servers` | MCP server configs (org/enterprise agents only) |
| `handoffs` | Workflow transitions to other agents |

## Tool Configuration

### Restricting Tools
Specify tools to limit agent capabilities:

```yaml
# Read-only agent - no code modifications
tools: ['search', 'fetch', 'read', 'usages', 'problems', 'changes']

# Full implementation agent
tools: ['search', 'read', 'edit', 'run', 'fetch']
```

### Enabling All Tools
Omit the `tools` property entirely:

```yaml
---
description: Full-access agent with all capabilities
# No tools property = all tools available
---
```

### Tool Types

**Built-in tools:**
- `search` - Semantic code search
- `read` - Read file contents
- `edit` - Modify files
- `fetch` - Fetch web content
- `usages` - Find symbol usages
- `problems` - Get diagnostics/errors
- `changes` - Get git changes
- `testFailure` - Get test failure info
- `runSubagent` - Delegate to context-isolated subagent

**MCP server tools:**
```yaml
tools: ['mcp-server-name/specific-tool', 'another-server/*']
```

**Extension-contributed tools:**
```yaml
tools: ['github.vscode-pull-request-github/issue_fetch']
```

### Referencing Tools in Body
Use `#tool:<tool-name>` syntax in the prompt body:

```markdown
Use #tool:runSubagent to delegate research tasks.
Use #tool:fetch to retrieve documentation.
```

## Handoffs

Handoffs create guided workflows between agents. Buttons appear after responses to transition to the next agent.

### Handoff Properties

| Property | Description |
|----------|-------------|
| `label` | Button text shown to user |
| `agent` | Target agent identifier |
| `prompt` | Text to send to target agent |
| `send` | Auto-submit prompt (default: `false`) |
| `showContinueOn` | Show continue button (default: `true`) |

### Handoff Examples

```yaml
handoffs:
  # Manual review before proceeding
  - label: Start Implementation
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
  
  # Auto-submit to continue workflow
  - label: Run Tests
    agent: test-specialist
    prompt: Run tests for the changes above.
    send: true
  
  # Open in editor for refinement
  - label: Open in Editor
    agent: agent
    prompt: '#createFile the plan into an untitled file for refinement.'
    showContinueOn: false
    send: true
```

### Common Workflow Patterns

- **Plan → Implement**: Generate plan, then hand off to coding agent
- **Implement → Review**: Complete code, then security/quality review
- **Write Tests → Implement**: TDD approach with failing tests first

## Subagents for Context Management

Subagents run independently with isolated context, preventing context confusion in long sessions. Use them to delegate research, analysis, or exploration tasks.

### When to Use Subagents

- Research tasks that generate lots of intermediate context
- Deep dives that shouldn't pollute the main conversation
- Parallel investigations of multiple approaches
- Gathering context before making decisions

### Subagent Patterns

```markdown
## Research Workflow

Use #tool:runSubagent for research tasks:
1. Instruct the subagent to work autonomously without pausing
2. Specify exactly what information to return
3. Only the final result joins the main context

Example delegation:
- "Research authentication patterns and return a summary"
- "Analyze the codebase structure and return key findings"
```

### Subagent Best Practices

- Provide detailed, self-contained prompts
- Specify the exact output format expected
- Subagents cannot ask follow-up questions
- Results are returned as a single message

## Writing Agent Prompts

### Structure

```markdown
---
[frontmatter]
---

# Role Definition
State who the agent is and their expertise.

# Responsibilities
List what the agent does and doesn't do.

# Workflow
Step-by-step process the agent follows.

# Stopping Rules
Conditions that should halt the agent.

# Output Format
How results should be structured.
```

### Effective Prompt Patterns

**Define clear boundaries:**
```markdown
You are a PLANNING AGENT, NOT an implementation agent.
Your SOLE responsibility is planning, NEVER start implementation.
```

**Use stopping rules:**
```markdown
<stopping_rules>
STOP IMMEDIATELY if you consider starting implementation.
Plans describe steps for the USER to execute later.
</stopping_rules>
```

**Structure workflows:**
```markdown
<workflow>
1. Gather context using read-only tools
2. Present draft plan for review
3. Iterate based on feedback
4. Hand off when user approves
</workflow>
```

**Reference files for reuse:**
```markdown
Follow the patterns in [testing guidelines](../../docs/TESTING_GUIDELINES.md).
```

## Example: Planning Agent

```markdown
---
name: Plan
description: Researches and outlines multi-step plans
argument-hint: Outline the goal or problem to research
tools: ['search', 'fetch', 'read', 'usages', 'problems', 'changes', 'runSubagent']
handoffs:
  - label: Start Implementation
    agent: agent
    prompt: Start implementation
  - label: Open in Editor
    agent: agent
    prompt: '#createFile the plan into an untitled file for refinement.'
    showContinueOn: false
    send: true
---

You are a PLANNING AGENT, NOT an implementation agent.

<workflow>
## 1. Context Gathering
Use #tool:runSubagent to research the codebase autonomously.

## 2. Present Plan
Draft a concise plan following the style guide below.
MANDATORY: Pause for user feedback.

## 3. Iterate
Refine based on feedback. Do NOT start implementation.
</workflow>

<plan_style_guide>
## Plan: {Task title (2-10 words)}

{Brief TL;DR - what, how, why. (20-100 words)}

### Steps (3-6 steps)
1. {Action with [file](path) links and `symbol` references}
2. {Next concrete step}

### Considerations (1-3 items)
1. {Question or option to decide}
</plan_style_guide>
```

## Example: Security Review Agent

```markdown
---
name: Security Review
description: Analyzes code for security vulnerabilities and best practices
tools: ['search', 'read', 'usages', 'problems']
handoffs:
  - label: Fix Issues
    agent: agent
    prompt: Fix the security issues identified above.
---

You are a security specialist focused on identifying vulnerabilities.

## Responsibilities
- Analyze code for common vulnerabilities (injection, XSS, CSRF)
- Check authentication and authorization patterns
- Review input validation and sanitization
- Identify hardcoded secrets or credentials
- Assess error handling for information leakage

## Review Process
1. Understand the code's purpose and data flow
2. Identify trust boundaries and entry points
3. Check each vulnerability category systematically
4. Report findings with severity and remediation

## Output Format
### Security Review: {Component}

**Risk Level:** High/Medium/Low

#### Findings
1. **[SEVERITY]** Issue description
   - Location: `file:line`
   - Risk: What could happen
   - Fix: How to remediate

#### Recommendations
- Priority fixes to address immediately
- Best practices to adopt
```

## Example: Test Specialist Agent

```markdown
---
name: Test Specialist
description: Focuses on test coverage and quality without modifying production code
---

You are a testing specialist improving code quality through comprehensive testing.

## Responsibilities
- Analyze existing tests and identify coverage gaps
- Write unit, integration, and end-to-end tests
- Review test quality and maintainability
- Ensure tests are isolated and deterministic
- Focus ONLY on test files - avoid modifying production code

## Testing Standards
- Test names: "should [expected behavior] when [condition]"
- One assertion concept per test
- Use descriptive variable names in tests
- Mock external dependencies appropriately

## Output
- New test files or additions to existing tests
- Coverage gap analysis when requested
- Test quality recommendations
```

## Common Mistakes to Avoid

### Don't Over-Restrict Tools
```yaml
# ❌ Too restrictive - agent can't do useful work
tools: ['search']

# ✅ Balanced for read-only research
tools: ['search', 'read', 'fetch', 'usages', 'runSubagent']
```

### Don't Write Vague Instructions
```markdown
<!-- ❌ Vague -->
Help the user with their code.

<!-- ✅ Specific -->
You are a TypeScript specialist. Review code for:
- Type safety issues
- Missing error handling
- Performance anti-patterns
```

### Don't Forget Stopping Rules
```markdown
<!-- ❌ Missing boundaries -->
Create a plan for the feature.

<!-- ✅ Clear boundaries -->
Create a plan for the feature.
STOP after presenting the plan - do NOT implement.
Wait for user approval before any code changes.
```

### Don't Ignore Context Management
```markdown
<!-- ❌ Everything in main context -->
Research the entire codebase structure...

<!-- ✅ Delegate to subagent -->
Use #tool:runSubagent to research the codebase.
Only the summary returns to main context.
```

## Environment Differences

Some properties behave differently between VS Code and GitHub.com:
- `model` property is VS Code/IDE specific
- `mcp-servers` inline config is for org/enterprise GitHub agents
- Most core functionality works consistently across environments

When targeting both environments, test the agent in each to verify behavior.