import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

const postsDirectory = path.join(process.cwd(), "src", "content", "posts");

// Helper function to format Date object to YYYY-MM-DD
function formatDate(date: any): string {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof date === "string") {
    // If it's already a string, just return it or attempt simple clean up
    return date.split("T")[0];
  }
  return "";
}

// Get all posts, sorted by date (newest first)
export async function getAllPosts(): Promise<Post[]> {
  try {
    // Ensure the directory exists
    await fs.mkdir(postsDirectory, { recursive: true });
    
    const fileNames = await fs.readdir(postsDirectory);
    const mdFiles = fileNames.filter((fileName) => fileName.endsWith(".md"));

    const posts = await Promise.all(
      mdFiles.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = await fs.readFile(fullPath, "utf8");
        
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title || "",
          date: formatDate(data.date),
          summary: data.summary || "",
          category: data.category || "일반",
          tags: Array.isArray(data.tags) ? data.tags : [],
          content,
        };
      })
    );

    // Sort posts by date descending
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Failed to read posts:", error);
    return [];
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      date: formatDate(data.date),
      summary: data.summary || "",
      category: data.category || "일반",
      tags: Array.isArray(data.tags) ? data.tags : [],
      content,
    };
  } catch (error) {
    console.error(`Failed to read post: ${slug}`, error);
    return null;
  }
}
