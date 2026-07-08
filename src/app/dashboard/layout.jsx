import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
export default async function DashboardLayout({ children, }) {
    const user = await getCurrentUser();
    if (!user || user.role === "READER") {
        redirect("/admin-login");
    }
    return (<div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-sidebar-border md:block">
        <Sidebar user={user}/>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        <Topbar user={user}/>
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>);
}
