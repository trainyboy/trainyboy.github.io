# Thomas Tan — personal site

Static personal site. Everything that deploys lives in `dist/`; there is no build step.

## Preview locally

The pages load content with `fetch`, so open them over HTTP, not as files:

```bash
python3 -m http.server 4180 --directory dist
```

Then visit http://localhost:4180.

## Write a blog post

```bash
node tools/new-post.mjs "Post title" tag1,tag2
```

This creates `dist/content/posts/<slug>.md` and a **draft** entry in `dist/content/posts.json`.

1. Write the post in Markdown.
2. Preview it at `post.html?slug=<slug>`. Drafts don't show in any list.
3. Fill in `summary` and set `"draft": false` in `posts.json` to publish.

The home page shows the three newest posts. `blog.html` lists all of them with tag filters.

## Add or update a project

Edit `dist/content/projects.json`. Each project gets a page at `project.html?id=<id>`.

| Field | What it does |
| --- | --- |
| `cover` | Thumbnail image for the project tile (4:3 works best). |
| `featured` | Set to `false` to hide the project from the home page. It still appears on `projects.html`. |
| `links.demo` / `links.code` / `links.writeup` | URLs for the buttons. Empty values show "coming soon". |
| `demo.type` | `iframe` embeds a live app, `video` plays an `.mp4`/`.webm` (with optional `poster`), `image` shows a screenshot. |
| `sections[]` | `{ "heading", "body" }`. Use `"placeholder"` instead of `body` to show a dashed "to write" box. |
| `gallery[]` | `{ "src", "alt", "caption" }` screenshots. |

## Replace placeholder images

Every placeholder is in `dist/assets/placeholders/` and is labelled with its size. Put real images in `dist/assets/`, then update the path:

- Big background photo behind your name: replace `dist/assets/hero.jpg` (or change the path in `dist/styles.css`, search for `hero.jpg`). Landscape, about 2000–2400px wide.
- Headshot in About: replace `dist/assets/headshot.jpg` (square photo).
- Project thumbnails: `cover` in `dist/content/projects.json`
- Project demos and galleries: `dist/content/projects.json`
- Post images: inside the post's Markdown

Prefer `.webp` or `.jpg` around 1600px wide.

## Files

- `dist/index.html`: home page (photo intro, about, résumé, projects, notes, contact)
- `dist/site.js`: shared behaviour plus rendering for projects and posts
- `dist/styles.css`: all styles; colour tokens are at the top

## Publish

The live site is the `gh-pages` branch of `trainyboy/trainyboy.github.io`, which holds the contents of `dist/`. After committing changes on `main`, publish with:

```bash
git subtree push --prefix dist origin gh-pages
```

GitHub then serves it at https://trainyboy.github.io within a minute or two (Settings → Pages → Source: "Deploy from a branch", branch `gh-pages`, folder `/ (root)`).
