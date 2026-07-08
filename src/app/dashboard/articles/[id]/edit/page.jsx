import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseTags } from "@/lib/mag";
import { ArticleEditor, } from "@/components/dashboard/article-editor";
export const dynamic = "force-dynamic";
export default async function EditArticlePage({ params, }) {
    const { id } = await params;
    const article = await db.article.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!article)
        notFound();
    const categories = await db.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, description: true },
    });
    const editorArticle = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentJson: article.contentJson,
        contentHtml: article.contentHtml,
        thumbnail: article.thumbnail,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        ogImage: article.ogImage,
        status: article.status,
        featured: article.featured,
        tags: parseTags(article.tags),
        categoryId: article.categoryId,
        category: article.category
            ? {
                id: article.category.id,
                name: article.category.name,
                slug: article.category.slug,
            }
            : null,
        authorId: article.authorId,
        authorName: article.authorName,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
    };
    return (<ArticleEditor article={editorArticle} categories={categories}/>);
}
