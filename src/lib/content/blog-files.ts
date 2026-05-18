import { readFile, readdir } from "fs/promises";
import path from "path";

import matter from "gray-matter";

import { BLOG_CONTENT_DIR } from "@/lib/content/paths";
import type { BlogPost, BlogPostMeta } from "@/types/hub";

function parseBlogFile(raw: string, filename: string): BlogPost {
  const { data, content } = matter(raw);
  const slug = (data.slug as string) || path.basename(filename, ".md");

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    publishedAt: data.publishedAt as string,
    updatedAt: data.updatedAt as string | undefined,
    category: data.category as string | undefined,
    tags: (data.tags as string[]) ?? [],
    coverImage: data.coverImage as string | undefined,
    relatedHardwareSlugs: (data.relatedHardwareSlugs as string[]) ?? [],
    content: content.trim(),
  };
}

export async function getAllBlogPostsFromFiles(): Promise<BlogPostMeta[]> {
  let files: string[];
  try {
    files = await readdir(BLOG_CONTENT_DIR);
  } catch {
    return [];
  }

  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const raw = await readFile(path.join(BLOG_CONTENT_DIR, file), "utf-8");
      const post = parseBlogFile(raw, file);
      const { content: _content, ...meta } = post;
      return meta;
    }),
  );

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getBlogPostBySlugFromFiles(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.md`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return parseBlogFile(raw, `${slug}.md`);
  } catch {
    const files = await readdir(BLOG_CONTENT_DIR).catch(() => [] as string[]);
    for (const file of files.filter((f) => f.endsWith(".md"))) {
      const raw = await readFile(path.join(BLOG_CONTENT_DIR, file), "utf-8");
      const post = parseBlogFile(raw, file);
      if (post.slug === slug) return post;
    }
    return null;
  }
}
