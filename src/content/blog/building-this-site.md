---
title: 'How I Built This Site'
description: 'Astro + GitHub Pages + Markdown: publishing a post takes one git push.'
pubDate: 2026-07-09
lang: en
tags: ['dev']
---

This site is intentionally boring in the best way: no database, no CMS, no server to babysit. Just Markdown files in a Git repository.

## The stack

- **[Astro](https://astro.build)** — a static site generator. It ships zero JavaScript by default, so pages load fast.
- **GitHub Pages** — free hosting, straight from the repository.
- **GitHub Actions** — rebuilds and redeploys the site on every push.

## The writing workflow

The whole publishing pipeline is three commands:

```bash
npm run new -- "My new post"   # creates a Markdown file with frontmatter
# ... write in your editor ...
npm run up                     # commit + push, site updates in ~1 minute
```

Each post is a `.md` file with a small frontmatter block:

```yaml
---
title: 'My new post'
description: 'One-line summary for previews and RSS.'
pubDate: 2026-07-09
lang: en # or zh — the home page can filter by language
tags: ['dev']
---
```

That's it. No admin panel, no login. If you can edit a text file, you can publish.
