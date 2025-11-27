---
applyTo: "**/{copilot-instructions.md,*.instructions.md,AGENTS.md,CLAUDE.md,GEMINI.md}"
description: Guidelines for writing GitHub Copilot custom instruction files
---

# Writing GitHub Copilot Custom Instructions

Follow these guidelines when creating or modifying Copilot instruction files.

## File Types and Their Purpose

### Repository-Wide Instructions (`copilot-instructions.md`)

Use for:
- General project standards that apply to all files
- Cross-cutting concerns (error handling philosophy, architecture patterns)
- Build, test, and lint commands
- Security requirements
- Environment variable documentation

Do NOT include:
- Language-specific coding standards
- Framework-specific patterns
- Rules that only apply to certain file types

### Path-Specific Instructions (`*.instructions.md`)

Use for:
- Language-specific coding standards (TypeScript, Python, etc.)
- Framework-specific patterns (React, Next.js, etc.)
- Technology-specific concerns (testing, API routes, etc.)
- Different rules for different parts of the codebase

Always include frontmatter:
```yaml
---
applyTo: "glob/pattern/**/*.{ts,tsx}"
description: Brief description of what these instructions cover
---
```

## Writing Effective Instructions

### Structure and Formatting

- Use distinct headings to separate topics
- Use bullet points for easy scanning
- Write short, imperative directives (not narrative paragraphs)
- Keep any single file under 1,000 lines

```markdown
<!-- ❌ Avoid: Narrative style -->
When you're reviewing code, it would be good if you could try to look
for situations where developers might have accidentally left in
sensitive information like passwords or API keys.

<!-- ✅ Prefer: Imperative bullet points -->
## Security
- Check for hardcoded secrets, API keys, or credentials
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
```

### Provide Concrete Examples

Include code snippets showing correct and incorrect patterns:

```markdown
## Naming Conventions

```typescript
// ❌ Avoid
const d = new Date();
const x = users.filter(u => u.active);

// ✅ Prefer
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
```
```

### Be Specific and Actionable

```markdown
<!-- ❌ Vague -->
- Write good tests
- Use proper error handling

<!-- ✅ Specific -->
- Test names should follow: "should [expected behavior] when [condition]"
- Wrap async operations in try/catch and return appropriate error responses
```

## What NOT to Include

Instructions that Copilot cannot follow:

- Formatting changes: "Use bold text for critical issues"
- External links: "Follow standards at https://example.com" (copy content instead)
- Vague quality requests: "Be more accurate", "Don't miss any issues"
- UI modifications: "Add emoji to comments"

## Glob Pattern Examples

```yaml
# All TypeScript files
applyTo: "**/*.{ts,tsx}"

# Test files (both patterns)
applyTo: "**/{*.test.{ts,tsx,js,jsx},__tests__/**/*.{ts,tsx,js,jsx}}"

# Specific directory
applyTo: "web/src/components/**/*.{tsx,ts}"

# API routes
applyTo: "web/src/app/api/**/*.{ts,js}"

# Multiple specific paths
applyTo: "{shared,mcp-server}/src/**/*.ts"
```

## Recommended Section Order

1. **Purpose** - Brief statement of what the file covers
2. **Naming Conventions** - How to name things
3. **Code Style** - Formatting and structure rules
4. **Patterns** - Common patterns to follow (with examples)
5. **Error Handling** - How to handle errors
6. **Security** - Security considerations
7. **Testing** - Testing expectations
8. **Performance** - Performance considerations

## Iteration Process

1. Start with 10-20 specific instructions
2. Note which instructions are followed or missed
3. Refine wording for missed instructions
4. Add new instructions incrementally based on needs