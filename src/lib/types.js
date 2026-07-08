import { z } from "zod";
export const ROLES = ["ADMIN", "WRITER", "READER"];
export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
export const COMMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
/* ------------------------------- schemas ---------------------------------- */
export const articleInputSchema = z.object({
    title: z.string().min(1).max(200),
    excerpt: z.string().max(400).optional().nullable(),
    contentJson: z.string().optional().nullable(),
    contentHtml: z.string().optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    status: z.enum(ARTICLE_STATUSES).default("DRAFT"),
    featured: z.boolean().default(false),
    seoTitle: z.string().max(200).optional().nullable(),
    seoDescription: z.string().max(300).optional().nullable(),
    ogImage: z.string().optional().nullable(),
});
export const categoryInputSchema = z.object({
    name: z.string().min(1).max(80),
    description: z.string().max(300).optional().nullable(),
});
export const userInputSchema = z.object({
    name: z.string().min(1).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["ADMIN", "WRITER"]).default("WRITER"),
    bio: z.string().max(500).optional().nullable(),
});
export const commentInputSchema = z.object({
    articleId: z.string().min(1),
    content: z.string().min(1).max(2000),
});
export const profileInputSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional().nullable(),
    image: z.string().optional().nullable(),
});
