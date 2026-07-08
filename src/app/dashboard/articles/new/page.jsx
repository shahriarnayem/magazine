import { db } from "@/lib/db";
import { ArticleEditor } from "@/components/dashboard/article-editor";
export const dynamic = "force-dynamic";
export default async function NewArticlePage() {
    const categories = await db.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, description: true },
    });
    return <ArticleEditor categories={categories}/>;
}
