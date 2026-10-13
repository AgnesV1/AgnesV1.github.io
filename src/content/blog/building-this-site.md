---
title: 'How I Built This Site 🧱🌐'
description: 'Astro + GitHub Pages + Markdown: publishing a post takes one git push.'
pubDate: 2026-07-09
updatedDate: 2026-10-12
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

The rest of this page is what got added since, in the same spirit: each piece is a few files, and none of them needs a server.

## Two languages

There is one switch in the header. It sets `data-lang` on the `<html>` element and remembers the choice in the browser. Interface text is written twice, side by side, and CSS shows the half that matches: `.only-zh` or `.only-en`.

A translated post is two files with the same name:

```text
foo.md       →  /blog/foo/
foo.en.md    →  /blog/foo/en/
```

The two pages link to each other on their own, and the RSS feed carries one of them. No i18n framework is involved.

## Short notes as cards

Not everything deserves a page. Short notes live in their own collection, `src/content/cards/`, and never get a URL of their own. One frontmatter field, `section`, decides where a card shows up: `notes` puts it in the home page timeline, and `fiction` pins it to a wall of sticky notes below the longer pieces.

A card starts folded to one line. Clicking it opens it in place, and opening another closes the first. Each card still has an address, `#c-<filename>`, so a single note can be linked.

## A wall of photos

Adding a photo means dropping a file into `src/assets/photos/<year>/`. The file name can carry a caption, and that is all the configuration there is.

At build time each picture is cropped to a small circle around its most interesting region, so the page reads as a field of little planets, in a few sizes, drifting slowly. Clicking one opens the full picture at its real proportions. Before a photo enters the repository, a script resizes it, strips the metadata (location included) and adds a watermark.

## Day and night

The theme is one attribute, `data-theme`, on the `<html>` element. A few lines of inline script in the `<head>` set it before any styles apply, from the saved choice or the system setting, so the page never flashes the wrong colours.

The five accent colours are CSS variables, defined once for day and once for night. The backdrop is CSS gradients and nothing else: watercolour clouds by day, a field of stars by night, with no image files. Switching between them takes about a second, the whole page fading across while a band of dawn or dusk light rises from the bottom edge.

If the system asks for reduced motion, all of it stays still.
