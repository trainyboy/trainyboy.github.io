> This is a sample post. Replace it with your first real note, or delete it from `content/posts.json` once you have one.

Posts are plain Markdown files. Write in any editor, drop the file into `content/posts/`, and add one entry to `content/posts.json`. The site picks it up automatically: the home page shows the three newest, and the Notes page lists everything with tag filters.

## Publishing a note

The quickest way is the helper script from the project root:

```bash
node tools/new-post.mjs "What I learned profiling vLLM"
```

It creates `dist/content/posts/what-i-learned-profiling-vllm.md` and adds a **draft** entry to `posts.json` with today's date. Drafts stay off the lists but can be previewed at `post.html?slug=…`. When it's ready, fill in the summary and tags, set `"draft": false`, and deploy.

## What Markdown can do here

Headings (`##` and `###`) show up in the sidebar outline. You can use **bold**, *italic*, [links](https://example.com), and `inline code`.

- Bulleted lists
- work as you'd expect
  1. including nested
  2. numbered lists

Tables are handy for benchmarks:

| Setup | TTFT | Notes |
| --- | --- | --- |
| Baseline | — | replace with real numbers |
| Variant | — | replace with real numbers |

Images go in `assets/` and are referenced relative to the site root:

![Placeholder image for a blog post](assets/placeholders/post-image.svg)

---

### Ideas for first notes

A build log for a project, a paper you read and what you'd test next, or a problem you got stuck on and how you got unstuck. Short is fine — field notes, not essays.
