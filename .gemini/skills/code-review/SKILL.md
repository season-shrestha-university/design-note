---
name: code-review
description: Review the relevant code with a code review mindset. Prioritize bugs, behavioral regressions, security issues, and missing tests. Findings must be the primary focus, ordered by severity. Do not make code changes unless the user explicitly asks for them.
---

# Code Review

When the user invokes the `/code-review` command or asks for a code review:

Review the relevant code with a code review mindset. Prioritize bugs, behavioral regressions, security issues, and missing tests. Findings must be the primary focus, ordered by severity. Do not make code changes unless the user explicitly asks for them.

## Example

**User Input:**
> remove feature logic 
> index.astro (8-15)
>
> Removed the featured-priority check. Articles on the homepage now sort by publishedAt only (newest first).
> 
> If you also want to drop sorting entirely and use the collection’s default order, say the word and I’ll simplify it further.
> 
> /code-review 

**Expected Agent Output:**
> Reviewing recent changes and related code for bugs, regressions, and gaps.
> 
> ```diff
> -  line-height: 1.4;
> +  font-size: var(--font-size-2xl);
>    text-align: center;
>    margin-top: var(--spacing-md);
>    margin-bottom: var(--spacing-2xl);
> ```
> *(Followed by the detailed review points ordered by severity...)*
