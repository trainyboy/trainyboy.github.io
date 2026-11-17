#!/usr/bin/env node
// Create a new blog post:  node tools/new-post.mjs "Post title" [tag1,tag2]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'content');
const title = process.argv[2];
if (!title) {
  console.error('Usage: node tools/new-post.mjs "Post title" [tag1,tag2]');
  process.exit(1);
}
const tags = (process.argv[3] || '').split(',').map((t) => t.trim()).filter(Boolean);
const slug = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const indexPath = path.join(root, 'posts.json');
const mdPath = path.join(root, 'posts', `${slug}.md`);
const posts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
if (posts.some((p) => p.slug === slug) || fs.existsSync(mdPath)) {
  console.error(`A post with slug "${slug}" already exists.`);
  process.exit(1);
}

posts.unshift({ slug, title, date, summary: '', tags, draft: true });
fs.writeFileSync(indexPath, JSON.stringify(posts, null, 2) + '\n');
fs.writeFileSync(mdPath, `Start writing here. Markdown works: ## headings, **bold**, \`code\`, lists, tables, images.\n`);

console.log(`Created dist/content/posts/${slug}.md (draft)`);
console.log('Next: write it, fill in "summary" in posts.json, then set "draft": false to publish.');
