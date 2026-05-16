# BEM CSS Naming Convention Guide

To ensure our codebase remains scalable, maintainable, and easy to collaborate on, this project strictly adheres to the **BEM (Block, Element, Modifier)** methodology for naming CSS classes.

Please review and follow these guidelines when creating or refactoring components.

---

## What is BEM?

BEM is a highly popular naming convention for writing clean, modular CSS. It divides user interfaces into three distinct parts:

1. **Block (`.block`)**: A standalone entity that is meaningful on its own (e.g., `header`, `card`, `menu`, `button`).
2. **Element (`.block__element`)**: A part of a block that has no standalone meaning and is semantically tied to its block (e.g., `card__title`, `menu__item`).
3. **Modifier (`.block--modifier` or `.block__element--modifier`)**: A flag on a block or element used to change appearance, state, or behavior (e.g., `card--featured`, `button--disabled`).

---

## Naming Rules & Syntax

- Use **lowercase** letters only.
- Use a **single hyphen (`-`)** to separate words within a block, element, or modifier name (e.g., `.main-nav`).
- Use a **double underscore (`__`)** to separate a Block from an Element.
- Use a **double hyphen (`--`)** to separate a Block or Element from its Modifier.

### Syntax Template

```css
/* Block */
.block {
}

/* Element */
.block__element {
}

/* Modifier */
.block--modifier {
}
.block__element--modifier {
}
```
