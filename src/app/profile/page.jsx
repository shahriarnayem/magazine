import { redirect } from "next/navigation";
import { getAllCategories, safeGetCurrentUser } from "@/lib/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ProfileForm } from "./profile-form";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
    const user = await safeGetCurrentUser();
    if (!user)
        redirect("/login");
    const allCategories = await getAllCategories();
    return (<div className="flex min-h-screen flex-col">
      <SiteHeader user={user} categories={allCategories}/>

      <main className="flex-1">
        <section className="magazine-container py-10 md:py-14 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-primary mb-2">
            Account
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Profile
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl">
            Update your display name, bio and avatar.
          </p>
        </section>

        <section className="magazine-container py-8 md:py-12 max-w-2xl">
          <ProfileForm initial={{
            name: user.name ?? "",
            bio: user.bio ?? "",
            image: user.image ?? "",
            email: user.email,
            role: user.role,
        }}/>
        </section>
      </main>

      <SiteFooter categories={allCategories}/>
    </div>);
}
