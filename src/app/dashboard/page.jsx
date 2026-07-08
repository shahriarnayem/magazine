import Link from "next/link";
import { ArrowUpRight, FileText, Eye, MessageSquare, Users, FolderTree, TrendingUp, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/mag";
export const dynamic = "force-dynamic";
function StatCard({ label, value, hint, icon: Icon, }) {
    return (<Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-primary"/>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>);
}
function StatusBadge({ status }) {
    if (status === "PUBLISHED") {
        return (<Badge className="bg-primary/15 text-primary border border-primary/30">
        Published
      </Badge>);
    }
    if (status === "DRAFT") {
        return (<Badge variant="secondary" className="text-muted-foreground">
        Draft
      </Badge>);
    }
    return (<Badge variant="secondary" className="text-muted-foreground">
      Archived
    </Badge>);
}
export default async function DashboardHomePage() {
    const user = await getCurrentUser();
    if (!user) {
        return (<div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Not signed in.</p>
      </div>);
    }
    if (user.role === "ADMIN") {
        const [totalArticles, publishedArticles, draftArticles, totalUsers, readers, writers, pendingComments, totalComments, categories, viewsAgg,] = await Promise.all([
            db.article.count(),
            db.article.count({ where: { status: "PUBLISHED" } }),
            db.article.count({ where: { status: "DRAFT" } }),
            db.user.count(),
            db.user.count({ where: { role: "READER" } }),
            db.user.count({ where: { role: "WRITER" } }),
            db.comment.count({ where: { status: "PENDING" } }),
            db.comment.count(),
            db.category.count(),
            db.article.aggregate({ _sum: { views: true } }),
        ]);
        const recentArticles = await db.article.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                views: true,
                authorName: true,
                createdAt: true,
            },
        });
        const topArticles = await db.article.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { views: "desc" },
            take: 5,
            select: { id: true, title: true, slug: true, views: true },
        });
        const totalViews = viewsAgg._sum.views || 0;
        return (<div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of the publication at a glance.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/dashboard/articles/new">
              <FileText className="size-4"/>
              New article
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Articles" value={totalArticles} hint={`${publishedArticles} published · ${draftArticles} draft`} icon={FileText}/>
          <StatCard label="Total Views" value={totalViews.toLocaleString()} hint="Across all published" icon={Eye}/>
          <StatCard label="Users" value={totalUsers} hint={`${writers} writers · ${readers} readers`} icon={Users}/>
          <StatCard label="Comments" value={totalComments} hint={`${pendingComments} pending review`} icon={MessageSquare}/>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Published" value={publishedArticles} icon={FileText}/>
          <StatCard label="Drafts" value={draftArticles} icon={FileText}/>
          <StatCard label="Categories" value={categories} icon={FolderTree}/>
          <StatCard label="Pending Comments" value={pendingComments} icon={MessageSquare}/>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent articles */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Articles
              </CardTitle>
              <Clock className="size-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentArticles.length === 0 ? (<p className="text-sm text-muted-foreground">No articles yet.</p>) : (recentArticles.map((a) => (<Link key={a.id} href={`/dashboard/articles/${a.id}/edit`} className="group flex items-center justify-between gap-3 rounded-md border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {a.authorName} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={a.status}/>
                  </Link>)))}
            </CardContent>
          </Card>

          {/* Top articles */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Top Articles by Views
              </CardTitle>
              <TrendingUp className="size-4 text-primary"/>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {topArticles.length === 0 ? (<p className="text-sm text-muted-foreground">No published articles.</p>) : (topArticles.map((a, i) => (<Link key={a.id} href={`/dashboard/articles/${a.id}/edit`} className="group flex items-center gap-3 rounded-md border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {a.title}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="size-3"/>
                      {a.views.toLocaleString()}
                    </span>
                  </Link>)))}
            </CardContent>
          </Card>
        </div>

        {/* Pending comments CTA */}
        {pendingComments > 0 && (<Card className="bg-card border-primary/30">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="size-5 text-primary"/>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pendingComments} comment{pendingComments === 1 ? "" : "s"} awaiting moderation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Approve or reject reader feedback.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/comments">
                  Review
                  <ArrowUpRight className="size-4"/>
                </Link>
              </Button>
            </CardContent>
          </Card>)}
      </div>);
    }
    // WRITER view
    const [myTotal, myPublished, myDrafts, myViewsAgg, myRecent] = await Promise.all([
        db.article.count({ where: { authorId: user.id } }),
        db.article.count({ where: { authorId: user.id, status: "PUBLISHED" } }),
        db.article.count({ where: { authorId: user.id, status: "DRAFT" } }),
        db.article.aggregate({
            where: { authorId: user.id },
            _sum: { views: true },
        }),
        db.article.findMany({
            where: { authorId: user.id },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                views: true,
                updatedAt: true,
            },
        }),
    ]);
    const myViews = myViewsAgg._sum.views || 0;
    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Your writing at a glance.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/articles/new">
            <FileText className="size-4"/>
            New article
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Articles" value={myTotal} icon={FileText}/>
        <StatCard label="Published" value={myPublished} icon={FileText}/>
        <StatCard label="Drafts" value={myDrafts} icon={FileText}/>
        <StatCard label="Total Views" value={myViews.toLocaleString()} icon={Eye}/>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Recent Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {myRecent.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t written anything yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/articles/new">Write your first article</Link>
              </Button>
            </div>) : (myRecent.map((a) => (<Link key={a.id} href={`/dashboard/articles/${a.id}/edit`} className="group flex items-center justify-between gap-3 rounded-md border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(a.updatedAt)} · {a.views.toLocaleString()} views
                  </p>
                </div>
                <StatusBadge status={a.status}/>
              </Link>)))}
        </CardContent>
      </Card>
    </div>);
}
