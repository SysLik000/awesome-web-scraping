# Conventions

This document describes the intended structure and formatting of the list
documents in this repository. All list files should follow these rules
consistently.

## Document Skeleton

Every list document has the same shape:

1. An H1 title naming the language or domain, e.g. `# Python Web Scraping`.
2. A short introduction paragraph describing the scope of the list.
3. A table of contents (`## Contents` or a bulleted TOC) linking to every
   section heading.
4. The sections themselves, each introduced by a heading and containing
   markdown list entries.

The table of contents must stay in sync with the section headings. Headings
should be ordered so that related topics are grouped together.

## Entry Format

Every list entry is a single markdown list item:

```
* [project-name](https://example.com) - one-line description
```

Rules:

- The entry starts with `* `.
- The project name is a link, `[name](url)`.
- The description is separated from the link by ` - ` (space, hyphen, space).
- The description is brief and confined to one line.
- The description is factual, not promotional.

## Ordering

- New entries are appended to the end of the relevant list.
- Entries are never inserted into the middle of an existing list.
- Within a section, keep the existing ordering; do not re-sort entries that
  are already present.

## Headings

- `##` marks a top-level category.
- `###` marks a subcategory within a category.
- Subcategory headings follow the pattern `Category : Subcategory`, e.g.
  `### Network : General` or `### Web Scraping : Frameworks`.
- The single-colon style is the standard; the double-colon variant is not used.
- Section headings use Title Case, e.g. `## Web Scraping` rather than `## Web scraping`.

## List Style

- Lists use `*` bullets consistently; the `-` bullet variant is not used.
- Where a category has no subcategories, its entries are flat list items
  directly under the category heading.
- Where a category has subcategories, each subcategory is a `###` heading with
  its own flat list beneath it.
- Sections that are intentionally empty are marked with a placeholder rather
  than left missing.

## Anchors

- Heading anchors are generated automatically by GitHub from the heading text
  (lowercased, spaces and punctuation replaced with hyphens).
- The table of contents links use these auto-generated anchors, e.g.
  `[HTML/XML](#htmlxml)`.

## Tables

- Tables are not used. Convey information with a bulleted list instead.

## Line Length

- Lines are wrapped at 88 characters.
- Wrap at word boundaries; never split an inline code span, URL, or link
  destination across lines.